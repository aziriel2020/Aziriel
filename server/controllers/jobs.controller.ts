/**
 * Jobs Controller - PRODUCTION READY
 * Gestion des jobs de génération vidéo
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class JobsController {
  /**
   * GET /api/jobs
   * Liste tous les jobs de l'utilisateur
   */
  static async getJobs(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    const where: any = { userId };
    if (status && status !== 'all') {
      where.status = (status as string).toUpperCase();
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  }

  /**
   * GET /api/jobs/:id
   * Récupère un job spécifique
   */
  static async getJob(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      success: true,
      data: { job },
    });
  }

  /**
   * DELETE /api/jobs/:id
   * Supprime un job
   */
  static async deleteJob(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    await prisma.job.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  }
}
