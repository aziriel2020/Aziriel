// @ts-nocheck
/**
 * AI Generation Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { CreditsService } from '../services/credits.service';
import { QueueService } from '../services/queue.service';
import { RunwayService } from '../services/ai/runway.service';
import { ReplicateService } from '../services/ai/replicate.service';
import { OpenAIService } from '../services/ai/openai.service';
import { AnthropicService } from '../services/ai/anthropic.service';
import { GoogleService } from '../services/ai/google.service';
import { KlingService } from '../services/ai/kling.service';
import { SoraService } from '../services/ai/sora.service';
import { VeoService } from '../services/ai/veo.service';
import { HunyuanService } from '../services/ai/hunyuan.service';
import { WanService } from '../services/ai/wan.service';
import { HailuoService } from '../services/ai/hailuo.service';
import { LumaService } from '../services/ai/luma.service';
import { PikaService } from '../services/ai/pika.service';
import { MochiService } from '../services/ai/mochi.service';
import { STARFlowService } from '../services/ai/starflow.service';
import { io } from '../app';

export class GenerationController {
  /**
   * Generate video from text
   */
  static async generateVideo(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { prompt, provider, options } = req.body;

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 20);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO',
        status: 'PENDING',
        prompt,
        provider,
        options: options || {},
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 20, job.id, 'Video generation');

    // Add to queue
    await QueueService.addVideoGenerationJob(job.id, provider, prompt, options);

    // Emit socket event
    io.to(`user:${userId}`).emit('job:created', { jobId: job.id });

    res.status(202).json({
      success: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
          type: job.type,
          prompt: job.prompt,
          createdAt: job.createdAt,
        },
      },
      message: 'Video generation started',
    });
  }

  /**
   * Generate image from text
   */
  static async generateImage(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { prompt, provider, options } = req.body;

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 5);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'IMAGE',
        status: 'PENDING',
        prompt,
        provider,
        options: options || {},
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 5, job.id, 'Image generation');

    // Add to queue
    await QueueService.addImageGenerationJob(job.id, provider, prompt, options);

    // Emit socket event
    io.to(`user:${userId}`).emit('job:created', { jobId: job.id });

    res.status(202).json({
      success: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
          type: job.type,
          prompt: job.prompt,
          createdAt: job.createdAt,
        },
      },
      message: 'Image generation started',
    });
  }

  /**
   * Convert image to video
   */
  static async imageToVideo(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { imageUrl, prompt, options } = req.body;

    if (!imageUrl) {
      throw new AppError('Image URL is required', 400);
    }

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 25);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'IMAGE_TO_VIDEO',
        status: 'PENDING',
        prompt: prompt || 'Animate this image',
        provider: 'runway',
        options: { imageUrl, ...options },
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 25, job.id, 'Image-to-video');

    // Generate with Runway
    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' },
      });

      const videoUrl = await RunwayService.imageToVideo(job.id, imageUrl, prompt, options);

      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', outputUrl: videoUrl },
      });

      io.to(`user:${userId}`).emit('job:completed', { jobId: job.id, outputUrl: videoUrl });

      res.json({
        success: true,
        data: {
          job: {
            id: job.id,
            status: 'COMPLETED',
            outputUrl: videoUrl,
          },
        },
      });
    } catch (error: any) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'FAILED', error: error.message },
      });

      io.to(`user:${userId}`).emit('job:failed', { jobId: job.id, error: error.message });

      throw error;
    }
  }

  /**
   * Transform video with AI (video-to-video)
   */
  static async videoToVideo(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { videoUrl, prompt, style, options } = req.body;

    if (!videoUrl) {
      throw new AppError('Video URL is required', 400);
    }

    if (!prompt) {
      throw new AppError('Prompt is required for video transformation', 400);
    }

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 30);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_TO_VIDEO',
        status: 'PENDING',
        prompt,
        provider: 'runway',
        options: { videoUrl, style, ...options },
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 30, job.id, 'Video-to-video');

    // Emit job created event
    io.to(`user:${userId}`).emit('job:created', { jobId: job.id });

    // Send immediate response
    res.status(202).json({
      success: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
          type: job.type,
        },
      },
      message: 'Video transformation started',
    });

    // Process in background
    (async () => {
      try {
        io.to(`user:${userId}`).emit('job:processing', { jobId: job.id });

        const transformedUrl = await RunwayService.videoToVideo(
          job.id,
          videoUrl,
          prompt,
          { style, ...options }
        );

        await prisma.job.update({
          where: { id: job.id },
          data: { status: 'COMPLETED', outputUrl: transformedUrl, completedAt: new Date() },
        });

        io.to(`user:${userId}`).emit('job:completed', { jobId: job.id, outputUrl: transformedUrl });
      } catch (error: any) {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: 'FAILED', error: error.message },
        });

        io.to(`user:${userId}`).emit('job:failed', { jobId: job.id, error: error.message });
      }
    })();
  }

  /**
   * Upscale image with AI
   */
  static async upscaleImage(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { imageUrl, scale = 4 } = req.body;

    if (!imageUrl) {
      throw new AppError('Image URL is required', 400);
    }

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 10);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'IMAGE_UPSCALE',
        status: 'PROCESSING',
        prompt: `Upscale ${scale}x`,
        provider: 'replicate',
        options: { imageUrl, scale },
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 10, job.id, 'Image upscaling');

    try {
      const upscaledUrl = await ReplicateService.upscaleImage(job.id, imageUrl, scale);

      res.json({
        success: true,
        data: {
          job: {
            id: job.id,
            status: 'COMPLETED',
            outputUrl: upscaledUrl,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove background from image
   */
  static async removeBackground(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      throw new AppError('Image URL is required', 400);
    }

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 5);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'IMAGE_BACKGROUND_REMOVAL',
        status: 'PROCESSING',
        prompt: 'Remove background',
        provider: 'replicate',
        options: { imageUrl },
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 5, job.id, 'Background removal');

    try {
      const resultUrl = await ReplicateService.removeBackground(job.id, imageUrl);

      res.json({
        success: true,
        data: {
          job: {
            id: job.id,
            status: 'COMPLETED',
            outputUrl: resultUrl,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate music from text
   */
  static async generateMusic(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { prompt, duration = 8, temperature = 1.0 } = req.body;

    if (!prompt) {
      throw new AppError('Prompt is required', 400);
    }

    // Check credits
    const hasCredits = await CreditsService.hasCredits(userId, 15);
    if (!hasCredits) {
      throw new AppError('Insufficient credits', 402);
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'AUDIO',
        status: 'PROCESSING',
        prompt,
        provider: 'replicate',
        options: { duration, temperature },
      },
    });

    // Deduct credits
    await CreditsService.deductCredits(userId, 15, job.id, 'Music generation');

    try {
      const audioUrl = await ReplicateService.generateMusic(job.id, prompt, duration, temperature);

      res.json({
        success: true,
        data: {
          job: {
            id: job.id,
            status: 'COMPLETED',
            outputUrl: audioUrl,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enhance prompt with AI
   */
  static async enhancePrompt(req: Request, res: Response) {
    const { prompt, provider = 'claude' } = req.body;

    if (!prompt) {
      throw new AppError('Prompt is required', 400);
    }

    let enhancedPrompt: string;

    switch (provider) {
      case 'claude':
        enhancedPrompt = await AnthropicService.enhancePrompt(prompt);
        break;
      case 'gpt4':
        enhancedPrompt = await OpenAIService.enhancePrompt(prompt);
        break;
      case 'gemini':
        enhancedPrompt = await GoogleService.enhancePrompt(prompt);
        break;
      default:
        enhancedPrompt = await AnthropicService.enhancePrompt(prompt);
    }

    res.json({
      success: true,
      data: {
        original: prompt,
        enhanced: enhancedPrompt,
      },
    });
  }

  /**
   * Generate video script
   */
  static async generateScript(req: Request, res: Response) {
    const { concept, format = 'storyboard', duration = 30, provider = 'claude' } = req.body;

    if (!concept) {
      throw new AppError('Concept is required', 400);
    }

    let script: string;

    switch (provider) {
      case 'claude':
        script = await AnthropicService.generateScript(concept, { format, duration });
        break;
      case 'gemini':
        script = await GoogleService.generateScript(concept, { duration });
        break;
      default:
        script = await AnthropicService.generateScript(concept, { format, duration });
    }

    res.json({
      success: true,
      data: {
        concept,
        script,
        format,
        duration,
      },
    });
  }

  /**
   * Generate storyboard
   */
  static async generateStoryboard(req: Request, res: Response) {
    const { concept, scenes = 6 } = req.body;

    if (!concept) {
      throw new AppError('Concept is required', 400);
    }

    const storyboard = await GoogleService.generateStoryboard(concept, scenes);

    res.json({
      success: true,
      data: {
        concept,
        scenes: storyboard,
      },
    });
  }

  /**
   * List available AI models
   */
  static async listModels(req: Request, res: Response) {
    const models = {
      text: [
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
      ],
      image: [
        { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai' },
        { id: 'sdxl', name: 'Stable Diffusion XL', provider: 'replicate' },
        { id: 'flux', name: 'Flux Schnell', provider: 'replicate' },
      ],
      video: [
        // Western "Big Three"
        {
          id: 'sora-2',
          name: 'OpenAI Sora 2 (Social Simulation Engine)',
          provider: 'sora',
          features: ['Character Cameos', 'Storyboards', 'Native Audio', 'Up to 25s', '1080p', 'Physics Simulation'],
          description: 'Social platform for viral content, best physics-aware simulation',
          elo: null,
          release: '2025-09-30',
        },
        {
          id: 'veo-3.1',
          name: 'Google Veo 3.1 (Enterprise Integration)',
          provider: 'veo',
          features: ['Ingredient Control', 'Video Extension >60s', 'Masked Editing', 'Gemini Prompts', '4K', 'Fast Mode'],
          description: 'Enterprise-grade with ecosystem integration, brand safety',
          elo: null,
          release: '2025-10-15',
        },
        {
          id: 'runway-gen4.5',
          name: 'Runway Gen-4.5 (Filmmaker Precision)',
          provider: 'runway',
          features: ['Advanced Camera Controls', 'Multi-Motion Brush', 'Character Reference', 'Physics Engine', '1080p'],
          description: 'Professional VFX tool, highest Elo score (1247)',
          elo: 1247,
          release: '2025-12-01',
        },
        { id: 'runway-gen3', name: 'Runway Gen-3 Alpha', provider: 'runway', features: ['10s', '1080p'] },
        { id: 'runway-gen2', name: 'Runway Gen-2', provider: 'runway', features: ['4s', '1080p'] },

        // Chinese Innovation Leaders
        {
          id: 'hunyuan-1.5',
          name: 'Tencent Hunyuan Video 1.5 (Open Source SOTA)',
          provider: 'hunyuan',
          features: ['8.3B params', 'Runs on RTX 4090', '4-step distilled', 'Super-res 1080p', 'Open Source'],
          description: 'Efficient SOTA quality, runs on consumer hardware',
          elo: null,
          release: '2025-12-17',
        },
        {
          id: 'hy-world-1.5',
          name: 'HY-World 1.5 / WorldPlay (Interactive Real-Time)',
          provider: 'hunyuan',
          features: ['Real-time 24fps', 'WASD Control', 'Interactive World Model', 'Streaming Inference'],
          description: 'Revolutionary: explore AI-generated worlds like a game',
          elo: null,
          release: '2025-12-17',
        },
        {
          id: 'wan-2.2',
          name: 'Alibaba Wan 2.2 (MoE Architecture)',
          provider: 'wan',
          features: ['14B MoE', 'Speech-to-Video', 'Runs on RTX 4090', 'Open Weights'],
          description: 'Efficient scaling via sparsity, audio-reactive generation',
          elo: null,
          release: '2025-late',
        },
        {
          id: 'kling-2.6',
          name: 'Kling AI 2.6 (Motion Specialist)',
          provider: 'kling',
          features: ['Motion Transfer', 'Native Audio', 'Camera Control', 'Up to 10s', '1080p'],
          description: 'Superior motion quality and consistency',
          elo: null,
          release: '2025-late',
        },
        {
          id: 'kling-o1',
          name: 'Kling O1 (Reasoning Model)',
          provider: 'kling',
          features: ['Chain-of-Thought', 'Start+End Frame Logic', 'No Teleportation Errors', 'Pro Mode'],
          description: 'Revolutionary: plans video sequence before generating',
          elo: null,
          release: '2025-late',
        },
        {
          id: 'hailuo-2.3',
          name: 'MiniMax Hailuo 2.3 (Speed Demon)',
          provider: 'hailuo',
          features: ['2-3x faster than Sora', '$0.045/sec', 'Media Agent', 'Anime/Stylized', '1080p 6s'],
          description: 'Efficiency leader, optimized for stylized content',
          elo: null,
          release: '2025-11/12',
        },

        // Specialized Innovators
        {
          id: 'luma-ray3',
          name: 'Luma Ray 3 (3D Native Editor)',
          provider: 'luma',
          features: ['Modify with Instructions', '3D Geometric Consistency', 'Reframe', 'Camera Concepts'],
          description: 'Natural language editing, NeRF-based 3D understanding',
          elo: null,
          release: '2025-12-18',
        },
        {
          id: 'pika-2.2',
          name: 'Pika Art 2.2 (Creative Playground)',
          provider: 'pika',
          features: ['Pikaffects (Melt/Crush/Inflate)', 'Pikaframes', 'Lip Sync', 'Character Performance'],
          description: 'Surreal effects, meme-centric, social-first',
          elo: null,
          release: '2025-current',
        },
        {
          id: 'mochi-1',
          name: 'Genmo Mochi 1 (Open Source Pioneer)',
          provider: 'mochi',
          features: ['Apache 2.0 License', 'AsymmDiT Architecture', 'Superior Prompt Adherence', 'Research-friendly'],
          description: 'First SOTA open model, unrestricted commercial use',
          elo: null,
          release: '2025-09',
        },

        // Research Frontier
        {
          id: 'starflow-v',
          name: 'Apple STARFlow-V (Normalizing Flows)',
          provider: 'starflow',
          features: ['15x Faster', '1-4 Step Generation', 'On-device Potential', '480p'],
          description: 'Revolutionary architecture, extreme speed, iOS future',
          elo: null,
          release: '2025-12 (Research)',
        },

        // Legacy models
        { id: 'zeroscope', name: 'Zeroscope V2 XL', provider: 'replicate', features: ['3s', '576x320'] },
        { id: 'animatediff', name: 'AnimateDiff', provider: 'replicate', features: ['Animation', '512x512'] },
      ],
      audio: [
        { id: 'musicgen', name: 'MusicGen', provider: 'replicate' },
        { id: 'elevenlabs', name: 'ElevenLabs TTS', provider: 'elevenlabs' },
      ],
    };

    res.json({
      success: true,
      data: { models },
    });
  }
}
