import { z } from 'zod';
import { UserRole } from '../generated/prisma/client.js';

// Register schema + TypeScript
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),

  email: z
    .email({
      error: "Invalid email address",
    }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export type CreateUser = z.infer<typeof registerSchema>;


// Login schema + TypeScript
export const loginSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),

  password: z
    .string()
    .min(1, {
      error: "Password is required",
    }),
});

export type LoginUser = z.infer<typeof loginSchema>;


// JWT payload schema + TypeScript
export const jwtPayloadSchema = z.object({
  userId: z.number(),
  role: z.enum(UserRole),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;