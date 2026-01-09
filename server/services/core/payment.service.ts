// @ts-nocheck
/**
 * PAYMENT SERVICE
 * ===============
 * Complete Stripe integration for subscriptions & payments
 * - Subscription management (all tiers)
 * - One-time payments (credits)
 * - Webhooks for payment events
 * - Invoice generation
 * - Usage-based billing
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Pricing configuration
const PRICING = {
  FREE: {
    tier: 'FREE',
    price: 0,
    credits: 100,
    priceId: null,
  },
  CREATOR: {
    tier: 'CREATOR',
    price: 2900, // $29/month
    credits: 1000,
    priceId: process.env.STRIPE_PRICE_CREATOR,
  },
  PRO: {
    tier: 'PRO',
    price: 9900, // $99/month
    credits: 5000,
    priceId: process.env.STRIPE_PRICE_PRO,
  },
  STUDIO: {
    tier: 'STUDIO',
    price: 29900, // $299/month
    credits: 20000,
    priceId: process.env.STRIPE_PRICE_STUDIO,
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    price: null, // Custom pricing
    credits: null,
    priceId: null,
  },
};

export class PaymentService {
  /**
   * Create Stripe customer
   */
  static async createCustomer(userId: string, email: string, metadata?: any): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
        ...metadata,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Get or create Stripe customer
   */
  static async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    return this.createCustomer(userId, user.email);
  }

  /**
   * Create subscription
   */
  static async createSubscription(
    userId: string,
    tier: keyof typeof PRICING,
    paymentMethodId?: string
  ): Promise<{
    subscriptionId: string;
    clientSecret?: string;
    status: string;
  }> {
    const pricing = PRICING[tier];

    if (!pricing.priceId) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const customerId = await this.getOrCreateCustomer(userId);

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: pricing.priceId! }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        tier,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: subscription.id,
        subscriptionTier: tier,
        subscriptionStatus: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        credits: { increment: pricing.credits! },
      },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
    };
  }

  /**
   * Update subscription
   */
  static async updateSubscription(
    userId: string,
    newTier: keyof typeof PRICING
  ): Promise<{ subscription: Stripe.Subscription }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.subscriptionId) {
      throw new Error('No active subscription');
    }

    const pricing = PRICING[newTier];

    if (!pricing.priceId) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

    // Update subscription
    const updated = await stripe.subscriptions.update(user.subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: pricing.priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        subscriptionStatus: this.mapStripeStatus(updated.status),
        currentPeriodEnd: new Date(updated.current_period_end * 1000),
      },
    });

    return { subscription: updated };
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    userId: string,
    immediately: boolean = false
  ): Promise<{ subscription: Stripe.Subscription }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.subscriptionId) {
      throw new Error('No active subscription');
    }

    let subscription: Stripe.Subscription;

    if (immediately) {
      subscription = await stripe.subscriptions.cancel(user.subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(user.subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: immediately ? 'CANCELED' : 'ACTIVE',
        cancelAtPeriodEnd: !immediately,
      },
    });

    return { subscription };
  }

  /**
   * Purchase credits (one-time payment)
   */
  static async purchaseCredits(
    userId: string,
    amount: number, // credits
    paymentMethodId: string
  ): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    status: string;
  }> {
    const customerId = await this.getOrCreateCustomer(userId);

    // Calculate price (e.g., $0.01 per credit)
    const priceInCents = amount; // 1 credit = 1 cent

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        userId,
        type: 'credit_purchase',
        credits: amount,
      },
    });

    // Record payment
    await prisma.payment.create({
      data: {
        userId,
        stripePaymentId: paymentIntent.id,
        amount: priceInCents,
        currency: 'usd',
        status: this.mapPaymentStatus(paymentIntent.status),
        description: `Purchase ${amount} credits`,
      },
    });

    // Add credits if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: amount },
        },
      });
    }

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status,
    };
  }

  /**
   * Charge credits from user account
   */
  static async chargeCredits(userId: string, amount: number, description: string): Promise<void> {
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
        creditsUsed: { increment: amount },
      },
    });

    await prisma.usageRecord.create({
      data: {
        userId,
        resource: description,
        quantity: 1,
        cost: amount,
        metadata: { description },
      },
    });
  }

  /**
   * Get billing portal URL
   */
  static async createBillingPortalSession(userId: string): Promise<{ url: string }> {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/settings/billing`,
    });

    return { url: session.url };
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(
    userId: string,
    tier: keyof typeof PRICING
  ): Promise<{ sessionId: string; url: string }> {
    const pricing = PRICING[tier];

    if (!pricing.priceId) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricing.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/settings/billing?canceled=true`,
      metadata: {
        userId,
        tier,
      },
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle subscription update
   */
  private static async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;

    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  /**
   * Handle subscription deleted
   */
  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;

    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: null,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'CANCELED',
      },
    });
  }

  /**
   * Handle invoice payment succeeded
   */
  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const userId = invoice.subscription_details?.metadata?.userId;

    if (!userId) return;

    // Record payment
    await prisma.payment.create({
      data: {
        userId,
        stripePaymentId: invoice.payment_intent as string,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'SUCCEEDED',
        description: invoice.description || 'Subscription payment',
      },
    });

    // Add monthly credits based on tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user && user.subscriptionTier in PRICING) {
      const tierKey = user.subscriptionTier as keyof typeof PRICING;
      const credits = PRICING[tierKey].credits;

      if (credits) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: { increment: credits },
          },
        });
      }
    }
  }

  /**
   * Handle invoice payment failed
   */
  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const userId = invoice.subscription_details?.metadata?.userId;

    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'PAST_DUE',
      },
    });

    // TODO: Send payment failed email
  }

  /**
   * Handle payment intent succeeded
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata.userId;
    const type = paymentIntent.metadata.type;

    if (!userId) return;

    // If it's a credit purchase, add credits
    if (type === 'credit_purchase') {
      const credits = parseInt(paymentIntent.metadata.credits || '0');

      if (credits > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: { increment: credits },
          },
        });
      }
    }
  }

  /**
   * Handle payment intent failed
   */
  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata.userId;

    if (!userId) return;

    await prisma.payment.create({
      data: {
        userId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'FAILED',
        description: 'Payment failed',
      },
    });

    // TODO: Send payment failed email
  }

  /**
   * Get user's payment history
   */
  static async getPaymentHistory(userId: string, limit: number = 20): Promise<any[]> {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get user's usage records
   */
  static async getUsageRecords(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return prisma.usageRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Map Stripe subscription status to our enum
   */
  private static mapStripeStatus(status: Stripe.Subscription.Status): any {
    const mapping: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      unpaid: 'UNPAID',
      canceled: 'CANCELED',
      incomplete: 'INACTIVE',
      incomplete_expired: 'INACTIVE',
      trialing: 'TRIALING',
      paused: 'PAUSED',
    };

    return mapping[status] || 'INACTIVE';
  }

  /**
   * Map Stripe payment status to our enum
   */
  private static mapPaymentStatus(status: string): any {
    const mapping: Record<string, string> = {
      succeeded: 'SUCCEEDED',
      processing: 'PENDING',
      requires_payment_method: 'FAILED',
      requires_confirmation: 'PENDING',
      requires_action: 'PENDING',
      canceled: 'CANCELED',
      failed: 'FAILED',
    };

    return mapping[status] || 'PENDING';
  }
}
