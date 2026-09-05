import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service.js';

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  
  const { name, email, password } = req.body;
  
  const data = await registerUser( name, email, password);

    res.status(201).json({
      success: true,
      data,
    });
};


export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  
  const { email, password } = req.body;
  
  const data = await loginUser(email, password);

    res.status(200).json({
      success: true,
      data,
    });
};