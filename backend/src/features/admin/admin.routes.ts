/**
 * @fileoverview Express router configuration for Admin endpoints.
 *
 * All routes require:
 * 1. Authentication (SIWE + JWT)
 * 2. Admin status (wallet in ADMIN_ADDRESSES)
 *
 * Route definitions:
 * - GET /api/admin/predictors/:address - Get full predictor info with contacts
 * - POST /api/admin/predictors/:address/blacklist - Blacklist predictor
 * - POST /api/admin/predictors/:address/unblacklist - Unblacklist predictor
 * - DELETE /api/admin/signals/:contentId - Deactivate signal
 *
 * @module features/admin/admin.routes
 */
import { Router } from "express";
import {
  getAdminPredictorByAddress,
  blacklistPredictor,
  unblacklistPredictor,
  deleteSignal,
} from "./admin.controller.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { requireAdmin } from "../../shared/middleware/admin.js";

/** Express router instance for admin routes */
const router = Router();

// ============================================================================
// All Admin Routes (Authentication + Admin Required)
// ============================================================================

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(requireAdmin);

// ============================================================================
// Predictor Management
// ============================================================================

/**
 * GET /api/admin/predictors/:address
 * Get full predictor profile including telegram/discord contacts.
 */
router.get("/predictors/:address", getAdminPredictorByAddress);

/**
 * POST /api/admin/predictors/:address/blacklist
 * Blacklist a predictor in the database.
 * Note: Also blacklist on-chain via MultiSig for full effect.
 */
router.post("/predictors/:address/blacklist", blacklistPredictor);

/**
 * POST /api/admin/predictors/:address/unblacklist
 * Remove blacklist status from a predictor.
 * Note: Also unblacklist on-chain via MultiSig for full effect.
 */
router.post("/predictors/:address/unblacklist", unblacklistPredictor);

// ============================================================================
// Signal Management
// ============================================================================

/**
 * DELETE /api/admin/signals/:contentId
 * Deactivate a signal (soft delete).
 * Contact predictor via their preferred method to explain removal.
 */
router.delete("/signals/:contentId", deleteSignal);

export const adminRoutes = router;
