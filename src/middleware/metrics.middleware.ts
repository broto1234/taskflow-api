import type { Request, Response, NextFunction } from 'express';
import { incrementErrorCount, incrementClientErrorCount, incrementRequestCount, recordRequestDuration, incrementActiveRequests, decrementActiveRequests, incrementSuccessCount, incrementRedirectCount,
  incrementServerErrorCount, recordRequestTimestamp,} from '../metrics/metrics.js';

export const metricsMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    recordRequestDuration(duration);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      incrementSuccessCount();
    }

    if (res.statusCode >= 300 && res.statusCode < 400) {
      incrementRedirectCount();
    }

    if (res.statusCode >= 400) {
      incrementErrorCount();
    }

    if (res.statusCode >= 400 && res.statusCode < 500) {
      incrementClientErrorCount();
    }

    if (res.statusCode >= 500) {
      incrementServerErrorCount();
    } 

    decrementActiveRequests();
  });

  incrementRequestCount();
  incrementActiveRequests();
  recordRequestTimestamp();
  next();
};