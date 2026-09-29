import { Queue } from 'bullmq';

const redisUrl = new URL(process.env.REDIS_URL!);

export const emailQueue = new Queue('emailQueue', {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
  },
});