/**
 * @fileoverview Public statistics controller for SignalFriend.
 *
 * Handles HTTP requests for public platform statistics.
 * No authentication required for these endpoints.
 *
 * @module features/stats/stats.controller
 */

import type { Request, Response } from "express";
import { StatsService } from "./stats.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

/**
 * Gets public platform statistics.
 *
 * @route GET /api/stats
 * @access Public (no authentication required)
 *
 * @returns {Object} Platform statistics
 * @returns {number} data.activeSignals - Count of active signals
 * @returns {number} data.totalPredictors - Count of registered predictors
 * @returns {number} data.totalPredictorEarnings - Total USDT earned by predictors
 * @returns {number} data.totalPurchases - Total signal purchases
 *
 * @example Response
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "activeSignals": 45,
 *     "totalPredictors": 12,
 *     "totalPredictorEarnings": 5420.50,
 *     "totalPurchases": 234
 *   }
 * }
 * ```
 */
export const getPublicStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await StatsService.getPublicStats();

    res.json({
      success: true,
      data: stats,
    });
  }
);
