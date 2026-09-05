import { describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { env } from '../../src/config/env.js';

describe('POST /api/auth/register', () => {

  it('should register a new user successfully', async () => {
    const email = `test-${Date.now()}@example.com`;

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email,
        password: 'secret123',
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('Test User');
    expect(response.body.data.email).toBe(email);

    expect(response.body.data).not.toHaveProperty('password');
  });

  it('should return 409 when the email is already registered', async () => {
    const email = `duplicate-${Date.now()}@example.com`;

    const firstResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email,
        password: 'secret123',
      });

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email,
        password: 'secret456',
      });

    expect(secondResponse.status).toBe(409);

    expect(secondResponse.body).toEqual({
      success: false,
      message: 'Email already registered',
    });
  });

  it('should return 400 when password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `missing-password-${Date.now()}@example.com`,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should return 400 for an invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'secret123',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should return 400 when name is less than 2 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: `short-name-${Date.now()}@example.com`,
        password: 'secret123',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should return 400 when name exceeds 50 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A'.repeat(51),
        email: `long-name-${Date.now()}@example.com`,
        password: 'secret123',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should return 400 when password is less than 6 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `short-password-${Date.now()}@example.com`,
        password: '12345',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should allow a newly registered user to login', async () => {
    const email = `register-login-${Date.now()}@example.com`;
    const password = 'secret123';

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Register Login User',
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data).toHaveProperty('token');
    expect(typeof loginResponse.body.data.token).toBe('string');
  });

  it('should assign the USER role to a newly registered user', async () => {
    const email = `default-role-${Date.now()}@example.com`;
    const password = 'secret123';

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Default Role User',
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET!
    ) as {
      userId: number;
      role: string;
    };

    expect(decoded.role).toBe('USER');
  });
});



describe('POST /api/auth/login', () => {

  it('should return 400 when email or password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should return 400 for an invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'secret123',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'does-not-exist@example.com',
        password: 'WrongPassword123',
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid email or password',
    });
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveProperty('token');

    expect(typeof response.body.data.token).toBe('string');

    const decoded = jwt.verify(
      response.body.data.token,
      env.JWT_SECRET!
    ) as {
      userId: number;
      role: string;
    };

    expect(decoded.userId).toBe(3);
    expect(decoded.role).toBe('USER');
  });
});


describe('GET /api/tasks', () => {
  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/tasks');

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });

  it('should return tasks when a valid token is provided', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    expect(token).toBeDefined();

    // 2. Use the JWT
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it('should return 401 when an invalid token is provided', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid or expired token',
    });
  });

  it('should return 401 when the token has expired', async () => {
    const token = jwt.sign(
      {
        userId: 3,
        role: 'USER',
      },
      env.JWT_SECRET!,
      {
        expiresIn: -1,
      }
    );

    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid or expired token',
    });
  });

});