/**
 * @fileoverview Business logic service for Alchemy webhook processing.
 *
 * Handles blockchain event indexing via Alchemy Custom Webhooks:
 * - Signature verification for webhook security
 * - Event decoding using viem and contract ABIs
 * - Database updates based on blockchain events
 *
 * Supports both webhook types:
 * - GRAPHQL: Custom webhooks that capture all contract events (recommended)
 * - ADDRESS_ACTIVITY: Only captures token transfers (not used for custom events)
 *
 * Events handled:
 * - PredictorJoined: Creates new Predictor record
 * - SignalPurchased: Creates new Receipt record
 * - PredictorBlacklisted: Updates Predictor blacklist status
 *
 * @module features/webhooks/webhook.service
 */
import { createHmac } from "crypto";
import { decodeEventLog, formatUnits, type Address, type Hex } from "viem";
import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/config/logger.js";
import { PredictorService } from "../predictors/predictor.service.js";
import { ReceiptService } from "../receipts/receipt.service.js";
import { signalFriendMarketAbi } from "../../contracts/abis/SignalFriendMarket.js";
import { predictorAccessPassAbi } from "../../contracts/abis/PredictorAccessPass.js";
import type { 
  AlchemyGraphqlWebhookPayload, 
  AlchemyAddressActivityWebhookPayload 
} from "./webhook.schemas.js";
import { EVENT_SIGNATURES } from "./webhook.schemas.js";

/** Normalized event log structure used internally */
interface EventLog {
  address: string;
  topics: string[];
  data: string;
  transactionHash: string;
}

/**
 * Service class for Alchemy webhook processing.
 * Handles blockchain event verification, decoding, and database synchronization.
 */
export class WebhookService {
  /**
   * Verifies the HMAC-SHA256 signature of an Alchemy webhook request.
   * Ensures the webhook payload hasn't been tampered with.
   *
   * @param body - The raw JSON string body of the webhook request
   * @param signature - The x-alchemy-signature header value
   * @returns True if signature is valid or signing key not configured
   */
  static verifySignature(body: string, signature: string): boolean {
    if (!env.ALCHEMY_SIGNING_KEY) {
      logger.warn("ALCHEMY_SIGNING_KEY not set, skipping signature verification");
      return true; // Allow in development
    }

    const hmac = createHmac("sha256", env.ALCHEMY_SIGNING_KEY);
    hmac.update(body);
    const expectedSignature = hmac.digest("hex");

    return signature === expectedSignature;
  }

  /**
   * Processes a GraphQL webhook payload.
   * This is the recommended webhook type for custom contract events.
   *
   * @param payload - The validated GraphQL webhook payload
   */
  static async processGraphqlWebhook(payload: AlchemyGraphqlWebhookPayload): Promise<void> {
    const logs = payload.event.data.block.logs;

    logger.info({ 
      logsCount: logs.length, 
      webhookId: payload.webhookId 
    }, "Processing GraphQL webhook");

    for (const log of logs) {
      const topic0 = log.topics[0];
      if (!topic0) continue;

      // Normalize log structure
      const normalizedLog: EventLog = {
        address: log.account.address,
        topics: log.topics,
        data: log.data,
        transactionHash: log.transaction.hash,
      };

      try {
        await this.processEventLog(normalizedLog, topic0);
      } catch (error) {
        logger.error({
          err: error,
          topic: topic0,
          txHash: log.transaction.hash,
        }, "Error processing blockchain event");
        // Continue processing other events
      }
    }
  }

  /**
   * Processes an Address Activity webhook payload.
   * Note: This type only captures token transfers, not custom events.
   * Kept for backwards compatibility.
   *
   * @param payload - The validated Address Activity webhook payload
   */
  static async processAddressActivityWebhook(payload: AlchemyAddressActivityWebhookPayload): Promise<void> {
    const { activity } = payload.event;

    logger.info({ 
      activityCount: activity.length, 
      webhookId: payload.webhookId 
    }, "Processing Address Activity webhook");

    for (const event of activity) {
      if (!event.log) continue;

      const topic0 = event.log.topics[0];
      if (!topic0) continue;

      // Normalize log structure
      const normalizedLog: EventLog = {
        address: event.log.address,
        topics: event.log.topics,
        data: event.log.data,
        transactionHash: event.hash,
      };

      try {
        await this.processEventLog(normalizedLog, topic0);
      } catch (error) {
        logger.error({
          err: error,
          topic: topic0,
          txHash: event.hash,
          blockNum: event.blockNum,
        }, "Error processing blockchain event");
        // Continue processing other events
      }
    }
  }

  /**
   * Routes an event log to the appropriate handler based on its topic.
   *
   * @param log - Normalized event log
   * @param topic0 - The first topic (event signature hash)
   */
  private static async processEventLog(log: EventLog, topic0: string): Promise<void> {
    switch (topic0.toLowerCase()) {
      case EVENT_SIGNATURES.PredictorJoined.toLowerCase():
        await this.handlePredictorJoined(log);
        break;

      case EVENT_SIGNATURES.SignalPurchased.toLowerCase():
        await this.handleSignalPurchased(log);
        break;

      case EVENT_SIGNATURES.PredictorBlacklisted.toLowerCase():
        await this.handlePredictorBlacklisted(log);
        break;

      default:
        logger.debug({
          topic: topic0,
          txHash: log.transactionHash,
        }, "Unhandled event type");
    }
  }

  /**
   * Handles PredictorJoined events from SignalFriendMarket contract.
   * Creates a new Predictor record in the database.
   *
   * Event signature: PredictorJoined(address indexed predictor, address indexed referrer, uint256 nftTokenId, bool referralPaid)
   *
   * @param log - The normalized event log data
   */
  static async handlePredictorJoined(log: EventLog): Promise<void> {
    const txHash = log.transactionHash;

    try {
      // Decode the event using viem
      const decoded = decodeEventLog({
        abi: signalFriendMarketAbi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      });

      if (decoded.eventName !== "PredictorJoined") {
        logger.warn({ txHash, decoded: decoded.eventName }, "Unexpected event name in PredictorJoined handler");
        return;
      }

      const args = decoded.args as {
        predictor: Address;
        referrer: Address;
        nftTokenId: bigint;
        referralPaid: boolean;
      };

      logger.info({
        predictor: args.predictor,
        referrer: args.referrer,
        tokenId: Number(args.nftTokenId),
        referralPaid: args.referralPaid,
        txHash,
      }, "Processing PredictorJoined event");

      // Create predictor record
      await PredictorService.createFromEvent({
        walletAddress: args.predictor,
        tokenId: Number(args.nftTokenId),
        joinedAt: new Date(), // Could fetch block timestamp if needed
      });

      logger.info({
        predictor: args.predictor,
        tokenId: Number(args.nftTokenId),
        txHash,
      }, "Predictor record created successfully");

    } catch (error) {
      // Check if it's a conflict error (predictor already exists) - this is OK for idempotency
      if (error instanceof Error && error.message.includes("already exists")) {
        logger.info({ txHash }, "Predictor already exists, skipping (idempotent)");
        return;
      }
      throw error;
    }
  }

  /**
   * Handles SignalPurchased events from SignalFriendMarket contract.
   * Creates a new Receipt record linked to the SignalKeyNFT.
   *
   * Event signature: SignalPurchased(address indexed buyer, address indexed predictor, uint256 indexed receiptTokenId, bytes32 contentIdentifier, uint256 signalPrice, uint256 totalCost)
   *
   * @param log - The normalized event log data
   */
  static async handleSignalPurchased(log: EventLog): Promise<void> {
    const txHash = log.transactionHash;

    try {
      // Decode the event using viem
      const decoded = decodeEventLog({
        abi: signalFriendMarketAbi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      });

      if (decoded.eventName !== "SignalPurchased") {
        logger.warn({ txHash, decoded: decoded.eventName }, "Unexpected event name in SignalPurchased handler");
        return;
      }

      const args = decoded.args as {
        buyer: Address;
        predictor: Address;
        receiptTokenId: bigint;
        contentIdentifier: Hex;
        signalPrice: bigint;
        totalCost: bigint;
      };

      // Convert bytes32 contentIdentifier to string (remove trailing zeros)
      const contentId = args.contentIdentifier;

      // Convert price from USDT (18 decimals on BNB Chain) to number
      const priceUsdt = Number(formatUnits(args.signalPrice, 18));

      logger.info({
        buyer: args.buyer,
        predictor: args.predictor,
        tokenId: Number(args.receiptTokenId),
        contentId,
        priceUsdt,
        txHash,
      }, "Processing SignalPurchased event");

      // Create receipt record
      await ReceiptService.createFromEvent({
        tokenId: Number(args.receiptTokenId),
        contentId, // bytes32 hex string
        buyerAddress: args.buyer,
        predictorAddress: args.predictor,
        priceUsdt,
        purchasedAt: new Date(),
        transactionHash: txHash,
      });

      logger.info({
        tokenId: Number(args.receiptTokenId),
        buyer: args.buyer,
        txHash,
      }, "Receipt record created successfully");

    } catch (error) {
      // Receipt service returns existing receipt if duplicate (idempotent)
      if (error instanceof Error && error.message.includes("not found")) {
        logger.warn({ txHash, error: error.message }, "Signal not found for purchase event");
      }
      throw error;
    }
  }

  /**
   * Handles PredictorBlacklisted events from PredictorAccessPass contract.
   * Updates the Predictor's isBlacklisted status.
   *
   * Event signature: PredictorBlacklisted(address indexed predictor, bool status)
   *
   * @param log - The normalized event log data
   */
  static async handlePredictorBlacklisted(log: EventLog): Promise<void> {
    const txHash = log.transactionHash;

    try {
      // Decode the event using viem
      const decoded = decodeEventLog({
        abi: predictorAccessPassAbi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      });

      if (decoded.eventName !== "PredictorBlacklisted") {
        logger.warn({ txHash, decoded: decoded.eventName }, "Unexpected event name in PredictorBlacklisted handler");
        return;
      }

      const args = decoded.args as {
        predictor: Address;
        status: boolean;
      };

      logger.info({
        predictor: args.predictor,
        isBlacklisted: args.status,
        txHash,
      }, "Processing PredictorBlacklisted event");

      // Update predictor blacklist status
      await PredictorService.updateBlacklistStatus(args.predictor, args.status);

      logger.info({
        predictor: args.predictor,
        isBlacklisted: args.status,
        txHash,
      }, "Predictor blacklist status updated successfully");

    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        logger.warn({ txHash, error: error.message }, "Predictor not found for blacklist event");
      }
      throw error;
    }
  }
}
