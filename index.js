/**
 * Firebase Cloud Function Entry Point
 * Wraps the Express app for Firebase Functions
 */

const functions = require('firebase-functions');

// Use ts-node to run TypeScript directly
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

// Import the Express app
const app = require('./server/index.ts').default;

// Export as Firebase Function
exports.api = functions.https.onRequest(app);
