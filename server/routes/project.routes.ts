/**
 * Project Management Routes
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/projects
 * @desc    Get all user projects
 * @access  Private
 */
router.get('/', asyncHandler(ProjectController.getAllProjects));

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private
 */
router.post(
  '/',
  validate(schemas.createProject),
  asyncHandler(ProjectController.createProject)
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', asyncHandler(ProjectController.getProject));

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.patch(
  '/:id',
  validate(schemas.updateProject),
  asyncHandler(ProjectController.updateProject)
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', asyncHandler(ProjectController.deleteProject));

/**
 * @route   POST /api/projects/:id/duplicate
 * @desc    Duplicate project
 * @access  Private
 */
router.post('/:id/duplicate', asyncHandler(ProjectController.duplicateProject));

/**
 * @route   GET /api/projects/:id/jobs
 * @desc    Get all jobs for a project
 * @access  Private
 */
router.get('/:id/jobs', asyncHandler(ProjectController.getProjectJobs));

/**
 * @route   GET /api/projects/:id/assets
 * @desc    Get all assets for a project
 * @access  Private
 */
router.get('/:id/assets', asyncHandler(ProjectController.getProjectAssets));

export default router;
