/**
 * Premium Features Routes - THE FULL PACKAGE
 */

import { Router } from 'express';
import { PremiumController } from '../controllers/premium.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * VIDEO EDITING ROUTES
 */
router.post('/edit/trim', asyncHandler(PremiumController.trimVideo));
router.post('/edit/merge', asyncHandler(PremiumController.mergeVideos));
router.post('/edit/effects', asyncHandler(PremiumController.applyEffects));
router.post('/edit/watermark', asyncHandler(PremiumController.addWatermark));
router.post('/edit/resize', asyncHandler(PremiumController.resizeVideo));

/**
 * BATCH GENERATION ROUTES
 */
router.post('/batch', asyncHandler(PremiumController.createBatch));
router.get('/batch/:batchId', asyncHandler(PremiumController.getBatchStatus));
router.delete('/batch/:batchId', asyncHandler(PremiumController.cancelBatch));
router.post('/batch/:batchId/retry', asyncHandler(PremiumController.retryFailedJobs));

/**
 * ANALYTICS ROUTES
 */
router.get('/analytics/stats', asyncHandler(PremiumController.getUserStats));
router.get('/analytics/realtime', asyncHandler(PremiumController.getRealtimeMetrics));

/**
 * AI AUDIO ROUTES
 */
router.post('/audio/music', asyncHandler(PremiumController.generateMusic));
router.post('/audio/voiceover', asyncHandler(PremiumController.generateVoiceOver));
router.get('/audio/presets', asyncHandler(PremiumController.getMusicPresets));

/**
 * SOCIAL SHARING ROUTES
 */
router.get('/social/:jobId/metadata', asyncHandler(PremiumController.getSocialMetadata));
router.post('/social/share', asyncHandler(PremiumController.trackShare));
router.get('/social/:jobId/stats', asyncHandler(PremiumController.getShareStats));

/**
 * COLLABORATION ROUTES
 */
router.post('/workspace', asyncHandler(PremiumController.createWorkspace));
router.get('/workspace', asyncHandler(PremiumController.getUserWorkspaces));
router.post('/workspace/member', asyncHandler(PremiumController.addMember));
router.post('/workspace/share', asyncHandler(PremiumController.shareJobToWorkspace));
router.post('/comments', asyncHandler(PremiumController.addComment));
router.get('/comments/:jobId', asyncHandler(PremiumController.getComments));

/**
 * PLANS & CREDITS ROUTES
 */
router.get('/plans', asyncHandler(PremiumController.getPlans));
router.post('/plans/checkout', asyncHandler(PremiumController.createCheckoutSession));
router.post('/credits/purchase', asyncHandler(PremiumController.purchaseCredits));
router.post('/subscription/cancel', asyncHandler(PremiumController.cancelSubscription));
router.get('/credits/history', asyncHandler(PremiumController.getCreditHistory));
router.get('/usage', asyncHandler(PremiumController.getUsageStats));

/**
 * WEBHOOKS ROUTES
 */
router.post('/webhooks', asyncHandler(PremiumController.registerWebhook));
router.delete('/webhooks/:webhookId', asyncHandler(PremiumController.deleteWebhook));
router.get('/webhooks/logs', asyncHandler(PremiumController.getWebhookLogs));

export default router;
