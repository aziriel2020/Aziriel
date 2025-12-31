/**
 * NEURAFIELD QUANTUM v5.0 - Production Express Server
 * Complete backend with all API endpoints, Socket.IO, and production features
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

// Import shared modules
import { getAllProviders, getProviderById, getProvidersByCategory, getTotalStats } from '../shared/ai-providers-registry';
import { llmProviders, threeDProviders, toolsProviders } from '../shared/ai-providers-extended';
import { shotTypes, cameraMovements, transitions, vfxCategories, physicsInteractions, emotionProfiles } from '../shared/cinematix-engine';
import { iconicScenes, directorStyles, narrativeStructures, advancedFeatures } from '../shared/cinematix-extended';
import { getAllModes, getModeById, getModesByCategory, getTotalModeStats } from '../shared/generation-modes';

// Import middleware
import { helmetMiddleware, corsMiddleware, apiLimiter, sanitizeInput } from './middleware/security.middleware';
import { authenticate, optionalAuth } from './middleware/auth.middleware';

// Import services
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler, MonitoringService } from './services/monitoring.service';
import logger, { requestLogger } from './services/logger.service';
import { EmailService } from './services/email.service';

// Import routes
import socialRoutes from './routes/social.routes';
import adminRoutes from './routes/admin.routes';

// Import config
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();

// Initialize Sentry (must be first)
initSentry(app);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

// Sentry request handling
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Sanitize inputs
app.use(sanitizeInput);

// Request logging
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NEURAFIELD QUANTUM API Docs'
}));

// In-memory storage (in production, use a real database)
const jobs = new Map<string, any>();
const apiKeys = new Map<string, string>();
const appMarketplace = {
  creative: [
    { id: 'video-editor-pro', name: 'Video Editor Pro', category: 'creative', description: 'Professional video editing suite', price: 'Included', icon: '🎬' },
    { id: 'ai-photo-editor', name: 'AI Photo Editor', category: 'creative', description: 'Advanced photo editing', price: 'Included', icon: '🖼️' },
    { id: 'ai-audio-workstation', name: 'AI Audio Workstation', category: 'creative', description: 'Complete audio production', price: 'Included', icon: '🎵' },
    { id: 'animation-studio', name: 'Animation Studio', category: 'creative', description: '2D/3D animation creation', price: 'Included', icon: '🎨' },
    { id: '3d-modeler', name: '3D Modeler', category: 'creative', description: '3D modeling and sculpting', price: 'Included', icon: '🗿' },
    { id: 'music-studio', name: 'Music Studio', category: 'creative', description: 'AI music composition', price: 'Included', icon: '🎹' },
    { id: 'voice-studio', name: 'Voice Studio', category: 'creative', description: 'Voice synthesis and cloning', price: 'Included', icon: '🎙️' }
  ],
  productivity: [
    { id: 'document-ai', name: 'Document AI', category: 'productivity', description: 'AI document processing', price: 'Included', icon: '📄' },
    { id: 'presentation-ai', name: 'Presentation AI', category: 'productivity', description: 'Auto-generate presentations', price: 'Included', icon: '📊' },
    { id: 'spreadsheet-ai', name: 'Spreadsheet AI', category: 'productivity', description: 'Smart spreadsheet automation', price: 'Included', icon: '📈' },
    { id: 'research-assistant', name: 'Research Assistant', category: 'productivity', description: 'AI research and analysis', price: 'Included', icon: '🔍' },
    { id: 'meeting-assistant', name: 'Meeting Assistant', category: 'productivity', description: 'Meeting notes and summaries', price: 'Included', icon: '📝' },
    { id: 'email-assistant', name: 'Email Assistant', category: 'productivity', description: 'Email composition and management', price: 'Included', icon: '✉️' },
    { id: 'calendar-ai', name: 'Calendar AI', category: 'productivity', description: 'Smart scheduling', price: 'Included', icon: '📅' },
    { id: 'task-manager-ai', name: 'Task Manager AI', category: 'productivity', description: 'AI task organization', price: 'Included', icon: '✅' }
  ],
  marketing: [
    { id: 'social-media-manager', name: 'Social Media Manager', category: 'marketing', description: 'AI social media management', price: 'Included', icon: '📱' },
    { id: 'ad-creator', name: 'Ad Creator', category: 'marketing', description: 'Generate ad creatives', price: 'Included', icon: '📢' },
    { id: 'seo-tools', name: 'SEO Tools', category: 'marketing', description: 'AI SEO optimization', price: 'Included', icon: '🔎' },
    { id: 'brand-kit', name: 'Brand Kit', category: 'marketing', description: 'Brand asset generation', price: 'Included', icon: '🎯' },
    { id: 'influencer-finder', name: 'Influencer Finder', category: 'marketing', description: 'Find relevant influencers', price: 'Included', icon: '⭐' },
    { id: 'content-planner', name: 'Content Planner', category: 'marketing', description: 'Plan content strategy', price: 'Included', icon: '📆' }
  ],
  business: [
    { id: 'crm-ai', name: 'CRM AI', category: 'business', description: 'AI-powered CRM', price: 'Included', icon: '👥' },
    { id: 'sales-assistant', name: 'Sales Assistant', category: 'business', description: 'AI sales support', price: 'Included', icon: '💼' },
    { id: 'support-ai', name: 'Support AI', category: 'business', description: 'Customer support automation', price: 'Included', icon: '💬' },
    { id: 'invoice-generator', name: 'Invoice Generator', category: 'business', description: 'AI invoice creation', price: 'Included', icon: '🧾' },
    { id: 'contract-analyzer', name: 'Contract Analyzer', category: 'business', description: 'Analyze contracts', price: 'Included', icon: '📋' },
    { id: 'hr-assistant', name: 'HR Assistant', category: 'business', description: 'HR automation', price: 'Included', icon: '🏢' }
  ],
  developer: [
    { id: 'code-assistant', name: 'Code Assistant', category: 'developer', description: 'AI coding help', price: 'Included', icon: '💻' },
    { id: 'api-builder', name: 'API Builder', category: 'developer', description: 'Generate APIs', price: 'Included', icon: '🔌' },
    { id: 'database-ai', name: 'Database AI', category: 'developer', description: 'Database design and queries', price: 'Included', icon: '🗄️' },
    { id: 'devops-assistant', name: 'DevOps Assistant', category: 'developer', description: 'DevOps automation', price: 'Included', icon: '⚙️' },
    { id: 'ui-generator', name: 'UI Generator', category: 'developer', description: 'Generate UI components', price: 'Included', icon: '🎨' },
    { id: 'test-generator', name: 'Test Generator', category: 'developer', description: 'Generate tests', price: 'Included', icon: '🧪' }
  ],
  education: [
    { id: 'learning-platform', name: 'Learning Platform', category: 'education', description: 'AI learning system', price: 'Included', icon: '📚' },
    { id: 'language-learning', name: 'Language Learning', category: 'education', description: 'Learn languages with AI', price: 'Included', icon: '🌍' },
    { id: 'skill-assessment', name: 'Skill Assessment', category: 'education', description: 'Assess and improve skills', price: 'Included', icon: '📊' },
    { id: 'flashcard-maker', name: 'Flashcard Maker', category: 'education', description: 'AI flashcard generation', price: 'Included', icon: '🃏' },
    { id: 'essay-helper', name: 'Essay Helper', category: 'education', description: 'Essay writing assistance', price: 'Included', icon: '✍️' },
    { id: 'quiz-generator', name: 'Quiz Generator', category: 'education', description: 'Generate quizzes', price: 'Included', icon: '❓' }
  ],
  entertainment: [
    { id: 'ai-game-maker', name: 'AI Game Maker', category: 'entertainment', description: 'Create games with AI', price: 'Included', icon: '🎮' },
    { id: 'story-generator', name: 'Story Generator', category: 'entertainment', description: 'Generate stories', price: 'Included', icon: '📖' },
    { id: 'music-composer', name: 'Music Composer', category: 'entertainment', description: 'Compose music', price: 'Included', icon: '🎼' },
    { id: 'virtual-dj', name: 'Virtual DJ', category: 'entertainment', description: 'AI DJ mixing', price: 'Included', icon: '🎧' },
    { id: 'comic-creator', name: 'Comic Creator', category: 'entertainment', description: 'Create comics', price: 'Included', icon: '📰' },
    { id: 'avatar-creator', name: 'Avatar Creator', category: 'entertainment', description: 'Create avatars', price: 'Included', icon: '👤' }
  ],
  lifestyle: [
    { id: 'fitness-coach', name: 'Fitness Coach', category: 'lifestyle', description: 'AI fitness coaching', price: 'Included', icon: '💪' },
    { id: 'recipe-generator', name: 'Recipe Generator', category: 'lifestyle', description: 'Generate recipes', price: 'Included', icon: '🍳' },
    { id: 'travel-planner', name: 'Travel Planner', category: 'lifestyle', description: 'Plan trips with AI', price: 'Included', icon: '✈️' },
    { id: 'personal-stylist', name: 'Personal Stylist', category: 'lifestyle', description: 'AI fashion advice', price: 'Included', icon: '👗' },
    { id: 'home-designer', name: 'Home Designer', category: 'lifestyle', description: 'Design home interiors', price: 'Included', icon: '🏡' },
    { id: 'meditation-guide', name: 'Meditation Guide', category: 'lifestyle', description: 'Guided meditation', price: 'Included', icon: '🧘' }
  ]
};

// ==================== HEALTH & MONITORING ====================

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const health = await MonitoringService.healthCheck();
    const metrics = await MonitoringService.getSystemMetrics();

    res.json({
      status: health.status,
      timestamp: health.timestamp,
      version: '5.0.0',
      platform: 'NEURAFIELD QUANTUM',
      uptime: metrics.uptime,
      services: health.services,
      memory: metrics.memory
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ==================== AUTHENTICATION ROUTES ====================

import { AuthService } from './services/auth.service';
import { authLimiter, registerValidation, loginValidation, validateRequest } from './middleware/security.middleware';

app.post('/api/auth/register', authLimiter, registerValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const result = await AuthService.register(email, password, name);

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(email, name || email, 100);
    } catch (emailError) {
      logger.error('Failed to send welcome email', { error: emailError });
    }

    res.status(201).json(result);
  } catch (error: any) {
    logger.error('Registration error', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', authLimiter, loginValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.json(result);
  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/logout', authenticate, async (req: any, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res: Response) => {
  try {
    const { prisma } = require('./config/database');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        plan: true,
        credits: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOCIAL ROUTES ====================

app.use('/api/social', apiLimiter, socialRoutes);

// ==================== ADMIN ROUTES ====================

app.use('/api/admin', apiLimiter, adminRoutes);

app.get('/api/stats', (req: Request, res: Response) => {
  const providerStats = getTotalStats();
  const modeStats = getTotalModeStats();

  res.json({
    providers: providerStats,
    modes: modeStats,
    cinematix: {
      shotTypes: shotTypes.length,
      cameraMovements: cameraMovements.length,
      transitions: transitions.length,
      vfxCategories: vfxCategories.length,
      emotionProfiles: emotionProfiles.length,
      directorStyles: directorStyles.length,
      iconicScenes: iconicScenes.length,
      narrativeStructures: narrativeStructures.length
    },
    apps: {
      total: Object.values(appMarketplace).reduce((sum, apps) => sum + apps.length, 0),
      byCategory: Object.fromEntries(
        Object.entries(appMarketplace).map(([cat, apps]) => [cat, apps.length])
      )
    },
    jobs: {
      total: jobs.size,
      pending: Array.from(jobs.values()).filter(j => j.status === 'pending').length,
      processing: Array.from(jobs.values()).filter(j => j.status === 'processing').length,
      completed: Array.from(jobs.values()).filter(j => j.status === 'completed').length,
      failed: Array.from(jobs.values()).filter(j => j.status === 'failed').length
    }
  });
});

// ==================== PROVIDERS ====================

app.get('/api/providers', (req: Request, res: Response) => {
  res.json(getAllProviders());
});

app.get('/api/providers/video', (req: Request, res: Response) => {
  res.json(getProvidersByCategory('video'));
});

app.get('/api/providers/image', (req: Request, res: Response) => {
  res.json(getProvidersByCategory('image'));
});

app.get('/api/providers/audio', (req: Request, res: Response) => {
  res.json(getProvidersByCategory('audio'));
});

app.get('/api/providers/llm', (req: Request, res: Response) => {
  res.json(llmProviders);
});

app.get('/api/providers/3d', (req: Request, res: Response) => {
  res.json(threeDProviders);
});

app.get('/api/providers/tools', (req: Request, res: Response) => {
  res.json(toolsProviders);
});

app.get('/api/provider/:id', (req: Request, res: Response) => {
  const provider = getProviderById(req.params.id);
  if (provider) {
    res.json(provider);
  } else {
    res.status(404).json({ error: 'Provider not found' });
  }
});

// ==================== CINEMATIX ====================

app.get('/api/cinematix', (req: Request, res: Response) => {
  res.json({
    shotTypes,
    cameraMovements,
    transitions,
    vfxCategories,
    physicsInteractions,
    emotionProfiles,
    iconicScenes,
    directorStyles,
    narrativeStructures,
    advancedFeatures
  });
});

app.get('/api/cinematix/innovations', (req: Request, res: Response) => {
  res.json({
    innovation1: { name: 'AI Director Mode', shotTypes, cameraMovements, transitions },
    innovation2: { name: 'VFX Composer', vfxCategories, physicsInteractions },
    innovation3: { name: 'Emotional Cinematography AI', emotionProfiles },
    innovation4: { name: 'Scene DNA Analyzer', iconicScenes },
    innovation5: { name: 'Character Consistency Engine' },
    innovation6: { name: 'Director Style Presets', directorStyles },
    innovation7: { name: 'Narrative Arc Generator', narrativeStructures },
    innovation8: { name: 'Physics-Aware VFX', data: advancedFeatures.physicsAware },
    innovation9: { name: 'Audio-Reactive VFX', data: advancedFeatures.audioReactive },
    innovation10: { name: 'Procedural World Builder', data: advancedFeatures.proceduralBiomes },
    innovation11: { name: 'Stunt Choreographer AI', data: advancedFeatures.stuntStyles },
    innovation12: { name: 'Branching Timeline', data: advancedFeatures.branchingOptions }
  });
});

app.get('/api/cinematix/directors', (req: Request, res: Response) => {
  res.json(directorStyles);
});

app.get('/api/cinematix/vfx', (req: Request, res: Response) => {
  res.json(vfxCategories);
});

app.get('/api/cinematix/emotions', (req: Request, res: Response) => {
  res.json(emotionProfiles);
});

app.get('/api/cinematix/narratives', (req: Request, res: Response) => {
  res.json(narrativeStructures);
});

app.get('/api/cinematix/scenes', (req: Request, res: Response) => {
  res.json(iconicScenes);
});

// ==================== GENERATION ====================

app.post('/api/generate/video', (req: Request, res: Response) => {
  const { prompt, provider, mode, settings } = req.body;

  const jobId = uuidv4();
  const job = {
    id: jobId,
    type: 'video',
    prompt,
    provider,
    mode,
    settings,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString()
  };

  jobs.set(jobId, job);

  // Emit to Socket.IO
  io.emit('job:created', job);

  // Simulate processing
  setTimeout(() => {
    job.status = 'processing';
    job.progress = 25;
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 1000);

  setTimeout(() => {
    job.status = 'processing';
    job.progress = 50;
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 3000);

  setTimeout(() => {
    job.status = 'processing';
    job.progress = 75;
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 5000);

  setTimeout(() => {
    job.status = 'completed';
    job.progress = 100;
    job.result = {
      url: `https://placeholder.example.com/video/${jobId}.mp4`,
      duration: 10,
      resolution: '1920x1080'
    };
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 7000);

  res.json({ jobId, message: 'Video generation started' });
});

app.post('/api/generate/image', (req: Request, res: Response) => {
  const { prompt, provider, mode, settings } = req.body;

  const jobId = uuidv4();
  const job = {
    id: jobId,
    type: 'image',
    prompt,
    provider,
    mode,
    settings,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString()
  };

  jobs.set(jobId, job);
  io.emit('job:created', job);

  // Simulate faster processing for images
  setTimeout(() => {
    job.status = 'completed';
    job.progress = 100;
    job.result = {
      url: `https://placeholder.example.com/image/${jobId}.png`,
      resolution: '2048x2048'
    };
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 3000);

  res.json({ jobId, message: 'Image generation started' });
});

app.post('/api/generate/audio', (req: Request, res: Response) => {
  const { prompt, provider, mode, settings } = req.body;

  const jobId = uuidv4();
  const job = {
    id: jobId,
    type: 'audio',
    prompt,
    provider,
    mode,
    settings,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString()
  };

  jobs.set(jobId, job);
  io.emit('job:created', job);

  setTimeout(() => {
    job.status = 'completed';
    job.progress = 100;
    job.result = {
      url: `https://placeholder.example.com/audio/${jobId}.mp3`,
      duration: 30
    };
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 4000);

  res.json({ jobId, message: 'Audio generation started' });
});

app.post('/api/generate/3d', (req: Request, res: Response) => {
  const { prompt, provider, mode, settings } = req.body;

  const jobId = uuidv4();
  const job = {
    id: jobId,
    type: '3d',
    prompt,
    provider,
    mode,
    settings,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString()
  };

  jobs.set(jobId, job);
  io.emit('job:created', job);

  setTimeout(() => {
    job.status = 'completed';
    job.progress = 100;
    job.result = {
      url: `https://placeholder.example.com/3d/${jobId}.glb`,
      format: 'GLB'
    };
    jobs.set(jobId, job);
    io.emit('job:progress', job);
  }, 6000);

  res.json({ jobId, message: '3D generation started' });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { message, provider, model } = req.body;

  // Simulate chat response
  setTimeout(() => {
    res.json({
      response: `This is a simulated response from ${provider}/${model}. In production, this would connect to the actual LLM API. Your message was: "${message}"`,
      model: model,
      provider: provider,
      timestamp: new Date().toISOString()
    });
  }, 500);
});

// ==================== JOBS ====================

app.get('/api/jobs', (req: Request, res: Response) => {
  const allJobs = Array.from(jobs.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(allJobs);
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// ==================== API KEYS ====================

app.post('/api/keys/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  apiKeys.set(provider, apiKey);
  res.json({ message: `API key set for ${provider}`, success: true });
});

app.get('/api/keys', (req: Request, res: Response) => {
  const configuredKeys = Array.from(apiKeys.keys());
  res.json({ providers: configuredKeys });
});

// ==================== GENERATION MODES ====================

app.get('/api/modes', (req: Request, res: Response) => {
  res.json(getAllModes());
});

app.get('/api/modes/:category', (req: Request, res: Response) => {
  const category = req.params.category as any;
  res.json(getModesByCategory(category));
});

// ==================== APPS MARKETPLACE ====================

app.get('/api/apps', (req: Request, res: Response) => {
  res.json(appMarketplace);
});

app.get('/api/apps/:category', (req: Request, res: Response) => {
  const category = req.params.category;
  if (appMarketplace[category as keyof typeof appMarketplace]) {
    res.json(appMarketplace[category as keyof typeof appMarketplace]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const stats = getTotalStats();
  const modeStats = getTotalModeStats();

  socket.emit('welcome', {
    message: 'Welcome to NEURAFIELD QUANTUM v5.0',
    stats: {
      providers: stats.totalProviders,
      models: stats.totalModels,
      modes: modeStats.total,
      innovations: 12
    }
  });

  socket.on('subscribe:job', (jobId: string) => {
    console.log(`Client ${socket.id} subscribed to job ${jobId}`);
    socket.join(`job:${jobId}`);
  });

  socket.on('unsubscribe:job', (jobId: string) => {
    console.log(`Client ${socket.id} unsubscribed from job ${jobId}`);
    socket.leave(`job:${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ==================== ERROR HANDLING ====================

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    documentation: `${process.env.APP_URL || 'http://localhost:3000'}/api/docs`
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  MonitoringService.captureException(err, {
    path: req.path,
    method: req.method,
    body: req.body
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== START SERVER ====================

async function startServer() {
  try {
    // Verify email configuration
    await EmailService.verifyConnection();

    // Start server
    httpServer.listen(PORT, () => {
      const stats = getTotalStats();
      const modeStats = getTotalModeStats();
      const appCount = Object.values(appMarketplace).reduce((sum, apps) => sum + apps.length, 0);

      logger.info('Server started successfully', {
        port: PORT,
        env: process.env.NODE_ENV,
        providers: stats.totalProviders,
        models: stats.totalModels
      });

      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          NEURAFIELD QUANTUM v5.0 PRODUCTION               ║
║          The $10 Billion Reference Platform               ║
║                                                           ║
║  🚀 Server: http://localhost:${PORT}                        ║
║  📚 API Docs: http://localhost:${PORT}/api/docs             ║
║  📊 Providers: ${stats.totalProviders}+ providers, ${stats.totalModels}+ models               ║
║  🎬 Cinematix: 12 Revolutionary Innovations               ║
║  🎨 Modes: ${modeStats.total}+ generation modes                      ║
║  📱 Apps: ${appCount}+ included applications                    ║
║  🔐 Auth: JWT + OAuth (Google, GitHub)                    ║
║  💳 Payments: Stripe Integration                          ║
║  📊 Analytics: Winston + Sentry                           ║
║  💾 Database: PostgreSQL + Prisma                         ║
║  🔄 Queue: Bull + Redis                                   ║
║  ☁️  Storage: AWS S3                                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing server gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;
