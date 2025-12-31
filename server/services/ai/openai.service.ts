/**
 * OpenAI Service - GPT-4, DALL-E, Sora Integration
 */

import OpenAI from 'openai';
import { prisma } from '../../config/database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export class OpenAIService {
  /**
   * Generate text with GPT-4
   */
  static async generateText(prompt: string, model = 'gpt-4-turbo-preview'): Promise<string> {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    return response.choices[0].message.content || '';
  }

  /**
   * Generate image with DALL-E 3
   */
  static async generateImage(
    jobId: string,
    prompt: string,
    options?: {
      size?: '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        style: options?.style || 'vivid',
      });

      const imageUrl = response.data[0].url || '';

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputUrl: imageUrl,
        },
      });

      return imageUrl;
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
   * Generate video with Sora (when available)
   */
  static async generateVideo(
    jobId: string,
    prompt: string,
    options?: {
      duration?: number;
      resolution?: '1080p' | '4k';
    }
  ): Promise<string> {
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 20 },
      });

      // Note: Sora API not yet publicly available
      // This is a placeholder for future implementation
      throw new Error('Sora API not yet available. Coming soon!');

      // Future implementation:
      // const response = await openai.videos.generate({
      //   model: 'sora-1.0',
      //   prompt,
      //   duration: options?.duration || 10,
      //   resolution: options?.resolution || '1080p',
      // });
      //
      // return response.data[0].url;
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
   * Generate enhanced prompt using GPT-4
   */
  static async enhancePrompt(originalPrompt: string): Promise<string> {
    const systemPrompt = `You are an expert AI prompt engineer. Enhance the following prompt to be more detailed,
    vivid, and effective for AI image/video generation. Keep it concise but descriptive.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: originalPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices[0].message.content || originalPrompt;
  }

  /**
   * Analyze image with GPT-4 Vision
   */
  static async analyzeImage(imageUrl: string, question?: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: question || 'Describe this image in detail.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || '';
  }

  /**
   * Generate text-to-speech
   */
  static async generateSpeech(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'
  ): Promise<Buffer> {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice,
      input: text,
    });

    return Buffer.from(await mp3.arrayBuffer());
  }

  /**
   * Transcribe audio
   */
  static async transcribeAudio(audioFile: File): Promise<string> {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    return response.text;
  }
}
