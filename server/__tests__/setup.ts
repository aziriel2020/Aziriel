/**
 * TEST SETUP
 * Global test configuration
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/neurafield_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret-key';

// Mock external APIs
jest.mock('@anthropic-ai/sdk');
jest.mock('openai');
jest.mock('stripe');

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup
});
