/**
 * Firebase Cloud Functions Entry Point
 * NEURAFIELD QUANTUM - Production Ready
 */

const functions = require('firebase-functions');
const { defineString } = require('firebase-functions/params');

// Define required environment variables
const DATABASE_URL = defineString('DATABASE_URL');
const REDIS_URL = defineString('REDIS_URL');
const JWT_SECRET = defineString('JWT_SECRET');

// Register ts-node for TypeScript execution
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    target: 'ES2022',
    moduleResolution: 'node'
  }
});

// Set environment variables for the app
process.env.DATABASE_URL = DATABASE_URL.value();
process.env.REDIS_URL = REDIS_URL.value();
process.env.JWT_SECRET = JWT_SECRET.value();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '8080';

// Import the Express app
let app;
try {
  app = require('./server/index.ts').default;
  console.log('✅ Express app loaded successfully');
} catch (error) {
  console.error('❌ Error loading Express app:', error);
  throw error;
}

// Export as Firebase Cloud Function with configuration
exports.api = functions
  .runWith({
    timeoutSeconds: 300,      // 5 minutes max
    memory: '2GB',            // 2GB RAM
    minInstances: 0,          // Scale to zero when idle
    maxInstances: 10,         // Max 10 concurrent instances
  })
  .https
  .onRequest(app);

// Health check function (faster response)
exports.health = functions
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .https
  .onRequest((req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'neurafield-quantum',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

console.log('🔥 Firebase Functions loaded successfully');
