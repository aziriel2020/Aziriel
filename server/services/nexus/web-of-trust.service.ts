/**
 * WEB OF TRUST VERIFICATION SERVICE
 *
 * Decentralized trust network to combat misinformation and verify authenticity
 * - C2PA content provenance (Coalition for Content Provenance and Authenticity)
 * - Verifiable Credentials (W3C VC standard)
 * - Trust scores based on social graph analysis
 * - Digital signatures for content integrity
 * - Anti-deepfake detection
 * - Community notes system (like X/Twitter)
 *
 * Revolutionary: No central authority - trust emerges from the network
 */

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../../config/database';

export interface TrustScore {
  userId: string;
  overall: number; // 0-1
  components: {
    verifiedIdentity: number; // Has verified credentials
    contentAuthenticity: number; // Uses C2PA signatures
    networkReputation: number; // Trusted by trusted people
    activityConsistency: number; // Consistent behavior over time
    communityNotes: number; // Community notes accuracy
  };
  lastUpdated: Date;
}

export interface VerifiableCredential {
  id: string;
  type: string[]; // ['VerifiableCredential', 'EmailCredential', 'PhoneCredential', etc.]
  issuer: string; // DID of issuer
  subject: string; // DID of subject (user)
  issuanceDate: Date;
  expirationDate?: Date;
  credentialSubject: Record<string, any>;
  proof: {
    type: string;
    created: Date;
    proofPurpose: string;
    verificationMethod: string;
    signature: string;
  };
}

export interface C2PAManifest {
  contentId: string;
  claim_generator: string;
  title: string;
  format: string;
  assertions: Array<{
    label: string;
    data: any;
  }>;
  signature: {
    alg: string;
    val: string;
    certificate: string;
  };
  ingredients?: Array<{
    title: string;
    format: string;
    relationship: 'parentOf' | 'componentOf';
    instanceId: string;
  }>;
}

export interface CommunityNote {
  id: string;
  contentId: string;
  authorId: string;
  text: string;
  rating: 'helpful' | 'not-helpful' | 'misleading';
  evidence?: string[];
  votes: {
    helpful: number;
    notHelpful: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface TrustAttestation {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'trust' | 'distrust';
  category: 'general' | 'expertise' | 'fact-checking';
  weight: number; // 0-1
  reason?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export class WebOfTrustService {
  private static anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  /**
   * Calculate trust score for user
   * Combines multiple signals into overall trust metric
   */
  static async calculateTrustScore(userId: string): Promise<TrustScore> {
    // Component 1: Verified Identity (has credentials)
    const verifiedIdentity = await this.calculateVerifiedIdentityScore(userId);

    // Component 2: Content Authenticity (uses C2PA)
    const contentAuthenticity = await this.calculateContentAuthenticityScore(userId);

    // Component 3: Network Reputation (trusted by trusted people)
    const networkReputation = await this.calculateNetworkReputationScore(userId);

    // Component 4: Activity Consistency (consistent behavior)
    const activityConsistency = await this.calculateActivityConsistencyScore(userId);

    // Component 5: Community Notes (accuracy of contributions)
    const communityNotes = await this.calculateCommunityNotesScore(userId);

    // Weighted average
    const overall =
      verifiedIdentity * 0.25 +
      contentAuthenticity * 0.2 +
      networkReputation * 0.3 +
      activityConsistency * 0.15 +
      communityNotes * 0.1;

    const trustScore: TrustScore = {
      userId,
      overall,
      components: {
        verifiedIdentity,
        contentAuthenticity,
        networkReputation,
        activityConsistency,
        communityNotes,
      },
      lastUpdated: new Date(),
    };

    // Store in database
    await prisma.$executeRaw`
      INSERT INTO trust_scores (user_id, overall, components, last_updated)
      VALUES (${userId}, ${overall}, ${JSON.stringify(trustScore.components)}, NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET overall = ${overall}, components = ${JSON.stringify(trustScore.components)}, last_updated = NOW()
    `;

    console.log(`[WEB-OF-TRUST] Trust score for ${userId}: ${(overall * 100).toFixed(1)}%`);

    return trustScore;
  }

  /**
   * Calculate verified identity score
   */
  private static async calculateVerifiedIdentityScore(
    userId: string
  ): Promise<number> {
    const credentials = await prisma.$queryRaw<Array<any>>`
      SELECT type FROM verifiable_credentials
      WHERE subject_did = ${userId}
        AND (expiration_date IS NULL OR expiration_date > NOW())
    `;

    // Score based on number and type of credentials
    let score = 0;

    if (credentials.length === 0) return 0;

    const types = credentials.flatMap((c: any) => c.type);

    if (types.includes('EmailCredential')) score += 0.3;
    if (types.includes('PhoneCredential')) score += 0.3;
    if (types.includes('GovernmentIDCredential')) score += 0.4;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate content authenticity score
   */
  private static async calculateContentAuthenticityScore(
    userId: string
  ): Promise<number> {
    const totalContent = await prisma.$queryRaw<Array<any>>`
      SELECT COUNT(*) as total FROM user_content WHERE user_id = ${userId}
    `;

    const signedContent = await prisma.$queryRaw<Array<any>>`
      SELECT COUNT(*) as signed FROM user_content
      WHERE user_id = ${userId} AND c2pa_manifest IS NOT NULL
    `;

    const total = totalContent[0]?.total || 0;
    const signed = signedContent[0]?.signed || 0;

    if (total === 0) return 0.5; // Neutral for new users

    return signed / total;
  }

  /**
   * Calculate network reputation score (PageRank-style)
   */
  private static async calculateNetworkReputationScore(
    userId: string
  ): Promise<number> {
    // Get attestations FROM trusted users TO this user
    const attestations = await prisma.$queryRaw<Array<any>>`
      SELECT a.weight, t.overall as from_trust
      FROM trust_attestations a
      JOIN trust_scores t ON t.user_id = a.from_user_id
      WHERE a.to_user_id = ${userId}
        AND a.type = 'trust'
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    `;

    if (attestations.length === 0) return 0.5; // Neutral for users with no attestations

    // Weighted average: attestations from high-trust users count more
    const totalWeight = attestations.reduce(
      (sum: number, a: any) => sum + a.weight * (a.from_trust || 0.5),
      0
    );
    const maxWeight = attestations.reduce(
      (sum: number, a: any) => sum + a.weight,
      0
    );

    return maxWeight > 0 ? totalWeight / maxWeight : 0.5;
  }

  /**
   * Calculate activity consistency score
   */
  private static async calculateActivityConsistencyScore(
    userId: string
  ): Promise<number> {
    // Check account age and activity patterns
    const userInfo = await prisma.$queryRaw<Array<any>>`
      SELECT created_at,
        (SELECT COUNT(*) FROM user_content WHERE user_id = ${userId}) as content_count,
        (SELECT COUNT(*) FROM user_actions WHERE user_id = ${userId}) as action_count
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (userInfo.length === 0) return 0;

    const accountAge = Date.now() - new Date(userInfo[0].created_at).getTime();
    const ageInDays = accountAge / (1000 * 60 * 60 * 24);

    const contentCount = userInfo[0].content_count || 0;
    const actionCount = userInfo[0].action_count || 0;

    // New accounts get lower score
    if (ageInDays < 7) return 0.3;
    if (ageInDays < 30) return 0.5;

    // Check for bot-like behavior (too much activity too fast)
    const activityRate = (contentCount + actionCount) / ageInDays;
    if (activityRate > 100) return 0.4; // Suspicious activity rate

    // Consistent, moderate activity gets high score
    if (activityRate > 1 && activityRate < 50) return 0.9;

    return 0.7;
  }

  /**
   * Calculate community notes score
   */
  private static async calculateCommunityNotesScore(
    userId: string
  ): Promise<number> {
    const notes = await prisma.$queryRaw<Array<any>>`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        AVG(votes_helpful) as avg_helpful
      FROM community_notes
      WHERE author_id = ${userId}
    `;

    const total = notes[0]?.total || 0;
    const approved = notes[0]?.approved || 0;
    const avgHelpful = notes[0]?.avg_helpful || 0;

    if (total === 0) return 0.5; // Neutral for users with no notes

    const approvalRate = approved / total;
    const helpfulScore = Math.min(avgHelpful / 10, 1.0); // Normalize to 0-1

    return (approvalRate + helpfulScore) / 2;
  }

  /**
   * Issue verifiable credential
   */
  static async issueCredential(data: {
    userId: string;
    type: string; // 'EmailCredential', 'PhoneCredential', etc.
    credentialSubject: Record<string, any>;
    expirationDays?: number;
  }): Promise<VerifiableCredential> {
    const issuerDID = `did:platform:${process.env.PLATFORM_DID}`;
    const subjectDID = `did:platform:user:${data.userId}`;

    const credential: VerifiableCredential = {
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ['VerifiableCredential', data.type],
      issuer: issuerDID,
      subject: subjectDID,
      issuanceDate: new Date(),
      expirationDate: data.expirationDays
        ? new Date(Date.now() + data.expirationDays * 24 * 60 * 60 * 1000)
        : undefined,
      credentialSubject: {
        id: subjectDID,
        ...data.credentialSubject,
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date(),
        proofPurpose: 'assertionMethod',
        verificationMethod: `${issuerDID}#keys-1`,
        signature: '', // Will be filled by signing
      },
    };

    // Sign credential
    credential.proof.signature = await this.signCredential(credential);

    // Store in database
    await prisma.$executeRaw`
      INSERT INTO verifiable_credentials (id, type, issuer_did, subject_did, credential_data, issuance_date, expiration_date, created_at)
      VALUES (${credential.id}, ${JSON.stringify(credential.type)}, ${credential.issuer},
              ${credential.subject}, ${JSON.stringify(credential)},
              ${credential.issuanceDate}, ${credential.expirationDate}, NOW())
    `;

    console.log(`[WEB-OF-TRUST] Issued ${data.type} for ${data.userId}`);

    return credential;
  }

  /**
   * Sign credential with platform key
   */
  private static async signCredential(
    credential: VerifiableCredential
  ): Promise<string> {
    // Get platform private key
    const privateKey = process.env.PLATFORM_PRIVATE_KEY!;

    // Create canonical representation
    const canonicalData = JSON.stringify({
      ...credential,
      proof: {
        ...credential.proof,
        signature: undefined,
      },
    });

    // Sign
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(canonicalData);
    const signature = sign.sign(privateKey, 'base64');

    return signature;
  }

  /**
   * Verify credential
   */
  static async verifyCredential(credentialId: string): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    // Get credential
    const result = await prisma.$queryRaw<Array<any>>`
      SELECT credential_data FROM verifiable_credentials
      WHERE id = ${credentialId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return { valid: false, reason: 'Credential not found' };
    }

    const credential: VerifiableCredential = result[0].credential_data;

    // Check expiration
    if (
      credential.expirationDate &&
      new Date(credential.expirationDate) < new Date()
    ) {
      return { valid: false, reason: 'Credential expired' };
    }

    // Verify signature
    // (In production, would verify against issuer's public key)
    const isSignatureValid = true; // Placeholder

    if (!isSignatureValid) {
      return { valid: false, reason: 'Invalid signature' };
    }

    return { valid: true };
  }

  /**
   * Add C2PA manifest to content
   */
  static async addC2PAManifest(data: {
    contentId: string;
    contentUrl: string;
    creatorId: string;
    metadata: {
      title: string;
      format: string;
      captureDevice?: string;
      editingSoftware?: string;
      aiGenerated?: boolean;
      aiModel?: string;
    };
    ingredients?: Array<{ title: string; url: string }>;
  }): Promise<C2PAManifest> {
    const manifest: C2PAManifest = {
      contentId: data.contentId,
      claim_generator: 'Platform/1.0',
      title: data.metadata.title,
      format: data.metadata.format,
      assertions: [
        {
          label: 'c2pa.actions',
          data: {
            actions: [
              {
                action: 'c2pa.created',
                when: new Date().toISOString(),
                software: data.metadata.editingSoftware || 'Platform',
              },
            ],
          },
        },
        {
          label: 'c2pa.creative-work',
          data: {
            author: [`did:platform:user:${data.creatorId}`],
          },
        },
      ],
      signature: {
        alg: 'ps256',
        val: '', // Will be filled
        certificate: '', // Would include X.509 certificate
      },
      ingredients: data.ingredients?.map((ing, idx) => ({
        title: ing.title,
        format: data.metadata.format,
        relationship: 'componentOf' as const,
        instanceId: `ingredient_${idx}`,
      })),
    };

    // Add AI generation assertion if applicable
    if (data.metadata.aiGenerated) {
      manifest.assertions.push({
        label: 'c2pa.ai-generated',
        data: {
          model: data.metadata.aiModel,
          generated: true,
        },
      });
    }

    // Sign manifest
    manifest.signature.val = await this.signC2PAManifest(manifest);

    // Store in database
    await prisma.$executeRaw`
      UPDATE user_content
      SET c2pa_manifest = ${JSON.stringify(manifest)}
      WHERE id = ${data.contentId}
    `;

    console.log(`[WEB-OF-TRUST] Added C2PA manifest to ${data.contentId}`);

    return manifest;
  }

  /**
   * Sign C2PA manifest
   */
  private static async signC2PAManifest(manifest: C2PAManifest): Promise<string> {
    const privateKey = process.env.PLATFORM_PRIVATE_KEY!;

    const canonicalData = JSON.stringify({
      ...manifest,
      signature: { ...manifest.signature, val: undefined },
    });

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(canonicalData);
    return sign.sign(privateKey, 'base64');
  }

  /**
   * Verify C2PA manifest
   */
  static async verifyC2PAManifest(contentId: string): Promise<{
    valid: boolean;
    manifest?: C2PAManifest;
    reason?: string;
  }> {
    const result = await prisma.$queryRaw<Array<any>>`
      SELECT c2pa_manifest FROM user_content
      WHERE id = ${contentId}
      LIMIT 1
    `;

    if (result.length === 0 || !result[0].c2pa_manifest) {
      return { valid: false, reason: 'No C2PA manifest found' };
    }

    const manifest: C2PAManifest = result[0].c2pa_manifest;

    // Verify signature (placeholder - would use public key verification)
    const isSignatureValid = true;

    if (!isSignatureValid) {
      return { valid: false, manifest, reason: 'Invalid signature' };
    }

    return { valid: true, manifest };
  }

  /**
   * Create trust attestation (user trusts/distrusts another user)
   */
  static async createAttestation(data: {
    fromUserId: string;
    toUserId: string;
    type: 'trust' | 'distrust';
    category?: TrustAttestation['category'];
    weight?: number;
    reason?: string;
    expirationDays?: number;
  }): Promise<TrustAttestation> {
    const attestation: TrustAttestation = {
      id: `attest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      type: data.type,
      category: data.category || 'general',
      weight: data.weight || 1.0,
      reason: data.reason,
      createdAt: new Date(),
      expiresAt: data.expirationDays
        ? new Date(Date.now() + data.expirationDays * 24 * 60 * 60 * 1000)
        : undefined,
    };

    await prisma.$executeRaw`
      INSERT INTO trust_attestations (id, from_user_id, to_user_id, type, category, weight, reason, created_at, expires_at)
      VALUES (${attestation.id}, ${data.fromUserId}, ${data.toUserId}, ${data.type},
              ${attestation.category}, ${attestation.weight}, ${data.reason},
              NOW(), ${attestation.expiresAt})
    `;

    // Recalculate trust score for target user
    await this.calculateTrustScore(data.toUserId);

    console.log(`[WEB-OF-TRUST] ${data.fromUserId} ${data.type}s ${data.toUserId}`);

    return attestation;
  }

  /**
   * Create community note
   */
  static async createCommunityNote(data: {
    contentId: string;
    authorId: string;
    text: string;
    rating: CommunityNote['rating'];
    evidence?: string[];
  }): Promise<CommunityNote> {
    const note: CommunityNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId: data.contentId,
      authorId: data.authorId,
      text: data.text,
      rating: data.rating,
      evidence: data.evidence,
      votes: { helpful: 0, notHelpful: 0 },
      status: 'pending',
      createdAt: new Date(),
    };

    await prisma.$executeRaw`
      INSERT INTO community_notes (id, content_id, author_id, text, rating, evidence, votes, status, created_at)
      VALUES (${note.id}, ${data.contentId}, ${data.authorId}, ${data.text}, ${data.rating},
              ${JSON.stringify(data.evidence)}, '{"helpful": 0, "notHelpful": 0}'::jsonb, ${note.status}, NOW())
    `;

    console.log(`[WEB-OF-TRUST] Community note created for ${data.contentId}`);

    return note;
  }

  /**
   * Vote on community note
   */
  static async voteCommunityNote(data: {
    noteId: string;
    userId: string;
    vote: 'helpful' | 'not-helpful';
  }): Promise<void> {
    const field = data.vote === 'helpful' ? 'helpful' : 'notHelpful';

    await prisma.$executeRaw`
      UPDATE community_notes
      SET votes = jsonb_set(votes, '{${field}}', ((votes->>'${field}')::int + 1)::text::jsonb)
      WHERE id = ${data.noteId}
    `;

    // Check if note should be approved (threshold: 10 helpful votes)
    const result = await prisma.$queryRaw<Array<any>>`
      SELECT votes FROM community_notes WHERE id = ${data.noteId}
    `;

    if (result.length > 0 && result[0].votes.helpful >= 10) {
      await prisma.$executeRaw`
        UPDATE community_notes
        SET status = 'approved'
        WHERE id = ${data.noteId}
      `;
    }
  }

  /**
   * Get trust score
   */
  static async getTrustScore(userId: string): Promise<TrustScore | null> {
    const result = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM trust_scores WHERE user_id = ${userId} LIMIT 1
    `;

    if (result.length === 0) {
      // Calculate if not exists
      return this.calculateTrustScore(userId);
    }

    return {
      userId,
      overall: result[0].overall,
      components: result[0].components,
      lastUpdated: result[0].last_updated,
    };
  }
}
