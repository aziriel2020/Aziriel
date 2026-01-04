/**
 * EXPORT SERVICE - Professional Video Export System
 *
 * Multi-format export with presets
 * - Platform-optimized presets (YouTube, TikTok, Instagram, etc.)
 * - Custom export settings
 * - Batch export
 * - Watermarking
 * - Quality optimization
 */

import { prisma } from '../../config/database';
import { QueueService } from '../core/queue.service';

export interface ExportPreset {
  id: string;
  name: string;
  platform?: string;
  settings: ExportSettings;
  description?: string;
}

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'webm' | 'gif' | 'mp3' | 'wav';
  resolution: string;
  fps: number;
  codec: string;
  bitrate: string;
  audioBitrate?: string;
  aspectRatio?: string;
  colorSpace?: string;
  quality?: 'draft' | 'good' | 'high' | 'best';
  metadata?: Record<string, string>;
}

export interface ExportOptions {
  videoId: string;
  preset?: string;
  customSettings?: Partial<ExportSettings>;
  watermark?: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
  };
  trimming?: {
    start: number;
    end: number;
  };
  filename?: string;
}

export class ExportService {
  /**
   * Export video with specified settings
   */
  static async exportVideo(
    userId: string,
    options: ExportOptions
  ): Promise<{ jobId: string; estimatedTime: number }> {
    const video = await prisma.video.findUnique({
      where: { id: options.videoId },
    });

    if (!video || video.userId !== userId) {
      throw new Error('Video not found or unauthorized');
    }

    // Get preset or use custom settings
    const settings = options.preset
      ? this.getPreset(options.preset).settings
      : this.getDefaultSettings();

    const finalSettings = {
      ...settings,
      ...options.customSettings,
    };

    // Calculate credits
    const duration = options.trimming
      ? options.trimming.end - options.trimming.start
      : video.duration || 0;

    const credits = this.calculateExportCredits(duration, finalSettings);

    // Create export job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'QUEUED',
        priority: finalSettings.quality === 'best' ? 10 : 5,
        input: {
          type: 'export',
          videoId: options.videoId,
          videoUrl: video.url,
          settings: finalSettings,
          watermark: options.watermark,
          trimming: options.trimming,
          filename: options.filename || `${video.name}_export`,
        },
        metadata: {
          estimatedCredits: credits,
        },
        progress: 0,
      },
    });

    // Add to processing queue
    await QueueService.addVideoProcessingJob(
      {
        jobId: job.id,
        userId,
        type: 'export',
        input: job.input,
      },
      { priority: job.priority }
    );

    const estimatedTime = this.estimateExportTime(duration, finalSettings);

    return { jobId: job.id, estimatedTime };
  }

  /**
   * Get export presets
   */
  static getPresets(): ExportPreset[] {
    return [
      {
        id: 'youtube_1080p',
        name: 'YouTube 1080p',
        platform: 'youtube',
        description: 'Optimized for YouTube uploads',
        settings: {
          format: 'mp4',
          resolution: '1920x1080',
          fps: 30,
          codec: 'h264',
          bitrate: '8000k',
          audioBitrate: '320k',
          colorSpace: 'bt709',
          quality: 'high',
        },
      },
      {
        id: 'youtube_4k',
        name: 'YouTube 4K',
        platform: 'youtube',
        description: 'Ultra HD for YouTube',
        settings: {
          format: 'mp4',
          resolution: '3840x2160',
          fps: 60,
          codec: 'h265',
          bitrate: '35000k',
          audioBitrate: '320k',
          quality: 'best',
        },
      },
      {
        id: 'tiktok',
        name: 'TikTok Vertical',
        platform: 'tiktok',
        description: '9:16 vertical for TikTok',
        settings: {
          format: 'mp4',
          resolution: '1080x1920',
          fps: 30,
          codec: 'h264',
          bitrate: '6000k',
          aspectRatio: '9:16',
          quality: 'high',
        },
      },
      {
        id: 'instagram_feed',
        name: 'Instagram Feed',
        platform: 'instagram',
        description: '1:1 square for Instagram',
        settings: {
          format: 'mp4',
          resolution: '1080x1080',
          fps: 30,
          codec: 'h264',
          bitrate: '5000k',
          aspectRatio: '1:1',
          quality: 'high',
        },
      },
      {
        id: 'instagram_reel',
        name: 'Instagram Reels',
        platform: 'instagram',
        description: '9:16 vertical for Reels',
        settings: {
          format: 'mp4',
          resolution: '1080x1920',
          fps: 30,
          codec: 'h264',
          bitrate: '5000k',
          aspectRatio: '9:16',
          quality: 'high',
        },
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        platform: 'twitter',
        description: 'Optimized for Twitter/X',
        settings: {
          format: 'mp4',
          resolution: '1280x720',
          fps: 30,
          codec: 'h264',
          bitrate: '5000k',
          quality: 'good',
        },
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        platform: 'linkedin',
        description: 'Professional quality for LinkedIn',
        settings: {
          format: 'mp4',
          resolution: '1920x1080',
          fps: 30,
          codec: 'h264',
          bitrate: '5000k',
          quality: 'high',
        },
      },
      {
        id: 'facebook',
        name: 'Facebook',
        platform: 'facebook',
        description: 'Optimized for Facebook',
        settings: {
          format: 'mp4',
          resolution: '1280x720',
          fps: 30,
          codec: 'h264',
          bitrate: '4000k',
          quality: 'good',
        },
      },
      {
        id: 'draft_preview',
        name: 'Draft Preview',
        description: 'Fast low-quality preview',
        settings: {
          format: 'mp4',
          resolution: '854x480',
          fps: 24,
          codec: 'h264',
          bitrate: '1000k',
          quality: 'draft',
        },
      },
      {
        id: 'cinema_4k',
        name: 'Cinema 4K',
        description: 'DCI 4K for cinema',
        settings: {
          format: 'mov',
          resolution: '4096x2160',
          fps: 24,
          codec: 'prores',
          bitrate: '100000k',
          colorSpace: 'rec2020',
          quality: 'best',
        },
      },
    ];
  }

  /**
   * Get specific preset
   */
  static getPreset(presetId: string): ExportPreset {
    const preset = this.getPresets().find((p) => p.id === presetId);

    if (!preset) {
      throw new Error('Preset not found');
    }

    return preset;
  }

  /**
   * Get default export settings
   */
  private static getDefaultSettings(): ExportSettings {
    return {
      format: 'mp4',
      resolution: '1920x1080',
      fps: 30,
      codec: 'h264',
      bitrate: '5000k',
      audioBitrate: '192k',
      quality: 'high',
    };
  }

  /**
   * Calculate export credits
   */
  private static calculateExportCredits(
    duration: number,
    settings: ExportSettings
  ): number {
    const baseCredits = Math.ceil(duration / 60); // 1 credit per minute

    const qualityMultiplier = {
      draft: 0.5,
      good: 1,
      high: 1.5,
      best: 3,
    }[settings.quality || 'good'];

    return Math.ceil(baseCredits * qualityMultiplier);
  }

  /**
   * Estimate export time
   */
  private static estimateExportTime(
    duration: number,
    settings: ExportSettings
  ): number {
    // Base time: 1x duration for draft, 2x for good, 3x for high, 5x for best
    const multiplier = {
      draft: 1,
      good: 2,
      high: 3,
      best: 5,
    }[settings.quality || 'good'];

    return duration * multiplier;
  }

  /**
   * Batch export multiple videos
   */
  static async batchExport(
    userId: string,
    exports: ExportOptions[]
  ): Promise<{ jobIds: string[] }> {
    const jobs = await Promise.all(
      exports.map((options) => this.exportVideo(userId, options))
    );

    return { jobIds: jobs.map((job) => job.jobId) };
  }

  /**
   * Export timeline directly
   */
  static async exportTimeline(
    userId: string,
    timelineId: string,
    options: Omit<ExportOptions, 'videoId'>
  ): Promise<{ jobId: string }> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline || timeline.userId !== userId) {
      throw new Error('Timeline not found or unauthorized');
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'QUEUED',
        priority: 7,
        input: {
          type: 'timeline-export',
          timelineId,
          timeline: timeline.tracks,
          settings: options.customSettings || this.getDefaultSettings(),
          watermark: options.watermark,
        },
        progress: 0,
      },
    });

    return { jobId: job.id };
  }
}
