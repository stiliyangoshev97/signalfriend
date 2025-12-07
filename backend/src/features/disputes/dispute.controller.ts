/**
 * @fileoverview Express route handlers for Dispute endpoints.
 *
 * Provides controllers for dispute operations:
 * - POST /api/disputes - Create a dispute (blacklisted predictor only)
 * - GET /api/disputes/me - Get own dispute status (predictor)
 * - GET /api/admin/disputes - List all disputes (admin only)
 * - PUT /api/admin/disputes/:id - Update dispute status (admin only)
 * - POST /api/admin/disputes/:id/resolve - Resolve and unblacklist (admin only)
 *
 * @module features/disputes/dispute.controller
 */
import type { Request, Response } from "express";
import { DisputeService } from "./dispute.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

// ============================================================================
// Predictor Endpoints (Authenticated)
// ============================================================================

/**
 * POST /api/disputes
 * Creates a dispute for the authenticated blacklisted predictor.
 * No form data needed - just a click to notify admin.
 *
 * @returns {Object} JSON response with created dispute
 * @throws {404} If predictor not found
 * @throws {400} If predictor is not blacklisted
 * @throws {409} If dispute already exists
 */
export const createDispute = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userAddress = req.user!.address;

    const dispute = await DisputeService.create(userAddress);

    res.status(201).json({
      success: true,
      message:
        "Dispute submitted. An admin will contact you via your preferred contact method.",
      data: dispute,
    });
  }
);

/**
 * GET /api/disputes/me
 * Gets the authenticated predictor's dispute status.
 *
 * @returns {Object} JSON response with dispute or null
 */
export const getMyDispute = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userAddress = req.user!.address;

    const dispute = await DisputeService.getByPredictor(userAddress);

    res.json({
      success: true,
      data: dispute,
    });
  }
);

// ============================================================================
// Admin Endpoints (Admin Only)
// ============================================================================

/**
 * GET /api/admin/disputes
 * Lists all disputes for admin review.
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Results per page (default: 20)
 * @query {string} status - Filter by status
 * @returns {Object} JSON response with disputes array and pagination
 */
export const listDisputes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as
      | "pending"
      | "contacted"
      | "resolved"
      | "rejected"
      | undefined;

    const result = await DisputeService.listForAdmin({
      page,
      limit,
      status,
    });

    res.json({
      success: true,
      data: {
        disputes: result.disputes,
        pagination: result.pagination,
      },
    });
  }
);

/**
 * PUT /api/admin/disputes/:id
 * Updates a dispute's status and admin notes.
 *
 * @param {string} id - MongoDB document ID
 * @body {string} status - New status
 * @body {string} adminNotes - Optional internal notes
 * @returns {Object} JSON response with updated dispute
 * @throws {404} If dispute not found
 */
export const updateDisputeStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const disputeId = req.params.id as string;
    const { status, adminNotes } = req.body;

    const dispute = await DisputeService.updateStatus(
      disputeId,
      status,
      adminNotes
    );

    res.json({
      success: true,
      message: `Dispute status updated to '${status}'`,
      data: dispute,
    });
  }
);

/**
 * POST /api/admin/disputes/:id/resolve
 * Resolves a dispute by unblacklisting the predictor.
 *
 * @param {string} id - MongoDB document ID
 * @body {string} adminNotes - Optional internal notes
 * @returns {Object} JSON response with resolved dispute
 * @throws {404} If dispute not found
 */
export const resolveDispute = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const disputeId = req.params.id as string;
    const { adminNotes } = req.body;

    const dispute = await DisputeService.resolve(disputeId, adminNotes);

    res.json({
      success: true,
      message:
        "Dispute resolved. Predictor has been unblacklisted in database. Remember to also unblacklist on-chain via MultiSig.",
      data: dispute,
    });
  }
);

/**
 * GET /api/admin/disputes/counts
 * Gets dispute counts by status for dashboard overview.
 *
 * @returns {Object} JSON response with counts by status
 */
export const getDisputeCounts = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const counts = await DisputeService.getCounts();

    res.json({
      success: true,
      data: counts,
    });
  }
);
