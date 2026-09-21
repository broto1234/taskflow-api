import {
  describe,
  it,
  expect,
  beforeAll,
} from 'vitest';
import request from 'supertest';
import app from '../app.js';
import redis from '../lib/redis.js';

describe('Health Check', () => {
  beforeAll(async () => {
    await redis.connect();
  });

  it('should return health status', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: 'OK',
      database: 'OK',
      redis: 'OK',
    });
  });
});