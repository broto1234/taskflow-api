import type { Request, Response } from 'express';
import {
  checkDatabase,
  checkRedis,
} from '../services/health.service.js';

export const healthCheck = async (
  _req: Request,
  res: Response,
) => {
  const databaseHealthy = await checkDatabase();
  const redisHealthy = await checkRedis();

  const healthy = databaseHealthy && redisHealthy;

  if (!healthy) {
    return res.status(503).json({
      status: 'ERROR',
      database: databaseHealthy ? 'OK' : 'ERROR',
      redis: redisHealthy ? 'OK' : 'ERROR',
    });
  }

  return res.status(200).json({
    status: 'OK',
    database: 'OK',
    redis: 'OK',
  });
};