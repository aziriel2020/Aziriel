/**
 * Batch Generation Service - REVOLUTIONARY SCALING
 * Generate multiple videos simultaneously with smart queuing
 */

import { prisma } from '../config/database';
import { QueueService } from './queue.service';
import { logger } from '../config/logger';
import { io } from '../app';

export interface BatchJobRequest {
  userId: string;
  jobs: Array<{
    prompt: string;
    model?: string;
    options?: any;
  }>;
  batchName?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface BatchJobResponse {
  batchId: string;
  jobIds: string[];
  totalJobs: number;
  estimatedTime: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export class BatchGenerationService {
  /**
   * Create batch job - Generate multiple videos at once
   */
  static async createBatchJob(request: BatchJobRequest): Promise<BatchJobResponse> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info(`Creating batch job: ${batchId} with ${request.jobs.length} videos`);

      // Calculate priority multiplier
      const priorityMultiplier = this.getPriorityMultiplier(request.priority || 'normal');

      // Create all jobs in database
      const jobIds: string[] = [];
      const dbJobs = [];

      for (let i = 0; i < request.jobs.length; i++) {
        const job = request.jobs[i];

        const dbJob = await prisma.job.create({
          data: {
            userId: request.userId,
            prompt: job.prompt,
            provider: job.model || 'auto',
            status: 'PENDING',
            options: job.options || {},
            metadata: {
              batchId,
              batchIndex: i,
              batchTotal: request.jobs.length,
              batchName: request.batchName,
              priority: request.priority,
            },
          },
        });

        jobIds.push(dbJob.id);
        dbJobs.push(dbJob);
      }

      // Add all jobs to queue with priority
      for (const dbJob of dbJobs) {
        await QueueService.addVideoGenerationJob(
          dbJob.id,
          dbJob.provider,
          dbJob.prompt,
          {
            ...dbJob.options,
            priority: priorityMultiplier,
          }
        );
      }

      // Create batch record
      await prisma.batch.create({
        data: {
          id: batchId,
          userId: request.userId,
          name: request.batchName || `Batch ${new Date().toLocaleDateString()}`,
          totalJobs: request.jobs.length,
          completedJobs: 0,
          failedJobs: 0,
          status: 'PROCESSING',
          priority: request.priority || 'normal',
        },
      });

      // Estimate completion time (rough estimate)
      const avgTimePerVideo = 60; // 60 seconds average
      const estimatedTime = avgTimePerVideo * request.jobs.length / 3; // Parallel processing divides by 3

      // Emit WebSocket event
      io.to(`user:${request.userId}`).emit('batch:created', {
        batchId,
        jobIds,
        totalJobs: request.jobs.length,
      });

      logger.info(`Batch job created successfully: ${batchId}`);

      return {
        batchId,
        jobIds,
        totalJobs: request.jobs.length,
        estimatedTime,
        status: 'queued',
      };
    } catch (error: any) {
      logger.error(`Batch job creation failed: ${batchId}`, error);
      throw new Error(`Failed to create batch job: ${error.message}`);
    }
  }

  /**
   * Get batch status with all job details
   */
  static async getBatchStatus(batchId: string, userId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, userId },
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    const jobs = await prisma.job.findMany({
      where: {
        userId,
        metadata: {
          path: ['batchId'],
          equals: batchId,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const completed = jobs.filter(j => j.status === 'COMPLETED').length;
    const failed = jobs.filter(j => j.status === 'FAILED').length;
    const processing = jobs.filter(j => j.status === 'PROCESSING').length;
    const pending = jobs.filter(j => j.status === 'PENDING').length;

    const progress = (completed / jobs.length) * 100;

    return {
      batch: {
        id: batch.id,
        name: batch.name,
        status: batch.status,
        totalJobs: batch.totalJobs,
        completedJobs: completed,
        failedJobs: failed,
        processingJobs: processing,
        pendingJobs: pending,
        progress: Math.round(progress),
        createdAt: batch.createdAt,
        completedAt: batch.completedAt,
      },
      jobs: jobs.map(job => ({
        id: job.id,
        prompt: job.prompt,
        status: job.status,
        provider: job.provider,
        outputUrl: job.outputUrl,
        thumbnailUrl: job.thumbnailUrl,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      })),
    };
  }

  /**
   * Cancel entire batch
   */
  static async cancelBatch(batchId: string, userId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, userId },
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Update batch status
    await prisma.batch.update({
      where: { id: batchId },
      data: { status: 'CANCELLED' },
    });

    // Cancel all pending/processing jobs
    await prisma.job.updateMany({
      where: {
        userId,
        metadata: {
          path: ['batchId'],
          equals: batchId,
        },
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
      data: {
        status: 'FAILED',
        error: 'Cancelled by user',
      },
    });

    // Emit WebSocket event
    io.to(`user:${userId}`).emit('batch:cancelled', { batchId });

    logger.info(`Batch cancelled: ${batchId}`);

    return { success: true, batchId };
  }

  /**
   * Get all user batches
   */
  static async getUserBatches(userId: string, limit: number = 50, offset: number = 0) {
    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.batch.count({ where: { userId } }),
    ]);

    return {
      batches,
      total,
      limit,
      offset,
    };
  }

  /**
   * Retry failed jobs in batch
   */
  static async retryFailedJobs(batchId: string, userId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, userId },
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Get all failed jobs
    const failedJobs = await prisma.job.findMany({
      where: {
        userId,
        metadata: {
          path: ['batchId'],
          equals: batchId,
        },
        status: 'FAILED',
      },
    });

    if (failedJobs.length === 0) {
      return { success: true, retriedJobs: 0 };
    }

    // Reset status and re-queue
    for (const job of failedJobs) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'PENDING',
          error: null,
        },
      });

      await QueueService.addVideoGenerationJob(
        job.id,
        job.provider,
        job.prompt,
        job.options
      );
    }

    // Update batch status
    await prisma.batch.update({
      where: { id: batchId },
      data: { status: 'PROCESSING' },
    });

    logger.info(`Retrying ${failedJobs.length} failed jobs in batch ${batchId}`);

    return { success: true, retriedJobs: failedJobs.length };
  }

  /**
   * Download all completed videos in batch as ZIP
   */
  static async downloadBatchAsZip(batchId: string, userId: string): Promise<string> {
    // This would create a ZIP file of all completed videos
    // Implementation depends on your storage setup
    // Return a signed URL to download the ZIP

    const batch = await prisma.batch.findFirst({
      where: { id: batchId, userId },
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    const jobs = await prisma.job.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        metadata: {
          path: ['batchId'],
          equals: batchId,
        },
      },
    });

    // TODO: Implement ZIP creation and upload
    // For now, return a placeholder
    return `https://api.neurafield.com/downloads/batch-${batchId}.zip`;
  }

  /**
   * Get priority multiplier for queue
   */
  private static getPriorityMultiplier(priority: string): number {
    const multipliers: Record<string, number> = {
      low: 1,
      normal: 2,
      high: 5,
      urgent: 10,
    };
    return multipliers[priority] || multipliers.normal;
  }

  /**
   * Update batch progress (called by queue worker)
   */
  static async updateBatchProgress(batchId: string) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) return;

    const jobs = await prisma.job.findMany({
      where: {
        metadata: {
          path: ['batchId'],
          equals: batchId,
        },
      },
    });

    const completed = jobs.filter(j => j.status === 'COMPLETED').length;
    const failed = jobs.filter(j => j.status === 'FAILED').length;

    await prisma.batch.update({
      where: { id: batchId },
      data: {
        completedJobs: completed,
        failedJobs: failed,
        status: completed + failed === jobs.length ? 'COMPLETED' : 'PROCESSING',
        completedAt: completed + failed === jobs.length ? new Date() : null,
      },
    });

    // Emit progress update
    io.to(`user:${batch.userId}`).emit('batch:progress', {
      batchId,
      completed,
      failed,
      total: jobs.length,
      progress: Math.round((completed / jobs.length) * 100),
    });

    if (completed + failed === jobs.length) {
      io.to(`user:${batch.userId}`).emit('batch:completed', {
        batchId,
        completed,
        failed,
      });
    }
  }
}

export default BatchGenerationService;
