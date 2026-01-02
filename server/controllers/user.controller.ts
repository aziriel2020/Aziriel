/**
 * User Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  /**
   * Get user profile
   */
  static async getProfile(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        credits: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        credits: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  }

  /**
   * Get user credits
   */
  static async getCredits(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, plan: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        credits: user.credits,
        plan: user.plan,
      },
    });
  }

  /**
   * Get usage statistics
   */
  static async getUsage(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const [totalJobs, completedJobs, failedJobs] = await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.job.count({ where: { userId, status: 'FAILED' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        completedJobs,
        failedJobs,
        pendingJobs: totalJobs - completedJobs - failedJobs,
      },
    });
  }

  /**
   * Get all user jobs
   */
  static async getJobs(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }

  /**
   * Get job status
   */
  static async getJobStatus(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { jobId } = req.params;

    const job = await prisma.job.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      success: true,
      data: { job },
    });
  }
}
