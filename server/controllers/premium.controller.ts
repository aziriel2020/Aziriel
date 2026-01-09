/**
 * Premium Features Controller - ALL THE GOOD STUFF
 * Video editing, batch, analytics, audio, social, collaboration, plans
 */

import { Request, Response } from 'express';
import VideoEditingService from '../services/video-editing.service';
import BatchGenerationService from '../services/batch-generation.service';
import AnalyticsService from '../services/analytics.service';
import AudioGenerationService from '../services/audio-generation.service';
import SocialSharingService from '../services/social-sharing.service';
import CollaborationService from '../services/collaboration.service';
import PlansService from '../services/plans.service';
import WebhookService from '../services/webhook.service';
import { AppError } from '../middleware/error.middleware';

export class PremiumController {
  /**
   * VIDEO EDITING
   */
  static async trimVideo(req: Request, res: Response) {
    const { videoUrl, startTime, endTime } = req.body;
    const resultUrl = await VideoEditingService.trimVideo({ videoUrl, startTime, endTime });
    res.json({ success: true, data: { videoUrl: resultUrl } });
  }

  static async mergeVideos(req: Request, res: Response) {
    const { videoUrls, transition, transitionDuration } = req.body;
    const resultUrl = await VideoEditingService.mergeVideos({ videoUrls, transition, transitionDuration });
    res.json({ success: true, data: { videoUrl: resultUrl } });
  }

  static async applyEffects(req: Request, res: Response) {
    const { videoUrl, effects } = req.body;
    const resultUrl = await VideoEditingService.applyEffects({ videoUrl, effects });
    res.json({ success: true, data: { videoUrl: resultUrl } });
  }

  static async addWatermark(req: Request, res: Response) {
    const { videoUrl, watermarkUrl, text, position, opacity } = req.body;
    const resultUrl = await VideoEditingService.addWatermark({
      videoUrl,
      watermarkUrl,
      text,
      position,
      opacity,
    });
    res.json({ success: true, data: { videoUrl: resultUrl } });
  }

  static async resizeVideo(req: Request, res: Response) {
    const { videoUrl, width, height, aspectRatio, format, quality } = req.body;
    const resultUrl = await VideoEditingService.resizeVideo({
      videoUrl,
      width,
      height,
      aspectRatio,
      format,
      quality,
    });
    res.json({ success: true, data: { videoUrl: resultUrl } });
  }

  /**
   * BATCH GENERATION
   */
  static async createBatch(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { jobs, batchName, priority } = req.body;

    const result = await BatchGenerationService.createBatchJob({
      userId,
      jobs,
      batchName,
      priority,
    });

    res.json({ success: true, data: result });
  }

  static async getBatchStatus(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { batchId } = req.params;

    const status = await BatchGenerationService.getBatchStatus(batchId, userId);
    res.json({ success: true, data: status });
  }

  static async cancelBatch(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { batchId } = req.params;

    const result = await BatchGenerationService.cancelBatch(batchId, userId);
    res.json({ success: true, data: result });
  }

  static async retryFailedJobs(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { batchId } = req.params;

    const result = await BatchGenerationService.retryFailedJobs(batchId, userId);
    res.json({ success: true, data: result });
  }

  /**
   * ANALYTICS
   */
  static async getUserStats(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { days = 30 } = req.query;

    const stats = await AnalyticsService.getUserStats(userId, Number(days));
    res.json({ success: true, data: stats });
  }

  static async getRealtimeMetrics(req: Request, res: Response) {
    const metrics = await AnalyticsService.getRealtimeMetrics();
    res.json({ success: true, data: metrics });
  }

  /**
   * AI AUDIO
   */
  static async generateMusic(req: Request, res: Response) {
    const { prompt, duration, genre, mood, tempo } = req.body;

    const result = await AudioGenerationService.generateMusic({
      prompt,
      duration,
      genre,
      mood,
      tempo,
    });

    res.json({ success: true, data: result });
  }

  static async generateVoiceOver(req: Request, res: Response) {
    const { text, voice, language, speed, pitch } = req.body;

    const result = await AudioGenerationService.generateVoiceOver({
      text,
      voice,
      language,
      speed,
      pitch,
    });

    res.json({ success: true, data: result });
  }

  static async getMusicPresets(req: Request, res: Response) {
    const presets = AudioGenerationService.getMusicPresets();
    res.json({ success: true, data: presets });
  }

  /**
   * SOCIAL SHARING
   */
  static async getSocialMetadata(req: Request, res: Response) {
    const { jobId } = req.params;

    const metadata = await SocialSharingService.getSocialMetadata(jobId);
    res.json({ success: true, data: metadata });
  }

  static async trackShare(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { jobId, platform } = req.body;

    await SocialSharingService.trackShare(jobId, platform, userId);
    res.json({ success: true, message: 'Share tracked' });
  }

  static async getShareStats(req: Request, res: Response) {
    const { jobId } = req.params;

    const stats = await SocialSharingService.getShareStats(jobId);
    res.json({ success: true, data: stats });
  }

  /**
   * COLLABORATION
   */
  static async createWorkspace(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { name, description } = req.body;

    const workspace = await CollaborationService.createWorkspace({
      name,
      description,
      ownerId: userId,
    });

    res.json({ success: true, data: workspace });
  }

  static async addMember(req: Request, res: Response) {
    const { workspaceId, userId, role } = req.body;

    const member = await CollaborationService.addMember({
      workspaceId,
      userId,
      role,
    });

    res.json({ success: true, data: member });
  }

  static async shareJobToWorkspace(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { jobId, workspaceId } = req.body;

    await CollaborationService.shareJobToWorkspace(jobId, workspaceId, userId);
    res.json({ success: true, message: 'Job shared to workspace' });
  }

  static async addComment(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { jobId, text, timestamp } = req.body;

    const comment = await CollaborationService.addComment({
      jobId,
      userId,
      text,
      timestamp,
    });

    res.json({ success: true, data: comment });
  }

  static async getComments(req: Request, res: Response) {
    const { jobId } = req.params;

    const comments = await CollaborationService.getComments(jobId);
    res.json({ success: true, data: comments });
  }

  static async getUserWorkspaces(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const workspaces = await CollaborationService.getUserWorkspaces(userId);
    res.json({ success: true, data: workspaces });
  }

  /**
   * PLANS & CREDITS
   */
  static async getPlans(req: Request, res: Response) {
    const plans = PlansService.getPlans();
    res.json({ success: true, data: plans });
  }

  static async createCheckoutSession(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { planId } = req.body;

    const checkoutUrl = await PlansService.createCheckoutSession(userId, planId);
    res.json({ success: true, data: { checkoutUrl } });
  }

  static async purchaseCredits(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { amount } = req.body;

    const checkoutUrl = await PlansService.purchaseCredits(userId, amount);
    res.json({ success: true, data: { checkoutUrl } });
  }

  static async cancelSubscription(req: Request, res: Response) {
    const userId = (req as any).user.id;

    await PlansService.cancelSubscription(userId);
    res.json({ success: true, message: 'Subscription cancelled' });
  }

  static async getCreditHistory(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { limit = 50 } = req.query;

    const history = await PlansService.getCreditHistory(userId, Number(limit));
    res.json({ success: true, data: history });
  }

  static async getUsageStats(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const stats = await PlansService.getUsageStats(userId);
    res.json({ success: true, data: stats });
  }

  /**
   * WEBHOOKS
   */
  static async registerWebhook(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { url, events, secret } = req.body;

    const webhook = await WebhookService.registerWebhook(userId, {
      url,
      events,
      secret,
    });

    res.json({ success: true, data: webhook });
  }

  static async deleteWebhook(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { webhookId } = req.params;

    await WebhookService.deleteWebhook(userId, webhookId);
    res.json({ success: true, message: 'Webhook deleted' });
  }

  static async getWebhookLogs(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { limit = 50 } = req.query;

    const logs = await WebhookService.getDeliveryLogs(userId, Number(limit));
    res.json({ success: true, data: logs });
  }
}
