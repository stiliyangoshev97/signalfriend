/**
 * @fileoverview Express router configuration for Admin endpoints.
 *
 * All routes require:
 * 1. Authentication (SIWE + JWT)
 * 2. Admin status (wallet in ADMIN_ADDRESSES)
 *
 * Route definitions:
 * - GET /api/admin/stats - Platform earnings breakdown
 * - GET /api/admin/predictors/:address - Get full predictor info with contacts
 * - POST /api/admin/predictors/:address/blacklist - Blacklist predictor
 * - POST /api/admin/predictors/:address/unblacklist - Unblacklist predictor
 * - DELETE /api/admin/signals/:contentId - Deactivate signal
 * - GET /api/admin/verification-requests - List pending verification requests
 * - POST /api/admin/predictors/:address/verify - Approve verification
 * - POST /api/admin/predictors/:address/reject - Reject verification
 * - POST /api/admin/predictors/:address/unverify - Remove verification
 * - POST /api/admin/predictors/:address/manual-verify - Manually verify any predictor
 * - GET /api/admin/reports - List all reports for admin review
 * - GET /api/admin/reports/:id - Get single report by ID
 * - PUT /api/admin/reports/:id - Update report status
 *
 * @module features/admin/admin.routes
 */
import { Router } from "express";
import {
  getAdminPredictorByAddress,
  getBlacklistedPredictors,
  blacklistPredictor,
  unblacklistPredictor,
  deleteSignal,
  getVerificationRequests,
  verifyPredictor,
  rejectVerification,
  unverifyPredictor,
  manualVerifyPredictor,
  getPlatformStats,
  getReports,
  getReportById,
  updateReportStatus,
} from "./admin.controller.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { requireAdmin } from "../../shared/middleware/admin.js";
import { writeRateLimiter } from "../../shared/middleware/rateLimiter.js";

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
 * GET /api/admin/predictors/blacklisted
 * Get all blacklisted predictors for admin review.
 * Note: This route must be defined BEFORE the :address route to avoid conflicts.
 */
router.get("/predictors/blacklisted", getBlacklistedPredictors);

/**
 * GET /api/admin/predictors/:address
 * Get full predictor profile including telegram/discord contacts.
 */
router.get("/predictors/:address", getAdminPredictorByAddress);

/**
 * POST /api/admin/predictors/:address/blacklist
 * Blacklist a predictor in the database.
 * Note: Also blacklist on-chain via MultiSig for full effect.
 * Rate limited: 100 req/15min (write operations)
 */
router.post("/predictors/:address/blacklist", writeRateLimiter, blacklistPredictor);

/**
 * POST /api/admin/predictors/:address/unblacklist
 * Remove blacklist status from a predictor.
 * Note: Also unblacklist on-chain via MultiSig for full effect.
 * Rate limited: 100 req/15min (write operations)
 */
router.post("/predictors/:address/unblacklist", writeRateLimiter, unblacklistPredictor);

// ============================================================================
// Verification Management
// ============================================================================

/**
 * GET /api/admin/verification-requests
 * List all pending verification applications.
 */
router.get("/verification-requests", getVerificationRequests);

/**
 * POST /api/admin/predictors/:address/verify
 * Approve a predictor's verification request.
 * They will get a verified badge and can upload an avatar.
 * Rate limited: 100 req/15min (write operations)
 */
router.post("/predictors/:address/verify", writeRateLimiter, verifyPredictor);

/**
 * POST /api/admin/predictors/:address/reject
 * Reject a predictor's verification request.
 * They need 100 more sales to re-apply.
 * Rate limited: 100 req/15min (write operations)
 */
router.post("/predictors/:address/reject", writeRateLimiter, rejectVerification);

/**
 * POST /api/admin/predictors/:address/unverify
 * Remove verification status from a predictor.
 * Their avatar will also be removed.
 * Rate limited: 100 req/15min (write operations)
 */
router.post("/predictors/:address/unverify", writeRateLimiter, unverifyPredictor);

/**
 * POST /api/admin/predictors/:address/manual-verify
 * Manually verify a predictor regardless of sales count or pending application.
 * Use for special cases where normal requirements should be bypassed.
 * Rate limited: 100 req/15min (write operations)
 */
router.post("/predictors/:address/manual-verify", writeRateLimiter, manualVerifyPredictor);

// ============================================================================
// Signal Management
// ============================================================================

/**
 * DELETE /api/admin/signals/:contentId
 * Deactivate a signal (soft delete).
 * Contact predictor via their preferred method to explain removal.
 * Rate limited: 100 req/15min (write operations)
 */
router.delete("/signals/:contentId", writeRateLimiter, deleteSignal);

// ============================================================================
// Platform Statistics
// ============================================================================

/**
 * GET /api/admin/stats
 * Get platform earnings breakdown (joins, buyer fees, commissions).
 */
router.get("/stats", getPlatformStats);

// ============================================================================
// Reports Management
// ============================================================================

/**
 * GET /api/admin/reports
 * List all reports with full details for admin review.
 * Query params: page, limit, status, predictorAddress
 */
router.get("/reports", getReports);

/**
 * GET /api/admin/reports/:id
 * Get a single report by ID with full signal/predictor details.
 */
router.get("/reports/:id", getReportById);

/**
 * PUT /api/admin/reports/:id
 * Update report status (pending, reviewed, resolved, dismissed).
 * Body: { status, adminNotes? }
 * Rate limited: 100 req/15min (write operations)
 */
router.put("/reports/:id", writeRateLimiter, updateReportStatus);

export const adminRoutes = router;
