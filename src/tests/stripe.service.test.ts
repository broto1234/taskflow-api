import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPaymentIntent } from '../services/stripe.service.js';

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock('../lib/stripe.js', () => ({
  default: {
    paymentIntents: {
      create: createMock,
    },
  },
}));

describe('Stripe service', () => {
  beforeEach(() => {
    createMock.mockResolvedValue({
      id: 'pi_mocked',
      amount: 1099,
      currency: 'usd',
      status: 'requires_payment_method',
    });
  });

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