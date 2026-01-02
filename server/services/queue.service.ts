/**
 * Job Queue Service - Bull/BullMQ Integration
 * Background job processing for video generation, AI tasks, etc.
 */

import Queue from 'bull';
import { prisma } from '../config/database';
import logger from './logger.service';
import { RunwayService } from './ai/runway.service';
import { ReplicateService } from './ai/replicate.service';
import { OpenAIService } from './ai/openai.service';
import { AnthropicService } from './ai/anthropic.service';
import { GoogleService } from './ai/google.service';
import { KlingService } from './ai/kling.service';
import { VideoService } from './video.service';

// Create queues for different job types
export const videoGenerationQueue = new Queue('video-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const imageGenerationQueue = new Queue('image-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const videoProcessingQueue = new Queue('video-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// ============================================
// VIDEO GENERATION QUEUE PROCESSOR
// ============================================

videoGenerationQueue.process(async (job) => {
  const { jobId, provider, prompt, options } = job.data;

  logger.info(`Processing video generation job: ${jobId}, provider: ${provider}`);

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', progress: 5 },
    });

    let videoUrl: string;

    switch (provider) {
      case 'kling':
      case 'kling-2.6':
        videoUrl = await KlingService.generateVideo(jobId, prompt, options);
        break;

      case 'runway':
      case 'runway-gen2':
        videoUrl = await RunwayService.generateVideo(jobId, prompt, options);
        break;

      case 'runway-gen3':
        videoUrl = await RunwayService.generateVideoGen3(jobId, prompt, options);
        break;

      case 'replicate-zeroscope':
        videoUrl = await ReplicateService.generateVideoZeroscope(jobId, prompt, options);
        break;

      case 'replicate-animatediff':
        videoUrl = await ReplicateService.generateVideoAnimateDiff(jobId, prompt, options);
        break;

      default:
        throw new Error(`Unknown video generation provider: ${provider}`);
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        outputUrl: videoUrl,
        completedAt: new Date(),
      },
    });

    logger.info(`Video generation completed: ${jobId}`);
    return { videoUrl };
  } catch (error: any) {
    logger.error(`Video generation failed: ${jobId}`, error);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });

    throw error;
  }
});

// ============================================
// IMAGE GENERATION QUEUE PROCESSOR
// ============================================

imageGenerationQueue.process(async (job) => {
  const { jobId, provider, prompt, options } = job.data;

  logger.info(`Processing image generation job: ${jobId}, provider: ${provider}`);

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', progress: 10 },
    });

    let imageUrl: string;

    switch (provider) {
      case 'dalle':
        imageUrl = await OpenAIService.generateImage(jobId, prompt, options);
        break;

      case 'replicate-sdxl':
        imageUrl = await ReplicateService.generateImageSDXL(jobId, prompt, options);
        break;

      case 'replicate-flux':
        imageUrl = await ReplicateService.generateImageFlux(jobId, prompt, options);
        break;

      default:
        throw new Error(`Unknown image generation provider: ${provider}`);
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        outputUrl: imageUrl,
        completedAt: new Date(),
      },
    });

    logger.info(`Image generation completed: ${jobId}`);
    return { imageUrl };
  } catch (error: any) {
    logger.error(`Image generation failed: ${jobId}`, error);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });

    throw error;
  }
});

// ============================================
// VIDEO PROCESSING QUEUE PROCESSOR
// ============================================

videoProcessingQueue.process(async (job) => {
  const { jobId, operation, inputPath, outputPath, options } = job.data;

  logger.info(`Processing video operation: ${jobId}, operation: ${operation}`);

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', progress: 10 },
    });

    let resultPath: string;

    switch (operation) {
      case 'transcode':
        resultPath = await VideoService.transcodeVideo(inputPath, outputPath, options);
        break;

      case 'trim':
        resultPath = await VideoService.trimVideo(
          inputPath,
          outputPath,
          options.startTime,
          options.duration
        );
        break;

      case 'add-audio':
        resultPath = await VideoService.addAudio(
          inputPath,
          options.audioPath,
          outputPath,
          options
        );
        break;

      case 'add-text':
        resultPath = await VideoService.addTextOverlay(
          inputPath,
          outputPath,
          options.text,
          options
        );
        break;

      case 'add-watermark':
        resultPath = await VideoService.addWatermark(
          inputPath,
          options.watermarkPath,
          outputPath,
          options.position,
          options.opacity
        );
        break;

      case 'apply-filters':
        resultPath = await VideoService.applyFilters(inputPath, outputPath, options.filters);
        break;

      case 'change-speed':
        resultPath = await VideoService.changeSpeed(inputPath, outputPath, options.speed);
        break;

      case 'concatenate':
        resultPath = await VideoService.concatenateVideos(options.videoPaths, outputPath);
        break;

      case 'generate-thumbnail':
        resultPath = await VideoService.generateThumbnail(inputPath, outputPath, options.time);
        break;

      case 'convert-gif':
        resultPath = await VideoService.convertToGif(inputPath, outputPath, options);
        break;

      default:
        throw new Error(`Unknown video operation: ${operation}`);
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        outputUrl: resultPath,
        completedAt: new Date(),
      },
    });

    logger.info(`Video processing completed: ${jobId}`);
    return { resultPath };
  } catch (error: any) {
    logger.error(`Video processing failed: ${jobId}`, error);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });

    throw error;
  }
});

// ============================================
// QUEUE EVENT LISTENERS
// ============================================

const setupQueueListeners = (queue: Queue.Queue, queueName: string) => {
  queue.on('completed', (job, result) => {
    logger.info(`${queueName} job completed:`, job.id);
  });

  queue.on('failed', (job, err) => {
    logger.error(`${queueName} job failed:`, job?.id, err);
  });

  queue.on('stalled', (job) => {
    logger.warn(`${queueName} job stalled:`, job.id);
  });

  queue.on('progress', (job, progress) => {
    logger.info(`${queueName} job progress:`, job.id, `${progress}%`);
  });
};

setupQueueListeners(videoGenerationQueue, 'video-generation');
setupQueueListeners(imageGenerationQueue, 'image-generation');
setupQueueListeners(videoProcessingQueue, 'video-processing');

// ============================================
// QUEUE SERVICE
// ============================================

export class QueueService {
  /**
   * Add video generation job
   */
  static async addVideoGenerationJob(
    jobId: string,
    provider: 'runway' | 'replicate-zeroscope' | 'replicate-animatediff',
    prompt: string,
    options?: any
  ) {
    return await videoGenerationQueue.add({
      jobId,
      provider,
      prompt,
      options,
    });
  }

  /**
   * Add image generation job
   */
  static async addImageGenerationJob(
    jobId: string,
    provider: 'dalle' | 'replicate-sdxl' | 'replicate-flux',
    prompt: string,
    options?: any
  ) {
    return await imageGenerationQueue.add({
      jobId,
      provider,
      prompt,
      options,
    });
  }

  /**
   * Add video processing job
   */
  static async addVideoProcessingJob(
    jobId: string,
    operation: string,
    inputPath: string,
    outputPath: string,
    options?: any
  ) {
    return await videoProcessingQueue.add({
      jobId,
      operation,
      inputPath,
      outputPath,
      options,
    });
  }

  /**
   * Get job status
   */
  static async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) return null;

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * Get queue stats
   */
  static async getQueueStats(queueName: string) {
    const queue = this.getQueue(queueName);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Pause queue
   */
  static async pauseQueue(queueName: string) {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  /**
   * Resume queue
   */
  static async resumeQueue(queueName: string) {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  /**
   * Clean old jobs
   */
  static async cleanQueue(queueName: string, grace: number = 86400000) {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
  }

  /**
   * Get queue instance
   */
  private static getQueue(queueName: string): Queue.Queue {
    switch (queueName) {
      case 'video-generation':
        return videoGenerationQueue;
      case 'image-generation':
        return imageGenerationQueue;
      case 'video-processing':
        return videoProcessingQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  /**
   * Retry failed job
   */
  static async retryJob(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) throw new Error('Job not found');

    await job.retry();
  }

  /**
   * Remove job
   */
  static async removeJob(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) throw new Error('Job not found');

    await job.remove();
  }
}
