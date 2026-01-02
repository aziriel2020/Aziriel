/**
 * Replicate Service - Multi-model AI Platform Integration
 */

import Replicate from 'replicate';
import { prisma } from '../../config/database';
import logger from '../logger.service';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || '',
});

export class ReplicateService {
  /**
   * Run any Replicate model
   */
  static async runModel(
    jobId: string,
    modelVersion: string,
    input: Record<string, any>
  ): Promise<any> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const output = await replicate.run(modelVersion as any, { input });

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: Array.isArray(output) ? output[0] : output,
        },
      });

      return output;
    } catch (error: any) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'FAILED', error: error.message },
      });
      throw error;
    }
  }

  /**
   * Generate video with Zeroscope
   */
  static async generateVideoZeroscope(
    jobId: string,
    prompt: string,
    options?: {
      num_frames?: number;
      num_inference_steps?: number;
    }
  ): Promise<string> {
    return this.runModel(
      jobId,
      'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
      {
        prompt,
        num_frames: options?.num_frames || 24,
        num_inference_steps: options?.num_inference_steps || 50,
      }
    );
  }

  /**
   * Generate video with AnimateDiff
   */
  static async generateVideoAnimateDiff(
    jobId: string,
    prompt: string,
    options?: {
      motion_module?: string;
      num_frames?: number;
      guidance_scale?: number;
    }
  ): Promise<string> {
    return this.runModel(
      jobId,
      'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
      {
        prompt,
        motion_module: options?.motion_module || 'mm_sd_v15_v2.ckpt',
        num_frames: options?.num_frames || 16,
        guidance_scale: options?.guidance_scale || 7.5,
      }
    );
  }

  /**
   * Generate image with SDXL
   */
  static async generateImageSDXL(
    jobId: string,
    prompt: string,
    options?: {
      negative_prompt?: string;
      width?: number;
      height?: number;
      num_inference_steps?: number;
    }
  ): Promise<string> {
    return this.runModel(
      jobId,
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        prompt,
        negative_prompt: options?.negative_prompt,
        width: options?.width || 1024,
        height: options?.height || 1024,
        num_inference_steps: options?.num_inference_steps || 50,
      }
    );
  }

  /**
   * Generate image with Flux
   */
  static async generateImageFlux(
    jobId: string,
    prompt: string,
    options?: {
      aspect_ratio?: string;
      num_outputs?: number;
      guidance?: number;
    }
  ): Promise<string> {
    return this.runModel(
      jobId,
      'black-forest-labs/flux-schnell:bf0ac67a84fb74f0a0aac48e3c4d58f4f13e8c6e81b67c17c9fe0dbc6b0d5c4f',
      {
        prompt,
        aspect_ratio: options?.aspect_ratio || '1:1',
        num_outputs: options?.num_outputs || 1,
        guidance: options?.guidance || 3.5,
      }
    );
  }

  /**
   * Upscale image with Real-ESRGAN
   */
  static async upscaleImage(jobId: string, imageUrl: string, scale = 4): Promise<string> {
    return this.runModel(
      jobId,
      'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
      {
        image: imageUrl,
        scale,
      }
    );
  }

  /**
   * Generate music with MusicGen
   */
  static async generateMusic(
    jobId: string,
    prompt: string,
    duration = 8,
    temperature = 1.0
  ): Promise<string> {
    return this.runModel(
      jobId,
      'meta/musicgen:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2b38',
      {
        prompt,
        duration,
        temperature,
      }
    );
  }

  /**
   * Remove background from image
   */
  static async removeBackground(jobId: string, imageUrl: string): Promise<string> {
    return this.runModel(
      jobId,
      'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
      {
        image: imageUrl,
      }
    );
  }

  /**
   * Generate 3D model from text
   */
  static async generate3D(jobId: string, prompt: string): Promise<string> {
    return this.runModel(
      jobId,
      'cjwbw/shap-e:2af375f5b74e20aae3c66cbce3dd9daca5bb39ce5d8ea00bc5c1d4b31a2b8806',
      {
        prompt,
      }
    );
  }

  /**
   * Animate image with AnimateDiff
   */
  static async animateImage(jobId: string, imageUrl: string, prompt: string): Promise<string> {
    return this.runModel(
      jobId,
      'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
      {
        path: imageUrl,
        prompt,
      }
    );
  }

  /**
   * List available models
   */
  static async listModels() {
    try {
      // Get featured models
      return [
        {
          id: 'stability-ai/sdxl',
          name: 'Stable Diffusion XL',
          type: 'IMAGE',
          description: 'High-quality text-to-image generation',
        },
        {
          id: 'meta/musicgen',
          name: 'MusicGen',
          type: 'AUDIO',
          description: 'Text-to-music generation',
        },
        {
          id: 'anotherjesse/zeroscope-v2-xl',
          name: 'Zeroscope',
          type: 'VIDEO',
          description: 'Text-to-video generation',
        },
        {
          id: 'cjwbw/rembg',
          name: 'Remove Background',
          type: 'IMAGE',
          description: 'Remove background from images',
        },
        {
          id: 'nightmareai/real-esrgan',
          name: 'Real-ESRGAN',
          type: 'IMAGE',
          description: 'Image upscaling',
        },
      ];
    } catch (error: any) {
      logger.error('Failed to list Replicate models', { error: error.message });
      return [];
    }
  }
}
