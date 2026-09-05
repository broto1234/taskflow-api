import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/AppError.js';

type RequestPart = 'body' | 'query' | 'params';

export const validate = (
  schema: z.ZodType,
  part: RequestPart = 'body'
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      throw new AppError('Validation failed', 400, result.error.issues);
    }

    if (!req.validated) {
      req.validated = {};
    }

    req.validated[part] = result.data;

    next();
  };
};