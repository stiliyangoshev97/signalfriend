/**
 * @fileoverview Express route handlers for Admin endpoints.
 *
 * Provides controllers for admin-only operations:
 * - GET /api/admin/predictors/:address - Get full predictor info with contacts
 * - POST /api/admin/predictors/:address/blacklist - Blacklist a predictor
 * - POST /api/admin/predictors/:address/unblacklist - Unblacklist a predictor
 * - DELETE /api/admin/signals/:contentId - Deactivate a signal
 *
 * @module features/admin/admin.controller
 */
import type { Request, Response } from "express";
import { PredictorService } from "../predictors/predictor.service.js";
import { SignalService } from "../signals/signal.service.js";
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
