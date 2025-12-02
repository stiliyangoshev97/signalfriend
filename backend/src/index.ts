/**
 * @fileoverview Main entry point for the SignalFriend backend server.
 *
 * This file sets up and configures the Express application with:
 * - Security middleware (Helmet, CORS)
 * - Rate limiting (general + auth-specific)
 * - Body parsing and cookie parsing
 * - API routes (auth, webhooks, categories)
 * - Health check endpoint
 * - Error handling and 404 handler
 * - Graceful shutdown handling
 *
 * @module index
 */
import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./shared/config/env.js";
import { logger } from "./shared/config/logger.js";
import { connectDatabase, disconnectDatabase } from "./shared/config/database.js";
import { securityMiddleware, corsMiddleware } from "./shared/middleware/security.js";
import { rateLimiter } from "./shared/middleware/rateLimiter.js";
import { maintenanceMode } from "./shared/middleware/maintenance.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/errorHandler.js";
import { authRoutes } from "./features/auth/auth.routes.js";
import { webhookRoutes } from "./features/webhooks/webhook.routes.js";
import { categoryRoutes } from "./features/categories/category.routes.js";
import { predictorRoutes } from "./features/predictors/predictor.routes.js";
import { signalRoutes } from "./features/signals/signal.routes.js";
import { receiptRoutes } from "./features/receipts/receipt.routes.js";
import { reviewRoutes } from "./features/reviews/review.routes.js";
import reportRoutes from "./features/reports/report.routes.js";
import { adminRoutes } from "./features/admin/admin.routes.js";

/** Express application instance */
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(securityMiddleware);
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Rate limiting (skip for webhooks)
app.use(/^(?!\/api\/webhooks).*$/, rateLimiter);

// Maintenance mode (blocks all requests except /health)
app.use(maintenanceMode);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/predictors", predictorRoutes);
app.use("/api/signals", signalRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

/**
 * Handles graceful shutdown of the server.
 * Closes database connections and exits cleanly.
 *
 * @param signal - The signal that triggered the shutdown (SIGTERM or SIGINT)
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  await disconnectDatabase();
  logger.info("Graceful shutdown completed");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

/**
 * Initializes and starts the Express server.
 * Connects to the database and begins listening for requests.
 *
 * @throws Will exit process if database connection fails
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📡 Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

startServer();

export default app;
