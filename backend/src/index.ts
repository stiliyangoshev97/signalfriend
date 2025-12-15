/**
 * @fileoverview Main entry point for the SignalFriend backend server.
 *
 * This file sets up and configures the Express application with:
 * - Security middleware (Helmet, CORS)
 * - Tiered rate limiting (auth, read, write, critical)
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
import { runStartupSeeds } from "./shared/services/seedOnStartup.js";
import { securityMiddleware, corsMiddleware } from "./shared/middleware/security.js";
import { 
  rateLimiter, 
  readRateLimiter, 
  writeRateLimiter,
  criticalRateLimiter 
} from "./shared/middleware/rateLimiter.js";
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
import { disputeRoutes, adminDisputeRoutes } from "./features/disputes/dispute.routes.js";
import { statsRoutes } from "./features/stats/stats.routes.js";

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

// =============================================================================
// TIERED RATE LIMITING
// =============================================================================
// Rate limits are applied per-route category for optimal protection:
// - Webhooks: No rate limiting (internal service)
// - Auth: Specific limiters applied in auth.routes.ts
// - Read: High limits for browsing (200/min)
// - Write: Moderate limits (60/15min)
// - Critical: Very high limits for purchases (500/15min)
// - General: Fallback safety net

// Skip rate limiting entirely for webhooks (internal service)
// Note: Webhooks are protected by signature verification, not rate limiting

// Apply read rate limiter to GET endpoints (high frequency, low risk)
app.use("/api/signals", readRateLimiter);
app.use("/api/predictors", readRateLimiter);
app.use("/api/categories", readRateLimiter);
app.use("/api/stats", readRateLimiter);
app.use("/api/reviews", readRateLimiter);
app.use("/api/reports", readRateLimiter);
app.use("/api/disputes", readRateLimiter);

// Apply critical rate limiter to receipts (never block purchases)
app.use("/api/receipts", criticalRateLimiter);

// General fallback rate limiter for any routes not covered above
// (except webhooks which are completely skipped)
app.use(/^(?!\/api\/webhooks|\/api\/auth).*$/, rateLimiter);

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
app.use("/api/disputes", disputeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/disputes", adminDisputeRoutes);
app.use("/api/stats", statsRoutes);

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

    // Seed essential data if missing (categories, etc.)
    await runStartupSeeds();

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
