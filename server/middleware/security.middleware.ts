/**
 * Security Middleware - Rate Limiting, Validation, CORS
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import logger from '../services/logger.service';

/**
 * Helmet security headers
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * CORS configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },
});

/**
 * Strict rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again in 15 minutes.',
    });
  },
});

/**
 * Generation job rate limiter (per user)
 */
export const createGenerationLimiter = () => {
  return async (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const key = `generation:${req.user.id}`;
    const limit = req.user.plan === 'FREE' ? 10 : req.user.plan === 'STARTER' ? 100 : 1000;
    const windowMs = 60 * 60 * 1000; // 1 hour

    try {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowMs / 1000);
      }

      if (count > limit) {
        logger.warn('Generation rate limit exceeded', {
          userId: req.user.id,
          count,
          limit,
        });
        return res.status(429).json({
          error: `Generation limit exceeded. You can create ${limit} jobs per hour on your ${req.user.plan} plan.`,
        });
      }

      next();
    } catch (error: any) {
      logger.error('Rate limiter error', { error: error.message });
      next(); // Fail open
    }
  };
};

/**
 * Validation error handler
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  next();
};

/**
 * Registration validation rules
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
];

/**
 * Login validation rules
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Generation job validation rules
 */
export const generationValidation = [
  body('prompt')
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage('Prompt must be 3-2000 characters'),
  body('provider')
    .trim()
    .notEmpty()
    .withMessage('Provider is required'),
  body('type')
    .isIn(['VIDEO', 'IMAGE', 'AUDIO', 'MODEL_3D'])
    .withMessage('Invalid generation type'),
];

/**
 * Post validation rules
 */
export const postValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be 1-5000 characters'),
  body('mediaUrl')
    .optional()
    .isURL()
    .withMessage('Invalid media URL'),
];

/**
 * Comment validation rules
 */
export const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be 1-1000 characters'),
];

/**
 * Message validation rules
 */
export const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1-2000 characters'),
];

/**
 * API key validation
 */
export const validateApiKey = async (req: any, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const key = await redis.get(`apikey:${apiKey}`);

    if (!key) {
      // Check database if not in cache
      const { prisma } = require('../config/database');
      const dbKey = await prisma.apiKey.findUnique({
        where: { key: apiKey as string },
        include: { user: true },
      });

      if (!dbKey || dbKey.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Invalid or expired API key' });
      }

      // Cache for 1 hour
      await redis.setex(`apikey:${apiKey}`, 3600, JSON.stringify(dbKey));

      req.user = {
        id: dbKey.user.id,
        email: dbKey.user.email,
        role: dbKey.user.role,
      };
    } else {
      const parsedKey = JSON.parse(key);
      req.user = {
        id: parsedKey.user.id,
        email: parsedKey.user.email,
        role: parsedKey.user.role,
      };
    }

    next();
  } catch (error: any) {
    logger.error('API key validation error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * IP whitelist middleware (for enterprise)
 */
export const ipWhitelist = (allowedIps: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (!clientIp || !allowedIps.includes(clientIp)) {
      logger.warn('IP not whitelisted', { ip: clientIp });
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

/**
 * Request size limiter
 */
export const requestSizeLimiter = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      logger.warn('Request size exceeded', {
        size: contentLength,
        maxSize,
        ip: req.ip,
      });
      return res.status(413).json({
        error: `Request too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      });
    }

    next();
  };
};
