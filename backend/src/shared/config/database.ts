/**
 * @fileoverview MongoDB connection management using Mongoose.
 *
 * Provides functions for:
 * - Establishing database connection at startup
 * - Graceful disconnection during shutdown
 * - Connection event handling and logging
 *
 * @module shared/config/database
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/config/database.ts
import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * Establishes connection to MongoDB using the configured URI.
 * Exits the process if connection fails.
 *
 * @throws Will exit process with code 1 if connection fails
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection failed");
    process.exit(1);
  }
}

// Connection event handlers for monitoring
mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "❌ MongoDB error");
});

/**
 * Gracefully disconnects from MongoDB.
 * Should be called during application shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
