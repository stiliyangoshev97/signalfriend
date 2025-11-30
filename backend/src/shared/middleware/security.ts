/**
 * @fileoverview Security middleware configuration for Express.
 *
 * Configures:
 * - Helmet for HTTP security headers
 * - CORS for cross-origin request handling
 *
 * @module shared/middleware/security
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/middleware/security.ts
import helmet from "helmet";
import cors from "cors";
import { env } from "../config/env.js";
import type { RequestHandler } from "express";

/**
 * Helmet middleware with default security headers.
 * Protects against common web vulnerabilities.
 */
export const securityMiddleware = helmet();

/**
 * CORS middleware configured for the frontend origin.
 * Allows credentials and common HTTP methods.
 */
export const corsMiddleware: RequestHandler = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
