import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';

export async function createPasswordResetToken(userId: number) {
  const token = crypto.randomBytes(32).toString('hex');

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return resetToken;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return;
  }

  return createPasswordResetToken(user.id);
}


export async function resetPassword(
  token: string,
  newPassword: string,
) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      token,
    },
  });

  if (!resetToken) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (resetToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: resetToken.userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.passwordResetToken.delete({
    where: {
      id: resetToken.id,
    },
  });
}