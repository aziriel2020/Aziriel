/**
 * Storyboard Routes - LEGENDARY FRAME CONSISTENCY
 */

import { Router } from 'express';
import { StoryboardController } from '../controllers/storyboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/storyboard
 * @desc    Create storyboard with frame-to-frame consistency
 * @access  Private
 */
router.post('/', asyncHandler(StoryboardController.createStoryboard));

/**
 * @route   GET /api/storyboard
 * @desc    Get user storyboards
 * @access  Private
 */
router.get('/', asyncHandler(StoryboardController.getUserStoryboards));

/**
 * @route   GET /api/storyboard/:storyboardId
 * @desc    Get storyboard status
 * @access  Private
 */
router.get('/:storyboardId', asyncHandler(StoryboardController.getStoryboardStatus));

/**
 * @route   POST /api/storyboard/:storyboardId/merge
 * @desc    Merge all scenes into final video
 * @access  Private
 */
router.post('/:storyboardId/merge', asyncHandler(StoryboardController.mergeStoryboard));

export default router;
