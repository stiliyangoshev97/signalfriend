/**
 * @fileoverview Unit tests for contentId utility functions.
 *
 * Tests UUID ↔ bytes32 conversion functions used for
 * on-chain content identifier storage.
 *
 * @module tests/unit/utils/contentId.test
 */

import { describe, it, expect } from "vitest";
import {
  uuidToBytes32,
  bytes32ToUuid,
  isValidUuid,
  isValidBytes32,
} from "../../../src/shared/utils/contentId.js";

describe("contentId utilities", () => {
  // Test data
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  // UUID without dashes = 32 hex chars, padded to 64 hex chars for bytes32
  const expectedBytes32 =
    "0x550e8400e29b41d4a71644665544000000000000000000000000000000000000";

  describe("uuidToBytes32", () => {
    it("should convert a valid UUID to bytes32 format", () => {
      const result = uuidToBytes32(validUuid);
      expect(result).toBe(expectedBytes32);
    });

    it("should return a string starting with 0x", () => {
      const result = uuidToBytes32(validUuid);
      expect(result.startsWith("0x")).toBe(true);
    });

    it("should return a 66-character string (0x + 64 hex chars)", () => {
      const result = uuidToBytes32(validUuid);
      expect(result.length).toBe(66);
    });

    it("should handle lowercase UUID", () => {
      const lowercase = validUuid.toLowerCase();
      const result = uuidToBytes32(lowercase);
      expect(result).toBe(expectedBytes32.toLowerCase());
    });

    it("should handle uppercase UUID", () => {
      const uppercase = validUuid.toUpperCase();
      const result = uuidToBytes32(uppercase);
      expect(result.toLowerCase()).toBe(expectedBytes32.toLowerCase());
    });

    it("should pad with zeros on the right", () => {
      const result = uuidToBytes32(validUuid);
      // UUID = 32 hex chars, bytes32 = 64 hex chars, so 32 chars of padding
      expect(result.slice(-32)).toBe("00000000000000000000000000000000");
    });

    it("should produce unique bytes32 for different UUIDs", () => {
      const uuid1 = "550e8400-e29b-41d4-a716-446655440000";
      const uuid2 = "550e8400-e29b-41d4-a716-446655440001";
      const result1 = uuidToBytes32(uuid1);
      const result2 = uuidToBytes32(uuid2);
      expect(result1).not.toBe(result2);
    });
  });

  describe("bytes32ToUuid", () => {
    it("should convert bytes32 back to UUID format", () => {
      const result = bytes32ToUuid(expectedBytes32);
      expect(result).toBe(validUuid);
    });

    it("should return a properly formatted UUID with dashes", () => {
      const result = bytes32ToUuid(expectedBytes32);
      const parts = result.split("-");
      expect(parts.length).toBe(5);
      expect(parts[0].length).toBe(8); // 8
      expect(parts[1].length).toBe(4); // 4
      expect(parts[2].length).toBe(4); // 4
      expect(parts[3].length).toBe(4); // 4
      expect(parts[4].length).toBe(12); // 12
    });

    it("should handle lowercase bytes32 input", () => {
      const lowercase = expectedBytes32.toLowerCase();
      const result = bytes32ToUuid(lowercase);
      expect(result.toLowerCase()).toBe(validUuid.toLowerCase());
    });

    it("should handle uppercase bytes32 input", () => {
      const uppercase = expectedBytes32.toUpperCase();
      const result = bytes32ToUuid(uppercase);
      expect(result.toLowerCase()).toBe(validUuid.toLowerCase());
    });

    it("should ignore padding bytes (only use first 16 bytes)", () => {
      const withDifferentPadding =
        "0x550e8400e29b41d4a716446655440000ffffffffffffffffffffffffffffffff";
      const result = bytes32ToUuid(withDifferentPadding);
      expect(result).toBe(validUuid);
    });
  });

  describe("round-trip conversion", () => {
    it("should convert UUID → bytes32 → UUID without data loss", () => {
      const original = "123e4567-e89b-12d3-a456-426614174000";
      const bytes32 = uuidToBytes32(original);
      const recovered = bytes32ToUuid(bytes32);
      expect(recovered).toBe(original);
    });

    it("should handle multiple round-trips", () => {
      const original = "deadbeef-1234-5678-9abc-def012345678";
      let current = original;
      for (let i = 0; i < 5; i++) {
        const bytes32 = uuidToBytes32(current);
        current = bytes32ToUuid(bytes32);
      }
      expect(current).toBe(original);
    });

    it("should work with all-zeros UUID", () => {
      const zeros = "00000000-0000-0000-0000-000000000000";
      const bytes32 = uuidToBytes32(zeros);
      const recovered = bytes32ToUuid(bytes32);
      expect(recovered).toBe(zeros);
    });

    it("should work with all-f's UUID", () => {
      const allFs = "ffffffff-ffff-ffff-ffff-ffffffffffff";
      const bytes32 = uuidToBytes32(allFs);
      const recovered = bytes32ToUuid(bytes32);
      expect(recovered.toLowerCase()).toBe(allFs.toLowerCase());
    });
  });

  describe("isValidUuid", () => {
    it("should return true for valid UUID", () => {
      expect(isValidUuid(validUuid)).toBe(true);
    });

    it("should return true for uppercase UUID", () => {
      expect(isValidUuid(validUuid.toUpperCase())).toBe(true);
    });

    it("should return true for mixed case UUID", () => {
      expect(isValidUuid("550E8400-e29b-41D4-a716-446655440000")).toBe(true);
    });

    it("should return false for UUID without dashes", () => {
      expect(isValidUuid("550e8400e29b41d4a716446655440000")).toBe(false);
    });

    it("should return false for bytes32 format", () => {
      expect(isValidUuid(expectedBytes32)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidUuid("")).toBe(false);
    });

    it("should return false for wrong length", () => {
      expect(isValidUuid("550e8400-e29b-41d4-a716-44665544000")).toBe(false); // Too short
      expect(isValidUuid("550e8400-e29b-41d4-a716-4466554400001")).toBe(false); // Too long
    });

    it("should return false for invalid characters", () => {
      expect(isValidUuid("550g8400-e29b-41d4-a716-446655440000")).toBe(false); // 'g' is invalid
    });

    it("should return false for wrong dash positions", () => {
      expect(isValidUuid("550e84-00e29b-41d4-a716-446655440000")).toBe(false);
    });
  });

  describe("isValidBytes32", () => {
    it("should return true for valid bytes32", () => {
      expect(isValidBytes32(expectedBytes32)).toBe(true);
    });

    it("should return true for lowercase bytes32", () => {
      expect(isValidBytes32(expectedBytes32.toLowerCase())).toBe(true);
    });

    it("should return true for uppercase bytes32", () => {
      expect(isValidBytes32(expectedBytes32.toUpperCase())).toBe(true);
    });

    it("should return false for bytes32 without 0x prefix", () => {
      expect(isValidBytes32(expectedBytes32.slice(2))).toBe(false);
    });

    it("should return false for wrong length", () => {
      expect(isValidBytes32("0x550e8400e29b41d4a716446655440000")).toBe(false); // Too short (missing padding)
      expect(isValidBytes32(expectedBytes32 + "00")).toBe(false); // Too long
    });

    it("should return false for empty string", () => {
      expect(isValidBytes32("")).toBe(false);
    });

    it("should return false for UUID format", () => {
      expect(isValidBytes32(validUuid)).toBe(false);
    });

    it("should return false for invalid hex characters", () => {
      const invalid =
        "0xgg0e8400e29b41d4a7164466554400000000000000000000000000000000";
      expect(isValidBytes32(invalid)).toBe(false);
    });
  });
});
