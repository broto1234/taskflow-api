import redis from './redis.js';

export const getCache = async (key: string) => {
  if (!redis.isOpen) {
    return null;
  }

  return await redis.get(key);
};

export const setCache = async (
  key: string,
  value: string,
  ttlSeconds: number,
) => {
  if (!redis.isOpen) {
    return;
  }

  await redis.set(key, value, {
    EX: ttlSeconds,
  });
};

export const deleteCache = async (key: string) => {
  if (!redis.isOpen) {
    return;
  }

  await redis.del(key);
};

export const deleteUserTaskCache = async (userId: number) => {
  if (!redis.isOpen) {
    return;
  }

    const pattern = `tasks:user:${userId}:*`;
  const keys: string[] = [];

  for await (const key of redis.scanIterator({
    MATCH: pattern,
    COUNT: 100,
  })) {
    keys.push(String(key));
  }


  if (keys.length > 0) {
    await redis.del(keys);
  }
};