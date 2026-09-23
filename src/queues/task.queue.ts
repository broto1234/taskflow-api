import { Queue } from 'bullmq';


const redisUrl = new URL(process.env.REDIS_URL!);

export const taskQueue = new Queue('taskQueue', {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
  },
});