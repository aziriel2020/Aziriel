/**
 * Monitoring Service - Sentry & Health Checks
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import logger from './logger.service';

/**
 * Initialize Sentry
 */
export const initSentry = (app: any) => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      environment: process.env.NODE_ENV || 'development',
    });

    logger.info('Sentry initialized');
  }
};

/**
 * Sentry request handler (must be first middleware)
 */
export const sentryRequestHandler = () => Sentry.Handlers.requestHandler();

/**
 * Sentry tracing handler
 */
export const sentryTracingHandler = () => Sentry.Handlers.tracingHandler();

/**
 * Sentry error handler (must be after all routes)
 */
export const sentryErrorHandler = () => Sentry.Handlers.errorHandler();

export class MonitoringService {
  /**
   * Capture exception
   */
  static captureException(error: Error, context?: Record<string, any>) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
    logger.error('Exception captured', { error: error.message, stack: error.stack, context });
  }

  /**
   * Capture message
   */
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(message, {
        level,
        extra: context,
      });
    }
    logger.log(level, message, context);
  }

  /**
   * Set user context
   */
  static setUser(user: { id: string; email: string; username?: string }) {
    if (process.env.SENTRY_DSN) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }
  }

  /**
   * Clear user context
   */
  static clearUser() {
    if (process.env.SENTRY_DSN) {
      Sentry.setUser(null);
    }
  }

  /**
   * Add breadcrumb
   */
  static addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  }

  /**
   * Health check - Database
   */
  static async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      return { status: 'healthy', latency };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Health check - Redis
   */
  static async checkRedis(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;

      return { status: 'healthy', latency };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Health check - Storage (S3)
   */
  static async checkStorage(): Promise<{ status: 'healthy' | 'unhealthy'; error?: string }> {
    try {
      // Simple check - just verify AWS credentials are set
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        return { status: 'unhealthy', error: 'AWS credentials not configured' };
      }

      return { status: 'healthy' };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Complete health check
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      database: any;
      redis: any;
      storage: any;
    };
    timestamp: string;
  }> {
    const [database, redis, storage] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkStorage(),
    ]);

    const services = { database, redis, storage };

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    const unhealthyCount = Object.values(services).filter((s) => s.status === 'unhealthy').length;

    if (unhealthyCount === 0) {
      status = 'healthy';
    } else if (unhealthyCount === Object.keys(services).length) {
      status = 'unhealthy';
    } else {
      status = 'degraded';
    }

    return {
      status,
      services,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics() {
    const memoryUsage = process.memoryUsage();

    return {
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
    };
  }

  /**
   * Performance monitoring
   */
  static startTransaction(name: string, op: string) {
    if (process.env.SENTRY_DSN) {
      return Sentry.startTransaction({
        name,
        op,
      });
    }
    return null;
  }

  /**
   * Track performance metric
   */
  static trackPerformance(metric: string, value: number, tags?: Record<string, string>) {
    if (process.env.SENTRY_DSN) {
      Sentry.metrics.gauge(metric, value, {
        tags,
        timestamp: Date.now() / 1000,
      });
    }

    logger.info('Performance metric', { metric, value, tags });
  }
}
