import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'REST API for managing users, authentication, and tasks',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 7,
            },
            title: {
              type: 'string',
              example: 'Learn TypeScript',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Finish the backend project',
            },
            status: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'DONE'],
              example: 'TODO',
            },
            userId: {
              type: 'integer',
              example: 3,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              example: 'Learn TypeScript',
            },
            description: {
              type: 'string',
              example: 'Finish the backend project',
            },
            status: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'DONE'],
              example: 'TODO',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 3,
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-09-03T21:10:45.619Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-09-03T21:10:45.619Z',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        UserWithRole: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 2,
            },
            name: {
              type: 'string',
              example: 'Satyo',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'satyo@gmail.com',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'ADMIN',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-25T16:12:16.232Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-08-25T16:12:16.232Z',
            },
          },
        },
        UserListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserWithRole',
              },
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              example: 'Updated task title',
            },
            description: {
              type: 'string',
              example: 'Updated description',
            },
            status: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'DONE'],
              example: 'IN_PROGRESS',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@exampleq.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'secret123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'secret123',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
