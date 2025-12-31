/**
 * API Integration Tests
 */

import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('Health & Stats', () => {
    it('GET /api/health should return healthy status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('version', '5.0.0');
      expect(response.body).toHaveProperty('platform', 'NEURAFIELD QUANTUM');
    });

    it('GET /api/stats should return platform statistics', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('providers');
      expect(response.body).toHaveProperty('modes');
      expect(response.body).toHaveProperty('cinematix');
      expect(response.body).toHaveProperty('apps');
    });
  });

  describe('Authentication', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test1234!',
      name: 'Test User',
    };

    it('POST /api/auth/register should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testUser.email);

      authToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('POST /api/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/auth/me should return current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('GET /api/auth/me should reject without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('AI Providers', () => {
    it('GET /api/providers should return all providers', async () => {
      const response = await request(app).get('/api/providers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /api/providers/video should return video providers', async () => {
      const response = await request(app).get('/api/providers/video');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((p: any) => p.category === 'video')).toBe(true);
    });

    it('GET /api/provider/:id should return specific provider', async () => {
      const response = await request(app).get('/api/provider/openai-sora');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'openai-sora');
      expect(response.body).toHaveProperty('name');
    });
  });

  describe('Cinematix', () => {
    it('GET /api/cinematix should return all cinematix features', async () => {
      const response = await request(app).get('/api/cinematix');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shotTypes');
      expect(response.body).toHaveProperty('cameraMovements');
      expect(response.body).toHaveProperty('vfxCategories');
      expect(response.body).toHaveProperty('directorStyles');
    });

    it('GET /api/cinematix/innovations should return 12 innovations', async () => {
      const response = await request(app).get('/api/cinematix/innovations');

      expect(response.status).toBe(200);
      expect(Object.keys(response.body)).toHaveLength(12);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      const requests = [];
      const testEmail = 'ratelimit@example.com';

      // Send 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrong' })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some((r) => r.status === 429);

      expect(rateLimited).toBe(true);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
