/**
 * Google Service - Gemini Integration
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { prisma } from '../../config/database';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export class GoogleService {
  /**
   * Generate text with Gemini Pro
   */
  static async generateText(
    prompt: string,
    options?: {
      model?: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-pro';
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: options?.model || 'gemini-1.5-pro',
      safetySettings,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 8192,
      },
    });

    return result.response.text();
  }

  /**
   * Generate streaming text with Gemini
   */
  static async *generateTextStream(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
    }
  ): AsyncGenerator<string, void, unknown> {
    const model = genAI.getGenerativeModel({
      model: options?.model || 'gemini-1.5-pro',
      safetySettings,
    });

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature || 0.7,
      },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  /**
   * Analyze image with Gemini Vision
   */
  static async analyzeImage(
    imageData: string | Buffer,
    question?: string,
    options?: {
      model?: string;
    }
  ): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: options?.model || 'gemini-1.5-pro',
      safetySettings,
    });

    const imageBase64 = Buffer.isBuffer(imageData)
      ? imageData.toString('base64')
      : imageData;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: question || 'Describe this image in detail.' },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    return result.response.text();
  }

  /**
   * Analyze video with Gemini Vision
   */
  static async analyzeVideo(
    videoData: Buffer,
    question?: string
  ): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      safetySettings,
    });

    const videoBase64 = videoData.toString('base64');

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: question || 'Describe this video in detail.' },
            {
              inlineData: {
                mimeType: 'video/mp4',
                data: videoBase64,
              },
            },
          ],
        },
      ],
    });

    return result.response.text();
  }

  /**
   * Enhance prompt using Gemini
   */
  static async enhancePrompt(originalPrompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      safetySettings,
    });

    const systemPrompt = `You are an expert AI prompt engineer. Enhance the following prompt for AI image/video generation.
    Make it more detailed, vivid, and effective. Include specific details about:
    - Visual composition and framing
    - Lighting and atmosphere
    - Color palette and mood
    - Technical camera details
    - Artistic style and influences

    Keep it concise but impactful. Return only the enhanced prompt.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nOriginal prompt: "${originalPrompt}"` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    });

    return result.response.text();
  }

  /**
   * Generate creative script with Gemini
   */
  static async generateScript(
    concept: string,
    options?: {
      duration?: number;
      style?: string;
    }
  ): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      safetySettings,
    });

    const prompt = `Create a detailed video script for: ${concept}

    Duration: ${options?.duration || 30} seconds
    Style: ${options?.style || 'Cinematic'}

    Include:
    1. Scene-by-scene breakdown
    2. Camera angles and movements
    3. Lighting and mood
    4. Sound design notes
    5. Visual effects suggestions
    6. Timing breakdown

    Format as a professional production script.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
      },
    });

    return result.response.text();
  }

  /**
   * Multi-turn conversation with Gemini
   */
  static async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      safetySettings,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);

    return result.response.text();
  }

  /**
   * Generate storyboard with scene descriptions
   */
  static async generateStoryboard(
    concept: string,
    scenes: number = 6
  ): Promise<Array<{
    sceneNumber: number;
    description: string;
    cameraAngle: string;
    duration: number;
    prompt: string;
  }>> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      safetySettings,
    });

    const prompt = `Create a ${scenes}-scene storyboard for: ${concept}

    For each scene, provide:
    1. Scene description
    2. Camera angle/movement
    3. Duration in seconds
    4. Detailed image generation prompt

    Format as JSON array with fields: sceneNumber, description, cameraAngle, duration, prompt`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
      },
    });

    const text = result.response.text();

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);

    try {
      const storyboard = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);
      return Array.isArray(storyboard) ? storyboard : [];
    } catch (error) {
      // Fallback: return simple storyboard
      return Array.from({ length: scenes }, (_, i) => ({
        sceneNumber: i + 1,
        description: `Scene ${i + 1}`,
        cameraAngle: 'Medium shot',
        duration: 5,
        prompt: concept,
      }));
    }
  }

  /**
   * Count tokens in text
   */
  static async countTokens(text: string): Promise<number> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.countTokens(text);
    return result.totalTokens;
  }
}
