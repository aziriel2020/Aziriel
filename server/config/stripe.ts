/**
 * STRIPE CONFIGURATION
 * Stripe client for payments
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  prices: {
    CREATOR: process.env.STRIPE_PRICE_CREATOR || '',
    PRO: process.env.STRIPE_PRICE_PRO || '',
    STUDIO: process.env.STRIPE_PRICE_STUDIO || '',
  },
};

export default stripe;
