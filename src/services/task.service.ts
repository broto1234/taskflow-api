import prisma from '../lib/prisma.js';
import { Prisma, TaskStatus, UserRole } from '../generated/prisma/client.js';
import { AppError } from '../errors/AppError.js';
import { TaskQuery } from '../schemas/pagination.schema.js';

export const getAllTasks = async (
  userId: number,
  query: TaskQuery
) => {
  
  const { page, limit, status, search, sortBy, order } = query;
  const skip = (page - 1) * limit;

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

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
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
  return await prisma.task.create({
    data: {
      title,
      userId,
      description,
      status,
    },
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

  return prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    },
  });
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

  return prisma.task.delete({
    where: {
      id: taskId,
    },
  });
};
