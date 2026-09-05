import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { AppError } from '../errors/AppError.js';

export const requireRole = (role: UserRole) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    
    const userRole = req.userRole;

    if (!userRole) {
      throw new AppError('User role not found in request', 401);
    }
      
    if (userRole !== role) {
      throw new AppError('You do not have permission to access this resource', 403);
    }

    next();
  };
};

// Q. Why don't we check userId here?

// Because authentication already happened.