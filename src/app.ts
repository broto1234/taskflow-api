import express from 'express';
import taskRouter from './routes/task.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import { errorHandler } from './middleware/error.middleware.js';
import { pinoHttp } from 'pino-http';
import logger from './lib/logger.js';
import cors from 'cors';
import helmet from 'helmet';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import taskAttachmentRouter from './routes/task-attachment.route.js';
import paymentRouter from './routes/payment.route.js';
import healthRouter from './routes/health.route.js';
import { metricsMiddleware } from './middleware/metrics.middleware.js';
import metricsRouter from './routes/metrics.route.js';

const app = express();  // Create an Express application instance

app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
);

app.use(express.json());  // Middleware to parse JSON request bodies

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://taskflow-satyobroto.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use(metricsMiddleware); 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/', (_req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TaskFlow API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f7fb;
            color: #1e293b;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            max-width: 480px;
            width: calc(100% - 48px);
            box-sizing: border-box;
          }
          h1 {
            color: #2563eb;
          }
          p {
            color: #64748b;
            line-height: 1.6;
          }
          a {
            display: block;
            margin: 16px 0;
            padding: 12px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          }
          a:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <main class="container">
          <h1>Welcome to TaskFlow API</h1>
          <p>Your task management API is up and running.</p>
          <a href="/api-docs/">View API Documentation</a>
          <a href="/health">Check API Health</a>
        </main>
      </body>
    </html>
  `);
});


app.use('/health', healthRouter);  // Health check endpoint

app.use('/metrics', metricsRouter);

// Mount the routers for different routes
app.use('/api/tasks', taskRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/tasks', taskAttachmentRouter);
app.use('/api/payments', paymentRouter);

app.use(errorHandler);

export default app;