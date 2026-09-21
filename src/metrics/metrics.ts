let requestCount = 0;

export const incrementRequestCount = () => {
  requestCount += 1;
};

export const getRequestCount = () => {
  return requestCount;
};

let requestDurations: number[] = [];

export const recordRequestDuration = (duration: number) => {
  requestDurations.push(duration);

  if (requestDurations.length > 1000) {
    requestDurations.shift();
  }
};

export const getAverageRequestDuration = () => {
  if (requestDurations.length === 0) {
    return 0;
  }

  const total = requestDurations.reduce(
    (sum, duration) => sum + duration,
    0,
  );

  return total / requestDurations.length;
};


export const getP95RequestDuration = () => {
  if (requestDurations.length === 0) {
    return 0;
  }

  const sortedDurations = [...requestDurations].sort(
    (a, b) => a - b,
  );

  const index = Math.ceil(
    sortedDurations.length * 0.95,
  ) - 1;

  return sortedDurations[index];
};

// --- Error tracking ----
let errorCount = 0;

export const incrementErrorCount = () => {
  errorCount += 1;
};

export const getErrorCount = () => {
  return errorCount;
};


// --- Client error tracking ----
let clientErrorCount = 0;

export const incrementClientErrorCount = () => {
  clientErrorCount += 1;
};

export const getClientErrorCount = () => {
  return clientErrorCount;
};

// --- Server error tracking ----
let serverErrorCount = 0;

export const incrementServerErrorCount = () => {
  serverErrorCount += 1;
};

export const getServerErrorCount = () => {
  return serverErrorCount;
};

// --- Active requests tracking ----
let activeRequests = 0;

export const incrementActiveRequests = () => {
  activeRequests += 1;
};

export const decrementActiveRequests = () => {
  activeRequests -= 1;
};

export const getActiveRequests = () => {
  return activeRequests;
};

// --- Success requests tracking ----
let successCount = 0;

export const incrementSuccessCount = () => {
  successCount += 1;
};

export const getSuccessCount = () => {
  return successCount;
};


// --- Redirect requests tracking ----
let redirectCount = 0;

export const incrementRedirectCount = () => {
  redirectCount += 1;
};

export const getRedirectCount = () => {
  return redirectCount;
};


// --- Request timestamps tracking ----
let requestTimestamps: number[] = [];

export const recordRequestTimestamp = (timestamp = Date.now()) => {
  
  const now = timestamp;
  
  const oneMinuteAgo = now - 60_000;

  requestTimestamps.push(now);

  requestTimestamps = requestTimestamps.filter(
    (timestamp) => timestamp >= oneMinuteAgo,
  );
};

export const getRequestsLastMinute = () => {
  const oneMinuteAgo = Date.now() - 60_000;

  return requestTimestamps.filter(
    (timestamp) => timestamp >= oneMinuteAgo,
  ).length;
};