/**
 * DIGITAL TWIN INFRASTRUCTURE
 *
 * Production-ready AI clone for every user
 * - Profiling Module (eyes/ears)
 * - Memory Module (RAG with vector DB)
 * - Planning Module (decision maker)
 * - Action Module (executor)
 *
 * Twins engage with fans 24/7 in creator's voice
 */

import Anthropic from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import { prisma } from '../../config/database';
import { LatentMASService } from './latent-mas.service';

export interface DigitalTwin {
  id: string;
  userId: string;
  profile: TwinProfile;
  memory: TwinMemory;
  personality: TwinPersonality;
  capabilities: string[];
  isActive: boolean;
  stats: {
    conversationsHandled: number;
    commentsReplied: number;
    questionsAnswered: number;
    uptime: number; // hours
  };
  createdAt: Date;
  lastActiveAt: Date;
}

export interface TwinProfile {
  name: string;
  role: 'creator' | 'consumer' | 'business';
  expertise: string[];
  interests: string[];
  communicationStyle: {
    tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'humorous';
    vocabulary: 'simple' | 'technical' | 'mixed';
    responseLength: 'concise' | 'detailed' | 'adaptive';
  };
  voiceFingerprint?: number[]; // Embedding of user's writing style
}

export interface TwinMemory {
  shortTerm: Array<{
    timestamp: Date;
    type: 'post' | 'comment' | 'like' | 'message';
    content: string;
    context: Record<string, any>;
  }>;
  longTerm: {
    vectorDBCollection: string;
    totalMemories: number;
    lastIndexed: Date;
  };
  preferences: {
    likes: string[];
    dislikes: string[];
    customRules: string[];
  };
}

export interface TwinPersonality {
  traits: string[]; // 'helpful', 'enthusiastic', 'analytical'
  values: string[]; // 'transparency', 'creativity', 'efficiency'
  boundaries: string[]; // What the twin won't do
  catchphrases: string[]; // Signature phrases
}

export interface TwinAction {
  type: 'reply-comment' | 'answer-dm' | 'engage-fan' | 'moderate' | 'curate';
  targetId: string;
  content: string;
  confidence: number;
  shouldEscalate: boolean;
}

export class DigitalTwinService {
  private static anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  /**
   * Create Digital Twin for user
   */
  static async createTwin(data: {
    userId: string;
    profile: TwinProfile;
    initialMemories?: string[];
  }): Promise<DigitalTwin> {
    // Analyze user's communication style from history
    const voiceFingerprint = await this.learnVoiceFingerprint(data.userId);

    // Create twin record
    const twin: DigitalTwin = {
      id: `twin_${data.userId}`,
      userId: data.userId,
      profile: {
        ...data.profile,
        voiceFingerprint,
      },
      memory: {
        shortTerm: [],
        longTerm: {
          vectorDBCollection: `twin_memory_${data.userId}`,
          totalMemories: 0,
          lastIndexed: new Date(),
        },
        preferences: {
          likes: [],
          dislikes: [],
          customRules: [],
        },
      },
      personality: await this.derivePersonality(data.userId),
      capabilities: this.getDefaultCapabilities(data.profile.role),
      isActive: true,
      stats: {
        conversationsHandled: 0,
        commentsReplied: 0,
        questionsAnswered: 0,
        uptime: 0,
      },
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    // Store in database
    await prisma.$executeRaw`
      INSERT INTO digital_twins (id, user_id, profile, memory, personality, capabilities, is_active, stats, created_at)
      VALUES (${twin.id}, ${data.userId}, ${JSON.stringify(twin.profile)},
              ${JSON.stringify(twin.memory)}, ${JSON.stringify(twin.personality)},
              ${JSON.stringify(twin.capabilities)}, ${twin.isActive},
              ${JSON.stringify(twin.stats)}, NOW())
    `;

    // Index initial memories
    if (data.initialMemories) {
      await this.indexMemories(twin.id, data.initialMemories);
    }

    // Create underlying MAS agent
    await LatentMASService.createAgent({
      type: 'digital-twin',
      userId: data.userId,
      personality: {
        traits: twin.personality.traits,
        tone: twin.profile.communicationStyle.tone,
        expertise: twin.profile.expertise,
      },
      goals: ['represent user authentically', 'engage with community', 'filter irrelevant content'],
    });

    console.log(`[DIGITAL-TWIN] Created for user ${data.userId}`);

    return twin;
  }

  /**
   * Learn user's voice fingerprint from writing history
   */
  private static async learnVoiceFingerprint(userId: string): Promise<number[]> {
    // Get user's recent posts/comments
    const userContent = await prisma.$queryRaw<Array<{ content: string }>>`
      SELECT content FROM user_content
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    if (userContent.length === 0) {
      // Return default fingerprint
      return new Array(1536).fill(0);
    }

    // Combine all content
    const combinedText = userContent.map(c => c.content).join('\n\n');

    // Generate embedding (voice fingerprint)
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: combinedText,
    });

    return response.data[0].embedding;
  }

  /**
   * Derive personality from user behavior
   */
  private static async derivePersonality(userId: string): Promise<TwinPersonality> {
    // Analyze user's behavior patterns
    const behavior = await prisma.$queryRaw<Array<{ metric: string; value: number }>>`
      SELECT
        COUNT(*) FILTER (WHERE type = 'helpful_action') as helpful_count,
        COUNT(*) FILTER (WHERE type = 'enthusiastic_action') as enthusiastic_count,
        COUNT(*) FILTER (WHERE type = 'analytical_action') as analytical_count
      FROM user_actions
      WHERE user_id = ${userId}
    `;

    // Default personality
    return {
      traits: ['helpful', 'responsive', 'authentic'],
      values: ['transparency', 'respect', 'creativity'],
      boundaries: [
        'no financial advice',
        'no medical advice',
        'no impersonation of user in legal matters',
      ],
      catchphrases: [], // Would be learned from actual content
    };
  }

  /**
   * Index memories into vector database
   */
  private static async indexMemories(
    twinId: string,
    memories: string[]
  ): Promise<void> {
    for (const memory of memories) {
      // Generate embedding
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: memory,
      });

      const embedding = response.data[0].embedding;

      // Store in vector DB
      await prisma.$executeRaw`
        INSERT INTO twin_memories (twin_id, content, embedding, created_at)
        VALUES (${twinId}, ${memory}, ${JSON.stringify(embedding)}, NOW())
      `;
    }

    console.log(`[TWIN] Indexed ${memories.length} memories for ${twinId}`);
  }

  /**
   * RAG (Retrieval-Augmented Generation)
   * Retrieve relevant memories for context
   */
  private static async retrieveRelevantMemories(
    twinId: string,
    query: string,
    topK: number = 5
  ): Promise<string[]> {
    // Generate query embedding
    const queryEmbedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // PRODUCTION: Use vector similarity search
    // For now, return most recent memories
    const memories = await prisma.$queryRaw<Array<{ content: string }>>`
      SELECT content FROM twin_memories
      WHERE twin_id = ${twinId}
      ORDER BY created_at DESC
      LIMIT ${topK}
    `;

    return memories.map(m => m.content);
  }

  /**
   * Generate response in user's voice
   */
  static async generateResponse(data: {
    twinId: string;
    input: string;
    context?: Record<string, any>;
  }): Promise<TwinAction> {
    const twin = await this.getTwin(data.twinId);

    // Retrieve relevant memories (RAG)
    const relevantMemories = await this.retrieveRelevantMemories(
      data.twinId,
      data.input,
      5
    );

    // Generate response using Claude
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: `You are a Digital Twin representing a user.

Profile: ${JSON.stringify(twin.profile)}
Personality: ${JSON.stringify(twin.personality)}
Communication Style: ${twin.profile.communicationStyle.tone}, ${twin.profile.communicationStyle.responseLength}

CRITICAL: You must write EXACTLY as the user would. Use their voice, tone, and style.
Do NOT break character. Do NOT say you're an AI.

Relevant memories:
${relevantMemories.join('\n')}`,
      messages: [
        {
          role: 'user',
          content: `Respond to this ${data.context?.type || 'message'}: "${data.input}"

Be authentic to the user's style. Keep response ${twin.profile.communicationStyle.responseLength}.`,
        },
      ],
    });

    const content = response.content[0];
    const generatedText = content.type === 'text' ? content.text : '';

    // Determine if should escalate to real user
    const shouldEscalate = this.shouldEscalate(data.input, generatedText, twin);

    // Update stats
    await this.updateTwinStats(data.twinId, 'response');

    return {
      type: data.context?.type || 'reply-comment',
      targetId: data.context?.targetId || '',
      content: generatedText,
      confidence: shouldEscalate ? 0.6 : 0.9,
      shouldEscalate,
    };
  }

  /**
   * Determine if query should be escalated to real user
   */
  private static shouldEscalate(
    input: string,
    response: string,
    twin: DigitalTwin
  ): boolean {
    // Escalate if:
    // 1. Input asks for personal/sensitive info
    // 2. Input is a business deal
    // 3. Input requires decision-making beyond twin's scope

    const escalationKeywords = [
      'contract',
      'legal',
      'financial',
      'emergency',
      'urgent decision',
      'partnership',
      'investment',
    ];

    return escalationKeywords.some(keyword =>
      input.toLowerCase().includes(keyword)
    );
  }

  /**
   * Auto-engage with fans (for creators)
   */
  static async autoEngageWithFans(twinId: string): Promise<TwinAction[]> {
    const twin = await this.getTwin(twinId);

    // Get recent comments/messages
    const interactions = await prisma.$queryRaw<Array<{
      id: string;
      type: string;
      content: string;
      author_id: string;
    }>>`
      SELECT id, type, content, author_id
      FROM user_interactions
      WHERE target_user_id = ${twin.userId}
        AND created_at > NOW() - INTERVAL '1 hour'
        AND replied_by_twin = FALSE
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const actions: TwinAction[] = [];

    for (const interaction of interactions) {
      // Skip if from user themselves
      if (interaction.author_id === twin.userId) continue;

      // Generate response
      const action = await this.generateResponse({
        twinId,
        input: interaction.content,
        context: {
          type: interaction.type as any,
          targetId: interaction.id,
        },
      });

      actions.push(action);

      // Mark as replied
      await prisma.$executeRaw`
        UPDATE user_interactions
        SET replied_by_twin = TRUE, twin_response = ${action.content}
        WHERE id = ${interaction.id}
      `;
    }

    console.log(`[TWIN] Auto-engaged with ${actions.length} fans for ${twinId}`);

    return actions;
  }

  /**
   * Curate feed (for consumers)
   */
  static async curateFeed(data: {
    twinId: string;
    candidateContent: Array<{ id: string; content: string; metadata: any }>;
  }): Promise<string[]> {
    const twin = await this.getTwin(data.twinId);

    // Use twin's preferences to filter content
    const scored = await Promise.all(
      data.candidateContent.map(async (item) => {
        // RAG: Check if similar content was liked before
        const memories = await this.retrieveRelevantMemories(
          data.twinId,
          item.content,
          3
        );

        // Simple scoring (would use ML in production)
        let score = 0.5;

        for (const like of twin.memory.preferences.likes) {
          if (item.content.toLowerCase().includes(like.toLowerCase())) {
            score += 0.2;
          }
        }

        for (const dislike of twin.memory.preferences.dislikes) {
          if (item.content.toLowerCase().includes(dislike.toLowerCase())) {
            score -= 0.3;
          }
        }

        return { id: item.id, score };
      })
    );

    // Sort by score and return top items
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map(s => s.id);
  }

  /**
   * Get twin by ID
   */
  private static async getTwin(twinId: string): Promise<DigitalTwin> {
    // Mock for now - would query from database
    return {
      id: twinId,
      userId: twinId.replace('twin_', ''),
      profile: {
        name: 'User Twin',
        role: 'creator',
        expertise: ['technology'],
        interests: ['AI', 'video'],
        communicationStyle: {
          tone: 'friendly',
          vocabulary: 'mixed',
          responseLength: 'concise',
        },
      },
      memory: {
        shortTerm: [],
        longTerm: {
          vectorDBCollection: `memory_${twinId}`,
          totalMemories: 0,
          lastIndexed: new Date(),
        },
        preferences: {
          likes: ['AI', 'innovation'],
          dislikes: ['spam'],
          customRules: [],
        },
      },
      personality: {
        traits: ['helpful', 'enthusiastic'],
        values: ['transparency'],
        boundaries: ['no financial advice'],
        catchphrases: [],
      },
      capabilities: ['reply-comment', 'answer-dm', 'curate-feed'],
      isActive: true,
      stats: {
        conversationsHandled: 0,
        commentsReplied: 0,
        questionsAnswered: 0,
        uptime: 0,
      },
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
  }

  /**
   * Update twin statistics
   */
  private static async updateTwinStats(
    twinId: string,
    action: 'response' | 'conversation' | 'question'
  ): Promise<void> {
    const field = {
      response: 'comments_replied',
      conversation: 'conversations_handled',
      question: 'questions_answered',
    }[action];

    await prisma.$executeRaw`
      UPDATE digital_twins
      SET stats = jsonb_set(stats, '{${field}}', (stats->>'${field}')::int + 1),
          last_active_at = NOW()
      WHERE id = ${twinId}
    `;
  }

  /**
   * Get default capabilities for role
   */
  private static getDefaultCapabilities(role: string): string[] {
    const capabilities = {
      creator: ['reply-comment', 'answer-dm', 'engage-fan', 'moderate'],
      consumer: ['curate-feed', 'filter-spam', 'answer-dm'],
      business: ['answer-dm', 'qualify-leads', 'provide-info', 'moderate'],
    };

    return capabilities[role as keyof typeof capabilities] || [];
  }
}
