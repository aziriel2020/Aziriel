/**
 * User Controller - PRODUCTION READY
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  /**
   * GET /api/users/profile
   */
  static async getProfile(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
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
   * PATCH /api/users/profile
   */
  static async updateProfile(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
      },
    });

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  }

  /**
   * GET /api/users/credits
   */
  static async getCredits(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { credits: user.credits },
    });
  }
}
