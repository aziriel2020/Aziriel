/**
 * ADMIN DASHBOARD SERVICE - Complete Platform Management
 *
 * Enterprise-grade admin tools for platform management
 * - User management
 * - Analytics and insights
 * - System health monitoring
 * - Revenue tracking
 * - Abuse prevention
 */

import { prisma } from '../config/database';

export interface PlatformStats {
  users: {
    total: number;
    active: number;
    new: number;
    byTier: Record<string, number>;
  };
  content: {
    totalVideos: number;
    totalStorage: number;
    videosToday: number;
    storageUsed: string;
  };
  revenue: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    totalRevenue: number;
    revenueToday: number;
    churnRate: number;
  };
  jobs: {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
  system: {
    uptime: number;
    cpu: number;
    memory: number;
    storage: number;
  };
}

export interface UserManagement {
  userId: string;
  email: string;
  name: string;
  tier: string;
  status: string;
  credits: number;
  totalSpent: number;
  videosCreated: number;
  lastActive: Date;
  createdAt: Date;
}

export class AdminDashboardService {
  /**
   * Get platform-wide statistics
   */
  static async getPlatformStats(): Promise<PlatformStats> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // User stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastActivityAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: monthStart } },
    });

    const usersByTier = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true,
    });

    // Content stats
    const totalVideos = await prisma.video.count();
    const videosToday = await prisma.video.count({
      where: { createdAt: { gte: todayStart } },
    });

    const storageResult = await prisma.video.aggregate({
      _sum: { fileSize: true },
    });

    // Revenue stats
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCEEDED' },
    });

    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: monthStart },
      },
    });

    const revenueToday = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: todayStart },
      },
    });

    // Calculate MRR from active subscriptions
    const subscriptions = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: { not: 'FREE' },
      },
      select: { subscriptionTier: true },
    });

    const tierPricing = {
      CREATOR: 29,
      PRO: 99,
      STUDIO: 299,
    };

    const mrr = subscriptions.reduce((sum, sub) => {
      return sum + (tierPricing[sub.subscriptionTier as keyof typeof tierPricing] || 0);
    }, 0);

    // Job stats
    const jobStats = await prisma.job.groupBy({
      by: ['status'],
      _count: true,
    });

    const jobsByStatus = jobStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        byTier: usersByTier.reduce((acc, item) => {
          acc[item.subscriptionTier] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      content: {
        totalVideos,
        videosToday,
        totalStorage: Number(storageResult._sum.fileSize || 0),
        storageUsed: this.formatBytes(Number(storageResult._sum.fileSize || 0)),
      },
      revenue: {
        mrr,
        arr: mrr * 12,
        totalRevenue: Number(payments._sum.amount || 0) / 100,
        revenueToday: Number(revenueToday._sum.amount || 0) / 100,
        churnRate: 0, // Calculate from subscription cancellations
      },
      jobs: {
        total: await prisma.job.count(),
        queued: jobsByStatus.queued || 0,
        processing: jobsByStatus.processing || 0,
        completed: jobsByStatus.completed || 0,
        failed: jobsByStatus.failed || 0,
      },
      system: {
        uptime: process.uptime(),
        cpu: 0, // Get from OS
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
        storage: 0, // Get from disk
      },
    };
  }

  /**
   * Get user list for management
   */
  static async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    tier?: string;
    status?: string;
    sortBy?: 'created' | 'active' | 'revenue';
  }): Promise<{ users: UserManagement[]; total: number }> {
    const { page = 1, limit = 50, search, tier, status, sortBy = 'created' } = options;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tier) {
      where.subscriptionTier = tier;
    }

    if (status) {
      where.status = status;
    }

    const orderBy = {
      created: { createdAt: 'desc' },
      active: { lastActivityAt: 'desc' },
      revenue: { creditsUsed: 'desc' },
    }[sortBy];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: orderBy as any,
        take: limit,
        skip: (page - 1) * limit,
        include: {
          videos: { select: { id: true } },
          payments: { select: { amount: true, status: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        userId: u.id,
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown',
        tier: u.subscriptionTier,
        status: u.status,
        credits: u.credits,
        totalSpent:
          u.payments
            .filter((p) => p.status === 'SUCCEEDED')
            .reduce((sum, p) => sum + Number(p.amount), 0) / 100,
        videosCreated: u.videos.length,
        lastActive: u.lastActivityAt || u.createdAt,
        createdAt: u.createdAt,
      })),
      total,
    };
  }

  /**
   * Suspend/unsuspend user
   */
  static async moderateUser(userId: string, action: 'suspend' | 'unsuspend' | 'ban', reason?: string): Promise<void> {
    const updates: any = {};

    if (action === 'suspend') {
      updates.status = 'SUSPENDED';
      updates.suspendedAt = new Date();
      updates.suspendedReason = reason;
    } else if (action === 'unsuspend') {
      updates.status = 'ACTIVE';
      updates.suspendedAt = null;
      updates.suspendedReason = null;
    } else if (action === 'ban') {
      updates.status = 'BANNED';
      updates.suspendedAt = new Date();
      updates.suspendedReason = reason;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId,
        action: `user_${action}`,
        resource: 'user',
        resourceId: userId,
        status: 'success',
        metadata: { reason },
      },
    });
  }

  /**
   * Get analytics time series
   */
  static async getAnalyticsSeries(metric: 'users' | 'revenue' | 'videos' | 'jobs', days: number = 30): Promise<Array<{ date: string; value: number }>> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    if (metric === 'users') {
      const data = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return data.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        value: Number(d.count),
      }));
    }

    if (metric === 'revenue') {
      const data = await prisma.$queryRaw<Array<{ date: Date; sum: bigint }>>`
        SELECT DATE(created_at) as date, SUM(amount) as sum
        FROM payments
        WHERE created_at >= ${startDate} AND status = 'SUCCEEDED'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return data.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        value: Number(d.sum) / 100,
      }));
    }

    if (metric === 'videos') {
      const data = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM videos
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return data.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        value: Number(d.count),
      }));
    }

    return [];
  }

  /**
   * Get system health
   */
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, { status: string; latency?: number }>;
  }> {
    const health: any = { status: 'healthy', services: {} };

    // Check database
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = { status: 'healthy', latency: Date.now() - start };
    } catch {
      health.services.database = { status: 'down' };
      health.status = 'degraded';
    }

    // Check Redis (queue)
    // health.services.redis = { status: 'healthy' };

    // Check S3
    // health.services.storage = { status: 'healthy' };

    return health;
  }

  /**
   * Format bytes to human readable
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
