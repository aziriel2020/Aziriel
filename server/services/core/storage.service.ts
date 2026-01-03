/**
 * STORAGE SERVICE
 * ===============
 * Complete file storage solution using AWS S3
 * - Video uploads & downloads
 * - Signed URLs for secure access
 * - Automatic cleanup
 * - Multi-part uploads for large files
 * - CDN integration (CloudFront)
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import crypto from 'crypto';
import path from 'path';
import mime from 'mime-types';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'neurafield-storage';
const CDN_URL = process.env.CDN_URL || 'https://cdn.neurafield.ai';

export class StorageService {
  /**
   * Upload file to S3
   */
  static async uploadFile(
    buffer: Buffer,
    fileName: string,
    options: {
      contentType?: string;
      userId?: string;
      folder?: string;
      isPublic?: boolean;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<{
    key: string;
    url: string;
    size: number;
    etag?: string;
  }> {
    const {
      contentType = mime.lookup(fileName) || 'application/octet-stream',
      userId,
      folder = 'uploads',
      isPublic = false,
      metadata = {},
    } = options;

    // Generate unique key
    const ext = path.extname(fileName);
    const hash = crypto.randomBytes(16).toString('hex');
    const key = userId
      ? `${folder}/${userId}/${hash}${ext}`
      : `${folder}/${hash}${ext}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private',
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    });

    const result = await s3Client.send(command);

    const url = isPublic
      ? `${CDN_URL}/${key}`
      : await this.getSignedUrl(key, 3600); // 1 hour

    return {
      key,
      url,
      size: buffer.length,
      etag: result.ETag,
    };
  }

  /**
   * Multi-part upload for large files
   */
  static async uploadLargeFile(
    stream: NodeJS.ReadableStream,
    fileName: string,
    options: {
      contentType?: string;
      userId?: string;
      folder?: string;
      isPublic?: boolean;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<{
    key: string;
    url: string;
  }> {
    const {
      contentType = mime.lookup(fileName) || 'application/octet-stream',
      userId,
      folder = 'uploads',
      isPublic = false,
      onProgress,
    } = options;

    // Generate unique key
    const ext = path.extname(fileName);
    const hash = crypto.randomBytes(16).toString('hex');
    const key = userId
      ? `${folder}/${userId}/${hash}${ext}`
      : `${folder}/${hash}${ext}`;

    // Multi-part upload
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: stream,
        ContentType: contentType,
        ACL: isPublic ? 'public-read' : 'private',
      },
      queueSize: 4, // concurrent uploads
      partSize: 1024 * 1024 * 5, // 5MB parts
    });

    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        const percent = progress.loaded && progress.total
          ? (progress.loaded / progress.total) * 100
          : 0;
        onProgress(percent);
      });
    }

    await upload.done();

    const url = isPublic
      ? `${CDN_URL}/${key}`
      : await this.getSignedUrl(key, 3600);

    return { key, url };
  }

  /**
   * Get signed URL for private file access
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Get signed upload URL (for direct browser uploads)
   */
  static async getSignedUploadUrl(
    fileName: string,
    contentType: string,
    userId: string,
    folder: string = 'uploads'
  ): Promise<{
    uploadUrl: string;
    key: string;
    url: string;
  }> {
    const ext = path.extname(fileName);
    const hash = crypto.randomBytes(16).toString('hex');
    const key = `${folder}/${userId}/${hash}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    return {
      uploadUrl,
      key,
      url: `${CDN_URL}/${key}`,
    };
  }

  /**
   * Download file from S3
   */
  static async downloadFile(key: string): Promise<{
    buffer: Buffer;
    contentType: string;
    metadata?: Record<string, string>;
  }> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    const buffer = Buffer.from(await response.Body!.transformToByteArray());

    return {
      buffer,
      contentType: response.ContentType || 'application/octet-stream',
      metadata: response.Metadata,
    };
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Delete multiple files
   */
  static async deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.deleteFile(key)));
  }

  /**
   * Check if file exists
   */
  static async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(key: string): Promise<{
    size: number;
    contentType: string;
    lastModified: Date;
    metadata?: Record<string, string>;
  }> {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata,
    };
  }

  /**
   * List files in folder
   */
  static async listFiles(
    prefix: string,
    options: {
      maxKeys?: number;
      continuationToken?: string;
    } = {}
  ): Promise<{
    files: Array<{
      key: string;
      size: number;
      lastModified: Date;
    }>;
    continuationToken?: string;
    isTruncated: boolean;
  }> {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: options.maxKeys || 1000,
      ContinuationToken: options.continuationToken,
    });

    const response = await s3Client.send(command);

    const files = (response.Contents || []).map(item => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));

    return {
      files,
      continuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
    };
  }

  /**
   * Copy file within S3
   */
  static async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: destinationKey,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
    });

    await s3Client.send(command);
  }

  /**
   * Move file (copy then delete)
   */
  static async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    await this.copyFile(sourceKey, destinationKey);
    await this.deleteFile(sourceKey);
  }

  /**
   * Clean up old files (for maintenance)
   */
  static async cleanupOldFiles(
    folder: string,
    olderThanDays: number
  ): Promise<{
    deletedCount: number;
    freedSpace: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { files } = await this.listFiles(folder);

    const oldFiles = files.filter(file => file.lastModified < cutoffDate);

    let freedSpace = 0;
    for (const file of oldFiles) {
      await this.deleteFile(file.key);
      freedSpace += file.size;
    }

    return {
      deletedCount: oldFiles.length,
      freedSpace,
    };
  }

  /**
   * Get storage usage for user
   */
  static async getUserStorageUsage(userId: string): Promise<{
    totalSize: number;
    fileCount: number;
  }> {
    const { files } = await this.listFiles(`uploads/${userId}/`);

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return {
      totalSize,
      fileCount: files.length,
    };
  }

  /**
   * Generate thumbnail for video (placeholder - requires FFmpeg)
   */
  static async generateVideoThumbnail(videoKey: string): Promise<string> {
    // In production: Download video, use FFmpeg to extract frame, upload thumbnail
    // For now, return placeholder
    const thumbnailKey = videoKey.replace(/\.[^.]+$/, '_thumbnail.jpg');
    return `${CDN_URL}/${thumbnailKey}`;
  }

  /**
   * Upload from URL
   */
  static async uploadFromUrl(
    url: string,
    options: {
      userId?: string;
      folder?: string;
      fileName?: string;
    } = {}
  ): Promise<{
    key: string;
    url: string;
    size: number;
  }> {
    // Download from URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download from URL: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const fileName = options.fileName || path.basename(new URL(url).pathname);
    const contentType = response.headers.get('content-type') || mime.lookup(fileName) || 'application/octet-stream';

    return this.uploadFile(buffer, fileName, {
      ...options,
      contentType,
    });
  }
}
