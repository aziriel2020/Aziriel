/**
 * FLOW STUDIO VALIDATION SCHEMAS
 * Zod schemas for Flow API request validation
 */

import { z } from 'zod';

// Text to Film validator
export const textToFilmSchema = z.object({
  userId: z.string().uuid(),
  prompt: z.string().min(10).max(5000),
  style: z.enum(['cinematic', 'documentary', 'animation', 'abstract', 'realistic']).optional(),
  duration: z.number().int().min(1).max(300).optional(), // Max 5 minutes
  quality: z.enum(['draft', 'standard', 'high', 'ultra']).optional(),
});

// Scene Builder validator
export const createSceneSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  sceneData: z.object({
    description: z.string().min(10).max(1000),
    duration: z.number().positive().optional(),
    transitions: z.array(z.string()).optional(),
    effects: z.array(z.string()).optional(),
  }),
});

// Ingredients to Video validator
export const ingredientsToVideoSchema = z.object({
  userId: z.string().uuid(),
  ingredients: z.array(z.object({
    type: z.enum(['text', 'image', 'video', 'audio', 'effect']),
    content: z.any(),
    duration: z.number().positive().optional(),
    position: z.number().optional(),
  })).min(1),
  settings: z.object({
    resolution: z.enum(['720p', '1080p', '4k']).optional(),
    aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:5']).optional(),
    fps: z.number().int().positive().optional(),
  }).optional(),
});

// Timeline create validator
export const createTimelineSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  timelineData: z.object({
    name: z.string().min(1).max(100),
    tracks: z.array(z.object({
      type: z.enum(['video', 'audio', 'text', 'effect']),
      clips: z.array(z.any()),
    })).optional(),
  }),
});

// Video Extension validator
export const extendVideoSchema = z.object({
  userId: z.string().uuid(),
  videoId: z.string().uuid(),
  direction: z.enum(['forward', 'backward', 'both']),
  duration: z.number().int().min(1).max(60), // Max 60 seconds extension
});

// Collaboration create validator
export const createCollaborationSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  collaborators: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['viewer', 'editor', 'admin']),
  })).min(1),
});

// Export video validator
export const exportVideoSchema = z.object({
  userId: z.string().uuid(),
  videoId: z.string().uuid(),
  preset: z.enum(['youtube', 'instagram-story', 'instagram-post', 'tiktok', 'twitter', 'custom']).optional(),
  options: z.object({
    resolution: z.enum(['720p', '1080p', '4k']).optional(),
    format: z.enum(['mp4', 'mov', 'webm']).optional(),
    quality: z.enum(['draft', 'standard', 'high', 'ultra']).optional(),
    codec: z.string().optional(),
  }).optional(),
});
