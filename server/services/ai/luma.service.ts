import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * Luma Dream Machine (Ray 3) Service - The 3D Native Editor
 *
 * Released: Ray 3 Modify - December 18, 2025
 * Features:
 * - Modify with Instructions (natural language video editing)
 * - 3D-native generation from NeRF/3D scanning background
 * - Geometric consistency (respects occlusion and lighting)
 * - Modify Video API (automated content remixing)
 * - Reframe (outpainting/resizing for different aspect ratios)
 * - Camera Angle Concepts (cinematic control)
 *
 * Architecture: 3D-aware diffusion with NeRF integration
 * Differentiator: Geometric accuracy, 3D scene understanding, editing precision
 */
export class LumaService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://api.lumalabs.ai/v1',
    headers: {
      'Authorization': `Bearer ${process.env.LUMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  /**
   * Generate video with Ray 3
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number; // Up to 10s
      resolution?: '720p' | '1080p';
      aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
      cameraAngle?: 'low' | 'high' | 'dutch' | 'eye-level' | 'birds-eye' | 'worms-eye';
      cameraMovement?: 'static' | 'pan' | 'tilt' | 'dolly' | 'orbit' | 'crane';
      seed?: number;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with Luma Ray 3 (3D-native engine)...'
      });

      const response = await this.api.post('/ray3/generate', {
        model: 'ray-3',
        prompt,
        duration: options?.duration || 10,
        resolution: options?.resolution || '1080p',
        aspect_ratio: options?.aspectRatio || '16:9',
        camera_angle: options?.cameraAngle,
        camera_movement: options?.cameraMovement,
        seed: options?.seed,
      });

      const taskId = response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Luma Ray 3 generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Modify with Instructions - Revolutionary natural language video editing
   * Re-renders the scene's geometry, respecting occlusion and lighting
   */
  static async modifyWithInstructions(
    jobId: string,
    videoUrl: string,
    instruction: string, // e.g., "Change the car to a red Ferrari", "Make it rain"
    options?: {
      strength?: number; // 0-1, how much to change
      preserveMotion?: boolean; // Keep original motion
      preserveCharacters?: boolean; // Keep people/characters
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: `Modifying video: "${instruction}" (3D-aware rendering)...`
      });

      const response = await this.api.post('/ray3/modify', {
        model: 'ray-3-modify',
        video_url: videoUrl,
        instruction,
        strength: options?.strength || 0.7,
        preserve_motion: options?.preserveMotion !== false,
        preserve_characters: options?.preserveCharacters !== false,
      });

      const taskId = response.data.id;
      const modifiedUrl = await this.pollTask(taskId, jobId);

      return modifiedUrl;
    } catch (error: any) {
      throw new Error(`Luma Modify failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Modify Video API - Programmatic remixing for automated content creation
   * Targets the "slop" market (mass social media variants)
   */
  static async modifyVideoBatch(
    videoUrl: string,
    modifications: Array<{
      instruction: string;
      outputName: string;
    }>
  ): Promise<Array<{ name: string; videoUrl: string }>> {
    try {
      const results: Array<{ name: string; videoUrl: string }> = [];

      for (const mod of modifications) {
        const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        io.emit('job:update', {
          jobId,
          status: 'processing',
          message: `Batch modification: ${mod.instruction}...`
        });

        const response = await this.api.post('/ray3/modify', {
          model: 'ray-3-modify',
          video_url: videoUrl,
          instruction: mod.instruction,
        });

        const taskId = response.data.id;
        const modifiedUrl = await this.pollTask(taskId, jobId);

        results.push({
          name: mod.outputName,
          videoUrl: modifiedUrl,
        });
      }

      return results;
    } catch (error: any) {
      throw new Error(`Luma batch modification failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Reframe - Outpaint/resize videos for different aspect ratios
   * Maintains 3D consistency when expanding frame
   */
  static async reframe(
    jobId: string,
    videoUrl: string,
    targetAspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '21:9',
    options?: {
      fillPrompt?: string; // What to generate in expanded areas
      seamBlending?: boolean; // Blend seams smoothly
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: `Reframing video to ${targetAspectRatio}...`
      });

      const response = await this.api.post('/ray3/reframe', {
        model: 'ray-3',
        video_url: videoUrl,
        target_aspect_ratio: targetAspectRatio,
        fill_prompt: options?.fillPrompt || 'Continue the scene naturally',
        seam_blending: options?.seamBlending !== false,
      });

      const taskId = response.data.id;
      const reframedUrl = await this.pollTask(taskId, jobId);

      return reframedUrl;
    } catch (error: any) {
      throw new Error(`Luma reframe failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Image to video with 3D understanding
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      duration?: number;
      cameraMovement?: 'static' | 'pan' | 'tilt' | 'dolly' | 'orbit' | 'crane';
      cameraAngle?: 'low' | 'high' | 'dutch' | 'eye-level' | 'birds-eye' | 'worms-eye';
      depth3D?: boolean; // Use 3D depth estimation
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with 3D depth understanding...'
      });

      const response = await this.api.post('/ray3/image-to-video', {
        model: 'ray-3',
        image_url: imageUrl,
        prompt,
        duration: options?.duration || 10,
        camera_movement: options?.cameraMovement || 'static',
        camera_angle: options?.cameraAngle || 'eye-level',
        use_3d_depth: options?.depth3D !== false, // Default true for Luma
      });

      const taskId = response.data.id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Luma image-to-video failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Video to video with geometric preservation
   */
  static async videoToVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      strength?: number;
      preserveGeometry?: boolean; // Maintain 3D structure
      preserveLighting?: boolean; // Maintain lighting
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Transforming video with geometric consistency...'
      });

      const response = await this.api.post('/ray3/video-to-video', {
        model: 'ray-3',
        video_url: videoUrl,
        prompt,
        strength: options?.strength || 0.7,
        preserve_geometry: options?.preserveGeometry !== false,
        preserve_lighting: options?.preserveLighting !== false,
      });

      const taskId = response.data.id;
      const transformedUrl = await this.pollTask(taskId, jobId);

      return transformedUrl;
    } catch (error: any) {
      throw new Error(`Luma video-to-video failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get available camera concepts
   */
  static getCameraConcepts(): {
    angles: string[];
    movements: string[];
    cinematic: Array<{ name: string; description: string }>;
  } {
    return {
      angles: ['low', 'high', 'dutch', 'eye-level', 'birds-eye', 'worms-eye'],
      movements: ['static', 'pan', 'tilt', 'dolly', 'orbit', 'crane'],
      cinematic: [
        { name: 'Hero Shot', description: 'Low angle, slight dolly in' },
        { name: 'Establishing', description: 'High angle, static or slow pan' },
        { name: 'Dramatic Reveal', description: 'Crane up from low to high' },
        { name: 'Intimate', description: 'Eye-level, static or slight orbit' },
        { name: 'Action', description: 'Dutch angle, fast pan/tilt' },
      ],
    };
  }

  /**
   * Poll task until completion
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 120;
    const pollInterval = 3000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await this.api.get(`/ray3/tasks/${taskId}`);
      const { state, output, error } = response.data;

      if (state === 'completed' || state === 'succeeded') {
        return output.video_url || output.url;
      } else if (state === 'failed') {
        throw new Error(`Luma task failed: ${error || 'Unknown error'}`);
      }

      const progress = (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progress, 95) });
    }

    throw new Error('Luma generation timed out');
  }
}
