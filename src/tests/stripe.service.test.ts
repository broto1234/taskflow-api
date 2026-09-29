import { describe, expect, it, vi } from 'vitest';

const { create } = vi.hoisted(() => ({
  create: vi.fn(),
}));


vi.mock('../lib/stripe.js', () => ({
  default: {
    paymentIntents: {
      create,
    },
  },
}));

import { createPaymentIntent } from '../services/stripe.service.js';

describe('Stripe service', () => {
  it('creates a payment intent', async () => {
    create.mockResolvedValue({
      id: 'pi_test_123',
      amount: 1099,
      currency: 'usd',
      status: 'requires_payment_method',
    });

    const paymentIntent = await createPaymentIntent(
      1099,
      'usd',
    );

    expect(create).toHaveBeenCalledWith({
      amount: 1099,
      currency: 'usd',
    });

    expect(paymentIntent.id).toBe('pi_test_123');
    expect(paymentIntent.amount).toBe(1099);
    expect(paymentIntent.currency).toBe('usd');
    expect(paymentIntent.status).toBe('requires_payment_method');
  });
});