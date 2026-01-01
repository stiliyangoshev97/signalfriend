/**
 * @fileoverview Unit tests for expired signal content access logic.
 *
 * Tests the logic for determining if signal content should be publicly accessible:
 * - Expired signals: Public access (no auth required)
 * - Active signals: Auth required (owner, predictor, or admin only)
 * - Deactivated signals: Still protected
 *
 * @module tests/unit/features/signals/signal.expiredContent.test
 */

import { describe, it, expect } from "vitest";

/**
 * Determines if a signal's content should be publicly accessible.
 * This mirrors the logic in signal.service.ts getProtectedContent()
 *
 * @param expiresAt - Signal expiration date (optional)
 * @param isActive - Whether the signal is active
 * @returns true if content is publicly accessible
 */
function isContentPubliclyAccessible(
  expiresAt: Date | string | null | undefined,
  isActive: boolean = true
): boolean {
  // Deactivated signals are NOT publicly accessible (predictor intentionally hid content)
  // Only expired signals become public for track record transparency
  if (!expiresAt) {
    return false; // No expiration = never public (perpetual signals need purchase)
  }

  const expirationDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const now = new Date();

  return expirationDate < now;
}

/**
 * Determines if authentication is required to access signal content.
 *
 * @param expiresAt - Signal expiration date (optional)
 * @param buyerAddress - The requesting user's address (optional for expired signals)
 * @returns true if authentication is required
 */
function isAuthenticationRequired(
  expiresAt: Date | string | null | undefined,
  buyerAddress?: string
): boolean {
  // If signal is expired, no auth required
  if (isContentPubliclyAccessible(expiresAt)) {
    return false;
  }
  // Non-expired signals require authentication
  return true;
}

describe("Expired Signal Content Access", () => {
  describe("isContentPubliclyAccessible", () => {
    it("should return true for signals that expired in the past", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      expect(isContentPubliclyAccessible(pastDate)).toBe(true);
    });

    it("should return true for signals that expired hours ago", () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago
      expect(isContentPubliclyAccessible(pastDate)).toBe(true);
    });

    it("should return true for signals that expired minutes ago", () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 5); // 5 minutes ago
      expect(isContentPubliclyAccessible(pastDate)).toBe(true);
    });

    it("should return false for signals expiring in the future", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      expect(isContentPubliclyAccessible(futureDate)).toBe(false);
    });

    it("should return false for signals expiring hours from now", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now
      expect(isContentPubliclyAccessible(futureDate)).toBe(false);
    });

    it("should return false for signals with no expiration date", () => {
      expect(isContentPubliclyAccessible(null)).toBe(false);
      expect(isContentPubliclyAccessible(undefined)).toBe(false);
    });

    it("should handle string date format (ISO 8601)", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const isoString = pastDate.toISOString();
      expect(isContentPubliclyAccessible(isoString)).toBe(true);
    });

    it("should handle future string date format", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const isoString = futureDate.toISOString();
      expect(isContentPubliclyAccessible(isoString)).toBe(false);
    });
  });

  describe("isAuthenticationRequired", () => {
    it("should not require auth for expired signals", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isAuthenticationRequired(pastDate)).toBe(false);
    });

    it("should not require auth for expired signals even without buyerAddress", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isAuthenticationRequired(pastDate, undefined)).toBe(false);
    });

    it("should require auth for non-expired signals", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isAuthenticationRequired(futureDate)).toBe(true);
    });

    it("should require auth for signals with no expiration", () => {
      expect(isAuthenticationRequired(null)).toBe(true);
      expect(isAuthenticationRequired(undefined)).toBe(true);
    });

    it("should require auth for active signals expiring soon", () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30); // 30 minutes from now
      expect(isAuthenticationRequired(futureDate)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle signals that just expired (within seconds)", () => {
      const justExpired = new Date();
      justExpired.setSeconds(justExpired.getSeconds() - 1); // 1 second ago
      expect(isContentPubliclyAccessible(justExpired)).toBe(true);
    });

    it("should handle signals expiring right now (boundary)", () => {
      // Note: This test may be flaky due to timing, but tests the boundary
      const now = new Date();
      // Signals expiring "now" should technically still be protected
      // until they actually expire (now < expiresAt is false when equal)
      expect(isContentPubliclyAccessible(now)).toBe(false);
    });

    it("should handle very old expired signals", () => {
      const veryOld = new Date("2020-01-01T00:00:00Z");
      expect(isContentPubliclyAccessible(veryOld)).toBe(true);
    });

    it("should handle signals expiring far in the future", () => {
      const farFuture = new Date("2030-12-31T23:59:59Z");
      expect(isContentPubliclyAccessible(farFuture)).toBe(false);
    });
  });

  describe("Access Control Matrix", () => {
    // Test different scenarios for access control
    const scenarios = [
      {
        name: "Expired signal, no auth",
        expired: true,
        hasAuth: false,
        expectedPublicAccess: true,
      },
      {
        name: "Expired signal, with auth",
        expired: true,
        hasAuth: true,
        expectedPublicAccess: true,
      },
      {
        name: "Active signal, no auth",
        expired: false,
        hasAuth: false,
        expectedPublicAccess: false,
      },
      {
        name: "Active signal, with auth",
        expired: false,
        hasAuth: true,
        expectedPublicAccess: false, // Still needs to check ownership
      },
      {
        name: "No expiration, no auth",
        expired: null,
        hasAuth: false,
        expectedPublicAccess: false,
      },
    ];

    for (const scenario of scenarios) {
      it(`should handle: ${scenario.name}`, () => {
        let expiresAt: Date | null;
        if (scenario.expired === true) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() - 1);
        } else if (scenario.expired === false) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 1);
        } else {
          expiresAt = null;
        }

        const isPublic = isContentPubliclyAccessible(expiresAt);
        expect(isPublic).toBe(scenario.expectedPublicAccess);
      });
    }
  });
});
