import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';
import { createPayment } from '../services/payment.service.js';
import stripe from '../lib/stripe.js';
import { env } from '../config/env.js';

describe('Payment webhook', () => {
  let userId: number;
  let providerPaymentId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Webhook Test User',
        email: `webhook-${Date.now()}@example.com`,
        password: 'secret123',
        role: 'USER',
      },
    });

    userId = user.id;
    
    const payment = await createPayment(
      userId,
      1099,
      'usd',
      'stripe',
    );

    providerPaymentId = payment.providerPaymentId;
  });

  afterEach(async () => {
    await prisma.webhookEvent.deleteMany({
      where: {
        providerPaymentId,
      },
    });

    await prisma.payment.deleteMany({
      where: {
        userId,
      },
    });

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it('receives a payment webhook and updates the payment', async () => {
    const event = {
    id: `evt_test_${Date.now()}`,
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: providerPaymentId,
      },
    },
  };

  const payload = JSON.stringify(event);

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: env.STRIPE_WEBHOOK_SECRET,
  });

  const response = await request(app)
    .post('/api/payments/webhook')
    .set('stripe-signature', signature)
    .set('content-type', 'application/json')
    .send(payload);
    
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.payment.providerPaymentId).toBe(
      providerPaymentId,
    );
    expect(response.body.payment.status).toBe('SUCCEEDED');
  });

  it('rejects a webhook with an invalid signature', async () => {
    const payload = {
      eventId: 'evt_test_invalid',
      providerPaymentId,
      status: 'SUCCEEDED',
    };

    const response = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'invalid-signature')
      .send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid Stripe signature');
  });

  it('rejects a webhook with a missing signature', async () => {
    const response = await request(app)
      .post('/api/payments/webhook')
      .send({
        eventId: 'evt_test_missing',
        providerPaymentId,
        status: 'SUCCEEDED',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Missing Stripe signature');
  });


  it('does not process the same webhook event twice', async () => {
    const event = {
      id: 'evt_duplicate_test',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: providerPaymentId,
        },
      },
    };

    const payload = JSON.stringify(event);

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: env.STRIPE_WEBHOOK_SECRET,
    });

    const firstResponse = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', signature)
      .set('content-type', 'application/json')
      .send(payload);

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.success).toBe(true);

    const secondResponse = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', signature)
      .set('content-type', 'application/json')
      .send(payload);

    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.success).toBe(true);
    expect(secondResponse.body.message).toBe(
      'Webhook already processed',
    );
  });

  it('rejects a webhook for a payment that does not exist', async () => {
    const event = {
      id: `evt_missing_payment_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `payment_that_does_not_exist_${Date.now()}`,
        },
      },
    };

    const payload = JSON.stringify(event);

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: env.STRIPE_WEBHOOK_SECRET,
    });

    const response = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', signature)
      .set('content-type', 'application/json')
      .send(payload);

    expect(response.status).toBe(404);
  });
});