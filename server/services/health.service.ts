/**
 * HEALTH CHECK SERVICE
 * 
 * Comprehensive health checks for production monitoring:
 * - Database connectivity (Prisma)
 * - Redis connectivity
 * - Environment variables
 */

import { prisma } from '../config/database';
import { redis } from '../config/redis';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database: CheckStatus;
    redis: CheckStatus;
    environment: CheckStatus;
  };
  version: string;
}

interface CheckStatus {
  status: 'pass' | 'fail';
  message?: string;
  responseTime?: number;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const [databaseCheck, redisCheck, envCheck] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkEnvironment(),
  ]);

  const allChecks = [databaseCheck, redisCheck, envCheck];
  const failedChecks = allChecks.filter(check => check.status === 'fail');
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (failedChecks.length === 0) {
    overallStatus = 'healthy';
  } else if (failedChecks.length === allChecks.length) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: { database: databaseCheck, redis: redisCheck, environment: envCheck },
    version: '1.0.0',
  };
}

async function checkDatabase(): Promise<CheckStatus> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'pass',
      message: 'Database connected',
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: 'fail',
      message: 'Database connection failed: ' + error.message,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkRedis(): Promise<CheckStatus> {
  const startTime = Date.now();
  try {
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error('Ping failed');
    return {
      status: 'pass',
      message: 'Redis connected',
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: 'fail',
      message: 'Redis connection failed: ' + error.message,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkEnvironment(): Promise<CheckStatus> {
  const required = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    return {
      status: 'fail',
      message: 'Missing env vars: ' + missing.join(', '),
    };
  }
  
  return { status: 'pass', message: 'Environment configured' };
}

export function livenessProbe(): { status: 'alive' } {
  return { status: 'alive' };
}

export async function readinessProbe(): Promise<{ status: 'ready' | 'not_ready'; reason?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return { status: 'ready' };
  } catch (error: any) {
    return { status: 'not_ready', reason: error.message };
  }
}
