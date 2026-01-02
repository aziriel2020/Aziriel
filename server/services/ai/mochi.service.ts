import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * Genmo Mochi 1 Service - The Open Source Pioneer
 *
 * Released: September 2025
 * Features:
 * - First truly SOTA open model (Apache 2.0 license)
 * - Asymmetric Diffusion Transformer (AsymmDiT)
 * - Separated visual and textual processing streams
 * - Superior prompt adherence
 * - Permissive commercial use and modification
 * - Favorite for researchers and fine-tuners
 *
 * Architecture: Asymmetric DiT (AsymmDiT)
 * Differentiator: Open source SOTA, Apache 2.0, research-friendly
 */
export class MochiService {
  private static api: AxiosInstance = axios.create({
    baseURL: process.env.MOCHI_API_URL || 'https://api.genmo.ai/v1',
    headers: {
      'Authorization': `Bearer ${process.env.GENMO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  // Local inference support (Hugging Face)
  private static localApi: AxiosInstance = axios.create({
    baseURL: process.env.MOCHI_LOCAL_URL || 'http://localhost:8002',
    headers: { 'Content-Type': 'application/json' },
    timeout: 600000,
  });

  /**
   * Generate video with Mochi 1
   * Can run locally or via Genmo API
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // ~6s
      resolution?: '480p' | '720p' | '848x480';
      fps?: 24 | 30;
      inferenceSteps?: number; // 50-100 for quality
      guidanceScale?: number; // CFG scale, default 7.5
      seed?: number;
      useLocal?: boolean; // Use local Hugging Face model
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: options?.useLocal
          ? 'Generating with local Mochi 1 (open source)...'
          : 'Generating with Genmo Mochi 1...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/generate', {
        model: 'mochi-1',
        prompt,
        num_frames: Math.floor((options?.duration || 6) * (options?.fps || 30)),
        width: 848,
        height: 480,
        num_inference_steps: options?.inferenceSteps || 64,
        guidance_scale: options?.guidanceScale || 7.5,
        seed: options?.seed,
      });

      const taskId = response.data.task_id || response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Mochi 1 generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Image to video with Mochi 1
   * Enhanced prompt adherence via AsymmDiT architecture
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      fps?: 24 | 30;
      inferenceSteps?: number;
      guidanceScale?: number;
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with Mochi 1 (enhanced prompt adherence)...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/image-to-video', {
        model: 'mochi-1',
        image_url: imageUrl,
        prompt,
        num_frames: Math.floor((options?.duration || 6) * (options?.fps || 30)),
        num_inference_steps: options?.inferenceSteps || 64,
        guidance_scale: options?.guidanceScale || 7.5,
        seed: options?.seed,
      });

      const taskId = response.data.task_id || response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Mochi 1 image-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get AsymmDiT architecture details
   */
  static getArchitectureInfo(): {
    name: string;
    innovation: string;
    streams: string[];
    benefits: string[];
  } {
    return {
      name: 'Asymmetric Diffusion Transformer (AsymmDiT)',
      innovation: 'Separates visual and textual processing streams',
      streams: [
        'Visual Stream: Processes latent video representations',
        'Textual Stream: Dedicated capacity for understanding text prompts',
        'Fusion: Late-stage fusion improves prompt adherence',
      ],
      benefits: [
        'Superior prompt understanding and adherence',
        'Better semantic control over generation',
        'Cleaner separation of concerns',
        'More efficient training and fine-tuning',
      ],
    };
  }

  /**
   * Download model for local inference (Hugging Face)
   */
  static async downloadModelLocal(): Promise<{ status: string; path: string; license: string }> {
    try {
      const response = await this.localApi.post('/models/download', {
        model_id: 'genmo/mochi-1-preview',
        cache_dir: './models/mochi',
      });

      return {
        status: response.data.status,
        path: response.data.path,
        license: 'Apache 2.0 - Unrestricted commercial use',
      };
    } catch (error: any) {
      throw new Error(`Mochi model download failed: ${error.message}`);
    }
  }

  /**
   * Get fine-tuning recommendations
   * Mochi 1 is popular for fine-tuning due to Apache 2.0 license
   */
  static getFineTuningInfo(): {
    recommendedData: string;
    minVideos: number;
    trainingTime: string;
    gpuRequirement: string;
  } {
    return {
      recommendedData: 'High-quality videos (1080p+), consistent style/subject',
      minVideos: 100,
      trainingTime: '2-5 days on 8x A100',
      gpuRequirement: '8x NVIDIA A100 80GB or equivalent',
    };
  }

  /**
   * Get system requirements for local inference
   */
  static getLocalRequirements(): {
    gpu: string;
    vram: string;
    ram: string;
    storage: string;
  } {
    return {
      gpu: 'NVIDIA RTX 3090 or better',
      vram: '24GB+ VRAM',
      ram: '32GB+ System RAM',
      storage: '20GB for model weights',
    };
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
      const { status, output, error } = response.data;

      if (status === 'completed' || status === 'succeeded') {
        return output.video_url || output.url;
      } else if (status === 'failed') {
        throw new Error(`Mochi task failed: ${error || 'Unknown error'}`);
      }

      const progress = (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progress, 95) });
    }

    throw new Error('Mochi generation timed out');
  }
}
