/**
 * @fileoverview Public statistics service for SignalFriend.
 *
 * Provides aggregated platform statistics that can be displayed
 * publicly on the homepage without requiring authentication.
 *
 * @module features/stats/stats.service
 */

import { Predictor } from "../predictors/predictor.model.js";
import { Signal } from "../signals/signal.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { logger } from "../../shared/config/logger.js";

/** Platform fee configuration */
const PLATFORM_FEES = {
  COMMISSION_RATE: 0.05, // 5%
};

/**
 * Public platform statistics response type
 */
export interface PublicStats {
  /** Total number of signals (active, regardless of expiry) */
  totalSignals: number;
  /** Total number of registered predictors */
  totalPredictors: number;
  /** Total earnings paid out to predictors in USDT */
  totalPredictorEarnings: number;
  /** Total number of signal purchases */
  totalPurchases: number;
}

/**
 * Public statistics service.
 *
 * Provides read-only access to aggregated platform metrics
 * that can be safely exposed without authentication.
 */
export class StatsService {
  /**
   * Gets public platform statistics for the homepage.
   *
   * Statistics include:
   * - Total signals count (all active signals created)
   * - Total predictors count (excluding blacklisted)
   * - Total predictor earnings (95% of signal prices go to predictors)
   * - Total purchases count
   *
   * @returns Promise resolving to public platform statistics
   *
   * @example
   * ```typescript
   * const stats = await StatsService.getPublicStats();
   * // { totalSignals: 45, totalPredictors: 12, totalPredictorEarnings: 5420.50, totalPurchases: 234 }
   * ```
   */
  static async getPublicStats(): Promise<PublicStats> {
    // Count all active signals (regardless of expiry - shows total signals created)
    const totalSignals = await Signal.countDocuments({
      isActive: true,
    });

    // Count total predictors (excluding blacklisted)
    const totalPredictors = await Predictor.countDocuments({
      isBlacklisted: false,
    });

    // Get all receipts for calculating predictor earnings
    const receipts = await Receipt.find({}, { priceUsdt: 1 }).lean();
    const totalPurchases = receipts.length;

    // Calculate total signal volume
    const totalSignalVolume = receipts.reduce(
      (sum: number, receipt: { priceUsdt: number }) => sum + receipt.priceUsdt,
      0
    );

    // Predictors receive 95% of the signal price (5% platform commission)
    const totalPredictorEarnings =
      totalSignalVolume * (1 - PLATFORM_FEES.COMMISSION_RATE);

    const stats = {
      totalSignals,
      totalPredictors,
      totalPredictorEarnings: Math.round(totalPredictorEarnings * 100) / 100,
      totalPurchases,
    };

    logger.debug({ stats }, "Public stats fetched");

    return stats;
  }
}
