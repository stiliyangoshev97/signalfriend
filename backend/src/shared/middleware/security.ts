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
 * CORS middleware configured for the frontend origin(s).
 * Supports multiple origins via comma-separated CORS_ORIGIN env var.
 * Allows credentials and common HTTP methods.
 *
 * @example
 * // Single origin
 * CORS_ORIGIN=http://localhost:5173
 *
 * // Multiple origins (comma-separated, no spaces)
 * CORS_ORIGIN=http://localhost:5173,http://localhost:4173,https://signalfriend.com
 */
const parseOrigins = (origin: string): string | string[] => {
  if (origin.includes(",")) {
    return origin.split(",").map((o) => o.trim());
  }
  return origin;
};

export const corsMiddleware: RequestHandler = cors({
  origin: parseOrigins(env.CORS_ORIGIN),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
