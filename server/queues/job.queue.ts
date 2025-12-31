/**
 * Job Queue - Bull/Redis
 */

import Bull from 'bull';
import { prisma } from '../config/database';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const videoQueue = new Bull('video-generation', { redis: redisConfig });
export const imageQueue = new Bull('image-generation', { redis: redisConfig });
export const audioQueue = new Bull('audio-generation', { redis: redisConfig });

// Video processor
videoQueue.process(async (job) => {
  const { jobId } = job.data;

  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'PROCESSING', progress: 50 },
  });

  // Process video generation
  await new Promise(resolve => setTimeout(resolve, 5000));

  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'COMPLETED', progress: 100 },
  });

  return { success: true };
});
