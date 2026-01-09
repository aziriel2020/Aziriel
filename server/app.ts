/**
 * Main Express Application
 * NEURAFIELD QUANTUM - AI Video Creation Platform
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';

// Import routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import generationRoutes from './routes/generation.routes';
import videoRoutes from './routes/video.routes';
import assetRoutes from './routes/asset.routes';
import userRoutes from './routes/user.routes';
import jobsRoutes from './routes/jobs.routes';
import premiumRoutes from './routes/premium.routes';
import storyboardRoutes from './routes/storyboard.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import logger from './services/logger.service';

// Import services (initialize queue workers)
import './services/queue.service';
import jwt from 'jsonwebtoken';

// Create Express app
const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload
app.use(
  fileUpload({
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/generate', generationRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/premium', premiumRoutes); // ALL PREMIUM FEATURES
app.use('/api/storyboard', storyboardRoutes); // LEGENDARY STORYBOARD SYSTEM

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'NEURAFIELD QUANTUM API',
    version: '1.0.0',
    description: 'AI-Powered Video Creation Platform',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// SOCKET.IO CONNECTION
// ============================================

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    // Allow anonymous connections (they just won't get user-specific events)
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    (socket as any).userId = decoded.id;
    next();
  } catch (err) {
    logger.warn(`Socket authentication failed: ${err}`);
    next(); // Allow connection anyway
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;

  logger.info(`Socket connected: ${socket.id}${userId ? ` (User: ${userId})` : ' (Anonymous)'}`);

  // Join user-specific room for job notifications
  if (userId) {
    socket.join(`user:${userId}`);
    logger.info(`Socket ${socket.id} joined user room: user:${userId}`);
  }

  // Project room management
  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    logger.info(`Socket ${socket.id} joined project ${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    logger.info(`Socket ${socket.id} left project ${projectId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================
// EXPORT
// ============================================

export { app, httpServer };
