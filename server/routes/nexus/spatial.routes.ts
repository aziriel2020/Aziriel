/**
 * SPATIAL WORLDS API ROUTES
 *
 * Endpoints for 3D immersive environments
 * - Generate spatial worlds
 * - Join/leave worlds
 * - Avatar management
 * - Real-time position updates
 */

import express, { Request, Response } from 'express';
import { SpatialWorldsService } from '../../services/nexus/spatial-worlds.service';

const router = express.Router();

/**
 * Generate spatial world
 * POST /api/nexus/spatial/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userId, description, theme, maxParticipants } = req.body;

    const world = await SpatialWorldsService.generateWorld({
      userId,
      description,
      theme,
      maxParticipants,
    });

    res.json({ success: true, world });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get world
 * GET /api/nexus/spatial/:worldId
 */
router.get('/:worldId', async (req: Request, res: Response) => {
  try {
    const { worldId } = req.params;

    const world = await SpatialWorldsService.getWorld(worldId);

    if (!world) {
      return res.status(404).json({ error: 'World not found' });
    }

    res.json({ success: true, world });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Join world
 * POST /api/nexus/spatial/:worldId/join
 */
router.post('/:worldId/join', async (req: Request, res: Response) => {
  try {
    const { worldId } = req.params;
    const { userId, position } = req.body;

    const result = await SpatialWorldsService.joinWorld({
      worldId,
      userId,
      position,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Leave world
 * POST /api/nexus/spatial/:worldId/leave
 */
router.post('/:worldId/leave', async (req: Request, res: Response) => {
  try {
    const { worldId } = req.params;
    const { userId } = req.body;

    await SpatialWorldsService.leaveWorld({ worldId, userId });

    res.json({ success: true, message: 'Left world' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update position
 * PUT /api/nexus/spatial/:worldId/position
 */
router.put('/:worldId/position', async (req: Request, res: Response) => {
  try {
    const { worldId } = req.params;
    const { userId, position, rotation } = req.body;

    await SpatialWorldsService.updatePosition({
      worldId,
      userId,
      position,
      rotation,
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate avatar
 * POST /api/nexus/spatial/avatar/generate
 */
router.post('/avatar/generate', async (req: Request, res: Response) => {
  try {
    const { userId, style, referenceImage } = req.body;

    const avatar = await SpatialWorldsService.generateAvatar({
      userId,
      style,
      referenceImage,
    });

    res.json({ success: true, avatar });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
