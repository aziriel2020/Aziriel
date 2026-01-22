/**
 * BOOKINGS ROUTES
 * Booking creation, management, cancellation
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth.routes';

const router = Router();

// In-memory store for demo (use database in production)
const bookings: Map<string, any> = new Map();

// Booking status types
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
type BookingType = 'flight' | 'hotel' | 'package';

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  email?: string;
  phone?: string;
}

interface FlightSegment {
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    terminal?: string;
    dateTime: string;
  };
  arrival: {
    airport: string;
    terminal?: string;
    dateTime: string;
  };
  duration: string;
  aircraft?: string;
  class: string;
}

interface HotelDetails {
  hotelId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  stars: number;
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomCount: number;
  guests: number;
  boardType?: string;
  amenities?: string[];
}

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      type,
      passengers,
      flights,
      hotel,
      contactEmail,
      contactPhone,
      specialRequests,
      paymentMethod,
      pricing,
      loyaltyPointsUsed
    } = req.body;

    // Validation
    if (!type || !['flight', 'hotel', 'package'].includes(type)) {
      return res.status(400).json({ error: 'Invalid booking type' });
    }

    if (type === 'flight' && (!flights || flights.length === 0)) {
      return res.status(400).json({ error: 'Flight details required for flight booking' });
    }

    if (type === 'hotel' && !hotel) {
      return res.status(400).json({ error: 'Hotel details required for hotel booking' });
    }

    if (type === 'package' && (!flights || !hotel)) {
      return res.status(400).json({ error: 'Both flight and hotel required for package booking' });
    }

    // Generate booking reference
    const bookingId = uuidv4();
    const bookingReference = `SKY${Date.now().toString(36).toUpperCase()}`;

    // Calculate loyalty points earned (1 point per $1 spent)
    const baseAmount = pricing?.total || 0;
    const loyaltyPointsEarned = Math.floor(baseAmount);

    // Create booking object
    const booking = {
      id: bookingId,
      reference: bookingReference,
      userId,
      type,
      status: 'confirmed' as BookingStatus,
      passengers: passengers || [],
      flights: flights || null,
      hotel: hotel || null,
      contact: {
        email: contactEmail,
        phone: contactPhone
      },
      specialRequests: specialRequests || null,
      pricing: {
        subtotal: pricing?.subtotal || 0,
        taxes: pricing?.taxes || 0,
        fees: pricing?.fees || 0,
        discount: pricing?.discount || 0,
        loyaltyDiscount: loyaltyPointsUsed ? loyaltyPointsUsed * 0.01 : 0,
        total: pricing?.total || 0,
        currency: pricing?.currency || 'USD'
      },
      payment: {
        method: paymentMethod || 'card',
        status: 'completed',
        transactionId: `TXN${Date.now()}`,
        paidAt: new Date().toISOString()
      },
      loyalty: {
        pointsEarned: loyaltyPointsEarned,
        pointsUsed: loyaltyPointsUsed || 0
      },
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store booking
    bookings.set(bookingId, booking);

    // Generate confirmation documents (in production, generate PDFs)
    const documents = [
      {
        type: 'confirmation',
        name: 'Booking Confirmation',
        url: `/documents/${bookingId}/confirmation.pdf`
      }
    ];

    if (type === 'flight' || type === 'package') {
      documents.push({
        type: 'eticket',
        name: 'E-Ticket',
        url: `/documents/${bookingId}/eticket.pdf`
      });
    }

    if (type === 'hotel' || type === 'package') {
      documents.push({
        type: 'voucher',
        name: 'Hotel Voucher',
        url: `/documents/${bookingId}/voucher.pdf`
      });
    }

    booking.documents = documents;

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      loyaltyPointsEarned
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

/**
 * GET /api/bookings
 * Get user's bookings
 */
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { status, type, page = 1, limit = 10 } = req.query;

    // Get user's bookings
    let userBookings = Array.from(bookings.values())
      .filter(b => b.userId === userId);

    // Filter by status
    if (status && typeof status === 'string') {
      userBookings = userBookings.filter(b => b.status === status);
    }

    // Filter by type
    if (type && typeof type === 'string') {
      userBookings = userBookings.filter(b => b.type === type);
    }

    // Sort by date (newest first)
    userBookings.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedBookings = userBookings.slice(startIndex, endIndex);

    res.json({
      bookings: paginatedBookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: userBookings.length,
        totalPages: Math.ceil(userBookings.length / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get bookings', details: error.message });
  }
});

/**
 * GET /api/bookings/upcoming
 * Get upcoming bookings
 */
router.get('/upcoming', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const now = new Date();

    const upcomingBookings = Array.from(bookings.values())
      .filter(b => {
        if (b.userId !== userId || b.status === 'cancelled') return false;

        // Check if booking is upcoming
        if (b.type === 'flight' || b.type === 'package') {
          const departureDate = new Date(b.flights?.[0]?.departure?.dateTime);
          return departureDate > now;
        }
        if (b.type === 'hotel') {
          const checkInDate = new Date(b.hotel?.checkIn);
          return checkInDate > now;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = a.type === 'hotel'
          ? new Date(a.hotel?.checkIn)
          : new Date(a.flights?.[0]?.departure?.dateTime);
        const dateB = b.type === 'hotel'
          ? new Date(b.hotel?.checkIn)
          : new Date(b.flights?.[0]?.departure?.dateTime);
        return dateA.getTime() - dateB.getTime();
      });

    res.json({ bookings: upcomingBookings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get upcoming bookings', details: error.message });
  }
});

/**
 * GET /api/bookings/past
 * Get past bookings
 */
router.get('/past', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const now = new Date();

    const pastBookings = Array.from(bookings.values())
      .filter(b => {
        if (b.userId !== userId) return false;

        if (b.type === 'flight' || b.type === 'package') {
          const arrivalDate = new Date(b.flights?.[b.flights.length - 1]?.arrival?.dateTime);
          return arrivalDate < now;
        }
        if (b.type === 'hotel') {
          const checkOutDate = new Date(b.hotel?.checkOut);
          return checkOutDate < now;
        }
        return false;
      })
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    res.json({ bookings: pastBookings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get past bookings', details: error.message });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking details
 */
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Find by ID or reference
    const booking = bookings.get(id) ||
      Array.from(bookings.values()).find(b => b.reference === id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check ownership
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get booking', details: error.message });
  }
});

/**
 * PATCH /api/bookings/:id
 * Update booking (limited fields)
 */
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { specialRequests, contactEmail, contactPhone, passengers } = req.body;

    const booking = bookings.get(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify completed or cancelled booking' });
    }

    // Update allowed fields
    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }
    if (contactEmail) {
      booking.contact.email = contactEmail;
    }
    if (contactPhone) {
      booking.contact.phone = contactPhone;
    }
    if (passengers && Array.isArray(passengers)) {
      booking.passengers = passengers;
    }

    booking.updatedAt = new Date().toISOString();
    bookings.set(id, booking);

    res.json({ message: 'Booking updated', booking });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking
 */
router.post('/:id/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = bookings.get(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    // Calculate refund based on cancellation policy
    const now = new Date();
    let refundPercentage = 100;
    let refundAmount = booking.pricing.total;

    // Check cancellation deadline
    const travelDate = booking.type === 'hotel'
      ? new Date(booking.hotel?.checkIn)
      : new Date(booking.flights?.[0]?.departure?.dateTime);

    const daysUntilTravel = Math.ceil((travelDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilTravel < 1) {
      refundPercentage = 0;
    } else if (daysUntilTravel < 7) {
      refundPercentage = 50;
    } else if (daysUntilTravel < 14) {
      refundPercentage = 75;
    }

    refundAmount = (booking.pricing.total * refundPercentage) / 100;

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date().toISOString(),
      reason: reason || 'User requested cancellation',
      refundPercentage,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'pending' : 'not_applicable'
    };
    booking.updatedAt = new Date().toISOString();

    // Revert loyalty points used
    if (booking.loyalty.pointsUsed > 0) {
      booking.loyalty.pointsRefunded = booking.loyalty.pointsUsed;
    }

    bookings.set(id, booking);

    res.json({
      message: 'Booking cancelled',
      booking,
      refund: {
        percentage: refundPercentage,
        amount: refundAmount,
        currency: booking.pricing.currency,
        status: 'Refund will be processed within 5-7 business days'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
  }
});

/**
 * POST /api/bookings/:id/check-in
 * Online check-in for flights
 */
router.post('/:id/check-in', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { passengers, seatSelections } = req.body;

    const booking = bookings.get(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.type === 'hotel') {
      return res.status(400).json({ error: 'Online check-in not available for hotel bookings' });
    }

    // Check if within check-in window (24-48 hours before departure)
    const departureDate = new Date(booking.flights?.[0]?.departure?.dateTime);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture > 48) {
      return res.status(400).json({
        error: 'Check-in not yet open',
        opensAt: new Date(departureDate.getTime() - 48 * 60 * 60 * 1000).toISOString()
      });
    }

    if (hoursUntilDeparture < 2) {
      return res.status(400).json({ error: 'Online check-in is closed. Please check in at the airport.' });
    }

    // Process check-in
    booking.checkIn = {
      completedAt: new Date().toISOString(),
      passengers: passengers || booking.passengers.map((p: any, i: number) => ({
        ...p,
        seat: seatSelections?.[i] || `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`
      })),
      boardingPasses: booking.passengers.map((p: any) => ({
        passenger: `${p.firstName} ${p.lastName}`,
        url: `/documents/${id}/boarding-pass-${p.firstName.toLowerCase()}.pdf`
      }))
    };

    // Add boarding passes to documents
    booking.documents.push(...booking.checkIn.boardingPasses.map((bp: any) => ({
      type: 'boarding-pass',
      name: `Boarding Pass - ${bp.passenger}`,
      url: bp.url
    })));

    booking.updatedAt = new Date().toISOString();
    bookings.set(id, booking);

    res.json({
      message: 'Check-in complete',
      checkIn: booking.checkIn,
      boardingPasses: booking.checkIn.boardingPasses
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to check in', details: error.message });
  }
});

/**
 * GET /api/bookings/:id/documents
 * Get booking documents
 */
router.get('/:id/documents', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const booking = bookings.get(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ documents: booking.documents || [] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get documents', details: error.message });
  }
});

/**
 * POST /api/bookings/:id/add-extras
 * Add extras to booking (baggage, meals, etc.)
 */
router.post('/:id/add-extras', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { extras } = req.body;

    const booking = bookings.get(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Cannot add extras to this booking' });
    }

    // Calculate extras cost
    const extrasCost = extras.reduce((total: number, extra: any) => {
      return total + (extra.price || 0);
    }, 0);

    // Add extras to booking
    booking.extras = [...(booking.extras || []), ...extras];
    booking.pricing.extras = (booking.pricing.extras || 0) + extrasCost;
    booking.pricing.total += extrasCost;
    booking.updatedAt = new Date().toISOString();

    bookings.set(id, booking);

    res.json({
      message: 'Extras added successfully',
      extras: booking.extras,
      additionalCost: extrasCost,
      newTotal: booking.pricing.total
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add extras', details: error.message });
  }
});

/**
 * POST /api/bookings/search
 * Search bookings by reference
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { reference, lastName } = req.body;

    if (!reference || !lastName) {
      return res.status(400).json({ error: 'Booking reference and last name are required' });
    }

    const booking = Array.from(bookings.values()).find(b =>
      b.reference === reference.toUpperCase() &&
      b.passengers.some((p: any) =>
        p.lastName.toLowerCase() === lastName.toLowerCase()
      )
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Return limited info for non-authenticated requests
    res.json({
      booking: {
        reference: booking.reference,
        type: booking.type,
        status: booking.status,
        passengers: booking.passengers.map((p: any) => ({
          firstName: p.firstName,
          lastName: p.lastName
        })),
        flights: booking.flights,
        hotel: booking.hotel ? {
          name: booking.hotel.name,
          checkIn: booking.hotel.checkIn,
          checkOut: booking.hotel.checkOut
        } : null
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

export default router;
