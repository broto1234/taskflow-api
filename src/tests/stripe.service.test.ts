import { describe, expect, it } from 'vitest';

import { createPaymentIntent } from '../services/stripe.service.js';

describe('Stripe service', () => {
  it('creates a payment intent', async () => {
    const paymentIntent = await createPaymentIntent(
      1099,
      'usd',
    );

    expect(paymentIntent.id).toMatch(/^pi_/);
    expect(paymentIntent.amount).toBe(1099);
    expect(paymentIntent.currency).toBe('usd');
    expect(paymentIntent.status).toBe('requires_payment_method');
  });
});