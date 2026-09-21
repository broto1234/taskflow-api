// Unit testing

import { describe, it, expect } from 'vitest';
import {
  incrementRequestCount,
  getRequestCount,
  recordRequestTimestamp,
  getRequestsLastMinute,
  recordRequestDuration,
  getAverageRequestDuration,
  getP95RequestDuration,
  incrementErrorCount,
  getErrorCount,
  incrementActiveRequests,
  decrementActiveRequests,
  getActiveRequests,
  incrementSuccessCount,
  getSuccessCount,
  incrementRedirectCount,
  getRedirectCount,
  incrementClientErrorCount,
  getClientErrorCount,
} from '../metrics/metrics.js';

describe('Metrics', () => {
  it('should count requests', () => {
    const before = getRequestCount();

    incrementRequestCount();

    expect(getRequestCount()).toBe(before + 1);
  });

  it('should count requests from the last minute', () => {
    const before = getRequestsLastMinute();

    recordRequestTimestamp();

    expect(getRequestsLastMinute()).toBe(before + 1);
  });

  it('should ignore requests older than one minute', () => {
    const oldTimestamp = Date.now() - 120_000;

    const before = getRequestsLastMinute();

    recordRequestTimestamp(oldTimestamp);

    expect(getRequestsLastMinute()).toBe(before);
  });

  it('should calculate average request duration', () => {
    recordRequestDuration(100);
    recordRequestDuration(200);

    expect(getAverageRequestDuration()).toBe(150);
  });

  it('should calculate p95 request duration', () => {
    recordRequestDuration(100);
    recordRequestDuration(200);
    recordRequestDuration(300);
    recordRequestDuration(400);
    recordRequestDuration(500);

    expect(getP95RequestDuration()).toBe(500);
  });

  it('should count errors', () => {
    const before = getErrorCount();

    incrementErrorCount();

    expect(getErrorCount()).toBe(before + 1);
  });

  it('should track active requests', () => {
    const before = getActiveRequests();

    incrementActiveRequests();

    expect(getActiveRequests()).toBe(before + 1);

    decrementActiveRequests();

    expect(getActiveRequests()).toBe(before);
  });

  it('should count successful requests', () => {
    const before = getSuccessCount();

    incrementSuccessCount();

    expect(getSuccessCount()).toBe(before + 1);
  });

  it('should count redirects', () => {
    const before = getRedirectCount();

    incrementRedirectCount();

    expect(getRedirectCount()).toBe(before + 1);
  });

  it('should count client errors', () => {
    const before = getClientErrorCount();

    incrementClientErrorCount();

    expect(getClientErrorCount()).toBe(before + 1);
  });

});

