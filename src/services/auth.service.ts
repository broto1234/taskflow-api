import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';

// Register
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Create hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Don't return the password, even the hashed password back to the client.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};


// Login
export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

  return {
    token,
  };
};


