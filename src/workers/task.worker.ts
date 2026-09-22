import { Worker } from 'bullmq';
import prisma from '../lib/prisma.js';

export const taskWorker = new Worker(
  'taskQueue',
  async (job) => {
    console.log('Starting job:', job.name);
    console.log('Task ID:', job.data.taskId);

    // Fetch the task from the database
    const task = await prisma.task.findUnique({
      where: {
        id: job.data.taskId,
      },
    });

    console.log('Task from database:', task);

    await prisma.auditLog.create({
      data: {
        action: 'TASK_CREATED',
        taskId: job.data.taskId,
        userId: job.data.userId,
      },
    });

    console.log('Audit log created');
  },
  {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  },
);

taskWorker.on('failed', (job, error) => {
  console.error('Job failed:', job?.id);
  console.error('Error:', error);
});