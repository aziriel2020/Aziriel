/**
 * JOB QUEUE SERVICE
 * ==================
 * Complete job queue system using Bull & Redis
 * - Video generation jobs
 * - Video processing (transcoding, thumbnails)
 * - Background tasks
 * - Retry logic with exponential backoff
 * - Priority queues
 * - Job progress tracking
 */

import Queue, { Job, JobOptions } from 'bull';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

// Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create queues
const videoQueue = new Queue('video-generation', { redis: redisConfig });
const processingQueue = new Queue('video-processing', { redis: redisConfig });
const translationQueue = new Queue('video-translation', { redis: redisConfig });
const socialQueue = new Queue('social-media', { redis: redisConfig });
const emailQueue = new Queue('email', { redis: redisConfig });

export interface VideoGenerationJob {
  jobId: string;
  userId: string;
  provider: string;
  model: string;
  prompt: string;
  settings?: any;
}

export interface VideoProcessingJob {
  jobId: string;
  userId: string;
  videoUrl: string;
  operations: Array<'transcode' | 'thumbnail' | 'optimize' | 'clip'>;
  settings?: any;
}

export interface TranslationJob {
  jobId: string;
  userId: string;
  videoUrl: string;
  sourceLanguage: string;
  targetLanguages: string[];
  options?: any;
}

export interface SocialMediaJob {
  jobId: string;
  userId: string;
  platforms: string[];
  content: any;
  scheduledFor?: Date;
}

export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export class QueueService {
  /**
   * Add video generation job
   */
  static async addVideoGenerationJob(
    data: VideoGenerationJob,
    options: {
      priority?: number;
      delay?: number;
      attempts?: number;
    } = {}
  ): Promise<Job<VideoGenerationJob>> {
    const jobOptions: JobOptions = {
      priority: options.priority || 0,
      delay: options.delay,
      attempts: options.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 500, // Keep last 500 failed jobs
    };

    // Update database job status
    await prisma.job.update({
      where: { id: data.jobId },
      data: { status: 'QUEUED', queuedAt: new Date() },
    });

    return videoQueue.add(data, jobOptions);
  }

  /**
   * Add video processing job
   */
  static async addVideoProcessingJob(
    data: VideoProcessingJob,
    options: {
      priority?: number;
      attempts?: number;
    } = {}
  ): Promise<Job<VideoProcessingJob>> {
    const jobOptions: JobOptions = {
      priority: options.priority || 0,
      attempts: options.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    };

    await prisma.job.update({
      where: { id: data.jobId },
      data: { status: 'QUEUED', queuedAt: new Date() },
    });

    return processingQueue.add(data, jobOptions);
  }

  /**
   * Add translation job
   */
  static async addTranslationJob(
    data: TranslationJob,
    options: {
      priority?: number;
    } = {}
  ): Promise<Job<TranslationJob>> {
    const jobOptions: JobOptions = {
      priority: options.priority || 0,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000, // 10 seconds
      },
    };

    return translationQueue.add(data, jobOptions);
  }

  /**
   * Add social media publishing job
   */
  static async addSocialMediaJob(
    data: SocialMediaJob,
    options: {
      scheduledFor?: Date;
    } = {}
  ): Promise<Job<SocialMediaJob>> {
    const delay = options.scheduledFor
      ? options.scheduledFor.getTime() - Date.now()
      : 0;

    const jobOptions: JobOptions = {
      delay: delay > 0 ? delay : 0,
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    };

    return socialQueue.add(data, jobOptions);
  }

  /**
   * Add email job
   */
  static async addEmailJob(
    data: EmailJob,
    options: {
      priority?: number;
      delay?: number;
    } = {}
  ): Promise<Job<EmailJob>> {
    const jobOptions: JobOptions = {
      priority: options.priority || 0,
      delay: options.delay,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    };

    return emailQueue.add(data, jobOptions);
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string, queue: Queue): Promise<{
    state: string;
    progress: number;
    result?: any;
    error?: string;
  }> {
    const jobs = await queue.getJobs(['completed', 'active', 'waiting', 'delayed', 'failed']);
    const job = jobs.find(j => j.data.jobId === jobId);

    if (!job) {
      throw new Error('Job not found in queue');
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      state,
      progress: typeof progress === 'number' ? progress : 0,
      result: job.returnvalue,
      error: job.failedReason,
    };
  }

  /**
   * Cancel job
   */
  static async cancelJob(jobId: string, queue: Queue): Promise<void> {
    const jobs = await queue.getJobs(['active', 'waiting', 'delayed']);
    const job = jobs.find(j => j.data.jobId === jobId);

    if (job) {
      await job.remove();

      // Update database
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
    }
  }

  /**
   * Retry failed job
   */
  static async retryJob(jobId: string, queue: Queue): Promise<void> {
    const jobs = await queue.getJobs(['failed']);
    const job = jobs.find(j => j.data.jobId === jobId);

    if (job) {
      await job.retry();

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'RETRYING',
          attempts: { increment: 1 },
        },
      });
    }
  }

  /**
   * Get queue stats
   */
  static async getQueueStats(queue: Queue): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    };
  }

  /**
   * Clean old jobs
   */
  static async cleanQueue(queue: Queue, olderThanMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    await queue.clean(olderThanMs, 'completed');
    await queue.clean(olderThanMs, 'failed');
  }

  /**
   * Pause queue
   */
  static async pauseQueue(queue: Queue): Promise<void> {
    await queue.pause();
  }

  /**
   * Resume queue
   */
  static async resumeQueue(queue: Queue): Promise<void> {
    await queue.resume();
  }

  /**
   * Get all queues
   */
  static getQueues() {
    return {
      video: videoQueue,
      processing: processingQueue,
      translation: translationQueue,
      social: socialQueue,
      email: emailQueue,
    };
  }
}

// ============================================================================
// QUEUE PROCESSORS
// ============================================================================

/**
 * Video Generation Processor
 */
videoQueue.process(async (job: Job<VideoGenerationJob>) => {
  const { jobId, userId, provider, model, prompt, settings } = job.data;

  try {
    // Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
        workerId: `worker_${process.pid}`,
      },
    });

    // Update progress
    await job.progress(10);

    // TODO: Call actual AI video generation API
    // const result = await AIService.generateVideo(provider, model, prompt, settings);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    await job.progress(50);

    const videoUrl = `https://cdn.neurafield.ai/videos/${jobId}.mp4`;

    await job.progress(90);

    // Update job as completed
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        output: { videoUrl },
        progress: 100,
      },
    });

    await job.progress(100);

    return { success: true, videoUrl };
  } catch (error: any) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        error: error.message,
        errorCode: error.code,
      },
    });

    throw error;
  }
});

/**
 * Video Processing Processor
 */
processingQueue.process(async (job: Job<VideoProcessingJob>) => {
  const { jobId, userId, videoUrl, operations, settings } = job.data;

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    // TODO: Process video (FFmpeg operations)
    // For each operation in operations array

    await job.progress(100);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        progress: 100,
      },
    });

    return { success: true };
  } catch (error: any) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        error: error.message,
      },
    });

    throw error;
  }
});

/**
 * Email Processor
 */
emailQueue.process(async (job: Job<EmailJob>) => {
  const { to, subject, template, data } = job.data;

  try {
    // TODO: Send email using EmailService
    // await EmailService.send(to, subject, template, data);

    await job.progress(100);

    return { success: true };
  } catch (error) {
    throw error;
  }
});

// Event listeners for monitoring
videoQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

videoQueue.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err.message);
});

videoQueue.on('error', (error) => {
  console.error('Video queue error:', error);
});

export { videoQueue, processingQueue, translationQueue, socialQueue, emailQueue };
