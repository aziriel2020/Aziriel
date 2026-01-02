import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * Apple STARFlow-V Service - The Normalizing Flow Revolution
 *
 * Released: Research Release, December 2025
 * Features:
 * - Normalizing Flows architecture (non-diffusion!)
 * - 15x faster than comparable diffusion models
 * - Single-step or few-step generation
 * - Optimized for on-device inference (Apple Neural Engine)
 * - Invertible transformations for efficient sampling
 * - Targeted for future iOS features
 *
 * Architecture: Normalizing Flows (Invertible Transformations)
 * Differentiator: Extreme speed, on-device potential, novel architecture
 *
 * Current Limitations (Research Phase):
 * - 480p resolution (vs 1080p competitors)
 * - Some physics hallucinations (objects passing through each other)
 * - Not yet production-ready (Apple is targeting iOS integration)
 */
export class STARFlowService {
  private static api: AxiosInstance = axios.create({
    baseURL: process.env.STARFLOW_API_URL || 'https://api.apple-research.com/starflow/v1',
    headers: {
      'Authorization': `Bearer ${process.env.APPLE_RESEARCH_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 60000, // Much shorter timeout due to speed
  });

  // Local inference support (for research)
  private static localApi: AxiosInstance = axios.create({
    baseURL: process.env.STARFLOW_LOCAL_URL || 'http://localhost:8003',
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
  });

  /**
   * Generate video with STARFlow-V
   * Revolutionary speed: 15x faster than diffusion models
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // ~4s currently
      resolution?: '480p' | '720p'; // Limited to 480p in research version
      fps?: 24 | 30;
      flowSteps?: 1 | 2 | 4; // Number of flow steps (1 = fastest, 4 = best quality)
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with STARFlow-V (15x faster, Normalizing Flows)...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/generate', {
        model: 'starflow-v',
        prompt,
        duration: options?.duration || 4,
        resolution: options?.resolution || '480p',
        fps: options?.fps || 30,
        flow_steps: options?.flowSteps || 2,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`STARFlow-V generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Generate with single-step flow (fastest possible)
   * Extreme speed but lower quality
   */
  static async generateFastest(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with single-step flow (fastest mode)...'
      });

      return this.generateVideo(jobId, prompt, {
        ...options,
        flowSteps: 1,
        resolution: '480p',
      });
    } catch (error: any) {
      throw new Error(`STARFlow-V fastest generation failed: ${error.message}`);
    }
  }

  /**
   * Image to video with Normalizing Flows
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      flowSteps?: 1 | 2 | 4;
      seed?: number;
      useLocal?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with STARFlow-V...'
      });

      const apiClient = options?.useLocal ? this.localApi : this.api;

      const response = await apiClient.post('/video/image-to-video', {
        model: 'starflow-v',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 4,
        flow_steps: options?.flowSteps || 2,
        seed: options?.seed,
      });

      const taskId = response.data.task_id;
      const videoUrl = await this.pollTask(taskId, jobId, options?.useLocal);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`STARFlow-V image-to-video failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get Normalizing Flows architecture explanation
   */
  static getArchitectureInfo(): {
    type: string;
    howItWorks: string;
    vsD iffusion: {
      diffusionSteps: number;
      flowSteps: number;
      speedup: string;
    };
    tradeoffs: string[];
  } {
    return {
      type: 'Normalizing Flows (Invertible Transformations)',
      howItWorks: 'Maps simple distributions (e.g., Gaussian) to complex data (video) using invertible transformations. Unlike diffusion (which iteratively removes noise), flows can generate in a single forward pass.',
      vsDiffusion: {
        diffusionSteps: 20-50,
        flowSteps: 1-4,
        speedup: '15x faster',
      },
      tradeoffs: [
        'Pro: Extreme speed (1-4 steps vs 20-50)',
        'Pro: Deterministic and reversible',
        'Pro: Perfect for on-device (low power)',
        'Con: Current physics fidelity lower than diffusion',
        'Con: Limited resolution (480p in research version)',
        'Con: Fewer training examples (newer paradigm)',
      ],
    };
  }

  /**
   * Get on-device deployment info
   * Apple is targeting iOS/Neural Engine
   */
  static getOnDeviceInfo(): {
    targetDevices: string[];
    targetUseCase: string;
    estimatedRelease: string;
    features: string[];
  } {
    return {
      targetDevices: ['iPhone (Neural Engine)', 'iPad', 'Mac (M-series)'],
      targetUseCase: 'Generative Live Photos, Memory movies, on-device content creation',
      estimatedRelease: 'iOS 19 / 2026 (speculation)',
      features: [
        'Generate video directly on device (no cloud)',
        'Low battery consumption',
        'Privacy-preserving (no data leaves device)',
        'Real-time preview during generation',
        'Integrate with Photos app',
      ],
    };
  }

  /**
   * Get current limitations (research phase)
   */
  static getCurrentLimitations(): {
    resolution: string;
    physicsIssues: string[];
    stability: string;
    recommendation: string;
  } {
    return {
      resolution: '480p max (vs 1080p-4K competitors)',
      physicsIssues: [
        'Objects may pass through each other',
        'Mass conservation not guaranteed',
        '"Octopuses passing through glass" errors',
        'Causal hallucinations (shards disappearing after glass breaks)',
      ],
      stability: 'Research preview - expect frequent updates',
      recommendation: 'Use for speed-critical applications or research. For production quality, use Runway/Sora/Veo.',
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
    notes: string[];
  } {
    return {
      gpu: 'Apple M1 Pro or better (or NVIDIA RTX 3060+)',
      vram: '12GB+ VRAM',
      ram: '16GB+ System RAM',
      storage: '8GB for model weights',
      notes: [
        'Optimized for Apple Neural Engine',
        'Much lower requirements than diffusion models',
        'Can run on MacBook Pro M1 Pro',
        'Research code available on GitHub',
      ],
    };
  }

  /**
   * Download model for local research
   */
  static async downloadModelLocal(): Promise<{ status: string; path: string }> {
    try {
      const response = await this.localApi.post('/models/download', {
        model_id: 'apple/starflow-v-research',
        cache_dir: './models/starflow',
      });

      return {
        status: response.data.status,
        path: response.data.path,
      };
    } catch (error: any) {
      throw new Error(`STARFlow model download failed: ${error.message}`);
    }
  }

  /**
   * Poll task until completion
   * Much faster than diffusion models (usually 10-30 seconds)
   */
  private static async pollTask(
    taskId: string,
    jobId: string,
    isLocal: boolean = false
  ): Promise<string> {
    const maxAttempts = 30; // STARFlow is fast
    const pollInterval = 1000; // 1 second
    const apiClient = isLocal ? this.localApi : this.api;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await apiClient.get(`/video/tasks/${taskId}`);
      const { status, output, error } = response.data;

      if (status === 'completed' || status === 'succeeded') {
        return output.video_url || output.url;
      } else if (status === 'failed') {
        throw new Error(`STARFlow task failed: ${error || 'Unknown error'}`);
      }

      const progress = (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progress, 95) });
    }

    throw new Error('STARFlow generation timed out');
  }
}
