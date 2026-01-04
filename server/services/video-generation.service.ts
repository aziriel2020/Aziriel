/**
 * VIDEO GENERATION SERVICE
 * Production-ready integrations for all major video AI models
 * - Kling AI (Kuaishou)
 * - Veo 3.1 (Google DeepMind)
 * - Runway Gen-3 Alpha
 * - Luma Dream Machine
 * - Pika 1.5
 * - Sora (OpenAI)
 */

import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface VideoGenerationRequest {
  prompt: string;
  userId: string;
  style?: 'cinematic' | 'documentary' | 'animation' | 'abstract' | 'realistic';
  duration?: number;
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  resolution?: '720p' | '1080p' | '4k';
  model?: 'auto' | 'kling' | 'veo' | 'runway' | 'luma' | 'pika' | 'sora';
  imageUrl?: string;
  negativePrompt?: string;
}

export interface VideoGenerationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  model: string;
  estimatedTime: number;
  cost?: number;
}

// ============================================================================
// KLING AI (KUAISHOU) - LATEST MODEL v1.5
// ============================================================================

class KlingAIService {
  private apiKey: string;
  private baseUrl = 'https://api.klingai.com/v1';

  constructor() {
    this.apiKey = process.env.KLING_API_KEY || '';
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const duration = params.duration || 5;
    const quality = params.quality || 'standard';

    const response = await axios.post(
      this.baseUrl + '/videos/text2video',
      {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || 'blurry, low quality, distorted',
        cfg_scale: 7.5,
        duration: duration,
        aspect_ratio: params.aspectRatio || '16:9',
        mode: quality === 'ultra' ? 'pro' : 'standard',
      },
      {
        headers: {
          'Authorization': 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      jobId: response.data.task_id,
      status: 'processing',
      model: 'kling-1.5',
      estimatedTime: duration * 60,
      cost: this.calculateCost(duration, quality),
    };
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await axios.get(this.baseUrl + '/videos/status/' + jobId, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey },
    });

    return {
      jobId,
      status: response.data.status,
      videoUrl: response.data.video_url,
      thumbnailUrl: response.data.thumbnail_url,
      duration: response.data.duration,
      model: 'kling-1.5',
      estimatedTime: 0,
    };
  }

  private calculateCost(duration: number, quality: string): number {
    const baseRate = quality === 'ultra' ? 0.15 : 0.08;
    return duration * baseRate;
  }
}

// ============================================================================
// VEO 3.1 (GOOGLE DEEPMIND)
// ============================================================================

class Veo31Service {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const duration = params.duration || 10;
    const quality = params.quality || 'standard';

    const response = await axios.post(
      this.baseUrl + '/models/veo-3.1:generateVideo',
      {
        prompt: params.prompt,
        videoConfig: {
          duration: duration + 's',
          aspectRatio: params.aspectRatio || '16:9',
          quality: quality === 'ultra' ? 'high' : 'standard',
          frameRate: quality === 'ultra' ? 60 : 30,
        },
        generationConfig: {
          temperature: 0.7,
          seed: Math.floor(Math.random() * 1000000),
        },
      },
      {
        headers: {
          'Authorization': 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      jobId: response.data.name,
      status: 'processing',
      model: 'veo-3.1',
      estimatedTime: duration * 30,
      cost: this.calculateCost(duration),
    };
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await axios.get(this.baseUrl + '/' + jobId, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey },
    });

    const done = response.data.done;
    const videoData = response.data.response?.video;

    return {
      jobId,
      status: done ? 'completed' : 'processing',
      videoUrl: videoData?.uri,
      model: 'veo-3.1',
      estimatedTime: 0,
    };
  }

  private calculateCost(duration: number): number {
    return duration * 0.12;
  }
}

// ============================================================================
// RUNWAY GEN-3 ALPHA
// ============================================================================

class RunwayGen3Service {
  private apiKey: string;
  private baseUrl = 'https://api.runwayml.com/v1';

  constructor() {
    this.apiKey = process.env.RUNWAY_API_KEY || '';
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const duration = params.duration || 5;

    const response = await axios.post(
      this.baseUrl + '/gen3/text_to_video',
      {
        text_prompt: params.prompt,
        duration: duration,
        ratio: params.aspectRatio || '16:9',
        model: 'gen3a_turbo',
        watermark: false,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
      }
    );

    return {
      jobId: response.data.id,
      status: 'processing',
      model: 'gen3-alpha-turbo',
      estimatedTime: 90,
      cost: 0.50,
    };
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await axios.get(this.baseUrl + '/tasks/' + jobId, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey },
    });

    return {
      jobId,
      status: response.data.status,
      videoUrl: response.data.output?.[0],
      model: 'gen3-alpha-turbo',
      estimatedTime: 0,
    };
  }
}

// ============================================================================
// LUMA DREAM MACHINE
// ============================================================================

class LumaDreamMachineService {
  private apiKey: string;
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY || '';
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const payload: any = {
      prompt: params.prompt,
      aspect_ratio: params.aspectRatio || '16:9',
      loop: false,
    };

    if (params.imageUrl) {
      payload.keyframes = {
        frame0: { type: 'image', url: params.imageUrl },
      };
    }

    const response = await axios.post(this.baseUrl + '/generations', payload, {
      headers: {
        'Authorization': 'Bearer ' + this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    return {
      jobId: response.data.id,
      status: 'processing',
      model: 'dream-machine-1.5',
      estimatedTime: 120,
      cost: 0.30,
    };
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await axios.get(this.baseUrl + '/generations/' + jobId, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey },
    });

    return {
      jobId,
      status: response.data.state === 'completed' ? 'completed' : 'processing',
      videoUrl: response.data.assets?.video,
      thumbnailUrl: response.data.assets?.thumbnail,
      model: 'dream-machine-1.5',
      estimatedTime: 0,
    };
  }
}

// ============================================================================
// PIKA 1.5
// ============================================================================

class Pika15Service {
  private apiKey: string;
  private baseUrl = 'https://api.pika.art/v1';

  constructor() {
    this.apiKey = process.env.PIKA_API_KEY || '';
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const quality = params.quality || 'standard';

    const response = await axios.post(
      this.baseUrl + '/generate',
      {
        prompt: params.prompt,
        options: {
          frameRate: 24,
          motion: quality === 'ultra' ? 4 : 2,
          aspectRatio: params.aspectRatio || '16:9',
          seed: Math.floor(Math.random() * 1000000),
        },
        model: 'pika-1.5',
      },
      {
        headers: {
          'Authorization': 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      jobId: response.data.job_id,
      status: 'processing',
      model: 'pika-1.5',
      estimatedTime: 60,
      cost: 0.25,
    };
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await axios.get(this.baseUrl + '/status/' + jobId, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey },
    });

    return {
      jobId,
      status: response.data.status,
      videoUrl: response.data.result_url,
      model: 'pika-1.5',
      estimatedTime: 0,
    };
  }
}

// ============================================================================
// SORA (OPENAI) - PRODUCTION API
// ============================================================================

class SoraService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const duration = params.duration || 20;
    const resolution = params.resolution || '1080p';
    const quality = params.quality || 'standard';

    const response = await axios.post(
      this.baseUrl + '/videos/generations',
      {
        model: 'sora-1.0-turbo',
        prompt: params.prompt,
        size: resolution === '4k' ? '3840x2160' : '1920x1080',
        duration: Math.min(duration, 60),
        quality: quality,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      jobId: response.data.id,
      status: 'processing',
      model: 'sora-1.0-turbo',
      estimatedTime: 180,
      cost: 1.20,
    };
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await axios.get(this.baseUrl + '/videos/' + jobId, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey },
    });

    return {
      jobId,
      status: response.data.status,
      videoUrl: response.data.url,
      model: 'sora-1.0-turbo',
      estimatedTime: 0,
    };
  }
}

// ============================================================================
// MAIN VIDEO GENERATION SERVICE WITH AUTO-ROUTING
// ============================================================================

export class VideoGenerationService {
  private kling: KlingAIService;
  private veo: Veo31Service;
  private runway: RunwayGen3Service;
  private luma: LumaDreamMachineService;
  private pika: Pika15Service;
  private sora: SoraService;

  constructor() {
    this.kling = new KlingAIService();
    this.veo = new Veo31Service();
    this.runway = new RunwayGen3Service();
    this.luma = new LumaDreamMachineService();
    this.pika = new Pika15Service();
    this.sora = new SoraService();
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const model = params.model || this.selectBestModel(params);

    try {
      switch (model) {
        case 'kling':
          return await this.kling.generateVideo(params);
        case 'veo':
          return await this.veo.generateVideo(params);
        case 'runway':
          return await this.runway.generateVideo(params);
        case 'luma':
          return await this.luma.generateVideo(params);
        case 'pika':
          return await this.pika.generateVideo(params);
        case 'sora':
          return await this.sora.generateVideo(params);
        default:
          return await this.kling.generateVideo(params);
      }
    } catch (error: any) {
      console.error('Error with ' + model + ', trying fallback...');
      return await this.generateWithFallback(params, model);
    }
  }

  async getJobStatus(jobId: string, model: string): Promise<VideoGenerationResponse> {
    switch (model) {
      case 'kling-1.5':
        return await this.kling.getJobStatus(jobId);
      case 'veo-3.1':
        return await this.veo.getJobStatus(jobId);
      case 'gen3-alpha-turbo':
        return await this.runway.getJobStatus(jobId);
      case 'dream-machine-1.5':
        return await this.luma.getJobStatus(jobId);
      case 'pika-1.5':
        return await this.pika.getJobStatus(jobId);
      case 'sora-1.0-turbo':
        return await this.sora.getJobStatus(jobId);
      default:
        throw new Error('Unknown model: ' + model);
    }
  }

  private selectBestModel(params: VideoGenerationRequest): string {
    const duration = params.duration || 5;
    const quality = params.quality || 'standard';

    if (duration > 30) {
      return process.env.OPENAI_API_KEY ? 'sora' : 'veo';
    }

    if (quality === 'ultra') {
      return process.env.GOOGLE_AI_API_KEY ? 'veo' : 'runway';
    }

    if (quality === 'draft') {
      return process.env.LUMA_API_KEY ? 'luma' : 'pika';
    }

    return 'kling';
  }

  private async generateWithFallback(
    params: VideoGenerationRequest,
    failedModel: string
  ): Promise<VideoGenerationResponse> {
    const fallbackOrder = ['kling', 'veo', 'luma', 'pika', 'runway', 'sora']
      .filter(m => m !== failedModel);

    for (const model of fallbackOrder) {
      try {
        return await this.generateVideo({ ...params, model: model as any });
      } catch (error) {
        console.error('Fallback ' + model + ' failed, trying next...');
      }
    }

    throw new Error('All video generation providers failed');
  }
}

export default new VideoGenerationService();
