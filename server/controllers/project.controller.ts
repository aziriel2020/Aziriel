/**
 * Project Management Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class ProjectController {
  /**
   * Get all user projects
   */
  static async getAllProjects(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { jobs: true },
          },
        },
      }),
      prisma.project.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        projects,
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
   * Create new project
   */
  static async createProject(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        userId,
        name,
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: { project },
    });
  }

  /**
   * Get project by ID
   */
  static async getProject(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json({
      success: true,
      data: { project },
    });
  }

  /**
   * Update project
   */
  static async updateProject(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.updateMany({
      where: { id, userId },
      data: { name, description },
    });

    if (project.count === 0) {
      throw new AppError('Project not found', 404);
    }

    const updated = await prisma.project.findUnique({ where: { id } });

    res.json({
      success: true,
      data: { project: updated },
    });
  }

  /**
   * Delete project
   */
  static async deleteProject(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const deleted = await prisma.project.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      throw new AppError('Project not found', 404);
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  }

  /**
   * Duplicate project
   */
  static async duplicateProject(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const original = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!original) {
      throw new AppError('Project not found', 404);
    }

    const duplicate = await prisma.project.create({
      data: {
        userId,
        name: `${original.name} (Copy)`,
        description: original.description,
      },
    });

    res.status(201).json({
      success: true,
      data: { project: duplicate },
    });
  }

  /**
   * Get project jobs
   */
  static async getProjectJobs(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json({
      success: true,
      data: { jobs: project.jobs },
    });
  }

  /**
   * Get project assets
   */
  static async getProjectAssets(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get assets (assuming you have an Asset model)
    // This is a placeholder
    res.json({
      success: true,
      data: { assets: [] },
    });
  }
}
