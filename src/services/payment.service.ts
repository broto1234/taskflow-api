import prisma from '../lib/prisma.js';
import { PaymentStatus } from '../generated/prisma/client.js';
import { createPaymentIntent } from './stripe.service.js';

export const createPayment = async (
  userId: number,
  amount: number,
  currency: string,
  provider: string,
) => {
  const paymentIntent = await createPaymentIntent(
    amount,
    currency,
  );

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency,
      provider,
      providerPaymentId: paymentIntent.id,
      status: PaymentStatus.PENDING,
    },
  });

  return payment;
};

export const updatePaymentStatus = async (
  providerPaymentId: string,
  status: PaymentStatus,
) => {
  const payment = await prisma.payment.update({
    where: {
      providerPaymentId,
    },
    data: {
      status,
    },
  });

  return payment;
};


export const processPaymentWebhook = async ({
  eventId,
  providerPaymentId,
  status,
}: {
  eventId: string;
  providerPaymentId: string;
  status: PaymentStatus;
}) => {
  return prisma.$transaction(async (tx) => {
    const existingEvent = await tx.webhookEvent.findUnique({
      where: {
        providerEventId: eventId,
      },
    });

    if (existingEvent) {
      return {
        alreadyProcessed: true,
        payment: null,
      };
    }

    const payment = await tx.payment.update({
      where: {
        providerPaymentId,
      },
      data: {
        status,
      },
    });

    await tx.webhookEvent.create({
      data: {
        provider: 'stripe',
        providerEventId: eventId,
        providerPaymentId,
        status,
      },
    });

    return {
      alreadyProcessed: false,
      payment,
    };
  });
};