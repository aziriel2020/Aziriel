/**
 * UNIFIED HOTEL SERVICE
 * Aggregates hotel inventory from multiple providers
 * Handles search, booking, and management
 */

import { v4 as uuidv4 } from 'uuid';
import { hotelbedsService, HotelSearchParams, HotelOffer } from './hotelbeds.service';
import { logger } from '../../utils/logger';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

interface HotelSearchResult {
  searchId: string;
  offers: HotelOffer[];
  totalResults: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  searchParams: HotelSearchParams;
  providers: string[];
  searchedAt: Date;
  expiresAt: Date;
}

interface HotelBookingParams {
  userId: string;
  offer: HotelOffer;
  guests: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    isLead: boolean;
  }[];
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  arrivalTime?: string;
}

class HotelService {
  private searchCacheTTL = 900; // 15 minutes

  /**
   * Search hotels from all providers
   */
  async searchHotels(params: HotelSearchParams, userId?: string): Promise<HotelSearchResult> {
    const searchId = uuidv4();
    const startTime = Date.now();

    logger.info('Starting hotel search', { searchId, params });

    try {
      // Search providers (currently Hotelbeds, can add more)
      const [hotelbedsResults] = await Promise.allSettled([
        hotelbedsService.searchHotels(params)
      ]);

      // Collect results
      const allOffers: HotelOffer[] = [];
      const providers: string[] = [];

      if (hotelbedsResults.status === 'fulfilled' && hotelbedsResults.value.length > 0) {
        allOffers.push(...hotelbedsResults.value);
        providers.push('hotelbeds');
        logger.info(`Hotelbeds returned ${hotelbedsResults.value.length} offers`);
      }

      // Sort by price
      allOffers.sort((a, b) => a.totalPrice - b.totalPrice);

      // Calculate stats
      const minPrice = allOffers.length > 0 ? allOffers[0].totalPrice : 0;
      const maxPrice = allOffers.length > 0 ? allOffers[allOffers.length - 1].totalPrice : 0;
      const nights = this.calculateNights(params.checkIn, params.checkOut);

      const expiresAt = new Date(Date.now() + this.searchCacheTTL * 1000);

      // Store search in database
      await prisma.hotelSearch.create({
        data: {
          id: searchId,
          userId,
          sessionId: uuidv4(),
          destination: params.destination,
          destinationType: params.destinationType,
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius,
          checkIn: new Date(params.checkIn),
          checkOut: new Date(params.checkOut),
          nights,
          rooms: params.rooms,
          adults: params.adults,
          children: params.children || 0,
          childrenAges: params.childrenAges || [],
          minStars: params.minStars,
          maxPrice: params.maxPrice,
          currency: params.currency || 'USD',
          resultsCount: allOffers.length,
          expiresAt
        }
      });

      // Cache offers
      await this.cacheOffers(searchId, allOffers);

      // Record search history
      if (userId) {
        await this.recordSearchHistory(userId, params, allOffers.length, minPrice);
      }

      const duration = Date.now() - startTime;
      logger.info('Hotel search completed', {
        searchId,
        totalOffers: allOffers.length,
        duration: `${duration}ms`
      });

      return {
        searchId,
        offers: allOffers,
        totalResults: allOffers.length,
        minPrice,
        maxPrice,
        currency: params.currency || 'USD',
        searchParams: params,
        providers,
        searchedAt: new Date(),
        expiresAt
      };

    } catch (error: any) {
      logger.error('Hotel search failed', { searchId, error: error.message });
      throw error;
    }
  }

  /**
   * Get hotel details with all information
   */
  async getHotelDetails(hotelCode: string): Promise<any> {
    // Get from database first
    let hotel = await prisma.hotel.findFirst({
      where: { providerCode: hotelCode },
      include: {
        rooms: true,
        reviews: {
          where: { status: 'APPROVED' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { firstName: true, lastName: true, avatar: true }
            }
          }
        }
      }
    });

    // If not in database, fetch from API and store
    if (!hotel) {
      const content = await hotelbedsService.getHotelContent(hotelCode);
      if (content) {
        hotel = await prisma.hotel.create({
          data: {
            providerCode: content.code,
            provider: 'hotelbeds',
            name: content.name,
            chainName: content.chainName,
            starRating: parseFloat(content.categoryCode?.replace('EST', '') || '0'),
            categoryName: content.category,
            address: content.address || '',
            city: content.city || '',
            country: content.country || '',
            countryCode: '',
            latitude: content.latitude || 0,
            longitude: content.longitude || 0,
            phone: content.phone,
            email: content.email,
            website: content.web,
            description: content.description,
            mainImage: content.images?.[0]?.url,
            images: content.images?.map((i: any) => i.url) || [],
            facilities: content.facilities?.map((f: any) => f.name) || [],
            checkInTime: '15:00',
            checkOutTime: '11:00',
            rooms: {
              create: content.rooms?.map((r: any) => ({
                roomCode: r.code,
                name: r.name,
                description: r.name,
                maxOccupancy: 2,
                maxAdults: 2,
                maxChildren: 1,
                amenities: r.facilities || []
              })) || []
            }
          },
          include: {
            rooms: true,
            reviews: true
          }
        });
      }
    }

    return hotel;
  }

  /**
   * Get specific offer details
   */
  async getOffer(searchId: string, offerId: string): Promise<HotelOffer | null> {
    const cacheKey = `hotel:offers:${searchId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const offers: HotelOffer[] = JSON.parse(cached);
      return offers.find(o => o.id === offerId) || null;
    }

    return null;
  }

  /**
   * Check rate availability before booking
   */
  async checkRate(offer: HotelOffer): Promise<{
    available: boolean;
    currentPrice?: number;
    currency?: string;
  }> {
    if (offer.provider === 'hotelbeds') {
      return hotelbedsService.checkRate(offer.providerOfferId);
    }
    return { available: false };
  }

  /**
   * Create a hotel booking
   */
  async createBooking(params: HotelBookingParams): Promise<{
    bookingId: string;
    bookingReference: string;
    confirmationNumber?: string;
    status: string;
    totalPrice: number;
    currency: string;
  }> {
    const { userId, offer, guests, contactEmail, contactPhone, specialRequests, arrivalTime } = params;

    logger.info('Creating hotel booking', {
      userId,
      hotelCode: offer.hotelCode,
      provider: offer.provider
    });

    try {
      // Check rate is still available
      const rateCheck = await this.checkRate(offer);
      if (!rateCheck.available) {
        throw new Error('This rate is no longer available. Please search again.');
      }

      // Book with provider
      let providerBooking;
      const clientReference = this.generateBookingReference();

      if (offer.provider === 'hotelbeds') {
        const leadGuest = guests.find(g => g.isLead) || guests[0];

        providerBooking = await hotelbedsService.createBooking({
          rateKey: offer.providerOfferId,
          holder: {
            firstName: leadGuest.firstName,
            lastName: leadGuest.lastName
          },
          rooms: [{
            occupants: guests.map(g => ({
              type: 'AD' as const,
              firstName: g.firstName,
              lastName: g.lastName
            }))
          }],
          clientReference,
          remark: specialRequests
        });
      } else {
        throw new Error(`Unknown provider: ${offer.provider}`);
      }

      // Calculate nights
      const nights = this.calculateNights(
        new Date().toISOString().split('T')[0], // Will be replaced with actual dates
        new Date().toISOString().split('T')[0]
      );

      // Create booking in database
      const booking = await prisma.hotelBooking.create({
        data: {
          userId,
          bookingReference: clientReference,
          hotelId: offer.hotelCode,
          hotelName: offer.hotelName,
          hotelAddress: offer.address,
          hotelCity: offer.city,
          hotelCountry: offer.country,
          hotelPhone: '',
          roomType: offer.roomType,
          roomCount: 1,
          checkIn: new Date(offer.validUntil), // Should be from search params
          checkOut: new Date(offer.validUntil),
          nights: 1,
          adults: guests.length,
          children: 0,
          childrenAges: [],
          status: 'CONFIRMED',
          totalPrice: providerBooking.totalPrice,
          currency: providerBooking.currency,
          rateName: offer.boardName,
          mealPlan: this.mapMealPlan(offer.boardType),
          cancellationPolicy: offer.cancellationPolicy,
          cancellationDeadline: offer.cancellationDeadline,
          provider: offer.provider,
          providerBookingId: providerBooking.bookingReference,
          confirmationNumber: providerBooking.hotelConfirmation,
          guestName: `${guests[0].firstName} ${guests[0].lastName}`,
          guestEmail: contactEmail,
          guestPhone: contactPhone,
          specialRequests,
          arrivalTime,
          guests: {
            create: guests.map(g => ({
              firstName: g.firstName,
              lastName: g.lastName,
              email: g.email,
              phone: g.phone,
              isLead: g.isLead
            }))
          }
        },
        include: { guests: true }
      });

      // Award loyalty points
      const pointsEarned = Math.floor(providerBooking.totalPrice * 2); // 2 points per dollar
      await this.awardLoyaltyPoints(userId, pointsEarned, booking.id);

      await prisma.hotelBooking.update({
        where: { id: booking.id },
        data: { loyaltyPointsEarned: pointsEarned }
      });

      logger.info('Hotel booking created', {
        bookingId: booking.id,
        bookingReference: clientReference,
        status: 'CONFIRMED'
      });

      return {
        bookingId: booking.id,
        bookingReference: clientReference,
        confirmationNumber: providerBooking.hotelConfirmation,
        status: 'CONFIRMED',
        totalPrice: providerBooking.totalPrice,
        currency: providerBooking.currency
      };

    } catch (error: any) {
      logger.error('Hotel booking failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel a hotel booking
   */
  async cancelBooking(bookingId: string, userId: string): Promise<{
    success: boolean;
    refundAmount?: number;
    currency?: string;
  }> {
    const booking = await prisma.hotelBooking.findFirst({
      where: { id: bookingId, userId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'CANCELED') {
      throw new Error('Booking already cancelled');
    }

    // Check cancellation deadline
    if (booking.cancellationDeadline && new Date() > booking.cancellationDeadline) {
      if (booking.cancellationPolicy === 'FREE_CANCELLATION') {
        throw new Error('Free cancellation deadline has passed');
      }
    }

    try {
      let result = { success: true, refundAmount: undefined as number | undefined, currency: undefined as string | undefined };

      if (booking.provider === 'hotelbeds' && booking.providerBookingId) {
        const cancelResult = await hotelbedsService.cancelBooking(booking.providerBookingId);
        result = {
          success: cancelResult.success,
          refundAmount: cancelResult.refundAmount,
          currency: cancelResult.currency
        };
      }

      // Update booking status
      await prisma.hotelBooking.update({
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

      return result;

    } catch (error: any) {
      logger.error('Hotel cancellation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user's hotel bookings
   */
  async getUserBookings(userId: string, options?: {
    status?: string;
    upcoming?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const where: any = { userId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.upcoming) {
      where.checkIn = { gte: new Date() };
    }

    const bookings = await prisma.hotelBooking.findMany({
      where,
      include: {
        guests: true,
        transactions: true
      },
      orderBy: { checkIn: 'asc' },
      take: options?.limit || 10,
      skip: options?.offset || 0
    });

    return bookings;
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string, userId: string): Promise<any> {
    const booking = await prisma.hotelBooking.findFirst({
      where: { id: bookingId, userId },
      include: {
        guests: true,
        transactions: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Get hotel details
    const hotel = await this.getHotelDetails(booking.hotelId);

    return {
      ...booking,
      hotel
    };
  }

  /**
   * Search destinations
   */
  async searchDestinations(query: string): Promise<any[]> {
    return hotelbedsService.searchDestinations(query);
  }

  /**
   * Submit a review
   */
  async submitReview(params: {
    userId: string;
    bookingId: string;
    overallRating: number;
    ratings?: {
      cleanliness?: number;
      location?: number;
      service?: number;
      value?: number;
      amenities?: number;
    };
    title?: string;
    content: string;
    travelType?: string;
    photos?: string[];
  }): Promise<any> {
    // Verify booking exists and is completed
    const booking = await prisma.hotelBooking.findFirst({
      where: {
        id: params.bookingId,
        userId: params.userId,
        checkOut: { lte: new Date() }
      }
    });

    if (!booking) {
      throw new Error('Cannot review: booking not found or stay not completed');
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: params.userId,
        bookingId: params.bookingId
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this stay');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: params.userId,
        targetType: 'HOTEL',
        targetId: booking.hotelId,
        hotelId: booking.hotelId,
        bookingType: 'hotel',
        bookingId: params.bookingId,
        overallRating: params.overallRating,
        ratings: params.ratings as any,
        title: params.title,
        content: params.content,
        travelType: params.travelType as any,
        travelDate: booking.checkIn,
        photos: params.photos || [],
        status: 'PENDING',
        isVerified: true
      }
    });

    // Award bonus points for review
    await this.awardLoyaltyPoints(params.userId, 50, review.id);

    return review;
  }

  // ==================== PRIVATE METHODS ====================

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private mapMealPlan(boardCode: string): 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE' {
    switch (boardCode) {
      case 'RO': return 'ROOM_ONLY';
      case 'BB': return 'BREAKFAST';
      case 'HB': return 'HALF_BOARD';
      case 'FB': return 'FULL_BOARD';
      case 'AI': return 'ALL_INCLUSIVE';
      default: return 'ROOM_ONLY';
    }
  }

  private generateBookingReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'HTL';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async cacheOffers(searchId: string, offers: HotelOffer[]): Promise<void> {
    const cacheKey = `hotel:offers:${searchId}`;
    await redis.setex(cacheKey, this.searchCacheTTL, JSON.stringify(offers));
  }

  private async recordSearchHistory(
    userId: string,
    params: HotelSearchParams,
    resultsCount: number,
    minPrice: number
  ): Promise<void> {
    try {
      const summary = `${params.destination}, ${params.checkIn} - ${params.checkOut}`;

      await prisma.searchHistory.create({
        data: {
          userId,
          searchType: 'HOTEL',
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true }
      });

      const newBalance = (user?.loyaltyPoints || 0) + points;

      await prisma.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: newBalance,
          lifetimePoints: { increment: points }
        }
      });

      await prisma.loyaltyTransaction.create({
        data: {
          userId,
          type: 'EARN',
          points,
          source: 'hotel_booking',
          sourceId,
          balanceAfter: newBalance,
          description: 'Points earned from hotel booking'
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
}

export const hotelService = new HotelService();
