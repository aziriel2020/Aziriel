/**
 * FLUX.1 IMAGE GENERATION SERVICE
 *
 * Production-ready static image synthesis
 * - FLUX.1 Pro (16s, photorealistic, text rendering)
 * - FLUX Schnell (1s, real-time, stickers/memes)
 * - Multi-reference consistency (character LoRA)
 * - Brand asset generation
 */

import axios from 'axios';
import { prisma } from '../../config/database';
import { StorageService } from '../core/storage.service';

export interface FluxGenerationRequest {
  userId: string;
  prompt: string;
  model: 'pro' | 'schnell' | 'dev';
  settings?: {
    width?: number;
    height?: number;
    numImages?: number;
    guidance?: number; // 1-20
    seed?: number;
    outputFormat?: 'png' | 'jpeg' | 'webp';
  };
  references?: {
    characterImages?: string[]; // URLs for LoRA training
    styleImage?: string;
    brandAssets?: string[];
  };
}

export interface FluxResult {
  imageUrl: string;
  width: number;
  height: number;
  seed: number;
  cost: number;
  generationTime: number;
}

export class FluxImageService {
  /**
   * Generate image with FLUX.1 Pro
   * Best for: Marketing assets, profile pictures, detailed scenes
   */
  static async generateWithPro(data: {
    prompt: string;
    userId: string;
    settings?: FluxGenerationRequest['settings'];
  }): Promise<FluxResult> {
    const startTime = Date.now();

    try {
      // PRODUCTION: Call fal.ai FLUX.1 Pro endpoint
      const response = await axios.post(
        'https://fal.run/fal-ai/flux-pro/v1.1',
        {
          prompt: data.prompt,
          image_size: {
            width: data.settings?.width || 1024,
            height: data.settings?.height || 1024,
          },
          num_images: data.settings?.numImages || 1,
          guidance_scale: data.settings?.guidance || 3.5,
          seed: data.settings?.seed,
          output_format: data.settings?.outputFormat || 'png',
        },
        {
          headers: {
            'Authorization': `Key ${process.env.FAL_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[FLUX-PRO] Generation started:', response.data);

      // Poll for result
      const result = await this.pollFalResult(response.data.request_id);

      // Upload to S3
      const imageBuffer = await this.downloadImage(result.images[0].url);
      const uploadResult = await StorageService.uploadFile(
        imageBuffer,
        `flux-pro-${Date.now()}.png`,
        {
          contentType: 'image/png',
          userId: data.userId,
          folder: 'generated-images',
        }
      );

      const generationTime = Date.now() - startTime;

      return {
        imageUrl: uploadResult.url,
        width: result.images[0].width,
        height: result.images[0].height,
        seed: result.seed,
        cost: 0.05, // $0.05 per image
        generationTime,
      };
    } catch (error: any) {
      console.error('[FLUX-PRO] Error:', error.message);
      throw new Error(`FLUX Pro generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image with FLUX Schnell (fast)
   * Best for: Real-time stickers, reactions, quick iterations
   */
  static async generateWithSchnell(data: {
    prompt: string;
    userId: string;
    settings?: FluxGenerationRequest['settings'];
  }): Promise<FluxResult> {
    const startTime = Date.now();

    try {
      // PRODUCTION: Call Replicate FLUX Schnell
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'black-forest-labs/flux-schnell',
          input: {
            prompt: data.prompt,
            width: data.settings?.width || 1024,
            height: data.settings?.height || 1024,
            num_outputs: data.settings?.numImages || 1,
            output_format: data.settings?.outputFormat || 'png',
            seed: data.settings?.seed,
          },
        },
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[FLUX-SCHNELL] Generation started:', response.data.id);

      // Schnell is fast - poll with shorter intervals
      const result = await this.pollReplicateResult(response.data.id);

      // Upload to S3
      const imageBuffer = await this.downloadImage(result.output[0]);
      const uploadResult = await StorageService.uploadFile(
        imageBuffer,
        `flux-schnell-${Date.now()}.png`,
        {
          contentType: 'image/png',
          userId: data.userId,
          folder: 'generated-images',
        }
      );

      const generationTime = Date.now() - startTime;

      return {
        imageUrl: uploadResult.url,
        width: data.settings?.width || 1024,
        height: data.settings?.height || 1024,
        seed: data.settings?.seed || 0,
        cost: 0.01, // $0.01 per image
        generationTime,
      };
    } catch (error: any) {
      console.error('[FLUX-SCHNELL] Error:', error.message);
      throw new Error(`FLUX Schnell generation failed: ${error.message}`);
    }
  }

  /**
   * Generate with character consistency (LoRA)
   * Train on 10 reference images for consistent character
   */
  static async generateWithCharacter(data: {
    prompt: string;
    userId: string;
    characterId: string; // Pre-trained LoRA ID
    settings?: FluxGenerationRequest['settings'];
  }): Promise<FluxResult> {
    try {
      // PRODUCTION: Use LoRA-trained FLUX model
      const response = await axios.post(
        'https://fal.run/fal-ai/flux-lora',
        {
          prompt: `${data.prompt}, [character:${data.characterId}]`,
          lora_path: `characters/${data.characterId}`,
          lora_scale: 0.8,
          image_size: {
            width: data.settings?.width || 1024,
            height: data.settings?.height || 1024,
          },
        },
        {
          headers: {
            'Authorization': `Key ${process.env.FAL_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await this.pollFalResult(response.data.request_id);

      const imageBuffer = await this.downloadImage(result.images[0].url);
      const uploadResult = await StorageService.uploadFile(
        imageBuffer,
        `flux-character-${Date.now()}.png`,
        {
          contentType: 'image/png',
          userId: data.userId,
          folder: 'generated-images',
        }
      );

      return {
        imageUrl: uploadResult.url,
        width: result.images[0].width,
        height: result.images[0].height,
        seed: result.seed,
        cost: 0.05,
        generationTime: 16000,
      };
    } catch (error: any) {
      console.error('[FLUX-CHARACTER] Error:', error.message);
      throw new Error(`Character generation failed: ${error.message}`);
    }
  }

  /**
   * Train character LoRA from reference images
   */
  static async trainCharacterLoRA(data: {
    userId: string;
    characterName: string;
    referenceImages: string[]; // 5-10 images
  }): Promise<{ characterId: string; trainingTime: number }> {
    if (data.referenceImages.length < 5) {
      throw new Error('Minimum 5 reference images required');
    }

    if (data.referenceImages.length > 10) {
      throw new Error('Maximum 10 reference images allowed');
    }

    try {
      const startTime = Date.now();

      // PRODUCTION: Train LoRA using fal.ai or Replicate
      const response = await axios.post(
        'https://api.replicate.com/v1/trainings',
        {
          version: 'ostris/flux-dev-lora-trainer',
          input: {
            input_images: data.referenceImages.join('|'),
            trigger_word: data.characterName.toLowerCase().replace(/\s+/g, '_'),
            steps: 1000,
            learning_rate: 0.0004,
          },
          destination: `${data.userId}/${data.characterName}`,
        },
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[LORA-TRAINING] Started:', response.data.id);

      // Training takes ~10 minutes
      const characterId = `char_${data.userId}_${Date.now()}`;

      // Store in database
      await prisma.$executeRaw`
        INSERT INTO character_loras (id, user_id, name, reference_images, training_id, status, created_at)
        VALUES (${characterId}, ${data.userId}, ${data.characterName},
                ${JSON.stringify(data.referenceImages)}, ${response.data.id}, 'training', NOW())
      `;

      return {
        characterId,
        trainingTime: 600000, // 10 minutes estimated
      };
    } catch (error: any) {
      console.error('[LORA-TRAINING] Error:', error.message);
      throw new Error(`LoRA training failed: ${error.message}`);
    }
  }

  /**
   * Real-time "Typing-to-Image"
   * Image evolves as user types (for stickers/memes)
   */
  static async typingToImage(data: {
    partialPrompt: string;
    userId: string;
  }): Promise<FluxResult> {
    // Use Schnell for speed
    return this.generateWithSchnell({
      prompt: data.partialPrompt,
      userId: data.userId,
      settings: {
        width: 512,
        height: 512,
      },
    });
  }

  /**
   * Poll fal.ai for result
   */
  private static async pollFalResult(requestId: string): Promise<any> {
    const maxAttempts = 40; // ~3 minutes for Pro
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://fal.run/fal-ai/flux-pro/requests/${requestId}`,
          {
            headers: {
              'Authorization': `Key ${process.env.FAL_KEY}`,
            },
          }
        );

        if (response.data.status === 'COMPLETED') {
          return response.data;
        }

        if (response.data.status === 'FAILED') {
          throw new Error('Generation failed');
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        attempts++;
      }
    }

    throw new Error('Generation timeout');
  }

  /**
   * Poll Replicate for result
   */
  private static async pollReplicateResult(predictionId: string): Promise<any> {
    const maxAttempts = 20; // Schnell is fast
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            },
          }
        );

        if (response.data.status === 'succeeded') {
          return response.data;
        }

        if (response.data.status === 'failed') {
          throw new Error('Generation failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        attempts++;
      }
    }

    throw new Error('Generation timeout');
  }

  /**
   * Download image from URL
   */
  private static async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  /**
   * Orchestrate image generation (select best model)
   */
  static async orchestrateGeneration(
    request: FluxGenerationRequest
  ): Promise<FluxResult> {
    // Select model based on requirements
    if (request.model === 'pro') {
      return this.generateWithPro({
        prompt: request.prompt,
        userId: request.userId,
        settings: request.settings,
      });
    }

    if (request.model === 'schnell') {
      return this.generateWithSchnell({
        prompt: request.prompt,
        userId: request.userId,
        settings: request.settings,
      });
    }

    // Default to Pro for quality
    return this.generateWithPro({
      prompt: request.prompt,
      userId: request.userId,
      settings: request.settings,
    });
  }
}
