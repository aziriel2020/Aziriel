/**
 * FLOW STUDIO API ROUTES
 *
 * Complete RESTful API for all Flow features
 */

import { Router } from 'express';
import { FlowEngineService } from '../services/flow/flow-engine.service';
import { ScenebuilderService } from '../services/flow/scenebuilder.service';
import { IngredientsToVideoService } from '../services/flow/ingredients-to-video.service';
import { TimelineEditorService } from '../services/flow/timeline-editor.service';
import { VideoExtensionService } from '../services/flow/video-extension.service';
import { ObjectInsertionService } from '../services/flow/object-insertion.service';
import { UpscalingService } from '../services/flow/upscaling.service';
import { AssetManagerService } from '../services/flow/asset-manager.service';
import { ExportService } from '../services/flow/export.service';
import { VideoProcessingService } from '../services/flow/video-processing.service';

const router = Router();

// ============================================================================
// FLOW ENGINE - Workflows
// ============================================================================

// Create Flow project
router.post('/projects', async (req, res) => {
  try {
    const project = await FlowEngineService.createProject({
      userId: req.user?.id!,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
    });
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Quick Start: Text to Film
router.post('/quick-start/text-to-film', async (req, res) => {
  try {
    const result = await FlowEngineService.textToFilm({
      userId: req.user?.id!,
      prompt: req.body.prompt,
      style: req.body.style,
      duration: req.body.duration,
      quality: req.body.quality,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Quick Start: Images to Story
router.post('/quick-start/images-to-story', async (req, res) => {
  try {
    const result = await FlowEngineService.imagesToStory({
      userId: req.user?.id!,
      imageUrls: req.body.imageUrls,
      narrative: req.body.narrative,
      duration: req.body.duration,
      transitions: req.body.transitions,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get workflow templates
router.get('/workflows/templates', (req, res) => {
  const templates = FlowEngineService.getWorkflowTemplates();
  res.json(templates);
});

// Get project analytics
router.get('/projects/:id/analytics', async (req, res) => {
  try {
    const analytics = await FlowEngineService.getProjectAnalytics(req.params.id);
    res.json(analytics);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// SCENEBUILDER
// ============================================================================

// Create storyboard
router.post('/storyboards', async (req, res) => {
  try {
    const storyboard = await ScenebuilderService.createStoryboard({
      projectId: req.body.projectId,
      userId: req.user?.id!,
      name: req.body.name,
      aspectRatio: req.body.aspectRatio,
      resolution: req.body.resolution,
      frameRate: req.body.frameRate,
    });
    res.json(storyboard);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add scene
router.post('/storyboards/:id/scenes', async (req, res) => {
  try {
    const scene = await ScenebuilderService.addScene(req.params.id, req.body);
    res.json(scene);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get AI scene suggestions
router.post('/storyboards/suggestions', async (req, res) => {
  try {
    const suggestions = await ScenebuilderService.getSuggestions(req.body);
    res.json(suggestions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get shot templates
router.get('/storyboards/templates', async (req, res) => {
  const templates = await ScenebuilderService.getShotTemplates();
  res.json(templates);
});

// ============================================================================
// INGREDIENTS TO VIDEO
// ============================================================================

// Create from ingredients
router.post('/ingredients-to-video', async (req, res) => {
  try {
    const result = await IngredientsToVideoService.createFromIngredients({
      userId: req.user?.id!,
      projectId: req.body.projectId,
      name: req.body.name,
      ingredients: req.body.ingredients,
      settings: req.body.settings,
      prompt: req.body.prompt,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get recipe templates
router.get('/ingredients-to-video/templates', async (req, res) => {
  const templates = await IngredientsToVideoService.getTemplates();
  res.json(templates);
});

// Remix video
router.post('/ingredients-to-video/remix', async (req, res) => {
  try {
    const result = await IngredientsToVideoService.remixVideo({
      userId: req.user?.id!,
      baseVideoId: req.body.baseVideoId,
      newIngredients: req.body.newIngredients,
      settings: req.body.settings,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// TIMELINE EDITOR
// ============================================================================

// Create timeline
router.post('/timelines', async (req, res) => {
  try {
    const timeline = await TimelineEditorService.createTimeline({
      projectId: req.body.projectId,
      userId: req.user?.id!,
      name: req.body.name,
      settings: req.body.settings,
    });
    res.json(timeline);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add clip to track
router.post('/timelines/:id/tracks/:trackId/clips', async (req, res) => {
  try {
    const clip = await TimelineEditorService.addClip(
      req.params.id,
      req.params.trackId,
      req.body
    );
    res.json(clip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Render timeline
router.post('/timelines/:id/render', async (req, res) => {
  try {
    const result = await TimelineEditorService.renderTimeline(
      req.params.id,
      req.body.options
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// VIDEO EXTENSION
// ============================================================================

// Extend video
router.post('/videos/:id/extend', async (req, res) => {
  try {
    const result = await VideoExtensionService.extendVideo(req.user?.id!, {
      videoId: req.params.id,
      direction: req.body.direction,
      duration: req.body.duration,
      model: req.body.model,
      settings: req.body.settings,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create loop
router.post('/videos/:id/loop', async (req, res) => {
  try {
    const result = await VideoExtensionService.createLoop(req.user?.id!, req.params.id, {
      loopDuration: req.body.loopDuration,
      seamless: req.body.seamless,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get extension status
router.get('/jobs/:id/extension-status', async (req, res) => {
  try {
    const status = await VideoExtensionService.getExtensionStatus(req.params.id);
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// OBJECT INSERTION
// ============================================================================

// Add object
router.post('/videos/:id/objects/add', async (req, res) => {
  try {
    const result = await ObjectInsertionService.addObject(req.user?.id!, {
      videoId: req.params.id,
      operation: 'add',
      object: req.body.object,
      timeRange: req.body.timeRange,
      settings: req.body.settings,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Detect objects
router.get('/videos/:id/objects/detect', async (req, res) => {
  try {
    const objects = await ObjectInsertionService.detectObjects(req.params.id);
    res.json(objects);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// UPSCALING
// ============================================================================

// Upscale video
router.post('/videos/:id/upscale', async (req, res) => {
  try {
    const result = await UpscalingService.upscale(req.user?.id!, {
      videoId: req.params.id,
      targetResolution: req.body.targetResolution,
      model: req.body.model,
      settings: req.body.settings,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// ASSET MANAGER
// ============================================================================

// Create asset
router.post('/assets', async (req, res) => {
  try {
    const asset = await AssetManagerService.createAsset({
      userId: req.user?.id!,
      ...req.body,
    });
    res.json(asset);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Search assets
router.get('/assets/search', async (req, res) => {
  try {
    const results = await AssetManagerService.search(req.user?.id!, {
      text: req.query.q as string,
      type: req.query.type ? (req.query.type as string).split(',') : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      sortBy: req.query.sortBy as any,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    });
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get analytics
router.get('/assets/analytics', async (req, res) => {
  try {
    const analytics = await AssetManagerService.getAnalytics(req.user?.id!);
    res.json(analytics);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

// Export video
router.post('/videos/:id/export', async (req, res) => {
  try {
    const result = await ExportService.exportVideo(req.user?.id!, {
      videoId: req.params.id,
      preset: req.body.preset,
      customSettings: req.body.customSettings,
      watermark: req.body.watermark,
      trimming: req.body.trimming,
      filename: req.body.filename,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get export presets
router.get('/export/presets', (req, res) => {
  const presets = ExportService.getPresets();
  res.json(presets);
});

// Batch export
router.post('/export/batch', async (req, res) => {
  try {
    const result = await ExportService.batchExport(req.user?.id!, req.body.exports);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
