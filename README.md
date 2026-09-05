# TaskFlow API

A production-minded REST API for task management, built with TypeScript, Express, PostgreSQL, and Prisma.

TaskFlow API provides secure user authentication, role-based authorization, task management, validation, structured error handling, rate limiting, logging, automated testing, and interactive OpenAPI documentation.

## Features

* User registration and login
* JWT-based authentication
* Role-based access control (`USER` / `ADMIN`)
* Create, read, update, and delete tasks
* Task ownership protection
* Admin-level task management
* Password hashing with bcrypt
* Request validation with Zod
* Centralized error handling
* PostgreSQL database with Prisma ORM
* Security headers with Helmet
* CORS configuration
* Global and login-specific rate limiting
* HTTP request logging with Pino
* Automated API tests with Vitest and Supertest
* Interactive Swagger/OpenAPI documentation

## Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript
* **Framework:** Express
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JWT
* **Validation:** Zod
* **Password Hashing:** bcryptjs
* **Logging:** Pino / pino-http
* **Security:** Helmet, CORS, express-rate-limit
* **Testing:** Vitest, Supertest
* **API Documentation:** Swagger / OpenAPI

## Project Structure

```text
src/
├── config/          # Environment and Swagger configuration
├── controllers/     # HTTP request/response handling
├── errors/          # Application error definitions
├── lib/             # Prisma and logger setup
├── middleware/      # Authentication, validation, errors, roles, rate limiting
├── routes/          # API route definitions
├── schemas/         # Zod validation schemas
├── services/        # Business logic
├── tests/           # Automated API tests
├── types/           # TypeScript type declarations
├── generated/       # Generated Prisma client
├── app.ts           # Express application configuration
└── server.ts        # Application entry point
```

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* PostgreSQL
* npm

### Installation

Clone the repository and install dependencies:

```bash
git clone <your-repository-url>
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

Make sure PostgreSQL is running and your `DATABASE_URL` points to the correct database.

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

Current test suite:

```text
4 test files
40 tests
40 passing
```

## Development Philosophy

TaskFlow API was built with a focus on:

* Clear separation of responsibilities
* Secure authentication and authorization
* Input validation
* Consistent error handling
* Testable application logic
* Practical API documentation
* Maintainable project structure

The project intentionally avoids unnecessary complexity while demonstrating common patterns used in modern TypeScript backend development.

## License

This project is licensed under the MIT License.