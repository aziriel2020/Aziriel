import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * MiniMax Hailuo 2.3 Service - The Speed Demon
 *
 * Released: November/December 2025
 * Features:
 * - 1080p generation, 6-second durations
 * - 2-3x faster than Sora 2
 * - $0.045 per second pricing (aggressive)
 * - Media Agent (intelligently routes to best tool)
 * - Excels in anime and stylized content
 * - Massive Asian entertainment market focus
 *
 * Architecture: Optimized DiT for high throughput
 * Differentiator: Speed, cost-efficiency, stylized content, Media Agent
 */
export class HailuoService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://api.minimaxi.com/v1',
    headers: {
      'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 300000, // 5min (faster than competitors)
  });

  /**
   * Generate video from text with Hailuo 2.3
   * Optimized for speed and stylized content
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // Up to 6s
      resolution?: '720p' | '1080p';
      style?: 'anime' | 'realistic' | 'fantasy' | 'cyberpunk' | 'watercolor' | 'oil-painting';
      fps?: 24 | 30;
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with Hailuo 2.3 (speed optimized)...'
      });

      const response = await this.api.post('/hailuo/video/generate', {
        model: 'hailuo-2.3',
        prompt,
        duration: options?.duration || 6,
        resolution: options?.resolution || '1080p',
        style: options?.style,
        fps: options?.fps || 30,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Hailuo generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Media Agent - Intelligently routes request to best multimodal tool
   * Automatically decides between image-to-video, text-to-video, etc.
   */
  static async mediaAgent(
    jobId: string,
    input: {
      prompt?: string;
      imageUrl?: string;
      videoUrl?: string;
      audioUrl?: string;
    },
    options?: {
      intent?: string; // Optional: hint about desired output
      style?: string;
      duration?: number;
    }
  ): Promise<{
    videoUrl: string;
    toolUsed: string;
    reasoning: string;
  }> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Media Agent analyzing request and selecting optimal tool...'
      });

      const response = await this.api.post('/hailuo/media-agent', {
        model: 'hailuo-2.3-agent',
        input,
        intent: options?.intent,
        style: options?.style,
        duration: options?.duration,
      });

      const taskId = response.data.task_id;
      const toolUsed = response.data.selected_tool;
      const reasoning = response.data.reasoning;

      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: `Media Agent selected: ${toolUsed} - ${reasoning}`
      });

      const videoUrl = await this.pollTask(taskId, jobId);

      return {
        videoUrl,
        toolUsed,
        reasoning,
      };
    } catch (error: any) {
      throw new Error(`Media Agent failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Image to video with Hailuo
   * Specialized for anime and stylized content
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      style?: 'anime' | 'realistic' | 'fantasy' | 'cyberpunk' | 'watercolor';
      motionIntensity?: number; // 0-10
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with Hailuo 2.3...'
      });

      const response = await this.api.post('/hailuo/video/image-to-video', {
        model: 'hailuo-2.3',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 6,
        style: options?.style,
        motion_intensity: options?.motionIntensity || 5,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Hailuo image-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Video to video transformation
   * Fast style transfer and effects
   */
  static async videoToVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      style?: 'anime' | 'realistic' | 'fantasy' | 'cyberpunk' | 'watercolor' | 'oil-painting';
      strength?: number; // 0-1
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Transforming video with Hailuo 2.3...'
      });

      const response = await this.api.post('/hailuo/video/video-to-video', {
        model: 'hailuo-2.3',
        video_url: videoUrl,
        prompt,
        style: options?.style,
        strength: options?.strength || 0.7,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const transformedUrl = await this.pollTask(taskId, jobId);

      return transformedUrl;
    } catch (error: any) {
      throw new Error(`Hailuo video-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get available styles optimized for Hailuo
   */
  static getAvailableStyles(): Array<{
    name: string;
    description: string;
    bestFor: string;
  }> {
    return [
      { name: 'anime', description: 'Japanese anime style', bestFor: 'Characters, action scenes' },
      { name: 'realistic', description: 'Photorealistic rendering', bestFor: 'Natural scenes, portraits' },
      { name: 'fantasy', description: 'Fantastical, magical aesthetic', bestFor: 'Mythical creatures, magic effects' },
      { name: 'cyberpunk', description: 'Neon-lit futuristic aesthetic', bestFor: 'Sci-fi, urban scenes' },
      { name: 'watercolor', description: 'Watercolor painting style', bestFor: 'Artistic, soft scenes' },
      { name: 'oil-painting', description: 'Classical oil painting', bestFor: 'Portraits, landscapes' },
    ];
  }

  /**
   * Get pricing (cost per second)
   */
  static getPricing(): { costPerSecond: number; currency: string } {
    return {
      costPerSecond: 0.045,
      currency: 'USD',
    };
  }

  /**
   * Poll task until completion
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 60; // Hailuo is fast, usually 1-2 min
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await this.api.get(`/hailuo/tasks/${taskId}`);
      const { status, progress, result, error } = response.data;

      if (status === 'completed' || status === 'succeeded') {
        return result.video_url;
      } else if (status === 'failed') {
        throw new Error(`Hailuo task failed: ${error || 'Unknown error'}`);
      }

      const progressPercent = progress || (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progressPercent, 95) });
    }

    throw new Error('Hailuo generation timed out');
  }
}
