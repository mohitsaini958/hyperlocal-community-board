// config/redis.js

import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL, // Example: redis://localhost:6379
});

// Successful connection
redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

// Error handling
redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

// Reconnecting log
redisClient.on("reconnecting", () => {
  console.log("🔄 Reconnecting to Redis...");
});

// Connect function
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log("Redis connection failed:", error);
  }
};