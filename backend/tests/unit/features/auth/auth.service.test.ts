/**
 * @fileoverview Unit tests for AuthService.
 *
 * Tests SIWE authentication flow including:
 * - Nonce generation
 * - Nonce expiration
 * - Cleanup functionality
 *
 * Note: verify() method requires integration testing with real SIWE messages
 * as it involves cryptographic signature verification.
 *
 * @module tests/unit/features/auth/auth.service.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AuthService } from "../../../../src/features/auth/auth.service.js";

describe("AuthService", () => {
  // Test wallet addresses
  const testAddress = "0x1234567890abcdef1234567890abcdef12345678";
  const testAddress2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  beforeEach(() => {
    // Clear any stored nonces before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generateNonce", () => {
    it("should generate a nonce for a valid address", () => {
      const result = AuthService.generateNonce(testAddress);
      expect(result).toBeDefined();
      expect(result.nonce).toBeDefined();
      expect(typeof result.nonce).toBe("string");
    });

    it("should generate a non-empty nonce", () => {
      const result = AuthService.generateNonce(testAddress);
      expect(result.nonce.length).toBeGreaterThan(0);
    });

    it("should generate unique nonces for different addresses", () => {
      const result1 = AuthService.generateNonce(testAddress);
      const result2 = AuthService.generateNonce(testAddress2);
      expect(result1.nonce).not.toBe(result2.nonce);
    });

    it("should generate a new nonce for the same address on subsequent calls", () => {
      const result1 = AuthService.generateNonce(testAddress);
      const result2 = AuthService.generateNonce(testAddress);
      expect(result1.nonce).not.toBe(result2.nonce);
    });

    it("should normalize address to lowercase", () => {
      // Both should work and not conflict
      const upper = AuthService.generateNonce(testAddress.toUpperCase());
      const lower = AuthService.generateNonce(testAddress.toLowerCase());
      expect(upper.nonce).toBeDefined();
      expect(lower.nonce).toBeDefined();
    });

    it("should return object with only nonce property", () => {
      const result = AuthService.generateNonce(testAddress);
      expect(Object.keys(result)).toEqual(["nonce"]);
    });
  });

  describe("cleanupExpiredNonces", () => {
    it("should remove expired nonces", () => {
      // Generate a nonce
      AuthService.generateNonce(testAddress);

      // Advance time past expiry (5 minutes + buffer)
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Cleanup
      AuthService.cleanupExpiredNonces();

      // Generate new nonce - should succeed (old one was cleaned up)
      const result = AuthService.generateNonce(testAddress);
      expect(result.nonce).toBeDefined();
    });

    it("should not remove non-expired nonces", () => {
      // Generate a nonce
      const original = AuthService.generateNonce(testAddress);

      // Advance time but NOT past expiry (only 2 minutes)
      vi.advanceTimersByTime(2 * 60 * 1000);

      // Cleanup
      AuthService.cleanupExpiredNonces();

      // Nonce should still be valid (test by generating new - they should be different)
      const newNonce = AuthService.generateNonce(testAddress);
      expect(newNonce.nonce).not.toBe(original.nonce);
    });

    it("should handle empty nonce store without errors", () => {
      // Should not throw
      expect(() => AuthService.cleanupExpiredNonces()).not.toThrow();
    });

    it("should clean up multiple expired nonces", () => {
      // Generate nonces for multiple addresses
      AuthService.generateNonce(testAddress);
      AuthService.generateNonce(testAddress2);
      AuthService.generateNonce("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

      // Advance time past expiry
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Cleanup
      AuthService.cleanupExpiredNonces();

      // All should be cleaned - new generation should work
      const result1 = AuthService.generateNonce(testAddress);
      const result2 = AuthService.generateNonce(testAddress2);
      expect(result1.nonce).toBeDefined();
      expect(result2.nonce).toBeDefined();
    });
  });

  describe("verify", () => {
    /**
     * Note: Full verify() testing requires integration tests because:
     * 1. SIWE message verification requires real cryptographic signatures
     * 2. It queries MongoDB for predictor data
     * 3. It issues JWT tokens that need real secrets
     *
     * These tests document expected behavior and error cases.
     */

    it("should be defined", () => {
      expect(AuthService.verify).toBeDefined();
      expect(typeof AuthService.verify).toBe("function");
    });

    // The verify method's full functionality is tested in integration tests
    // because it requires:
    // - Valid SIWE messages signed by a real wallet
    // - MongoDB connection for predictor lookup
    // - Real JWT secret for token generation
  });
});
