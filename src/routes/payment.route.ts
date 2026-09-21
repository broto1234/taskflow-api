import { Router } from 'express';
import { handleCreatePayment, handlePaymentWebhook } from '../controllers/payment.controller.js';
const paymentRouter = Router();

paymentRouter.post('/', handleCreatePayment);
paymentRouter.post('/webhook', handlePaymentWebhook);

export default paymentRouter;