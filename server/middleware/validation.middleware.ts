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
        // Western Big Three
        'sora', 'sora-2',
        'veo', 'veo-3.1',
        'runway', 'runway-gen2', 'runway-gen3', 'runway-gen4', 'runway-gen4.5',
        // Chinese Leaders
        'hunyuan', 'hunyuan-1.5', 'hy-world', 'hy-world-1.5',
        'wan', 'wan-2.2',
        'kling', 'kling-2.6', 'kling-o1',
        'hailuo', 'hailuo-2.3',
        // Specialized
        'luma', 'luma-ray3',
        'pika', 'pika-2.2',
        'mochi', 'mochi-1',
        'starflow', 'starflow-v',
        // Legacy
        'replicate-zeroscope',
        'replicate-animatediff'
      ]),
      options: z.object({
        // Common options
        duration: z.number().min(1).max(60).optional(),
        resolution: z.enum(['480p', '720p', '1080p', '4k']).optional(),
        fps: z.number().min(15).max(60).optional(),
        seed: z.number().optional(),

        // Kling & Hailuo
        mode: z.enum(['standard', 'pro']).optional(),
        aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3', '21:9']).optional(),
        negativePrompt: z.string().optional(),
        cfg: z.number().min(0).max(20).optional(),

        // Kling O1
        startFrame: z.string().optional(),
        endFrame: z.string().optional(),
        reasoningDepth: z.enum(['fast', 'medium', 'deep']).optional(),

        // Sora
        style: z.string().optional(),
        characterCameos: z.array(z.string()).optional(),
        withAudio: z.boolean().optional(),

        // Veo
        quality: z.enum(['fast', 'high']).optional(),
        enhancePrompt: z.boolean().optional(),

        // Runway Gen-4.5
        cameraControl: z.object({
          type: z.enum(['truck', 'dolly', 'pan', 'roll', 'tilt', 'boom', 'static']).optional(),
          intensity: z.number().min(0).max(10).optional(),
          direction: z.string().optional(),
          speed: z.enum(['slow', 'medium', 'fast']).optional(),
        }).optional(),
        characterReference: z.string().optional(),
        physicsMode: z.enum(['realistic', 'cinematic']).optional(),

        // Hunyuan
        inferenceSteps: z.number().min(4).max(100).optional(),
        useLocal: z.boolean().optional(),

        // Luma
        cameraAngle: z.enum(['low', 'high', 'dutch', 'eye-level', 'birds-eye', 'worms-eye']).optional(),
        cameraMovement: z.enum(['static', 'pan', 'tilt', 'dolly', 'orbit', 'crane']).optional(),

        // STARFlow
        flowSteps: z.number().min(1).max(4).optional(),
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
