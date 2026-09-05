import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/users', () => {
  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });
  
  it('should return 403 when a USER tries to access the users endpoint', async () => {
    // Login as USER
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    // Try to access ADMIN-only endpoint
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: 'You do not have permission to access this resource',
    });
  });

  it('should return 200 when an ADMIN accesses the users endpoint', async () => {
    // Login as ADMIN
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'satyo@gmail.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    expect(token).toBeDefined();

    // Access ADMIN-only endpoint
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeGreaterThan(0);

    const user = response.body.data[0];

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');

    expect(user).not.toHaveProperty('password');
  });

  // CORS test
  it('should allow requests from the configured frontend origin', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin'])
      .toBe('http://localhost:3000');
  });
});