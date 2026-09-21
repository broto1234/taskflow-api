import stripe from '../lib/stripe.js';

export const createPaymentIntent = async (
  amount: number,
  currency: string,
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
  });

  return paymentIntent;
};