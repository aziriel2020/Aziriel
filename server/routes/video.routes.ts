/**
 * Video Editing Routes
 */

import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/videos/upload
 * @desc    Upload video file
 * @access  Private
 */
router.post('/upload', asyncHandler(VideoController.uploadVideo));

/**
 * @route   POST /api/videos/:id/transcode
 * @desc    Transcode video
 * @access  Private
 */
router.post('/:id/transcode', asyncHandler(VideoController.transcodeVideo));

/**
 * @route   POST /api/videos/:id/trim
 * @desc    Trim video
 * @access  Private
 */
router.post('/:id/trim', asyncHandler(VideoController.trimVideo));

/**
 * @route   POST /api/videos/:id/add-audio
 * @desc    Add audio to video
 * @access  Private
 */
router.post('/:id/add-audio', asyncHandler(VideoController.addAudio));

/**
 * @route   POST /api/videos/:id/add-text
 * @desc    Add text overlay to video
 * @access  Private
 */
router.post('/:id/add-text', asyncHandler(VideoController.addText));

/**
 * @route   POST /api/videos/:id/add-watermark
 * @desc    Add watermark to video
 * @access  Private
 */
router.post('/:id/add-watermark', asyncHandler(VideoController.addWatermark));

/**
 * @route   POST /api/videos/:id/filters
 * @desc    Apply filters to video
 * @access  Private
 */
router.post('/:id/filters', asyncHandler(VideoController.applyFilters));

/**
 * @route   POST /api/videos/:id/speed
 * @desc    Change video speed
 * @access  Private
 */
router.post('/:id/speed', asyncHandler(VideoController.changeSpeed));

/**
 * @route   POST /api/videos/concatenate
 * @desc    Concatenate multiple videos
 * @access  Private
 */
router.post('/concatenate', asyncHandler(VideoController.concatenateVideos));

/**
 * @route   POST /api/videos/:id/thumbnail
 * @desc    Generate thumbnail
 * @access  Private
 */
router.post('/:id/thumbnail', asyncHandler(VideoController.generateThumbnail));

/**
 * @route   POST /api/videos/:id/convert-gif
 * @desc    Convert video to GIF
 * @access  Private
 */
router.post('/:id/convert-gif', asyncHandler(VideoController.convertToGif));

/**
 * @route   GET /api/videos/:id/metadata
 * @desc    Get video metadata
 * @access  Private
 */
router.get('/:id/metadata', asyncHandler(VideoController.getMetadata));

/**
 * @route   POST /api/videos/create-from-images
 * @desc    Create video from images
 * @access  Private
 */
router.post('/create-from-images', asyncHandler(VideoController.createFromImages));

export default router;
