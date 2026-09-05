import { z } from 'zod';
import { TaskStatus } from '../generated/prisma/client.js';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),

  description: z.string().max(500, 'Description must be 500 characters or less').optional(),

  status: z.enum(TaskStatus).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;


export type CreateTaskData = CreateTaskDto & {
  userId: number;
};

export const taskIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TaskIdParams = z.infer<typeof taskIdSchema>;

export const updateTaskSchema = createTaskSchema.partial().extend({
  completed: z.boolean().optional()
});