import axios, { AxiosInstance } from 'axios';
import prisma from '../../lib/prisma';
import { io } from '../../app';

/**
 * OpenAI Sora 2 Service - The Social Simulation Engine
 *
 * Released: September 30, 2025
 * Features:
 * - Physics-aware 3D world simulation
 * - Native audio synthesis (dialogue, foley, ambient)
 * - Character Cameos (persistent characters across videos)
 * - Storyboards (frame-by-frame direction)
 * - Video Styles (preset aesthetics)
 * - Stitching & Remixing
 * - Up to 25s duration, 1080p resolution
 *
 * Architecture: Patch-based Diffusion Transformer (DiT)
 * Differentiator: Social platform with viral content creation
 */
export class SoraService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000, // 10 min for video generation
  });

  /**
   * Generate video from text with Sora 2
   * Supports up to 25s duration for Pro users
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // 1-25s (25s for Pro)
      resolution?: '720p' | '1080p';
      style?: 'thankful' | 'vintage' | 'comic' | 'news' | 'musical' | 'selfie' | 'cinematic';
      characterCameos?: string[]; // Array of character IDs to include
      withAudio?: boolean; // Generate native audio
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating video with Sora 2 (physics simulation engine)...'
      });

      const response = await this.api.post('/sora/generations', {
        model: 'sora-2',
        prompt,
        duration: options?.duration || 10,
        resolution: options?.resolution || '1080p',
        style: options?.style,
        character_cameos: options?.characterCameos,
        generate_audio: options?.withAudio !== false, // Default true
        seed: options?.seed,
      });

      const taskId = response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Sora 2 generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate video from storyboard (Pro feature)
   * Frame-by-frame directorial control
   */
  static async generateFromStoryboard(
    jobId: string,
    storyboard: Array<{
      timestamp: number; // seconds
      description: string;
      keyframe?: string; // Optional image URL for this frame
    }>,
    options?: {
      duration?: number;
      resolution?: '720p' | '1080p';
      style?: string;
      withAudio?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating from storyboard (ChatGPT Pro feature)...'
      });

      const response = await this.api.post('/sora/storyboard-generations', {
        model: 'sora-2',
        storyboard,
        duration: options?.duration || 20,
        resolution: options?.resolution || '1080p',
        style: options?.style,
        generate_audio: options?.withAudio !== false,
      });

      const taskId = response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Sora 2 storyboard generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create or manage character cameos
   * Persistent characters that can be reused across videos
   */
  static async createCharacterCameo(
    userId: string,
    name: string,
    referenceVideo?: string,
    referenceImage?: string
  ): Promise<{ cameoId: string; name: string }> {
    try {
      const response = await this.api.post('/sora/character-cameos', {
        name,
        reference_video: referenceVideo,
        reference_image: referenceImage,
      });

      // Store cameo in database for user
      await prisma.$executeRaw`
        INSERT INTO character_cameos (id, user_id, name, cameo_id, reference_url)
        VALUES (gen_random_uuid(), ${userId}, ${name}, ${response.data.id}, ${referenceVideo || referenceImage})
        ON CONFLICT DO NOTHING
      `;

      return {
        cameoId: response.data.id,
        name: response.data.name,
      };
    } catch (error: any) {
      throw new Error(`Character cameo creation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * List available character cameos for user
   */
  static async listCharacterCameos(userId: string): Promise<Array<{
    cameoId: string;
    name: string;
    referenceUrl: string;
  }>> {
    try {
      const cameos = await prisma.$queryRaw<Array<{
        cameo_id: string;
        name: string;
        reference_url: string;
      }>>`
        SELECT cameo_id, name, reference_url
        FROM character_cameos
        WHERE user_id = ${userId}
      `;

      return cameos.map(c => ({
        cameoId: c.cameo_id,
        name: c.name,
        referenceUrl: c.reference_url,
      }));
    } catch (error: any) {
      throw new Error(`Failed to list character cameos: ${error.message}`);
    }
  }

  /**
   * Remix existing video with new prompt
   * Changes semantic content while maintaining structure
   */
  static async remixVideo(
    jobId: string,
    videoUrl: string,
    newPrompt: string,
    options?: {
      strength?: number; // 0-1, how much to change
      style?: string;
      withAudio?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Remixing video with Sora 2...'
      });

      const response = await this.api.post('/sora/remixes', {
        model: 'sora-2',
        video_url: videoUrl,
        prompt: newPrompt,
        strength: options?.strength || 0.7,
        style: options?.style,
        generate_audio: options?.withAudio !== false,
      });

      const taskId = response.data.id;
      const remixedUrl = await this.pollTask(taskId, jobId);

      return remixedUrl;
    } catch (error: any) {
      throw new Error(`Sora 2 remix failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Stitch multiple video clips into coherent narrative
   * Timeline-based editing within Sora ecosystem
   */
  static async stitchVideos(
    jobId: string,
    clips: Array<{
      videoUrl: string;
      startTime?: number;
      endTime?: number;
      transition?: 'cut' | 'fade' | 'dissolve';
    }>,
    options?: {
      soundtrack?: string; // URL to audio file
      generateSoundtrack?: boolean; // Auto-generate matching music
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Stitching video clips...'
      });

      const response = await this.api.post('/sora/stitches', {
        model: 'sora-2',
        clips,
        soundtrack: options?.soundtrack,
        generate_soundtrack: options?.generateSoundtrack,
      });

      const taskId = response.data.id;
      const stitchedUrl = await this.pollTask(taskId, jobId);

      return stitchedUrl;
    } catch (error: any) {
      throw new Error(`Sora 2 stitching failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Image to video with physics simulation
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt?: string,
    options?: {
      duration?: number;
      style?: string;
      withAudio?: boolean;
      characterCameos?: string[];
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with physics simulation...'
      });

      const response = await this.api.post('/sora/image-to-video', {
        model: 'sora-2',
        image_url: imageUrl,
        prompt: prompt || 'Animate this image with realistic motion and physics',
        duration: options?.duration || 10,
        style: options?.style,
        generate_audio: options?.withAudio !== false,
        character_cameos: options?.characterCameos,
      });

      const taskId = response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Sora 2 image-to-video failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Video to video transformation
   */
  static async videoToVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      strength?: number; // 0-1
      style?: string;
      withAudio?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Transforming video with Sora 2...'
      });

      const response = await this.api.post('/sora/video-to-video', {
        model: 'sora-2',
        video_url: videoUrl,
        prompt,
        strength: options?.strength || 0.7,
        style: options?.style,
        generate_audio: options?.withAudio !== false,
      });

      const taskId = response.data.id;
      const transformedUrl = await this.pollTask(taskId, jobId);

      return transformedUrl;
    } catch (error: any) {
      throw new Error(`Sora 2 video-to-video failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Poll task status until completion
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 120; // 10 minutes max
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await this.api.get(`/sora/generations/${taskId}`);
      const status = response.data.status;

      if (status === 'completed' || status === 'succeeded') {
        return response.data.output.video_url;
      } else if (status === 'failed' || status === 'error') {
        throw new Error(`Sora task failed: ${response.data.error || 'Unknown error'}`);
      }

      // Update progress
      const progress = response.data.progress || (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progress, 95) });
    }

    throw new Error('Sora generation timed out after 10 minutes');
  }

  /**
   * Get available video styles
   */
  static getAvailableStyles(): string[] {
    return [
      'thankful',
      'vintage',
      'comic',
      'news',
      'musical',
      'selfie',
      'cinematic',
      'documentary',
      'animation',
      'noir',
      'vaporwave',
      'cyberpunk',
    ];
  }
}
