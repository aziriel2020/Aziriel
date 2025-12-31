/**
 * Media Processing Service - Image/Video optimization and processing
 */

import sharp from 'sharp';
import { StorageService } from './storage.service';
import logger from './logger.service';

export class MediaService {
  /**
   * Optimize and upload image
   */
  static async processImage(
    buffer: Buffer,
    filename: string,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    }
  ): Promise<{
    url: string;
    thumbnail: string;
    metadata: any;
  }> {
    try {
      const { maxWidth = 2048, maxHeight = 2048, quality = 85, format = 'webp' } = options || {};

      // Get image metadata
      const metadata = await sharp(buffer).metadata();

      // Optimize main image
      const optimized = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat(format, { quality })
        .toBuffer();

      // Generate thumbnail
      const thumbnail = await sharp(buffer)
        .resize(400, 400, {
          fit: 'cover',
        })
        .toFormat('webp', { quality: 75 })
        .toBuffer();

      // Upload to S3
      const mainKey = `images/${Date.now()}-${filename}.${format}`;
      const thumbKey = `thumbnails/${Date.now()}-${filename}.webp`;

      const [mainUrl, thumbnailUrl] = await Promise.all([
        StorageService.uploadFile(optimized, mainKey, `image/${format}`),
        StorageService.uploadFile(thumbnail, thumbKey, 'image/webp'),
      ]);

      logger.info('Image processed', {
        filename,
        originalSize: buffer.length,
        optimizedSize: optimized.length,
        compression: ((1 - optimized.length / buffer.length) * 100).toFixed(2) + '%',
      });

      return {
        url: mainUrl,
        thumbnail: thumbnailUrl,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: optimized.length,
          originalSize: buffer.length,
        },
      };
    } catch (error: any) {
      logger.error('Image processing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate multiple sizes for responsive images
   */
  static async generateResponsiveImages(
    buffer: Buffer,
    filename: string
  ): Promise<{
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  }> {
    const sizes = [
      { name: 'original', width: null, height: null },
      { name: 'large', width: 1920, height: 1080 },
      { name: 'medium', width: 1280, height: 720 },
      { name: 'small', width: 640, height: 480 },
      { name: 'thumbnail', width: 320, height: 240 },
    ];

    const results: any = {};

    for (const size of sizes) {
      const processed = size.width
        ? await sharp(buffer)
            .resize(size.width, size.height, { fit: 'inside' })
            .toFormat('webp', { quality: 85 })
            .toBuffer()
        : buffer;

      const key = `images/${size.name}/${Date.now()}-${filename}.webp`;
      results[size.name] = await StorageService.uploadFile(
        processed,
        key,
        'image/webp'
      );
    }

    return results;
  }

  /**
   * Extract video thumbnail
   */
  static async extractVideoThumbnail(
    videoBuffer: Buffer,
    timestamp = 0
  ): Promise<Buffer> {
    try {
      // This would typically use FFmpeg
      // For now, return a placeholder
      return sharp({
        create: {
          width: 1280,
          height: 720,
          channels: 3,
          background: { r: 0, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();
    } catch (error: any) {
      logger.error('Video thumbnail extraction failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Compress image while maintaining quality
   */
  static async compressImage(
    buffer: Buffer,
    targetSizeKB?: number
  ): Promise<Buffer> {
    let quality = 90;
    let compressed = buffer;

    // Iteratively reduce quality until target size is met
    while (quality > 10) {
      compressed = await sharp(buffer)
        .webp({ quality })
        .toBuffer();

      if (!targetSizeKB || compressed.length <= targetSizeKB * 1024) {
        break;
      }

      quality -= 10;
    }

    return compressed;
  }

  /**
   * Convert image format
   */
  static async convertFormat(
    buffer: Buffer,
    format: 'jpeg' | 'png' | 'webp' | 'avif',
    quality = 85
  ): Promise<Buffer> {
    return sharp(buffer)
      .toFormat(format, { quality })
      .toBuffer();
  }

  /**
   * Apply watermark to image
   */
  static async addWatermark(
    imageBuffer: Buffer,
    watermarkText: string
  ): Promise<Buffer> {
    const svg = `
      <svg width="200" height="50">
        <text x="10" y="30" font-family="Arial" font-size="20" fill="white" opacity="0.5">
          ${watermarkText}
        </text>
      </svg>
    `;

    return sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svg),
          gravity: 'southeast',
        },
      ])
      .toBuffer();
  }

  /**
   * Get image dominant colors
   */
  static async extractColors(buffer: Buffer, count = 5): Promise<string[]> {
    try {
      const { dominant } = await sharp(buffer).stats();

      return [
        `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`,
      ];
    } catch (error: any) {
      logger.error('Color extraction failed', { error: error.message });
      return [];
    }
  }

  /**
   * Validate image
   */
  static async validateImage(buffer: Buffer): Promise<{
    valid: boolean;
    errors: string[];
    metadata?: any;
  }> {
    const errors: string[] = [];

    try {
      const metadata = await sharp(buffer).metadata();

      // Check file size (max 50MB)
      if (buffer.length > 50 * 1024 * 1024) {
        errors.push('File size exceeds 50MB');
      }

      // Check dimensions (max 8000x8000)
      if (metadata.width && metadata.width > 8000) {
        errors.push('Image width exceeds 8000px');
      }
      if (metadata.height && metadata.height > 8000) {
        errors.push('Image height exceeds 8000px');
      }

      // Check format
      const validFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff'];
      if (metadata.format && !validFormats.includes(metadata.format)) {
        errors.push(`Unsupported format: ${metadata.format}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        metadata: errors.length === 0 ? metadata : undefined,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: ['Invalid image file'],
      };
    }
  }
}
