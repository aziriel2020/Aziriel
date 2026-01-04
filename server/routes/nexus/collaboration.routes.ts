/**
 * AGENT COLLABORATION API ROUTES
 *
 * Endpoints for agent-to-agent coordination
 * - Plan dinners, meetings, trips automatically
 * - PDTs negotiate directly
 * - Frictionless social coordination
 */

import express, { Request, Response } from 'express';
import { AgentCollaborationService } from '../../services/nexus/agent-collaboration.service';
import { validate } from '../../middleware/validation.middleware';
import { initiateCollaborationSchema, planDinnerSchema } from '../../validators/nexus.validators';

const router = express.Router();

/**
 * Initiate collaboration
 * POST /api/nexus/collaboration/initiate
 */
router.post('/initiate', validate(initiateCollaborationSchema), async (req: Request, res: Response) => {
  try {
    const { initiatorUserId, participantUserIds, goal, context } = req.body;

    const collaboration = await AgentCollaborationService.initiateCollaboration({
      initiatorUserId,
      participantUserIds,
      goal,
      context,
    });

    res.json({ success: true, collaboration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Plan dinner (helper endpoint)
 * POST /api/nexus/collaboration/plan-dinner
 */
router.post('/plan-dinner', validate(planDinnerSchema), async (req: Request, res: Response) => {
  try {
    const { userId, friendUserIds, preferredDates, cuisine, budget } = req.body;

    const collaboration = await AgentCollaborationService.planDinner({
      userId,
      friendUserIds,
      preferredDates,
      cuisine,
      budget,
    });

    res.json({ success: true, collaboration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Schedule meeting (helper endpoint)
 * POST /api/nexus/collaboration/schedule-meeting
 */
router.post('/schedule-meeting', async (req: Request, res: Response) => {
  try {
    const { userId, attendeeUserIds, duration, preferredDates, location } = req.body;

    const collaboration = await AgentCollaborationService.scheduleMeeting({
      userId,
      attendeeUserIds,
      duration,
      preferredDates,
      location,
    });

    res.json({ success: true, collaboration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Plan trip (helper endpoint)
 * POST /api/nexus/collaboration/plan-trip
 */
router.post('/plan-trip', async (req: Request, res: Response) => {
  try {
    const { userId, travelCompanionUserIds, destination, preferredDates, budget } = req.body;

    const collaboration = await AgentCollaborationService.planTrip({
      userId,
      travelCompanionUserIds,
      destination,
      preferredDates,
      budget,
    });

    res.json({ success: true, collaboration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get collaboration status
 * GET /api/nexus/collaboration/:collaborationId
 */
router.get('/:collaborationId', async (req: Request, res: Response) => {
  try {
    const { collaborationId } = req.params;

    const collaboration = await AgentCollaborationService.getCollaboration(collaborationId);

    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    res.json({ success: true, collaboration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's collaboration history
 * GET /api/nexus/collaboration/user/:userId
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const collaborations = await AgentCollaborationService.getUserCollaborations(userId, limit);

    res.json({ success: true, collaborations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cancel collaboration
 * DELETE /api/nexus/collaboration/:collaborationId
 */
router.delete('/:collaborationId', async (req: Request, res: Response) => {
  try {
    const { collaborationId } = req.params;

    await AgentCollaborationService.cancelCollaboration(collaborationId);

    res.json({ success: true, message: 'Collaboration canceled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
