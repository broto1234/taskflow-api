import pino from 'pino';

const logger = pino({
  level: 'info',
  base: null,
  timestamp: false,
});

export default logger;