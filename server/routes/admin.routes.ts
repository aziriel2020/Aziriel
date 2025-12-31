/**
 * Admin Routes
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

// Dashboard & Analytics
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);
router.get('/analytics/realtime', AdminController.getRealtimeStats);

// User Management
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.put('/users/:id/status', AdminController.updateUserStatus);
router.put('/users/:id/plan', AdminController.updateUserPlan);
router.put('/users/:id/credits', AdminController.updateUserCredits);

// Job Management
router.get('/jobs', AdminController.getJobs);
router.get('/jobs/:id', AdminController.getJob);
router.put('/jobs/:id/cancel', AdminController.cancelJob);
router.delete('/jobs/:id', AdminController.deleteJob);
router.get('/jobs/stats', AdminController.getJobStats);

// Payment Management
router.get('/payments', AdminController.getPayments);
router.get('/payments/:id', AdminController.getPayment);
router.post('/payments/:id/refund', AdminController.refundPayment);
router.get('/payments/stats', AdminController.getPaymentStats);

// Content Moderation
router.get('/posts/flagged', AdminController.getFlaggedPosts);
router.put('/posts/:id/moderate', AdminController.moderatePost);
router.delete('/posts/:id', AdminController.deletePost);
router.get('/comments/flagged', AdminController.getFlaggedComments);
router.delete('/comments/:id', AdminController.deleteComment);

// System Management
router.get('/health', AdminController.getHealth);
router.get('/logs', AdminController.getLogs);
router.get('/audit-logs', AdminController.getAuditLogs);
router.post('/maintenance', AdminController.toggleMaintenance);
router.post('/cache/clear', AdminController.clearCache);

// API Keys
router.get('/api-keys', AdminController.getApiKeys);
router.post('/api-keys', AdminController.createApiKey);
router.delete('/api-keys/:id', AdminController.deleteApiKey);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

export default router;
