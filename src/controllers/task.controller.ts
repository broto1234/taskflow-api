import { Request, Response } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task.service.js';
import { TaskQuery } from '../schemas/pagination.schema.js';
import { AppError } from '../errors/AppError.js';
import type { TaskIdParams } from '../schemas/task.schema.js';
import { taskQueue } from '../queues/task.queue.js';

// GET /api/tasks
export const getTasks = async (
  req: Request,
  res: Response
): Promise<void> => {

  const userId = req.userId!;

  const query = req.validated!.query as TaskQuery;

  const data = await getAllTasks(
    userId,
    query
  );

  res.status(200).json({
    success: true,
    data,
  });
};

// GET /api/tasks/:id
export const getTask = async (
  req: Request,
  res: Response
): Promise<void> => {

  const userId = req.userId!;

  const { id: taskId } = req.validated!.params as TaskIdParams;

  // const taskId = Number(req.params.id);

  // if (Number.isNaN(taskId)) {
  //   throw new AppError('Invalid task ID', 400);
  // }

  const data = await getTaskById(taskId, userId);

  if (!data) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    data,
  });
};

// POST /api/tasks
export const addTask = async (
  req: Request,
  res: Response
): Promise<void> => {

  const { title, description, status } = req.body;

  const userId = req.userId!;

  const data = await createTask(title, userId, description, status);

  await taskQueue.add('processTask', {
    taskId: data.id,
    userId,
  });
  
  res.status(201).json({
    success: true,
    data,
  });
};


// Edit a task - PUT /api/tasks/:id
export const editTask = async (
  req: Request,
  res: Response
): Promise<void> => {

  const userId = req.userId!;
  const userRole = req.userRole!;
  
  const { id: taskId } = req.validated!.params as TaskIdParams;

  const { title, description, status } = req.body;

  const data = await updateTask(taskId, userId, title, description, status, userRole);

  res.status(200).json({
    success: true,
    data,
  });
};


// DELETE /api/tasks/:id
export const removeTask = async (
  req: Request,
  res: Response
): Promise<void> => {

  const userId = req.userId!;
  const userRole = req.userRole!;

  const { id: taskId } = req.validated!.params as TaskIdParams;

  await deleteTask(taskId, userId, userRole);

  res.status(200).json({
    success: true,
    message: `Task with ID ${taskId} has been deleted successfully.`,
  })

}