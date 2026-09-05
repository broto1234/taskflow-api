import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('POST /api/tasks', () => {
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
        email: 'john@exampleq.com',
        password: 'secret123',
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
        email: 'john@exampleq.com',
        password: 'secret123',
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
        email: 'john@exampleq.com',
        password: 'secret123',
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
    // Login as John (USER id 3)
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    // Task 6 belongs to another user
    const response = await request(app)
      .get('/api/tasks/6')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Task not found',
    });
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .put('/api/tasks/8')
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
      .put('/api/tasks/9')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated by owner',
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id', 9);
    expect(response.body.data.title).toBe('Updated by owner');
  });

  it('should return 403 when another USER tries to update someone else\'s task', async () => {
    // Login as another USER
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    // Try to update John's task
    const response = await request(app)
      .put('/api/tasks/9')
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
        email: 'satyo@gmail.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .put('/api/tasks/9')
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
      .put('/api/tasks/8')
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
      .delete('/api/tasks/9');

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required',
    });
  });

  // Option A. Create a task specifically for this test, then delete it
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

  // //Option B.  When deleted, next time this ID will not be found
  // it('should allow the owner to delete their own task', async () => {
  //   const loginResponse = await request(app)
  //     .post('/api/auth/login')
  //     .send({
  //       email: 'john@exampleq.com',
  //       password: 'secret123',
  //     });

  //   expect(loginResponse.status).toBe(200);

  //   const token = loginResponse.body.data.token;

  //   const response = await request(app)
  //     .delete('/api/tasks/8')
  //     .set('Authorization', `Bearer ${token}`);

  //   expect(response.status).toBe(200);

  //   expect(response.body).toEqual({
  //     success: true,
  //     message: 'Task with ID 8 has been deleted successfully.',
  //   });
  // });

  it('should return 403 when another USER tries to delete someone else\'s task', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .delete('/api/tasks/7')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: 'You are not allowed to delete this task',
    });
  });


  // Option A. Create a task specifically for this test, then delete it
  it('should allow ADMIN to delete another user\'s task', async () => {
    // 1. Login as John
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@exampleq.com',
        password: 'secret123',
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
        email: 'satyo@gmail.com',
        password: 'password123',
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

  // Option B. Delete a task by its ID
  // it('should allow ADMIN to delete another user\'s task', async () => {
  //   const loginResponse = await request(app)
  //     .post('/api/auth/login')
  //     .send({
  //       email: 'satyo@gmail.com',
  //       password: 'password123',
  //     });

  //   expect(loginResponse.status).toBe(200);

  //   const token = loginResponse.body.data.token;

  //   const response = await request(app)
  //     .delete('/api/tasks/2')
  //     .set('Authorization', `Bearer ${token}`);

  //   expect(response.status).toBe(200);

  //   expect(response.body).toEqual({
  //     success: true,
  //     message: 'Task with ID 2 has been deleted successfully.',
  //   });
  // });

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