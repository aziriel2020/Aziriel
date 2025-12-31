/**
 * Webhooks Service - User-defined webhooks for events
 */

import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../config/database';
import logger from './logger.service';

export type WebhookEvent =
  | 'job.created'
  | 'job.completed'
  | 'job.failed'
  | 'payment.completed'
  | 'user.created'
  | 'post.created'
  | 'comment.created';

export class WebhookService {
  /**
   * Trigger webhook
   */
  static async trigger(
    userId: string,
    event: WebhookEvent,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      // Get user's active webhooks for this event
      const webhooks = await prisma.webhook.findMany({
        where: {
          userId,
          event,
          active: true,
        },
      });

      if (webhooks.length === 0) {
        return;
      }

      // Trigger all webhooks in parallel
      const promises = webhooks.map((webhook) =>
        this.sendWebhook(webhook.id, webhook.url, webhook.secret, event, payload)
      );

      await Promise.allSettled(promises);
    } catch (error: any) {
      logger.error('Webhook trigger error', { error: error.message, event, userId });
    }
  }

  /**
   * Send webhook request
   */
  private static async sendWebhook(
    webhookId: string,
    url: string,
    secret: string | null,
    event: WebhookEvent,
    payload: Record<string, any>
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Prepare payload
      const webhookPayload = {
        id: crypto.randomUUID(),
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      // Generate signature
      const signature = secret
        ? crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(webhookPayload))
            .digest('hex')
        : null;

      // Send request
      const response = await axios.post(url, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NEURAFIELD-Webhook/1.0',
          ...(signature && { 'X-Webhook-Signature': signature }),
        },
        timeout: 10000, // 10 seconds
      });

      const duration = Date.now() - startTime;

      // Log successful delivery
      await prisma.webhookLog.create({
        data: {
          webhookId,
          event,
          payload: webhookPayload,
          status: response.status,
          response: response.data,
          duration,
        },
      });

      logger.info('Webhook delivered', {
        webhookId,
        event,
        status: response.status,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log failed delivery
      await prisma.webhookLog.create({
        data: {
          webhookId,
          event,
          payload: { event, data: payload },
          status: error.response?.status || 0,
          response: error.message,
          duration,
          error: error.message,
        },
      });

      logger.error('Webhook delivery failed', {
        webhookId,
        event,
        error: error.message,
        duration,
      });

      // Retry logic (max 3 retries)
      const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId },
      });

      if (webhook && webhook.retries < 3) {
        await prisma.webhook.update({
          where: { id: webhookId },
          data: { retries: webhook.retries + 1 },
        });

        // Retry with exponential backoff
        const delay = Math.pow(2, webhook.retries) * 1000;
        setTimeout(() => {
          this.sendWebhook(webhookId, url, secret, event, payload);
        }, delay);
      } else {
        // Disable webhook after max retries
        await prisma.webhook.update({
          where: { id: webhookId },
          data: { active: false },
        });

        logger.warn('Webhook disabled after max retries', { webhookId });
      }
    }
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Test webhook
   */
  static async testWebhook(webhookId: string): Promise<boolean> {
    try {
      const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId },
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      await this.sendWebhook(
        webhook.id,
        webhook.url,
        webhook.secret,
        'job.created' as WebhookEvent,
        {
          test: true,
          message: 'This is a test webhook',
        }
      );

      return true;
    } catch (error: any) {
      logger.error('Webhook test failed', { webhookId, error: error.message });
      return false;
    }
  }

  /**
   * Get webhook logs
   */
  static async getLogs(webhookId: string, limit = 100) {
    return prisma.webhookLog.findMany({
      where: { webhookId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Replay webhook
   */
  static async replay(logId: string): Promise<void> {
    const log = await prisma.webhookLog.findUnique({
      where: { id: logId },
      include: { webhook: true },
    });

    if (!log || !log.webhook) {
      throw new Error('Log or webhook not found');
    }

    await this.sendWebhook(
      log.webhook.id,
      log.webhook.url,
      log.webhook.secret,
      log.event as WebhookEvent,
      log.payload as Record<string, any>
    );
  }
}
