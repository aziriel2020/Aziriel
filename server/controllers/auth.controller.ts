/**
 * Authentication Controller
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    const token = req.headers.authorization?.substring(7);

    if (token) {
      await AuthService.logout(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const { prisma } = await import('../config/database');
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
}
