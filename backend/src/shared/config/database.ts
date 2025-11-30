import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection failed");
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "❌ MongoDB error");
});

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
