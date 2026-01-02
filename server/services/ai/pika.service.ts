import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * Pika Art Service - The Creative Playground
 *
 * Latest: Pika 2.2 (Current) / Pika 3.0 (Upcoming/Rumored)
 * Features:
 * - Pikaffects (melt, crush, inflate, cake-ify, explode, deflate, ta-da)
 * - Pikaframes (start + end frame interpolation)
 * - Lip Sync (character performance, audio-driven animation)
 * - Special effects and surreal transformations
 * - Meme-centric and viral visual gags
 *
 * Architecture: Diffusion Transformer + Effects Pipeline
 * Differentiator: Surreal effects, character performance, social-first creative tools
 */
export class PikaService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://api.pika.art/v1',
    headers: {
      'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  /**
   * Generate video with Pika 2.2
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // 3-8s
      resolution?: '720p' | '1080p';
      aspectRatio?: '16:9' | '9:16' | '1:1';
      fps?: 24 | 30;
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with Pika 2.2...'
      });

      const response = await this.api.post('/videos/generate', {
        model: 'pika-2.2',
        prompt,
        duration: options?.duration || 4,
        resolution: options?.resolution || '1080p',
        aspect_ratio: options?.aspectRatio || '16:9',
        fps: options?.fps || 24,
        seed: options?.seed,
      });

      const taskId = response.data.job_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Pika generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Pikaffects - Logic-defying transformations
   * Surreal, viral visual effects
   */
  static async applyPikaffect(
    jobId: string,
    targetUrl: string, // Image or video
    effect: 'melt' | 'crush' | 'inflate' | 'cake' | 'explode' | 'deflate' | 'ta-da' | 'squish',
    options?: {
      intensity?: number; // 0-10
      duration?: number; // How long the effect takes
      direction?: 'up' | 'down' | 'left' | 'right' | 'center'; // For directional effects
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: `Applying Pikaffect: ${effect}...`
      });

      const response = await this.api.post('/effects/pikaffects', {
        model: 'pika-2.2',
        target_url: targetUrl,
        effect,
        intensity: options?.intensity || 7,
        duration: options?.duration || 3,
        direction: options?.direction || 'center',
      });

      const taskId = response.data.job_id;
      const effectUrl = await this.pollTask(taskId, jobId);

      return effectUrl;
    } catch (error: any) {
      throw new Error(`Pikaffect failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Pikaframes - Start + End frame interpolation
   * Crucial for storytellers hitting specific visual beats
   */
  static async generateWithFrames(
    jobId: string,
    startFrame: string, // Image URL
    endFrame: string, // Image URL
    prompt?: string,
    options?: {
      duration?: number;
      interpolationMode?: 'smooth' | 'dynamic' | 'cinematic';
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating video from start and end frames...'
      });

      const response = await this.api.post('/videos/pikaframes', {
        model: 'pika-2.2',
        start_frame: startFrame,
        end_frame: endFrame,
        prompt: prompt || 'Smooth transition between frames',
        duration: options?.duration || 4,
        interpolation_mode: options?.interpolationMode || 'smooth',
      });

      const taskId = response.data.job_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Pikaframes generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Lip Sync - Animate faces to match audio
   * Targets AI avatar and meme market
   */
  static async lipSync(
    jobId: string,
    imageOrVideoUrl: string,
    audioUrl: string,
    options?: {
      characterFocus?: 'auto' | 'center' | 'left' | 'right'; // Which face to animate
      intensity?: number; // 0-10, mouth movement intensity
      preserveStyle?: boolean; // Maintain original art style
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Syncing lips to audio...'
      });

      const response = await this.api.post('/effects/lip-sync', {
        model: 'pika-2.2',
        source_url: imageOrVideoUrl,
        audio_url: audioUrl,
        character_focus: options?.characterFocus || 'auto',
        intensity: options?.intensity || 7,
        preserve_style: options?.preserveStyle !== false,
      });

      const taskId = response.data.job_id;
      const syncedUrl = await this.pollTask(taskId, jobId);

      return syncedUrl;
    } catch (error: any) {
      throw new Error(`Lip sync failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Image to video with character performance
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      motion?: 'subtle' | 'moderate' | 'dynamic' | 'wild';
      characterExpression?: string; // "smile", "surprise", "sad", etc.
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with character performance...'
      });

      const response = await this.api.post('/videos/image-to-video', {
        model: 'pika-2.2',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 4,
        motion: options?.motion || 'moderate',
        character_expression: options?.characterExpression,
        seed: options?.seed,
      });

      const taskId = response.data.job_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Pika image-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Video to video with style transfer
   */
  static async videoToVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      strength?: number;
      style?: 'cartoon' | 'anime' | 'realistic' | 'sketch' | 'painterly';
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Transforming video with Pika...'
      });

      const response = await this.api.post('/videos/video-to-video', {
        model: 'pika-2.2',
        video_url: videoUrl,
        prompt,
        strength: options?.strength || 0.7,
        style: options?.style,
      });

      const taskId = response.data.job_id;
      const transformedUrl = await this.pollTask(taskId, jobId);

      return transformedUrl;
    } catch (error: any) {
      throw new Error(`Pika video-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get available Pikaffects
   */
  static getAvailablePikaffects(): Array<{
    name: string;
    description: string;
    bestFor: string;
  }> {
    return [
      { name: 'melt', description: 'Object melts like ice cream', bestFor: 'Surreal transitions' },
      { name: 'crush', description: 'Object gets crushed/compressed', bestFor: 'Impact effects' },
      { name: 'inflate', description: 'Object inflates like a balloon', bestFor: 'Comedic effects' },
      { name: 'cake', description: 'Reveals object is made of cake (viral trend)', bestFor: 'Surprise reveals' },
      { name: 'explode', description: 'Object explodes into particles', bestFor: 'Action, destruction' },
      { name: 'deflate', description: 'Object deflates and collapses', bestFor: 'Comedic timing' },
      { name: 'ta-da', description: 'Magical reveal transformation', bestFor: 'Magic tricks, reveals' },
      { name: 'squish', description: 'Object squishes and bounces', bestFor: 'Playful animations' },
    ];
  }

  /**
   * Poll task until completion
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 120;
    const pollInterval = 3000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await this.api.get(`/videos/jobs/${taskId}`);
      const { status, result, error } = response.data;

      if (status === 'completed' || status === 'success') {
        return result.video_url || result.url;
      } else if (status === 'failed' || status === 'error') {
        throw new Error(`Pika task failed: ${error || 'Unknown error'}`);
      }

      const progress = (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progress, 95) });
    }

    throw new Error('Pika generation timed out');
  }
}
