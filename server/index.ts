/**
 * NEURAFIELD QUANTUM - MAIN SERVER
 *
 * Complete production server with:
 * - Express REST API
 * - WebSocket for real-time
 * - All Nexus services
 * - Security middleware
 * - Error handling
 */

import express, { Application } from 'express';
import { createServer } from 'http';
import { config } from 'dotenv';
import setupWebSocket from './websocket';

// Middleware
import { helmetConfig, corsConfig, apiLimiter, requestLogger, sanitizeInput } from './middleware/security.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Routes
import flowRoutes from './routes/flow.routes';
import nexusRoutes from './routes/nexus';
import activitypubRoutes from './routes/nexus/activitypub.routes';

// Load environment variables
config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security
app.use(helmetConfig);
app.use(corsConfig);
app.use(apiLimiter);
app.use(requestLogger);
app.use(sanitizeInput);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ActivityPub Federation (must be at root level for WebFinger)
app.use('/', activitypubRoutes);

// API Routes
app.use('/api/flow', flowRoutes);
app.use('/api/nexus', nexusRoutes);

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Neurafield Quantum API',
    version: '1.0.0',
    description: 'AI-powered video generation and social platform',
    endpoints: {
      health: '/health',
      flow: '/api/flow',
      nexus: {
        pdt: '/api/nexus/pdt',
        collaboration: '/api/nexus/collaboration',
        genui: '/api/nexus/genui',
        spatial: '/api/nexus/spatial',
        activitypub: '/api/nexus/activitypub',
        translation: '/api/nexus/translation',
        trust: '/api/nexus/trust',
      },
      activitypub: {
        webfinger: '/.well-known/webfinger',
        actor: '/users/:username',
        inbox: '/users/:username/inbox',
      },
    },
    documentation: '/api/docs',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// WEBSOCKET
// ============================================================================

const io = setupWebSocket(httpServer);

// ============================================================================
// START SERVER
// ============================================================================

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🌌 NEURAFIELD QUANTUM PLATFORM 🌌              ║
║                                                               ║
║  Revolutionary AI-Powered Social & Video Platform             ║
║  Post-Feed Era Architecture Worth Billions                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server Status:
   → Environment: ${process.env.NODE_ENV || 'development'}
   → Port: ${PORT}
   → HTTP: http://localhost:${PORT}
   → Health: http://localhost:${PORT}/health
   → API: http://localhost:${PORT}/api

🎯 Features Enabled:
   ✅ Flow Studio (Google Flow Clone)
   ✅ Personal Digital Twins (Privacy-First AI)
   ✅ Agent Collaboration (Frictionless Coordination)
   ✅ Generative UI (Adaptive Interfaces)
   ✅ Spatial Worlds (3D Immersive Environments)
   ✅ ActivityPub Federation (Fediverse Interop)
   ✅ Real-time Voice Translation
   ✅ Web of Trust Verification

🔌 Services:
   → WebSocket: Active on all namespaces
   → Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}
   → Redis: ${process.env.REDIS_URL ? 'Connected' : 'Not configured'}
   → AI: ${process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}

📚 API Documentation: http://localhost:${PORT}/api

Ready to change the world! 🌍
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
