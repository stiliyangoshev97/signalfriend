/**
 * @fileoverview Express router configuration for Webhook endpoints.
 *
 * Route definitions:
 * - POST /api/webhooks/alchemy - Alchemy blockchain event webhook
 * - GET /api/webhooks/health - Health check endpoint
 *
 * Note: Webhook routes bypass the general rate limiter as they
 * are called by external services with their own rate limiting.
 *
 * @module features/webhooks/webhook.routes
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/webhooks/webhook.routes.ts
import { Router } from "express";
import { handleAlchemyWebhook, webhookHealth } from "./webhook.controller.js";

/** Express router instance for webhook routes */
const router = Router();

/** POST /api/webhooks/alchemy - Process Alchemy blockchain events */
router.post("/alchemy", handleAlchemyWebhook);

/** GET /api/webhooks/health - Webhook system health check */
router.get("/health", webhookHealth);

export const webhookRoutes = router;
