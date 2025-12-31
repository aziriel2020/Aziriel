/**
 * Admin Controller
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { AnalyticsService } from '../services/analytics.service';
import { MonitoringService } from '../services/monitoring.service';
import logger from '../services/logger.service';

export class AdminController {
  /**
   * Get dashboard overview
   */
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const stats = await AnalyticsService.getPlatformAnalytics();
      const realtime = await AnalyticsService.getRealtimeStats();
      const health = await MonitoringService.healthCheck();

      res.json({
        stats,
        realtime,
        health,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get analytics
   */
  static async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await AnalyticsService.getPlatformAnalytics(start, end);

      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get realtime stats
   */
  static async getRealtimeStats(req: AuthRequest, res: Response) {
    try {
      const stats = await AnalyticsService.getRealtimeStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all users
   */
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50, search, plan, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { username: { contains: search as string, mode: 'insensitive' } },
          { name: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (plan) where.plan = plan;
      if (status) where.status = status;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
            plan: true,
            status: true,
            credits: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                jobs: true,
                posts: true,
                payments: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single user
   */
  static async getUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          jobs: { take: 10, orderBy: { createdAt: 'desc' } },
          payments: { take: 10, orderBy: { createdAt: 'desc' } },
          posts: { take: 10, orderBy: { createdAt: 'desc' } },
          _count: {
            select: {
              jobs: true,
              posts: true,
              payments: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update user
   */
  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { email, username, name, role } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { email, username, name, role },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'user_updated',
        `user:${id}`,
        { changes: { email, username, name, role } }
      );

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.user.delete({ where: { id } });

      await AnalyticsService.auditLog(
        req.user!.id,
        'user_deleted',
        `user:${id}`
      );

      res.json({ message: 'User deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { status },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'user_status_changed',
        `user:${id}`,
        { status }
      );

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update user plan
   */
  static async updateUserPlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { plan } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { plan },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'user_plan_changed',
        `user:${id}`,
        { plan }
      );

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update user credits
   */
  static async updateUserCredits(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { credits, operation } = req.body; // operation: 'add' | 'set'

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newCredits = operation === 'add' ? user.credits + credits : credits;

      const updated = await prisma.user.update({
        where: { id },
        data: { credits: newCredits },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'user_credits_changed',
        `user:${id}`,
        { operation, credits, newCredits }
      );

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all jobs
   */
  static async getJobs(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50, status, type } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        }),
        prisma.job.count({ where }),
      ]);

      res.json({
        jobs,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single job
   */
  static async getJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancel job
   */
  static async cancelJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.update({
        where: { id },
        data: { status: 'FAILED', error: 'Cancelled by admin' },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'job_cancelled',
        `job:${id}`
      );

      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete job
   */
  static async deleteJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.job.delete({ where: { id } });

      await AnalyticsService.auditLog(
        req.user!.id,
        'job_deleted',
        `job:${id}`
      );

      res.json({ message: 'Job deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get job stats
   */
  static async getJobStats(req: AuthRequest, res: Response) {
    try {
      const stats = await AnalyticsService.getPlatformAnalytics();
      res.json(stats.jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all payments
   */
  static async getPayments(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      res.json({
        payments,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single payment
   */
  static async getPayment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // TODO: Implement Stripe refund logic
      const payment = await prisma.payment.update({
        where: { id },
        data: { status: 'REFUNDED' },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'payment_refunded',
        `payment:${id}`
      );

      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get payment stats
   */
  static async getPaymentStats(req: AuthRequest, res: Response) {
    try {
      const stats = await AnalyticsService.getPlatformAnalytics();
      res.json(stats.payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get flagged posts
   */
  static async getFlaggedPosts(req: AuthRequest, res: Response) {
    try {
      // TODO: Add flag field to Post model
      const posts = await prisma.post.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      res.json({ posts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Moderate post
   */
  static async moderatePost(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body; // approve | reject | delete

      if (action === 'delete') {
        await prisma.post.delete({ where: { id } });
      }

      await AnalyticsService.auditLog(
        req.user!.id,
        'post_moderated',
        `post:${id}`,
        { action }
      );

      res.json({ message: `Post ${action}d` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete post
   */
  static async deletePost(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.post.delete({ where: { id } });

      await AnalyticsService.auditLog(
        req.user!.id,
        'post_deleted',
        `post:${id}`
      );

      res.json({ message: 'Post deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get flagged comments
   */
  static async getFlaggedComments(req: AuthRequest, res: Response) {
    try {
      const comments = await prisma.comment.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      res.json({ comments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.comment.delete({ where: { id } });

      await AnalyticsService.auditLog(
        req.user!.id,
        'comment_deleted',
        `comment:${id}`
      );

      res.json({ message: 'Comment deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get health status
   */
  static async getHealth(req: AuthRequest, res: Response) {
    try {
      const health = await MonitoringService.healthCheck();
      const metrics = await MonitoringService.getSystemMetrics();

      res.json({ health, metrics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get logs
   */
  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const { level, limit = 100 } = req.query;

      // TODO: Implement log file reading
      res.json({ logs: [], message: 'Log reading not implemented' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { userId, startDate, endDate, limit = 100 } = req.query;

      const logs = await AnalyticsService.getAuditLogs(
        userId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        Number(limit)
      );

      res.json({ logs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Toggle maintenance mode
   */
  static async toggleMaintenance(req: AuthRequest, res: Response) {
    try {
      const { enabled } = req.body;

      await redis.set('maintenance', enabled ? '1' : '0');

      await AnalyticsService.auditLog(
        req.user!.id,
        'maintenance_toggled',
        'system',
        { enabled }
      );

      res.json({ maintenance: enabled });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Clear cache
   */
  static async clearCache(req: AuthRequest, res: Response) {
    try {
      await redis.flushdb();

      await AnalyticsService.auditLog(
        req.user!.id,
        'cache_cleared',
        'system'
      );

      res.json({ message: 'Cache cleared' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get API keys
   */
  static async getApiKeys(req: AuthRequest, res: Response) {
    try {
      const keys = await prisma.apiKey.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ keys });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create API key
   */
  static async createApiKey(req: AuthRequest, res: Response) {
    try {
      const { userId, provider, expiresIn } = req.body;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (expiresIn || 365));

      const key = await prisma.apiKey.create({
        data: {
          userId,
          provider,
          key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          encryptedValue: '', // TODO: Add encryption
          expiresAt,
        },
      });

      await AnalyticsService.auditLog(
        req.user!.id,
        'api_key_created',
        `apikey:${key.id}`,
        { provider, userId }
      );

      res.json(key);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete API key
   */
  static async deleteApiKey(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.apiKey.delete({ where: { id } });

      await AnalyticsService.auditLog(
        req.user!.id,
        'api_key_deleted',
        `apikey:${id}`
      );

      res.json({ message: 'API key deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get settings
   */
  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await redis.get('settings');
      res.json(settings ? JSON.parse(settings) : {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update settings
   */
  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const settings = req.body;

      await redis.set('settings', JSON.stringify(settings));

      await AnalyticsService.auditLog(
        req.user!.id,
        'settings_updated',
        'system',
        { settings }
      );

      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
