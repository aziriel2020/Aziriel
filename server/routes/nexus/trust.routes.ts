/**
 * WEB OF TRUST API ROUTES
 *
 * Endpoints for decentralized trust and verification
 * - Trust scores
 * - Verifiable credentials
 * - C2PA content provenance
 * - Community notes
 * - Trust attestations
 */

import express, { Request, Response } from 'express';
import { WebOfTrustService } from '../../services/nexus/web-of-trust.service';
import { validate } from '../../middleware/validation.middleware';
import { issueCredentialSchema, createAttestationSchema, createNoteSchema } from '../../validators/nexus.validators';

const router = express.Router();

/**
 * Get trust score
 * GET /api/nexus/trust/score/:userId
 */
router.get('/score/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const score = await WebOfTrustService.getTrustScore(userId);

    res.json({ success: true, score });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Calculate trust score
 * POST /api/nexus/trust/score/:userId/calculate
 */
router.post('/score/:userId/calculate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const score = await WebOfTrustService.calculateTrustScore(userId);

    res.json({ success: true, score });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Issue verifiable credential
 * POST /api/nexus/trust/credential/issue
 */
router.post('/credential/issue', validate(issueCredentialSchema), async (req: Request, res: Response) => {
  try {
    const { userId, type, credentialSubject, expirationDays } = req.body;

    const credential = await WebOfTrustService.issueCredential({
      userId,
      type,
      credentialSubject,
      expirationDays,
    });

    res.json({ success: true, credential });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify credential
 * GET /api/nexus/trust/credential/:credentialId/verify
 */
router.get('/credential/:credentialId/verify', async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.params;

    const result = await WebOfTrustService.verifyCredential(credentialId);

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add C2PA manifest to content
 * POST /api/nexus/trust/c2pa/add
 */
router.post('/c2pa/add', async (req: Request, res: Response) => {
  try {
    const { contentId, contentUrl, creatorId, metadata, ingredients } = req.body;

    const manifest = await WebOfTrustService.addC2PAManifest({
      contentId,
      contentUrl,
      creatorId,
      metadata,
      ingredients,
    });

    res.json({ success: true, manifest });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify C2PA manifest
 * GET /api/nexus/trust/c2pa/:contentId/verify
 */
router.get('/c2pa/:contentId/verify', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const result = await WebOfTrustService.verifyC2PAManifest(contentId);

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create trust attestation
 * POST /api/nexus/trust/attestation
 */
router.post('/attestation', validate(createAttestationSchema), async (req: Request, res: Response) => {
  try {
    const { fromUserId, toUserId, type, category, weight, reason, expirationDays } = req.body;

    const attestation = await WebOfTrustService.createAttestation({
      fromUserId,
      toUserId,
      type,
      category,
      weight,
      reason,
      expirationDays,
    });

    res.json({ success: true, attestation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create community note
 * POST /api/nexus/trust/note
 */
router.post('/note', validate(createNoteSchema), async (req: Request, res: Response) => {
  try {
    const { contentId, authorId, text, rating, evidence } = req.body;

    const note = await WebOfTrustService.createCommunityNote({
      contentId,
      authorId,
      text,
      rating,
      evidence,
    });

    res.json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Vote on community note
 * POST /api/nexus/trust/note/:noteId/vote
 */
router.post('/note/:noteId/vote', async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { userId, vote } = req.body;

    await WebOfTrustService.voteCommunityNote({
      noteId,
      userId,
      vote,
    });

    res.json({ success: true, message: 'Vote recorded' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
