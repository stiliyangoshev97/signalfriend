/**
 * @fileoverview Express route handlers for Alchemy Webhook endpoints.
 *
 * Provides controllers for:
 * - POST /api/webhooks/alchemy - Process blockchain events
 * - GET /api/webhooks/health - Webhook health check
 *
 * Supports both webhook types:
 * - GRAPHQL: Custom webhooks for contract events (recommended)
 * - ADDRESS_ACTIVITY: Token transfer webhooks
 *
 * @module features/webhooks/webhook.controller
 */
import type { Request, Response } from "express";
import { WebhookService } from "./webhook.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { 
  alchemyGraphqlWebhookSchema, 
  alchemyAddressActivityWebhookSchema 
} from "./webhook.schemas.js";
import { logger } from "../../shared/config/logger.js";

/**
 * POST /api/webhooks/alchemy
 * Handles incoming Alchemy webhook events.
 *
 * Supports both GraphQL and Address Activity webhook types.
 *
 * Verification process:
 * 1. Extracts x-alchemy-signature header
 * 2. Verifies HMAC-SHA256 signature
 * 3. Detects webhook type and validates payload
 * 4. Routes to appropriate processor
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

  // Detect webhook type and process accordingly
  const webhookType = req.body?.type;

  if (webhookType === "GRAPHQL") {
    // GraphQL Custom Webhook - captures all contract events
    const parseResult = alchemyGraphqlWebhookSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn({ errors: parseResult.error.errors }, "Invalid GraphQL webhook payload");
      throw ApiError.badRequest("Invalid webhook payload");
    }
    await WebhookService.processGraphqlWebhook(parseResult.data);
  } else if (webhookType === "ADDRESS_ACTIVITY") {
    // Address Activity Webhook - only token transfers
    const parseResult = alchemyAddressActivityWebhookSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn({ errors: parseResult.error.errors }, "Invalid Address Activity webhook payload");
      throw ApiError.badRequest("Invalid webhook payload");
    }
    await WebhookService.processAddressActivityWebhook(parseResult.data);
  } else {
    logger.warn({ type: webhookType }, "Unknown webhook type received");
    throw ApiError.badRequest(`Unknown webhook type: ${webhookType}`);
  }

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
