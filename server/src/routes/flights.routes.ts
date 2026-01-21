/**
 * FLIGHT API ROUTES
 * Production-ready endpoints for flight search and booking
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { flightService } from '../services/flights/flight.service';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const flightSearchSchema = z.object({
  origin: z.string().length(3, 'Origin must be 3-letter airport code'),
  destination: z.string().length(3, 'Destination must be 3-letter airport code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().min(1).max(9).default(1),
  children: z.number().min(0).max(8).optional(),
  infants: z.number().min(0).max(4).optional(),
  cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  directOnly: z.boolean().optional(),
  maxPrice: z.number().positive().optional(),
  currency: z.string().length(3).default('USD')
});

const bookingSchema = z.object({
  offerId: z.string().uuid(),
  searchId: z.string().uuid(),
  passengers: z.array(z.object({
    type: z.enum(['ADULT', 'CHILD', 'INFANT']),
    gender: z.enum(['MALE', 'FEMALE']),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    nationality: z.string().length(2),
    passportNumber: z.string().optional(),
    passportExpiry: z.string().optional(),
    passportCountry: z.string().optional()
  })).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10)
});

/**
 * @route   POST /api/flights/search
 * @desc    Search for flights
 * @access  Public (optionally authenticated for personalization)
 */
router.post(
  '/search',
  optionalAuth,
  validateRequest(flightSearchSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const searchParams = req.body;

    logger.info('Flight search request', {
      origin: searchParams.origin,
      destination: searchParams.destination,
      userId
    });

    const results = await flightService.searchFlights(searchParams, userId);

    res.json({
      success: true,
      data: {
        searchId: results.searchId,
        totalResults: results.totalResults,
        minPrice: results.minPrice,
        maxPrice: results.maxPrice,
        currency: results.currency,
        providers: results.providers,
        expiresAt: results.expiresAt,
        offers: results.offers.slice(0, 50) // Limit initial response
      }
    });
  })
);

/**
 * @route   GET /api/flights/search/:searchId
 * @desc    Get search results by ID
 * @access  Public
 */
router.get(
  '/search/:searchId',
  asyncHandler(async (req: Request, res: Response) => {
    const { searchId } = req.params;
    const { page = 1, limit = 20, sort = 'price', filter } = req.query;

    // Get cached results
    const offers = await flightService.getOffer(searchId, '');

    if (!offers) {
      return res.status(404).json({
        success: false,
        error: 'Search results expired or not found'
      });
    }

    res.json({
      success: true,
      data: { offers }
    });
  })
);

/**
 * @route   GET /api/flights/offer/:offerId
 * @desc    Get specific flight offer details
 * @access  Public
 */
router.get(
  '/offer/:offerId',
  asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const { searchId } = req.query;

    if (!searchId) {
      return res.status(400).json({
        success: false,
        error: 'searchId is required'
      });
    }

    const offer = await flightService.getOffer(searchId as string, offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found or expired'
      });
    }

    res.json({
      success: true,
      data: offer
    });
  })
);

/**
 * @route   POST /api/flights/price-check
 * @desc    Confirm current price for an offer
 * @access  Public
 */
router.post(
  '/price-check',
  asyncHandler(async (req: Request, res: Response) => {
    const { offerId, searchId } = req.body;

    const offer = await flightService.getOffer(searchId, offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    const confirmedOffer = await flightService.confirmPrice(offer);

    res.json({
      success: true,
      data: confirmedOffer || offer,
      priceChanged: confirmedOffer && confirmedOffer.totalPrice !== offer.totalPrice
    });
  })
);

/**
 * @route   POST /api/flights/book
 * @desc    Create a flight booking
 * @access  Private (authenticated users only)
 */
router.post(
  '/book',
  authMiddleware,
  validateRequest(bookingSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { offerId, searchId, passengers, contactEmail, contactPhone } = req.body;

    // Get the offer
    const offer = await flightService.getOffer(searchId, offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer expired. Please search again.'
      });
    }

    // Create booking
    const booking = await flightService.createBooking({
      userId,
      offer,
      passengers,
      contactEmail,
      contactPhone
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  })
);

/**
 * @route   GET /api/flights/bookings
 * @desc    Get user's flight bookings
 * @access  Private
 */
router.get(
  '/bookings',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const bookings = await flightService.getUserBookings(userId, {
      status: status as string,
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      success: true,
      data: bookings
    });
  })
);

/**
 * @route   GET /api/flights/bookings/:bookingId
 * @desc    Get booking details
 * @access  Private
 */
router.get(
  '/bookings/:bookingId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { bookingId } = req.params;

    const booking = await flightService.getBookingDetails(bookingId, userId);

    res.json({
      success: true,
      data: booking
    });
  })
);

/**
 * @route   POST /api/flights/bookings/:bookingId/cancel
 * @desc    Cancel a flight booking
 * @access  Private
 */
router.post(
  '/bookings/:bookingId/cancel',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { bookingId } = req.params;

    const result = await flightService.cancelBooking(bookingId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/flights/airports
 * @desc    Search airports/cities
 * @access  Public
 */
router.get(
  '/airports',
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || (query as string).length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const airports = await flightService.searchLocations(query as string);

    res.json({
      success: true,
      data: airports
    });
  })
);

/**
 * @route   GET /api/flights/seats/:offerId
 * @desc    Get seat map for an offer
 * @access  Public
 */
router.get(
  '/seats/:offerId',
  asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const { searchId } = req.query;

    const offer = await flightService.getOffer(searchId as string, offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    const seats = await flightService.getSeats(offer);

    res.json({
      success: true,
      data: seats
    });
  })
);

export default router;
