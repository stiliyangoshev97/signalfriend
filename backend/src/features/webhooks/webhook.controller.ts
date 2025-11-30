import type { Request, Response } from "express";
import { WebhookService } from "./webhook.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { alchemyWebhookSchema } from "./webhook.schemas.js";
import { logger } from "../../shared/config/logger.js";

/**
 * POST /webhooks/alchemy
 * Handle Alchemy webhook events
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
 * GET /webhooks/health
 * Health check for webhook endpoint
 */
export const webhookHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});
