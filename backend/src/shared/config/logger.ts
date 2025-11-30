/**
 * @fileoverview Pino logger configuration for structured logging.
 *
 * Features:
 * - JSON logging in production for log aggregation
 * - Pretty printing in development for readability
 * - Debug level in development, info level in production
 *
 * @module shared/config/logger
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/config/logger.ts
import pino from "pino";
import { env } from "./env.js";

/**
 * Configured Pino logger instance.
 * Uses pretty printing in development, JSON in production.
 */
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});
