/**
 * SKYWARD TRAVELS - MAIN SERVER
 *
 * Complete production server with:
 * - Express REST API for flights, hotels, AI
 * - Stripe payment processing
 * - WebSocket for real-time updates
 * - Security middleware
 * - Error handling
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Routes
import apiRoutes from './src/routes';

// Load environment variables
config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'skyward-travels-api',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Liveness probe (Kubernetes)
app.get('/health/live', (req: Request, res: Response) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness probe (Kubernetes)
app.get('/health/ready', (req: Request, res: Response) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// API Documentation
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Skyward Travels API',
    version: '1.0.0',
    description: 'Hotel + Flight booking platform API',
    endpoints: {
      health: '/health',
      flights: {
        search: 'POST /api/flights/search',
        book: 'POST /api/flights/book',
        getOffer: 'GET /api/flights/offer/:offerId',
        bookings: 'GET /api/flights/bookings/:userId'
      },
      hotels: {
        search: 'POST /api/hotels/search',
        book: 'POST /api/hotels/book',
        details: 'GET /api/hotels/:hotelCode',
        bookings: 'GET /api/hotels/bookings/:userId'
      },
      ai: {
        chat: 'POST /api/ai/chat',
        search: 'POST /api/ai/search',
        itinerary: 'POST /api/ai/itinerary'
      },
      payments: {
        createIntent: 'POST /api/payments/create-intent',
        webhook: 'POST /api/payments/webhook',
        history: 'GET /api/payments/history/:userId'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile'
      },
      loyalty: {
        account: 'GET /api/loyalty/:userId',
        transactions: 'GET /api/loyalty/:userId/transactions',
        redeem: 'POST /api/loyalty/:userId/redeem'
      }
    },
    documentation: '/api/docs'
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// START SERVER
// ============================================================================

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ✈️  SKYWARD TRAVELS API SERVER  ✈️             ║
║                                                               ║
║  Hotel + Flight Booking Platform                              ║
║  Powered by Amadeus, Duffel, Hotelbeds                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server Status:
   → Environment: ${process.env.NODE_ENV || 'development'}
   → Port: ${PORT}
   → HTTP: http://localhost:${PORT}
   → Health: http://localhost:${PORT}/health
   → API: http://localhost:${PORT}/api

🎯 API Endpoints:
   ✅ Flights - Search, Book, Manage
   ✅ Hotels - Search, Book, Details
   ✅ AI Assistant - Travel recommendations
   ✅ Payments - Stripe integration
   ✅ Auth - User management
   ✅ Loyalty - Points & rewards

🔌 Integrations:
   → Amadeus GDS: ${process.env.AMADEUS_CLIENT_ID ? 'Configured' : 'Not configured'}
   → Duffel API: ${process.env.DUFFEL_ACCESS_TOKEN ? 'Configured' : 'Not configured'}
   → Hotelbeds: ${process.env.HOTELBEDS_API_KEY ? 'Configured' : 'Not configured'}
   → Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}
   → OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}

📚 API Documentation: http://localhost:${PORT}/api

Ready for takeoff! ✈️
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
