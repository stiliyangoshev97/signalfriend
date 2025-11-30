/**
 * @fileoverview Express route handlers for Receipt endpoints.
 *
 * Provides controllers for:
 * - GET /api/receipts/mine - Get user's purchase history
 * - GET /api/receipts/check/:contentId - Check if user has purchased
 * - GET /api/receipts/:tokenId - Get receipt by token ID
 * - GET /api/receipts/signal/:contentId - Get signal's sales (predictor only)
 *
 * Note: Receipts are created automatically via webhooks when
 * SignalPurchased events are detected on-chain.
 *
 * @module features/receipts/receipt.controller
 */
import type { Request, Response } from "express";
import { ReceiptService } from "./receipt.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type {
  ListMyReceiptsQuery,
  ListSignalReceiptsQuery,
  GetReceiptByTokenIdParams,
  GetSignalContentIdParams,
} from "./receipt.schemas.js";

/**
 * GET /api/receipts/mine
 * Retrieves the authenticated user's purchase history.
 * Requires authentication.
 *
 * @query {string} [sortBy=purchasedAt] - Sort field
 * @query {string} [sortOrder=desc] - Sort direction
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @returns {Object} JSON response with receipts array and pagination
 */
export const getMyReceipts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const buyerAddress = req.user!.address;
    const query = req.query as unknown as ListMyReceiptsQuery;

    const result = await ReceiptService.getMyReceipts(buyerAddress, query);

    res.json({
      success: true,
      data: result.receipts,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/receipts/check/:contentId
 * Checks if the authenticated user has purchased a specific signal.
 * Requires authentication.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @returns {Object} JSON response with hasPurchased boolean
 */
export const checkPurchase = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalContentIdParams;
    const buyerAddress = req.user!.address;

    const hasPurchased = await ReceiptService.hasPurchased(
      contentId,
      buyerAddress
    );

    res.json({
      success: true,
      data: {
        contentId,
        hasPurchased,
      },
    });
  }
);

/**
 * GET /api/receipts/:tokenId
 * Retrieves a single receipt by SignalKeyNFT token ID.
 * Requires authentication - only the buyer can view their receipt.
 *
 * @param {number} tokenId - SignalKeyNFT token ID
 * @returns {Object} JSON response with receipt data
 * @throws {404} If receipt not found
 * @throws {403} If caller is not the buyer
 */
export const getReceiptByTokenId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { tokenId } = req.params as unknown as GetReceiptByTokenIdParams;
    const callerAddress = req.user!.address.toLowerCase();

    const receipt = await ReceiptService.getByTokenId(tokenId);

    // Only allow buyer or predictor to view receipt
    if (
      receipt.buyerAddress !== callerAddress &&
      receipt.predictorAddress !== callerAddress
    ) {
      res.status(403).json({
        success: false,
        error: "You can only view your own receipts",
      });
      return;
    }

    res.json({
      success: true,
      data: receipt,
    });
  }
);

/**
 * GET /api/receipts/signal/:contentId
 * Retrieves sales history for a specific signal.
 * Only accessible to the signal's creator (predictor).
 * Requires authentication.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @returns {Object} JSON response with receipts array and pagination
 * @throws {404} If signal not found
 * @throws {403} If caller is not the predictor
 */
export const getSignalReceipts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalContentIdParams;
    const callerAddress = req.user!.address;
    const query = req.query as unknown as ListSignalReceiptsQuery;

    const result = await ReceiptService.getSignalReceipts(
      contentId,
      callerAddress,
      query
    );

    res.json({
      success: true,
      data: result.receipts,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/receipts/stats
 * Retrieves sales statistics for the authenticated predictor.
 * Requires authentication.
 *
 * @returns {Object} JSON response with totalSales and totalRevenue
 */
export const getPredictorStats = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const predictorAddress = req.user!.address;

    const stats = await ReceiptService.getPredictorStats(predictorAddress);

    res.json({
      success: true,
      data: stats,
    });
  }
);
