/**
 * Asset Management Controller
 * PRODUCTION-READY - Full implementation with database
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { StorageService } from '../services/storage.service';
import { MediaService } from '../services/media.service';
import { VideoService } from '../services/video.service';
import { AppError } from '../middleware/error.middleware';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class AssetController {
  /**
   * Get all user assets
   */
  static async getAllAssets(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { page = 1, limit = 50, type, projectId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          url: true,
          thumbnailUrl: true,
          size: true,
          mimeType: true,
          width: true,
          height: true,
          duration: true,
          tags: true,
          projectId: true,
          createdAt: true,
        },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }

  /**
   * Upload asset
   */
  static async uploadAsset(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { projectId, tags } = req.body;

    if (!req.files || !req.files.file) {
      throw new AppError('No file uploaded', 400);
    }

    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    const fileExtension = path.extname(file.name);
    const filename = `${uuidv4()}${fileExtension}`;

    let asset: any = {
      name: file.name,
      size: file.size,
      mimeType: file.mimetype,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      projectId: projectId || null,
    };

    // Determine asset type
    if (file.mimetype.startsWith('image/')) {
      asset.type = 'IMAGE';

      // Process and optimize image
      const result = await MediaService.processImage(file.data, filename, {
        maxWidth: 4096,
        maxHeight: 4096,
        quality: 90,
      });

      asset.url = result.url;
      asset.thumbnailUrl = result.thumbnail;
      asset.width = result.metadata.width;
      asset.height = result.metadata.height;
      asset.s3Key = `images/${userId}/${filename}`;
      asset.s3Bucket = process.env.AWS_S3_BUCKET || 'neurafield-quantum';
    } else if (file.mimetype.startsWith('video/')) {
      asset.type = 'VIDEO';

      // Upload video to S3
      const url = await StorageService.uploadFile(
        file.data,
        `videos/${userId}/${filename}`,
        file.mimetype
      );

      asset.url = url;
      asset.s3Key = `videos/${userId}/${filename}`;
      asset.s3Bucket = process.env.AWS_S3_BUCKET || 'neurafield-quantum';

      // Extract video metadata (async, won't block response)
      try {
        const tempPath = `/tmp/${filename}`;
        require('fs').writeFileSync(tempPath, file.data);

        const metadata = await VideoService.getMetadata(tempPath);
        asset.width = metadata.streams[0]?.width;
        asset.height = metadata.streams[0]?.height;
        asset.duration = parseFloat(metadata.format.duration || '0');

        // Clean up temp file
        require('fs').unlinkSync(tempPath);
      } catch (error) {
        // Continue even if metadata extraction fails
      }
    } else if (file.mimetype.startsWith('audio/')) {
      asset.type = 'AUDIO';

      const url = await StorageService.uploadFile(
        file.data,
        `audio/${userId}/${filename}`,
        file.mimetype
      );

      asset.url = url;
      asset.s3Key = `audio/${userId}/${filename}`;
      asset.s3Bucket = process.env.AWS_S3_BUCKET || 'neurafield-quantum';
    } else {
      asset.type = 'OTHER';

      const url = await StorageService.uploadFile(
        file.data,
        `files/${userId}/${filename}`,
        file.mimetype
      );

      asset.url = url;
      asset.s3Key = `files/${userId}/${filename}`;
      asset.s3Bucket = process.env.AWS_S3_BUCKET || 'neurafield-quantum';
    }

    // Create asset record in database
    const createdAsset = await prisma.asset.create({
      data: {
        ...asset,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: { asset: createdAsset },
    });
  }

  /**
   * Get asset by ID
   */
  static async getAsset(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const asset = await prisma.asset.findFirst({
      where: { id, userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    res.json({
      success: true,
      data: { asset },
    });
  }

  /**
   * Delete asset
   */
  static async deleteAsset(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const asset = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    // Delete from database
    await prisma.asset.delete({
      where: { id },
    });

    // Note: In production, you might want to also delete from S3
    // or implement soft deletes with a scheduled cleanup job

    res.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  }

  /**
   * Update asset metadata
   */
  static async updateAsset(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, tags, projectId } = req.body;

    const asset = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(tags && { tags: Array.isArray(tags) ? tags : [tags] }),
        ...(projectId !== undefined && { projectId }),
      },
    });

    res.json({
      success: true,
      data: { asset: updated },
    });
  }

  /**
   * Get download URL (signed URL for temporary access)
   */
  static async getDownloadUrl(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const asset = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    // Generate signed URL (valid for 1 hour)
    const downloadUrl = await StorageService.getSignedUrl(asset.s3Key);

    res.json({
      success: true,
      data: {
        downloadUrl,
        expiresIn: 3600, // seconds
        asset: {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          size: asset.size,
        },
      },
    });
  }

  /**
   * Bulk delete assets
   */
  static async bulkDelete(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { assetIds } = req.body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      throw new AppError('Asset IDs array is required', 400);
    }

    const deleted = await prisma.asset.deleteMany({
      where: {
        id: { in: assetIds },
        userId,
      },
    });

    res.json({
      success: true,
      message: `${deleted.count} assets deleted successfully`,
      data: { deletedCount: deleted.count },
    });
  }

  /**
   * Get asset statistics
   */
  static async getStats(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const [totalAssets, assetsByType, totalSize] = await Promise.all([
      prisma.asset.count({ where: { userId } }),
      prisma.asset.groupBy({
        by: ['type'],
        where: { userId },
        _count: true,
      }),
      prisma.asset.aggregate({
        where: { userId },
        _sum: { size: true },
      }),
    ]);

    const stats = {
      totalAssets,
      totalSize: totalSize._sum.size || 0,
      byType: assetsByType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as any),
    };

    res.json({
      success: true,
      data: { stats },
    });
  }
}
