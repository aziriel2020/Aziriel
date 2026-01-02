/**
 * AI Generation Routes
 */

import { Router } from 'express';
import { GenerationController } from '../controllers/generation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/generate/video
 * @desc    Generate video from text
 * @access  Private
 */
router.post(
  '/video',
  validate(schemas.generateVideo),
  asyncHandler(GenerationController.generateVideo)
);

/**
 * @route   POST /api/generate/image
 * @desc    Generate image from text
 * @access  Private
 */
router.post(
  '/image',
  validate(schemas.generateImage),
  asyncHandler(GenerationController.generateImage)
);

/**
 * @route   POST /api/generate/image-to-video
 * @desc    Convert image to video
 * @access  Private
 */
router.post('/image-to-video', asyncHandler(GenerationController.imageToVideo));

/**
 * @route   POST /api/generate/video-to-video
 * @desc    Transform video with AI
 * @access  Private
 */
router.post('/video-to-video', asyncHandler(GenerationController.videoToVideo));

/**
 * @route   POST /api/generate/upscale
 * @desc    Upscale image with AI
 * @access  Private
 */
router.post('/upscale', asyncHandler(GenerationController.upscaleImage));

/**
 * @route   POST /api/generate/remove-background
 * @desc    Remove background from image
 * @access  Private
 */
router.post('/remove-background', asyncHandler(GenerationController.removeBackground));

/**
 * @route   POST /api/generate/music
 * @desc    Generate music from text
 * @access  Private
 */
router.post('/music', asyncHandler(GenerationController.generateMusic));

/**
 * @route   POST /api/generate/enhance-prompt
 * @desc    Enhance prompt with AI
 * @access  Private
 */
router.post('/enhance-prompt', asyncHandler(GenerationController.enhancePrompt));

/**
 * @route   POST /api/generate/script
 * @desc    Generate video script
 * @access  Private
 */
router.post('/script', asyncHandler(GenerationController.generateScript));

/**
 * @route   POST /api/generate/storyboard
 * @desc    Generate storyboard
 * @access  Private
 */
router.post('/storyboard', asyncHandler(GenerationController.generateStoryboard));

/**
 * @route   GET /api/generate/models
 * @desc    List available AI models
 * @access  Private
 */
router.get('/models', asyncHandler(GenerationController.listModels));

export default router;
