import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app.js';
import { createTestUsers,TEST_USERS } from './fixtures/user.fixture.js';

describe('/api/tasks', async() => {
  let johnUserId: number;
  let otherUserId: number;
  let adminUserId: number;
  let johnTaskId: number;
  let otherUserTaskId: number;

  const { john, otherUser, admin } = await createTestUsers();

  johnUserId = john.id;
  otherUserId = otherUser.id;
  adminUserId = admin.id;

  beforeAll(async () => {
    await prisma.task.deleteMany({
      where: {
        user: {
          email: {
            in: [
              TEST_USERS.john.email,
              TEST_USERS.otherUser.email,
              TEST_USERS.admin.email,
            ],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            TEST_USERS.john.email,
            TEST_USERS.otherUser.email,
            TEST_USERS.admin.email,
          ],
        },
      },
    });

    const password = await bcrypt.hash('secret123', 10);
    const adminPassword = await bcrypt.hash('password123', 10);

    const john = await prisma.user.create({
      data: {
        name: 'John Primary',
        email: 'john@exampleq.com',
        password,
        role: 'USER',
      },
    });

    const otherUser = await prisma.user.create({
      data: {
        name: 'John Secondary',
        email: 'john@example.com',
        password,
        role: 'USER',
      },
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Satyo',
        email: 'satyo@gmail.com',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    johnUserId = john.id;
    otherUserId = otherUser.id;
    adminUserId = admin.id;

    const johnTask = await prisma.task.create({
      data: {
        title: 'John test task',
        userId: johnUserId,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Completed test task',
        status: 'COMPLETED',
        userId: johnUserId,
      },
    });

    const otherUserTask = await prisma.task.create({
      data: {
        title: 'Other user test task',
        userId: otherUserId,
      },
    });

    johnTaskId = johnTask.id;
    otherUserTaskId = otherUserTask.id;
  });

  afterAll(async () => {
  await prisma.task.deleteMany({
    where: {
      user: {
        email: {
          in: [
            'john@exampleq.com',
            'john@example.com',
            'satyo@gmail.com',
          ],
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'john@exampleq.com',
          'john@example.com',
          'satyo@gmail.com',
        ],
      },
    },
  });
});

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test task',
        description: 'Testing task creation',
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });

  it('should create a task when a valid token is provided', async () => {
    // 1. Login as USER
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.john.email,
        password: TEST_USERS.john.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    expect(token).toBeDefined();

    // 2. Create task
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test task',
        description: 'Created by integration test',
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveProperty('id');

    expect(response.body.data.title).toBe('Test task');
  });

  it('should return 400 when title is missing', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.john.email,
        password: TEST_USERS.john.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Task without a title',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toBeDefined();
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/tasks/1');

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });

  it('should return 400 when the task ID is invalid', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.john.email,
        password: TEST_USERS.john.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks/abc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });

  it('should return 404 when the task does not exist', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks/999999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Task not found',
    });
  });

  it('should return 404 when a user tries to access another user\'s task', async () => {
    // Login as John
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.john.email,
        password: TEST_USERS.john.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    // Task belongs to another user
    const response = await request(app)
      .get(`/api/tasks/${otherUserTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Task not found',
    });
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .put(`/api/tasks/${johnTaskId}`)
      .send({
        title: 'Updated task',
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });

  it('should allow the owner to update their own task', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .put(`/api/tasks/${johnTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated by owner',
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id', johnTaskId);
    expect(response.body.data.title).toBe('Updated by owner');
  });

  it('should paginate tasks', async () => {
        const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(2);
    expect(response.body.data.tasks.length).toBeLessThanOrEqual(2);
  });

  it('should filter tasks by status', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks?status=COMPLETED')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(
      response.body.data.tasks.every(
        (task: { status: string }) => task.status === 'COMPLETED'
      )
    ).toBe(true);
  });

  it('should search tasks by title', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks?search=Completed')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.tasks.length).toBeGreaterThan(0);

    expect(
      response.body.data.tasks.every(
        (task: { title: string }) =>
          task.title.toLowerCase().includes('completed')
      )
    ).toBe(true);
  });

  it('should sort tasks by title in ascending order', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks?sortBy=title&order=asc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    const tasks = response.body.data.tasks;

    for (let i = 1; i < tasks.length; i++) {
      expect(
        tasks[i - 1].title.localeCompare(tasks[i].title)
      ).toBeLessThanOrEqual(0);
    }
  });

  it('should return 400 when pagination limit is invalid', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get('/api/tasks?limit=101')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });

  it('should return 403 when another USER tries to update someone else\'s task', async () => {
    // Login as another USER
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.otherUser.email,
        password: TEST_USERS.otherUser.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    // Try to update John's task
    const response = await request(app)
      .put(`/api/tasks/${johnTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Unauthorized update',
      });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: 'You are not allowed to modify this task',
    });
  });

  it('should allow ADMIN to update someone else\'s task', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .put(`/api/tasks/${johnTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Admin updated task',
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Admin updated task');
  });

  it('should return 400 when updating a task with invalid data', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .put(`/api/tasks/${johnTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should return 404 when updating a task that does not exist', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .put('/api/tasks/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated title',
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Task not found',
    });
  });

  // DELETE /api/tasks/:id — delete a task
  it('should return 401 when deleting a task without authentication', async () => {
    const response = await request(app)
      .delete(`/api/tasks/${johnTaskId}`);

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });

  // Create a task specifically for this test, then delete it
  it('should allow the owner to delete their own task', async () => {
    // 1. Login as John
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    // 2. Create a task specifically for this test
    const createResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Task created for delete test',
        description: 'This task will be deleted',
      });

    expect(createResponse.status).toBe(201);

    const taskId = createResponse.body.data.id;

    expect(taskId).toBeDefined();

    // 3. Delete the newly created task
    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: `Task with ID ${taskId} has been deleted successfully.`,
    });
  });

  it('should return 403 when another USER tries to delete someone else\'s task', async () => {
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.otherUser.email,
        password: TEST_USERS.otherUser.password,
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .delete(`/api/tasks/${johnTaskId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: 'You are not allowed to delete this task',
    });
  });


  // Create a task specifically for this test, then delete it
  it('should allow ADMIN to delete another user\'s task', async () => {
    // 1. Login as John
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.john.email,
        password: TEST_USERS.john.password,
      });

    expect(userLoginResponse.status).toBe(200);

    const userToken = userLoginResponse.body.data.token;

    // 2. John creates a task
    const createResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task for ADMIN delete test',
        description: 'ADMIN will delete this task',
      });

    expect(createResponse.status).toBe(201);

    const taskId = createResponse.body.data.id;

    expect(taskId).toBeDefined();

    // 3. Login as ADMIN
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      });

    expect(adminLoginResponse.status).toBe(200);

    const adminToken = adminLoginResponse.body.data.token;

    // 4. ADMIN deletes John's task
    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: `Task with ID ${taskId} has been deleted successfully.`,
    });
  });

  it('should return 404 when deleting a task that does not exist', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'satyo@gmail.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .delete('/api/tasks/99')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Task not found',
    });
  });
});