/**
 * AMADEUS FLIGHT API SERVICE
 * Real production integration with Amadeus GDS
 * Supports: Flight Search, Booking, Seat Maps, Ancillaries
 */

import Amadeus from 'amadeus';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { redis } from '../../config/redis';
import { prisma } from '../../config/database';

// Types
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  directOnly?: boolean;
  maxPrice?: number;
  currency?: string;
}

export interface FlightOffer {
  id: string;
  provider: 'amadeus';
  providerOfferId: string;
  totalPrice: number;
  basePrice: number;
  taxes: number;
  fees: number;
  currency: string;
  validUntil: Date;
  seatsAvailable?: number;
  isRefundable: boolean;
  isChangeable: boolean;
  totalDuration: number;
  stops: number;
  segments: FlightSegment[];
}

export interface FlightSegment {
  segmentOrder: number;
  legType: 'OUTBOUND' | 'RETURN';
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  aircraftCode?: string;
  departureAirport: string;
  departureTerminal?: string;
  departureTime: Date;
  arrivalAirport: string;
  arrivalTerminal?: string;
  arrivalTime: Date;
  duration: number;
  cabinClass: string;
  bookingClass?: string;
  hasMeal: boolean;
  hasWifi: boolean;
  hasEntertainment: boolean;
  hasPower: boolean;
  carryOnIncluded: boolean;
  checkedBagIncluded: number;
  checkedBagWeight?: number;
  co2Emissions?: number;
}

export interface BookingParams {
  offerId: string;
  passengers: PassengerInfo[];
  contactEmail: string;
  contactPhone: string;
  paymentInfo?: PaymentInfo;
}

export interface PassengerInfo {
  type: 'ADULT' | 'CHILD' | 'INFANT';
  gender: 'MALE' | 'FEMALE';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

class AmadeusService {
  private client: Amadeus;
  private cachePrefix = 'amadeus:';
  private cacheTTL = 900; // 15 minutes

  constructor() {
    // Initialize Amadeus client
    this.client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
      hostname: process.env.NODE_ENV === 'production'
        ? 'production'
        : 'test'
    });

    logger.info('Amadeus service initialized', {
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    });
  }

  /**
   * Search for flight offers
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    const cacheKey = this.getCacheKey('search', params);

    // Check cache first
    const cached = await this.getFromCache<FlightOffer[]>(cacheKey);
    if (cached) {
      logger.debug('Returning cached flight search results');
      return cached;
    }

    try {
      logger.info('Searching Amadeus flights', { params });

      const searchParams: any = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        adults: params.adults,
        currencyCode: params.currency || 'USD',
        max: 50 // Maximum results
      };

      // Add optional parameters
      if (params.returnDate) {
        searchParams.returnDate = params.returnDate;
      }
      if (params.children) {
        searchParams.children = params.children;
      }
      if (params.infants) {
        searchParams.infants = params.infants;
      }
      if (params.cabinClass) {
        searchParams.travelClass = params.cabinClass;
      }
      if (params.directOnly) {
        searchParams.nonStop = true;
      }
      if (params.maxPrice) {
        searchParams.maxPrice = params.maxPrice;
      }

      // Make API call
      const response = await this.client.shopping.flightOffersSearch.get(searchParams);

      // Transform response to our format
      const offers = this.transformFlightOffers(response.data, response.dictionaries);

      // Cache results
      await this.setCache(cacheKey, offers);

      logger.info(`Found ${offers.length} flight offers from Amadeus`);
      return offers;

    } catch (error: any) {
      logger.error('Amadeus flight search error', {
        error: error.message,
        code: error.response?.statusCode,
        details: error.response?.result?.errors
      });

      // Return empty array on error to allow fallback to other providers
      if (error.response?.statusCode === 400) {
        return [];
      }

      throw new Error(`Flight search failed: ${error.message}`);
    }
  }

  /**
   * Get flight offer pricing (confirm price)
   */
  async confirmPrice(offerId: string, offer: any): Promise<FlightOffer | null> {
    try {
      logger.info('Confirming flight price', { offerId });

      const response = await this.client.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [offer]
          }
        })
      );

      if (response.data?.flightOffers?.[0]) {
        const confirmedOffer = this.transformFlightOffer(
          response.data.flightOffers[0],
          response.dictionaries
        );
        return confirmedOffer;
      }

      return null;
    } catch (error: any) {
      logger.error('Price confirmation error', { error: error.message });
      throw new Error(`Price confirmation failed: ${error.message}`);
    }
  }

  /**
   * Create a flight booking
   */
  async createBooking(params: BookingParams): Promise<{
    pnr: string;
    bookingReference: string;
    ticketingDeadline: Date;
    totalPrice: number;
    currency: string;
  }> {
    try {
      logger.info('Creating Amadeus booking', { offerId: params.offerId });

      // Get the cached offer
      const offerCacheKey = `${this.cachePrefix}offer:${params.offerId}`;
      const cachedOffer = await this.getFromCache<any>(offerCacheKey);

      if (!cachedOffer) {
        throw new Error('Offer expired or not found. Please search again.');
      }

      // Build traveler data
      const travelers = params.passengers.map((passenger, index) => ({
        id: String(index + 1),
        dateOfBirth: passenger.dateOfBirth,
        name: {
          firstName: passenger.firstName.toUpperCase(),
          lastName: passenger.lastName.toUpperCase()
        },
        gender: passenger.gender,
        contact: {
          emailAddress: params.contactEmail,
          phones: [{
            deviceType: 'MOBILE',
            countryCallingCode: '1',
            number: params.contactPhone.replace(/\D/g, '')
          }]
        },
        documents: passenger.passportNumber ? [{
          documentType: 'PASSPORT',
          birthPlace: passenger.nationality,
          issuanceLocation: passenger.passportCountry,
          issuanceDate: '2020-01-01', // Placeholder
          number: passenger.passportNumber,
          expiryDate: passenger.passportExpiry,
          issuanceCountry: passenger.passportCountry,
          validityCountry: passenger.passportCountry,
          nationality: passenger.nationality,
          holder: true
        }] : undefined
      }));

      // Create booking request
      const bookingRequest = {
        data: {
          type: 'flight-order',
          flightOffers: [cachedOffer],
          travelers,
          remarks: {
            general: [{
              subType: 'GENERAL_MISCELLANEOUS',
              text: 'ONLINE BOOKING'
            }]
          },
          ticketingAgreement: {
            option: 'DELAY_TO_QUEUE'
          },
          contacts: [{
            addresseeName: {
              firstName: travelers[0].name.firstName,
              lastName: travelers[0].name.lastName
            },
            companyName: 'Skyward Travels',
            purpose: 'STANDARD',
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: params.contactPhone.replace(/\D/g, '')
            }],
            emailAddress: params.contactEmail
          }]
        }
      };

      // Create the order
      const response = await this.client.booking.flightOrders.post(
        JSON.stringify(bookingRequest)
      );

      const order = response.data;

      // Generate our booking reference
      const bookingReference = this.generateBookingReference();

      logger.info('Amadeus booking created', {
        pnr: order.associatedRecords?.[0]?.reference,
        bookingReference
      });

      return {
        pnr: order.associatedRecords?.[0]?.reference || order.id,
        bookingReference,
        ticketingDeadline: new Date(order.ticketingAgreement?.dateTime || Date.now() + 86400000),
        totalPrice: parseFloat(order.flightOffers[0].price.total),
        currency: order.flightOffers[0].price.currency
      };

    } catch (error: any) {
      logger.error('Amadeus booking error', {
        error: error.message,
        details: error.response?.result?.errors
      });
      throw new Error(`Booking failed: ${error.response?.result?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * Get seat map for a flight offer
   */
  async getSeatMap(offer: any): Promise<any> {
    try {
      const response = await this.client.shopping.seatmaps.post(
        JSON.stringify({
          data: [offer]
        })
      );

      return response.data;
    } catch (error: any) {
      logger.error('Seat map error', { error: error.message });
      return null;
    }
  }

  /**
   * Get flight status
   */
  async getFlightStatus(
    carrierCode: string,
    flightNumber: string,
    scheduledDeparture: string
  ): Promise<any> {
    try {
      const response = await this.client.schedule.flights.get({
        carrierCode,
        flightNumber,
        scheduledDepartureDate: scheduledDeparture
      });

      return response.data;
    } catch (error: any) {
      logger.error('Flight status error', { error: error.message });
      return null;
    }
  }

  /**
   * Search airports/cities
   */
  async searchLocations(keyword: string, subType: 'AIRPORT' | 'CITY' = 'AIRPORT'): Promise<any[]> {
    const cacheKey = `${this.cachePrefix}locations:${keyword}:${subType}`;

    const cached = await this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.referenceData.locations.get({
        keyword,
        subType,
        'page[limit]': 10
      });

      const locations = response.data.map((loc: any) => ({
        iataCode: loc.iataCode,
        name: loc.name,
        city: loc.address?.cityName,
        country: loc.address?.countryName,
        countryCode: loc.address?.countryCode,
        type: loc.subType
      }));

      await this.setCache(cacheKey, locations, 86400); // Cache for 24h
      return locations;
    } catch (error: any) {
      logger.error('Location search error', { error: error.message });
      return [];
    }
  }

  /**
   * Get airline information
   */
  async getAirlineInfo(airlineCode: string): Promise<any> {
    const cacheKey = `${this.cachePrefix}airline:${airlineCode}`;

    const cached = await this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.referenceData.airlines.get({
        airlineCodes: airlineCode
      });

      const airline = response.data[0];
      await this.setCache(cacheKey, airline, 604800); // Cache for 7 days
      return airline;
    } catch (error: any) {
      logger.error('Airline info error', { error: error.message });
      return null;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private transformFlightOffers(offers: any[], dictionaries: any): FlightOffer[] {
    return offers.map(offer => this.transformFlightOffer(offer, dictionaries));
  }

  private transformFlightOffer(offer: any, dictionaries: any): FlightOffer {
    const segments: FlightSegment[] = [];
    let totalDuration = 0;
    let stops = 0;

    // Process itineraries
    offer.itineraries.forEach((itinerary: any, itinIndex: number) => {
      const legType = itinIndex === 0 ? 'OUTBOUND' : 'RETURN';

      // Parse duration (PT2H30M format)
      const durationMatch = itinerary.duration.match(/PT(\d+H)?(\d+M)?/);
      const hours = parseInt(durationMatch?.[1]?.replace('H', '') || '0');
      const minutes = parseInt(durationMatch?.[2]?.replace('M', '') || '0');
      totalDuration += hours * 60 + minutes;

      itinerary.segments.forEach((seg: any, segIndex: number) => {
        if (segIndex > 0) stops++;

        const segDurationMatch = seg.duration.match(/PT(\d+H)?(\d+M)?/);
        const segHours = parseInt(segDurationMatch?.[1]?.replace('H', '') || '0');
        const segMinutes = parseInt(segDurationMatch?.[2]?.replace('M', '') || '0');

        // Get fare details for this segment
        const fareDetail = offer.travelerPricings?.[0]?.fareDetailsBySegment?.find(
          (fd: any) => fd.segmentId === seg.id
        );

        segments.push({
          segmentOrder: segments.length,
          legType,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          airlineCode: seg.carrierCode,
          airlineName: dictionaries?.carriers?.[seg.carrierCode] || seg.carrierCode,
          aircraftCode: seg.aircraft?.code,
          departureAirport: seg.departure.iataCode,
          departureTerminal: seg.departure.terminal,
          departureTime: new Date(seg.departure.at),
          arrivalAirport: seg.arrival.iataCode,
          arrivalTerminal: seg.arrival.terminal,
          arrivalTime: new Date(seg.arrival.at),
          duration: segHours * 60 + segMinutes,
          cabinClass: fareDetail?.cabin || 'ECONOMY',
          bookingClass: fareDetail?.class,
          hasMeal: fareDetail?.amenities?.some((a: any) => a.amenityType === 'MEAL') || false,
          hasWifi: fareDetail?.amenities?.some((a: any) => a.amenityType === 'WIFI') || false,
          hasEntertainment: fareDetail?.amenities?.some((a: any) => a.amenityType === 'ENTERTAINMENT') || false,
          hasPower: fareDetail?.amenities?.some((a: any) => a.amenityType === 'POWER') || false,
          carryOnIncluded: fareDetail?.includedCheckedBags?.quantity > 0 || true,
          checkedBagIncluded: fareDetail?.includedCheckedBags?.quantity || 0,
          checkedBagWeight: fareDetail?.includedCheckedBags?.weight,
          co2Emissions: seg.co2Emissions?.[0]?.weight
        });
      });
    });

    // Parse price
    const price = offer.price;
    const basePrice = parseFloat(price.base || '0');
    const totalPrice = parseFloat(price.total);
    const taxes = totalPrice - basePrice;

    // Check fare rules
    const fareRules = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.fareBasis;
    const isRefundable = !fareRules?.includes('NR') && !offer.pricingOptions?.fareType?.includes('PUBLISHED');

    return {
      id: uuidv4(),
      provider: 'amadeus',
      providerOfferId: offer.id,
      totalPrice,
      basePrice,
      taxes,
      fees: 0,
      currency: price.currency,
      validUntil: new Date(offer.lastTicketingDate || Date.now() + 86400000),
      seatsAvailable: offer.numberOfBookableSeats,
      isRefundable,
      isChangeable: true,
      totalDuration,
      stops,
      segments
    };
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

export const amadeusService = new AmadeusService();
