/**
 * Runway ML Service - Video Generation Integration
 */

import axios from 'axios';
import { prisma } from '../../config/database';
import logger from '../logger.service';

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';

export class RunwayService {
  private static api = axios.create({
    baseURL: RUNWAY_API_BASE,
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Generate video with Gen-2
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      resolution?: '720p' | '1080p' | '4k';
      style?: string;
      imagePrompt?: string;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const response = await this.api.post('/gen2/generate', {
        prompt,
        duration: options?.duration || 4,
        resolution: options?.resolution || '1080p',
        style: options?.style,
        image_prompt: options?.imagePrompt,
      });

      const taskId = response.data.id;

      // Poll for completion
      const videoUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
        },
      });

      return videoUrl;
    } catch (error: any) {
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
   * Image to video
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    duration = 4
  ): Promise<string> {
    try {
      const response = await this.api.post('/gen2/image-to-video', {
        image_url: imageUrl,
        prompt,
        duration,
      });

      const videoUrl = await this.pollTask(response.data.id, jobId);
      return videoUrl;
    } catch (error: any) {
      logger.error('Runway image-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Poll task status
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.api.get(`/tasks/${taskId}`);
      const { status, progress, output } = response.data;

      // Update job progress
      await prisma.job.update({
        where: { id: jobId },
        data: { progress: Math.min(progress * 100, 95) },
      });

      if (status === 'SUCCEEDED') {
        return output.url;
      }

      if (status === 'FAILED') {
        throw new Error('Runway generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;
    }

    throw new Error('Runway generation timeout');
  }
}
