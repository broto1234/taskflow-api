import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const redisMock = vi.hoisted(() => ({
  isOpen: true,
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  scanIterator: vi.fn(),
}));

vi.mock('../lib/redis.js', () => ({
  default: redisMock,
}));

import {
  getCache,
  setCache,
  deleteCache,
  deleteUserTaskCache,
} from '../lib/cache.js';

describe('Cache service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisMock.isOpen = true;
  });

  it('gets a cached value when Redis is connected', async () => {
    redisMock.get.mockResolvedValue('cached-task-data');

    const result = await getCache('tasks:user:1');

    expect(redisMock.get).toHaveBeenCalledWith('tasks:user:1');
    expect(result).toBe('cached-task-data');
  });

  it('returns null when Redis is disconnected', async () => {
    redisMock.isOpen = false;

    const result = await getCache('tasks:user:1');

    expect(redisMock.get).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('sets a cached value when Redis is connected', async () => {
    await setCache('tasks:user:1', 'task-data', 300);

    expect(redisMock.set).toHaveBeenCalledWith(
      'tasks:user:1',
      'task-data',
      { EX: 300 },
    );
  });

  it('does not set a value when Redis is disconnected', async () => {
    redisMock.isOpen = false;

    await setCache('tasks:user:1', 'task-data', 300);

    expect(redisMock.set).not.toHaveBeenCalled();
  });

  it('deletes a cache key when Redis is connected', async () => {
    await deleteCache('tasks:user:1');

    expect(redisMock.del).toHaveBeenCalledWith('tasks:user:1');
  });

  it('does not delete a cache key when Redis is disconnected', async () => {
    redisMock.isOpen = false;

    await deleteCache('tasks:user:1');

    expect(redisMock.del).not.toHaveBeenCalled();
  });

  it('does not delete anything when no matching cache keys exist', async () => {
    redisMock.scanIterator.mockImplementation(async function* () {
      // No keys found
    });

    await deleteUserTaskCache(1);

    expect(redisMock.del).not.toHaveBeenCalled();
  });

  it('deletes all task cache keys for a user', async () => {
    redisMock.scanIterator.mockImplementation(async function* () {
      yield 'tasks:user:1:page:1';
      yield 'tasks:user:1:page:2';
    });

    await deleteUserTaskCache(1);

    expect(redisMock.scanIterator).toHaveBeenCalledWith({
      MATCH: 'tasks:user:1:*',
      COUNT: 100,
    });

    expect(redisMock.del).toHaveBeenCalledWith([
      'tasks:user:1:page:1',
      'tasks:user:1:page:2',
    ]);
  });

  it('does not scan or delete keys when Redis is disconnected', async () => {
    redisMock.isOpen = false;

    await deleteUserTaskCache(1);

    expect(redisMock.scanIterator).not.toHaveBeenCalled();
    expect(redisMock.del).not.toHaveBeenCalled();
  });

});
