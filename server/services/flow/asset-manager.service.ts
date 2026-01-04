/**
 * ASSET MANAGER SERVICE - Flow-style Asset Organization
 *
 * Comprehensive asset library management
 * - Smart tagging and search
 * - Collections and folders
 * - Asset versioning
 * - Usage tracking
 * - AI-powered organization
 */

import { prisma } from '../../config/database';
import { StorageService } from '../core/storage.service';

export interface Asset {
  id: string;
  userId: string;
  projectId?: string;
  type: 'video' | 'image' | 'audio' | 'model' | 'effect' | 'preset';
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  duration?: number;
  metadata: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    bitrate?: number;
    resolution?: string;
    colorSpace?: string;
    [key: string]: any;
  };
  tags: string[];
  collections: string[];
  aiGenerated: boolean;
  generationSettings?: any;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  assetIds: string[];
  color?: string;
  icon?: string;
  shared?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AssetManagerService {
  /**
   * Create asset from upload or generation
   */
  static async createAsset(data: {
    userId: string;
    projectId?: string;
    type: string;
    name: string;
    url: string;
    size: number;
    metadata?: any;
    tags?: string[];
    aiGenerated?: boolean;
    generationSettings?: any;
  }): Promise<Asset> {
    // Auto-generate tags using AI
    const aiTags = data.aiGenerated
      ? await this.generateSmartTags(data.type, data.metadata)
      : [];

    const asset = await prisma.asset.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        type: data.type as any,
        name: data.name,
        url: data.url,
        size: data.size,
        metadata: data.metadata || {},
        tags: [...(data.tags || []), ...aiTags],
        collections: [],
        aiGenerated: data.aiGenerated || false,
        generationSettings: data.generationSettings,
        usageCount: 0,
      },
    });

    return asset as any;
  }

  /**
   * Smart search across all assets
   */
  static async search(userId: string, query: {
    text?: string;
    type?: string[];
    tags?: string[];
    collections?: string[];
    dateRange?: { start: Date; end: Date };
    aiGenerated?: boolean;
    sortBy?: 'recent' | 'name' | 'size' | 'usage';
    limit?: number;
    offset?: number;
  }): Promise<{ assets: Asset[]; total: number }> {
    const where: any = { userId };

    if (query.text) {
      where.OR = [
        { name: { contains: query.text, mode: 'insensitive' } },
        { tags: { hasSome: [query.text.toLowerCase()] } },
      ];
    }

    if (query.type) {
      where.type = { in: query.type };
    }

    if (query.tags) {
      where.tags = { hasSome: query.tags };
    }

    if (query.aiGenerated !== undefined) {
      where.aiGenerated = query.aiGenerated;
    }

    if (query.dateRange) {
      where.createdAt = {
        gte: query.dateRange.start,
        lte: query.dateRange.end,
      };
    }

    const orderBy = {
      recent: { createdAt: 'desc' },
      name: { name: 'asc' },
      size: { size: 'desc' },
      usage: { usageCount: 'desc' },
    }[query.sortBy || 'recent'];

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: orderBy as any,
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      prisma.asset.count({ where }),
    ]);

    return { assets: assets as any, total };
  }

  /**
   * Create collection
   */
  static async createCollection(data: {
    userId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<Collection> {
    const collection = await prisma.collection.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        assetIds: [],
        color: data.color || '#667eea',
        icon: data.icon || 'folder',
        shared: false,
      },
    });

    return collection as any;
  }

  /**
   * Add assets to collection
   */
  static async addToCollection(
    collectionId: string,
    assetIds: string[]
  ): Promise<void> {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    const currentIds = (collection.assetIds as string[]) || [];
    const newIds = [...new Set([...currentIds, ...assetIds])];

    await prisma.collection.update({
      where: { id: collectionId },
      data: { assetIds: newIds, updatedAt: new Date() },
    });

    // Update assets to reference collection
    await Promise.all(
      assetIds.map(async (assetId) => {
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (asset) {
          const collections = (asset.collections as string[]) || [];
          if (!collections.includes(collectionId)) {
            collections.push(collectionId);
            await prisma.asset.update({
              where: { id: assetId },
              data: { collections },
            });
          }
        }
      })
    );
  }

  /**
   * Generate smart tags using AI
   */
  private static async generateSmartTags(
    type: string,
    metadata: any
  ): Promise<string[]> {
    // TODO: Use AI to analyze content and generate relevant tags
    const tags: string[] = [type];

    if (metadata?.resolution) {
      tags.push(metadata.resolution);
    }

    if (metadata?.style) {
      tags.push(metadata.style);
    }

    return tags;
  }

  /**
   * Track asset usage
   */
  static async trackUsage(assetId: string): Promise<void> {
    await prisma.asset.update({
      where: { id: assetId },
      data: { usageCount: { increment: 1 } },
    });
  }

  /**
   * Get asset analytics
   */
  static async getAnalytics(userId: string): Promise<{
    totalAssets: number;
    totalSize: number;
    byType: Record<string, number>;
    mostUsed: Asset[];
    recentlyAdded: Asset[];
  }> {
    const assets = await prisma.asset.findMany({
      where: { userId },
    });

    const totalAssets = assets.length;
    const totalSize = assets.reduce((sum, a) => sum + (a.size || 0), 0);

    const byType: Record<string, number> = {};
    assets.forEach((asset) => {
      byType[asset.type] = (byType[asset.type] || 0) + 1;
    });

    const mostUsed = await prisma.asset.findMany({
      where: { userId },
      orderBy: { usageCount: 'desc' },
      take: 10,
    });

    const recentlyAdded = await prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalAssets,
      totalSize,
      byType,
      mostUsed: mostUsed as any,
      recentlyAdded: recentlyAdded as any,
    };
  }

  /**
   * Delete asset
   */
  static async deleteAsset(assetId: string, userId: string): Promise<void> {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.userId !== userId) {
      throw new Error('Asset not found or unauthorized');
    }

    // Delete from storage
    await StorageService.deleteFile(asset.url);

    // Delete from database
    await prisma.asset.delete({
      where: { id: assetId },
    });
  }
}
