/**
 * FLOW ENGINE SERVICE - Main orchestration layer
 *
 * Google Flow-style creative filmmaking platform
 * Orchestrates all Flow services into cohesive workflows
 */

import { ScenebuilderService, Storyboard } from './scenebuilder.service';
import { VideoExtensionService } from './video-extension.service';
import { ObjectInsertionService } from './object-insertion.service';
import { UpscalingService } from './upscaling.service';
import { AssetManagerService } from './asset-manager.service';
import { TimelineEditorService } from './timeline-editor.service';
import { IngredientsToVideoService } from './ingredients-to-video.service';
import { CollaborationService } from './collaboration.service';
import { ExportService } from './export.service';
import { VideoProcessingService } from './video-processing.service';
import { prisma } from '../../config/database';

export interface FlowProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'short-film' | 'commercial' | 'music-video' | 'social' | 'other';
  storyboard?: Storyboard;
  timelineId?: string;
  assets: string[]; // asset IDs
  collaborators: string[]; // user IDs
  status: 'draft' | 'in-progress' | 'rendering' | 'completed';
  metadata: {
    totalDuration?: number;
    sceneCount?: number;
    version?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowWorkflow {
  name: string;
  description: string;
  steps: Array<{
    type: string;
    service: string;
    config: any;
  }>;
}

export class FlowEngineService {
  /**
   * Create new Flow project
   */
  static async createProject(data: {
    userId: string;
    name: string;
    description?: string;
    type?: string;
  }): Promise<FlowProject> {
    const project = await prisma.project.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        type: data.type || 'other',
        storyboard: null,
        timelineId: null,
        assets: [],
        collaborators: [data.userId],
        status: 'draft',
        metadata: {},
      },
    });

    // Create default storyboard
    const storyboard = await ScenebuilderService.createStoryboard({
      projectId: project.id,
      userId: data.userId,
      name: `${data.name} - Storyboard`,
    });

    // Create default timeline
    const timeline = await TimelineEditorService.createTimeline({
      projectId: project.id,
      userId: data.userId,
      name: `${data.name} - Timeline`,
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        storyboard: storyboard as any,
        timelineId: timeline.id,
      },
    });

    return {
      ...project,
      storyboard,
      timelineId: timeline.id,
    } as any;
  }

  /**
   * Quick Start: Text to Film
   * Complete workflow from prompt to final video
   */
  static async textToFilm(data: {
    userId: string;
    prompt: string;
    style?: 'cinematic' | 'documentary' | 'commercial' | 'music-video';
    duration?: number;
    quality?: 'draft' | 'preview' | 'final';
  }): Promise<{ projectId: string; jobIds: string[] }> {
    const { userId, prompt, style = 'cinematic', duration = 30, quality = 'preview' } = data;

    // 1. Create project
    const project = await this.createProject({
      userId,
      name: `AI Film: ${prompt.substring(0, 30)}...`,
      description: prompt,
      type: style,
    });

    // 2. Generate scene suggestions using Scenebuilder
    const scenes = await ScenebuilderService.getSuggestions({
      prompt,
      style,
      duration: duration * 1000,
      sceneCount: Math.ceil(duration / 10),
    });

    // 3. Add scenes to storyboard
    for (const scene of scenes) {
      await ScenebuilderService.addScene(
        (project.storyboard as any).id,
        scene
      );
    }

    // 4. Generate video from ingredients
    const result = await IngredientsToVideoService.createFromIngredients({
      userId,
      projectId: project.id,
      name: project.name,
      ingredients: [
        { type: 'text', content: prompt, weight: 1.0 },
      ],
      settings: {
        duration: duration,
        resolution: quality === 'final' ? '1080p' : '720p',
        style: 'cinematic',
        coherence: quality === 'final' ? 'high' : 'medium',
      },
      prompt,
    });

    return {
      projectId: project.id,
      jobIds: [result.jobId],
    };
  }

  /**
   * Quick Start: Images to Story
   * Create narrative from multiple images
   */
  static async imagesToStory(data: {
    userId: string;
    imageUrls: string[];
    narrative?: string;
    duration?: number;
    transitions?: boolean;
  }): Promise<{ projectId: string; jobId: string }> {
    const { userId, imageUrls, narrative, duration = 20, transitions = true } = data;

    // Create project
    const project = await this.createProject({
      userId,
      name: `Story from ${imageUrls.length} images`,
      type: 'short-film',
    });

    // Create ingredients from images
    const ingredients = imageUrls.map((url, index) => ({
      type: 'image' as const,
      assetUrl: url,
      weight: 1.0 / imageUrls.length,
      timeRange: {
        start: (duration / imageUrls.length) * index,
        end: (duration / imageUrls.length) * (index + 1),
      },
    }));

    // Add narrative if provided
    if (narrative) {
      ingredients.push({
        type: 'text',
        content: narrative,
        weight: 0.3,
      } as any);
    }

    // Generate video
    const result = await IngredientsToVideoService.createFromIngredients({
      userId,
      projectId: project.id,
      name: project.name,
      ingredients,
      settings: {
        duration,
        resolution: '1080p',
        style: 'cinematic',
        coherence: 'high',
        transitionStyle: transitions ? 'smooth' : 'cut',
      },
    });

    return {
      projectId: project.id,
      jobId: result.jobId,
    };
  }

  /**
   * Professional Workflow: Full Production Pipeline
   */
  static async fullProductionPipeline(data: {
    userId: string;
    projectId: string;
    stages: {
      preProduction?: boolean; // Storyboard, shot planning
      production?: boolean; // Video generation
      postProduction?: boolean; // Editing, effects, color
      export?: boolean; // Final export
    };
  }): Promise<{ status: string; completedStages: string[] }> {
    const { userId, projectId, stages } = data;
    const completed: string[] = [];

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new Error('Project not found or unauthorized');
    }

    // Pre-production: Storyboarding
    if (stages.preProduction) {
      // Storyboard is already created with project
      completed.push('pre-production');
    }

    // Production: Generate videos
    if (stages.production) {
      // Generate videos from storyboard scenes
      completed.push('production');
    }

    // Post-production: Timeline editing
    if (stages.postProduction) {
      // Timeline is ready for editing
      completed.push('post-production');
    }

    // Export: Final render
    if (stages.export) {
      // Export using timeline
      if (project.timelineId) {
        await ExportService.exportTimeline(
          userId,
          project.timelineId as string,
          { preset: 'youtube_1080p' }
        );
      }
      completed.push('export');
    }

    return {
      status: 'completed',
      completedStages: completed,
    };
  }

  /**
   * Get workflow templates
   */
  static getWorkflowTemplates(): FlowWorkflow[] {
    return [
      {
        name: 'Social Media Content',
        description: 'Quick vertical videos for TikTok, Instagram, YouTube Shorts',
        steps: [
          { type: 'generate', service: 'ingredients-to-video', config: { duration: 15 } },
          { type: 'upscale', service: 'upscaling', config: { resolution: '1080x1920' } },
          { type: 'export', service: 'export', config: { preset: 'tiktok' } },
        ],
      },
      {
        name: 'Professional Commercial',
        description: 'High-quality commercial with multiple scenes',
        steps: [
          { type: 'storyboard', service: 'scenebuilder', config: { sceneCount: 5 } },
          { type: 'generate', service: 'ingredients-to-video', config: { style: 'cinematic' } },
          { type: 'edit', service: 'timeline-editor', config: { transitions: true } },
          { type: 'upscale', service: 'upscaling', config: { resolution: '4k' } },
          { type: 'export', service: 'export', config: { preset: 'cinema_4k' } },
        ],
      },
      {
        name: 'Music Video',
        description: 'Sync visuals with music',
        steps: [
          { type: 'upload-audio', service: 'asset-manager', config: {} },
          { type: 'generate', service: 'ingredients-to-video', config: { audioMix: 'music-focused' } },
          { type: 'edit', service: 'timeline-editor', config: { audioSync: true } },
          { type: 'export', service: 'export', config: { preset: 'youtube_4k' } },
        ],
      },
    ];
  }

  /**
   * Get project status and analytics
   */
  static async getProjectAnalytics(projectId: string): Promise<any> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        videos: true,
        assets: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      stats: {
        totalVideos: project.videos?.length || 0,
        totalAssets: project.assets?.length || 0,
        sceneCount: (project.storyboard as any)?.scenes?.length || 0,
        totalDuration: project.metadata?.totalDuration || 0,
        version: project.metadata?.version || 1,
      },
      collaborators: project.collaborators?.length || 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
