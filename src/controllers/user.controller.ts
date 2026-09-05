import { Request, Response } from 'express';
import { getAllUsers } from '../services/user.service.js';

export const getUsers = async (
  req: Request,
  res: Response
): Promise<void> => {

  const data = await getAllUsers();

  res.status(200).json({
    success: true,
    data,
  });
};