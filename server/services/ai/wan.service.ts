import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * Alibaba Wan 2.2 Service - Scaling via Sparsity (MoE Architecture)
 *
 * Released: Late 2025
 * Features:
 * - Mixture-of-Experts (MoE) architecture (14B params, 2-expert design)
 * - High-noise expert (early stage: layout/composition)
 * - Low-noise expert (late stage: details/texture)
 * - Speech-to-Video (S2V) module for audio-reactive generation
 * - Runs on RTX 4090 (24GB) at 720p
 * - Open weights available
 *
 * Architecture: 14B MoE Diffusion Transformer
 * Differentiator: Efficient scaling, speech-to-video, open source
 */
export class WanService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://api.aliyun.com/ai/wan/v1',
    headers: {
      'Authorization': `Bearer ${process.env.ALIBABA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  private static localApi: AxiosInstance = axios.create({
    baseURL: process.env.WAN_LOCAL_URL || 'http://localhost:8001',
    headers: { 'Content-Type': 'application/json' },
    timeout: 600000,
  });

  /**
   * Generate video from text with Wan 2.2
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      resolution?: '480p' | '720p' | '1080p';
      fps?: 24 | 30;
      expertMode?: 'auto' | 'high-noise' | 'low-noise'; // MoE expert selection
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with Wan 2.2 MoE (14B sparse params)...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/generate', {
        model: 'wan-2.2',
        prompt,
        duration: options?.duration || 8,
        resolution: options?.resolution || '720p',
        fps: options?.fps || 30,
        expert_mode: options?.expertMode || 'auto',
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Wan 2.2 generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Image to video with Wan 2.2
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      resolution?: '480p' | '720p' | '1080p';
      expertMode?: 'auto' | 'high-noise' | 'low-noise';
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with Wan 2.2...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/image-to-video', {
        model: 'wan-2.2',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 8,
        resolution: options?.resolution || '720p',
        expert_mode: options?.expertMode || 'auto',
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Wan 2.2 image-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Speech-to-Video (S2V) - Revolutionary audio-reactive generation
   * Drives video generation from audio input (lip-sync, audio-reactive environments)
   */
  static async speechToVideo(
    jobId: string,
    audioUrl: string,
    options?: {
      characterImage?: string; // Optional: character to animate
      prompt?: string; // Optional: additional context
      resolution?: '480p' | '720p' | '1080p';
      lipSync?: boolean; // Enable lip-syncing
      audioReactive?: boolean; // Make environment react to audio
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating video from speech with Wan 2.2 S2V module...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/speech-to-video', {
        model: 'wan-2.2-s2v',
        audio_url: audioUrl,
        character_image: options?.characterImage,
        prompt: options?.prompt,
        resolution: options?.resolution || '720p',
        enable_lip_sync: options?.lipSync !== false, // Default true
        audio_reactive: options?.audioReactive !== false, // Default true
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Wan S2V failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get MoE architecture info
   */
  static getMoEInfo(): {
    totalParams: string;
    activeParams: string;
    experts: Array<{ name: string; purpose: string; activationStage: string }>;
  } {
    return {
      totalParams: '14 Billion',
      activeParams: '~7 Billion per inference (50% sparsity)',
      experts: [
        {
          name: 'High-Noise Expert',
          purpose: 'Layout, composition, object placement',
          activationStage: 'Early diffusion steps (high noise)',
        },
        {
          name: 'Low-Noise Expert',
          purpose: 'Details, textures, refinement',
          activationStage: 'Late diffusion steps (low noise)',
        },
      ],
    };
  }

  /**
   * Download model for local inference
   */
  static async downloadModelLocal(): Promise<{ status: string; path: string }> {
    try {
      const response = await this.localApi.post('/models/download', {
        model_id: 'Alibaba-PAI/Wan-2.2',
        cache_dir: './models/wan',
      });

      return {
        status: response.data.status,
        path: response.data.path,
      };
    } catch (error: any) {
      throw new Error(`Wan model download failed: ${error.message}`);
    }
  }

  /**
   * Poll task until completion
   */
  private static async pollTask(
    taskId: string,
    jobId: string,
    isLocal: boolean = false
  ): Promise<string> {
    const maxAttempts = 120;
    const pollInterval = 3000;
    const apiClient = isLocal ? this.localApi : this.api;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await apiClient.get(`/video/tasks/${taskId}`);
      const { status, progress, output, error } = response.data;

      if (status === 'completed' || status === 'succeeded') {
        return output.video_url;
      } else if (status === 'failed') {
        throw new Error(`Wan task failed: ${error || 'Unknown error'}`);
      }

      const progressPercent = progress || (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progressPercent, 95) });
    }

    throw new Error('Wan generation timed out');
  }
}
