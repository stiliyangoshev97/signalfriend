/**
 * @fileoverview Integration test helper for API testing.
 *
 * Provides a configured supertest instance and helper functions
 * for testing API endpoints without starting the full server.
 *
 * @module tests/integration/helpers/testApp
 */

import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "../../../src/shared/middleware/errorHandler.js";
import { categoryRoutes } from "../../../src/features/categories/category.routes.js";

/**
 * Creates a minimal test Express app with specific routes.
 * Does not include database connection or security middleware
 * to enable isolated unit/integration testing.
 */
export function createTestApp() {
  const app = express();

  // Body parsing
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        env: "test",
      },
    });
  });

  // Routes
  app.use("/api/categories", categoryRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
