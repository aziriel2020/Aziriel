// @ts-nocheck
/**
 * Queue Service - PRODUCTION READY avec Bull
 * Gestion des files d'attente pour génération vidéo
 */

import Bull from 'bull';
import { prisma } from '../config/database';
import videoGenerationService from './video-generation.service';
import { logger } from '../config/logger';
import { io } from '../app';
import S3Service from './s3.service';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queue
export const videoQueue = new Bull('video-generation', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

export class QueueService {
  /**
   * Add video generation job to queue
   */
  static async addVideoGenerationJob(
    jobId: string,
    provider: string,
    prompt: string,
    options: any
  ): Promise<void> {
    await videoQueue.add('generate-video', {
      jobId,
      provider,
      prompt,
      options,
    }, {
      jobId, // Use DB job ID as Bull job ID
    });

    logger.info(`Job ${jobId} added to queue`);
  }
}

/**
 * WORKER - Process video generation jobs
 */
videoQueue.process('generate-video', async (job) => {
  const { jobId, provider, prompt, options } = job.data;

  try {
    logger.info(`Processing job ${jobId} with provider ${provider}`);

    // Update job status to PROCESSING
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    // Emit WebSocket event
    const dbJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (dbJob) {
      io.to(`user:${dbJob.userId}`).emit('job:processing', { jobId });
    }

    // VRAI APPEL À L'API DE GÉNÉRATION
    const result = await videoGenerationService.generateVideo({
      prompt,
      model: provider || options?.model || 'auto',
      ...options,
      userId: dbJob?.userId || 'system',
    });

    // Update job progress
    job.progress(50);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (60 * 5s)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s

      const status = await videoGenerationService.getJobStatus(
        result.jobId,
        result.model
      );

      job.progress(50 + (attempts / maxAttempts) * 50);

      if (status.status === 'completed') {
        // SUCCESS! Upload to S3
        logger.info(`Job ${jobId} completed, uploading to S3...`);

        try {
          // Upload video to S3
          const videoUpload = await S3Service.uploadVideoFromUrl(status.videoUrl, {
            jobId,
            provider,
            userId: dbJob?.userId || 'unknown',
          });

          // Upload thumbnail if available
          let thumbnailUpload;
          if (status.thumbnailUrl) {
            thumbnailUpload = await S3Service.uploadThumbnailFromUrl(status.thumbnailUrl, {
              jobId,
              provider,
            });
          }

          // Update job with S3 URLs
          await prisma.job.update({
            where: { id: jobId },
            data: {
              status: 'COMPLETED',
              outputUrl: videoUpload.url, // Use S3 URL
              thumbnailUrl: thumbnailUpload?.url || status.thumbnailUrl,
              completedAt: new Date(),
            },
          });

          // Emit WebSocket event
          if (dbJob) {
            io.to(`user:${dbJob.userId}`).emit('job:completed', {
              jobId,
              outputUrl: videoUpload.url,
            });
          }

          logger.info(`Job ${jobId} completed and uploaded to S3 successfully`);
          return { success: true, outputUrl: videoUpload.url };
        } catch (uploadError: any) {
          // If S3 upload fails, still save the original URL
          logger.error(`S3 upload failed for job ${jobId}, using original URL:`, uploadError);

          await prisma.job.update({
            where: { id: jobId },
            data: {
              status: 'COMPLETED',
              outputUrl: status.videoUrl,
              thumbnailUrl: status.thumbnailUrl,
              completedAt: new Date(),
            },
          });

          // Emit WebSocket event with original URL
          if (dbJob) {
            io.to(`user:${dbJob.userId}`).emit('job:completed', {
              jobId,
              outputUrl: status.videoUrl,
            });
          }

          return { success: true, outputUrl: status.videoUrl };
        }
      } else if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }

      attempts++;
    }

    throw new Error('Video generation timeout');

  } catch (error: any) {
    logger.error(`Job ${jobId} failed:`, error);

    // Update job status to FAILED
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });

    // Emit WebSocket event
    const dbJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (dbJob) {
      io.to(`user:${dbJob.userId}`).emit('job:failed', {
        jobId,
        error: error.message,
      });
    }

    throw error;
  }
});

// Queue event listeners
videoQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed`);
});

videoQueue.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

videoQueue.on('progress', (job, progress) => {
  logger.info(`Job ${job.id} progress: ${progress}%`);
});
