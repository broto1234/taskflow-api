import app from './app.js';
import { env } from './config/env.js';
import redis from './lib/redis.js';

await redis.connect();

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});