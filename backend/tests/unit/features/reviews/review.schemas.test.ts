/**
 * @fileoverview Unit tests for Review Zod schemas.
 *
 * Tests validation schemas for review/rating API endpoints including:
 * - listSignalReviewsSchema (query params)
 * - listPredictorReviewsSchema (query params)
 * - signalContentIdSchema (path params)
 * - predictorAddressSchema (path params)
 * - createReviewSchema (body)
 * - updateReviewSchema (body)
 *
 * @module tests/unit/features/reviews/review.schemas.test
 */

import { describe, it, expect } from "vitest";
import {
  listSignalReviewsSchema,
  listPredictorReviewsSchema,
  signalContentIdSchema,
  predictorAddressSchema,
  createReviewSchema,
  updateReviewSchema,
  reviewTokenIdSchema,
} from "../../../../src/features/reviews/review.schemas.js";

describe("Review Schemas", () => {
  describe("listSignalReviewsSchema", () => {
    it("should accept empty query (uses defaults)", () => {
      const result = listSignalReviewsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid pagination parameters", () => {
      const result = listSignalReviewsSchema.safeParse({
        page: "3",
        limit: "15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(15);
      }
    });

    it("should coerce string numbers to numbers", () => {
      const result = listSignalReviewsSchema.safeParse({
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
      const result = listSignalReviewsSchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 50", () => {
      const result = listSignalReviewsSchema.safeParse({ limit: "100" });
      expect(result.success).toBe(false);
    });

    it("should reject negative limit", () => {
      const result = listSignalReviewsSchema.safeParse({ limit: "-5" });
      expect(result.success).toBe(false);
    });
  });

  describe("listPredictorReviewsSchema", () => {
    it("should accept empty query (uses defaults)", () => {
      const result = listPredictorReviewsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid pagination parameters", () => {
      const result = listPredictorReviewsSchema.safeParse({
        page: "2",
        limit: "10",
      });
      expect(result.success).toBe(true);
    });

    it("should reject page less than 1", () => {
      const result = listPredictorReviewsSchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 50", () => {
      const result = listPredictorReviewsSchema.safeParse({ limit: "51" });
      expect(result.success).toBe(false);
    });
  });

  describe("signalContentIdSchema", () => {
    it("should accept valid UUID v4 content ID", () => {
      const result = signalContentIdSchema.safeParse({
        contentId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID format", () => {
      const result = signalContentIdSchema.safeParse({
        contentId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject UUID without dashes", () => {
      const result = signalContentIdSchema.safeParse({
        contentId: "550e8400e29b41d4a716446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty content ID", () => {
      const result = signalContentIdSchema.safeParse({
        contentId: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing content ID", () => {
      const result = signalContentIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should enforce UUID v4 format", () => {
      // Invalid: version is 1 instead of 4
      const result = signalContentIdSchema.safeParse({
        contentId: "550e8400-e29b-11d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("predictorAddressSchema", () => {
    it("should accept valid Ethereum address", () => {
      const result = predictorAddressSchema.safeParse({
        address: "0x1234567890abcdef1234567890abcdef12345678",
      });
      expect(result.success).toBe(true);
    });

    it("should accept checksummed address", () => {
      const result = predictorAddressSchema.safeParse({
        address: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
      });
      expect(result.success).toBe(true);
    });

    it("should reject address without 0x prefix", () => {
      const result = predictorAddressSchema.safeParse({
        address: "1234567890abcdef1234567890abcdef12345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject address with wrong length", () => {
      const result = predictorAddressSchema.safeParse({
        address: "0x1234567890abcdef",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid hex characters", () => {
      const result = predictorAddressSchema.safeParse({
        address: "0x1234567890ghijkl1234567890ghijkl12345678",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createReviewSchema", () => {
    it("should accept valid review data", () => {
      const result = createReviewSchema.safeParse({
        tokenId: 1,
        score: 5,
      });
      expect(result.success).toBe(true);
    });

    describe("tokenId validation", () => {
      it("should accept tokenId of 0", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 0,
          score: 4,
        });
        expect(result.success).toBe(true);
      });

      it("should accept large tokenId", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1000000,
          score: 3,
        });
        expect(result.success).toBe(true);
      });

      it("should reject negative tokenId", () => {
        const result = createReviewSchema.safeParse({
          tokenId: -1,
          score: 4,
        });
        expect(result.success).toBe(false);
      });

      it("should reject non-integer tokenId", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1.5,
          score: 4,
        });
        expect(result.success).toBe(false);
      });

      it("should reject missing tokenId", () => {
        const result = createReviewSchema.safeParse({
          score: 4,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("score validation", () => {
      it("should accept score of 1 (minimum)", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
          score: 1,
        });
        expect(result.success).toBe(true);
      });

      it("should accept score of 5 (maximum)", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
          score: 5,
        });
        expect(result.success).toBe(true);
      });

      it("should accept all valid scores (1-5)", () => {
        for (let score = 1; score <= 5; score++) {
          const result = createReviewSchema.safeParse({
            tokenId: 1,
            score,
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject score of 0", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
          score: 0,
        });
        expect(result.success).toBe(false);
      });

      it("should reject score above 5", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
          score: 6,
        });
        expect(result.success).toBe(false);
      });

      it("should reject negative score", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
          score: -1,
        });
        expect(result.success).toBe(false);
      });

      it("should reject non-integer score", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
          score: 3.5,
        });
        expect(result.success).toBe(false);
      });

      it("should reject missing score", () => {
        const result = createReviewSchema.safeParse({
          tokenId: 1,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateReviewSchema", () => {
    it("should accept valid score", () => {
      const result = updateReviewSchema.safeParse({
        score: 4,
      });
      expect(result.success).toBe(true);
    });

    it("should accept all valid scores (1-5)", () => {
      for (let score = 1; score <= 5; score++) {
        const result = updateReviewSchema.safeParse({ score });
        expect(result.success).toBe(true);
      }
    });

    it("should reject score of 0", () => {
      const result = updateReviewSchema.safeParse({ score: 0 });
      expect(result.success).toBe(false);
    });

    it("should reject score above 5", () => {
      const result = updateReviewSchema.safeParse({ score: 6 });
      expect(result.success).toBe(false);
    });

    it("should reject missing score", () => {
      const result = updateReviewSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("reviewTokenIdSchema", () => {
    it("should accept valid tokenId", () => {
      const result = reviewTokenIdSchema.safeParse({
        tokenId: "1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tokenId).toBe(1);
      }
    });

    it("should coerce string to number", () => {
      const result = reviewTokenIdSchema.safeParse({
        tokenId: "123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.tokenId).toBe("number");
        expect(result.data.tokenId).toBe(123);
      }
    });

    it("should accept tokenId of 0", () => {
      const result = reviewTokenIdSchema.safeParse({
        tokenId: "0",
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative tokenId", () => {
      const result = reviewTokenIdSchema.safeParse({
        tokenId: "-1",
      });
      expect(result.success).toBe(false);
    });
  });
});
