/**
 * SKYWARD TRAVELS - API CLIENT
 * Complete API service for flights, hotels, bookings, and payments
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES
// ============================================================================

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  directOnly?: boolean;
  maxStops?: number;
  maxPrice?: number;
  airlines?: string[];
}

export interface FlightOffer {
  id: string;
  provider: 'amadeus' | 'duffel';
  price: {
    amount: number;
    currency: string;
  };
  outbound: FlightSegment[];
  inbound?: FlightSegment[];
  totalDuration: number;
  stops: number;
  cabinClass: string;
  seatsAvailable: number;
  baggage: {
    cabin: string;
    checked: string;
  };
  refundable: boolean;
  changeable: boolean;
}

export interface FlightSegment {
  departure: {
    airport: string;
    terminal?: string;
    time: string;
  };
  arrival: {
    airport: string;
    terminal?: string;
    time: string;
  };
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  flightNumber: string;
  duration: number;
  aircraft?: string;
}

export interface HotelSearchRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: {
    adults: number;
    children?: number[];
  };
  starRating?: number[];
  amenities?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
}

export interface HotelOffer {
  id: string;
  code: string;
  name: string;
  starRating: number;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  amenities: string[];
  rooms: RoomOffer[];
  reviewScore: number;
  reviewCount: number;
  distance?: string;
}

export interface RoomOffer {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    perNight: number;
  };
  capacity: {
    adults: number;
    children: number;
  };
  beds: string;
  amenities: string[];
  cancellation: {
    free: boolean;
    deadline?: string;
  };
  breakfast: boolean;
  images: string[];
}

export interface BookingRequest {
  type: 'flight' | 'hotel';
  offerId: string;
  passengers?: PassengerInfo[];
  guests?: GuestInfo[];
  contact: ContactInfo;
  payment: {
    method: 'card' | 'paypal';
    paymentIntentId?: string;
  };
  extras?: string[];
  specialRequests?: string;
}

export interface PassengerInfo {
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export interface Booking {
  id: string;
  type: 'flight' | 'hotel';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmationNumber: string;
  totalPrice: {
    amount: number;
    currency: string;
  };
  createdAt: string;
  details: FlightOffer | HotelOffer;
  passengers?: PassengerInfo[];
  guests?: GuestInfo[];
  contact: ContactInfo;
}

export interface LoyaltyAccount {
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'ambassador';
  points: number;
  lifetimePoints: number;
  tierProgress: number;
  nextTierPoints: number;
  benefits: string[];
  transactions: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'bonus' | 'expire';
  points: number;
  description: string;
  date: string;
  bookingId?: string;
}

// ============================================================================
// FLIGHT API
// ============================================================================

export const flightApi = {
  search: async (params: FlightSearchRequest): Promise<{ data: FlightOffer[] }> => {
    const response = await apiClient.post('/flights/search', params);
    return response.data;
  },

  getOffer: async (offerId: string): Promise<{ data: FlightOffer }> => {
    const response = await apiClient.get(`/flights/offer/${offerId}`);
    return response.data;
  },

  book: async (data: BookingRequest): Promise<{ data: Booking }> => {
    const response = await apiClient.post('/flights/book', data);
    return response.data;
  },

  getBookings: async (userId: string): Promise<{ data: Booking[] }> => {
    const response = await apiClient.get(`/flights/bookings/${userId}`);
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/flights/bookings/${bookingId}/cancel`);
    return response.data;
  },

  getAirports: async (query: string): Promise<{ data: any[] }> => {
    const response = await apiClient.get('/flights/airports', { params: { q: query } });
    return response.data;
  },

  getPriceAlerts: async (userId: string): Promise<{ data: any[] }> => {
    const response = await apiClient.get(`/flights/price-alerts/${userId}`);
    return response.data;
  },

  createPriceAlert: async (data: any): Promise<{ data: any }> => {
    const response = await apiClient.post('/flights/price-alerts', data);
    return response.data;
  }
};

// ============================================================================
// HOTEL API
// ============================================================================

export const hotelApi = {
  search: async (params: HotelSearchRequest): Promise<{ data: HotelOffer[] }> => {
    const response = await apiClient.post('/hotels/search', params);
    return response.data;
  },

  getDetails: async (hotelCode: string): Promise<{ data: HotelOffer }> => {
    const response = await apiClient.get(`/hotels/${hotelCode}`);
    return response.data;
  },

  getRooms: async (hotelCode: string, checkIn: string, checkOut: string): Promise<{ data: RoomOffer[] }> => {
    const response = await apiClient.get(`/hotels/${hotelCode}/rooms`, {
      params: { checkIn, checkOut }
    });
    return response.data;
  },

  book: async (data: BookingRequest): Promise<{ data: Booking }> => {
    const response = await apiClient.post('/hotels/book', data);
    return response.data;
  },

  getBookings: async (userId: string): Promise<{ data: Booking[] }> => {
    const response = await apiClient.get(`/hotels/bookings/${userId}`);
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/hotels/bookings/${bookingId}/cancel`);
    return response.data;
  },

  getDestinations: async (query: string): Promise<{ data: any[] }> => {
    const response = await apiClient.get('/hotels/destinations', { params: { q: query } });
    return response.data;
  }
};

// ============================================================================
// AI API
// ============================================================================

export const aiApi = {
  chat: async (message: string, history?: { role: string; content: string }[]): Promise<{
    response: string;
    suggestions?: any[];
  }> => {
    const response = await apiClient.post('/ai/chat', { message, history });
    return response.data;
  },

  search: async (query: string): Promise<{
    flights?: FlightOffer[];
    hotels?: HotelOffer[];
    recommendations?: any[];
  }> => {
    const response = await apiClient.post('/ai/search', { query });
    return response.data;
  },

  generateItinerary: async (params: {
    destination: string;
    duration: number;
    interests?: string[];
    budget?: string;
  }): Promise<{ itinerary: any }> => {
    const response = await apiClient.post('/ai/itinerary', params);
    return response.data;
  },

  getRecommendations: async (userId: string): Promise<{ recommendations: any[] }> => {
    const response = await apiClient.get(`/ai/recommendations/${userId}`);
    return response.data;
  }
};

// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentApi = {
  createPaymentIntent: async (data: {
    amount: number;
    currency: string;
    bookingType: 'flight' | 'hotel';
    metadata?: any;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> => {
    const response = await apiClient.post('/payments/create-intent', data);
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/payments/confirm', { paymentIntentId });
    return response.data;
  },

  getPaymentHistory: async (userId: string): Promise<{ payments: any[] }> => {
    const response = await apiClient.get(`/payments/history/${userId}`);
    return response.data;
  },

  refund: async (paymentId: string, amount?: number): Promise<{ success: boolean; refundId: string }> => {
    const response = await apiClient.post(`/payments/${paymentId}/refund`, { amount });
    return response.data;
  }
};

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  login: async (email: string, password: string): Promise<{
    user: any;
    token: string;
  }> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    loyaltyEnroll?: boolean;
  }): Promise<{ user: any; token: string }> => {
    const response = await apiClient.post('/auth/register', data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  },

  getProfile: async (): Promise<{ user: any }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: any): Promise<{ user: any }> => {
    const response = await apiClient.patch('/auth/profile', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  }
};

// ============================================================================
// LOYALTY API
// ============================================================================

export const loyaltyApi = {
  getAccount: async (userId: string): Promise<{ account: LoyaltyAccount }> => {
    const response = await apiClient.get(`/loyalty/${userId}`);
    return response.data;
  },

  getTransactions: async (userId: string, params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: LoyaltyTransaction[]; total: number }> => {
    const response = await apiClient.get(`/loyalty/${userId}/transactions`, { params });
    return response.data;
  },

  redeemPoints: async (userId: string, data: {
    points: number;
    rewardType: string;
    bookingId?: string;
  }): Promise<{ success: boolean; newBalance: number }> => {
    const response = await apiClient.post(`/loyalty/${userId}/redeem`, data);
    return response.data;
  },

  getRewards: async (): Promise<{ rewards: any[] }> => {
    const response = await apiClient.get('/loyalty/rewards');
    return response.data;
  }
};

// ============================================================================
// BOOKING API (Combined)
// ============================================================================

export const bookingApi = {
  getAll: async (userId: string): Promise<{ bookings: Booking[] }> => {
    const response = await apiClient.get(`/bookings/${userId}`);
    return response.data;
  },

  getById: async (bookingId: string): Promise<{ booking: Booking }> => {
    const response = await apiClient.get(`/bookings/detail/${bookingId}`);
    return response.data;
  },

  cancel: async (bookingId: string): Promise<{ success: boolean; refundAmount?: number }> => {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  addToWishlist: async (data: any): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/bookings/wishlist', data);
    return response.data;
  },

  getWishlist: async (userId: string): Promise<{ items: any[] }> => {
    const response = await apiClient.get(`/bookings/wishlist/${userId}`);
    return response.data;
  }
};

// ============================================================================
// UTILITY API
// ============================================================================

export const utilityApi = {
  getCurrencies: async (): Promise<{ currencies: any[] }> => {
    const response = await apiClient.get('/utils/currencies');
    return response.data;
  },

  convertCurrency: async (from: string, to: string, amount: number): Promise<{ converted: number; rate: number }> => {
    const response = await apiClient.get('/utils/convert', { params: { from, to, amount } });
    return response.data;
  },

  getCountries: async (): Promise<{ countries: any[] }> => {
    const response = await apiClient.get('/utils/countries');
    return response.data;
  }
};

export default apiClient;
