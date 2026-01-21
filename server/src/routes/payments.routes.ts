/**
 * PAYMENT API ROUTES
 * Stripe payment processing endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { stripePaymentService } from '../services/payments/stripe.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Validation schemas
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  bookingType: z.enum(['flight', 'hotel', 'package', 'car', 'activity']),
  bookingId: z.string().uuid(),
  description: z.string().optional(),
  paymentMethodId: z.string().optional(),
  saveCard: z.boolean().optional()
});

const processPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  bookingType: z.enum(['flight', 'hotel', 'package', 'car', 'activity']),
  bookingId: z.string().uuid(),
  paymentMethodId: z.string(),
  description: z.string().optional()
});

const refundSchema = z.object({
  transactionId: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().optional()
});

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create a payment intent
 * @access  Private
 */
router.post(
  '/create-intent',
  authMiddleware,
  validateRequest(createPaymentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { amount, currency, bookingType, bookingId, description, paymentMethodId, saveCard } = req.body;

    const result = await stripePaymentService.createPaymentIntent({
      userId,
      amount,
      currency,
      bookingType,
      bookingId,
      description,
      paymentMethodId,
      saveCard
    });

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm a payment
 * @access  Private
 */
router.post(
  '/confirm',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'paymentIntentId is required'
      });
    }

    const result = await stripePaymentService.confirmPayment(paymentIntentId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/payments/process
 * @desc    Process a payment directly (using saved payment method)
 * @access  Private
 */
router.post(
  '/process',
  authMiddleware,
  validateRequest(processPaymentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { amount, currency, bookingType, bookingId, paymentMethodId, description } = req.body;

    const result = await stripePaymentService.processPayment({
      userId,
      amount,
      currency,
      bookingType,
      bookingId,
      paymentMethodId,
      description
    });

    res.json({
      success: result.success,
      data: result,
      error: result.error
    });
  })
);

/**
 * @route   POST /api/payments/refund
 * @desc    Process a refund
 * @access  Private
 */
router.post(
  '/refund',
  authMiddleware,
  validateRequest(refundSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await stripePaymentService.processRefund(req.body);

    res.json({
      success: result.success,
      data: result,
      error: result.error
    });
  })
);

/**
 * @route   GET /api/payments/methods
 * @desc    Get user's saved payment methods
 * @access  Private
 */
router.get(
  '/methods',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const methods = await stripePaymentService.getPaymentMethods(userId);

    res.json({
      success: true,
      data: methods
    });
  })
);

/**
 * @route   POST /api/payments/methods
 * @desc    Save a payment method
 * @access  Private
 */
router.post(
  '/methods',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'paymentMethodId is required'
      });
    }

    const method = await stripePaymentService.savePaymentMethod(userId, paymentMethodId);

    res.status(201).json({
      success: true,
      data: method
    });
  })
);

/**
 * @route   DELETE /api/payments/methods/:methodId
 * @desc    Delete a payment method
 * @access  Private
 */
router.delete(
  '/methods/:methodId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { methodId } = req.params;

    await stripePaymentService.deletePaymentMethod(userId, methodId);

    res.json({
      success: true,
      message: 'Payment method deleted'
    });
  })
);

/**
 * @route   POST /api/payments/methods/:methodId/default
 * @desc    Set a payment method as default
 * @access  Private
 */
router.post(
  '/methods/:methodId/default',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { methodId } = req.params;

    await stripePaymentService.setDefaultPaymentMethod(userId, methodId);

    res.json({
      success: true,
      message: 'Default payment method updated'
    });
  })
);

/**
 * @route   GET /api/payments/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get(
  '/transactions',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { limit = 20, offset = 0, type } = req.query;

    const transactions = await stripePaymentService.getTransactions(userId, {
      limit: Number(limit),
      offset: Number(offset),
      type: type as string
    });

    res.json({
      success: true,
      data: transactions
    });
  })
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook handler
 * @access  Public (verified by Stripe signature)
 */
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (error: any) {
      logger.error('Webhook signature verification failed', { error: error.message });
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Process the event
    await stripePaymentService.handleWebhook(event);

    res.json({ received: true });
  })
);

export default router;
