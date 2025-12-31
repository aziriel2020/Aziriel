/**
 * Credits & Billing Service - Usage tracking and credit management
 */

import { prisma } from '../config/database';
import logger from './logger.service';
import { AnalyticsService } from './analytics.service';

// Credit costs for different operations
const CREDIT_COSTS = {
  VIDEO_SD: 10,
  VIDEO_HD: 20,
  VIDEO_4K: 50,
  IMAGE_SD: 2,
  IMAGE_HD: 5,
  IMAGE_4K: 10,
  AUDIO_SHORT: 5,
  AUDIO_LONG: 15,
  MODEL_3D: 25,
  LLM_SMALL: 1,
  LLM_LARGE: 3,
};

// Plan credit limits per hour
const PLAN_LIMITS = {
  FREE: 10,
  STARTER: 100,
  PRO: 1000,
  ENTERPRISE: 10000,
};

export class CreditsService {
  /**
   * Check if user has enough credits
   */
  static async hasCredits(userId: string, amount: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return user ? user.credits >= amount : false;
  }

  /**
   * Deduct credits from user
   */
  static async deductCredits(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.credits < amount) {
        throw new Error('Insufficient credits');
      }

      // Deduct credits
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: 'DEBIT',
          reason,
          metadata: metadata || {},
          balanceAfter: user.credits - amount,
        },
      });

      logger.info('Credits deducted', { userId, amount, reason });

      // Track analytics
      await AnalyticsService.trackEvent(userId, 'credits_used', {
        amount,
        reason,
        ...metadata,
      });
    } catch (error: any) {
      logger.error('Credit deduction failed', {
        userId,
        amount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Add credits to user
   */
  static async addCredits(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Add credits
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount,
          type: 'CREDIT',
          reason,
          metadata: metadata || {},
          balanceAfter: user.credits + amount,
        },
      });

      logger.info('Credits added', { userId, amount, reason });

      await AnalyticsService.trackEvent(userId, 'credits_added', {
        amount,
        reason,
        ...metadata,
      });
    } catch (error: any) {
      logger.error('Credit addition failed', {
        userId,
        amount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Calculate cost for job
   */
  static calculateJobCost(type: string, options: Record<string, any>): number {
    const resolution = options.resolution || 'SD';

    switch (type) {
      case 'VIDEO':
        if (resolution === '4K') return CREDIT_COSTS.VIDEO_4K;
        if (resolution === 'HD') return CREDIT_COSTS.VIDEO_HD;
        return CREDIT_COSTS.VIDEO_SD;

      case 'IMAGE':
        if (resolution === '4K') return CREDIT_COSTS.IMAGE_4K;
        if (resolution === 'HD') return CREDIT_COSTS.IMAGE_HD;
        return CREDIT_COSTS.IMAGE_SD;

      case 'AUDIO':
        const duration = options.duration || 30;
        return duration > 60 ? CREDIT_COSTS.AUDIO_LONG : CREDIT_COSTS.AUDIO_SHORT;

      case 'MODEL_3D':
        return CREDIT_COSTS.MODEL_3D;

      default:
        return 10; // Default cost
    }
  }

  /**
   * Check rate limit for plan
   */
  static async checkRateLimit(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      if (!user) return false;

      const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const usage = await prisma.creditTransaction.aggregate({
        where: {
          userId,
          type: 'DEBIT',
          createdAt: {
            gte: oneHourAgo,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const usedCredits = Math.abs(usage._sum.amount || 0);
      return usedCredits < limit;
    } catch (error: any) {
      logger.error('Rate limit check failed', { userId, error: error.message });
      return true; // Fail open
    }
  }

  /**
   * Get user credit history
   */
  static async getHistory(userId: string, limit = 50) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get usage statistics
   */
  static async getUsageStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const stats = {
      totalCreditsUsed: 0,
      totalCreditsAdded: 0,
      byDay: [] as Array<{ date: string; used: number; added: number }>,
      byReason: {} as Record<string, number>,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'DEBIT') {
        stats.totalCreditsUsed += Math.abs(tx.amount);
        stats.byReason[tx.reason] =
          (stats.byReason[tx.reason] || 0) + Math.abs(tx.amount);
      } else {
        stats.totalCreditsAdded += tx.amount;
      }
    });

    return stats;
  }

  /**
   * Refund credits for failed job
   */
  static async refundJob(jobId: string): Promise<void> {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { userId: true, type: true, metadata: true },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      const cost = this.calculateJobCost(job.type, (job.metadata as any) || {});

      await this.addCredits(job.userId, cost, 'Job failed - refund', {
        jobId,
        jobType: job.type,
      });
    } catch (error: any) {
      logger.error('Job refund failed', { jobId, error: error.message });
    }
  }

  /**
   * Purchase credits
   */
  static async purchaseCredits(userId: string, packageId: string): Promise<string> {
    const packages = {
      starter: { credits: 100, price: 999 },
      pro: { credits: 1000, price: 7999 },
      enterprise: { credits: 10000, price: 59999 },
    };

    const pkg = packages[packageId as keyof typeof packages];
    if (!pkg) {
      throw new Error('Invalid package');
    }

    // This would integrate with Stripe
    // For now, just add credits
    await this.addCredits(userId, pkg.credits, 'Credit purchase', {
      packageId,
      price: pkg.price,
    });

    return `Purchased ${pkg.credits} credits`;
  }
}
