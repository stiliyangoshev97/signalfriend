/**
 * @fileoverview Blockchain service for on-chain verification using viem.
 *
 * Provides functions for:
 * - NFT ownership verification (SignalKeyNFT, PredictorAccessPass)
 * - Predictor blacklist status checks
 * - Contract state queries
 *
 * Uses viem public client for read-only blockchain interactions.
 *
 * @module shared/services/blockchain.service
 */
import type { Address } from "viem";
import { publicClient } from "../../contracts/clients.js";
import { getAddresses } from "../../contracts/addresses.js";
import { signalKeyNFTAbi } from "../../contracts/abis/SignalKeyNFT.js";
import { predictorAccessPassAbi } from "../../contracts/abis/PredictorAccessPass.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

/**
 * Service class for blockchain interactions.
 * All methods are static for stateless operation.
 */
export class BlockchainService {
  private static addresses = getAddresses(env.CHAIN_ID);

  /**
   * Checks if an address owns a specific SignalKeyNFT token.
   *
   * @param tokenId - The NFT token ID to check
   * @param address - The address to verify ownership for
   * @returns Promise resolving to true if address owns the token
   */
  static async verifySignalKeyOwnership(
    tokenId: number,
    address: string
  ): Promise<boolean> {
    try {
      const owner = await publicClient.readContract({
        address: this.addresses.signalKeyNFT as Address,
        abi: signalKeyNFTAbi,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });

      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      // Token might not exist (burned, never minted)
      logger.debug({ tokenId, address, error }, "Error verifying SignalKeyNFT ownership");
      return false;
    }
  }

  /**
   * Checks if an address holds a PredictorAccessPass NFT.
   *
   * @param address - The address to check
   * @returns Promise resolving to true if address has a predictor pass
   */
  static async verifyPredictorStatus(address: string): Promise<boolean> {
    try {
      const balance = await publicClient.readContract({
        address: this.addresses.predictorAccessPass as Address,
        abi: predictorAccessPassAbi,
        functionName: "balanceOf",
        args: [address as Address],
      });

      return balance > 0n;
    } catch (error) {
      logger.error({ address, error }, "Error verifying predictor status");
      return false;
    }
  }

  /**
   * Checks if a predictor is blacklisted on-chain.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to true if predictor is blacklisted
   */
  static async isPredictorBlacklisted(address: string): Promise<boolean> {
    try {
      const isBlacklisted = await publicClient.readContract({
        address: this.addresses.predictorAccessPass as Address,
        abi: predictorAccessPassAbi,
        functionName: "isBlacklisted",
        args: [address as Address],
      });

      return isBlacklisted as boolean;
    } catch (error) {
      logger.error({ address, error }, "Error checking predictor blacklist status");
      return false;
    }
  }

  /**
   * Gets the owner of a SignalKeyNFT token.
   *
   * @param tokenId - The NFT token ID
   * @returns Promise resolving to the owner address, or null if token doesn't exist
   */
  static async getSignalKeyOwner(tokenId: number): Promise<string | null> {
    try {
      const owner = await publicClient.readContract({
        address: this.addresses.signalKeyNFT as Address,
        abi: signalKeyNFTAbi,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });

      return owner as string;
    } catch (error) {
      logger.debug({ tokenId, error }, "Error getting SignalKeyNFT owner");
      return null;
    }
  }

  /**
   * Gets the content identifier stored in a SignalKeyNFT.
   *
   * @param tokenId - The NFT token ID
   * @returns Promise resolving to the content identifier hex string
   */
  static async getSignalKeyContentId(tokenId: number): Promise<string | null> {
    try {
      const contentId = await publicClient.readContract({
        address: this.addresses.signalKeyNFT as Address,
        abi: signalKeyNFTAbi,
        functionName: "getContentIdentifier",
        args: [BigInt(tokenId)],
      });

      return contentId as string;
    } catch (error) {
      logger.debug({ tokenId, error }, "Error getting SignalKeyNFT content ID");
      return null;
    }
  }

  /**
   * Gets the predictor's NFT token ID by checking the predictor's ownership via balance.
   * Note: This method just checks if the address is a predictor (balance > 0).
   * The actual token ID is stored in MongoDB when the PredictorJoined event is indexed.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to true if address is a predictor
   */
  static async isPredictor(address: string): Promise<boolean> {
    try {
      const balance = await publicClient.readContract({
        address: this.addresses.predictorAccessPass as Address,
        abi: predictorAccessPassAbi,
        functionName: "balanceOf",
        args: [address as Address],
      });

      return balance > 0n;
    } catch (error) {
      logger.debug({ address, error }, "Error checking predictor status");
      return false;
    }
  }
}
