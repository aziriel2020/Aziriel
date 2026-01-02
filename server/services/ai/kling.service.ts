/**
 * Kling AI Service - Video Generation Integration
 * Kling 2.6 by Kuaishou - Advanced AI video generation
 *
 * Features:
 * - Text-to-video (up to 2 minutes)
 * - Image-to-video with motion control
 * - Video-to-video transformation
 * - 1080p high-quality output
 * - Superior motion consistency
 * - Camera movement control
 */

import axios from 'axios';
import { prisma } from '../../config/database';
import logger from '../logger.service';

const KLING_API_BASE = 'https://api.klingai.com/v1';

export class KlingService {
  private static api = axios.create({
    baseURL: KLING_API_BASE,
    headers: {
      'Authorization': `Bearer ${process.env.KLING_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Generate video from text with Kling AI 2.6
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: 5 | 10; // Kling supports 5s or 10s
      mode?: 'standard' | 'pro'; // Pro mode for better quality
      aspectRatio?: '16:9' | '9:16' | '1:1';
      negativePrompt?: string;
      seed?: number;
      cfg?: number; // CFG scale 0-20
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const response = await this.api.post('/videos/text-to-video', {
        model: 'kling-v2.6',
        prompt,
        duration: options?.duration || 5,
        mode: options?.mode || 'standard',
        aspect_ratio: options?.aspectRatio || '16:9',
        negative_prompt: options?.negativePrompt,
        seed: options?.seed,
        cfg_scale: options?.cfg || 7,
      });

      const taskId = response.data.task_id;

      // Poll for completion
      const videoUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
          completedAt: new Date(),
        },
      });

      return videoUrl;
    } catch (error: any) {
      logger.error('Kling video generation failed', { error: error.message });
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });
      throw error;
    }
  }

  /**
   * Image to video with Kling AI
   * Supports advanced motion control
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: 5 | 10;
      mode?: 'standard' | 'pro';
      cameraMotion?: {
        type?: 'pan' | 'zoom' | 'tilt' | 'dolly' | 'static';
        speed?: 'slow' | 'medium' | 'fast';
        direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
      };
      motionStrength?: number; // 0-10
      seed?: number;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const payload: any = {
        model: 'kling-v2.6',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 5,
        mode: options?.mode || 'standard',
        motion_strength: options?.motionStrength || 5,
        seed: options?.seed,
      };

      // Add camera motion if specified
      if (options?.cameraMotion) {
        payload.camera_motion = {
          type: options.cameraMotion.type || 'static',
          speed: options.cameraMotion.speed || 'medium',
          direction: options.cameraMotion.direction,
        };
      }

      const response = await this.api.post('/videos/image-to-video', payload);

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
          completedAt: new Date(),
        },
      });

      return videoUrl;
    } catch (error: any) {
      logger.error('Kling image-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Video to video - Transform existing video
   */
  static async videoToVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      mode?: 'standard' | 'pro';
      strength?: number; // 0-1, how much to transform
      negativePrompt?: string;
      seed?: number;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/videos/video-to-video', {
        model: 'kling-v2.6',
        video_url: videoUrl,
        prompt,
        mode: options?.mode || 'standard',
        strength: options?.strength || 0.7,
        negative_prompt: options?.negativePrompt,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const transformedUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: transformedUrl,
          completedAt: new Date(),
        },
      });

      return transformedUrl;
    } catch (error: any) {
      logger.error('Kling video-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Extend video duration
   * Kling can extend videos seamlessly
   */
  static async extendVideo(
    jobId: string,
    videoUrl: string,
    additionalDuration: 5 | 10
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/videos/extend', {
        model: 'kling-v2.6',
        video_url: videoUrl,
        extend_duration: additionalDuration,
      });

      const taskId = response.data.task_id;
      const extendedUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: extendedUrl,
          completedAt: new Date(),
        },
      });

      return extendedUrl;
    } catch (error: any) {
      logger.error('Kling video extend failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Character consistency mode
   * Generate videos with consistent characters across multiple generations
   */
  static async generateWithCharacter(
    jobId: string,
    characterImageUrl: string,
    prompt: string,
    options?: {
      duration?: 5 | 10;
      mode?: 'standard' | 'pro';
      characterStrength?: number; // 0-1, how much to preserve character
      seed?: number;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/videos/character-video', {
        model: 'kling-v2.6',
        character_image: characterImageUrl,
        prompt,
        duration: options?.duration || 5,
        mode: options?.mode || 'standard',
        character_strength: options?.characterStrength || 0.8,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
          completedAt: new Date(),
        },
      });

      return videoUrl;
    } catch (error: any) {
      logger.error('Kling character video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Poll task status
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 120; // Kling can take longer for high-quality videos
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await this.api.get(`/tasks/${taskId}`);
        const { status, progress, result } = response.data;

        // Update job progress
        if (progress !== undefined) {
          await prisma.job.update({
            where: { id: jobId },
            data: { progress: Math.min(progress, 95) },
          });
        }

        if (status === 'succeeded') {
          return result.video_url;
        }

        if (status === 'failed') {
          throw new Error(result?.error || 'Kling generation failed');
        }

        // Still processing
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;
      } catch (error: any) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        // Continue polling on transient errors
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;
      }
    }

    throw new Error('Kling generation timeout after 6 minutes');
  }

  /**
   * Get remaining credits/quota
   */
  static async getQuota(): Promise<{
    credits: number;
    standardQuota: number;
    proQuota: number;
  }> {
    try {
      const response = await this.api.get('/account/quota');
      return {
        credits: response.data.credits || 0,
        standardQuota: response.data.standard_quota || 0,
        proQuota: response.data.pro_quota || 0,
      };
    } catch (error: any) {
      logger.error('Failed to get Kling quota', { error: error.message });
      throw error;
    }
  }

  /**
   * Kling O1 - Reasoning Model for Video (Revolutionary!)
   * Uses chain-of-thought process to plan video sequence
   * Superior Start + End Frame transitions without "teleportation" errors
   */
  static async generateWithO1(
    jobId: string,
    startFrame: string, // Image URL for start state
    endFrame: string, // Image URL for end state
    prompt: string,
    options?: {
      duration?: 5 | 10;
      mode?: 'standard' | 'pro';
      reasoningDepth?: 'fast' | 'medium' | 'deep'; // How much planning
      showReasoning?: boolean; // Return intermediate reasoning steps
    }
  ): Promise<{
    videoUrl: string;
    reasoning?: Array<{ step: number; thought: string; action: string }>;
  }> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/videos/o1-generate', {
        model: 'kling-o1',
        start_frame: startFrame,
        end_frame: endFrame,
        prompt,
        duration: options?.duration || 10,
        mode: options?.mode || 'pro', // O1 works best in Pro
        reasoning_depth: options?.reasoningDepth || 'medium',
        return_reasoning: options?.showReasoning || false,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      // Get reasoning if requested
      let reasoning;
      if (options?.showReasoning) {
        const reasoningResponse = await this.api.get(`/tasks/${taskId}/reasoning`);
        reasoning = reasoningResponse.data.reasoning_steps;
      }

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
          completedAt: new Date(),
        },
      });

      return {
        videoUrl,
        reasoning,
      };
    } catch (error: any) {
      logger.error('Kling O1 generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Motion transfer - Transfer motion from reference video to target image
   * Kling 2.6 feature released months before Western competitors
   */
  static async motionTransfer(
    jobId: string,
    targetImage: string, // Image to animate
    referenceVideo: string, // Video whose motion to copy
    options?: {
      motionStrength?: number; // 0-1, how much motion to transfer
      preserveCharacter?: boolean; // Keep target image character
      duration?: 5 | 10;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/videos/motion-transfer', {
        model: 'kling-v2.6',
        target_image: targetImage,
        reference_video: referenceVideo,
        motion_strength: options?.motionStrength || 0.8,
        preserve_character: options?.preserveCharacter !== false,
        duration: options?.duration || 5,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
          completedAt: new Date(),
        },
      });

      return videoUrl;
    } catch (error: any) {
      logger.error('Kling motion transfer failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel a running task
   */
  static async cancelTask(taskId: string): Promise<void> {
    try {
      await this.api.post(`/tasks/${taskId}/cancel`);
      logger.info(`Kling task ${taskId} cancelled`);
    } catch (error: any) {
      logger.error('Failed to cancel Kling task', { error: error.message });
      throw error;
    }
  }
}
