/**
 * Webhook Service - EXTERNAL INTEGRATIONS
 * Notify external systems of events in real-time
 */

import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface WebhookEvent {
  event: string;
  data: any;
  timestamp: string;
  userId: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
}

export class WebhookService {
  /**
   * Send webhook notification
   */
  static async sendWebhook(userId: string, event: string, data: any): Promise<void> {
    try {
      // Get user's webhook configurations
      const allWebhooks = await prisma.webhook.findMany({
        where: {
          userId,
          enabled: true,
        },
      });

      // Filter webhooks that listen to this event (events is now a comma-separated string)
      const webhooks = allWebhooks.filter(webhook => {
        const events = webhook.events.split(',').map(e => e.trim());
        return events.includes(event);
      });

      if (webhooks.length === 0) {
        return;
      }

      const payload: WebhookEvent = {
        event,
        data,
        timestamp: new Date().toISOString(),
        userId,
      };

      // Send to all configured webhooks
      const promises = webhooks.map(webhook =>
        this.deliverWebhook(webhook.url, payload, webhook.secret || undefined)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Webhook delivery error:', error);
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  private static async deliverWebhook(
    url: string,
    payload: WebhookEvent,
    secret?: string
  ): Promise<void> {
    try {
      const signature = secret
        ? this.generateSignature(JSON.stringify(payload), secret)
        : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'NeuraField-Webhooks/1.0',
      };

      if (signature) {
        headers['X-NeuraField-Signature'] = signature;
      }

      await axios.post(url, payload, {
        headers,
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      logger.info(`Webhook delivered successfully to \${url}`);
    } catch (error: any) {
      logger.error(`Webhook delivery failed to \${url}:`, error.message);

      // Log failed delivery
      await prisma.webhookDelivery.create({
        data: {
          url,
          payload: JSON.stringify(payload),
          success: false,
          error: error.message,
          responseStatus: error.response?.status,
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private static generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Register webhook endpoint
   */
  static async registerWebhook(
    userId: string,
    config: WebhookConfig
  ): Promise<any> {
    const webhook = await prisma.webhook.create({
      data: {
        userId,
        url: config.url,
        events: config.events.join(','),
        secret: config.secret,
        enabled: true,
      },
    });

    // Test webhook
    await this.sendWebhook(userId, 'webhook.test', {
      message: 'Webhook registered successfully',
      webhookId: webhook.id,
    });

    return webhook;
  }

  /**
   * Delete webhook
   */
  static async deleteWebhook(userId: string, webhookId: string): Promise<void> {
    await prisma.webhook.delete({
      where: {
        id: webhookId,
        userId,
      },
    });
  }

  /**
   * Get webhook delivery logs
   */
  static async getDeliveryLogs(userId: string, limit: number = 50) {
    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      select: { url: true },
    });

    const urls = webhooks.map(w => w.url);

    const logs = await prisma.webhookDelivery.findMany({
      where: {
        url: { in: urls },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return logs;
  }

  /**
   * Common webhook events
   */
  static EVENTS = {
    VIDEO_CREATED: 'video.created',
    VIDEO_PROCESSING: 'video.processing',
    VIDEO_COMPLETED: 'video.completed',
    VIDEO_FAILED: 'video.failed',
    BATCH_CREATED: 'batch.created',
    BATCH_COMPLETED: 'batch.completed',
    CREDITS_LOW: 'credits.low',
    CREDITS_DEPLETED: 'credits.depleted',
    USER_REGISTERED: 'user.registered',
  };
}

export default WebhookService;
