/**
 * @fileoverview Express route handlers for Predictor endpoints.
 *
 * Provides controllers for:
 * - GET /api/predictors - List predictors with filtering/pagination
 * - GET /api/predictors/top - Get top predictors (leaderboard)
 * - GET /api/predictors/:address - Get predictor by address
 * - PUT /api/predictors/:address - Update predictor profile (auth required)
 *
 * @module features/predictors/predictor.controller
 */
import type { Request, Response } from "express";
import { PredictorService } from "./predictor.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type {
  ListPredictorsQuery,
  GetPredictorByAddressParams,
  UpdatePredictorProfileInput,
  CheckFieldUniquenessQuery,
} from "./predictor.schemas.js";

/**
 * GET /api/predictors
 * Lists predictors with filtering, pagination, and sorting.
 *
 * @query {string} [categoryId] - Filter by category
 * @query {string} [active=true] - Exclude blacklisted predictors
 * @query {string} [sortBy=totalSales] - Sort field
 * @query {string} [sortOrder=desc] - Sort direction
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @query {string} [search] - Search by display name
 * @returns {Object} JSON response with predictors array and pagination
 */
export const listPredictors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as ListPredictorsQuery;

  const result = await PredictorService.getAll(query);

  res.json({
    success: true,
    data: result.predictors,
    pagination: result.pagination,
  });
});

/**
 * GET /api/predictors/top
 * Gets the top predictors for leaderboard display.
 *
 * @query {string} [metric=totalSales] - Metric to rank by
 * @query {number} [limit=10] - Number of predictors to return
 * @returns {Object} JSON response with top predictors array
 */
export const getTopPredictors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const metric = (req.query.metric as "totalSales" | "averageRating" | "totalSignals") || "totalSales";
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  const predictors = await PredictorService.getTopPredictors(metric, limit);

  res.json({
    success: true,
    data: predictors,
  });
});

/**
 * GET /api/predictors/:address
 * Retrieves a single predictor by wallet address.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with predictor data
 * @throws {404} If predictor not found
 */
export const getPredictorByAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params as GetPredictorByAddressParams;

  const predictor = await PredictorService.getByAddress(address);

  res.json({
    success: true,
    data: predictor,
  });
});

/**
 * PUT /api/predictors/:address
 * Updates a predictor's profile. Requires authentication.
 * Only the predictor themselves can update their profile.
 *
 * @param {string} address - Ethereum wallet address
 * @body {UpdatePredictorProfileInput} Profile fields to update
 * @returns {Object} JSON response with updated predictor
 * @throws {403} If caller is not the predictor or predictor is blacklisted
 * @throws {404} If predictor not found
 */
export const updatePredictorProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params as GetPredictorByAddressParams;
  const data = req.body as UpdatePredictorProfileInput;
  const callerAddress = req.user!.address;

  const predictor = await PredictorService.updateProfile(address, data, callerAddress);

  res.json({
    success: true,
    data: predictor,
  });
});

/**
 * GET /api/predictors/:address/check
 * Checks if an address is an active (non-blacklisted) predictor.
 * Useful for frontend validation before allowing signal creation.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with isPredictor boolean
 */
export const checkPredictorStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params as GetPredictorByAddressParams;

  const isActive = await PredictorService.isActivePredictor(address);

  res.json({
    success: true,
    data: {
      address,
      isPredictor: isActive,
    },
  });
});

/**
 * GET /api/predictors/:address/earnings
 * Gets a predictor's total earnings from signal sales.
 * Requires authentication - only the predictor can view their earnings.
 *
 * @param {string} address - Ethereum wallet address
 * @returns {Object} JSON response with earnings breakdown
 * @throws {403} If caller is not the predictor
 * @throws {404} If predictor not found
 */
export const getPredictorEarnings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params as GetPredictorByAddressParams;
  const callerAddress = req.user!.address;

  // Only allow predictor to view their own earnings
  if (address.toLowerCase() !== callerAddress.toLowerCase()) {
    res.status(403).json({
      success: false,
      error: "You can only view your own earnings",
    });
    return;
  }

  const earnings = await PredictorService.getEarnings(address);

  res.json({
    success: true,
    data: earnings,
  });
});

/**
 * POST /api/predictors/:address/apply-verification
 * Apply for profile verification.
 * Requires 100+ sales (or 100 more sales if previously rejected).
 */
export const applyForVerification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params as GetPredictorByAddressParams;
  const callerAddress = req.user!.address;

  const predictor = await PredictorService.applyForVerification(address, callerAddress);

  res.json({
    success: true,
    message: "Verification application submitted. An admin will review your profile.",
    data: predictor,
  });
});

/**
 * GET /api/predictors/check-unique
 * Checks if a field value (displayName, telegram, discord) is available.
 * Used for real-time validation in the edit profile form.
 *
 * @query {string} field - Field to check (displayName, telegram, discord)
 * @query {string} value - Value to check for uniqueness
 * @query {string} [excludeAddress] - Address to exclude (current user)
 * @returns {Object} JSON response with { available: boolean }
 */
export const checkFieldUniqueness = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as CheckFieldUniquenessQuery;

  const result = await PredictorService.checkFieldUniqueness(query);

  res.json({
    success: true,
    data: result,
  });
});
