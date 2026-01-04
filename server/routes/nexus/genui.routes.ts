/**
 * GENERATIVE UI API ROUTES
 *
 * Endpoints for adaptive interfaces
 * - Generate UI based on conversation context
 * - Stream UI updates in real-time
 * - Template management
 */

import express, { Request, Response } from 'express';
import { GenerativeUIService } from '../../services/nexus/generative-ui.service';

const router = express.Router();

/**
 * Generate UI for context
 * POST /api/nexus/genui/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { conversationId, userId, currentTopic, entities, intent, history } = req.body;

    const ui = await GenerativeUIService.generateUI({
      conversationId,
      userId,
      currentTopic,
      entities,
      intent,
      history,
    });

    res.json({ success: true, ui });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stream UI updates (SSE)
 * GET /api/nexus/genui/stream/:conversationId
 */
router.get('/stream/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: {"type":"connected"}\n\n');

    // In production, would stream actual UI updates
    const keepAlive = setInterval(() => {
      res.write('data: {"type":"ping"}\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      res.end();
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get analytics
 * GET /api/nexus/genui/analytics/:userId
 */
router.get('/analytics/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const analytics = await GenerativeUIService.getAnalytics(userId);

    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
