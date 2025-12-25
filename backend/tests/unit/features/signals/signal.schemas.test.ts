/**
 * @fileoverview Unit tests for Signal Zod schemas.
 *
 * Tests validation schemas for signal API endpoints including:
 * - listSignalsSchema (query params)
 * - getSignalByContentIdSchema (path params)
 * - createSignalSchema (body)
 * - updateSignalSchema (body)
 *
 * @module tests/unit/features/signals/signal.schemas.test
 */

import { describe, it, expect } from "vitest";
import {
  listSignalsSchema,
  getSignalByContentIdSchema,
  createSignalSchema,
  updateSignalSchema,
} from "../../../../src/features/signals/signal.schemas.js";

describe("Signal Schemas", () => {
  describe("listSignalsSchema", () => {
    it("should accept empty query (uses defaults)", () => {
      const result = listSignalsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortOrder).toBe("desc");
        expect(result.data.active).toBe(true);
      }
    });

    it("should accept valid query parameters", () => {
      const result = listSignalsSchema.safeParse({
        page: "2",
        limit: "10",
        sortBy: "totalSales",
        sortOrder: "asc",
        search: "bitcoin",
        categoryId: "507f1f77bcf86cd799439011",
        minPrice: "5",
        maxPrice: "100",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("totalSales");
        expect(result.data.sortOrder).toBe("asc");
        expect(result.data.search).toBe("bitcoin");
        expect(result.data.minPrice).toBe(5);
        expect(result.data.maxPrice).toBe(100);
      }
    });

    it("should transform active string to boolean", () => {
      const resultTrue = listSignalsSchema.safeParse({ active: "true" });
      expect(resultTrue.success).toBe(true);
      if (resultTrue.success) {
        expect(resultTrue.data.active).toBe(true);
      }

      const resultFalse = listSignalsSchema.safeParse({ active: "false" });
      expect(resultFalse.success).toBe(true);
      if (resultFalse.success) {
        expect(resultFalse.data.active).toBe(false);
      }
    });

    it("should coerce page and limit to numbers", () => {
      const result = listSignalsSchema.safeParse({
        page: "5",
        limit: "25",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe("number");
        expect(typeof result.data.limit).toBe("number");
      }
    });

    it("should reject page less than 1", () => {
      const result = listSignalsSchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 50", () => {
      const result = listSignalsSchema.safeParse({ limit: "100" });
      expect(result.success).toBe(false);
    });

    it("should accept all valid sortBy options", () => {
      const validSorts = ["createdAt", "totalSales", "averageRating", "priceUsdt"];
      for (const sortBy of validSorts) {
        const result = listSignalsSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid sortBy values", () => {
      const result = listSignalsSchema.safeParse({ sortBy: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should accept valid predictor address", () => {
      const result = listSignalsSchema.safeParse({
        predictorAddress: "0x1234567890abcdef1234567890abcdef12345678",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid predictor address", () => {
      const result = listSignalsSchema.safeParse({
        predictorAddress: "invalid-address",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid excludeBuyerAddress", () => {
      const result = listSignalsSchema.safeParse({
        excludeBuyerAddress: "0x1234567890abcdef1234567890abcdef12345678",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid risk levels", () => {
      for (const riskLevel of ["low", "medium", "high"]) {
        const result = listSignalsSchema.safeParse({ riskLevel });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid risk levels", () => {
      const result = listSignalsSchema.safeParse({ riskLevel: "extreme" });
      expect(result.success).toBe(false);
    });

    it("should accept valid potential rewards", () => {
      for (const potentialReward of ["normal", "medium", "high"]) {
        const result = listSignalsSchema.safeParse({ potentialReward });
        expect(result.success).toBe(true);
      }
    });

    it("should reject search over 100 characters", () => {
      const result = listSignalsSchema.safeParse({
        search: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should accept mainGroup filter", () => {
      const result = listSignalsSchema.safeParse({
        mainGroup: "Crypto",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mainGroup).toBe("Crypto");
      }
    });

    it("should coerce minPrice and maxPrice to numbers", () => {
      const result = listSignalsSchema.safeParse({
        minPrice: "10",
        maxPrice: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.minPrice).toBe("number");
        expect(typeof result.data.maxPrice).toBe("number");
      }
    });

    it("should reject negative minPrice", () => {
      const result = listSignalsSchema.safeParse({ minPrice: "-5" });
      expect(result.success).toBe(false);
    });
  });

  describe("getSignalByContentIdSchema", () => {
    it("should accept valid UUID v4 content ID", () => {
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should accept lowercase UUID", () => {
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should accept uppercase UUID", () => {
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "550E8400-E29B-41D4-A716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject UUID without dashes", () => {
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "550e8400e29b41d4a716446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty content ID", () => {
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing content ID", () => {
      const result = getSignalByContentIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID format", () => {
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should enforce UUID v4 format (4 in third group)", () => {
      // UUID v1 should fail (version is 1, not 4)
      const result = getSignalByContentIdSchema.safeParse({
        contentId: "550e8400-e29b-11d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createSignalSchema", () => {
    const validSignal = {
      title: "BTC Long Signal",
      description: "Bitcoin looking bullish on 4H chart",
      content: "Entry: $50,000, TP: $55,000, SL: $48,000",
      categoryId: "507f1f77bcf86cd799439011",
      priceUsdt: 10,
      expiryDays: 7,
      riskLevel: "medium",
      potentialReward: "high",
    };

    it("should accept valid signal data", () => {
      const result = createSignalSchema.safeParse(validSignal);
      expect(result.success).toBe(true);
    });

    describe("title validation", () => {
      it("should reject empty title", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          title: "",
        });
        expect(result.success).toBe(false);
      });

      it("should reject title over 100 characters", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          title: "a".repeat(101),
        });
        expect(result.success).toBe(false);
      });

      it("should accept title at max length (100)", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          title: "a".repeat(100),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("description validation", () => {
      it("should reject empty description", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          description: "",
        });
        expect(result.success).toBe(false);
      });

      it("should reject description over 1000 characters", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          description: "a".repeat(1001),
        });
        expect(result.success).toBe(false);
      });
    });

    describe("content validation", () => {
      it("should reject empty content", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          content: "",
        });
        expect(result.success).toBe(false);
      });

      it("should reject content over 1000 characters", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          content: "a".repeat(1001),
        });
        expect(result.success).toBe(false);
      });
    });

    describe("priceUsdt validation", () => {
      it("should accept minimum price (1 USDT)", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          priceUsdt: 1,
        });
        expect(result.success).toBe(true);
      });

      it("should reject price below minimum", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          priceUsdt: 0.5,
        });
        expect(result.success).toBe(false);
      });

      it("should reject price above maximum (100000)", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          priceUsdt: 100001,
        });
        expect(result.success).toBe(false);
      });

      it("should accept price with 2 decimal places", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          priceUsdt: 10.99,
        });
        expect(result.success).toBe(true);
      });

      it("should reject price with more than 2 decimal places", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          priceUsdt: 10.999,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("expiryDays validation", () => {
      it("should accept minimum expiry (1 day)", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          expiryDays: 1,
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum expiry (7 days)", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          expiryDays: 7,
        });
        expect(result.success).toBe(true);
      });

      it("should reject expiry less than 1 day", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          expiryDays: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject expiry more than 7 days", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          expiryDays: 8,
        });
        expect(result.success).toBe(false);
      });

      it("should reject non-integer expiry", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          expiryDays: 7.5,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("riskLevel validation", () => {
      it("should accept all valid risk levels", () => {
        for (const riskLevel of ["low", "medium", "high"]) {
          const result = createSignalSchema.safeParse({
            ...validSignal,
            riskLevel,
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid risk level", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          riskLevel: "extreme",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("potentialReward validation", () => {
      it("should accept all valid potential rewards", () => {
        for (const potentialReward of ["normal", "medium", "high"]) {
          const result = createSignalSchema.safeParse({
            ...validSignal,
            potentialReward,
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid potential reward", () => {
        const result = createSignalSchema.safeParse({
          ...validSignal,
          potentialReward: "extreme",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("required fields", () => {
      it("should reject missing title", () => {
        const { title, ...withoutTitle } = validSignal;
        const result = createSignalSchema.safeParse(withoutTitle);
        expect(result.success).toBe(false);
      });

      it("should reject missing description", () => {
        const { description, ...withoutDesc } = validSignal;
        const result = createSignalSchema.safeParse(withoutDesc);
        expect(result.success).toBe(false);
      });

      it("should reject missing content", () => {
        const { content, ...withoutContent } = validSignal;
        const result = createSignalSchema.safeParse(withoutContent);
        expect(result.success).toBe(false);
      });

      it("should reject missing categoryId", () => {
        const { categoryId, ...withoutCategory } = validSignal;
        const result = createSignalSchema.safeParse(withoutCategory);
        expect(result.success).toBe(false);
      });

      it("should reject missing priceUsdt", () => {
        const { priceUsdt, ...withoutPrice } = validSignal;
        const result = createSignalSchema.safeParse(withoutPrice);
        expect(result.success).toBe(false);
      });

      it("should reject missing expiryDays", () => {
        const { expiryDays, ...withoutExpiry } = validSignal;
        const result = createSignalSchema.safeParse(withoutExpiry);
        expect(result.success).toBe(false);
      });

      it("should reject missing riskLevel", () => {
        const { riskLevel, ...withoutRisk } = validSignal;
        const result = createSignalSchema.safeParse(withoutRisk);
        expect(result.success).toBe(false);
      });

      it("should reject missing potentialReward", () => {
        const { potentialReward, ...withoutReward } = validSignal;
        const result = createSignalSchema.safeParse(withoutReward);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateSignalSchema", () => {
    it("should accept empty body (all fields optional)", () => {
      const result = updateSignalSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial updates", () => {
      const result = updateSignalSchema.safeParse({
        title: "Updated Title",
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple fields", () => {
      const result = updateSignalSchema.safeParse({
        title: "Updated Title",
        description: "Updated description",
        isActive: false,
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = updateSignalSchema.safeParse({
        title: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
      const result = updateSignalSchema.safeParse({
        description: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty content", () => {
      const result = updateSignalSchema.safeParse({
        content: "",
      });
      expect(result.success).toBe(false);
    });

    it("should accept isActive boolean", () => {
      const resultTrue = updateSignalSchema.safeParse({ isActive: true });
      expect(resultTrue.success).toBe(true);

      const resultFalse = updateSignalSchema.safeParse({ isActive: false });
      expect(resultFalse.success).toBe(true);
    });

    it("should reject isActive non-boolean", () => {
      const result = updateSignalSchema.safeParse({ isActive: "true" });
      expect(result.success).toBe(false);
    });
  });
});
