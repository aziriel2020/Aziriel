/**
 * STRIPE PAYMENT SERVICE
 * Real production payment processing with Stripe
 * Supports: Cards, Apple Pay, Google Pay, Klarna, etc.
 */

import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { prisma } from '../../config/database';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

interface CreatePaymentParams {
  userId: string;
  amount: number;
  currency: string;
  bookingType: 'flight' | 'hotel' | 'package' | 'car' | 'activity';
  bookingId: string;
  description?: string;
  metadata?: Record<string, string>;
  paymentMethodId?: string;
  saveCard?: boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentIntentId?: string;
  status: string;
  amount: number;
  currency: string;
  error?: string;
}

interface RefundParams {
  transactionId: string;
  amount?: number; // Partial refund if specified
  reason?: string;
}

class StripePaymentService {
  /**
   * Create a payment intent
   */
  async createPaymentIntent(params: CreatePaymentParams): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    transactionId: string;
  }> {
    const { userId, amount, currency, bookingType, bookingId, description, metadata, paymentMethodId, saveCard } = params;

    try {
      logger.info('Creating payment intent', { userId, amount, currency, bookingType });

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(userId);

      // Create payment intent
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customer.id,
        description: description || `${bookingType} booking - ${bookingId}`,
        metadata: {
          userId,
          bookingType,
          bookingId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      };

      if (paymentMethodId) {
        paymentIntentParams.payment_method = paymentMethodId;
        paymentIntentParams.confirm = true;
        paymentIntentParams.return_url = `${process.env.CLIENT_URL}/bookings/${bookingId}/confirmation`;
      }

      if (saveCard) {
        paymentIntentParams.setup_future_usage = 'on_session';
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'PAYMENT',
          [`${bookingType}BookingId`]: bookingId,
          amount,
          currency: currency.toUpperCase(),
          status: 'PENDING',
          provider: 'stripe',
          providerTransactionId: paymentIntent.id,
          providerStatus: paymentIntent.status,
          description
        }
      });

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        transactionId: transaction.id
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction.id
      };

    } catch (error: any) {
      logger.error('Create payment intent failed', { error: error.message });
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update transaction
      const transaction = await prisma.transaction.findFirst({
        where: { providerTransactionId: paymentIntentId }
      });

      if (transaction) {
        const status = this.mapStripeStatus(paymentIntent.status);
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status,
            providerStatus: paymentIntent.status,
            cardLast4: paymentIntent.payment_method_types?.[0] === 'card'
              ? (paymentIntent as any).charges?.data?.[0]?.payment_method_details?.card?.last4
              : undefined,
            updatedAt: new Date()
          }
        });

        // Update booking status if payment succeeded
        if (status === 'SUCCEEDED') {
          await this.updateBookingPaymentStatus(transaction);
        }

        return {
          success: status === 'SUCCEEDED',
          transactionId: transaction.id,
          paymentIntentId,
          status,
          amount: transaction.amount,
          currency: transaction.currency
        };
      }

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: '',
        paymentIntentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase()
      };

    } catch (error: any) {
      logger.error('Confirm payment failed', { error: error.message });
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Process a direct payment (using saved payment method)
   */
  async processPayment(params: CreatePaymentParams & { paymentMethodId: string }): Promise<PaymentResult> {
    const { userId, amount, currency, bookingType, bookingId, paymentMethodId, description, metadata } = params;

    try {
      logger.info('Processing direct payment', { userId, amount, bookingType });

      const customer = await this.getOrCreateCustomer(userId);

      // Create and confirm payment intent in one step
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        customer: customer.id,
        payment_method: paymentMethodId,
        confirm: true,
        description: description || `${bookingType} booking - ${bookingId}`,
        metadata: {
          userId,
          bookingType,
          bookingId,
          ...metadata
        },
        return_url: `${process.env.CLIENT_URL}/bookings/${bookingId}/confirmation`
      });

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'PAYMENT',
          [`${bookingType}BookingId`]: bookingId,
          amount,
          currency: currency.toUpperCase(),
          status: this.mapStripeStatus(paymentIntent.status),
          provider: 'stripe',
          providerTransactionId: paymentIntent.id,
          providerStatus: paymentIntent.status,
          description
        }
      });

      if (paymentIntent.status === 'succeeded') {
        await this.updateBookingPaymentStatus(transaction);
      }

      logger.info('Payment processed', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      });

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: transaction.id,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount,
        currency
      };

    } catch (error: any) {
      logger.error('Process payment failed', { error: error.message });

      // Record failed transaction
      await prisma.transaction.create({
        data: {
          userId,
          type: 'PAYMENT',
          [`${bookingType}BookingId`]: bookingId,
          amount,
          currency: currency.toUpperCase(),
          status: 'FAILED',
          provider: 'stripe',
          providerStatus: error.code || 'error',
          description: `Failed: ${error.message}`
        }
      });

      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        amount,
        currency,
        error: error.message
      };
    }
  }

  /**
   * Process a refund
   */
  async processRefund(params: RefundParams): Promise<{
    success: boolean;
    refundId?: string;
    amount: number;
    currency: string;
    error?: string;
  }> {
    const { transactionId, amount, reason } = params;

    try {
      // Get original transaction
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction || !transaction.providerTransactionId) {
        throw new Error('Transaction not found');
      }

      // Create refund
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: transaction.providerTransactionId,
        reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer'
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundParams);

      // Calculate refund amount
      const refundAmount = amount || transaction.amount;

      // Create refund transaction
      await prisma.transaction.create({
        data: {
          userId: transaction.userId,
          type: refundAmount === transaction.amount ? 'REFUND' : 'PARTIAL_REFUND',
          flightBookingId: transaction.flightBookingId,
          hotelBookingId: transaction.hotelBookingId,
          packageBookingId: transaction.packageBookingId,
          carBookingId: transaction.carBookingId,
          activityBookingId: transaction.activityBookingId,
          amount: -refundAmount,
          currency: transaction.currency,
          status: 'SUCCEEDED',
          provider: 'stripe',
          providerTransactionId: refund.id,
          providerStatus: refund.status,
          refundAmount,
          refundReason: reason,
          refundedAt: new Date(),
          description: `Refund for transaction ${transactionId}`
        }
      });

      // Update original transaction
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: refundAmount === transaction.amount ? 'REFUNDED' : 'SUCCEEDED',
          refundAmount,
          refundReason: reason,
          refundedAt: new Date()
        }
      });

      logger.info('Refund processed', {
        refundId: refund.id,
        amount: refundAmount,
        originalTransactionId: transactionId
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refundAmount,
        currency: transaction.currency
      };

    } catch (error: any) {
      logger.error('Process refund failed', { error: error.message });
      return {
        success: false,
        amount: amount || 0,
        currency: 'USD',
        error: error.message
      };
    }
  }

  /**
   * Save a payment method for future use
   */
  async savePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<{
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  }> {
    try {
      const customer = await this.getOrCreateCustomer(userId);

      // Attach payment method to customer
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      // Save to database
      const savedMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          type: 'CARD',
          cardBrand: paymentMethod.card?.brand,
          cardLast4: paymentMethod.card?.last4,
          cardExpMonth: paymentMethod.card?.exp_month,
          cardExpYear: paymentMethod.card?.exp_year,
          stripePaymentMethodId: paymentMethodId,
          isDefault: false
        }
      });

      return {
        id: savedMethod.id,
        brand: paymentMethod.card?.brand || 'unknown',
        last4: paymentMethod.card?.last4 || '****',
        expMonth: paymentMethod.card?.exp_month || 0,
        expYear: paymentMethod.card?.exp_year || 0
      };

    } catch (error: any) {
      logger.error('Save payment method failed', { error: error.message });
      throw new Error(`Failed to save payment method: ${error.message}`);
    }
  }

  /**
   * Get user's saved payment methods
   */
  async getPaymentMethods(userId: string): Promise<any[]> {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return methods.map(m => ({
      id: m.id,
      type: m.type,
      brand: m.cardBrand,
      last4: m.cardLast4,
      expMonth: m.cardExpMonth,
      expYear: m.cardExpYear,
      isDefault: m.isDefault
    }));
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(userId: string, methodId: string): Promise<void> {
    const method = await prisma.paymentMethod.findFirst({
      where: { id: methodId, userId }
    });

    if (!method) {
      throw new Error('Payment method not found');
    }

    // Delete from Stripe if we have the ID
    if (method.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(method.stripePaymentMethodId);
      } catch (error) {
        logger.warn('Failed to detach from Stripe', { error });
      }
    }

    // Soft delete in database
    await prisma.paymentMethod.update({
      where: { id: methodId },
      data: { isActive: false }
    });
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    // Remove default from all methods
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // Set new default
    await prisma.paymentMethod.update({
      where: { id: methodId },
      data: { isDefault: true }
    });

    // Update Stripe customer
    const method = await prisma.paymentMethod.findUnique({
      where: { id: methodId }
    });

    if (method?.stripePaymentMethodId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      const customers = await stripe.customers.list({
        email: user?.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        await stripe.customers.update(customers.data[0].id, {
          invoice_settings: {
            default_payment_method: method.stripePaymentMethodId
          }
        });
      }
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
  }): Promise<any[]> {
    return prisma.transaction.findMany({
      where: {
        userId,
        ...(options?.type ? { type: options.type as any } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0
    });
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    logger.info('Processing Stripe webhook', { type: event.type });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await this.handleChargeRefunded(charge);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Handle subscription changes if implementing subscriptions
        break;
      }

      default:
        logger.debug('Unhandled webhook event', { type: event.type });
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async getOrCreateCustomer(userId: string): Promise<Stripe.Customer> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Check if customer exists
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
      metadata: { userId }
    });
  }

  private mapStripeStatus(status: string): 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' {
    switch (status) {
      case 'succeeded':
        return 'SUCCEEDED';
      case 'processing':
        return 'PROCESSING';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'PENDING';
      case 'canceled':
        return 'CANCELED';
      default:
        return 'FAILED';
    }
  }

  private async updateBookingPaymentStatus(transaction: any): Promise<void> {
    const bookingUpdate = { paidAmount: transaction.amount };

    if (transaction.flightBookingId) {
      await prisma.flightBooking.update({
        where: { id: transaction.flightBookingId },
        data: bookingUpdate
      });
    } else if (transaction.hotelBookingId) {
      await prisma.hotelBooking.update({
        where: { id: transaction.hotelBookingId },
        data: bookingUpdate
      });
    } else if (transaction.packageBookingId) {
      await prisma.packageBooking.update({
        where: { id: transaction.packageBookingId },
        data: bookingUpdate
      });
    } else if (transaction.carBookingId) {
      await prisma.carBooking.update({
        where: { id: transaction.carBookingId },
        data: bookingUpdate
      });
    } else if (transaction.activityBookingId) {
      await prisma.activityBooking.update({
        where: { id: transaction.activityBookingId },
        data: bookingUpdate
      });
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const transaction = await prisma.transaction.findFirst({
      where: { providerTransactionId: paymentIntent.id }
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCEEDED',
          providerStatus: 'succeeded'
        }
      });

      await this.updateBookingPaymentStatus(transaction);

      // Award loyalty points
      const pointsEarned = Math.floor(transaction.amount);
      await prisma.loyaltyTransaction.create({
        data: {
          userId: transaction.userId,
          type: 'EARN',
          points: pointsEarned,
          source: 'payment',
          sourceId: transaction.id,
          balanceAfter: 0, // Will be calculated
          description: 'Points earned from payment'
        }
      });

      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          loyaltyPoints: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned }
        }
      });
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const transaction = await prisma.transaction.findFirst({
      where: { providerTransactionId: paymentIntent.id }
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          providerStatus: paymentIntent.last_payment_error?.code || 'failed'
        }
      });
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    // Handle refund confirmation
    logger.info('Charge refunded', { chargeId: charge.id });
  }
}

export const stripePaymentService = new StripePaymentService();
