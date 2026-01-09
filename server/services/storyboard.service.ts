/**
 * Storyboard Service - REVOLUTIONARY FRAME CONSISTENCY
 * The BEST storyboard feature in the world - Perfect continuity across scenes
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import axios from 'axios';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import S3Service from './s3.service';
import videoGenerationService from './video-generation.service';
import { io } from '../app';

const TEMP_DIR = process.env.TEMP_DIR || '/tmp/neurafield';

export interface StoryboardScene {
  id?: string;
  prompt: string;
  duration?: number;
  model?: string;
  
  // Advanced Controls
  lighting?: {
    type: 'natural' | 'studio' | 'dramatic' | 'cinematic' | 'soft' | 'harsh';
    intensity?: number; // 0-1
    color?: string; // hex color
    direction?: 'front' | 'back' | 'side' | 'top' | 'bottom';
  };
  
  camera?: {
    angle: 'eye-level' | 'low' | 'high' | 'dutch' | 'birds-eye' | 'worms-eye';
    movement?: 'static' | 'pan' | 'tilt' | 'zoom' | 'dolly' | 'tracking' | 'crane';
    speed?: 'slow' | 'medium' | 'fast';
  };
  
  composition?: {
    framing: 'close-up' | 'medium' | 'wide' | 'extreme-close-up' | 'extreme-wide';
    rule?: 'thirds' | 'center' | 'golden-ratio' | 'symmetry';
    depth?: 'shallow' | 'deep';
  };
  
  effects?: {
    colorGrading?: 'natural' | 'warm' | 'cool' | 'vintage' | 'noir' | 'cyberpunk' | 'fantasy';
    mood?: 'happy' | 'sad' | 'tense' | 'peaceful' | 'energetic' | 'mysterious';
    weather?: 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'snowy' | 'stormy';
    timeOfDay?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'golden-hour' | 'dusk' | 'night';
  };
  
  styleConsistency?: {
    maintainCharacters?: boolean;
    maintainLocation?: boolean;
    maintainLighting?: boolean;
    maintainColorGrading?: boolean;
    transitionType?: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'match-cut';
  };
}

export interface StoryboardRequest {
  userId: string;
  title: string;
  description?: string;
  scenes: StoryboardScene[];
  globalStyle?: {
    colorPalette?: string[]; // Array of hex colors
    cinematicStyle?: 'hollywood' | 'indie' | 'documentary' | 'experimental' | 'anime' | 'realistic';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '21:9' | '4:3';
  };
}

export interface StoryboardResponse {
  storyboardId: string;
  totalScenes: number;
  status: 'processing' | 'completed' | 'failed';
  scenes: Array<{
    sceneId: string;
    jobId: string;
    status: string;
  }>;
}

export class StoryboardService {
  /**
   * Initialize temp directory
   */
  static async init() {
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true });
      logger.info('Storyboard service initialized');
    } catch (error) {
      logger.error('Failed to initialize storyboard service:', error);
    }
  }

  /**
   * Create complete storyboard with frame-to-frame consistency
   */
  static async createStoryboard(request: StoryboardRequest): Promise<StoryboardResponse> {
    const storyboardId = uuidv4();
    
    try {
      logger.info(`Creating storyboard: \${storyboardId} with \${request.scenes.length} scenes`);

      // Create storyboard in database
      const storyboard = await prisma.storyboard.create({
        data: {
          id: storyboardId,
          userId: request.userId,
          title: request.title,
          description: request.description,
          totalScenes: request.scenes.length,
          completedScenes: 0,
          status: 'PROCESSING',
          globalStyle: request.globalStyle || {},
        },
      });

      const sceneResults: Array<{ sceneId: string; jobId: string; status: string }> = [];

      // Process scenes sequentially for continuity
      for (let i = 0; i < request.scenes.length; i++) {
        const scene = request.scenes[i];
        const sceneId = uuidv4();

        logger.info(`Processing scene \${i + 1}/\${request.scenes.length}`);

        // Get previous scene's end frame if exists
        let startFrameUrl: string | undefined;
        if (i > 0 && sceneResults[i - 1]) {
          const previousJob = await prisma.job.findUnique({
            where: { id: sceneResults[i - 1].jobId },
          });

          if (previousJob?.outputUrl) {
            // Extract last frame from previous video
            startFrameUrl = await this.extractLastFrame(previousJob.outputUrl, sceneId);
            
            // Apply style transfer to maintain consistency
            if (scene.styleConsistency?.maintainLighting || 
                scene.styleConsistency?.maintainColorGrading) {
              startFrameUrl = await this.applyStyleTransfer(
                startFrameUrl,
                scene,
                request.globalStyle
              );
            }
          }
        }

        // Build enhanced prompt with all controls
        const enhancedPrompt = this.buildEnhancedPrompt(scene, request.globalStyle);

        // Create job with start frame
        const job = await prisma.job.create({
          data: {
            userId: request.userId,
            prompt: enhancedPrompt,
            provider: scene.model || 'klingo1', // Default to Kling O1 for best consistency
            status: 'PENDING',
            options: {
              duration: scene.duration || 5,
              startFrameUrl, // Use end frame of previous scene
              ...scene,
            },
            metadata: {
              storyboardId,
              sceneIndex: i,
              totalScenes: request.scenes.length,
            },
          },
        });

        // Create storyboard scene record
        await prisma.storyboardScene.create({
          data: {
            id: sceneId,
            storyboardId,
            jobId: job.id,
            sceneIndex: i,
            prompt: enhancedPrompt,
            startFrameUrl,
            status: 'PENDING',
          },
        });

        // Generate video with start frame
        await this.generateSceneWithConsistency(
          job.id,
          enhancedPrompt,
          scene.model || 'klingo1',
          {
            duration: scene.duration || 5,
            startFrameUrl,
            ...scene,
          },
          storyboardId
        );

        sceneResults.push({
          sceneId,
          jobId: job.id,
          status: 'processing',
        });

        // Wait for scene to complete before starting next one
        await this.waitForSceneCompletion(job.id, 300000); // 5 min timeout
      }

      // Emit WebSocket event
      io.to(`user:\${request.userId}`).emit('storyboard:created', {
        storyboardId,
        totalScenes: request.scenes.length,
      });

      return {
        storyboardId,
        totalScenes: request.scenes.length,
        status: 'processing',
        scenes: sceneResults,
      };
    } catch (error: any) {
      logger.error(`Storyboard creation failed: \${storyboardId}`, error);
      throw new Error(`Failed to create storyboard: \${error.message}`);
    }
  }

  /**
   * Extract last frame from video
   */
  private static async extractLastFrame(videoUrl: string, sceneId: string): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `\${jobId}-input.mp4`);
    const framePath = path.join(TEMP_DIR, `\${jobId}-last-frame.jpg`);

    try {
      // Download video
      const response = await axios.get(videoUrl, { responseType: 'stream' });
      const writer = require('fs').createWriteStream(inputPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Get video duration
      const duration = await this.getVideoDuration(inputPath);

      // Extract last frame (0.1s before end to avoid black frames)
      const timestamp = Math.max(0, duration - 0.1);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .screenshots({
            timestamps: [timestamp],
            filename: path.basename(framePath),
            folder: path.dirname(framePath),
            size: '1920x1080',
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      // Enhance frame quality
      const enhancedFrame = await sharp(framePath)
        .resize(1920, 1080, { fit: 'cover' })
        .sharpen()
        .toBuffer();

      // Upload to S3
      const uploaded = await S3Service.uploadFile(`start-frame-\${sceneId}.jpg`, {
        fileBuffer: enhancedFrame,
        contentType: 'image/jpeg',
      });

      // Cleanup
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(framePath).catch(() => {});

      logger.info(`Extracted last frame for scene \${sceneId}`);
      return uploaded.url;
    } catch (error: any) {
      logger.error('Frame extraction failed:', error);
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(framePath).catch(() => {});
      throw error;
    }
  }

  /**
   * Apply style transfer to maintain consistency
   */
  private static async applyStyleTransfer(
    frameUrl: string,
    scene: StoryboardScene,
    globalStyle?: any
  ): Promise<string> {
    try {
      // Download frame
      const response = await axios.get(frameUrl, { responseType: 'arraybuffer' });
      let frameBuffer = Buffer.from(response.data);

      // Apply color grading
      if (scene.effects?.colorGrading || globalStyle?.colorPalette) {
        frameBuffer = await this.applyColorGrading(
          frameBuffer,
          scene.effects?.colorGrading,
          globalStyle?.colorPalette
        );
      }

      // Apply lighting adjustments
      if (scene.lighting) {
        frameBuffer = await this.applyLightingAdjustment(frameBuffer, scene.lighting);
      }

      // Upload styled frame
      const uploaded = await S3Service.uploadFile(`styled-frame-\${uuidv4()}.jpg`, {
        fileBuffer: frameBuffer,
        contentType: 'image/jpeg',
      });

      return uploaded.url;
    } catch (error: any) {
      logger.error('Style transfer failed:', error);
      return frameUrl; // Return original frame if style transfer fails
    }
  }

  /**
   * Apply color grading to frame
   */
  private static async applyColorGrading(
    buffer: Buffer,
    grading?: string,
    palette?: string[]
  ): Promise<Buffer> {
    let image = sharp(buffer);

    const gradingPresets: Record<string, any> = {
      warm: { temperature: 1.2, tint: 1.1 },
      cool: { temperature: 0.8, tint: 0.9 },
      vintage: { saturation: 0.7, sepia: 0.3 },
      noir: { greyscale: true, contrast: 1.3 },
      cyberpunk: { saturation: 1.5, vibrance: 1.3 },
      fantasy: { saturation: 1.2, vibrance: 1.2 },
    };

    if (grading && gradingPresets[grading]) {
      const preset = gradingPresets[grading];
      
      if (preset.greyscale) {
        image = image.greyscale();
      }
      
      if (preset.saturation) {
        image = image.modulate({
          saturation: preset.saturation,
        });
      }
    }

    return image.toBuffer();
  }

  /**
   * Apply lighting adjustment to frame
   */
  private static async applyLightingAdjustment(
    buffer: Buffer,
    lighting: any
  ): Promise<Buffer> {
    let image = sharp(buffer);

    const intensity = lighting.intensity || 0.5;

    if (lighting.type === 'dramatic') {
      image = image.modulate({
        brightness: 0.8 + (intensity * 0.4),
      }).linear(1.5, 0);
    } else if (lighting.type === 'soft') {
      image = image.modulate({
        brightness: 1.0 + (intensity * 0.2),
      }).blur(0.5);
    } else if (lighting.type === 'harsh') {
      image = image.modulate({
        brightness: 1.1 + (intensity * 0.3),
      }).sharpen(2);
    }

    return image.toBuffer();
  }

  /**
   * Build enhanced prompt with all controls
   */
  private static buildEnhancedPrompt(
    scene: StoryboardScene,
    globalStyle?: any
  ): string {
    let prompt = scene.prompt;

    // Add lighting controls
    if (scene.lighting) {
      prompt += `, \${scene.lighting.type} lighting`;
      if (scene.lighting.direction) {
        prompt += ` from \${scene.lighting.direction}`;
      }
    }

    // Add camera controls
    if (scene.camera) {
      prompt += `, \${scene.camera.angle} camera angle`;
      if (scene.camera.movement && scene.camera.movement !== 'static') {
        prompt += `, \${scene.camera.movement} camera movement`;
      }
    }

    // Add composition
    if (scene.composition) {
      prompt += `, \${scene.composition.framing} shot`;
    }

    // Add effects
    if (scene.effects) {
      if (scene.effects.colorGrading) {
        prompt += `, \${scene.effects.colorGrading} color grading`;
      }
      if (scene.effects.mood) {
        prompt += `, \${scene.effects.mood} mood`;
      }
      if (scene.effects.weather) {
        prompt += `, \${scene.effects.weather} weather`;
      }
      if (scene.effects.timeOfDay) {
        prompt += `, \${scene.effects.timeOfDay}`;
      }
    }

    // Add global cinematic style
    if (globalStyle?.cinematicStyle) {
      prompt += `, \${globalStyle.cinematicStyle} cinematic style`;
    }

    return prompt;
  }

  /**
   * Generate scene with consistency
   */
  private static async generateSceneWithConsistency(
    jobId: string,
    prompt: string,
    model: string,
    options: any,
    storyboardId: string
  ): Promise<void> {
    try {
      // Generate video
      const result = await videoGenerationService.generateVideo({
        prompt,
        model,
        ...options,
      });

      // Update job
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
        },
      });

      logger.info(`Scene generation started for job \${jobId}`);
    } catch (error: any) {
      logger.error(`Scene generation failed for job \${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Wait for scene completion
   */
  private static async waitForSceneCompletion(
    jobId: string,
    timeout: number = 300000
  ): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds

    while (Date.now() - startTime < timeout) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });

      if (job?.status === 'COMPLETED') {
        return;
      } else if (job?.status === 'FAILED') {
        throw new Error(`Scene generation failed: \${job.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Scene generation timeout');
  }

  /**
   * Get video duration
   */
  private static async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });
  }

  /**
   * Get storyboard status
   */
  static async getStoryboardStatus(storyboardId: string, userId: string) {
    const storyboard = await prisma.storyboard.findFirst({
      where: { id: storyboardId, userId },
      include: {
        scenes: {
          include: {
            job: true,
          },
          orderBy: {
            sceneIndex: 'asc',
          },
        },
      },
    });

    if (!storyboard) {
      throw new Error('Storyboard not found');
    }

    const completed = storyboard.scenes.filter(s => s.status === 'COMPLETED').length;
    const progress = Math.round((completed / storyboard.totalScenes) * 100);

    return {
      storyboard: {
        id: storyboard.id,
        title: storyboard.title,
        description: storyboard.description,
        status: storyboard.status,
        totalScenes: storyboard.totalScenes,
        completedScenes: completed,
        progress,
      },
      scenes: storyboard.scenes.map(scene => ({
        id: scene.id,
        sceneIndex: scene.sceneIndex,
        prompt: scene.prompt,
        status: scene.status,
        startFrameUrl: scene.startFrameUrl,
        outputUrl: scene.job.outputUrl,
        thumbnailUrl: scene.job.thumbnailUrl,
      })),
    };
  }

  /**
   * Merge all scenes into final video
   */
  static async mergeStoryboard(storyboardId: string, userId: string): Promise<string> {
    try {
      const storyboard = await prisma.storyboard.findFirst({
        where: { id: storyboardId, userId },
        include: {
          scenes: {
            include: { job: true },
            orderBy: { sceneIndex: 'asc' },
          },
        },
      });

      if (!storyboard) {
        throw new Error('Storyboard not found');
      }

      // Get all completed scene videos
      const videoUrls = storyboard.scenes
        .filter(s => s.job.status === 'COMPLETED' && s.job.outputUrl)
        .map(s => s.job.outputUrl!);

      if (videoUrls.length === 0) {
        throw new Error('No completed scenes to merge');
      }

      // Download all videos
      const inputPaths: string[] = [];
      for (let i = 0; i < videoUrls.length; i++) {
        const inputPath = path.join(TEMP_DIR, `\${storyboardId}-scene-\${i}.mp4`);
        const response = await axios.get(videoUrls[i], { responseType: 'stream' });
        const writer = require('fs').createWriteStream(inputPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        inputPaths.push(inputPath);
      }

      // Merge videos
      const outputPath = path.join(TEMP_DIR, `\${storyboardId}-final.mp4`);
      const concatFilePath = path.join(TEMP_DIR, `\${storyboardId}-concat.txt`);
      const concatContent = inputPaths.map(p => `file '\${p}'`).join('\\n');
      await fs.writeFile(concatFilePath, concatContent);

      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(concatFilePath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions(['-c copy'])
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      // Upload final video
      const result = await S3Service.uploadFile(`storyboard-\${storyboardId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      // Update storyboard
      await prisma.storyboard.update({
        where: { id: storyboardId },
        data: {
          finalVideoUrl: result.url,
          status: 'COMPLETED',
        },
      });

      // Cleanup
      for (const path of [...inputPaths, concatFilePath, outputPath]) {
        await fs.unlink(path).catch(() => {});
      }

      logger.info(`Storyboard merged successfully: \${storyboardId}`);
      return result.url;
    } catch (error: any) {
      logger.error('Storyboard merge failed:', error);
      throw new Error(`Failed to merge storyboard: \${error.message}`);
    }
  }

  /**
   * Get user storyboards
   */
  static async getUserStoryboards(userId: string, limit: number = 50) {
    const storyboards = await prisma.storyboard.findMany({
      where: { userId },
      include: {
        _count: {
          select: { scenes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return storyboards;
  }
}

// Initialize on import
StoryboardService.init();

export default StoryboardService;
