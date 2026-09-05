import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { UserRole } from '../generated/prisma/client.js';
import { AppError } from '../errors/AppError.js';
import { jwtPayloadSchema } from '../schemas/auth.schema.js';
import { env } from '../config/env.js';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {

  // 1. Get Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Authentication required', 401);
  }

  // 2. Extract Bearer token
  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  // 3. Verify JWT
   try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const result = jwtPayloadSchema.safeParse(decoded);

    if (!result.success) {
      throw new AppError('Invalid or expired token', 401);
    }

    const payload = result.data;

    // 4. Put authenticated user information on request
    req.userId = payload.userId;
    req.userRole = payload.role;

    // 5. Continue to controller
    next();
  } catch {
     throw new AppError('Invalid or expired token', 401);
  }
};