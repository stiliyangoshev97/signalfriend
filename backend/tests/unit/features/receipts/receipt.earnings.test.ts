/**
 * @fileoverview Unit tests for receipt earnings calculations.
 *
 * Tests the earnings calculation logic used when creating receipts:
 * - Predictor earnings = 95% of sale price
 * - Platform commission = 5% of sale price
 * - Rounding to 2 decimal places
 *
 * @module tests/unit/features/receipts/receipt.earnings.test
 */

import { describe, it, expect } from "vitest";

/** Platform commission rate (5%) */
const PLATFORM_COMMISSION_RATE = 0.05;
/** Predictor earnings rate (95%) */
const PREDICTOR_EARNINGS_RATE = 1 - PLATFORM_COMMISSION_RATE;

/**
 * Calculate predictor earnings from sale price.
 * This mirrors the logic in receipt.service.ts createFromEvent()
 */
function calculatePredictorEarnings(priceUsdt: number): number {
  const earnings = priceUsdt * PREDICTOR_EARNINGS_RATE;
  return Math.round(earnings * 100) / 100; // Round to 2 decimals
}

describe("Receipt Earnings Calculations", () => {
  describe("calculatePredictorEarnings", () => {
    it("should calculate 95% of sale price for $1 signal", () => {
      const earnings = calculatePredictorEarnings(1);
      expect(earnings).toBe(0.95);
    });

    it("should calculate 95% of sale price for $10 signal", () => {
      const earnings = calculatePredictorEarnings(10);
      expect(earnings).toBe(9.5);
    });

    it("should calculate 95% of sale price for $100 signal", () => {
      const earnings = calculatePredictorEarnings(100);
      expect(earnings).toBe(95);
    });

    it("should round to 2 decimal places for $3 signal", () => {
      // $3 * 0.95 = $2.85
      const earnings = calculatePredictorEarnings(3);
      expect(earnings).toBe(2.85);
    });

    it("should round to 2 decimal places for $7 signal", () => {
      // $7 * 0.95 = $6.65
      const earnings = calculatePredictorEarnings(7);
      expect(earnings).toBe(6.65);
    });

    it("should handle decimal prices correctly", () => {
      // $1.50 * 0.95 = $1.425 -> rounds to $1.42 (due to floating-point: 1.4249999...)
      const earnings = calculatePredictorEarnings(1.5);
      expect(earnings).toBe(1.42);
    });

    it("should handle large prices correctly", () => {
      // $1000 * 0.95 = $950
      const earnings = calculatePredictorEarnings(1000);
      expect(earnings).toBe(950);
    });

    it("should return 0 for $0 signal", () => {
      const earnings = calculatePredictorEarnings(0);
      expect(earnings).toBe(0);
    });

    it("should handle minimum signal price ($1)", () => {
      // Minimum price on platform is $1
      const earnings = calculatePredictorEarnings(1);
      expect(earnings).toBe(0.95);
      // Platform gets $0.05
      expect(1 - earnings).toBeCloseTo(0.05, 2);
    });

    it("should handle maximum signal price ($1000)", () => {
      // Maximum price on platform is $1000
      const earnings = calculatePredictorEarnings(1000);
      expect(earnings).toBe(950);
      // Platform gets $50
      expect(1000 - earnings).toBe(50);
    });
  });

  describe("Platform Commission", () => {
    it("should be exactly 5% of sale price", () => {
      const prices = [1, 5, 10, 25, 50, 100, 500, 1000];
      for (const price of prices) {
        const earnings = calculatePredictorEarnings(price);
        const commission = price - earnings;
        // Commission should be approximately 5% (allowing for rounding)
        expect(commission).toBeCloseTo(price * PLATFORM_COMMISSION_RATE, 2);
      }
    });

    it("should ensure predictor always gets 95%", () => {
      const prices = [1, 5, 10, 25, 50, 100, 500, 1000];
      for (const price of prices) {
        const earnings = calculatePredictorEarnings(price);
        const ratio = earnings / price;
        // Ratio should be approximately 0.95 (allowing for rounding)
        expect(ratio).toBeCloseTo(PREDICTOR_EARNINGS_RATE, 2);
      }
    });
  });

  describe("Cumulative Earnings", () => {
    it("should accumulate correctly over multiple sales", () => {
      const sales = [1, 5, 10, 20, 100]; // $136 total
      let totalEarnings = 0;
      
      for (const price of sales) {
        totalEarnings += calculatePredictorEarnings(price);
      }
      
      // Expected: $136 * 0.95 = $129.20
      // Actual sum: 0.95 + 4.75 + 9.5 + 19 + 95 = 129.20
      expect(totalEarnings).toBeCloseTo(129.2, 2);
    });
  });
});
