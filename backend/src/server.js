import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { createRedisClient } from "./config/redis.js";
import { logger } from "./utils/logger.js";

async function start() {
  await connectDatabase();
  createRedisClient();

  const app = createApp();
  app.listen(env.port, () => logger.info(`[api] listening on http://localhost:${env.port}`));
}

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
