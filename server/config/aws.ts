/**
 * AWS CONFIGURATION
 * S3 client for file storage
 */

import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || 'neurafield-uploads',
  cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
};

export default s3Client;
