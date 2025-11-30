import helmet from "helmet";
import cors from "cors";
import { env } from "../config/env.js";
import type { RequestHandler } from "express";

export const securityMiddleware = helmet();

export const corsMiddleware: RequestHandler = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
