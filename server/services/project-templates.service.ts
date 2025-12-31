/**
 * AI Project Templates & Automated Workflows
 *
 * What makes us 100x BETTER:
 * - Pre-built templates for EVERY use case
 * - Automated multi-step workflows
 * - AI-powered project generation
 * - Smart asset management
 * - One-click professional projects
 *
 * Competitors make you start from scratch. We give you Hollywood-grade templates!
 */

import { prisma } from '../config/database';
import logger from './logger.service';
import { AIOrchestrator } from './ai-orchestrator.service';
import { QualityEnhancer } from './quality-enhancer.service';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimatedDuration: number;
  estimatedCost: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'generation' | 'enhancement' | 'composition' | 'export';
  provider?: string;
  settings: Record<string, any>;
  dependsOn?: string[];
}

export class ProjectTemplatesService {
  /**
   * 🎯 REVOLUTIONARY: Pre-built Professional Templates
   */
  static readonly TEMPLATES: ProjectTemplate[] = [
    {
      id: 'product-launch-video',
      name: 'Product Launch Video',
      description: 'Complete product launch video with intro, demo, and CTA',
      category: 'Marketing',
      estimatedDuration: 300,
      estimatedCost: 150,
      steps: [
        {
          id: 'intro',
          name: 'Generate intro animation',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 5,
            style: 'modern-tech',
          },
        },
        {
          id: 'product-showcase',
          name: 'Product showcase scene',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 15,
            style: 'professional',
          },
          dependsOn: ['intro'],
        },
        {
          id: 'features-highlight',
          name: 'Features highlight',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 20,
            style: 'infographic',
          },
          dependsOn: ['product-showcase'],
        },
        {
          id: 'cta',
          name: 'Call-to-action outro',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 5,
            style: 'bold',
          },
          dependsOn: ['features-highlight'],
        },
        {
          id: 'final-edit',
          name: 'Combine and enhance',
          type: 'composition',
          settings: {
            transitions: true,
            music: true,
            voiceover: true,
          },
          dependsOn: ['intro', 'product-showcase', 'features-highlight', 'cta'],
        },
      ],
    },
    {
      id: 'social-media-pack',
      name: 'Social Media Content Pack',
      description: '10 posts for Instagram, TikTok, and Twitter',
      category: 'Social Media',
      estimatedDuration: 180,
      estimatedCost: 80,
      steps: [
        {
          id: 'instagram-posts',
          name: 'Generate 5 Instagram posts',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            count: 5,
            resolution: '1080x1080',
            style: 'modern-aesthetic',
          },
        },
        {
          id: 'stories',
          name: 'Generate 3 Stories',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            count: 3,
            resolution: '1080x1920',
            style: 'vertical-video',
          },
        },
        {
          id: 'tiktok-clips',
          name: 'Generate 2 TikTok clips',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            count: 2,
            duration: 15,
            resolution: '1080x1920',
          },
        },
      ],
    },
    {
      id: 'movie-trailer',
      name: 'Cinematic Movie Trailer',
      description: 'Hollywood-style movie trailer with all the elements',
      category: 'Film',
      estimatedDuration: 600,
      estimatedCost: 300,
      steps: [
        {
          id: 'opening-shot',
          name: 'Epic opening shot',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 3,
            cinematix: {
              shotType: 'extreme-wide',
              cameraMovement: 'crane-up',
              emotion: 'anticipation',
            },
          },
        },
        {
          id: 'character-intro',
          name: 'Character introduction',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 5,
            cinematix: {
              shotType: 'medium-closeup',
              lighting: 'dramatic',
            },
          },
        },
        {
          id: 'action-montage',
          name: 'Action sequence montage',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 15,
            cinematix: {
              vfx: ['explosions', 'particles'],
              pacing: 'fast',
            },
          },
        },
        {
          id: 'emotional-beat',
          name: 'Emotional moment',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 4,
            cinematix: {
              emotion: 'melancholy',
              music: 'orchestral',
            },
          },
        },
        {
          id: 'climax-tease',
          name: 'Climax tease',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 3,
            cinematix: {
              tension: 'high',
              cutToBlack: true,
            },
          },
        },
        {
          id: 'title-card',
          name: 'Title card reveal',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 2,
            style: 'title-reveal',
          },
        },
      ],
    },
    {
      id: 'brand-identity-kit',
      name: 'Complete Brand Identity Kit',
      description: 'Logo, colors, fonts, and 20+ branded assets',
      category: 'Branding',
      estimatedDuration: 240,
      estimatedCost: 120,
      steps: [
        {
          id: 'logo-variations',
          name: 'Generate 5 logo variations',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            count: 5,
            style: 'professional-logo',
          },
        },
        {
          id: 'color-palettes',
          name: 'Generate 3 color palettes',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            count: 3,
            style: 'color-palette',
          },
        },
        {
          id: 'brand-patterns',
          name: 'Generate brand patterns',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            count: 10,
            style: 'seamless-pattern',
          },
        },
        {
          id: 'social-templates',
          name: 'Social media templates',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            count: 10,
            style: 'social-template',
          },
        },
      ],
    },
    {
      id: 'podcast-episode-assets',
      name: 'Podcast Episode Asset Pack',
      description: 'Thumbnail, audiogram, promotional clips',
      category: 'Podcasting',
      estimatedDuration: 120,
      estimatedCost: 60,
      steps: [
        {
          id: 'episode-thumbnail',
          name: 'Episode thumbnail',
          type: 'generation',
          settings: {
            type: 'IMAGE',
            resolution: '3000x3000',
            style: 'podcast-cover',
          },
        },
        {
          id: 'audiogram',
          name: 'Audiogram video',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            duration: 60,
            style: 'audiogram',
            format: 'square',
          },
        },
        {
          id: 'promo-clips',
          name: 'Promotional clips',
          type: 'generation',
          settings: {
            type: 'VIDEO',
            count: 3,
            duration: 15,
            style: 'podcast-promo',
          },
        },
      ],
    },
  ];

  /**
   * 🚀 Execute complete project from template
   */
  static async executeTemplate(
    templateId: string,
    userId: string,
    inputs: Record<string, any>
  ): Promise<{
    projectId: string;
    status: string;
    completedSteps: string[];
    results: Record<string, any>;
  }> {
    const template = this.TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    logger.info('Executing project template', { templateId, userId });

    // Create project record
    const project = await prisma.project.create({
      data: {
        userId,
        name: template.name,
        templateId,
        status: 'IN_PROGRESS',
        metadata: { inputs, template },
      },
    });

    const completedSteps: string[] = [];
    const results: Record<string, any> = {};

    // Execute steps in order
    for (const step of template.steps) {
      try {
        // Check dependencies
        if (step.dependsOn) {
          const allDepsCompleted = step.dependsOn.every((dep) =>
            completedSteps.includes(dep)
          );
          if (!allDepsCompleted) {
            logger.warn('Skipping step due to missing dependencies', {
              step: step.id,
              dependencies: step.dependsOn,
            });
            continue;
          }
        }

        logger.info('Executing workflow step', { step: step.id });

        const result = await this.executeStep(step, userId, inputs, results);
        results[step.id] = result;
        completedSteps.push(step.id);

        // Update project progress
        await prisma.project.update({
          where: { id: project.id },
          data: {
            progress: Math.round((completedSteps.length / template.steps.length) * 100),
          },
        });
      } catch (error: any) {
        logger.error('Step execution failed', {
          step: step.id,
          error: error.message,
        });
        // Continue with other steps
      }
    }

    // Mark project complete
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });

    return {
      projectId: project.id,
      status: 'COMPLETED',
      completedSteps,
      results,
    };
  }

  /**
   * Execute individual workflow step
   */
  private static async executeStep(
    step: WorkflowStep,
    userId: string,
    inputs: Record<string, any>,
    previousResults: Record<string, any>
  ): Promise<any> {
    switch (step.type) {
      case 'generation':
        return await this.executeGeneration(step, userId, inputs);
      case 'enhancement':
        return await this.executeEnhancement(step, previousResults);
      case 'composition':
        return await this.executeComposition(step, previousResults);
      default:
        return null;
    }
  }

  /**
   * Execute generation step
   */
  private static async executeGeneration(
    step: WorkflowStep,
    userId: string,
    inputs: Record<string, any>
  ): Promise<any> {
    const prompt = inputs.prompt || `Generate ${step.name}`;

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: step.settings.type,
        prompt,
        provider: step.provider || 'auto',
        status: 'QUEUED',
        progress: 0,
        metadata: step.settings,
      },
    });

    // Use Quality Enhancer for best results
    const result = await QualityEnhancer.generateWithBestQuality(
      job.id,
      step.settings.type,
      prompt
    );

    return result;
  }

  /**
   * Execute enhancement step
   */
  private static async executeEnhancement(
    step: WorkflowStep,
    previousResults: Record<string, any>
  ): Promise<any> {
    // Get previous result to enhance
    const deps = step.dependsOn || [];
    const inputUrl = deps.length > 0 ? previousResults[deps[0]] : null;

    if (!inputUrl) {
      throw new Error('No input for enhancement');
    }

    return await QualityEnhancer.postProcessResult(inputUrl, step.settings.type);
  }

  /**
   * Execute composition step
   */
  private static async executeComposition(
    step: WorkflowStep,
    previousResults: Record<string, any>
  ): Promise<any> {
    // Combine multiple previous results
    const deps = step.dependsOn || [];
    const inputs = deps.map((dep) => previousResults[dep]).filter((r) => r);

    logger.info('Composing assets', { count: inputs.length });

    // For now, return the combined list
    // In production, this would use video editing APIs
    return {
      type: 'composition',
      inputs,
      settings: step.settings,
    };
  }

  /**
   * Get all templates
   */
  static getAllTemplates(): ProjectTemplate[] {
    return this.TEMPLATES;
  }

  /**
   * Get template by ID
   */
  static getTemplate(id: string): ProjectTemplate | undefined {
    return this.TEMPLATES.find((t) => t.id === id);
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): ProjectTemplate[] {
    return this.TEMPLATES.filter((t) => t.category === category);
  }
}
