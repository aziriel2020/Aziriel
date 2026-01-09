/**
 * User Routes - PRODUCTION READY
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', asyncHandler(UserController.getProfile));
router.patch('/profile', asyncHandler(UserController.updateProfile));
router.get('/credits', asyncHandler(UserController.getCredits));

export default router;
