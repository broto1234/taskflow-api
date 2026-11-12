
# TaskFlow API

A production-ready REST API powering TaskFlow, a full-stack task management application.

Built with Node.js, Express, TypeScript, PostgreSQL, and Prisma, featuring secure authentication, role-based authorization, task management, automated testing, and comprehensive API documentation.

## 🚀 Live API

- **API Base URL:** [TaskFlow API](https://taskflow-api-c3hg.onrender.com)
- **API Documentation:** [Swagger UI](https://taskflow-api-c3hg.onrender.com/api-docs/)
- **Health Check:** [API Health](https://taskflow-api-c3hg.onrender.com/health)

## ✨ Key Features

- JWT authentication and role-based access control
- User registration and login
- Complete task CRUD operations
- Task ownership and authorization protection
- Admin-level permissions
- Request validation with Zod
- Centralized error handling
- PostgreSQL database with Prisma ORM
- Password hashing with bcrypt
- Security headers and rate limiting
- Structured logging with Pino
- Automated API testing with Vitest and Supertest
- Interactive Swagger/OpenAPI documentation


## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | JWT |
| Validation | Zod |
| Password Hashing | bcryptjs |
| Caching | Redis |
| Logging | Pino, pino-http |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Vitest, Supertest |
| API Documentation | Swagger / OpenAPI |
| Containerization | Docker (local Redis development) |
| Deployment | Render |

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* A PostgreSQL database (local or hosted, such as Neon)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/broto1234/taskflow-api.git
cd taskflow-api
npm install
```

### Environment Variables

Create a `.env` file in the project root using `.env.example` as a template:

```bash
cp .env.example .env
```

Configure the required variables:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
```

Do not commit your real `.env` file or any secrets to version control.

### Database

You can use either a local PostgreSQL instance or a hosted PostgreSQL database (such as Neon). Make sure your `DATABASE_URL` points to the correct database and that the database is accessible.

Run the Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client if needed:

```bash
npx prisma generate
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## API Documentation

Interactive Swagger documentation is available at `http://localhost:5000/api-docs`.

Swagger provides documentation and an interactive interface for testing the API endpoints.

Protected endpoints can be tested by authenticating through the login endpoint and using the returned JWT with the Swagger **Authorize** button.

## API Overview

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Authenticate a user |

### Tasks

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| GET    | `/api/tasks`     | Get the authenticated user's tasks |
| POST   | `/api/tasks`     | Create a task                      |
| GET    | `/api/tasks/:id` | Get a task                         |
| PUT    | `/api/tasks/:id` | Update a task                      |
| DELETE | `/api/tasks/:id` | Delete a task                      |

### Users

| Method | Endpoint     | Description                |
| ------ | ------------ | -------------------------- |
| GET    | `/api/users` | Get all users — Admin only |

## Authentication

TaskFlow API uses JSON Web Tokens (JWT) for authentication.

After successful login, the API returns a JWT:

```json
{
  "success": true,
  "data": {
    "token": "your-jwt-token"
  }
}
```

Include the token in protected requests:

```text
Authorization: Bearer <token>
```

User roles are included in the JWT and are used to enforce authorization rules.

## Authorization

The API supports two roles:

* `USER`
* `ADMIN`

Users can manage their own tasks, while administrators have elevated permissions where applicable.

Task ownership is enforced so users cannot access or modify another user's tasks.

## Validation and Error Handling

Request data is validated using Zod schemas.

The API also uses centralized error handling to provide consistent HTTP error responses for:

* Validation errors
* Authentication failures
* Authorization failures
* Missing resources
* Duplicate resources
* Unexpected server errors

## Security

The application includes several security measures:

* Helmet security headers
* CORS configuration
* JWT authentication
* Password hashing
* Request validation
* Global rate limiting
* Stricter rate limiting for login attempts
* Sensitive authorization headers excluded from request logs

## Testing

The project uses Vitest and Supertest for automated API testing.

The project includes automated tests covering authentication, users, tasks, rate limiting, validation, authorization, and error handling.

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## ☁️ Deployment

The TaskFlow API is deployed on **Render**, with **Neon PostgreSQL** providing the production database.

- Backend hosting: Render
- Production database: Neon PostgreSQL
- Environment configuration: Managed through deployment environment variables
- API health monitoring: `/health`
- Interactive API documentation: Swagger UI

Sensitive credentials and environment variables are not stored in the repository.


## 🌐 Related Project

TaskFlow is a full-stack application with a separate Next.js frontend.

- **Frontend Repository:** [TaskFlow Frontend](https://github.com/broto1234/taskflow-frontend)
- **Live Application:** [TaskFlow](https://taskflow-satyobroto.vercel.app)
- **System Architecture:** See the [Frontend Architecture Documentation](https://github.com/broto1234/taskflow-frontend/blob/main/ARCHITECTURE.md)