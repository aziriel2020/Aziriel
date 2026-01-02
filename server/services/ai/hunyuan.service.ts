import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';
import WebSocket from 'ws';

/**
 * Tencent Hunyuan Service - The Open Source & Real-Time Revolution
 *
 * Released: December 17, 2025
 * Features:
 * - HunyuanVideo-1.5: 8.3B parameter SOTA open source model
 * - HY-World 1.5 (WorldPlay): Real-time interactive world simulation
 * - Selective & Sliding Tile Attention (SSTA) for efficiency
 * - Step-distilled version (4 steps inference)
 * - Built-in super-resolution to 1080p
 * - Runs on consumer hardware (RTX 4090)
 *
 * Architecture: Efficient DiT with SSTA, Context Forcing distillation
 * Differentiator: Open source SOTA quality + real-time interactive worlds
 */
export class HunyuanService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://api.hunyuan.tencent.com/v1',
    headers: {
      'Authorization': `Bearer ${process.env.HUNYUAN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  // For local/open source inference
  private static localApi: AxiosInstance = axios.create({
    baseURL: process.env.HUNYUAN_LOCAL_URL || 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 600000,
  });

  /**
   * Generate video with HunyuanVideo-1.5
   * Can run locally or via cloud API
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // ~10s max
      resolution?: '720p' | '1080p'; // Auto-upscaled to 1080p
      fps?: 24 | 30;
      inferenceSteps?: 4 | 20 | 50; // 4 for distilled, 50 for quality
      seed?: number;
      useLocal?: boolean; // Use local Hugging Face model
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: options?.useLocal
          ? 'Generating with local HunyuanVideo-1.5 (8.3B params)...'
          : 'Generating with Hunyuan cloud API...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/generate', {
        model: 'hunyuan-video-1.5',
        prompt,
        duration: options?.duration || 10,
        resolution: options?.resolution || '1080p',
        fps: options?.fps || 30,
        inference_steps: options?.inferenceSteps || 20,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Hunyuan generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Generate video with fast 4-step distilled model
   * Drastically reduced latency for real-time applications
   */
  static async generateVideoFast(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      resolution?: '720p' | '1080p';
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    return this.generateVideo(jobId, prompt, {
      ...options,
      inferenceSteps: 4, // Force 4-step distilled
    });
  }

  /**
   * Image to video with HunyuanVideo-1.5
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      inferenceSteps?: 4 | 20 | 50;
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with HunyuanVideo-1.5...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/image-to-video', {
        model: 'hunyuan-video-1.5',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 10,
        inference_steps: options?.inferenceSteps || 20,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Hunyuan image-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * HY-World 1.5 (WorldPlay) - Interactive Real-Time World Simulation
   * Revolutionary feature: generates HD video at 24fps while user controls camera
   */
  static async startWorldPlaySession(
    userId: string,
    initialPrompt: string,
    options?: {
      resolution?: '720p' | '1080p';
      fps?: 24 | 30;
    }
  ): Promise<{
    sessionId: string;
    wsUrl: string;
    streamUrl: string;
  }> {
    try {
      const response = await this.api.post('/world-play/sessions', {
        model: 'hy-world-1.5',
        initial_prompt: initialPrompt,
        resolution: options?.resolution || '720p', // Start with 720p for real-time
        fps: options?.fps || 24,
        user_id: userId,
      });

      const sessionId = response.data.session_id;
      const wsUrl = response.data.websocket_url;
      const streamUrl = response.data.stream_url;

      // Notify user
      io.to(`user:${userId}`).emit('worldplay:session_started', {
        sessionId,
        wsUrl,
        streamUrl,
        controls: {
          wasd: 'Camera movement',
          mouse: 'Look around',
          space: 'Jump/Ascend',
          shift: 'Descend',
          commands: 'Type to modify world in real-time',
        },
      });

      return { sessionId, wsUrl, streamUrl };
    } catch (error: any) {
      throw new Error(`WorldPlay session creation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Send control input to WorldPlay session
   * Supports WASD movement and real-time text commands
   */
  static async sendWorldPlayControl(
    sessionId: string,
    control: {
      type: 'movement' | 'look' | 'command';
      data: {
        // For movement
        direction?: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down';
        // For look
        yaw?: number; // degrees
        pitch?: number; // degrees
        // For commands
        text?: string; // "Make it rain", "Add a castle"
      };
    }
  ): Promise<void> {
    try {
      await this.api.post(`/world-play/sessions/${sessionId}/control`, {
        control_type: control.type,
        ...control.data,
      });
    } catch (error: any) {
      throw new Error(`WorldPlay control failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Capture snapshot from WorldPlay session
   * Saves current view as static video clip
   */
  static async captureWorldPlaySnapshot(
    sessionId: string,
    duration: number = 5
  ): Promise<string> {
    try {
      const response = await this.api.post(`/world-play/sessions/${sessionId}/capture`, {
        duration,
      });

      const videoUrl = response.data.video_url;
      return videoUrl;
    } catch (error: any) {
      throw new Error(`WorldPlay snapshot failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * End WorldPlay session
   */
  static async endWorldPlaySession(sessionId: string): Promise<void> {
    try {
      await this.api.post(`/world-play/sessions/${sessionId}/end`);
    } catch (error: any) {
      console.error('Failed to end WorldPlay session:', error.message);
    }
  }

  /**
   * Get system requirements for local inference
   */
  static getLocalRequirements(): {
    gpu: string;
    vram: string;
    ram: string;
    storage: string;
    notes: string[];
  } {
    return {
      gpu: 'NVIDIA RTX 4090 or better',
      vram: '24GB+ VRAM',
      ram: '32GB+ System RAM',
      storage: '50GB for model weights',
      notes: [
        'HunyuanVideo-1.5 is fully open source (Apache 2.0)',
        'Available on Hugging Face: Tencent/HunyuanVideo-1.5',
        '4-step distilled model can run on RTX 3090 (24GB)',
        'Supports both text-to-video and image-to-video',
        'Built-in super-resolution network included',
      ],
    };
  }

  /**
   * Download model for local inference (Hugging Face)
   */
  static async downloadModelLocal(
    variant: 'standard' | 'distilled' = 'distilled'
  ): Promise<{ status: string; path: string }> {
    try {
      const modelId = variant === 'distilled'
        ? 'Tencent/HunyuanVideo-1.5-distilled'
        : 'Tencent/HunyuanVideo-1.5';

      const response = await this.localApi.post('/models/download', {
        model_id: modelId,
        cache_dir: './models/hunyuan',
      });

      return {
        status: response.data.status,
        path: response.data.path,
      };
    } catch (error: any) {
      throw new Error(`Model download failed: ${error.message}`);
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
        throw new Error(`Hunyuan task failed: ${error || 'Unknown error'}`);
      }

      const progressPercent = progress || (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progressPercent, 95) });
    }

    throw new Error('Hunyuan generation timed out');
  }
}
