/**
 * MONITORING & OBSERVABILITY SERVICE
 *
 * Complete monitoring and observability platform
 * - Error tracking (Sentry integration)
 * - Performance monitoring
 * - Metrics collection
 * - Alerting system
 * - Logging aggregation
 */

import { prisma } from '../config/database';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  triggered: Date;
  resolved?: Date;
  resolvedBy?: string;
}

export class MonitoringService {
  private static metrics: PerformanceMetric[] = [];
  private static errorBuffer: ErrorLog[] = [];

  /**
   * Track performance metric
   */
  static trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: new Date(),
    });

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check for alerts
    this.checkAlertThresholds(metric);
  }

  /**
   * Log error
   */
  static async logError(error: Omit<ErrorLog, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const errorLog: ErrorLog = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...error,
    };

    this.errorBuffer.push(errorLog);

    // TODO: Send to Sentry or similar
    // Sentry.captureException(new Error(error.message), { extra: error.metadata });

    // Store in database for historical analysis
    await prisma.auditLog.create({
      data: {
        userId: error.userId,
        action: 'error',
        resource: 'system',
        resourceId: errorLog.id,
        status: 'failure',
        metadata: {
          level: error.level,
          message: error.message,
          stack: error.stack,
          ...error.metadata,
        },
      },
    });

    // Create alert for critical errors
    if (error.level === 'error') {
      await this.createAlert({
        severity: 'critical',
        title: 'Application Error',
        description: error.message,
      });
    }
  }

  /**
   * Get metrics
   */
  static getMetrics(options: {
    name?: string;
    since?: Date;
    limit?: number;
  }): PerformanceMetric[] {
    let metrics = this.metrics;

    if (options.name) {
      metrics = metrics.filter((m) => m.name === options.name);
    }

    if (options.since) {
      metrics = metrics.filter((m) => m.timestamp >= options.since!);
    }

    if (options.limit) {
      metrics = metrics.slice(-options.limit);
    }

    return metrics;
  }

  /**
   * Get error logs
   */
  static getErrors(options: {
    level?: string;
    resolved?: boolean;
    limit?: number;
  }): ErrorLog[] {
    let errors = this.errorBuffer;

    if (options.level) {
      errors = errors.filter((e) => e.level === options.level);
    }

    if (options.resolved !== undefined) {
      errors = errors.filter((e) => e.resolved === options.resolved);
    }

    if (options.limit) {
      errors = errors.slice(-options.limit);
    }

    return errors;
  }

  /**
   * Create alert
   */
  static async createAlert(data: Omit<Alert, 'id' | 'triggered'>): Promise<Alert> {
    const alert: Alert = {
      id: `alert_${Date.now()}`,
      triggered: new Date(),
      ...data,
    };

    // TODO: Send notifications (email, Slack, PagerDuty)
    // await NotificationService.sendAlert(alert);

    // Log alert
    await prisma.auditLog.create({
      data: {
        action: 'alert_created',
        resource: 'system',
        resourceId: alert.id,
        status: 'success',
        metadata: alert,
      },
    });

    return alert;
  }

  /**
   * Check alert thresholds
   */
  private static async checkAlertThresholds(metric: PerformanceMetric): Promise<void> {
    // Define alert rules
    const rules = [
      {
        metric: 'api_latency',
        threshold: 5000, // 5 seconds
        severity: 'warning' as const,
        title: 'High API Latency',
      },
      {
        metric: 'error_rate',
        threshold: 0.05, // 5%
        severity: 'critical' as const,
        title: 'High Error Rate',
      },
      {
        metric: 'memory_usage',
        threshold: 0.9, // 90%
        severity: 'warning' as const,
        title: 'High Memory Usage',
      },
      {
        metric: 'queue_size',
        threshold: 1000,
        severity: 'warning' as const,
        title: 'Large Queue Backlog',
      },
    ];

    for (const rule of rules) {
      if (metric.name === rule.metric && metric.value > rule.threshold) {
        await this.createAlert({
          severity: rule.severity,
          title: rule.title,
          description: `${metric.name} is ${metric.value}${metric.unit}, threshold is ${rule.threshold}`,
          metric: metric.name,
          threshold: rule.threshold,
          currentValue: metric.value,
        });
      }
    }
  }

  /**
   * Get system health metrics
   */
  static async getHealthMetrics(): Promise<{
    uptime: number;
    memory: { used: number; total: number; percentage: number };
    cpu: { usage: number };
    requests: { total: number; errorRate: number };
    database: { connections: number; avgQueryTime: number };
  }> {
    const mem = process.memoryUsage();
    const totalMemory = mem.heapTotal;
    const usedMemory = mem.heapUsed;

    // Get request stats from recent metrics
    const requestMetrics = this.getMetrics({
      name: 'api_request',
      since: new Date(Date.now() - 60 * 60 * 1000), // Last hour
    });

    const errorMetrics = this.getMetrics({
      name: 'api_error',
      since: new Date(Date.now() - 60 * 60 * 1000),
    });

    const errorRate = requestMetrics.length > 0
      ? errorMetrics.length / requestMetrics.length
      : 0;

    return {
      uptime: process.uptime(),
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: usedMemory / totalMemory,
      },
      cpu: {
        usage: 0, // TODO: Get from OS
      },
      requests: {
        total: requestMetrics.length,
        errorRate,
      },
      database: {
        connections: 0, // TODO: Get from Prisma
        avgQueryTime: 0,
      },
    };
  }

  /**
   * Track API request
   */
  static trackRequest(data: {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
    userId?: string;
  }): void {
    this.trackMetric({
      name: 'api_request',
      value: data.duration,
      unit: 'ms',
      tags: {
        method: data.method,
        path: data.path,
        status: data.statusCode.toString(),
        userId: data.userId || 'anonymous',
      },
    });

    if (data.statusCode >= 400) {
      this.trackMetric({
        name: 'api_error',
        value: 1,
        unit: 'count',
        tags: {
          method: data.method,
          path: data.path,
          status: data.statusCode.toString(),
        },
      });
    }

    // Track slow requests
    if (data.duration > 5000) {
      this.logError({
        level: 'warning',
        message: `Slow API request: ${data.method} ${data.path} took ${data.duration}ms`,
        userId: data.userId,
        metadata: data,
      });
    }
  }

  /**
   * Get performance report
   */
  static getPerformanceReport(hours: number = 24): {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    totalRequests: number;
    slowestEndpoints: Array<{ path: string; avgDuration: number }>;
  } {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const requests = this.getMetrics({ name: 'api_request', since });
    const errors = this.getMetrics({ name: 'api_error', since });

    if (requests.length === 0) {
      return {
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        errorRate: 0,
        totalRequests: 0,
        slowestEndpoints: [],
      };
    }

    const latencies = requests.map((r) => r.value).sort((a, b) => a - b);
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    // Group by endpoint
    const endpointStats = requests.reduce((acc, r) => {
      const path = r.tags?.path || 'unknown';
      if (!acc[path]) {
        acc[path] = { total: 0, sum: 0 };
      }
      acc[path].total++;
      acc[path].sum += r.value;
      return acc;
    }, {} as Record<string, { total: number; sum: number }>);

    const slowestEndpoints = Object.entries(endpointStats)
      .map(([path, stats]) => ({
        path,
        avgDuration: stats.sum / stats.total,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      avgLatency,
      p95Latency: latencies[p95Index] || 0,
      p99Latency: latencies[p99Index] || 0,
      errorRate: errors.length / requests.length,
      totalRequests: requests.length,
      slowestEndpoints,
    };
  }
}
