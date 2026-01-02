/**
 * Runway ML Gen-4.5 Service - The Filmmaker's Precision Tool
 *
 * Released: December 1, 2025
 * Features:
 * - Advanced camera controls (Truck, Dolly, Pan, Roll, Tilt, Boom)
 * - Multi-Motion Brush (localized motion vectors)
 * - Character Reference (consistent characters across shots)
 * - Physics-aware generation (weight, momentum, fluid dynamics)
 * - 1247 Elo score (global text-to-video benchmark leader)
 * - Director ecosystem integration
 *
 * Architecture: Physics-Enhanced Diffusion Transformer (DiT+)
 * Differentiator: Professional creative tools, VFX workflows, physical realism
 */

import axios from 'axios';
import { prisma } from '../../config/database';
import logger from '../logger.service';
import { io } from '../../app';

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';

export class RunwayService {
  private static api = axios.create({
    baseURL: RUNWAY_API_BASE,
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  /**
   * Generate video with Gen-2
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      resolution?: '720p' | '1080p' | '4k';
      style?: string;
      imagePrompt?: string;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const response = await this.api.post('/gen2/generate', {
        prompt,
        duration: options?.duration || 4,
        resolution: options?.resolution || '1080p',
        style: options?.style,
        image_prompt: options?.imagePrompt,
      });

      const taskId = response.data.id;

      // Poll for completion
      const videoUrl = await this.pollTask(taskId, jobId);

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: videoUrl,
        },
      });

      return videoUrl;
    } catch (error: any) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });
      throw error;
    }
  }

  /**
   * Image to video
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt?: string,
    options?: {
      duration?: number;
      motion?: number;
      seed?: number;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/gen2/image-to-video', {
        image_url: imageUrl,
        prompt: prompt || 'Animate this image with natural motion',
        duration: options?.duration || 4,
        motion: options?.motion || 5,
        seed: options?.seed,
      });

      const videoUrl = await this.pollTask(response.data.id, jobId);
      return videoUrl;
    } catch (error: any) {
      logger.error('Runway image-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Video to video - Transform existing video
   */
  static async videoToVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      style?: string;
      strength?: number;
      seed?: number;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/gen2/video-to-video', {
        video_url: videoUrl,
        prompt,
        style: options?.style,
        strength: options?.strength || 0.7,
        seed: options?.seed,
      });

      const transformedUrl = await this.pollTask(response.data.id, jobId);
      return transformedUrl;
    } catch (error: any) {
      logger.error('Runway video-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate video with Gen-3 Alpha (latest model)
   */
  static async generateVideoGen3(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      ratio?: '16:9' | '9:16' | '1:1';
      seed?: number;
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const response = await this.api.post('/gen3/generate', {
        prompt,
        duration: options?.duration || 5,
        aspect_ratio: options?.ratio || '16:9',
        seed: options?.seed,
      });

      const videoUrl = await this.pollTask(response.data.id, jobId);
      return videoUrl;
    } catch (error: any) {
      logger.error('Runway Gen-3 failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Upscale video to higher resolution
   */
  static async upscaleVideo(
    jobId: string,
    videoUrl: string,
    targetResolution: '1080p' | '4k' = '4k'
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/upscale', {
        video_url: videoUrl,
        target_resolution: targetResolution,
      });

      const upscaledUrl = await this.pollTask(response.data.id, jobId);
      return upscaledUrl;
    } catch (error: any) {
      logger.error('Runway upscale failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Inpaint video - Remove or replace objects
   */
  static async inpaintVideo(
    jobId: string,
    videoUrl: string,
    maskUrl: string,
    prompt: string
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/inpaint', {
        video_url: videoUrl,
        mask_url: maskUrl,
        prompt,
      });

      const inpaintedUrl = await this.pollTask(response.data.id, jobId);
      return inpaintedUrl;
    } catch (error: any) {
      logger.error('Runway inpaint failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate video with Gen-4.5 (latest flagship model)
   * Physics-aware with advanced camera controls
   */
  static async generateVideoGen4(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // Up to 10s
      resolution?: '720p' | '1080p';
      cameraControl?: {
        type: 'truck' | 'dolly' | 'pan' | 'roll' | 'tilt' | 'boom' | 'static';
        intensity?: number; // 0-10
        direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out' | 'clockwise' | 'counterclockwise';
        speed?: 'slow' | 'medium' | 'fast';
      };
      characterReference?: string; // Character sheet URL
      physicsMode?: 'realistic' | 'cinematic'; // Realistic for physics accuracy
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with Runway Gen-4.5 (1247 Elo leader)...'
      });

      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const response = await this.api.post('/gen4.5/generate', {
        prompt,
        duration: options?.duration || 10,
        resolution: options?.resolution || '1080p',
        camera_control: options?.cameraControl ? {
          type: options.cameraControl.type,
          intensity: options.cameraControl.intensity || 5,
          direction: options.cameraControl.direction,
          speed: options.cameraControl.speed || 'medium',
        } : undefined,
        character_reference: options?.characterReference,
        physics_mode: options?.physicsMode || 'realistic',
        seed: options?.seed,
      });

      const videoUrl = await this.pollTask(response.data.id, jobId);
      return videoUrl;
    } catch (error: any) {
      logger.error('Runway Gen-4.5 failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Image to video with Gen-4.5 and Multi-Motion Brush
   * Allows painting specific areas with independent motion vectors
   */
  static async imageToVideoGen4(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      motionBrushes?: Array<{
        region: string; // Base64 encoded mask defining the region
        motion: {
          direction: 'left' | 'right' | 'up' | 'down' | 'zoom-in' | 'zoom-out' | 'rotate-cw' | 'rotate-ccw';
          speed: number; // 0-10
        };
      }>;
      cameraControl?: {
        type: 'truck' | 'dolly' | 'pan' | 'roll' | 'tilt' | 'boom' | 'static';
        intensity?: number;
      };
      characterReference?: string;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating with Multi-Motion Brush control...'
      });

      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/gen4.5/image-to-video', {
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 10,
        motion_brushes: options?.motionBrushes,
        camera_control: options?.cameraControl,
        character_reference: options?.characterReference,
      });

      const videoUrl = await this.pollTask(response.data.id, jobId);
      return videoUrl;
    } catch (error: any) {
      logger.error('Runway Gen-4.5 image-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create character reference sheet
   * For consistent character appearance across multiple generations
   */
  static async createCharacterReference(
    name: string,
    referenceImages: string[], // Multiple angles/poses
    options?: {
      description?: string;
      style?: string;
    }
  ): Promise<{ characterId: string; referenceUrl: string }> {
    try {
      const response = await this.api.post('/gen4.5/character-references', {
        name,
        reference_images: referenceImages,
        description: options?.description,
        style: options?.style,
      });

      return {
        characterId: response.data.character_id,
        referenceUrl: response.data.reference_url,
      };
    } catch (error: any) {
      logger.error('Runway character reference creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Video to video with Gen-4.5 physics engine
   * Maintains physical realism during transformation
   */
  static async videoToVideoGen4(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      strength?: number; // 0-1
      preservePhysics?: boolean; // Maintain original motion physics
      cameraControl?: {
        type: 'truck' | 'dolly' | 'pan' | 'roll' | 'tilt' | 'boom';
        intensity?: number;
      };
      characterReference?: string;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Transforming video with physics preservation...'
      });

      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 5 },
      });

      const response = await this.api.post('/gen4.5/video-to-video', {
        video_url: videoUrl,
        prompt,
        strength: options?.strength || 0.7,
        preserve_physics: options?.preservePhysics !== false, // Default true
        camera_control: options?.cameraControl,
        character_reference: options?.characterReference,
      });

      const transformedUrl = await this.pollTask(response.data.id, jobId);
      return transformedUrl;
    } catch (error: any) {
      logger.error('Runway Gen-4.5 video-to-video failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Advanced audio generation and syncing
   * Separate generation for traditional NLE workflows
   */
  static async generateAudio(
    videoUrl: string,
    options?: {
      type: 'dialogue' | 'foley' | 'soundtrack' | 'ambient';
      prompt?: string;
      script?: string; // For dialogue
      mood?: string; // For soundtrack
    }
  ): Promise<string> {
    try {
      const response = await this.api.post('/gen4.5/audio', {
        video_url: videoUrl,
        audio_type: options?.type || 'ambient',
        prompt: options?.prompt,
        script: options?.script,
        mood: options?.mood,
      });

      const taskId = response.data.id;

      // Poll for audio completion
      const maxAttempts = 60;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const statusResponse = await this.api.get(`/tasks/${taskId}`);
        const { status, output } = statusResponse.data;

        if (status === 'SUCCEEDED') {
          return output.audio_url;
        }

        if (status === 'FAILED') {
          throw new Error('Runway audio generation failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      throw new Error('Runway audio generation timeout');
    } catch (error: any) {
      logger.error('Runway audio generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get available camera control types for Gen-4.5
   */
  static getCameraControlTypes(): Array<{
    type: string;
    description: string;
    professionalTerm: string;
  }> {
    return [
      { type: 'truck', description: 'Lateral movement (left/right)', professionalTerm: 'Truck Left/Right' },
      { type: 'dolly', description: 'Forward/backward movement', professionalTerm: 'Dolly In/Out' },
      { type: 'pan', description: 'Horizontal rotation', professionalTerm: 'Pan Left/Right' },
      { type: 'tilt', description: 'Vertical rotation', professionalTerm: 'Tilt Up/Down' },
      { type: 'roll', description: 'Rotation around lens axis', professionalTerm: 'Dutch Angle' },
      { type: 'boom', description: 'Vertical movement (up/down)', professionalTerm: 'Boom Up/Down' },
      { type: 'static', description: 'Fixed camera position', professionalTerm: 'Locked-off Shot' },
    ];
  }

  /**
   * Poll task status
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.api.get(`/tasks/${taskId}`);
      const { status, progress, output } = response.data;

      // Update job progress
      await prisma.job.update({
        where: { id: jobId },
        data: { progress: Math.min(progress * 100, 95) },
      });

      if (status === 'SUCCEEDED') {
        return output.url;
      }

      if (status === 'FAILED') {
        throw new Error('Runway generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;
    }

    throw new Error('Runway generation timeout');
  }
}
