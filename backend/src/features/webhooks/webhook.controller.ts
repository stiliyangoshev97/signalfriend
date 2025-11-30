/**
 * @fileoverview Express route handlers for Alchemy Webhook endpoints.
 *
 * Provides controllers for:
 * - POST /api/webhooks/alchemy - Process blockchain events
 * - GET /api/webhooks/health - Webhook health check
 *
 * @module features/webhooks/webhook.controller
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/webhooks/webhook.controller.ts
import type { Request, Response } from "express";
import { WebhookService } from "./webhook.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { alchemyWebhookSchema } from "./webhook.schemas.js";
import { logger } from "../../shared/config/logger.js";

/**
 * POST /api/webhooks/alchemy
 * Handles incoming Alchemy webhook events.
 *
 * Verification process:
 * 1. Extracts x-alchemy-signature header
 * 2. Verifies HMAC-SHA256 signature
 * 3. Validates payload against Zod schema
 * 4. Processes events asynchronously
 *
 * @header {string} x-alchemy-signature - HMAC signature for verification
 * @body {AlchemyWebhookPayload} Alchemy webhook payload
 * @returns {Object} JSON response with success status
 * @throws {401} If signature verification fails
 * @throws {400} If payload validation fails
 */
export const handleAlchemyWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Get raw body for signature verification
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers["x-alchemy-signature"] as string | undefined;

  // Verify signature
  if (signature && !WebhookService.verifySignature(rawBody, signature)) {
    logger.warn("Invalid Alchemy webhook signature");
    throw ApiError.unauthorized("Invalid webhook signature");
  }

  // Validate payload
  const parseResult = alchemyWebhookSchema.safeParse(req.body);
  if (!parseResult.success) {
    logger.warn({ errors: parseResult.error.errors }, "Invalid Alchemy webhook payload");
    throw ApiError.badRequest("Invalid webhook payload");
  }

  // Process events
  await WebhookService.processWebhook(parseResult.data);

  // Always respond 200 to acknowledge receipt
  res.json({ success: true });
});

/**
 * GET /api/webhooks/health
 * Health check endpoint for webhook system monitoring.
 *
 * @returns {Object} JSON response with health status and timestamp
 */
export const webhookHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});
