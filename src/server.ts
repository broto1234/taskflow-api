import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import redis from './lib/redis.js';
import { createWebSocketServer } from './websocket.js';

await redis.connect();

// Start the server
const PORT = env.PORT;

const server = http.createServer(app);

const wss = createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});