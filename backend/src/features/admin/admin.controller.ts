/**
 * @fileoverview Express route handlers for Admin endpoints.
 *
 * Provides controllers for admin-only operations:
 * - GET /api/admin/stats - Platform earnings breakdown
 * - GET /api/admin/predictors/:address - Get full predictor info with contacts
 * - POST /api/admin/predictors/:address/blacklist - Blacklist a predictor
 * - POST /api/admin/predictors/:address/unblacklist - Unblacklist a predictor
 * - DELETE /api/admin/signals/:contentId - Deactivate a signal
 * - GET /api/admin/verification-requests - List pending verification requests
 * - POST /api/admin/predictors/:address/verify - Approve verification
 * - POST /api/admin/predictors/:address/reject - Reject verification
 * - POST /api/admin/predictors/:address/unverify - Remove verification
 * - GET /api/admin/reports - List all reports for admin review
 * - GET /api/admin/reports/:id - Get single report by ID
 * - PUT /api/admin/reports/:id - Update report status
 *
 * @module features/admin/admin.controller
 */
import type { Request, Response } from "express";
import { PredictorService } from "../predictors/predictor.service.js";
import { SignalService } from "../signals/signal.service.js";
import { AdminService } from "./admin.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

/**
 * GET /api/admin/predictors/:address
 * Retrieves a predictor's full profile including contact info.
 * Admin only - requires MultiSig wallet.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with full predictor data including contacts
 * @throws {404} If predictor not found
 */
export const getAdminPredictorByAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;

    const predictor = await PredictorService.getByAddressAdmin(address);

    res.json({
      success: true,
      data: predictor,
    });
  }
);

/**
 * POST /api/admin/predictors/:address/blacklist
 * Blacklists a predictor in the database.
 * Admin only - requires MultiSig wallet.
 *
 * Note: For full effect, also blacklist on-chain via MultiSig on BscScan.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with updated predictor
 * @throws {404} If predictor not found
 */
export const blacklistPredictor = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;

    const predictor = await PredictorService.adminBlacklist(address);

    res.json({
      success: true,
      message: "Predictor blacklisted in database. Remember to also blacklist on-chain via MultiSig.",
      data: predictor,
    });
  }
);

/**
 * POST /api/admin/predictors/:address/unblacklist
 * Removes blacklist status from a predictor in the database.
 * Admin only - requires MultiSig wallet.
 *
 * Note: For full effect, also unblacklist on-chain via MultiSig on BscScan.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with updated predictor
 * @throws {404} If predictor not found
 */
export const unblacklistPredictor = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;

    const predictor = await PredictorService.adminUnblacklist(address);

    res.json({
      success: true,
      message: "Predictor unblacklisted in database. Remember to also unblacklist on-chain via MultiSig.",
      data: predictor,
    });
  }
);

/**
 * DELETE /api/admin/signals/:contentId
 * Deactivates a signal (sets isActive = false).
 * Admin only - requires MultiSig wallet.
 *
 * Admin should contact the predictor via their preferred contact method
 * to explain the reason for removal.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @returns {Object} JSON response with deactivated signal
 * @throws {404} If signal not found
 */
export const deleteSignal = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const contentId = req.params.contentId as string;

    const signal = await SignalService.adminDeactivate(contentId);

    res.json({
      success: true,
      message: "Signal deactivated. Contact the predictor to explain the removal.",
      data: signal,
    });
  }
);

/**
 * GET /api/admin/verification-requests
 * Lists all pending verification requests.
 * Admin only - requires MultiSig wallet.
 *
 * @returns {Object} JSON response with array of pending predictors
 */
export const getVerificationRequests = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const predictors = await PredictorService.getPendingVerifications();

    res.json({
      success: true,
      data: predictors,
      count: predictors.length,
    });
  }
);

/**
 * POST /api/admin/predictors/:address/verify
 * Approves a predictor's verification request.
 * Admin only - requires MultiSig wallet.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with updated predictor
 * @throws {404} If predictor not found
 * @throws {400} If no pending application
 */
export const verifyPredictor = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;

    const predictor = await PredictorService.adminVerify(address);

    res.json({
      success: true,
      message: "Predictor verified successfully. They can now upload an avatar.",
      data: predictor,
    });
  }
);

/**
 * POST /api/admin/predictors/:address/reject
 * Rejects a predictor's verification request.
 * Admin only - requires MultiSig wallet.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with updated predictor
 * @throws {404} If predictor not found
 * @throws {400} If no pending application
 */
export const rejectVerification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;

    const predictor = await PredictorService.adminRejectVerification(address);

    res.json({
      success: true,
      message: "Verification rejected. Predictor needs 100 more sales to re-apply. Contact them to explain the reason.",
      data: predictor,
    });
  }
);

/**
 * POST /api/admin/predictors/:address/unverify
 * Removes verification status from a predictor.
 * Admin only - requires MultiSig wallet.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with updated predictor
 * @throws {404} If predictor not found
 * @throws {400} If predictor is not verified
 */
export const unverifyPredictor = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;

    const predictor = await PredictorService.adminUnverify(address);

    res.json({
      success: true,
      message: "Predictor unverified. Their avatar has been removed.",
      data: predictor,
    });
  }
);

// ============================================================================
// Platform Statistics
// ============================================================================

/**
 * GET /api/admin/stats
 * Retrieves platform earnings breakdown.
 * Admin only - requires MultiSig wallet.
 *
 * @returns {Object} JSON response with earnings breakdown:
 *   - fromPredictorJoins: Earnings from predictor join fees
 *   - fromBuyerAccessFees: Earnings from buyer access fees ($0.50/purchase)
 *   - fromCommissions: Earnings from 5% signal price commission
 *   - total: Total platform earnings
 *   - details: Breakdown context (predictor count, purchase count, volume)
 */
export const getPlatformStats = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const earnings = await AdminService.getPlatformEarnings();

    res.json({
      success: true,
      data: earnings,
    });
  }
);

// ============================================================================
// Reports Management
// ============================================================================

/**
 * GET /api/admin/reports
 * Lists all reports for admin review with full details.
 * Admin only - requires MultiSig wallet.
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Results per page (default: 20)
 * @query {string} status - Filter by status (pending, reviewed, resolved, dismissed)
 * @query {string} predictorAddress - Filter by predictor wallet address
 * @returns {Object} JSON response with reports array and pagination
 */
export const getReports = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as
      | "pending"
      | "reviewed"
      | "resolved"
      | "dismissed"
      | undefined;
    const predictorAddress = req.query.predictorAddress as string | undefined;

    const result = await AdminService.listReports({
      page,
      limit,
      status,
      predictorAddress,
    });

    res.json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/admin/reports/:id
 * Gets a single report by ID with full signal and predictor details.
 * Admin only - requires MultiSig wallet.
 *
 * @param {string} id - MongoDB document ID of the report
 * @returns {Object} JSON response with full report details
 * @throws {404} If report not found
 */
export const getReportById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const reportId = req.params.id as string;

    const report = await AdminService.getReportById(reportId);

    res.json({
      success: true,
      data: report,
    });
  }
);

/**
 * PUT /api/admin/reports/:id
 * Updates a report's status and optional admin notes.
 * Admin only - requires MultiSig wallet.
 *
 * @param {string} id - MongoDB document ID of the report
 * @body {string} status - New status (pending, reviewed, resolved, dismissed)
 * @body {string} adminNotes - Optional internal notes
 * @returns {Object} JSON response with updated report
 * @throws {404} If report not found
 */
export const updateReportStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const reportId = req.params.id as string;
    const { status, adminNotes } = req.body;

    const report = await AdminService.updateReportStatus(
      reportId,
      status,
      adminNotes
    );

    res.json({
      success: true,
      message: `Report status updated to '${status}'`,
      data: report,
    });
  }
);
