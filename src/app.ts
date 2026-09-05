import express from 'express';
import taskRouter from './routes/task.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import { errorHandler } from './middleware/error.middleware.js';
import {pinoHttp} from 'pino-http';
import logger from './lib/logger.js';
import cors from 'cors';
import helmet from 'helmet';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();  // Create an Express application instance

app.use(express.json());  // Middleware to parse JSON request bodies

app.use(
  cors({
  origin: 'http://localhost:3000',
  })
);

app.use(globalLimiter);

app.use(helmet());  // Middleware to set various HTTP headers for security

// Middleware for logging HTTP requests using Pino
app.use(pinoHttp({ 
  logger,
  // autoLogging: process.env.NODE_ENV !== 'test',
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  redact: [
      'req.headers.authorization',
      'req.headers.cookie',
    ],
  })
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount the routers for different routes
app.use('/api/tasks', taskRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use(errorHandler);

export default app;