/**
 * API ROUTES INDEX
 * Aggregates all route modules
 */

import { Router } from 'express';
import flightRoutes from './flights.routes';
import hotelRoutes from './hotels.routes';
import aiRoutes from './ai.routes';
import paymentRoutes from './payments.routes';

const router = Router();

// API Routes
router.use('/flights', flightRoutes);
router.use('/hotels', hotelRoutes);
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
