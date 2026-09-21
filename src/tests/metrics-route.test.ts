// An integration/API test

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Metrics Route', () => {
  it('should return metrics', async () => {
    const response = await request(app)
      .get('/metrics');

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('requests');
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('redirects');
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('clientErrors');
    expect(response.body).toHaveProperty('serverErrors');
    expect(response.body).toHaveProperty('activeRequests');
    expect(response.body).toHaveProperty('averageDuration');
    expect(response.body).toHaveProperty('p95Duration');
    expect(response.body).toHaveProperty('requestsLastMinute');

    expect(typeof response.body.requests).toBe('number');
    expect(typeof response.body.averageDuration).toBe('number');
    expect(typeof response.body.p95Duration).toBe('number');
    expect(typeof response.body.requestsLastMinute).toBe('number');
  });


  it('should record a request', async () => {
    const before = await request(app)
      .get('/metrics');

    const after = await request(app)
      .get('/metrics');

    expect(after.body.requests).toBe(
      before.body.requests + 1,
    );
  });
});