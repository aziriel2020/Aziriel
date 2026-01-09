/**
 * Social Sharing Service - GO VIRAL
 * Generate preview cards, social meta tags, short URLs
 */

import axios from 'axios';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import sharp from 'sharp';
import S3Service from './s3.service';

export interface ShareConfig {
  jobId: string;
  platform?: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube';
  message?: string;
  hashtags?: string[];
}

export interface SocialMetadata {
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  shareUrl: string;
  tags: string[];
}

export class SocialSharingService {
  /**
   * Generate social media preview card
   */
  static async generatePreviewCard(jobId: string): Promise<string> {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { user: true },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Create preview image with text overlay
      const cardWidth = 1200;
      const cardHeight = 630; // Twitter/OG optimal size

      // Download thumbnail or use gradient background
      let background: Buffer;
      if (job.thumbnailUrl) {
        const response = await axios.get(job.thumbnailUrl, { responseType: 'arraybuffer' });
        background = Buffer.from(response.data);
      } else {
        // Create gradient background
        background = await sharp({
          create: {
            width: cardWidth,
            height: cardHeight,
            channels: 4,
            background: { r: 139, g: 92, b: 246, alpha: 1 }, // Purple
          },
        })
          .png()
          .toBuffer();
      }

      // Add text overlay
      const svgText = `
        <svg width="\${cardWidth}" height="\${cardHeight}">
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)"/>
          <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="white">
            NeuraField AI
          </text>
          <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="32" fill="white" opacity="0.9">
            \${job.prompt.substring(0, 60)}...
          </text>
          <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="24" fill="white" opacity="0.7">
            Created with \${job.provider.toUpperCase()} • NeuraField.com
          </text>
        </svg>
      `;

      const cardBuffer = await sharp(background)
        .resize(cardWidth, cardHeight, { fit: 'cover' })
        .composite([{
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        }])
        .png()
        .toBuffer();

      // Upload to S3
      const uploaded = await S3Service.uploadFile(`preview-\${jobId}.png`, {
        fileBuffer: cardBuffer,
        contentType: 'image/png',
      });

      return uploaded.url;
    } catch (error: any) {
      logger.error('Preview card generation failed:', error);
      throw new Error(`Failed to generate preview card: \${error.message}`);
    }
  }

  /**
   * Generate short URL for sharing
   */
  static async generateShortUrl(jobId: string): Promise<string> {
    try {
      // Check if short URL already exists
      const existing = await prisma.shortUrl.findUnique({
        where: { jobId },
      });

      if (existing) {
        return `https://neura.fi/\${existing.shortCode}`;
      }

      // Generate unique short code
      const shortCode = this.generateShortCode();

      await prisma.shortUrl.create({
        data: {
          jobId,
          shortCode,
          clicks: 0,
        },
      });

      return `https://neura.fi/\${shortCode}`;
    } catch (error: any) {
      logger.error('Short URL generation failed:', error);
      throw new Error(`Failed to generate short URL: \${error.message}`);
    }
  }

  /**
   * Get social metadata for job
   */
  static async getSocialMetadata(jobId: string): Promise<SocialMetadata> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.status !== 'COMPLETED') {
      throw new Error('Job not found or not completed');
    }

    const [previewCardUrl, shareUrl] = await Promise.all([
      this.generatePreviewCard(jobId),
      this.generateShortUrl(jobId),
    ]);

    return {
      title: `AI-Generated Video: \${job.prompt.substring(0, 60)}`,
      description: `Created with \${job.provider.toUpperCase()} on NeuraField - The Ultimate AI Video Platform`,
      imageUrl: previewCardUrl,
      videoUrl: job.outputUrl!,
      shareUrl,
      tags: this.extractHashtags(job.prompt),
    };
  }

  /**
   * Share to specific platform (generate platform-specific URL)
   */
  static getShareUrl(config: ShareConfig, metadata: SocialMetadata): string {
    const { platform = 'twitter', message, hashtags } = config;

    const text = message || `Check out this AI-generated video: \${metadata.title}`;
    const tags = hashtags || metadata.tags;
    const url = metadata.shareUrl;

    switch (platform) {
      case 'twitter':
        const twitterHashtags = tags.join(',');
        return `https://twitter.com/intent/tweet?text=\${encodeURIComponent(text)}&url=\${encodeURIComponent(url)}&hashtags=\${twitterHashtags}`;

      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(url)}`;

      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(url)}`;

      case 'instagram':
        // Instagram doesn't support direct web sharing, return mobile deep link
        return `instagram://library?AssetPath=\${encodeURIComponent(metadata.videoUrl)}`;

      case 'tiktok':
        // TikTok requires mobile app
        return `https://www.tiktok.com/upload?url=\${encodeURIComponent(metadata.videoUrl)}`;

      case 'youtube':
        return `https://www.youtube.com/upload`;

      default:
        return url;
    }
  }

  /**
   * Track share event
   */
  static async trackShare(jobId: string, platform: string, userId?: string) {
    await prisma.share.create({
      data: {
        jobId,
        platform,
        userId,
        timestamp: new Date(),
      },
    });

    // Increment share count
    await prisma.job.update({
      where: { id: jobId },
      data: {
        metadata: {
          ...{ shares: 0 },
          shares: { increment: 1 },
        },
      },
    });
  }

  /**
   * Get share statistics
   */
  static async getShareStats(jobId: string) {
    const shares = await prisma.share.groupBy({
      by: ['platform'],
      where: { jobId },
      _count: true,
    });

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { jobId },
    });

    return {
      totalShares: shares.reduce((sum, s) => sum + s._count, 0),
      byPlatform: shares.map(s => ({
        platform: s.platform,
        count: s._count,
      })),
      clicks: shortUrl?.clicks || 0,
    };
  }

  /**
   * Generate OG meta tags for embed
   */
  static generateOGTags(metadata: SocialMetadata): string {
    return `
      <meta property="og:title" content="\${metadata.title}" />
      <meta property="og:description" content="\${metadata.description}" />
      <meta property="og:image" content="\${metadata.imageUrl}" />
      <meta property="og:video" content="\${metadata.videoUrl}" />
      <meta property="og:url" content="\${metadata.shareUrl}" />
      <meta property="og:type" content="video.other" />
      <meta name="twitter:card" content="player" />
      <meta name="twitter:title" content="\${metadata.title}" />
      <meta name="twitter:description" content="\${metadata.description}" />
      <meta name="twitter:image" content="\${metadata.imageUrl}" />
      <meta name="twitter:player" content="\${metadata.videoUrl}" />
    `.trim();
  }

  /**
   * Generate short code for URL
   */
  private static generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Extract hashtags from prompt
   */
  private static extractHashtags(prompt: string): string[] {
    const words = prompt.toLowerCase().split(' ');
    const tags = ['AIVideo', 'NeuraField'];

    // Add relevant keywords as hashtags
    if (words.some(w => ['cinematic', 'movie', 'film'].includes(w))) tags.push('Cinematic');
    if (words.some(w => ['anime', 'cartoon', 'animation'].includes(w))) tags.push('Animation');
    if (words.some(w => ['futuristic', 'scifi', 'space'].includes(w))) tags.push('SciFi');
    if (words.some(w => ['nature', 'landscape', 'sunset'].includes(w))) tags.push('Nature');

    return tags.slice(0, 5); // Limit to 5 hashtags
  }
}

export default SocialSharingService;
