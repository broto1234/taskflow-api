import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import rateLimit from 'express-rate-limit';

describe('Rate limiting', () => {
  it('should return 429 when the rate limit is exceeded', async () => {
    const app = express();

    const testLimiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 2,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    });

    app.use(testLimiter);

    app.get('/test', (_req, res) => {
      res.status(200).json({
        success: true,
      });
    });

    await request(app)
      .get('/test')
      .expect(200);

    await request(app)
      .get('/test')
      .expect(200);

    const response = await request(app)
      .get('/test');

    expect(response.status).toBe(429);
  });
});