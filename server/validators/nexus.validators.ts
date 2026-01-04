/**
 * VALIDATION SCHEMAS
 * Zod schemas for request validation
 */

import { z } from 'zod';

// ============================================================================
// PDT VALIDATORS
// ============================================================================

export const initializePDTSchema = z.object({
  userId: z.string().uuid(),
  config: z.object({
    modelName: z.string().default('llama-4-7b'),
    personality: z.record(z.any()).optional(),
    privacySettings: z.record(z.any()).optional(),
  }).optional(),
  initialGoals: z.object({
    primary: z.array(z.string()),
    avoid: z.array(z.string()),
    prioritize: z.array(z.string()),
    timeConstraints: z.object({
      maxDailyScreenTime: z.number().optional(),
      focusHours: z.array(z.object({
        start: z.string(),
        end: z.string(),
      })).optional(),
    }).optional(),
  }),
});

export const filterContentSchema = z.object({
  pdtId: z.string(),
  contentBatch: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    contentType: z.string(),
    metadata: z.record(z.any()).optional(),
  })),
});

// ============================================================================
// COLLABORATION VALIDATORS
// ============================================================================

export const initiateCollaborationSchema = z.object({
  initiatorUserId: z.string().uuid(),
  participantUserIds: z.array(z.string().uuid()).min(1),
  goal: z.string().min(5).max(500),
  context: z.object({
    preferredDates: z.array(z.string()).optional(),
    location: z.string().optional(),
    budget: z.number().optional(),
    constraints: z.array(z.string()).optional(),
  }).optional(),
});

export const planDinnerSchema = z.object({
  userId: z.string().uuid(),
  friendUserIds: z.array(z.string().uuid()).min(1),
  preferredDates: z.array(z.string()).optional(),
  cuisine: z.string().optional(),
  budget: z.number().positive().optional(),
});

// ============================================================================
// GENUI VALIDATORS
// ============================================================================

export const generateUISchema = z.object({
  conversationId: z.string(),
  userId: z.string().uuid(),
  currentTopic: z.string().optional(),
  entities: z.array(z.object({
    type: z.enum(['person', 'place', 'product', 'event', 'concept']),
    name: z.string(),
    metadata: z.record(z.any()).optional(),
  })),
  intent: z.enum(['browse', 'search', 'create', 'collaborate', 'transact', 'learn']),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.coerce.date(),
  })),
});

// ============================================================================
// SPATIAL VALIDATORS
// ============================================================================

export const generateWorldSchema = z.object({
  userId: z.string().uuid(),
  description: z.string().min(10).max(1000),
  theme: z.string().optional(),
  maxParticipants: z.number().int().min(1).max(100).optional(),
});

export const joinWorldSchema = z.object({
  worldId: z.string(),
  userId: z.string().uuid(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
});

export const updatePositionSchema = z.object({
  worldId: z.string(),
  userId: z.string().uuid(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  rotation: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
});

// ============================================================================
// TRANSLATION VALIDATORS
// ============================================================================

export const translateVoiceSchema = z.object({
  userId: z.string().uuid(),
  sourceLanguage: z.string().length(2),
  targetLanguages: z.array(z.string().length(2)).min(1),
  preserveVoice: z.boolean().optional(),
  context: z.object({
    conversationId: z.string().optional(),
    previousMessages: z.array(z.object({
      speaker: z.string(),
      text: z.string(),
    })).optional(),
  }).optional(),
});

// ============================================================================
// TRUST VALIDATORS
// ============================================================================

export const issueCredentialSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  credentialSubject: z.record(z.any()),
  expirationDays: z.number().int().positive().optional(),
});

export const createAttestationSchema = z.object({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  type: z.enum(['trust', 'distrust']),
  category: z.enum(['general', 'expertise', 'fact-checking']).optional(),
  weight: z.number().min(0).max(1).optional(),
  reason: z.string().optional(),
  expirationDays: z.number().int().positive().optional(),
});

export const createNoteSchema = z.object({
  contentId: z.string(),
  authorId: z.string().uuid(),
  text: z.string().min(10).max(5000),
  rating: z.enum(['helpful', 'not-helpful', 'misleading']),
  evidence: z.array(z.string().url()).optional(),
});

// ============================================================================
// ACTIVITYPUB VALIDATORS
// ============================================================================

export const createPostSchema = z.object({
  username: z.string(),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
  })).optional(),
  visibility: z.enum(['public', 'unlisted', 'followers', 'direct']).optional(),
});

export const followRemoteActorSchema = z.object({
  username: z.string(),
  remoteActorId: z.string().url(),
});
