/**
 * Analytics Service - POWERFUL INSIGHTS
 * Track everything: views, usage, costs, performance
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface AnalyticsEvent {
  userId: string;
  eventType: 'video_generated' | 'video_viewed' | 'video_downloaded' | 'video_shared' | 'credits_purchased' | 'login' | 'signup';
  metadata?: Record<string, any>;
}

export interface UsageStats {
  totalVideos: number;
  completedVideos: number;
  failedVideos: number;
  processingVideos: number;
  totalCreditsUsed: number;
  totalCost: number;
  averageGenerationTime: number;
  modelUsage: Record<string, number>;
  dailyStats: Array<{
    date: string;
    videos: number;
    cost: number;
  }>;
}

export class AnalyticsService {
  /**
   * Track analytics event
   */
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      logger.info(\`Analytics event tracked: \${event.eventType} for user \${event.userId}\`);
      // Track in-memory or send to analytics service
    } catch (error) {
      logger.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Get user usage statistics
   */
  static async getUserStats(userId: string, days: number = 30): Promise<UsageStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all jobs in period
    const jobs = await prisma.job.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate stats
    const totalVideos = jobs.length;
    const completedVideos = jobs.filter(j => j.status === 'COMPLETED').length;
    const failedVideos = jobs.filter(j => j.status === 'FAILED').length;
    const processingVideos = jobs.filter(j => j.status === 'PROCESSING' || j.status === 'PENDING').length;

    // Calculate costs
    const MODEL_COSTS: Record<string, number> = {
      sora2: 0.08,
      veo31: 0.12,
      gen45: 0.05,
      hailuo: 0.045,
      kling26: 0.08,
      klingo1: 0.12,
      wan: 0.07,
      pika22: 0.08,
      luma: 0.30,
    };

    let totalCost = 0;
    const modelUsage: Record<string, number> = {};

    for (const job of jobs) {
      const cost = MODEL_COSTS[job.provider] || 0.08;
      const duration = 10;
      totalCost += cost * duration;
      modelUsage[job.provider] = (modelUsage[job.provider] || 0) + 1;
    }

    // Calculate average generation time
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED' && j.completedAt);
    const totalTime = completedJobs.reduce((sum, job) => {
      const time = job.completedAt && job.createdAt
        ? (job.completedAt.getTime() - job.createdAt.getTime()) / 1000
        : 0;
      return sum + time;
    }, 0);
    const averageGenerationTime = completedJobs.length > 0 ? totalTime / completedJobs.length : 0;

    // Daily breakdown
    const dailyStats: Record<string, { videos: number; cost: number }> = {};
    for (const job of jobs) {
      const date = job.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { videos: 0, cost: 0 };
      }
      dailyStats[date].videos++;
      const cost = MODEL_COSTS[job.provider] || 0.08;
      dailyStats[date].cost += cost * 10;
    }

    const dailyStatsArray = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      videos: stats.videos,
      cost: stats.cost,
    }));

    return {
      totalVideos,
      completedVideos,
      failedVideos,
      processingVideos,
      totalCreditsUsed: Math.round(totalCost * 10),
      totalCost,
      averageGenerationTime: Math.round(averageGenerationTime),
      modelUsage,
      dailyStats: dailyStatsArray,
    };
  }

  /**
   * Get platform-wide statistics
   */
  static async getPlatformStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalUsers, totalJobs, completedJobs] = await Promise.all([
      prisma.user.count(),
      prisma.job.count({ where: { createdAt: { gte: startDate } } }),
      prisma.job.count({ where: { createdAt: { gte: startDate }, status: 'COMPLETED' } }),
    ]);

    return {
      totalUsers,
      totalJobs,
      completedJobs,
      successRate: totalJobs > 0 ? (completedJobs / totalJobs * 100).toFixed(2) : 0,
    };
  }

  /**
   * Get real-time metrics
   */
  static async getRealtimeMetrics() {
    const [activeJobs, queuedJobs] = await Promise.all([
      prisma.job.count({ where: { status: 'PROCESSING' } }),
      prisma.job.count({ where: { status: 'PENDING' } }),
    ]);

    return { activeJobs, queuedJobs, timestamp: new Date() };
  }
}

export default AnalyticsService;
