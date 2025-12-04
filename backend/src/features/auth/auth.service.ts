/**
 * @fileoverview Business logic service for SIWE + JWT authentication.
 *
 * Implements Sign-In with Ethereum (SIWE) authentication flow:
 * 1. Generate nonce for wallet address
 * 2. User signs SIWE message with wallet
 * 3. Verify signature and issue JWT
 *
 * @module features/auth/auth.service
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/auth/auth.service.ts
import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { Predictor } from "../predictors/predictor.model.js";
import type { Address } from "viem";
import type { NonceStore, NonceResponse, VerifyResponse, AuthPredictor } from "./auth.types.js";

/**
 * In-memory nonce store for SIWE authentication.
 * Maps lowercase wallet addresses to nonce data.
 *
 * @note Use Redis in production for scalability across multiple server instances
 */
const nonceStore: NonceStore = {};

/** Nonce expiration time in milliseconds (5 minutes) */
const NONCE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Service class for authentication business logic.
 * Handles SIWE nonce generation, signature verification, and JWT issuance.
 */
export class AuthService {
  /**
   * Generates a cryptographic nonce for SIWE authentication.
   * Stores the nonce with expiration time for later verification.
   *
   * @param address - The wallet address requesting authentication
   * @returns Object containing the generated nonce
   */
  static generateNonce(address: string): NonceResponse {
    const normalizedAddress = address.toLowerCase();
    const nonce = generateNonce();

    nonceStore[normalizedAddress] = {
      nonce,
      expiresAt: Date.now() + NONCE_EXPIRY_MS,
    };

    return { nonce };
  }

  /**
   * Verifies a SIWE message signature and issues a JWT token.
   *
   * Verification steps:
   * 1. Parse and verify the SIWE message signature
   * 2. Validate nonce exists and hasn't expired
   * 3. Validate chain ID matches expected network
   * 4. Generate and return JWT token
   *
   * @param message - The SIWE message that was signed
   * @param signature - The cryptographic signature of the message
   * @returns Object containing JWT token and verified address
   * @throws {ApiError} 401 if nonce is missing, expired, or invalid
   * @throws {ApiError} 400 if chain ID doesn't match
   */
  static async verify(message: string, signature: string): Promise<VerifyResponse> {
    const siweMessage = new SiweMessage(message);

    // Verify the signature
    const { data: fields } = await siweMessage.verify({ signature });

    const normalizedAddress = fields.address.toLowerCase();

    // Check nonce exists and hasn't expired
    const storedNonce = nonceStore[normalizedAddress];
    if (!storedNonce) {
      throw ApiError.unauthorized("No nonce found for this address. Request a new nonce.");
    }

    if (Date.now() > storedNonce.expiresAt) {
      delete nonceStore[normalizedAddress];
      throw ApiError.unauthorized("Nonce expired. Request a new nonce.");
    }

    if (storedNonce.nonce !== fields.nonce) {
      throw ApiError.unauthorized("Invalid nonce");
    }

    // Clear used nonce (one-time use)
    delete nonceStore[normalizedAddress];

    // Validate chain ID
    if (fields.chainId !== env.CHAIN_ID) {
      throw ApiError.badRequest(`Invalid chain ID. Expected ${env.CHAIN_ID}`);
    }

    // Generate JWT
    const token = jwt.sign(
      { address: fields.address as Address },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Look up predictor data (if user is a registered predictor)
    let predictor: AuthPredictor | null = null;
    const predictorDoc = await Predictor.findOne({ walletAddress: normalizedAddress });
    
    if (predictorDoc) {
      predictor = {
        _id: predictorDoc._id.toString(),
        walletAddress: predictorDoc.walletAddress,
        tokenId: predictorDoc.tokenId,
        displayName: predictorDoc.displayName,
        bio: predictorDoc.bio,
        avatarUrl: predictorDoc.avatarUrl,
        socialLinks: {
          twitter: predictorDoc.socialLinks?.twitter,
          telegram: predictorDoc.socialLinks?.telegram,
          discord: predictorDoc.socialLinks?.discord,
        },
        preferredContact: predictorDoc.preferredContact,
        categoryIds: predictorDoc.categoryIds.map((id) => id.toString()),
        totalSignals: predictorDoc.totalSignals,
        totalSales: predictorDoc.totalSales,
        averageRating: predictorDoc.averageRating,
        totalReviews: predictorDoc.totalReviews,
        isVerified: predictorDoc.isVerified,
        isBlacklisted: predictorDoc.isBlacklisted,
        joinedAt: predictorDoc.joinedAt.toISOString(),
        createdAt: predictorDoc.createdAt.toISOString(),
        updatedAt: predictorDoc.updatedAt.toISOString(),
      };
    }

    return {
      token,
      predictor,
    };
  }

  /**
   * Removes expired nonces from the in-memory store.
   * Called periodically to prevent memory buildup.
   */
  static cleanupExpiredNonces(): void {
    const now = Date.now();
    for (const address of Object.keys(nonceStore)) {
      if (nonceStore[address] && nonceStore[address].expiresAt < now) {
        delete nonceStore[address];
      }
    }
  }
}

// Cleanup expired nonces every 5 minutes
setInterval(() => AuthService.cleanupExpiredNonces(), 5 * 60 * 1000);
