import { Router } from "express";
import { handleAlchemyWebhook, webhookHealth } from "./webhook.controller.js";

const router = Router();

// POST /webhooks/alchemy - Alchemy webhook handler
router.post("/alchemy", handleAlchemyWebhook);

// GET /webhooks/health - Health check
router.get("/health", webhookHealth);

export const webhookRoutes = router;
