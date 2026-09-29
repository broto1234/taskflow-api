import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service.js';
import { emailQueue } from '../queues/email.queue.js';
import { requestPasswordReset, resetPassword, } from '../services/password-reset.service.js';

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  
  const { name, email, password } = req.body;
  
  const data = await registerUser( name, email, password);

  await emailQueue.add('sendWelcomeEmail', {
    email,
    name,
  });

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

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const resetToken = await requestPasswordReset(email);

  if (resetToken) {
    await emailQueue.add('sendPasswordResetEmail', {
      email,
      token: resetToken.token,
    });
  }

  res.status(200).json({
    success: true,
    message: 'If the account exists, a password reset email has been sent.',
  });
};

export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  await resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully.',
  });
};