import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../errors/AppError.js';
import multer from 'multer';
// import logger from '../lib/logger.js';

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // logger.error(error);
  
  // Application errors
  if (error instanceof AppError) {
    // logger.warn({
    //   statusCode: error.statusCode,
    //   message: error.message,
    // });

    const response: {
      success: false;
      message: string;
      errors?: unknown[];
    } = {
      success: false,
      message: error.message,
    };

    if (error.details) {
      response.errors = error.details;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Zod errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues,
    });
    return;
  }


  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {

    // Unique constraint violation
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
      });
      return;
    }

    // Record not found
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
  }

  // JWT errors
  if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token has expired',
    });
    return;
  }

  if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5 MB',
      });

      return;
    }
  }

  if (error instanceof Error && error.name === 'MulterFileTypeError') {
    res.status(400).json({
      success: false,
      message: error.message,
    });

    return;
  }

  // Unknown / unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};