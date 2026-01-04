/**
 * HEALTH CHECK TESTS
 */

import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return 200 on /health endpoint', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return API documentation on /api endpoint', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('version');
  });
});
