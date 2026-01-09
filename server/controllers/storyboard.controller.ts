/**
 * Storyboard Controller - THE BEST STORYBOARD FEATURE IN THE WORLD
 */

import { Request, Response } from 'express';
import StoryboardService from '../services/storyboard.service';

export class StoryboardController {
  /**
   * Create storyboard with frame-to-frame consistency
   */
  static async createStoryboard(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { title, description, scenes, globalStyle } = req.body;

    const result = await StoryboardService.createStoryboard({
      userId,
      title,
      description,
      scenes,
      globalStyle,
    });

    res.json({ success: true, data: result });
  }

  /**
   * Get storyboard status
   */
  static async getStoryboardStatus(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { storyboardId } = req.params;

    const status = await StoryboardService.getStoryboardStatus(storyboardId, userId);
    res.json({ success: true, data: status });
  }

  /**
   * Merge storyboard scenes into final video
   */
  static async mergeStoryboard(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { storyboardId } = req.params;

    const videoUrl = await StoryboardService.mergeStoryboard(storyboardId, userId);
    res.json({ success: true, data: { videoUrl } });
  }

  /**
   * Get user storyboards
   */
  static async getUserStoryboards(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { limit = 50 } = req.query;

    const storyboards = await StoryboardService.getUserStoryboards(userId, Number(limit));
    res.json({ success: true, data: storyboards });
  }
}

export default StoryboardController;
