/**
 * Plans & Credits Service - MONETIZATION
 * Subscription plans, credit system, Stripe integration
 */

import Stripe from 'stripe';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  limits: {
    videosPerMonth: number;
    maxDuration: number; // seconds
    maxQuality: '720p' | '1080p' | '4K';
    batchSize: number;
    teamMembers: number;
    priorityQueue: boolean;
    advancedFeatures: boolean;
  };
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 10,
    features: [
      '10 free credits',
      'Basic AI models',
      '720p quality',
      '10s max duration',
      'Watermark included',
    ],
    limits: {
      videosPerMonth: 10,
      maxDuration: 10,
      maxQuality: '720p',
      batchSize: 1,
      teamMembers: 1,
      priorityQueue: false,
      advancedFeatures: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 300,
    features: [
      '300 credits/month',
      'All AI models',
      '1080p quality',
      '30s max duration',
      'No watermark',
      'Priority support',
    ],
    limits: {
      videosPerMonth: 100,
      maxDuration: 30,
      maxQuality: '1080p',
      batchSize: 5,
      teamMembers: 3,
      priorityQueue: false,
      advancedFeatures: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    credits: 1200,
    features: [
      '1200 credits/month',
      'All AI models + Beta access',
      '4K quality',
      '60s max duration',
      'No watermark',
      'Priority queue',
      'Advanced editing',
      'API access',
      'Team collaboration',
    ],
    limits: {
      videosPerMonth: 500,
      maxDuration: 60,
      maxQuality: '4K',
      batchSize: 20,
      teamMembers: 10,
      priorityQueue: true,
      advancedFeatures: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    credits: 10000,
    features: [
      '10,000 credits/month',
      'All AI models + Beta access',
      '4K quality',
      'Unlimited duration',
      'No watermark',
      'Highest priority',
      'Advanced editing',
      'Full API access',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    limits: {
      videosPerMonth: 99999,
      maxDuration: 99999,
      maxQuality: '4K',
      batchSize: 100,
      teamMembers: 99999,
      priorityQueue: true,
      advancedFeatures: true,
    },
  },
};

export class PlansService {
  /**
   * Get all plans
   */
  static getPlans(): Plan[] {
    return Object.values(PLANS);
  }

  /**
   * Get plan by ID
   */
  static getPlan(planId: string): Plan | undefined {
    return PLANS[planId];
  }

  /**
   * Create Stripe checkout session
   */
  static async createCheckoutSession(userId: string, planId: string): Promise<string> {
    const plan = PLANS[planId];
    if (!plan || plan.id === 'free') {
      throw new Error('Invalid plan');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            unit_amount: plan.price * 100,
            product_data: {
              name: `NeuraField \${plan.name} Plan`,
              description: plan.features.join(', '),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `\${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `\${process.env.CLIENT_URL}/plans?payment=cancelled`,
      metadata: {
        userId,
        planId,
      },
    });

    return session.url!;
  }

  /**
   * Handle successful payment webhook
   */
  static async handlePaymentSuccess(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (!userId || !planId) {
        throw new Error('Missing metadata');
      }

      const plan = PLANS[planId];

      // Update user subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: planId,
          credits: { increment: plan.credits },
          stripeSubscriptionId: session.subscription as string,
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: session.subscription as string,
        },
      });

      logger.info(`Subscription activated for user \${userId}: \${planId}`);
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: {
        userId_stripeSubscriptionId: {
          userId,
          stripeSubscriptionId: user.stripeSubscriptionId,
        },
      },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    logger.info(`Subscription cancelled for user \${userId}`);
  }

  /**
   * Purchase credits à la carte
   */
  static async purchaseCredits(userId: string, amount: number): Promise<string> {
    const CREDIT_PRICE = 0.10; // $0.10 per credit
    const totalPrice = amount * CREDIT_PRICE;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(totalPrice * 100),
            product_data: {
              name: `\${amount} Credits`,
              description: 'NeuraField AI Credits',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `\${process.env.CLIENT_URL}/dashboard?payment=success&credits=\${amount}`,
      cancel_url: `\${process.env.CLIENT_URL}/credits?payment=cancelled`,
      metadata: {
        userId,
        credits: amount.toString(),
      },
    });

    return session.url!;
  }

  /**
   * Handle credit purchase success
   */
  static async handleCreditPurchase(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0');

      if (!userId || !credits) {
        throw new Error('Missing metadata');
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: credits },
        },
      });

      // Create transaction record
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          type: 'purchase',
          description: `Purchased \${credits} credits`,
        },
      });

      logger.info(`Credits purchased for user \${userId}: \${credits}`);
    }
  }

  /**
   * Deduct credits for job
   */
  static async deductCredits(userId: string, jobId: string, amount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
      },
    });

    // Create transaction record
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: 'debit',
        description: `Video generation (Job: \${jobId})`,
        jobId,
      },
    });

    logger.info(`Credits deducted for user \${userId}: \${amount}`);
  }

  /**
   * Calculate credit cost for job
   */
  static calculateCreditCost(provider: string, duration: number): number {
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

    const costPerSecond = MODEL_COSTS[provider] || 0.08;
    const dollarCost = costPerSecond * duration;
    const credits = Math.ceil(dollarCost / 0.10); // Convert to credits ($0.10 per credit)

    return credits;
  }

  /**
   * Get user's credit history
   */
  static async getCreditHistory(userId: string, limit: number = 50) {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  }

  /**
   * Check if user has sufficient credits
   */
  static async checkCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? user.credits >= requiredCredits : false;
  }

  /**
   * Get usage statistics
   */
  static async getUsageStats(userId: string) {
    const [user, transactions, jobs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.creditTransaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.job.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const plan = PLANS[user?.plan || 'free'];
    const creditsUsed = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      currentPlan: plan,
      creditsRemaining: user?.credits || 0,
      creditsUsedThisMonth: creditsUsed,
      videosThisMonth: jobs,
      percentUsed: Math.round((jobs / plan.limits.videosPerMonth) * 100),
    };
  }
}

export default PlansService;
