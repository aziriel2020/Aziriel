/**
 * Asset Management Routes
 */

import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/assets
 * @desc    Get all user assets
 * @access  Private
 */
router.get('/', asyncHandler(AssetController.getAllAssets));

/**
 * @route   POST /api/assets/upload
 * @desc    Upload asset (image/video/audio)
 * @access  Private
 */
router.post('/upload', asyncHandler(AssetController.uploadAsset));

/**
 * @route   GET /api/assets/:id
 * @desc    Get asset by ID
 * @access  Private
 */
router.get('/:id', asyncHandler(AssetController.getAsset));

/**
 * @route   DELETE /api/assets/:id
 * @desc    Delete asset
 * @access  Private
 */
router.delete('/:id', asyncHandler(AssetController.deleteAsset));

/**
 * @route   PATCH /api/assets/:id
 * @desc    Update asset metadata
 * @access  Private
 */
router.patch('/:id', asyncHandler(AssetController.updateAsset));

/**
 * @route   GET /api/assets/:id/download
 * @desc    Get download URL for asset
 * @access  Private
 */
router.get('/:id/download', asyncHandler(AssetController.getDownloadUrl));

export default router;
