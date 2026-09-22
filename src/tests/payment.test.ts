import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import prisma from '../lib/prisma.js';
import { createPayment, updatePaymentStatus } from '../services/payment.service.js';

const { createPaymentIntentMock } = vi.hoisted(() => ({
  createPaymentIntentMock: vi.fn(),
}));

vi.mock('../services/stripe.service.js', () => ({
  createPaymentIntent: createPaymentIntentMock,
}));

describe('Payment service', () => {
  let userId: number;

  beforeEach(async () => {
    createPaymentIntentMock.mockResolvedValue({
      id: `pi_test_${Date.now()}`,
    });

    const user = await prisma.user.create({
      data: {
        name: 'Payment Test User',
        email: `payment-${Date.now()}@example.com`,
        password: 'secret123',
        role: 'USER',
      },
    });

    userId = user.id;
  });

  afterEach(async () => {
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

  it('creates a pending payment', async () => {
    const payment = await createPayment(
      userId,
      1099,
      'usd',
      'stripe',
    );

    expect(payment.userId).toBe(userId);
    expect(payment.amount).toBe(1099);
    expect(payment.currency).toBe('usd');
    expect(payment.provider).toBe('stripe');
    expect(payment.providerPaymentId).toMatch(/^pi_/);
    expect(payment.status).toBe('PENDING');

    const savedPayment = await prisma.payment.findUnique({
      where: {
        providerPaymentId: payment.providerPaymentId,
      },
    });

    expect(savedPayment).not.toBeNull();
    expect(savedPayment?.userId).toBe(userId);
  });
  

  it('updates a payment status', async () => {
    const payment = await createPayment(
      userId,
      1099,
      'usd',
      'stripe',
    );

    expect(payment.status).toBe('PENDING');

    const updatedPayment = await updatePaymentStatus(
      payment.providerPaymentId,
      'SUCCEEDED',
    );

    expect(updatedPayment.status).toBe('SUCCEEDED');
    expect(updatedPayment.providerPaymentId).toMatch(/^pi_/);
  });

  it('throws when updating a payment that does not exist', async () => {
    await expect(
      updatePaymentStatus(
        'payment-that-does-not-exist',
        'SUCCEEDED',
      ),
    ).rejects.toThrow();
  });
});