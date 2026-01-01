/**
 * @fileoverview Express route handlers for Signal endpoints.
 *
 * Provides controllers for:
 * - GET /api/signals - List signals with filtering/pagination
 * - GET /api/signals/:contentId - Get signal public metadata
 * - GET /api/signals/:contentId/content - Get protected content (auth required)
 * - POST /api/signals - Create signal (predictor only)
 * - PUT /api/signals/:contentId - Update signal (creator only)
 * - DELETE /api/signals/:contentId - Deactivate signal (creator only)
 *
 * @module features/signals/signal.controller
 */
import type { Request, Response } from "express";
import { SignalService } from "./signal.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type {
  ListSignalsQuery,
  GetSignalByContentIdParams,
  CreateSignalInput,
  UpdateSignalInput,
} from "./signal.schemas.js";

/**
 * GET /api/signals/:contentId/content-identifier
 * Returns the bytes32 content identifier for use in on-chain purchases.
 * This is needed to call buySignalNFT on the smart contract.
 * Auth required to prevent predictors from purchasing their own signals.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @returns {Object} JSON response with bytes32 content identifier
 * @throws {404} If signal not found
 * @throws {400} If signal is inactive, expired, or user is the predictor
 */
export const getContentIdentifier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalByContentIdParams;
    // Get caller's address from authenticated user
    const callerAddress = req.user?.address;

    const result = await SignalService.getContentIdentifier(contentId, callerAddress);

    res.json({
      success: true,
      data: result,
    });
  }
);

/**
 * GET /api/signals
 * Lists signals with filtering, pagination, and sorting.
 * Returns public signal data only (no protected content).
 *
 * @query {string} [categoryId] - Filter by category
 * @query {string} [predictorAddress] - Filter by predictor
 * @query {string} [active=true] - Only show active signals
 * @query {string} [sortBy=createdAt] - Sort field
 * @query {string} [sortOrder=desc] - Sort direction
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @query {string} [search] - Search by title
 * @query {number} [minPrice] - Minimum price filter
 * @query {number} [maxPrice] - Maximum price filter
 * @returns {Object} JSON response with signals array and pagination
 */
export const listSignals = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListSignalsQuery;

    const result = await SignalService.getAll(query);

    res.json({
      success: true,
      data: result.signals,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/signals/:contentId
 * Retrieves a single signal's public metadata.
 * Does NOT include protected content.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @returns {Object} JSON response with signal public data
 * @throws {404} If signal not found
 */
export const getSignalByContentId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalByContentIdParams;

    const signal = await SignalService.getByContentId(contentId);

    res.json({
      success: true,
      data: signal,
    });
  }
);

/**
 * GET /api/signals/:contentId/content
 * Retrieves the protected content of a signal.
 * - Expired signals: Public access (no auth required)
 * - Active signals: Auth required (owner, predictor, or admin only)
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @returns {Object} JSON response with protected content
 * @throws {404} If signal not found
 * @throws {403} If user has not purchased the signal (for non-expired signals)
 */
export const getSignalContent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalByContentIdParams;
    // buyerAddress may be undefined for unauthenticated users accessing expired signals
    const buyerAddress = req.user?.address;

    const result = await SignalService.getProtectedContent(contentId, buyerAddress);

    res.json({
      success: true,
      data: result,
    });
  }
);

/**
 * POST /api/signals
 * Creates a new signal for sale.
 * Only active predictors can create signals.
 * Requires authentication.
 *
 * @body {CreateSignalInput} Signal data
 * @returns {Object} JSON response with created signal (public fields)
 * @throws {403} If caller is not an active predictor
 * @throws {400} If category is invalid
 */
export const createSignal = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateSignalInput;
    const predictorAddress = req.user!.address;

    const signal = await SignalService.create(data, predictorAddress);

    res.status(201).json({
      success: true,
      data: signal,
    });
  }
);

/**
 * PUT /api/signals/:contentId
 * Updates a signal's metadata.
 * Only the signal's creator can update it.
 * Requires authentication.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @body {UpdateSignalInput} Fields to update
 * @returns {Object} JSON response with updated signal (public fields)
 * @throws {404} If signal not found
 * @throws {403} If caller is not the creator
 */
export const updateSignal = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalByContentIdParams;
    const data = req.body as UpdateSignalInput;
    const callerAddress = req.user!.address;

    const signal = await SignalService.update(contentId, data, callerAddress);

    res.json({
      success: true,
      data: signal,
    });
  }
);

/**
 * DELETE /api/signals/:contentId
 * Deactivates a signal (soft delete).
 * Only the signal's creator can deactivate it.
 * Requires authentication.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @returns {Object} JSON response confirming deactivation
 * @throws {404} If signal not found
 * @throws {403} If caller is not the creator
 */
export const deactivateSignal = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as GetSignalByContentIdParams;
    const callerAddress = req.user!.address;

    await SignalService.deactivate(contentId, callerAddress);

    res.json({
      success: true,
      message: "Signal deactivated successfully",
    });
  }
);

/**
 * GET /api/signals/predictor/:address
 * Gets all signals created by a specific predictor.
 * Public endpoint - returns public signal data only.
 *
 * @param {string} address - Predictor wallet address
 * @query {string} [includeInactive=false] - Include inactive signals
 * @query {string} [sortBy=createdAt] - Sort field (createdAt, priceUsdt, totalSales)
 * @query {string} [sortOrder=desc] - Sort direction (asc, desc)
 * @returns {Object} JSON response with predictor's signals
 */
export const getSignalsByPredictor = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address as string;
    const includeInactive = req.query.includeInactive === "true";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const signals = await SignalService.getByPredictor(
      address,
      includeInactive,
      sortBy,
      sortOrder
    );

    res.json({
      success: true,
      data: signals,
    });
  }
);
