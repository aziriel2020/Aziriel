/**
 * Jest Setup File
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/neurafield_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock external services
jest.mock('./server/services/email.service', () => ({
  EmailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendJobCompleteEmail: jest.fn().mockResolvedValue(undefined),
    sendJobFailedEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection: jest.fn().mockResolvedValue(true),
  },
}));

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
