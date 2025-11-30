/**
 * @fileoverview Express router configuration for Receipt endpoints.
 *
 * Route definitions:
 * - GET /api/receipts/mine - Auth required, get user's purchases
 * - GET /api/receipts/stats - Auth required, get predictor stats
 * - GET /api/receipts/check/:contentId - Auth required, check if purchased
 * - GET /api/receipts/signal/:contentId - Auth required, get signal sales
 * - GET /api/receipts/:tokenId - Auth required, get receipt by token ID
 *
 * Note: Receipts are created via webhooks, not through API.
 *
 * @module features/receipts/receipt.routes
 */
import { Router } from "express";
import {
  getMyReceipts,
  checkPurchase,
  getReceiptByTokenId,
  getSignalReceipts,
  getPredictorStats,
} from "./receipt.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate } from "../../shared/middleware/auth.js";
import {
  listMyReceiptsSchema,
  listSignalReceiptsSchema,
  getReceiptByTokenIdSchema,
  getSignalContentIdSchema,
} from "./receipt.schemas.js";

/** Express router instance for receipt routes */
const router = Router();

// ============================================================================
// All Receipt Routes Require Authentication
// ============================================================================

/**
 * GET /api/receipts/mine
 * Get the authenticated user's purchase history.
 * Query params: sortBy, sortOrder, page, limit
 */
router.get(
  "/mine",
  authenticate,
  validate(listMyReceiptsSchema, "query"),
  getMyReceipts
);

/**
 * GET /api/receipts/stats
 * Get sales statistics for the authenticated predictor.
 */
router.get("/stats", authenticate, getPredictorStats);

/**
 * GET /api/receipts/check/:contentId
 * Check if the authenticated user has purchased a specific signal.
 */
router.get(
  "/check/:contentId",
  authenticate,
  validate(getSignalContentIdSchema, "params"),
  checkPurchase
);

/**
 * GET /api/receipts/signal/:contentId
 * Get sales history for a signal (predictor only).
 * Query params: page, limit
 */
router.get(
  "/signal/:contentId",
  authenticate,
  validate(getSignalContentIdSchema, "params"),
  validate(listSignalReceiptsSchema, "query"),
  getSignalReceipts
);

/**
 * GET /api/receipts/:tokenId
 * Get a specific receipt by SignalKeyNFT token ID.
 * Only the buyer or predictor can view the receipt.
 */
router.get(
  "/:tokenId",
  authenticate,
  validate(getReceiptByTokenIdSchema, "params"),
  getReceiptByTokenId
);

export const receiptRoutes = router;
