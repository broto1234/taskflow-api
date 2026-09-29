import { Worker } from 'bullmq';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';

const redisUrl = new URL(process.env.REDIS_URL!);

export const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    console.log('Starting email job:', job.name);

    if (job.name === 'sendWelcomeEmail') {
      await sendWelcomeEmail(
        job.data.email,
        job.data.name,
      );

      console.log('Welcome email sent');
    }

    if (job.name === 'sendPasswordResetEmail') {
      await sendPasswordResetEmail(
        job.data.email,
        job.data.token,
      );

      console.log('Password reset email sent');
    }
  },
  {
    connection: {
      host: redisUrl.hostname,
      port: Number(redisUrl.port),
    },
  },
);

emailWorker.on('failed', (job, error) => {
  console.error('Email job failed:', job?.id);
  console.error('Error:', error);
});
