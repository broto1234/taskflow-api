import type { Request, Response } from 'express';
import {
  getRequestCount,
  getAverageRequestDuration,
  getP95RequestDuration,
  getErrorCount,
  getClientErrorCount,
  getActiveRequests,
  getSuccessCount,
  getRedirectCount,
  getServerErrorCount,
  getRequestsLastMinute,
} from '../metrics/metrics.js';

export const getMetrics = (
  _req: Request,
  res: Response,
) => {
  return res.status(200).json({
    requests: getRequestCount(),
    success: getSuccessCount(),
    redirects: getRedirectCount(),
    errors: getErrorCount(),
    clientErrors: getClientErrorCount(),
    serverErrors: getServerErrorCount(),
    activeRequests: getActiveRequests(),
    averageDuration: getAverageRequestDuration(),
    p95Duration: getP95RequestDuration(),
    requestsLastMinute: getRequestsLastMinute(),
  });
};