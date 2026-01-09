/**
 * S3 Upload Service - PRODUCTION READY
 * Handles file uploads to AWS S3 or compatible storage
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.S3_ENDPOINT, // Optional: for S3-compatible services like Cloudflare R2, MinIO
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Required for some S3-compatible services
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'neurafield-videos';
const CDN_URL = process.env.CDN_URL; // Optional CDN URL (e.g., CloudFront, Cloudflare)

export interface UploadOptions {
  fileBuffer?: Buffer;
  fileUrl?: string;
  localFilePath?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read';
  storageClass?: 'STANDARD' | 'INTELLIGENT_TIERING' | 'GLACIER';
}

export interface UploadResult {
  key: string;
  url: string;
  publicUrl?: string;
  signedUrl?: string;
  bucket: string;
  size?: number;
}

export class S3Service {
  /**
   * Upload a file to S3 from Buffer, URL, or local file
   */
  static async uploadFile(
    fileName: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      let fileBuffer: Buffer;
      let fileSize: number;

      // Get file buffer from different sources
      if (options.fileBuffer) {
        fileBuffer = options.fileBuffer;
        fileSize = fileBuffer.length;
      } else if (options.fileUrl) {
        // Download from URL
        logger.info(`Downloading file from URL: ${options.fileUrl}`);
        const response = await axios.get(options.fileUrl, {
          responseType: 'arraybuffer',
          timeout: 5 * 60 * 1000, // 5 minutes timeout
        });
        fileBuffer = Buffer.from(response.data);
        fileSize = fileBuffer.length;
      } else if (options.localFilePath) {
        // Read from local file
        fileBuffer = fs.readFileSync(options.localFilePath);
        fileSize = fileBuffer.length;
      } else {
        throw new Error('No file source provided (fileBuffer, fileUrl, or localFilePath)');
      }

      // Generate unique key
      const key = `${this.getFilePrefix(fileName)}/${uuidv4()}-${fileName}`;

      // Auto-detect content type if not provided
      const contentType = options.contentType || this.getContentType(fileName);

      // Upload to S3
      logger.info(`Uploading file to S3: ${key} (${this.formatBytes(fileSize)})`);

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: options.acl || 'public-read',
        StorageClass: options.storageClass || 'INTELLIGENT_TIERING',
        Metadata: options.metadata || {},
      });

      await s3Client.send(command);

      logger.info(`File uploaded successfully: ${key}`);

      // Generate URLs
      const publicUrl = this.getPublicUrl(key);
      const signedUrl = options.acl === 'private'
        ? await this.getSignedUrl(key, 3600) // 1 hour expiry
        : undefined;

      return {
        key,
        url: signedUrl || publicUrl,
        publicUrl: options.acl === 'public-read' ? publicUrl : undefined,
        signedUrl,
        bucket: BUCKET_NAME,
        size: fileSize,
      };
    } catch (error: any) {
      logger.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Upload video from URL (most common use case)
   */
  static async uploadVideoFromUrl(
    videoUrl: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    const fileName = this.extractFileName(videoUrl);
    return this.uploadFile(fileName, {
      fileUrl: videoUrl,
      contentType: 'video/mp4',
      acl: 'public-read',
      storageClass: 'INTELLIGENT_TIERING',
      metadata,
    });
  }

  /**
   * Upload thumbnail from URL
   */
  static async uploadThumbnailFromUrl(
    thumbnailUrl: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    const fileName = this.extractFileName(thumbnailUrl);
    return this.uploadFile(fileName, {
      fileUrl: thumbnailUrl,
      contentType: this.getContentType(fileName),
      acl: 'public-read',
      storageClass: 'STANDARD',
      metadata,
    });
  }

  /**
   * Get a signed URL for private files
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error: any) {
      logger.error('Failed to generate signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      logger.info(`File deleted from S3: ${key}`);
    } catch (error: any) {
      logger.error('Failed to delete file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file
   */
  private static getPublicUrl(key: string): string {
    if (CDN_URL) {
      return `${CDN_URL}/${key}`;
    }

    if (process.env.S3_ENDPOINT) {
      // Custom endpoint (e.g., Cloudflare R2, MinIO)
      return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
    }

    // Standard AWS S3 URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  /**
   * Get file prefix based on type
   */
  private static getFilePrefix(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    if (['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext)) {
      return 'videos';
    }

    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return 'thumbnails';
    }

    return 'assets';
  }

  /**
   * Get content type from file name
   */
  private static getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Extract file name from URL
   */
  private static extractFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return fileName || `file-${Date.now()}.mp4`;
    } catch {
      return `file-${Date.now()}.mp4`;
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

export default S3Service;
