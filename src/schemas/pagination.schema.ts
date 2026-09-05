import { z } from 'zod';
import { TaskStatus } from '../generated/prisma/client.js';

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(5),

  status: z.enum(TaskStatus).optional(),

  search: z.string().trim().min(1).optional(),

  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt'),

  order: z.enum(['asc', 'desc']).default('desc'),  
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;