/**
 * User Routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', asyncHandler(UserController.getProfile));

/**
 * @route   PATCH /api/users/me
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/me', asyncHandler(UserController.updateProfile));

/**
 * @route   GET /api/users/me/credits
 * @desc    Get user credits
 * @access  Private
 */
router.get('/me/credits', asyncHandler(UserController.getCredits));

/**
 * @route   GET /api/users/me/usage
 * @desc    Get usage statistics
 * @access  Private
 */
router.get('/me/usage', asyncHandler(UserController.getUsage));

/**
 * @route   GET /api/users/me/jobs
 * @desc    Get all user jobs
 * @access  Private
 */
router.get('/me/jobs', asyncHandler(UserController.getJobs));

/**
 * @route   GET /api/users/me/jobs/:jobId
 * @desc    Get job status
 * @access  Private
 */
router.get('/me/jobs/:jobId', asyncHandler(UserController.getJobStatus));

export default router;
