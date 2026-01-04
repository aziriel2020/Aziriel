/**
 * VALIDATION MIDDLEWARE
 * Zod schema validation middleware for request validation
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Validates request body, query, or params against a Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Validates multiple sources in a single middleware
 */
export function validateAll(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * VALIDATION SCHEMAS
 * Zod schemas for request validation
 */
export const schemas = {
  // === VIDEO GENERATION (15+ 2026 MODELS) ===
  generateVideo: z.object({
    prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
    style: z.enum(['cinematic', 'documentary', 'animation', 'abstract', 'realistic']).optional(),
    duration: z.number().min(1).max(300).optional(),
    quality: z.enum(['draft', 'standard', 'high', 'ultra']).optional(),
    aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3', '21:9']).optional(),
    resolution: z.enum(['720p', '1080p', '4k']).optional(),
    model: z.enum([
      'auto',
      // Big Three (2026)
      'sora2', 'veo31', 'gen45',
      // Chinese Powerhouses
      'kling26', 'klingo1', 'hunyuan', 'hyworld', 'wan', 'hailuo',
      // Specialized Innovators
      'luma-ray3', 'pika22', 'mochi', 'higgsfield', 'haiper',
      // Legacy (backwards compat)
      'sora', 'veo', 'runway', 'luma', 'pika', 'kling'
    ]).optional(),
    imageUrl: z.string().url().optional(),
    negativePrompt: z.string().max(5000).optional(),
    // 2026 Advanced Features
    characterId: z.string().optional(), // Sora 2 Character Cameos
    audioUrl: z.string().url().optional(), // Wan 2.2 Speech-to-Video, Pika 2.2 Lip Sync
    endFrameUrl: z.string().url().optional(), // Kling O1, Pika 2.2 Pikaframes
  }),

  // === IMAGE GENERATION ===
  generateImage: z.object({
    prompt: z.string().min(1, 'Prompt is required').max(5000, 'Prompt too long'),
    negativePrompt: z.string().max(2000).optional(),
    width: z.number().min(64).max(2048).optional(),
    height: z.number().min(64).max(2048).optional(),
    steps: z.number().min(1).max(150).optional(),
    guidanceScale: z.number().min(1).max(30).optional(),
    model: z.string().optional(),
    style: z.string().optional(),
  }),
};

export default validate;
