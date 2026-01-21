/**
 * HOTELBEDS API SERVICE
 * Real production integration with Hotelbeds API
 * Supports: Hotel Search, Availability, Booking, Content
 */

import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { redis } from '../../config/redis';

// Types
export interface HotelSearchParams {
  destination: string;
  destinationType: 'CITY' | 'HOTEL' | 'COORDINATES';
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
  childrenAges?: number[];
  minStars?: number;
  maxStars?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface HotelOffer {
  id: string;
  provider: 'hotelbeds';
  providerOfferId: string;
  hotelCode: string;
  hotelName: string;
  starRating: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  mainImage: string;
  images: string[];
  description?: string;
  facilities: string[];
  roomType: string;
  roomDescription: string;
  boardType: string;
  boardName: string;
  totalPrice: number;
  pricePerNight: number;
  taxes: number;
  currency: string;
  cancellationPolicy: 'FREE_CANCELLATION' | 'NON_REFUNDABLE' | 'PARTIAL_REFUND' | 'DEADLINE_BASED';
  cancellationDeadline?: Date;
  rateComments?: string;
  roomsAvailable?: number;
  validUntil: Date;
  guestRating?: number;
  reviewCount?: number;
}

export interface HotelBookingParams {
  rateKey: string;
  holder: {
    firstName: string;
    lastName: string;
  };
  rooms: {
    occupants: {
      type: 'AD' | 'CH';
      firstName: string;
      lastName: string;
      age?: number;
    }[];
  }[];
  clientReference: string;
  remark?: string;
}

class HotelbedsService {
  private client: AxiosInstance;
  private contentClient: AxiosInstance;
  private cachePrefix = 'hotelbeds:';
  private cacheTTL = 900; // 15 minutes

  constructor() {
    const apiKey = process.env.HOTELBEDS_API_KEY!;
    const secret = process.env.HOTELBEDS_SECRET!;
    const baseURL = process.env.NODE_ENV === 'production'
      ? 'https://api.hotelbeds.com/hotel-api/1.0'
      : 'https://api.test.hotelbeds.com/hotel-api/1.0';
    const contentURL = process.env.NODE_ENV === 'production'
      ? 'https://api.hotelbeds.com/hotel-content-api/1.0'
      : 'https://api.test.hotelbeds.com/hotel-content-api/1.0';

    // Create API client with signature authentication
    this.client = axios.create({
      baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip'
      }
    });

    this.contentClient = axios.create({
      baseURL: contentURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    const addAuth = (config: any) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHash('sha256')
        .update(apiKey + secret + timestamp)
        .digest('hex');

      config.headers['Api-key'] = apiKey;
      config.headers['X-Signature'] = signature;
      return config;
    };

    this.client.interceptors.request.use(addAuth);
    this.contentClient.interceptors.request.use(addAuth);

    logger.info('Hotelbeds service initialized', {
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    });
  }

  /**
   * Search for hotel availability
   */
  async searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
    const cacheKey = this.getCacheKey('search', params);

    // Check cache first
    const cached = await this.getFromCache<HotelOffer[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached hotel search results');
      return cached;
    }

    try {
      logger.info('Searching Hotelbeds hotels', { params });

      // Build occupancy
      const occupancies = [];
      const adultsPerRoom = Math.ceil(params.adults / params.rooms);
      const childrenPerRoom = Math.ceil((params.children || 0) / params.rooms);

      for (let i = 0; i < params.rooms; i++) {
        const occupancy: any = {
          rooms: 1,
          adults: adultsPerRoom,
          children: childrenPerRoom
        };

        if (params.childrenAges?.length) {
          const startIdx = i * childrenPerRoom;
          occupancy.paxes = params.childrenAges
            .slice(startIdx, startIdx + childrenPerRoom)
            .map(age => ({ type: 'CH', age }));
        }

        occupancies.push(occupancy);
      }

      // Build request body
      const requestBody: any = {
        stay: {
          checkIn: params.checkIn,
          checkOut: params.checkOut
        },
        occupancies
      };

      // Add destination
      if (params.destinationType === 'COORDINATES' && params.latitude && params.longitude) {
        requestBody.geolocation = {
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius || 20,
          unit: 'km'
        };
      } else if (params.destinationType === 'HOTEL') {
        requestBody.hotels = {
          hotel: [parseInt(params.destination)]
        };
      } else {
        // City code
        requestBody.destination = {
          code: params.destination
        };
      }

      // Add filters
      if (params.minStars || params.maxStars) {
        requestBody.filter = {
          minCategory: params.minStars || 1,
          maxCategory: params.maxStars || 5
        };
      }

      // Make API call
      const response = await this.client.post('/hotels', requestBody);

      if (!response.data.hotels?.hotels) {
        return [];
      }

      // Transform and enrich results
      const offers = await this.transformHotelOffers(
        response.data.hotels.hotels,
        params.checkIn,
        params.checkOut,
        params.currency || 'USD'
      );

      // Filter by price if specified
      let filteredOffers = offers;
      if (params.minPrice) {
        filteredOffers = filteredOffers.filter(o => o.totalPrice >= params.minPrice!);
      }
      if (params.maxPrice) {
        filteredOffers = filteredOffers.filter(o => o.totalPrice <= params.maxPrice!);
      }

      // Cache results
      await this.setCache(cacheKey, filteredOffers);

      logger.info(`Found ${filteredOffers.length} hotel offers from Hotelbeds`);
      return filteredOffers;

    } catch (error: any) {
      logger.error('Hotelbeds search error', {
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  }

  /**
   * Check rate availability and get booking details
   */
  async checkRate(rateKey: string): Promise<{
    available: boolean;
    price?: number;
    currency?: string;
    cancellationPolicies?: any[];
  }> {
    try {
      const response = await this.client.post('/checkrates', {
        rooms: [{ rateKey }]
      });

      const hotel = response.data.hotel;
      if (!hotel) {
        return { available: false };
      }

      const room = hotel.rooms?.[0];
      const rate = room?.rates?.[0];

      return {
        available: true,
        price: parseFloat(rate?.net || '0'),
        currency: hotel.currency,
        cancellationPolicies: rate?.cancellationPolicies
      };

    } catch (error: any) {
      logger.error('Check rate error', { error: error.message });
      return { available: false };
    }
  }

  /**
   * Create a hotel booking
   */
  async createBooking(params: HotelBookingParams): Promise<{
    bookingReference: string;
    status: string;
    hotelConfirmation?: string;
    totalPrice: number;
    currency: string;
    cancellationReference?: string;
  }> {
    try {
      logger.info('Creating Hotelbeds booking', { clientReference: params.clientReference });

      const requestBody = {
        holder: {
          name: params.holder.firstName,
          surname: params.holder.lastName
        },
        rooms: params.rooms.map(room => ({
          rateKey: params.rateKey,
          paxes: room.occupants.map(occ => ({
            roomId: 1,
            type: occ.type,
            name: occ.firstName,
            surname: occ.lastName,
            age: occ.age
          }))
        })),
        clientReference: params.clientReference,
        remark: params.remark,
        tolerance: 2 // Accept price variance up to 2%
      };

      const response = await this.client.post('/bookings', requestBody);

      const booking = response.data.booking;

      logger.info('Hotelbeds booking created', {
        reference: booking.reference,
        status: booking.status
      });

      return {
        bookingReference: booking.reference,
        status: booking.status,
        hotelConfirmation: booking.hotel?.supplier?.vatNumber,
        totalPrice: parseFloat(booking.totalNet || '0'),
        currency: booking.currency,
        cancellationReference: booking.cancellationReference
      };

    } catch (error: any) {
      logger.error('Hotelbeds booking error', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Booking failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingReference: string): Promise<{
    success: boolean;
    cancellationReference?: string;
    refundAmount?: number;
    currency?: string;
  }> {
    try {
      const response = await this.client.delete(`/bookings/${bookingReference}`);

      const booking = response.data.booking;

      return {
        success: booking.status === 'CANCELLED',
        cancellationReference: booking.cancellationReference,
        refundAmount: booking.hotel?.cancellationAmount
          ? parseFloat(booking.hotel.cancellationAmount)
          : undefined,
        currency: booking.currency
      };

    } catch (error: any) {
      logger.error('Hotelbeds cancellation error', { error: error.message });
      throw new Error(`Cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingReference: string): Promise<any> {
    try {
      const response = await this.client.get(`/bookings/${bookingReference}`);
      return response.data.booking;
    } catch (error: any) {
      logger.error('Get booking error', { error: error.message });
      return null;
    }
  }

  /**
   * Get hotel content (details, images, facilities)
   */
  async getHotelContent(hotelCode: string): Promise<any> {
    const cacheKey = `${this.cachePrefix}content:${hotelCode}`;

    const cached = await this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.contentClient.get(`/hotels/${hotelCode}/details`);

      const hotel = response.data.hotel;
      const content = {
        code: hotel.code,
        name: hotel.name?.content,
        description: hotel.description?.content,
        address: hotel.address?.content,
        city: hotel.city?.content,
        state: hotel.state?.content,
        country: hotel.country?.content,
        postalCode: hotel.postalCode,
        latitude: hotel.coordinates?.latitude,
        longitude: hotel.coordinates?.longitude,
        email: hotel.email,
        phone: hotel.phones?.[0]?.phoneNumber,
        web: hotel.web,
        category: hotel.category?.description?.content,
        categoryCode: hotel.category?.code,
        chainName: hotel.chain?.description?.content,
        facilities: hotel.facilities?.map((f: any) => ({
          code: f.facilityCode,
          name: f.facilityName,
          group: f.facilityGroupCode
        })) || [],
        images: hotel.images?.map((img: any) => ({
          url: `https://photos.hotelbeds.com/giata/${img.path}`,
          type: img.imageType?.description?.content
        })) || [],
        rooms: hotel.rooms?.map((r: any) => ({
          code: r.roomCode,
          name: r.description,
          type: r.roomType,
          facilities: r.roomFacilities?.map((f: any) => f.description?.content) || []
        })) || []
      };

      await this.setCache(cacheKey, content, 86400); // Cache for 24h
      return content;

    } catch (error: any) {
      logger.error('Get hotel content error', { error: error.message });
      return null;
    }
  }

  /**
   * Search destinations (cities, hotels)
   */
  async searchDestinations(query: string): Promise<any[]> {
    const cacheKey = `${this.cachePrefix}destinations:${query}`;

    const cached = await this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.contentClient.get('/locations/destinations', {
        params: {
          fields: 'all',
          language: 'ENG',
          from: 1,
          to: 20,
          lastUpdateTime: new Date(Date.now() - 86400000 * 30).toISOString()
        }
      });

      // Filter by query
      const destinations = response.data.destinations
        ?.filter((d: any) =>
          d.name?.content?.toLowerCase().includes(query.toLowerCase())
        )
        .map((d: any) => ({
          code: d.code,
          name: d.name?.content,
          countryCode: d.countryCode,
          type: d.isoCode ? 'CITY' : 'ZONE'
        }))
        .slice(0, 10) || [];

      await this.setCache(cacheKey, destinations, 86400);
      return destinations;

    } catch (error: any) {
      logger.error('Search destinations error', { error: error.message });
      return [];
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async transformHotelOffers(
    hotels: any[],
    checkIn: string,
    checkOut: string,
    currency: string
  ): Promise<HotelOffer[]> {
    const offers: HotelOffer[] = [];
    const nights = this.calculateNights(checkIn, checkOut);

    for (const hotel of hotels) {
      // Get hotel content for additional details
      const content = await this.getHotelContent(hotel.code.toString());

      for (const room of hotel.rooms || []) {
        for (const rate of room.rates || []) {
          const totalPrice = parseFloat(rate.net);
          const pricePerNight = totalPrice / nights;

          // Determine cancellation policy
          let cancellationPolicy: HotelOffer['cancellationPolicy'] = 'NON_REFUNDABLE';
          let cancellationDeadline: Date | undefined;

          if (rate.rateClass === 'NRF' || rate.rateType === 'RECHECK') {
            cancellationPolicy = 'NON_REFUNDABLE';
          } else if (rate.cancellationPolicies?.length) {
            const policy = rate.cancellationPolicies[0];
            if (policy.amount === '0.00') {
              cancellationPolicy = 'FREE_CANCELLATION';
            } else {
              cancellationPolicy = 'DEADLINE_BASED';
            }
            cancellationDeadline = new Date(policy.from);
          }

          offers.push({
            id: uuidv4(),
            provider: 'hotelbeds',
            providerOfferId: rate.rateKey,
            hotelCode: hotel.code.toString(),
            hotelName: hotel.name,
            starRating: parseInt(hotel.categoryCode?.replace('EST', '') || '0'),
            address: content?.address || '',
            city: hotel.destinationName || content?.city || '',
            country: content?.country || '',
            latitude: hotel.latitude || content?.latitude || 0,
            longitude: hotel.longitude || content?.longitude || 0,
            mainImage: content?.images?.[0]?.url ||
              `https://photos.hotelbeds.com/giata/original/${hotel.code}/1.jpg`,
            images: content?.images?.map((i: any) => i.url) || [],
            description: content?.description,
            facilities: content?.facilities?.map((f: any) => f.name) || [],
            roomType: room.code,
            roomDescription: room.name,
            boardType: rate.boardCode,
            boardName: rate.boardName,
            totalPrice,
            pricePerNight,
            taxes: rate.taxes?.taxes?.reduce((sum: number, t: any) =>
              sum + parseFloat(t.amount || '0'), 0) || 0,
            currency: hotel.currency || currency,
            cancellationPolicy,
            cancellationDeadline,
            rateComments: rate.rateComments,
            roomsAvailable: rate.allotment,
            validUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            guestRating: hotel.reviews?.[0]?.rate,
            reviewCount: hotel.reviews?.[0]?.reviewCount
          });
        }
      }
    }

    return offers;
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getCacheKey(operation: string, params: any): string {
    const hash = Buffer.from(JSON.stringify(params)).toString('base64').slice(0, 32);
    return `${this.cachePrefix}${operation}:${hash}`;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async setCache(key: string, data: any, ttl: number = this.cacheTTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.warn('Cache set failed', { key, error });
    }
  }
}

export const hotelbedsService = new HotelbedsService();
