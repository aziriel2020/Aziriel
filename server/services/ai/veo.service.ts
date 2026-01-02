import axios, { AxiosInstance } from 'axios';
import { io } from '../../app';

/**
 * Google Veo 3.1 Service - The Enterprise & Ecosystem Integration
 *
 * Released: October 15, 2025
 * Features:
 * - Ingredient-based control (up to 3 references)
 * - Video extension (>60s via chaining)
 * - Masked editing (remove/replace objects)
 * - Prompt enhancement via Gemini 2.5 Flash
 * - Fast & High Quality variants
 * - Native audio generation
 * - Up to 4K resolution
 *
 * Architecture: Compressed Spatiotemporal LDM
 * Differentiator: Enterprise integration, brand safety, Vertex AI
 */
export class VeoService {
  private static api: AxiosInstance = axios.create({
    baseURL: 'https://aiplatform.googleapis.com/v1',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 600000,
  });

  private static geminiApi: AxiosInstance = axios.create({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    timeout: 30000,
  });

  /**
   * Generate video from text with Veo 3.1
   * Automatically enhances prompt via Gemini if enabled
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      quality?: 'fast' | 'high'; // Fast for low latency, High for quality
      duration?: number; // 1-8s per generation
      resolution?: '720p' | '1080p' | '4k';
      fps?: 24 | 30 | 60;
      enhancePrompt?: boolean; // Use Gemini to enhance prompt
      withAudio?: boolean;
      safetyFilters?: 'none' | 'standard' | 'strict';
      allowPersonGeneration?: boolean;
      watermark?: boolean; // SynthID watermarking
      seed?: number;
    }
  ): Promise<string> {
    try {
      // Enhance prompt with Gemini if requested
      let finalPrompt = prompt;
      if (options?.enhancePrompt !== false) {
        finalPrompt = await this.enhancePromptWithGemini(prompt);
        io.emit('job:update', {
          jobId,
          status: 'processing',
          message: `Enhanced prompt: "${finalPrompt.substring(0, 100)}..."`
        });
      }

      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating video with Veo 3.1...'
      });

      const model = options?.quality === 'fast' ? 'veo-3.1-fast-generate-001' : 'veo-3.1-generate-001';

      const response = await this.api.post('/projects/*/locations/*/publishers/google/models/veo:predict', {
        instances: [{
          prompt: finalPrompt,
        }],
        parameters: {
          model,
          duration: options?.duration || 8,
          resolution: options?.resolution || '1080p',
          fps: options?.fps || 30,
          generate_audio: options?.withAudio !== false,
          safety_filter_level: options?.safetyFilters || 'standard',
          person_generation: options?.allowPersonGeneration || false,
          add_watermark: options?.watermark !== false, // Default true for safety
          seed: options?.seed,
        },
      });

      const taskId = response.data.predictions[0].task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Veo 3.1 generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate video with Ingredients (up to 3 reference images)
   * Allows specification of Character + Object + Style
   */
  static async generateWithIngredients(
    jobId: string,
    prompt: string,
    ingredients: {
      character?: string; // Image URL
      object?: string; // Image URL
      style?: string; // Image URL or style name
    },
    options?: {
      quality?: 'fast' | 'high';
      duration?: number;
      resolution?: '720p' | '1080p' | '4k';
      withAudio?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Generating with ingredient-based composition...'
      });

      const model = options?.quality === 'fast' ? 'veo-3.1-fast-generate-001' : 'veo-3.1-generate-001';

      const response = await this.api.post('/projects/*/locations/*/publishers/google/models/veo:predict', {
        instances: [{
          prompt,
          ingredients: {
            character_reference: ingredients.character,
            object_reference: ingredients.object,
            style_reference: ingredients.style,
          },
        }],
        parameters: {
          model,
          duration: options?.duration || 8,
          resolution: options?.resolution || '1080p',
          generate_audio: options?.withAudio !== false,
        },
      });

      const taskId = response.data.predictions[0].task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Veo ingredients generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Extend video forward in time
   * Can chain multiple extensions to reach >60s
   */
  static async extendVideo(
    jobId: string,
    videoUrl: string,
    prompt: string,
    options?: {
      duration?: number; // How many seconds to add
      iterations?: number; // How many times to extend (for >60s)
      quality?: 'fast' | 'high';
      withAudio?: boolean;
    }
  ): Promise<string> {
    try {
      let currentVideoUrl = videoUrl;
      const iterations = options?.iterations || 1;
      const extensionDuration = options?.duration || 8;

      for (let i = 0; i < iterations; i++) {
        io.emit('job:update', {
          jobId,
          status: 'processing',
          message: `Extending video (iteration ${i + 1}/${iterations})...`
        });

        const response = await this.api.post('/projects/*/locations/*/publishers/google/models/veo:predict', {
          instances: [{
            video_url: currentVideoUrl,
            prompt: prompt + ` (continuation ${i + 1})`,
            mode: 'extend',
          }],
          parameters: {
            model: options?.quality === 'fast' ? 'veo-3.1-fast-generate-001' : 'veo-3.1-generate-001',
            extension_duration: extensionDuration,
            generate_audio: options?.withAudio !== false,
          },
        });

        const taskId = response.data.predictions[0].task_id;
        currentVideoUrl = await this.pollTask(taskId, jobId);
      }

      return currentVideoUrl;
    } catch (error: any) {
      throw new Error(`Veo video extension failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Edit video with mask (remove or replace objects)
   * Maintains scene consistency while altering specific regions
   */
  static async editVideoWithMask(
    jobId: string,
    videoUrl: string,
    maskUrl: string, // Binary mask image (white = edit region)
    prompt: string,
    options?: {
      quality?: 'fast' | 'high';
      withAudio?: boolean;
    }
  ): Promise<string> {
    try {
      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Editing video with mask (Veo 3.1)...'
      });

      const response = await this.api.post('/projects/*/locations/*/publishers/google/models/veo:predict', {
        instances: [{
          video_url: videoUrl,
          mask_url: maskUrl,
          prompt,
          mode: 'edit',
        }],
        parameters: {
          model: options?.quality === 'fast' ? 'veo-3.1-fast-generate-001' : 'veo-3.1-generate-001',
          generate_audio: options?.withAudio !== false,
        },
      });

      const taskId = response.data.predictions[0].task_id;
      const editedUrl = await this.pollTask(taskId, jobId);

      return editedUrl;
    } catch (error: any) {
      throw new Error(`Veo masked editing failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Image to video with Veo 3.1
   */
  static async imageToVideo(
    jobId: string,
    imageUrl: string,
    prompt: string,
    options?: {
      quality?: 'fast' | 'high';
      duration?: number;
      resolution?: '720p' | '1080p' | '4k';
      withAudio?: boolean;
      enhancePrompt?: boolean;
    }
  ): Promise<string> {
    try {
      let finalPrompt = prompt;
      if (options?.enhancePrompt !== false) {
        finalPrompt = await this.enhancePromptWithGemini(prompt);
      }

      io.emit('job:update', {
        jobId,
        status: 'processing',
        message: 'Animating image with Veo 3.1...'
      });

      const model = options?.quality === 'fast' ? 'veo-3.1-fast-generate-001' : 'veo-3.1-generate-001';

      const response = await this.api.post('/projects/*/locations/*/publishers/google/models/veo:predict', {
        instances: [{
          image_url: imageUrl,
          prompt: finalPrompt,
        }],
        parameters: {
          model,
          duration: options?.duration || 8,
          resolution: options?.resolution || '1080p',
          generate_audio: options?.withAudio !== false,
        },
      });

      const taskId = response.data.predictions[0].task_id;
      const videoUrl = await this.pollTask(taskId, jobId);

      return videoUrl;
    } catch (error: any) {
      throw new Error(`Veo image-to-video failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Enhance prompt using Gemini 2.5 Flash
   * Expands simple instructions into detailed cinematic descriptions
   */
  private static async enhancePromptWithGemini(prompt: string): Promise<string> {
    try {
      const response = await this.geminiApi.post(
        `/models/gemini-2.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are a cinematic video prompt engineer. Enhance the following video prompt into a detailed, visually descriptive prompt optimized for Google Veo 3.1. Include:
- Camera angles and movement
- Lighting and atmosphere
- Color palette
- Timing and pacing
- Sound design cues

Original prompt: "${prompt}"

Enhanced prompt (respond with ONLY the enhanced prompt, no explanations):`,
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }
      );

      const enhanced = response.data.candidates[0].content.parts[0].text.trim();
      return enhanced || prompt; // Fallback to original if enhancement fails
    } catch (error: any) {
      console.error('Prompt enhancement failed, using original:', error.message);
      return prompt;
    }
  }

  /**
   * Poll task until completion
   */
  private static async pollTask(taskId: string, jobId: string): Promise<string> {
    const maxAttempts = 120;
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const response = await this.api.get(`/projects/*/locations/*/operations/${taskId}`);
      const { done, response: result, error } = response.data;

      if (done) {
        if (error) {
          throw new Error(`Veo task failed: ${error.message}`);
        }
        return result.video_url;
      }

      const progress = response.data.metadata?.progressPercent || (attempt / maxAttempts) * 100;
      io.emit('job:progress', { jobId, progress: Math.min(progress, 95) });
    }

    throw new Error('Veo generation timed out');
  }
}
