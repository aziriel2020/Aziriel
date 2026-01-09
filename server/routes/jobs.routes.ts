/**
 * Jobs Routes - PRODUCTION READY
 */

import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/jobs
 * @desc    Get all user jobs
 * @access  Private
 */
router.get('/', asyncHandler(JobsController.getJobs));

/**
 * @route   GET /api/jobs/:id
 * @desc    Get specific job
 * @access  Private
 */
router.get('/:id', asyncHandler(JobsController.getJob));

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job
 * @access  Private
 */
router.delete('/:id', asyncHandler(JobsController.deleteJob));

export default router;
