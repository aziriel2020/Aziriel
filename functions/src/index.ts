/**
 * SKYWARD TRAVELS - FIREBASE CLOUD FUNCTIONS
 * Complete API for Hotel + Flight Booking Platform
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Skyward Travels API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// FLIGHT API ROUTES
// ============================================
app.post('/api/flights/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, cabinClass } = req.body;

    // Validate input
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // In production, call Amadeus/Duffel APIs
    // For demo, return mock data
    const searchId = `FSR_${Date.now()}`;

    // Store search in Firestore
    await admin.firestore().collection('flightSearches').doc(searchId).set({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: adults || 1,
      cabinClass: cabinClass || 'ECONOMY',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });

    res.json({
      searchId,
      offers: generateMockFlightOffers(origin, destination, departureDate),
      metadata: {
        searchTime: new Date().toISOString(),
        totalResults: 5,
        providers: ['amadeus', 'duffel']
      }
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    res.status(500).json({ error: 'Flight search failed', message: error.message });
  }
});

app.post('/api/flights/book', async (req, res) => {
  try {
    const { offerId, passengers, contact, ancillaries } = req.body;

    const bookingRef = `SKY${generateBookingRef()}`;

    // Create booking in Firestore
    await admin.firestore().collection('bookings').doc(bookingRef).set({
      type: 'flight',
      reference: bookingRef,
      offerId,
      passengers,
      contact,
      ancillaries: ancillaries || [],
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      bookingReference: bookingRef,
      status: 'confirmed',
      message: 'Flight booked successfully'
    });
  } catch (error: any) {
    console.error('Flight booking error:', error);
    res.status(500).json({ error: 'Booking failed', message: error.message });
  }
});

app.get('/api/flights/offer/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;

    // Return mock offer details
    res.json({
      offer: {
        id: offerId,
        airline: 'Air France',
        flightNumber: 'AF007',
        price: 589,
        taxes: 100,
        currency: 'USD'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch offer' });
  }
});

// ============================================
// HOTEL API ROUTES
// ============================================
app.post('/api/hotels/search', async (req, res) => {
  try {
    const { destination, checkIn, checkOut, rooms, adults } = req.body;

    if (!destination || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const searchId = `HSR_${Date.now()}`;

    await admin.firestore().collection('hotelSearches').doc(searchId).set({
      destination,
      checkIn,
      checkOut,
      rooms: rooms || 1,
      adults: adults || 2,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });

    res.json({
      searchId,
      hotels: generateMockHotels(destination),
      metadata: {
        searchTime: new Date().toISOString(),
        totalResults: 5,
        provider: 'hotelbeds'
      }
    });
  } catch (error: any) {
    console.error('Hotel search error:', error);
    res.status(500).json({ error: 'Hotel search failed', message: error.message });
  }
});

app.post('/api/hotels/book', async (req, res) => {
  try {
    const { hotelCode, checkIn, checkOut, rooms, guests, arrivalTime, specialRequests } = req.body;

    const bookingRef = `HTL${generateBookingRef()}`;

    await admin.firestore().collection('bookings').doc(bookingRef).set({
      type: 'hotel',
      reference: bookingRef,
      hotelCode,
      checkIn,
      checkOut,
      rooms,
      guests,
      arrivalTime,
      specialRequests: specialRequests || [],
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      bookingReference: bookingRef,
      status: 'confirmed',
      message: 'Hotel booked successfully'
    });
  } catch (error: any) {
    console.error('Hotel booking error:', error);
    res.status(500).json({ error: 'Booking failed', message: error.message });
  }
});

app.get('/api/hotels/:hotelCode', async (req, res) => {
  try {
    const { hotelCode } = req.params;

    res.json({
      hotel: {
        code: hotelCode,
        name: 'Le Grand Paris Marriott',
        stars: 5,
        rating: 9.2,
        address: '15 Avenue Montaigne, Paris'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

// ============================================
// AI ASSISTANT ROUTES
// ============================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    // In production, call OpenAI/Anthropic
    const response = generateAIResponse(message);

    // Store conversation
    const convRef = conversationId || `CONV_${Date.now()}`;
    await admin.firestore()
      .collection('aiConversations')
      .doc(convRef)
      .collection('messages')
      .add({
        role: 'user',
        content: message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    await admin.firestore()
      .collection('aiConversations')
      .doc(convRef)
      .collection('messages')
      .add({
        role: 'assistant',
        content: response,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      conversationId: convRef,
      response,
      suggestions: ['Search flights', 'Find hotels', 'View deals']
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

app.post('/api/ai/search', async (req, res) => {
  try {
    const { query } = req.body;

    // Parse natural language query
    const parsed = parseNaturalLanguageQuery(query);

    res.json({
      interpreted: parsed,
      suggestions: [
        `Flight from ${parsed.origin || 'New York'} to ${parsed.destination || 'Paris'}`,
        `Hotels in ${parsed.destination || 'Paris'}`
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'AI search failed' });
  }
});

// ============================================
// PAYMENT ROUTES
// ============================================
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency, type } = req.body;

    // In production, create Stripe payment intent
    const intentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      clientSecret: `${intentId}_secret_demo`,
      intentId,
      amount,
      currency: currency || 'USD'
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  try {
    // Handle Stripe webhooks
    const event = req.body;

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, joinLoyalty } = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      firstName,
      lastName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'USER'
    });

    // Create loyalty account if opted in
    if (joinLoyalty) {
      await admin.firestore().collection('loyaltyAccounts').doc(userRecord.uid).set({
        userId: userRecord.uid,
        tier: 'bronze',
        points: 5000, // Welcome bonus
        lifetimePoints: 5000,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      userId: userRecord.uid,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;

    // In production, verify credentials and create session token
    // For Firebase, authentication is handled client-side

    res.json({
      success: true,
      requires2FA: false,
      message: 'Use Firebase client SDK for authentication'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// LOYALTY ROUTES
// ============================================
app.get('/api/loyalty/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const doc = await admin.firestore().collection('loyaltyAccounts').doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    res.json({ loyalty: doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch loyalty info' });
  }
});

// ============================================
// BOOKINGS ROUTES
// ============================================
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await admin.firestore()
      .collection('bookings')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ bookings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function generateBookingRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateMockFlightOffers(origin: string, destination: string, date: string) {
  return [
    {
      id: 'FL001',
      provider: 'amadeus',
      price: 589,
      currency: 'USD',
      airline: 'Air France',
      flightNumber: 'AF007',
      departure: { airport: origin, time: '09:00', date },
      arrival: { airport: destination, time: '22:30', date },
      duration: '7h 30m',
      stops: 0,
      baggageIncluded: true,
      refundable: false
    },
    {
      id: 'FL002',
      provider: 'duffel',
      price: 649,
      currency: 'USD',
      airline: 'Delta',
      flightNumber: 'DL264',
      departure: { airport: origin, time: '14:30', date },
      arrival: { airport: destination, time: '04:00', date },
      duration: '7h 30m',
      stops: 0,
      baggageIncluded: true,
      refundable: true
    }
  ];
}

function generateMockHotels(destination: string) {
  return [
    {
      id: 'HTL001',
      hotelCode: 'PARMRT001',
      name: 'Le Grand Paris Marriott',
      stars: 5,
      rating: 9.2,
      reviewCount: 2847,
      lowestPrice: 389,
      currency: 'USD',
      address: '15 Avenue Montaigne',
      city: destination,
      amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant']
    },
    {
      id: 'HTL002',
      hotelCode: 'PARHLT002',
      name: 'Hotel Le Marais Boutique',
      stars: 4,
      rating: 8.8,
      reviewCount: 1523,
      lowestPrice: 159,
      currency: 'USD',
      address: '28 Rue des Rosiers',
      city: destination,
      amenities: ['wifi', 'breakfast', 'petFriendly']
    }
  ];
}

function generateAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('flight') || lower.includes('fly')) {
    return "I'd be happy to help you find flights! Could you tell me your departure city, destination, and travel dates?";
  }

  if (lower.includes('hotel') || lower.includes('stay')) {
    return "Let me help you find the perfect hotel! What city are you visiting and what are your check-in dates?";
  }

  if (lower.includes('deal') || lower.includes('discount')) {
    return "We have some great deals right now! Check out 30% off Paris hotels and $200 off Caribbean flights. Want me to show you more?";
  }

  return "Hi! I'm your Skyward travel assistant. I can help you search for flights, hotels, or vacation packages. What would you like to explore today?";
}

function parseNaturalLanguageQuery(query: string) {
  const lower = query.toLowerCase();

  const destinations = ['paris', 'london', 'tokyo', 'new york', 'dubai', 'rome', 'barcelona'];
  const origins = ['new york', 'los angeles', 'chicago', 'miami', 'san francisco'];

  let destination = null;
  let origin = null;

  for (const dest of destinations) {
    if (lower.includes(dest)) {
      destination = dest;
      break;
    }
  }

  for (const orig of origins) {
    if (lower.includes(orig) && orig !== destination) {
      origin = orig;
      break;
    }
  }

  return {
    intent: lower.includes('flight') ? 'flight_search' : 'hotel_search',
    origin: origin || 'New York',
    destination: destination || 'Paris',
    dates: null
  };
}

// ============================================
// SCHEDULED FUNCTIONS
// ============================================

// Clean up expired searches every hour
export const cleanupExpiredSearches = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const flightSearches = await admin.firestore()
      .collection('flightSearches')
      .where('createdAt', '<', cutoff)
      .get();

    const hotelSearches = await admin.firestore()
      .collection('hotelSearches')
      .where('createdAt', '<', cutoff)
      .get();

    const batch = admin.firestore().batch();

    flightSearches.docs.forEach(doc => batch.delete(doc.ref));
    hotelSearches.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();

    console.log(`Cleaned up ${flightSearches.size + hotelSearches.size} expired searches`);
  });

// Send booking reminders daily
export const sendBookingReminders = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('America/New_York')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find bookings for tomorrow
    const bookings = await admin.firestore()
      .collection('bookings')
      .where('departureDate', '==', tomorrowStr)
      .where('status', '==', 'confirmed')
      .get();

    console.log(`Found ${bookings.size} bookings for tomorrow`);

    // In production, send notification/email to each user
  });

// ============================================
// EXPORT FUNCTIONS
// ============================================
export const api = functions.https.onRequest(app);

// Firebase Auth triggers
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log('New user created:', user.uid);

  // Create user profile if doesn't exist
  const userDoc = admin.firestore().collection('users').doc(user.uid);
  const doc = await userDoc.get();

  if (!doc.exists) {
    await userDoc.set({
      email: user.email,
      displayName: user.displayName || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'USER'
    });
  }
});

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  console.log('User deleted:', user.uid);

  // Clean up user data
  const batch = admin.firestore().batch();

  batch.delete(admin.firestore().collection('users').doc(user.uid));
  batch.delete(admin.firestore().collection('loyaltyAccounts').doc(user.uid));

  await batch.commit();
});
