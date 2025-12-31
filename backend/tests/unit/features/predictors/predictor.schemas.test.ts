/**
 * @fileoverview Unit tests for Predictor Zod schemas.
 *
 * Tests validation schemas for predictor API endpoints including:
 * - listPredictorsSchema (query params)
 * - getPredictorByAddressSchema (path params)
 * - updatePredictorProfileSchema (body)
 * - isReservedDisplayName utility function
 *
 * @module tests/unit/features/predictors/predictor.schemas.test
 */

import { describe, it, expect } from "vitest";
import {
  listPredictorsSchema,
  getPredictorByAddressSchema,
  updatePredictorProfileSchema,
  isReservedDisplayName,
  RESERVED_DISPLAY_NAMES,
} from "../../../../src/features/predictors/predictor.schemas.js";

describe("Predictor Schemas", () => {
  describe("listPredictorsSchema", () => {
    it("should accept empty query (uses defaults)", () => {
      const result = listPredictorsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe("totalSales");
        expect(result.data.sortOrder).toBe("desc");
        expect(result.data.active).toBe(true);
      }
    });

    it("should accept valid query parameters", () => {
      const result = listPredictorsSchema.safeParse({
        page: "2",
        limit: "10",
        sortBy: "averageRating",
        sortOrder: "asc",
        search: "trader",
        categoryId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("averageRating");
        expect(result.data.sortOrder).toBe("asc");
        expect(result.data.search).toBe("trader");
      }
    });

    it("should transform active string to boolean", () => {
      const resultTrue = listPredictorsSchema.safeParse({ active: "true" });
      expect(resultTrue.success).toBe(true);
      if (resultTrue.success) {
        expect(resultTrue.data.active).toBe(true);
      }

      const resultFalse = listPredictorsSchema.safeParse({ active: "false" });
      expect(resultFalse.success).toBe(true);
      if (resultFalse.success) {
        expect(resultFalse.data.active).toBe(false);
      }
    });

    it("should transform verified string to boolean or undefined", () => {
      const resultTrue = listPredictorsSchema.safeParse({ verified: "true" });
      expect(resultTrue.success).toBe(true);
      if (resultTrue.success) {
        expect(resultTrue.data.verified).toBe(true);
      }

      const resultFalse = listPredictorsSchema.safeParse({ verified: "false" });
      expect(resultFalse.success).toBe(true);
      if (resultFalse.success) {
        expect(resultFalse.data.verified).toBe(false);
      }

      const resultUndefined = listPredictorsSchema.safeParse({});
      expect(resultUndefined.success).toBe(true);
      if (resultUndefined.success) {
        expect(resultUndefined.data.verified).toBeUndefined();
      }
    });

    it("should coerce page and limit to numbers", () => {
      const result = listPredictorsSchema.safeParse({
        page: "5",
        limit: "25",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe("number");
        expect(typeof result.data.limit).toBe("number");
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(25);
      }
    });

    it("should reject page less than 1", () => {
      const result = listPredictorsSchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 50", () => {
      const result = listPredictorsSchema.safeParse({ limit: "100" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid sortBy values", () => {
      const result = listPredictorsSchema.safeParse({ sortBy: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid sortOrder values", () => {
      const result = listPredictorsSchema.safeParse({ sortOrder: "random" });
      expect(result.success).toBe(false);
    });

    it("should accept all valid sortBy options", () => {
      const validSorts = ["totalSales", "averageRating", "joinedAt", "totalSignals", "totalEarnings"];
      for (const sortBy of validSorts) {
        const result = listPredictorsSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      }
    });

    it("should accept totalEarnings as sortBy option", () => {
      const result = listPredictorsSchema.safeParse({
        sortBy: "totalEarnings",
        sortOrder: "desc",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortBy).toBe("totalEarnings");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should reject search over 100 characters", () => {
      const result = listPredictorsSchema.safeParse({
        search: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getPredictorByAddressSchema", () => {
    it("should accept valid Ethereum address", () => {
      const result = getPredictorByAddressSchema.safeParse({
        address: "0x1234567890abcdef1234567890abcdef12345678",
      });
      expect(result.success).toBe(true);
    });

    it("should accept address with mixed case", () => {
      const result = getPredictorByAddressSchema.safeParse({
        address: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
      });
      expect(result.success).toBe(true);
    });

    it("should reject address without 0x prefix", () => {
      const result = getPredictorByAddressSchema.safeParse({
        address: "1234567890abcdef1234567890abcdef12345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject address with wrong length", () => {
      const result = getPredictorByAddressSchema.safeParse({
        address: "0x1234567890abcdef",
      });
      expect(result.success).toBe(false);
    });

    it("should reject address with invalid characters", () => {
      const result = getPredictorByAddressSchema.safeParse({
        address: "0x1234567890ghijkl1234567890ghijkl12345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty address", () => {
      const result = getPredictorByAddressSchema.safeParse({
        address: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing address", () => {
      const result = getPredictorByAddressSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updatePredictorProfileSchema", () => {
    it("should accept empty body (all fields optional)", () => {
      const result = updatePredictorProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept valid display name", () => {
      const result = updatePredictorProfileSchema.safeParse({
        displayName: "CryptoTrader123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject display name over 50 characters", () => {
      const result = updatePredictorProfileSchema.safeParse({
        displayName: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty display name", () => {
      const result = updatePredictorProfileSchema.safeParse({
        displayName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject reserved display names", () => {
      const reservedNames = ["admin", "Administrator", "signalfriend", "MODERATOR", "support"];
      for (const name of reservedNames) {
        const result = updatePredictorProfileSchema.safeParse({
          displayName: name,
        });
        expect(result.success).toBe(false);
      }
    });

    it("should accept valid bio", () => {
      const result = updatePredictorProfileSchema.safeParse({
        bio: "Professional crypto trader with 5 years experience.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject bio over 500 characters", () => {
      const result = updatePredictorProfileSchema.safeParse({
        bio: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    describe("avatarUrl validation", () => {
      it("should accept valid JPG URL", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/avatar.jpg",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid PNG URL", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/avatar.png",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid GIF URL", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/avatar.gif",
        });
        expect(result.success).toBe(true);
      });

      it("should accept JPEG extension", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/avatar.jpeg",
        });
        expect(result.success).toBe(true);
      });

      it("should accept URLs with query parameters", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/avatar.jpg?size=200",
        });
        expect(result.success).toBe(true);
      });

      it("should reject SVG URLs (security)", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/avatar.svg",
        });
        expect(result.success).toBe(false);
      });

      it("should reject non-image URLs", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "https://example.com/file.pdf",
        });
        expect(result.success).toBe(false);
      });

      it("should reject invalid URL format", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "not-a-url",
        });
        expect(result.success).toBe(false);
      });

      it("should accept empty string (to clear avatar)", () => {
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: "",
        });
        expect(result.success).toBe(true);
      });

      it("should reject URL over 500 characters", () => {
        const longUrl = "https://example.com/" + "a".repeat(490) + ".jpg";
        const result = updatePredictorProfileSchema.safeParse({
          avatarUrl: longUrl,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("socialLinks validation", () => {
      it("should accept valid social links", () => {
        const result = updatePredictorProfileSchema.safeParse({
          socialLinks: {
            twitter: "cryptotrader",
            telegram: "@cryptotrader",
            discord: "cryptotrader#1234",
          },
        });
        expect(result.success).toBe(true);
      });

      it("should accept partial social links", () => {
        const result = updatePredictorProfileSchema.safeParse({
          socialLinks: {
            twitter: "cryptotrader",
          },
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty social links", () => {
        const result = updatePredictorProfileSchema.safeParse({
          socialLinks: {},
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty strings for social links (to clear)", () => {
        const result = updatePredictorProfileSchema.safeParse({
          socialLinks: {
            twitter: "",
            telegram: "",
            discord: "",
          },
        });
        expect(result.success).toBe(true);
      });

      it("should reject social links over 100 characters", () => {
        const result = updatePredictorProfileSchema.safeParse({
          socialLinks: {
            twitter: "a".repeat(101),
          },
        });
        expect(result.success).toBe(false);
      });
    });

    describe("preferredContact validation", () => {
      it("should accept telegram as preferred contact", () => {
        const result = updatePredictorProfileSchema.safeParse({
          preferredContact: "telegram",
        });
        expect(result.success).toBe(true);
      });

      it("should accept discord as preferred contact", () => {
        const result = updatePredictorProfileSchema.safeParse({
          preferredContact: "discord",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid preferred contact", () => {
        const result = updatePredictorProfileSchema.safeParse({
          preferredContact: "email",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("categoryIds validation", () => {
      it("should accept valid category IDs array", () => {
        const result = updatePredictorProfileSchema.safeParse({
          categoryIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty array", () => {
        const result = updatePredictorProfileSchema.safeParse({
          categoryIds: [],
        });
        expect(result.success).toBe(true);
      });

      it("should reject more than 5 categories", () => {
        const result = updatePredictorProfileSchema.safeParse({
          categoryIds: [
            "507f1f77bcf86cd799439011",
            "507f1f77bcf86cd799439012",
            "507f1f77bcf86cd799439013",
            "507f1f77bcf86cd799439014",
            "507f1f77bcf86cd799439015",
            "507f1f77bcf86cd799439016",
          ],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("full profile update", () => {
      it("should accept all fields together", () => {
        const result = updatePredictorProfileSchema.safeParse({
          displayName: "CryptoTrader",
          bio: "Professional trader",
          avatarUrl: "https://example.com/avatar.png",
          socialLinks: {
            twitter: "trader",
            telegram: "@trader",
            discord: "trader#1234",
          },
          preferredContact: "telegram",
          categoryIds: ["507f1f77bcf86cd799439011"],
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("isReservedDisplayName", () => {
    it("should return true for exact reserved names", () => {
      for (const reserved of RESERVED_DISPLAY_NAMES) {
        expect(isReservedDisplayName(reserved)).toBe(true);
      }
    });

    it("should return true for reserved names in uppercase", () => {
      expect(isReservedDisplayName("ADMIN")).toBe(true);
      expect(isReservedDisplayName("ADMINISTRATOR")).toBe(true);
      expect(isReservedDisplayName("SIGNALFRIEND")).toBe(true);
    });

    it("should return true for reserved names in mixed case", () => {
      expect(isReservedDisplayName("Admin")).toBe(true);
      expect(isReservedDisplayName("SignalFriend")).toBe(true);
      expect(isReservedDisplayName("MoDeRaToR")).toBe(true);
    });

    it("should return true for names starting with reserved words", () => {
      expect(isReservedDisplayName("admin123")).toBe(true);
      expect(isReservedDisplayName("adminOfficial")).toBe(true);
      expect(isReservedDisplayName("supportTeam")).toBe(true);
    });

    it("should return true for names containing signalfriend", () => {
      expect(isReservedDisplayName("signalfriend_official")).toBe(true);
      expect(isReservedDisplayName("the_signalfriend")).toBe(true);
      expect(isReservedDisplayName("xxsignalfriendxx")).toBe(true);
    });

    it("should return false for legitimate usernames", () => {
      expect(isReservedDisplayName("CryptoTrader")).toBe(false);
      expect(isReservedDisplayName("BitcoinBull")).toBe(false);
      expect(isReservedDisplayName("TradingPro")).toBe(false);
    });

    it("should handle names with special characters", () => {
      // Special characters are stripped, so "ad-min" becomes "admin"
      expect(isReservedDisplayName("ad-min")).toBe(true);
      expect(isReservedDisplayName("admin_123")).toBe(true);
      expect(isReservedDisplayName("signal.friend")).toBe(true);
    });

    it("should return false for similar but not reserved names", () => {
      // These don't start with reserved words or contain signalfriend
      expect(isReservedDisplayName("xyzadminxyz")).toBe(false); // doesn't start with admin
      expect(isReservedDisplayName("trader")).toBe(false);
    });
  });
});
