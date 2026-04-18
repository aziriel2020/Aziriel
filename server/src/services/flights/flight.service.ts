/**
 * UNIFIED FLIGHT SERVICE
 * Aggregates results from multiple providers (Amadeus, Duffel)
 * Handles search, booking, and management
 */

import { v4 as uuidv4 } from 'uuid';
import { amadeusService, FlightSearchParams, FlightOffer, PassengerInfo } from './amadeus.service';
import { duffelService } from './duffel.service';
import { logger } from '../../utils/logger';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

interface SearchResult {
  searchId: string;
  offers: FlightOffer[];
  totalResults: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  searchParams: FlightSearchParams;
  providers: string[];
  searchedAt: Date;
  expiresAt: Date;
}

interface BookingResult {
  bookingId: string;
  bookingReference: string;
  pnr: string;
  status: string;
  totalPrice: number;
  currency: string;
  provider: string;
  passengers: any[];
  itinerary: any[];
}

class FlightService {
  private searchCacheTTL = 900; // 15 minutes

  /**
   * Search flights from all providers
   */
  async searchFlights(params: FlightSearchParams, userId?: string): Promise<SearchResult> {
    const searchId = uuidv4();
    const startTime = Date.now();

    logger.info('Starting multi-provider flight search', { searchId, params });

    try {
      // Search all providers in parallel
      const [amadeusResults, duffelResults] = await Promise.allSettled([
        amadeusService.searchFlights(params),
        duffelService.searchFlights(params)
      ]);

      // Collect successful results
      const allOffers: FlightOffer[] = [];
      const providers: string[] = [];

      if (amadeusResults.status === 'fulfilled' && amadeusResults.value.length > 0) {
        allOffers.push(...amadeusResults.value);
        providers.push('amadeus');
        logger.info(`Amadeus returned ${amadeusResults.value.length} offers`);
      } else if (amadeusResults.status === 'rejected') {
        logger.warn('Amadeus search failed', { error: amadeusResults.reason });
      }

      if (duffelResults.status === 'fulfilled' && duffelResults.value.length > 0) {
        allOffers.push(...duffelResults.value);
        providers.push('duffel');
        logger.info(`Duffel returned ${duffelResults.value.length} offers`);
      } else if (duffelResults.status === 'rejected') {
        logger.warn('Duffel search failed', { error: duffelResults.reason });
      }

      // Deduplicate similar offers
      const dedupedOffers = this.deduplicateOffers(allOffers);

      // Sort by price
      dedupedOffers.sort((a, b) => a.totalPrice - b.totalPrice);

      // Calculate stats
      const minPrice = dedupedOffers.length > 0 ? dedupedOffers[0].totalPrice : 0;
      const maxPrice = dedupedOffers.length > 0 ? dedupedOffers[dedupedOffers.length - 1].totalPrice : 0;

      const expiresAt = new Date(Date.now() + this.searchCacheTTL * 1000);

      // Store search in database
      const search = await prisma.flightSearch.create({
        data: {
          id: searchId,
          userId,
          sessionId: uuidv4(),
          tripType: params.returnDate ? 'ROUND_TRIP' : 'ONE_WAY',
          origin: params.origin,
          destination: params.destination,
          departureDate: new Date(params.departureDate),
          returnDate: params.returnDate ? new Date(params.returnDate) : null,
          adults: params.adults,
          children: params.children || 0,
          infants: params.infants || 0,
          cabinClass: params.cabinClass || 'ECONOMY',
          directOnly: params.directOnly || false,
          flexibleDates: false,
          resultsCount: dedupedOffers.length,
          minPrice,
          maxPrice,
          currency: params.currency || 'USD',
          expiresAt
        }
      });

      // Cache offers for quick retrieval
      await this.cacheOffers(searchId, dedupedOffers);

      // Record in search history if user is logged in
      if (userId) {
        await this.recordSearchHistory(userId, params, dedupedOffers.length, minPrice);
      }

      const duration = Date.now() - startTime;
      logger.info('Flight search completed', {
        searchId,
        totalOffers: dedupedOffers.length,
        providers,
        duration: `${duration}ms`
      });

      return {
        searchId,
        offers: dedupedOffers,
        totalResults: dedupedOffers.length,
        minPrice,
        maxPrice,
        currency: params.currency || 'USD',
        searchParams: params,
        providers,
        searchedAt: new Date(),
        expiresAt
      };

    } catch (error: any) {
      logger.error('Flight search failed', { searchId, error: error.message });
      throw error;
    }
  }

  /**
   * Get a specific offer by ID
   */
  async getOffer(searchId: string, offerId: string): Promise<FlightOffer | null> {
    // Try cache first
    const cacheKey = `flight:offers:${searchId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const offers: FlightOffer[] = JSON.parse(cached);
      return offers.find(o => o.id === offerId) || null;
    }

    return null;
  }

  /**
   * Confirm offer price before booking
   */
  async confirmPrice(offer: FlightOffer): Promise<FlightOffer | null> {
    if (offer.provider === 'amadeus') {
      // Amadeus requires the original offer object
      return amadeusService.confirmPrice(offer.providerOfferId, offer);
    } else if (offer.provider === 'duffel') {
      return duffelService.getOffer(offer.providerOfferId);
    }
    return null;
  }

  /**
   * Create a flight booking
   */
  async createBooking(params: {
    userId: string;
    offer: FlightOffer;
    passengers: PassengerInfo[];
    contactEmail: string;
    contactPhone: string;
  }): Promise<BookingResult> {
    const { userId, offer, passengers, contactEmail, contactPhone } = params;

    logger.info('Creating flight booking', {
      userId,
      provider: offer.provider,
      offerId: offer.id
    });

    try {
      // Book with the appropriate provider
      let providerBooking;

      if (offer.provider === 'amadeus') {
        providerBooking = await amadeusService.createBooking({
          offerId: offer.providerOfferId,
          passengers,
          contactEmail,
          contactPhone
        });
      } else if (offer.provider === 'duffel') {
        providerBooking = await duffelService.createBooking({
          offerId: offer.providerOfferId,
          passengers,
          contactEmail,
          contactPhone
        });
      } else {
        throw new Error(`Unknown provider: ${offer.provider}`);
      }

      // Create booking record in our database
      const booking = await prisma.flightBooking.create({
        data: {
          userId,
          bookingReference: providerBooking.bookingReference,
          status: 'CONFIRMED',
          totalPrice: providerBooking.totalPrice,
          currency: providerBooking.currency,
          paidAmount: 0,
          provider: offer.provider,
          providerBookingId: providerBooking.pnr,
          contactEmail,
          contactPhone,
          passengers: {
            create: passengers.map(p => ({
              title: p.gender === 'MALE' ? 'Mr' : 'Ms',
              firstName: p.firstName,
              lastName: p.lastName,
              dateOfBirth: new Date(p.dateOfBirth),
              gender: p.gender,
              nationality: p.nationality,
              passportNumber: p.passportNumber,
              passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
              passportCountry: p.passportCountry,
              basePrice: offer.basePrice / passengers.length,
              taxes: offer.taxes / passengers.length
            }))
          },
          itinerary: {
            create: offer.segments.map(seg => ({
              segmentOrder: seg.segmentOrder,
              legType: seg.legType,
              flightNumber: seg.flightNumber,
              airlineCode: seg.airlineCode,
              aircraftType: seg.aircraftCode,
              departureAirport: seg.departureAirport,
              departureTerminal: seg.departureTerminal,
              departureTime: seg.departureTime,
              arrivalAirport: seg.arrivalAirport,
              arrivalTerminal: seg.arrivalTerminal,
              arrivalTime: seg.arrivalTime,
              status: 'SCHEDULED'
            }))
          }
        },
        include: {
          passengers: true,
          itinerary: true
        }
      });

      // Calculate and award loyalty points
      const pointsEarned = Math.floor(offer.totalPrice);
      await this.awardLoyaltyPoints(userId, pointsEarned, booking.id);

      // Update booking with points
      await prisma.flightBooking.update({
        where: { id: booking.id },
        data: { loyaltyPointsEarned: pointsEarned }
      });

      logger.info('Flight booking created successfully', {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        pnr: providerBooking.pnr
      });

      return {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        pnr: providerBooking.pnr,
        status: 'CONFIRMED',
        totalPrice: providerBooking.totalPrice,
        currency: providerBooking.currency,
        provider: offer.provider,
        passengers: booking.passengers,
        itinerary: booking.itinerary
      };

    } catch (error: any) {
      logger.error('Booking creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, userId: string): Promise<{
    success: boolean;
    refundAmount?: number;
    currency?: string;
  }> {
    const booking = await prisma.flightBooking.findFirst({
      where: { id: bookingId, userId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'CANCELED') {
      throw new Error('Booking already cancelled');
    }

    try {
      let cancellationResult;

      if (booking.provider === 'duffel' && booking.providerBookingId) {
        cancellationResult = await duffelService.cancelBooking(booking.providerBookingId);
      } else {
        // For Amadeus or if provider cancellation fails, mark as cancelled locally
        cancellationResult = { success: true };
      }

      // Update booking status
      await prisma.flightBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELED',
          canceledAt: new Date()
        }
      });

      // Reverse loyalty points
      if (booking.loyaltyPointsEarned > 0) {
        await this.deductLoyaltyPoints(userId, booking.loyaltyPointsEarned, bookingId);
      }

      return cancellationResult;

    } catch (error: any) {
      logger.error('Booking cancellation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const bookings = await prisma.flightBooking.findMany({
      where: {
        userId,
        ...(options?.status ? { status: options.status as any } : {})
      },
      include: {
        passengers: true,
        itinerary: {
          orderBy: { segmentOrder: 'asc' }
        }
      },
      orderBy: { bookedAt: 'desc' },
      take: options?.limit || 10,
      skip: options?.offset || 0
    });

    return bookings;
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string, userId: string): Promise<any> {
    const booking = await prisma.flightBooking.findFirst({
      where: { id: bookingId, userId },
      include: {
        passengers: {
          include: { seatAssignments: true }
        },
        itinerary: {
          orderBy: { segmentOrder: 'asc' }
        },
        ancillaries: true,
        transactions: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Get real-time flight status if available
    const flightStatuses = await this.getFlightStatuses(booking.itinerary);

    return {
      ...booking,
      flightStatuses
    };
  }

  /**
   * Get available seats for a booking
   */
  async getSeats(offer: FlightOffer): Promise<any> {
    if (offer.provider === 'amadeus') {
      return amadeusService.getSeatMap(offer);
    } else if (offer.provider === 'duffel') {
      const services = await duffelService.getServices(offer.providerOfferId);
      return services.seats;
    }
    return null;
  }

  /**
   * Search airports/locations
   */
  async searchLocations(query: string): Promise<any[]> {
    // Try both providers and merge results
    const [amadeusResults, duffelResults] = await Promise.allSettled([
      amadeusService.searchLocations(query),
      duffelService.searchAirports(query)
    ]);

    const results: any[] = [];
    const seen = new Set<string>();

    if (amadeusResults.status === 'fulfilled') {
      amadeusResults.value.forEach(loc => {
        if (!seen.has(loc.iataCode)) {
          seen.add(loc.iataCode);
          results.push(loc);
        }
      });
    }

    if (duffelResults.status === 'fulfilled') {
      duffelResults.value.forEach(loc => {
        if (!seen.has(loc.iataCode)) {
          seen.add(loc.iataCode);
          results.push(loc);
        }
      });
    }

    return results;
  }

  // ==================== PRIVATE METHODS ====================

  private deduplicateOffers(offers: FlightOffer[]): FlightOffer[] {
    const seen = new Map<string, FlightOffer>();

    for (const offer of offers) {
      // Create a key based on flights and price
      const key = offer.segments
        .map(s => `${s.flightNumber}-${s.departureTime.toISOString()}`)
        .join('|');

      const existing = seen.get(key);
      if (!existing || offer.totalPrice < existing.totalPrice) {
        seen.set(key, offer);
      }
    }

    return Array.from(seen.values());
  }

  private async cacheOffers(searchId: string, offers: FlightOffer[]): Promise<void> {
    const cacheKey = `flight:offers:${searchId}`;
    await redis.setex(cacheKey, this.searchCacheTTL, JSON.stringify(offers));

    // Also cache individual offers for quick retrieval
    for (const offer of offers) {
      await redis.setex(
        `flight:offer:${offer.id}`,
        this.searchCacheTTL,
        JSON.stringify(offer)
      );
    }
  }

  private async recordSearchHistory(
    userId: string,
    params: FlightSearchParams,
    resultsCount: number,
    minPrice: number
  ): Promise<void> {
    try {
      const summary = params.returnDate
        ? `${params.origin} → ${params.destination}, ${params.departureDate} - ${params.returnDate}`
        : `${params.origin} → ${params.destination}, ${params.departureDate}`;

      await prisma.searchHistory.create({
        data: {
          userId,
          searchType: 'FLIGHT',
          summary,
          parameters: params as any,
          resultsCount,
          minPrice,
          currency: params.currency || 'USD'
        }
      });
    } catch (error) {
      logger.warn('Failed to record search history', { error });
    }
  }

  private async awardLoyaltyPoints(userId: string, points: number, sourceId: string): Promise<void> {
    try {
      // Get current balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true }
      });

      const newBalance = (user?.loyaltyPoints || 0) + points;

      // Update user points
      await prisma.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: newBalance,
          lifetimePoints: { increment: points }
        }
      });

      // Record transaction
      await prisma.loyaltyTransaction.create({
        data: {
          userId,
          type: 'EARN',
          points,
          source: 'flight_booking',
          sourceId,
          balanceAfter: newBalance,
          description: 'Points earned from flight booking'
        }
      });
    } catch (error) {
      logger.warn('Failed to award loyalty points', { error });
    }
  }

  private async deductLoyaltyPoints(userId: string, points: number, sourceId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true }
      });

      const newBalance = Math.max(0, (user?.loyaltyPoints || 0) - points);

      await prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: newBalance }
      });

      await prisma.loyaltyTransaction.create({
        data: {
          userId,
          type: 'ADJUST',
          points: -points,
          source: 'booking_cancellation',
          sourceId,
          balanceAfter: newBalance,
          description: 'Points reversed due to booking cancellation'
        }
      });
    } catch (error) {
      logger.warn('Failed to deduct loyalty points', { error });
    }
  }

  private async getFlightStatuses(itinerary: any[]): Promise<any[]> {
    const statuses = [];

    for (const segment of itinerary) {
      try {
        const status = await amadeusService.getFlightStatus(
          segment.airlineCode,
          segment.flightNumber.replace(segment.airlineCode, ''),
          segment.departureTime.toISOString().split('T')[0]
        );
        statuses.push({
          segmentId: segment.id,
          ...status
        });
      } catch {
        statuses.push({
          segmentId: segment.id,
          status: segment.status
        });
      }
    }

    return statuses;
  }
}

export const flightService = new FlightService();
