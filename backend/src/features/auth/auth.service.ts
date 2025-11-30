import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type { Address } from "viem";
import type { NonceStore, NonceResponse, VerifyResponse } from "./auth.types.js";

// In-memory nonce store (use Redis in production for scalability)
const nonceStore: NonceStore = {};

const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export class AuthService {
  /**
   * Generate a nonce for SIWE authentication
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
   * Verify SIWE message and signature, return JWT
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

    // Clear used nonce
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

    return {
      token,
      address: fields.address as Address,
    };
  }

  /**
   * Clean up expired nonces (call periodically)
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
