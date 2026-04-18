/**
 * DUFFEL FLIGHT API SERVICE
 * Real production integration with Duffel API
 * Supports: Flight Search, Booking, Seat Selection, Baggage
 */

import { Duffel } from '@duffel/api';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { redis } from '../../config/redis';
import type { FlightSearchParams, FlightOffer, FlightSegment, PassengerInfo } from './amadeus.service';

interface DuffelPassenger {
  type: 'adult' | 'child' | 'infant_without_seat';
  given_name: string;
  family_name: string;
  born_on: string;
  gender: 'f' | 'm';
  email?: string;
  phone_number?: string;
  identity_documents?: {
    unique_identifier: string;
    type: 'passport';
    issuing_country_code: string;
    expires_on: string;
  }[];
}

class DuffelService {
  private client: Duffel;
  private cachePrefix = 'duffel:';
  private cacheTTL = 900; // 15 minutes

  constructor() {
    this.client = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN!,
      debug: process.env.NODE_ENV !== 'production'
    });

    logger.info('Duffel service initialized');
  }

  /**
   * Search for flight offers
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    const cacheKey = this.getCacheKey('search', params);

    // Check cache first
    const cached = await this.getFromCache<FlightOffer[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached Duffel flight results');
      return cached;
    }

    try {
      logger.info('Searching Duffel flights', { params });

      // Build passengers array
      const passengers: { type: 'adult' | 'child' | 'infant_without_seat' }[] = [];

      for (let i = 0; i < params.adults; i++) {
        passengers.push({ type: 'adult' });
      }
      for (let i = 0; i < (params.children || 0); i++) {
        passengers.push({ type: 'child' });
      }
      for (let i = 0; i < (params.infants || 0); i++) {
        passengers.push({ type: 'infant_without_seat' });
      }

      // Build slices (legs)
      const slices: any[] = [{
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departureDate
      }];

      if (params.returnDate) {
        slices.push({
          origin: params.destination,
          destination: params.origin,
          departure_date: params.returnDate
        });
      }

      // Create offer request
      const offerRequest = await this.client.offerRequests.create({
        slices,
        passengers,
        cabin_class: this.mapCabinClass(params.cabinClass),
        max_connections: params.directOnly ? 0 : undefined
      });

      // Get offers
      const offersResponse = await this.client.offers.list({
        offer_request_id: offerRequest.data.id,
        max_connections: params.directOnly ? 0 : undefined,
        sort: 'total_amount'
      });

      // Transform to our format
      const offers = this.transformOffers(offersResponse.data, params.currency || 'USD');

      // Filter by max price if specified
      const filteredOffers = params.maxPrice
        ? offers.filter(o => o.totalPrice <= params.maxPrice!)
        : offers;

      // Cache results
      await this.setCache(cacheKey, filteredOffers);

      logger.info(`Found ${filteredOffers.length} flight offers from Duffel`);
      return filteredOffers;

    } catch (error: any) {
      logger.error('Duffel flight search error', {
        error: error.message,
        errors: error.errors
      });
      return [];
    }
  }

  /**
   * Get a specific offer by ID
   */
  async getOffer(offerId: string): Promise<FlightOffer | null> {
    try {
      const response = await this.client.offers.get(offerId);
      const offers = this.transformOffers([response.data], 'USD');
      return offers[0] || null;
    } catch (error: any) {
      logger.error('Get offer error', { error: error.message });
      return null;
    }
  }

  /**
   * Get available services (seats, baggage) for an offer
   */
  async getServices(offerId: string): Promise<{
    seats: any[];
    baggage: any[];
  }> {
    try {
      const [seatsResponse, baggageResponse] = await Promise.all([
        this.client.seatMaps.list({ offer_id: offerId }).catch(() => ({ data: [] })),
        this.client.offerPassengerBaggageSelection ?
          this.client.offers.get(offerId).then(o => ({
            data: o.data.available_services?.filter(s => s.type === 'baggage') || []
          })) : Promise.resolve({ data: [] })
      ]);

      return {
        seats: seatsResponse.data,
        baggage: baggageResponse.data
      };
    } catch (error: any) {
      logger.error('Get services error', { error: error.message });
      return { seats: [], baggage: [] };
    }
  }

  /**
   * Create a booking
   */
  async createBooking(params: {
    offerId: string;
    passengers: PassengerInfo[];
    contactEmail: string;
    contactPhone: string;
    selectedServices?: string[];
  }): Promise<{
    pnr: string;
    bookingReference: string;
    totalPrice: number;
    currency: string;
  }> {
    try {
      logger.info('Creating Duffel booking', { offerId: params.offerId });

      // Build passengers
      const duffelPassengers: DuffelPassenger[] = params.passengers.map((p, index) => {
        const passenger: DuffelPassenger = {
          type: p.type === 'ADULT' ? 'adult' : p.type === 'CHILD' ? 'child' : 'infant_without_seat',
          given_name: p.firstName,
          family_name: p.lastName,
          born_on: p.dateOfBirth,
          gender: p.gender === 'MALE' ? 'm' : 'f',
          email: index === 0 ? params.contactEmail : undefined,
          phone_number: index === 0 ? params.contactPhone : undefined
        };

        if (p.passportNumber && p.passportExpiry && p.passportCountry) {
          passenger.identity_documents = [{
            unique_identifier: p.passportNumber,
            type: 'passport',
            issuing_country_code: p.passportCountry,
            expires_on: p.passportExpiry
          }];
        }

        return passenger;
      });

      // Create order
      const orderParams: any = {
        selected_offers: [params.offerId],
        passengers: duffelPassengers,
        type: 'instant',
        metadata: {
          source: 'skyward_travels'
        }
      };

      if (params.selectedServices?.length) {
        orderParams.services = params.selectedServices.map(id => ({ id, quantity: 1 }));
      }

      const order = await this.client.orders.create(orderParams);

      const bookingReference = this.generateBookingReference();

      logger.info('Duffel booking created', {
        orderId: order.data.id,
        bookingReference
      });

      return {
        pnr: order.data.booking_reference || order.data.id,
        bookingReference,
        totalPrice: parseFloat(order.data.total_amount),
        currency: order.data.total_currency
      };

    } catch (error: any) {
      logger.error('Duffel booking error', {
        error: error.message,
        errors: error.errors
      });
      throw new Error(`Booking failed: ${error.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(orderId: string): Promise<{
    success: boolean;
    refundAmount?: number;
    currency?: string;
  }> {
    try {
      // First check if cancellation is available
      const order = await this.client.orders.get(orderId);

      if (!order.data.available_actions?.includes('cancel')) {
        throw new Error('This booking cannot be cancelled');
      }

      // Create cancellation request
      const cancellation = await this.client.orderCancellations.create({
        order_id: orderId
      });

      // Confirm cancellation
      await this.client.orderCancellations.confirm(cancellation.data.id);

      return {
        success: true,
        refundAmount: cancellation.data.refund_amount
          ? parseFloat(cancellation.data.refund_amount)
          : undefined,
        currency: cancellation.data.refund_currency
      };

    } catch (error: any) {
      logger.error('Duffel cancellation error', { error: error.message });
      throw new Error(`Cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await this.client.orders.get(orderId);
      return response.data;
    } catch (error: any) {
      logger.error('Get order error', { error: error.message });
      return null;
    }
  }

  /**
   * Search airports
   */
  async searchAirports(query: string): Promise<any[]> {
    const cacheKey = `${this.cachePrefix}airports:${query}`;

    const cached = await this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.airports.list({
        name: query
      });

      const airports = response.data.map(airport => ({
        iataCode: airport.iata_code,
        name: airport.name,
        city: airport.city_name,
        country: airport.country_name,
        countryCode: airport.country?.iata_code,
        latitude: airport.latitude,
        longitude: airport.longitude,
        timezone: airport.time_zone
      }));

      await this.setCache(cacheKey, airports, 86400);
      return airports;

    } catch (error: any) {
      logger.error('Airport search error', { error: error.message });
      return [];
    }
  }

  /**
   * Get airline info
   */
  async getAirline(iataCode: string): Promise<any> {
    const cacheKey = `${this.cachePrefix}airline:${iataCode}`;

    const cached = await this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.airlines.get(iataCode);

      const airline = {
        iataCode: response.data.iata_code,
        name: response.data.name,
        logo: response.data.logo_symbol_url || response.data.logo_lockup_url
      };

      await this.setCache(cacheKey, airline, 604800);
      return airline;

    } catch (error: any) {
      logger.error('Get airline error', { error: error.message });
      return null;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private transformOffers(offers: any[], targetCurrency: string): FlightOffer[] {
    return offers.map(offer => this.transformOffer(offer, targetCurrency));
  }

  private transformOffer(offer: any, targetCurrency: string): FlightOffer {
    const segments: FlightSegment[] = [];
    let totalDuration = 0;
    let stops = 0;

    offer.slices.forEach((slice: any, sliceIndex: number) => {
      const legType = sliceIndex === 0 ? 'OUTBOUND' : 'RETURN';

      // Parse ISO 8601 duration
      totalDuration += this.parseDuration(slice.duration);

      slice.segments.forEach((seg: any, segIndex: number) => {
        if (segIndex > 0) stops++;

        // Find passenger segment for amenities
        const passengerSeg = offer.passengers?.[0]?.baggages?.find(
          (b: any) => b.segment_ids?.includes(seg.id)
        );

        segments.push({
          segmentOrder: segments.length,
          legType,
          flightNumber: `${seg.marketing_carrier.iata_code}${seg.marketing_carrier_flight_number}`,
          airlineCode: seg.marketing_carrier.iata_code,
          airlineName: seg.marketing_carrier.name,
          aircraftCode: seg.aircraft?.iata_code,
          departureAirport: seg.origin.iata_code,
          departureTerminal: seg.origin_terminal,
          departureTime: new Date(seg.departing_at),
          arrivalAirport: seg.destination.iata_code,
          arrivalTerminal: seg.destination_terminal,
          arrivalTime: new Date(seg.arriving_at),
          duration: this.parseDuration(seg.duration),
          cabinClass: this.mapDuffelCabinClass(seg.passengers?.[0]?.cabin_class_marketing_name || offer.cabin_class),
          bookingClass: seg.passengers?.[0]?.cabin_class,
          hasMeal: seg.passengers?.[0]?.meal_service !== null,
          hasWifi: false, // Duffel doesn't provide this directly
          hasEntertainment: false,
          hasPower: false,
          carryOnIncluded: true,
          checkedBagIncluded: offer.passengers?.[0]?.baggages?.[0]?.quantity || 0,
          checkedBagWeight: undefined,
          co2Emissions: offer.total_emissions_kg ? offer.total_emissions_kg / segments.length : undefined
        });
      });
    });

    return {
      id: uuidv4(),
      provider: 'duffel',
      providerOfferId: offer.id,
      totalPrice: parseFloat(offer.total_amount),
      basePrice: parseFloat(offer.base_amount || offer.total_amount),
      taxes: parseFloat(offer.tax_amount || '0'),
      fees: 0,
      currency: offer.total_currency,
      validUntil: new Date(offer.expires_at),
      seatsAvailable: undefined,
      isRefundable: offer.payment_requirements?.requires_instant_payment === false,
      isChangeable: offer.conditions?.change_before_departure?.allowed || false,
      totalDuration,
      stops,
      segments
    };
  }

  private parseDuration(iso8601: string): number {
    // Parse PT2H30M format
    const match = iso8601.match(/PT(\d+H)?(\d+M)?/);
    const hours = parseInt(match?.[1]?.replace('H', '') || '0');
    const minutes = parseInt(match?.[2]?.replace('M', '') || '0');
    return hours * 60 + minutes;
  }

  private mapCabinClass(cabin?: string): 'economy' | 'premium_economy' | 'business' | 'first' | undefined {
    switch (cabin) {
      case 'ECONOMY': return 'economy';
      case 'PREMIUM_ECONOMY': return 'premium_economy';
      case 'BUSINESS': return 'business';
      case 'FIRST': return 'first';
      default: return undefined;
    }
  }

  private mapDuffelCabinClass(cabin: string): string {
    const lower = cabin.toLowerCase();
    if (lower.includes('first')) return 'FIRST';
    if (lower.includes('business')) return 'BUSINESS';
    if (lower.includes('premium')) return 'PREMIUM_ECONOMY';
    return 'ECONOMY';
  }

  private generateBookingReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SKY';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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

export const duffelService = new DuffelService();
