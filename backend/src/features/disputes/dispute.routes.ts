/**
 * @fileoverview Express router configuration for Dispute endpoints.
 *
 * Two sets of routes:
 * 1. Predictor routes (authenticated) - Create and check own dispute
 * 2. Admin routes (admin only) - List and manage all disputes
 *
 * Predictor routes:
 * - POST /api/disputes - Create a dispute (blacklisted predictor only)
 * - GET /api/disputes/me - Get own dispute status
 *
 * Admin routes (mounted separately at /api/admin/disputes):
 * - GET / - List all disputes
 * - GET /counts - Get counts by status
 * - PUT /:id - Update dispute status
 * - POST /:id/resolve - Resolve and unblacklist predictor
 *
 * @module features/disputes/dispute.routes
 */
import { Router } from "express";
import {
  createDispute,
  getMyDispute,
  listDisputes,
  updateDisputeStatus,
  resolveDispute,
  getDisputeCounts,
} from "./dispute.controller.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { requireAdmin } from "../../shared/middleware/admin.js";
import { writeRateLimiter } from "../../shared/middleware/rateLimiter.js";

// ============================================================================
// Predictor Routes (Authenticated)
// ============================================================================

/** Express router instance for predictor dispute routes */
const predictorRouter = Router();

// All routes require authentication
predictorRouter.use(authenticate);

/**
 * POST /api/disputes
 * Create a dispute (blacklisted predictor only).
 * Just a simple flag - no form data needed.
 * Rate limited: 60 req/15min (write operations)
 */
predictorRouter.post("/", writeRateLimiter, createDispute);

/**
 * GET /api/disputes/me
 * Get the authenticated predictor's dispute status.
 */
predictorRouter.get("/me", getMyDispute);

// ============================================================================
// Admin Routes (Admin Only)
// ============================================================================

/** Express router instance for admin dispute routes */
const adminRouter = Router();

// All routes require authentication and admin status
adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

/**
 * GET /api/admin/disputes
 * List all disputes with predictor info.
 * Query params: page, limit, status
 */
adminRouter.get("/", listDisputes);

/**
 * GET /api/admin/disputes/counts
 * Get dispute counts by status for dashboard.
 */
adminRouter.get("/counts", getDisputeCounts);

/**
 * PUT /api/admin/disputes/:id
 * Update dispute status and admin notes.
 * Body: { status, adminNotes? }
 */
adminRouter.put("/:id", updateDisputeStatus);

/**
 * POST /api/admin/disputes/:id/resolve
 * Resolve dispute and unblacklist predictor in DB.
 * Body: { adminNotes? }
 */
adminRouter.post("/:id/resolve", resolveDispute);

export const disputeRoutes = predictorRouter;
export const adminDisputeRoutes = adminRouter;
