/**
 * Analytics Service - Event Tracking
 */

import { prisma } from '../config/database';
import logger from './logger.service';

export class AnalyticsService {
  /**
   * Track an event
   */
  static async trackEvent(
    userId: string | null,
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.analytics.create({
        data: {
          userId,
          event,
          properties: properties || {},
        },
      });

      logger.info('Analytics event tracked', { event, userId, properties });
    } catch (error: any) {
      logger.error('Failed to track analytics event', { error: error.message, event, userId });
    }
  }

  /**
   * Track user signup
   */
  static async trackSignup(userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent(userId, 'user_signup', {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Track user login
   */
  static async trackLogin(userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent(userId, 'user_login', {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Track generation job
   */
  static async trackGeneration(
    userId: string,
    type: string,
    provider: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent(userId, 'generation_created', {
      type,
      provider,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Track job completion
   */
  static async trackJobComplete(
    userId: string,
    jobId: string,
    duration: number,
    status: string
  ): Promise<void> {
    await this.trackEvent(userId, 'job_completed', {
      jobId,
      duration,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track payment
   */
  static async trackPayment(
    userId: string,
    amount: number,
    plan: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent(userId, 'payment_completed', {
      amount,
      plan,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Track social action
   */
  static async trackSocialAction(
    userId: string,
    action: 'post' | 'comment' | 'like' | 'follow' | 'message',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent(userId, `social_${action}`, {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Get user analytics
   */
  static async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const events = await prisma.analytics.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate by event type
    const eventCounts: Record<string, number> = {};
    events.forEach((event) => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      eventCounts,
      events,
    };
  }

  /**
   * Get platform analytics
   */
  static async getPlatformAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Total users
    const totalUsers = await prisma.user.count();

    // Active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Total jobs
    const totalJobs = await prisma.job.count(where ? { where } : undefined);

    // Jobs by status
    const jobsByStatus = await prisma.job.groupBy({
      by: ['status'],
      _count: true,
      where,
    });

    // Jobs by type
    const jobsByType = await prisma.job.groupBy({
      by: ['type'],
      _count: true,
      where,
    });

    // Total payments
    const totalPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
      _count: true,
      where,
    });

    // Users by plan
    const usersByPlan = await prisma.user.groupBy({
      by: ['plan'],
      _count: true,
    });

    // Total posts
    const totalPosts = await prisma.post.count(where ? { where } : undefined);

    // Event counts
    const eventCounts = await prisma.analytics.groupBy({
      by: ['event'],
      _count: true,
      where,
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byPlan: usersByPlan.reduce((acc, item) => {
          acc[item.plan] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      jobs: {
        total: totalJobs,
        byStatus: jobsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byType: jobsByType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      payments: {
        total: totalPayments._count,
        revenue: totalPayments._sum.amount || 0,
      },
      social: {
        totalPosts,
      },
      events: eventCounts.reduce((acc, item) => {
        acc[item.event] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Get real-time stats
   */
  static async getRealtimeStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Active jobs in last hour
    const activeJobs = await prisma.job.count({
      where: {
        createdAt: { gte: oneHourAgo },
        status: { in: ['PENDING', 'QUEUED', 'PROCESSING'] },
      },
    });

    // Completed jobs in last hour
    const completedJobs = await prisma.job.count({
      where: {
        createdAt: { gte: oneHourAgo },
        status: 'COMPLETED',
      },
    });

    // Failed jobs in last hour
    const failedJobs = await prisma.job.count({
      where: {
        createdAt: { gte: oneHourAgo },
        status: 'FAILED',
      },
    });

    // New users in last hour
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: oneHourAgo },
      },
    });

    // Active sessions
    const activeSessions = await prisma.session.count({
      where: {
        expiresAt: { gt: now },
      },
    });

    return {
      activeJobs,
      completedJobs,
      failedJobs,
      newUsers,
      activeSessions,
      timestamp: now.toISOString(),
    };
  }

  /**
   * Create audit log
   */
  static async auditLog(
    userId: string,
    action: string,
    resource: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          metadata: metadata || {},
        },
      });

      logger.info('Audit log created', { userId, action, resource, metadata });
    } catch (error: any) {
      logger.error('Failed to create audit log', { error: error.message, userId, action });
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100
  ) {
    const where: any = {};

    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
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
    });

    return logs;
  }
}
