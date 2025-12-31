/**
 * Advanced Caching Service - Redis-based caching strategy
 */

import { redis } from '../config/redis';
import logger from './logger.service';

export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour
  private static readonly LONG_TTL = 86400; // 24 hours
  private static readonly SHORT_TTL = 300; // 5 minutes

  /**
   * Get cached value
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (!cached) return null;

      return JSON.parse(cached) as T;
    } catch (error: any) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set cached value
   */
  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error: any) {
      logger.error('Cache set error', { key, error: error.message });
    }
  }

  /**
   * Delete cached value
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error: any) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error: any) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
    }
  }

  /**
   * Cache wrapper for functions
   */
  static async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }

    // Cache miss - execute function
    logger.debug('Cache miss', { key });
    const result = await fn();

    // Store in cache
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Cache API response
   */
  static async cacheAPIResponse<T>(
    endpoint: string,
    params: Record<string, any>,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.wrap(key, fn, ttl || this.SHORT_TTL);
  }

  /**
   * Cache database query
   */
  static async cacheQuery<T>(
    queryName: string,
    params: Record<string, any>,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const key = `query:${queryName}:${JSON.stringify(params)}`;
    return this.wrap(key, fn, ttl || this.DEFAULT_TTL);
  }

  /**
   * Cache user data
   */
  static async cacheUser(userId: string, data: any): Promise<void> {
    await this.set(`user:${userId}`, data, this.LONG_TTL);
  }

  /**
   * Get cached user data
   */
  static async getCachedUser(userId: string): Promise<any | null> {
    return this.get(`user:${userId}`);
  }

  /**
   * Invalidate user cache
   */
  static async invalidateUser(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}*`);
  }

  /**
   * Cache job data
   */
  static async cacheJob(jobId: string, data: any): Promise<void> {
    await this.set(`job:${jobId}`, data, this.DEFAULT_TTL);
  }

  /**
   * Get cached job
   */
  static async getCachedJob(jobId: string): Promise<any | null> {
    return this.get(`job:${jobId}`);
  }

  /**
   * Increment counter
   */
  static async increment(key: string, ttl?: number): Promise<number> {
    try {
      const count = await redis.incr(key);
      if (ttl && count === 1) {
        await redis.expire(key, ttl);
      }
      return count;
    } catch (error: any) {
      logger.error('Cache increment error', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Get statistics
   */
  static async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
  }> {
    try {
      const info = await redis.info('stats');
      const dbSize = await redis.dbsize();
      const memoryInfo = await redis.info('memory');

      // Parse stats
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      const memoryMatch = memoryInfo.match(/used_memory_human:(.+)/);

      return {
        keys: dbSize,
        memory: memoryMatch ? memoryMatch[1] : 'unknown',
        hits: hitsMatch ? parseInt(hitsMatch[1]) : 0,
        misses: missesMatch ? parseInt(missesMatch[1]) : 0,
      };
    } catch (error: any) {
      logger.error('Cache stats error', { error: error.message });
      return { keys: 0, memory: 'unknown', hits: 0, misses: 0 };
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      await redis.flushdb();
      logger.info('Cache cleared');
    } catch (error: any) {
      logger.error('Cache clear error', { error: error.message });
    }
  }
}
