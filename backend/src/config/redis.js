import { env } from "./env.js";

// Placeholder Redis client wiring.
export function createRedisClient() {
  console.log(`[redis] (mock) connecting to ${env.redisUrl}`);
  return {
    publish: () => {},
    subscribe: () => {},
    quit: () => {}
  };
}
