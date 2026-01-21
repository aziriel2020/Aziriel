/**
 * HOTEL API ROUTES
 * Production-ready endpoints for hotel search and booking
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { hotelService } from '../services/hotels/hotel.service';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const hotelSearchSchema = z.object({
  destination: z.string().min(2),
  destinationType: z.enum(['CITY', 'HOTEL', 'COORDINATES']).default('CITY'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rooms: z.number().min(1).max(10).default(1),
  adults: z.number().min(1).max(30).default(2),
  children: z.number().min(0).max(20).optional(),
  childrenAges: z.array(z.number().min(0).max(17)).optional(),
  minStars: z.number().min(1).max(5).optional(),
  maxStars: z.number().min(1).max(5).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().positive().optional()
});

const hotelBookingSchema = z.object({
  offerId: z.string().uuid(),
  searchId: z.string().uuid(),
  guests: z.array(z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    isLead: z.boolean()
  })).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10),
  specialRequests: z.string().optional(),
  arrivalTime: z.string().optional()
});

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  overallRating: z.number().min(1).max(5),
  ratings: z.object({
    cleanliness: z.number().min(1).max(5).optional(),
    location: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
    amenities: z.number().min(1).max(5).optional()
  }).optional(),
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(50).max(2000),
  travelType: z.enum(['BUSINESS', 'LEISURE', 'FAMILY', 'COUPLE', 'SOLO', 'GROUP']).optional(),
  photos: z.array(z.string().url()).max(10).optional()
});

/**
 * @route   POST /api/hotels/search
 * @desc    Search for hotels
 * @access  Public
 */
router.post(
  '/search',
  optionalAuth,
  validateRequest(hotelSearchSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const searchParams = req.body;

    logger.info('Hotel search request', {
      destination: searchParams.destination,
      checkIn: searchParams.checkIn,
      userId
    });

    const results = await hotelService.searchHotels(searchParams, userId);

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
        offers: results.offers.slice(0, 50)
      }
    });
  })
);

/**
 * @route   GET /api/hotels/:hotelCode
 * @desc    Get hotel details
 * @access  Public
 */
router.get(
  '/:hotelCode',
  asyncHandler(async (req: Request, res: Response) => {
    const { hotelCode } = req.params;

    const hotel = await hotelService.getHotelDetails(hotelCode);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  })
);

/**
 * @route   GET /api/hotels/offer/:offerId
 * @desc    Get specific hotel offer details
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

    const offer = await hotelService.getOffer(searchId as string, offerId);

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
 * @route   POST /api/hotels/rate-check
 * @desc    Check if rate is still available
 * @access  Public
 */
router.post(
  '/rate-check',
  asyncHandler(async (req: Request, res: Response) => {
    const { offerId, searchId } = req.body;

    const offer = await hotelService.getOffer(searchId, offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    const rateCheck = await hotelService.checkRate(offer);

    res.json({
      success: true,
      data: {
        available: rateCheck.available,
        currentPrice: rateCheck.currentPrice,
        originalPrice: offer.totalPrice,
        priceChanged: rateCheck.currentPrice !== offer.totalPrice,
        currency: rateCheck.currency || offer.currency
      }
    });
  })
);

/**
 * @route   POST /api/hotels/book
 * @desc    Create a hotel booking
 * @access  Private
 */
router.post(
  '/book',
  authMiddleware,
  validateRequest(hotelBookingSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { offerId, searchId, guests, contactEmail, contactPhone, specialRequests, arrivalTime } = req.body;

    const offer = await hotelService.getOffer(searchId, offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer expired. Please search again.'
      });
    }

    const booking = await hotelService.createBooking({
      userId,
      offer,
      guests,
      contactEmail,
      contactPhone,
      specialRequests,
      arrivalTime
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  })
);

/**
 * @route   GET /api/hotels/bookings
 * @desc    Get user's hotel bookings
 * @access  Private
 */
router.get(
  '/bookings',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { status, upcoming, limit = 10, offset = 0 } = req.query;

    const bookings = await hotelService.getUserBookings(userId, {
      status: status as string,
      upcoming: upcoming === 'true',
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
 * @route   GET /api/hotels/bookings/:bookingId
 * @desc    Get booking details
 * @access  Private
 */
router.get(
  '/bookings/:bookingId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { bookingId } = req.params;

    const booking = await hotelService.getBookingDetails(bookingId, userId);

    res.json({
      success: true,
      data: booking
    });
  })
);

/**
 * @route   POST /api/hotels/bookings/:bookingId/cancel
 * @desc    Cancel a hotel booking
 * @access  Private
 */
router.post(
  '/bookings/:bookingId/cancel',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { bookingId } = req.params;

    const result = await hotelService.cancelBooking(bookingId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/hotels/destinations
 * @desc    Search destinations
 * @access  Public
 */
router.get(
  '/destinations',
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || (query as string).length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const destinations = await hotelService.searchDestinations(query as string);

    res.json({
      success: true,
      data: destinations
    });
  })
);

/**
 * @route   POST /api/hotels/reviews
 * @desc    Submit a hotel review
 * @access  Private
 */
router.post(
  '/reviews',
  authMiddleware,
  validateRequest(reviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const review = await hotelService.submitReview({
      userId,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: review
    });
  })
);

export default router;
