/**
 * API ROUTES INDEX
 * Aggregates all route modules for Skyward Travels
 */

import { Router } from 'express';
import flightRoutes from './flights.routes';
import hotelRoutes from './hotels.routes';
import aiRoutes from './ai.routes';
import paymentRoutes from './payments.routes';
import authRoutes from './auth.routes';
import bookingRoutes from './bookings.routes';
import loyaltyRoutes from './loyalty.routes';
import userRoutes from './users.routes';

const router = Router();

// Authentication Routes
router.use('/auth', authRoutes);

// Core API Routes
router.use('/flights', flightRoutes);
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);

// User & Loyalty Routes
router.use('/users', userRoutes);
router.use('/loyalty', loyaltyRoutes);

// AI & Payments
router.use('/ai', aiRoutes);
router.use('/payments', paymentRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'skyward-travels-api',
    version: '1.0.0'
  });
});

export default router;
