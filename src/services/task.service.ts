import prisma from '../lib/prisma.js';
import { Prisma, TaskStatus, UserRole } from '../generated/prisma/client.js';
import { AppError } from '../errors/AppError.js';
import { TaskQuery } from '../schemas/pagination.schema.js';
import { getCache, setCache, deleteUserTaskCache } from '../lib/cache.js';

export const getAllTasks = async (
  userId: number,
  query: TaskQuery
) => {
  
  const { page, limit, status, search, sortBy, order } = query;
  const skip = (page - 1) * limit;

  const cacheKey = `tasks:user:${userId}:page:${page}:limit:${limit}:status:${status ?? 'all'}:search:${search ?? 'none'}:sortBy:${sortBy}:order:${order}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const where: Prisma.TaskWhereInput = {
    userId,
    ...(status !== undefined && { status }),
    ...(search !== undefined && {
    title: {
      contains: search,
      mode: 'insensitive',
    },
  }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),

    prisma.task.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const result = {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  await setCache(cacheKey, JSON.stringify(result), 60);

  return result;
};


export const getTaskById = async (
  id: number,
  userId: number
) => {
  return await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });
};


export const createTask = async (
  title: string,
  userId: number,
  description?: string,
  status?: TaskStatus,
) => {
  const task = await prisma.task.create({
    data: {
      title,
      userId,
      description,
      status,
    },
  });

  await deleteUserTaskCache(userId);

  return task;
};

export const createTaskWithAudit = async (
  title: string,
  userId: number,
  description?: string,
  status?: TaskStatus,
) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title,
        userId,
        description,
        status,
      },
    });

    await tx.auditLog.create({
      data: {
        action: 'TASK_CREATED',
        taskId: task.id,
        userId,
      },
    });

    return task;
  });
};


export const updateTask = async (
  taskId: number,
  userId: number,
  title?: string,
  description?: string,
  status?: TaskStatus,
  userRole?: UserRole,
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // **** Authorization check -  owner and admin can update ****
  if (task.userId !== userId &&
    userRole !== UserRole.ADMIN) {
    throw new AppError('You are not allowed to modify this task', 403);
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    },
  });

  await deleteUserTaskCache(task.userId);

  return updatedTask;
};


export const deleteTask = async (
  taskId: number,
  userId: number,
  userRole: UserRole,
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Owner OR ADMIN can delete
  if (
    task.userId !== userId &&
    userRole !== UserRole.ADMIN
  ) {
    throw new AppError('You are not allowed to delete this task', 403);
  }

  const deletedTask = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  await deleteUserTaskCache(task.userId);

  return deletedTask;
};
