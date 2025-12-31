/**
 * Anthropic Service - Claude Integration
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export class AnthropicService {
  /**
   * Generate text with Claude
   */
  static async generateText(
    prompt: string,
    options?: {
      model?: 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229';
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const message = await anthropic.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1.0,
      system: options?.systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  /**
   * Generate streaming text with Claude
   */
  static async *generateTextStream(
    prompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): AsyncGenerator<string, void, unknown> {
    const stream = await anthropic.messages.stream({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: options?.systemPrompt,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }

  /**
   * Analyze image with Claude Vision
   */
  static async analyzeImage(
    imageUrl: string,
    question?: string,
    options?: {
      model?: string;
      maxTokens?: number;
    }
  ): Promise<string> {
    const message = await anthropic.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: question || 'Please describe this image in detail.',
            },
          ],
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  /**
   * Enhance prompt using Claude
   */
  static async enhancePrompt(originalPrompt: string): Promise<string> {
    const systemPrompt = `You are an expert AI prompt engineer specializing in creative image and video generation.
    Enhance prompts to be more vivid, detailed, and effective while maintaining the core intent.
    Add cinematic details, lighting, mood, and technical specifications when appropriate.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Enhance this prompt for AI generation: "${originalPrompt}"`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : originalPrompt;
  }

  /**
   * Generate creative script/storyboard
   */
  static async generateScript(
    concept: string,
    options?: {
      format?: 'screenplay' | 'storyboard' | 'shot-list';
      duration?: number;
    }
  ): Promise<string> {
    const formatDescriptions = {
      screenplay: 'traditional screenplay format with scene headings, action, and dialogue',
      storyboard: 'visual storyboard descriptions with shot-by-shot breakdowns',
      'shot-list': 'technical shot list with camera angles, movements, and framing',
    };

    const format = options?.format || 'storyboard';
    const systemPrompt = `You are an expert filmmaker and cinematographer. Generate a detailed
    ${formatDescriptions[format]} for the given concept. Include technical details like
    camera angles, lighting, composition, and pacing.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.9,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a ${format} for: ${concept}\nDuration: ${options?.duration || 30} seconds`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  /**
   * Generate creative variations of a prompt
   */
  static async generateVariations(prompt: string, count = 3): Promise<string[]> {
    const systemPrompt = `You are a creative AI assistant. Generate ${count} unique variations of the given prompt,
    each with a different creative angle, style, or interpretation. Return only the variations, one per line.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 1.0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '';
    return text.split('\n').filter((line) => line.trim().length > 0);
  }

  /**
   * Analyze generation job and suggest improvements
   */
  static async analyzeJob(jobId: string): Promise<{
    quality: number;
    suggestions: string[];
    enhancedPrompt?: string;
  }> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const analysisPrompt = `Analyze this AI generation job and provide feedback:

    Prompt: ${job.prompt}
    Type: ${job.type}
    Status: ${job.status}
    ${job.outputUrl ? `Output: ${job.outputUrl}` : ''}

    Provide:
    1. Quality score (0-100)
    2. List of specific improvement suggestions
    3. An enhanced version of the prompt`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '';

    // Parse response (simple parsing - could be enhanced)
    const qualityMatch = text.match(/quality score[:\s]+(\d+)/i);
    const quality = qualityMatch ? parseInt(qualityMatch[1]) : 75;

    const suggestions = text
      .split('\n')
      .filter((line) => line.match(/^[\d.-]/))
      .map((line) => line.replace(/^[\d.-]\s*/, ''));

    return {
      quality,
      suggestions: suggestions.length > 0 ? suggestions : ['Continue with current approach'],
      enhancedPrompt: job.prompt,
    };
  }
}
