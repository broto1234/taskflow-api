import { Router } from 'express';
import { getUsers } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { UserRole } from '../generated/prisma/client.js';

const userRouter = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: You do not have permission to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Only authenticated admins can reach the controller.
userRouter.get('/', authMiddleware, requireRole(UserRole.ADMIN), getUsers);

export default userRouter;