/**
 * Validation Middleware using Zod
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './error.middleware';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            details: errors,
          },
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  // Auth
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().optional(),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  // Generation
  generateVideo: z.object({
    body: z.object({
      prompt: z.string().min(1, 'Prompt is required'),
      provider: z.enum([
        'kling',
        'kling-2.6',
        'runway',
        'runway-gen2',
        'runway-gen3',
        'replicate-zeroscope',
        'replicate-animatediff'
      ]),
      options: z.object({
        duration: z.number().min(1).max(30).optional(),
        resolution: z.enum(['720p', '1080p', '4k']).optional(),
        fps: z.number().min(15).max(60).optional(),
        mode: z.enum(['standard', 'pro']).optional(), // For Kling
        aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional(), // For Kling
        negativePrompt: z.string().optional(),
        seed: z.number().optional(),
      }).optional(),
    }),
  }),

  generateImage: z.object({
    body: z.object({
      prompt: z.string().min(1, 'Prompt is required'),
      provider: z.enum(['dalle', 'replicate-sdxl', 'replicate-flux']),
      options: z.object({
        width: z.number().optional(),
        height: z.number().optional(),
        quality: z.enum(['standard', 'hd']).optional(),
        style: z.enum(['vivid', 'natural']).optional(),
      }).optional(),
    }),
  }),

  // Project
  createProject: z.object({
    body: z.object({
      name: z.string().min(1, 'Project name is required'),
      description: z.string().optional(),
    }),
  }),

  updateProject: z.object({
    body: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }),
  }),
};
