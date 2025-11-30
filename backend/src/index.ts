import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./shared/config/env.js";
import { logger } from "./shared/config/logger.js";
import { connectDatabase, disconnectDatabase } from "./shared/config/database.js";
import { securityMiddleware, corsMiddleware } from "./shared/middleware/security.js";
import { rateLimiter } from "./shared/middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/errorHandler.js";
import { authRoutes } from "./features/auth/auth.routes.js";
import { webhookRoutes } from "./features/webhooks/webhook.routes.js";

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

// TODO: Add remaining feature routes
// app.use("/api/predictors", predictorRoutes);
// app.use("/api/signals", signalRoutes);
// app.use("/api/receipts", receiptRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/categories", categoryRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  await disconnectDatabase();
  logger.info("Graceful shutdown completed");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
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
