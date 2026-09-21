import prisma from '../lib/prisma.js';
import redis from '../lib/redis.js';

export const checkDatabase = async () => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Database health check timeout')),
          1000,
        ),
      ),
    ]);

    return true;
  } catch {
    return false;
  }
};

export const checkRedis = async () => {
  if (!redis.isReady) {
    return false;
  }

  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};