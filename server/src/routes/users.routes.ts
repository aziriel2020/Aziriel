/**
 * USERS ROUTES
 * User profile management, preferences, travel documents, saved items
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth.routes';

const router = Router();

// In-memory stores for demo (use database in production)
const userProfiles: Map<string, any> = new Map();
const travelDocuments: Map<string, any[]> = new Map();
const savedItems: Map<string, any[]> = new Map();
const priceAlerts: Map<string, any[]> = new Map();
const searchHistory: Map<string, any[]> = new Map();
const paymentMethods: Map<string, any[]> = new Map();
const companions: Map<string, any[]> = new Map();

/**
 * GET /api/users/profile
 * Get user profile with extended details
 */
router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    let profile = userProfiles.get(userId);

    if (!profile) {
      // Create default profile
      profile = {
        userId,
        preferences: {
          currency: 'USD',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: true,
            push: true,
            sms: false,
            priceAlerts: true,
            bookingUpdates: true,
            promotions: true,
            newsletter: false
          },
          travel: {
            seatPreference: 'window',
            mealPreference: 'no_preference',
            class: 'economy',
            specialAssistance: []
          }
        },
        stats: {
          totalTrips: 0,
          totalFlights: 0,
          totalHotelNights: 0,
          countriesVisited: 0,
          milesFlown: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      userProfiles.set(userId, profile);
    }

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
});

/**
 * PATCH /api/users/profile
 * Update user profile
 */
router.patch('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    let profile = userProfiles.get(userId) || { userId };

    const { firstName, lastName, phone, dateOfBirth, address, emergencyContact } = req.body;

    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (phone) profile.phone = phone;
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (address) profile.address = address;
    if (emergencyContact) profile.emergencyContact = emergencyContact;

    profile.updatedAt = new Date().toISOString();
    userProfiles.set(userId, profile);

    res.json({ message: 'Profile updated', profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get('/preferences', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const profile = userProfiles.get(userId);

    res.json({ preferences: profile?.preferences || {} });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get preferences', details: error.message });
  }
});

/**
 * PATCH /api/users/preferences
 * Update user preferences
 */
router.patch('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    let profile = userProfiles.get(userId) || { userId, preferences: {} };

    const { currency, language, dateFormat, notifications, travel } = req.body;

    if (currency) profile.preferences.currency = currency;
    if (language) profile.preferences.language = language;
    if (dateFormat) profile.preferences.dateFormat = dateFormat;
    if (notifications) {
      profile.preferences.notifications = {
        ...profile.preferences.notifications,
        ...notifications
      };
    }
    if (travel) {
      profile.preferences.travel = {
        ...profile.preferences.travel,
        ...travel
      };
    }

    profile.updatedAt = new Date().toISOString();
    userProfiles.set(userId, profile);

    res.json({ message: 'Preferences updated', preferences: profile.preferences });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update preferences', details: error.message });
  }
});

/**
 * GET /api/users/documents
 * Get travel documents (passports, visas, etc.)
 */
router.get('/documents', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const documents = travelDocuments.get(userId) || [];

    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get documents', details: error.message });
  }
});

/**
 * POST /api/users/documents
 * Add a travel document
 */
router.post('/documents', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, number, country, issueDate, expiryDate, firstName, lastName } = req.body;

    if (!type || !number || !country || !expiryDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'number', 'country', 'expiryDate']
      });
    }

    const document = {
      id: uuidv4(),
      type, // passport, visa, id_card, driver_license
      number,
      country,
      issueDate: issueDate || null,
      expiryDate,
      firstName: firstName || null,
      lastName: lastName || null,
      verified: false,
      createdAt: new Date().toISOString()
    };

    const documents = travelDocuments.get(userId) || [];
    documents.push(document);
    travelDocuments.set(userId, documents);

    res.status(201).json({ message: 'Document added', document });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add document', details: error.message });
  }
});

/**
 * DELETE /api/users/documents/:id
 * Remove a travel document
 */
router.delete('/documents/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    let documents = travelDocuments.get(userId) || [];
    const documentIndex = documents.findIndex(d => d.id === id);

    if (documentIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    documents.splice(documentIndex, 1);
    travelDocuments.set(userId, documents);

    res.json({ message: 'Document removed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove document', details: error.message });
  }
});

/**
 * GET /api/users/saved
 * Get saved items (flights, hotels, destinations)
 */
router.get('/saved', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type } = req.query;

    let items = savedItems.get(userId) || [];

    if (type && typeof type === 'string') {
      items = items.filter(i => i.type === type);
    }

    res.json({ savedItems: items });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get saved items', details: error.message });
  }
});

/**
 * POST /api/users/saved
 * Save an item (flight, hotel, destination)
 */
router.post('/saved', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, itemId, data } = req.body;

    if (!type || !itemId) {
      return res.status(400).json({ error: 'Type and itemId are required' });
    }

    const items = savedItems.get(userId) || [];

    // Check if already saved
    const existing = items.find(i => i.type === type && i.itemId === itemId);
    if (existing) {
      return res.status(400).json({ error: 'Item already saved' });
    }

    const savedItem = {
      id: uuidv4(),
      type, // flight, hotel, destination, search
      itemId,
      data: data || {},
      savedAt: new Date().toISOString()
    };

    items.push(savedItem);
    savedItems.set(userId, items);

    res.status(201).json({ message: 'Item saved', savedItem });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save item', details: error.message });
  }
});

/**
 * DELETE /api/users/saved/:id
 * Remove a saved item
 */
router.delete('/saved/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    let items = savedItems.get(userId) || [];
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    items.splice(itemIndex, 1);
    savedItems.set(userId, items);

    res.json({ message: 'Item removed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove item', details: error.message });
  }
});

/**
 * GET /api/users/alerts
 * Get price alerts
 */
router.get('/alerts', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { active } = req.query;

    let alerts = priceAlerts.get(userId) || [];

    if (active === 'true') {
      alerts = alerts.filter(a => a.active);
    }

    res.json({ alerts });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get alerts', details: error.message });
  }
});

/**
 * POST /api/users/alerts
 * Create a price alert
 */
router.post('/alerts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, origin, destination, dates, targetPrice, hotelId, hotelName, checkIn, checkOut } = req.body;

    if (!type || !targetPrice) {
      return res.status(400).json({ error: 'Type and target price are required' });
    }

    const alert = {
      id: uuidv4(),
      type, // flight, hotel
      active: true,
      origin: origin || null,
      destination: destination || null,
      dates: dates || null,
      hotelId: hotelId || null,
      hotelName: hotelName || null,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      targetPrice,
      currentPrice: null,
      lowestPrice: null,
      priceHistory: [],
      triggered: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    };

    const alerts = priceAlerts.get(userId) || [];
    alerts.push(alert);
    priceAlerts.set(userId, alerts);

    res.status(201).json({ message: 'Alert created', alert });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create alert', details: error.message });
  }
});

/**
 * PATCH /api/users/alerts/:id
 * Update a price alert
 */
router.patch('/alerts/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { active, targetPrice } = req.body;

    const alerts = priceAlerts.get(userId) || [];
    const alert = alerts.find(a => a.id === id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (active !== undefined) alert.active = active;
    if (targetPrice !== undefined) alert.targetPrice = targetPrice;

    priceAlerts.set(userId, alerts);

    res.json({ message: 'Alert updated', alert });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update alert', details: error.message });
  }
});

/**
 * DELETE /api/users/alerts/:id
 * Delete a price alert
 */
router.delete('/alerts/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    let alerts = priceAlerts.get(userId) || [];
    const alertIndex = alerts.findIndex(a => a.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alerts.splice(alertIndex, 1);
    priceAlerts.set(userId, alerts);

    res.json({ message: 'Alert deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete alert', details: error.message });
  }
});

/**
 * GET /api/users/history
 * Get search history
 */
router.get('/history', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { limit = 20 } = req.query;

    const history = searchHistory.get(userId) || [];

    // Sort by date and limit
    const recentHistory = history
      .sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime())
      .slice(0, Number(limit));

    res.json({ history: recentHistory });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get history', details: error.message });
  }
});

/**
 * POST /api/users/history
 * Add to search history
 */
router.post('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, searchParams } = req.body;

    const historyEntry = {
      id: uuidv4(),
      type, // flight, hotel, package
      searchParams,
      searchedAt: new Date().toISOString()
    };

    const history = searchHistory.get(userId) || [];
    history.push(historyEntry);

    // Keep only last 100 searches
    if (history.length > 100) {
      history.shift();
    }

    searchHistory.set(userId, history);

    res.status(201).json({ message: 'History recorded' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record history', details: error.message });
  }
});

/**
 * DELETE /api/users/history
 * Clear search history
 */
router.delete('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    searchHistory.set(userId, []);

    res.json({ message: 'History cleared' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clear history', details: error.message });
  }
});

/**
 * GET /api/users/payment-methods
 * Get saved payment methods
 */
router.get('/payment-methods', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const methods = paymentMethods.get(userId) || [];

    // Mask card numbers
    const maskedMethods = methods.map(m => ({
      ...m,
      cardNumber: m.cardNumber ? `****${m.cardNumber.slice(-4)}` : null
    }));

    res.json({ paymentMethods: maskedMethods });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get payment methods', details: error.message });
  }
});

/**
 * POST /api/users/payment-methods
 * Add a payment method
 */
router.post('/payment-methods', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, cardNumber, expiryMonth, expiryYear, cardholderName, isDefault } = req.body;

    if (!type || !cardNumber || !expiryMonth || !expiryYear || !cardholderName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Detect card brand
    let brand = 'unknown';
    if (cardNumber.startsWith('4')) brand = 'visa';
    else if (cardNumber.startsWith('5')) brand = 'mastercard';
    else if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) brand = 'amex';
    else if (cardNumber.startsWith('6')) brand = 'discover';

    const paymentMethod = {
      id: uuidv4(),
      type, // card, paypal, apple_pay, google_pay
      brand,
      cardNumber, // In production, tokenize this
      expiryMonth,
      expiryYear,
      cardholderName,
      isDefault: isDefault || false,
      createdAt: new Date().toISOString()
    };

    const methods = paymentMethods.get(userId) || [];

    // If this is default, unset other defaults
    if (paymentMethod.isDefault) {
      methods.forEach(m => m.isDefault = false);
    }

    methods.push(paymentMethod);
    paymentMethods.set(userId, methods);

    res.status(201).json({
      message: 'Payment method added',
      paymentMethod: {
        ...paymentMethod,
        cardNumber: `****${cardNumber.slice(-4)}`
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add payment method', details: error.message });
  }
});

/**
 * DELETE /api/users/payment-methods/:id
 * Remove a payment method
 */
router.delete('/payment-methods/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    let methods = paymentMethods.get(userId) || [];
    const methodIndex = methods.findIndex(m => m.id === id);

    if (methodIndex === -1) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    methods.splice(methodIndex, 1);
    paymentMethods.set(userId, methods);

    res.json({ message: 'Payment method removed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove payment method', details: error.message });
  }
});

/**
 * GET /api/users/companions
 * Get travel companions (saved travelers)
 */
router.get('/companions', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const userCompanions = companions.get(userId) || [];

    res.json({ companions: userCompanions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get companions', details: error.message });
  }
});

/**
 * POST /api/users/companions
 * Add a travel companion
 */
router.post('/companions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      passportNumber,
      passportExpiry,
      passportCountry,
      nationality,
      relationship
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'dateOfBirth']
      });
    }

    const companion = {
      id: uuidv4(),
      firstName,
      lastName,
      dateOfBirth,
      gender: gender || null,
      email: email || null,
      phone: phone || null,
      passportNumber: passportNumber || null,
      passportExpiry: passportExpiry || null,
      passportCountry: passportCountry || null,
      nationality: nationality || null,
      relationship: relationship || 'other', // family, friend, colleague, other
      createdAt: new Date().toISOString()
    };

    const userCompanions = companions.get(userId) || [];
    userCompanions.push(companion);
    companions.set(userId, userCompanions);

    res.status(201).json({ message: 'Companion added', companion });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add companion', details: error.message });
  }
});

/**
 * PATCH /api/users/companions/:id
 * Update a travel companion
 */
router.patch('/companions/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const userCompanions = companions.get(userId) || [];
    const companion = userCompanions.find(c => c.id === id);

    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone',
      'passportNumber', 'passportExpiry', 'passportCountry', 'nationality', 'relationship'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        companion[field] = req.body[field];
      }
    });

    companions.set(userId, userCompanions);

    res.json({ message: 'Companion updated', companion });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update companion', details: error.message });
  }
});

/**
 * DELETE /api/users/companions/:id
 * Remove a travel companion
 */
router.delete('/companions/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    let userCompanions = companions.get(userId) || [];
    const companionIndex = userCompanions.findIndex(c => c.id === id);

    if (companionIndex === -1) {
      return res.status(404).json({ error: 'Companion not found' });
    }

    userCompanions.splice(companionIndex, 1);
    companions.set(userId, userCompanions);

    res.json({ message: 'Companion removed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove companion', details: error.message });
  }
});

/**
 * GET /api/users/stats
 * Get user travel statistics
 */
router.get('/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const profile = userProfiles.get(userId);

    // In production, calculate from actual booking data
    const stats = profile?.stats || {
      totalTrips: 0,
      totalFlights: 0,
      totalHotelNights: 0,
      countriesVisited: 0,
      citiesVisited: 0,
      milesFlown: 0,
      carbonOffset: 0,
      totalSpent: 0,
      savedAmount: 0
    };

    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    // In production:
    // 1. Verify password
    // 2. Cancel any active bookings
    // 3. Notify user via email
    // 4. Schedule data deletion (GDPR compliance)
    // 5. Mark account for deletion

    // Clear all user data
    userProfiles.delete(userId);
    travelDocuments.delete(userId);
    savedItems.delete(userId);
    priceAlerts.delete(userId);
    searchHistory.delete(userId);
    paymentMethods.delete(userId);
    companions.delete(userId);

    res.json({
      message: 'Account deletion initiated',
      note: 'Your data will be permanently deleted within 30 days as per GDPR requirements'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
});

export default router;
