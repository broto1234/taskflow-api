import { Queue } from 'bullmq';

export const taskQueue = new Queue('taskQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});