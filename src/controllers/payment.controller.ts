import type { Request, Response } from 'express';
import { processPaymentWebhook } from '../services/payment.service.js';
import { env } from '../config/env.js';
import stripe from '../lib/stripe.js';
import { createPayment } from '../services/payment.service.js';

export const handlePaymentWebhook = async (
  req: Request,
  res: Response,
) => {
  const signature = req.headers['stripe-signature'];

  if (typeof signature !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing Stripe signature',
    });
  }

  // First: verify the signature
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid Stripe signature',
    });
  }
  
  // We must verify the signature before trusting the contents of the body.

  const eventId = event.id;

  if (event.type !== 'payment_intent.succeeded') {
    return res.status(200).json({
      success: true,
      message: 'Event ignored',
    });
  }

  const paymentIntent = event.data.object;

  const providerPaymentId = paymentIntent.id;
  const status = 'SUCCEEDED';

  const result = await processPaymentWebhook({
    eventId,
    providerPaymentId,
    status,
  });

  if (result.alreadyProcessed) {
    return res.status(200).json({
      success: true,
      message: 'Webhook already processed',
    });
  }

  return res.status(200).json({
    success: true,
    payment: result.payment,
  });
};

export const handleCreatePayment = async (
  req: Request,
  res: Response,
) => {
  const { userId, amount, currency } = req.body;

  const payment = await createPayment(
    userId,
    amount,
    currency,
    'stripe',
  );

  return res.status(201).json({
    success: true,
    payment,
  });
};