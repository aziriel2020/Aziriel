/**
 * QUEUE WORKERS MANAGER
 * Sets up and starts all Bull queue workers
 */

import Queue from 'bull';
import { redis } from '../config/redis';
import { processVideoGeneration } from './video.worker';

const redisConfig = {
  redis: {
    host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
    port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  },
};

// Create queues
export const videoQueue = new Queue('video-generation', redisConfig);
export const processingQueue = new Queue('video-processing', redisConfig);
export const translationQueue = new Queue('translation', redisConfig);

/**
 * Start all workers
 */
export function startWorkers() {
  console.log('🚀 Starting queue workers...');

  // Video generation worker
  videoQueue.process(5, async (job) => {
    return await processVideoGeneration(job);
  });

  // Event handlers
  videoQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
  });

  videoQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  videoQueue.on('progress', (job, progress) => {
    console.log(`⏳ Job ${job.id} progress: ${progress}%`);
  });

  console.log('✅ Queue workers started');
}

/**
 * Graceful shutdown
 */
export async function stopWorkers() {
  console.log('🛑 Stopping queue workers...');
  
  await videoQueue.close();
  await processingQueue.close();
  await translationQueue.close();
  
  console.log('✅ Queue workers stopped');
}

// Start workers if this file is run directly
if (require.main === module) {
  startWorkers();

  process.on('SIGTERM', async () => {
    await stopWorkers();
    process.exit(0);
  });
}
