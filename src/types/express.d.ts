import { UserRole } from '../generated/prisma/client.js';
import type { PaginationQuery } from '../schemas/pagination.schema.js';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: UserRole;
      validated?: Record<string, unknown>;
    }
  }
}

export {};