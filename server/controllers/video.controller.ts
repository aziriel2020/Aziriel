/**
 * Video Editing Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { VideoService } from '../services/video.service';
import { StorageService } from '../services/storage.service';
import { QueueService } from '../services/queue.service';
import { AppError } from '../middleware/error.middleware';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class VideoController {
  /**
   * Upload video file
   */
  static async uploadVideo(req: Request, res: Response) {
    const userId = (req as any).user.id;

    if (!req.files || !req.files.video) {
      throw new AppError('No video file uploaded', 400);
    }

    const videoFile = Array.isArray(req.files.video) ? req.files.video[0] : req.files.video;
    const filename = `${uuidv4()}${path.extname(videoFile.name)}`;

    // Upload to S3
    const url = await StorageService.uploadFile(
      videoFile.data,
      `videos/${userId}/${filename}`,
      videoFile.mimetype
    );

    res.json({
      success: true,
      data: {
        url,
        filename: videoFile.name,
        size: videoFile.size,
      },
    });
  }

  /**
   * Transcode video
   */
  static async transcodeVideo(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { format, resolution, fps, bitrate } = req.body;

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Transcoding video',
        options: { operation: 'transcode', format, resolution, fps, bitrate },
      },
    });

    res.status(202).json({
      success: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
        },
      },
      message: 'Transcoding started',
    });
  }

  /**
   * Trim video
   */
  static async trimVideo(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { startTime, duration } = req.body;

    if (startTime === undefined || duration === undefined) {
      throw new AppError('Start time and duration are required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Trimming video',
        options: { operation: 'trim', startTime, duration },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Add audio to video
   */
  static async addAudio(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { audioUrl, audioVolume, videoVolume, fadeIn, fadeOut } = req.body;

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Adding audio to video',
        options: { operation: 'add-audio', audioUrl, audioVolume, videoVolume, fadeIn, fadeOut },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Add text overlay
   */
  static async addText(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { text, x, y, fontSize, fontColor, startTime, duration } = req.body;

    if (!text) {
      throw new AppError('Text is required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Adding text overlay',
        options: { operation: 'add-text', text, x, y, fontSize, fontColor, startTime, duration },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Add watermark
   */
  static async addWatermark(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { watermarkUrl, position = 'bottom-right', opacity = 0.5 } = req.body;

    if (!watermarkUrl) {
      throw new AppError('Watermark URL is required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Adding watermark',
        options: { operation: 'add-watermark', watermarkUrl, position, opacity },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Apply filters
   */
  static async applyFilters(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { filters } = req.body;

    if (!filters) {
      throw new AppError('Filters are required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Applying filters',
        options: { operation: 'apply-filters', filters },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Change video speed
   */
  static async changeSpeed(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { speed } = req.body;

    if (!speed) {
      throw new AppError('Speed is required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Changing video speed',
        options: { operation: 'change-speed', speed },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Concatenate videos
   */
  static async concatenateVideos(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { videoPaths } = req.body;

    if (!videoPaths || !Array.isArray(videoPaths)) {
      throw new AppError('Video paths array is required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Concatenating videos',
        options: { operation: 'concatenate', videoPaths },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { timeInSeconds = 1 } = req.body;

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Generating thumbnail',
        options: { operation: 'generate-thumbnail', time: timeInSeconds },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Convert to GIF
   */
  static async convertToGif(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { fps = 15, width = 480, startTime, duration } = req.body;

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Converting to GIF',
        options: { operation: 'convert-gif', fps, width, startTime, duration },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }

  /**
   * Get video metadata
   */
  static async getMetadata(req: Request, res: Response) {
    const { videoPath } = req.body;

    if (!videoPath) {
      throw new AppError('Video path is required', 400);
    }

    const metadata = await VideoService.getMetadata(videoPath);

    res.json({
      success: true,
      data: { metadata },
    });
  }

  /**
   * Create video from images
   */
  static async createFromImages(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { imagePaths, fps = 30, duration = 3, transition = 'fade' } = req.body;

    if (!imagePaths || !Array.isArray(imagePaths)) {
      throw new AppError('Image paths array is required', 400);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        type: 'VIDEO_PROCESSING',
        status: 'PENDING',
        prompt: 'Creating video from images',
        options: { operation: 'create-from-images', imagePaths, fps, duration, transition },
      },
    });

    res.status(202).json({
      success: true,
      data: { job: { id: job.id, status: job.status } },
    });
  }
}
