/**
 * AI TRAVEL ASSISTANT ROUTES
 * Natural language search, recommendations, and trip planning
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { travelAIService } from '../services/ai/travel-ai.service';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().uuid().optional()
});

const recommendationsSchema = z.object({
  preferences: z.array(z.string()).optional(),
  budget: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  travelStyle: z.string().optional(),
  season: z.string().optional(),
  fromLocation: z.string().optional()
});

const itinerarySchema = z.object({
  destination: z.string().min(2),
  duration: z.number().min(1).max(30),
  travelStyle: z.string().optional(),
  budget: z.number().positive().optional(),
  interests: z.array(z.string()).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const questionSchema = z.object({
  question: z.string().min(10).max(500),
  context: z.string().max(1000).optional()
});

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to the AI travel assistant
 * @access  Public (with optional auth for personalization)
 */
router.post(
  '/chat',
  optionalAuth,
  validateRequest(chatSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { message, conversationId } = req.body;

    logger.info('AI chat request', {
      userId,
      conversationId,
      messageLength: message.length
    });

    const response = await travelAIService.processQuery(
      message,
      conversationId,
      userId
    );

    res.json({
      success: true,
      data: response
    });
  })
);

/**
 * @route   POST /api/ai/search
 * @desc    Natural language search - convert text to search parameters
 * @access  Public
 */
router.post(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.body;

    if (!query || query.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 5 characters'
      });
    }

    const intent = await travelAIService.enhanceSearchQuery(query);

    res.json({
      success: true,
      data: intent
    });
  })
);

/**
 * @route   POST /api/ai/recommendations
 * @desc    Get personalized destination recommendations
 * @access  Public (with optional auth for history-based recommendations)
 */
router.post(
  '/recommendations',
  optionalAuth,
  validateRequest(recommendationsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    let recommendations;

    if (userId && Object.keys(req.body).length === 0) {
      // Get personalized recommendations based on history
      recommendations = await travelAIService.getPersonalizedSuggestions(userId);
    } else {
      // Get recommendations based on provided preferences
      recommendations = await travelAIService.getRecommendations(req.body);
    }

    res.json({
      success: true,
      data: recommendations
    });
  })
);

/**
 * @route   POST /api/ai/itinerary
 * @desc    Generate a trip itinerary
 * @access  Public
 */
router.post(
  '/itinerary',
  validateRequest(itinerarySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const itinerary = await travelAIService.generateItinerary(req.body);

    if (!itinerary) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate itinerary'
      });
    }

    res.json({
      success: true,
      data: itinerary
    });
  })
);

/**
 * @route   POST /api/ai/question
 * @desc    Answer travel-related questions
 * @access  Public
 */
router.post(
  '/question',
  validateRequest(questionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { question, context } = req.body;

    const answer = await travelAIService.answerQuestion(question, context);

    res.json({
      success: true,
      data: { answer }
    });
  })
);

/**
 * @route   GET /api/ai/suggestions
 * @desc    Get personalized travel suggestions for logged-in user
 * @access  Private
 */
router.get(
  '/suggestions',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const suggestions = await travelAIService.getPersonalizedSuggestions(userId);

    res.json({
      success: true,
      data: suggestions
    });
  })
);

export default router;
