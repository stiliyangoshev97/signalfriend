/**
 * @fileoverview Business logic service for Alchemy webhook processing.
 *
 * Handles blockchain event indexing via Alchemy Custom Webhooks:
 * - Signature verification for webhook security
 * - Timestamp validation to prevent replay attacks
 * - Idempotency protection via processed event tracking
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
import { ProcessedWebhookEvent } from "./processedEvent.model.js";
import type { 
  AlchemyGraphqlWebhookPayload, 
  AlchemyAddressActivityWebhookPayload 
} from "./webhook.schemas.js";
import { EVENT_SIGNATURES } from "./webhook.schemas.js";

/** Maximum age for webhook timestamps (5 minutes) - prevents replay attacks */
const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000;

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
   * Security behavior:
   * - Production: ALWAYS validates (server won't start without ALCHEMY_SIGNING_KEY)
   * - Development with key: Validates signature
   * - Development without key: Only skips if SKIP_WEBHOOK_SIGNATURE=true
   *
   * @param body - The raw JSON string body of the webhook request
   * @param signature - The x-alchemy-signature header value
   * @returns True if signature is valid, false otherwise
   */
  static verifySignature(body: string, signature: string): boolean {
    // If signing key is configured, always validate
    if (env.ALCHEMY_SIGNING_KEY) {
      const hmac = createHmac("sha256", env.ALCHEMY_SIGNING_KEY);
      hmac.update(body);
      const expectedSignature = hmac.digest("hex");

      const isValid = signature === expectedSignature;
      if (!isValid) {
        logger.warn("Webhook signature mismatch - possible spoofing attempt");
      }
      return isValid;
    }

    // No signing key configured - check if skip is explicitly allowed
    // Note: In production, server won't start without ALCHEMY_SIGNING_KEY (enforced in env.ts)
    if (env.NODE_ENV !== "production" && env.SKIP_WEBHOOK_SIGNATURE) {
      logger.warn("⚠️  SKIP_WEBHOOK_SIGNATURE=true - bypassing signature verification (DEV ONLY)");
      return true;
    }

    // No key and skip not enabled - reject for safety
    logger.error("❌ ALCHEMY_SIGNING_KEY not set and SKIP_WEBHOOK_SIGNATURE is false - rejecting webhook");
    return false;
  }

  /**
   * Validates the webhook timestamp to prevent replay attacks.
   * Rejects webhooks older than MAX_WEBHOOK_AGE_MS (5 minutes).
   *
   * @param createdAt - The ISO timestamp string from the webhook payload
   * @returns Object with isValid boolean and age in milliseconds
   */
  static validateTimestamp(createdAt: string): { isValid: boolean; ageMs: number } {
    const webhookTime = new Date(createdAt).getTime();
    const now = Date.now();
    const ageMs = now - webhookTime;

    // Allow some clock skew (webhooks slightly in the future are OK)
    const isValid = ageMs < MAX_WEBHOOK_AGE_MS && ageMs > -60000; // Allow 1 min future

    if (!isValid) {
      logger.warn({
        createdAt,
        ageMs,
        maxAgeMs: MAX_WEBHOOK_AGE_MS,
      }, "Webhook timestamp validation failed");
    }

    return { isValid, ageMs };
  }

  /**
   * Checks if an event has already been processed (idempotency check).
   * Uses transaction hash + topic0 as a unique event key.
   *
   * @param txHash - Transaction hash
   * @param topic0 - Event signature (first topic)
   * @returns True if event was already processed
   */
  static async isEventProcessed(txHash: string, topic0: string): Promise<boolean> {
    const eventKey = `${txHash.toLowerCase()}-${topic0.toLowerCase()}`;
    const existing = await ProcessedWebhookEvent.findOne({ eventKey });
    return !!existing;
  }

  /**
   * Marks an event as processed to prevent duplicate processing.
   *
   * @param txHash - Transaction hash
   * @param topic0 - Event signature (first topic)
   * @param eventType - Human-readable event type name
   * @param webhookId - Alchemy webhook ID
   * @param webhookCreatedAt - Webhook creation timestamp
   */
  static async markEventProcessed(
    txHash: string,
    topic0: string,
    eventType: string,
    webhookId: string,
    webhookCreatedAt: Date
  ): Promise<void> {
    const eventKey = `${txHash.toLowerCase()}-${topic0.toLowerCase()}`;
    
    try {
      await ProcessedWebhookEvent.create({
        eventKey,
        transactionHash: txHash.toLowerCase(),
        eventType,
        webhookId,
        webhookCreatedAt,
        processedAt: new Date(),
      });
    } catch (error) {
      // Ignore duplicate key errors (race condition, already processed)
      if (error instanceof Error && error.message.includes("duplicate key")) {
        logger.debug({ eventKey }, "Event already marked as processed (race condition)");
        return;
      }
      throw error;
    }
  }

  /**
   * Processes a GraphQL webhook payload.
   * This is the recommended webhook type for custom contract events.
   *
   * Includes timestamp validation and idempotency protection.
   *
   * @param payload - The validated GraphQL webhook payload
   * @returns Object with processed count and skipped count
   */
  static async processGraphqlWebhook(payload: AlchemyGraphqlWebhookPayload): Promise<{ processed: number; skipped: number }> {
    // Validate webhook timestamp
    const { isValid, ageMs } = this.validateTimestamp(payload.createdAt);
    if (!isValid) {
      logger.warn({
        webhookId: payload.webhookId,
        createdAt: payload.createdAt,
        ageMs,
      }, "Rejecting stale GraphQL webhook");
      return { processed: 0, skipped: 0 };
    }

    const logs = payload.event.data.block.logs;
    const webhookCreatedAt = new Date(payload.createdAt);
    let processed = 0;
    let skipped = 0;

    logger.info({ 
      logsCount: logs.length, 
      webhookId: payload.webhookId,
      ageMs,
    }, "Processing GraphQL webhook");

    for (const log of logs) {
      const topic0 = log.topics[0];
      if (!topic0) continue;

      const txHash = log.transaction.hash;

      // Check idempotency - skip if already processed
      if (await this.isEventProcessed(txHash, topic0)) {
        logger.debug({
          txHash,
          topic0,
        }, "Skipping already processed event (idempotent)");
        skipped++;
        continue;
      }

      // Normalize log structure
      const normalizedLog: EventLog = {
        address: log.account.address,
        topics: log.topics,
        data: log.data,
        transactionHash: txHash,
      };

      try {
        const eventType = await this.processEventLog(normalizedLog, topic0);
        
        // Mark as processed after successful handling
        if (eventType) {
          await this.markEventProcessed(txHash, topic0, eventType, payload.webhookId, webhookCreatedAt);
          processed++;
        }
      } catch (error) {
        logger.error({
          err: error,
          topic: topic0,
          txHash: log.transaction.hash,
        }, "Error processing blockchain event");
        // Continue processing other events
      }
    }

    logger.info({
      webhookId: payload.webhookId,
      processed,
      skipped,
    }, "GraphQL webhook processing complete");

    return { processed, skipped };
  }

  /**
   * Processes an Address Activity webhook payload.
   * Note: This type only captures token transfers, not custom events.
   * Kept for backwards compatibility.
   *
   * Includes timestamp validation and idempotency protection.
   *
   * @param payload - The validated Address Activity webhook payload
   * @returns Object with processed count and skipped count
   */
  static async processAddressActivityWebhook(payload: AlchemyAddressActivityWebhookPayload): Promise<{ processed: number; skipped: number }> {
    // Validate webhook timestamp
    const { isValid, ageMs } = this.validateTimestamp(payload.createdAt);
    if (!isValid) {
      logger.warn({
        webhookId: payload.webhookId,
        createdAt: payload.createdAt,
        ageMs,
      }, "Rejecting stale Address Activity webhook");
      return { processed: 0, skipped: 0 };
    }

    const { activity } = payload.event;
    const webhookCreatedAt = new Date(payload.createdAt);
    let processed = 0;
    let skipped = 0;

    logger.info({ 
      activityCount: activity.length, 
      webhookId: payload.webhookId,
      ageMs,
    }, "Processing Address Activity webhook");

    for (const event of activity) {
      if (!event.log) continue;

      const topic0 = event.log.topics[0];
      if (!topic0) continue;

      const txHash = event.hash;

      // Check idempotency - skip if already processed
      if (await this.isEventProcessed(txHash, topic0)) {
        logger.debug({
          txHash,
          topic0,
        }, "Skipping already processed event (idempotent)");
        skipped++;
        continue;
      }

      // Normalize log structure
      const normalizedLog: EventLog = {
        address: event.log.address,
        topics: event.log.topics,
        data: event.log.data,
        transactionHash: txHash,
      };

      try {
        const eventType = await this.processEventLog(normalizedLog, topic0);
        
        // Mark as processed after successful handling
        if (eventType) {
          await this.markEventProcessed(txHash, topic0, eventType, payload.webhookId, webhookCreatedAt);
          processed++;
        }
      } catch (error) {
        logger.error({
          err: error,
          topic: topic0,
          txHash,
          blockNum: event.blockNum,
        }, "Error processing blockchain event");
        // Continue processing other events
      }
    }

    logger.info({
      webhookId: payload.webhookId,
      processed,
      skipped,
    }, "Address Activity webhook processing complete");

    return { processed, skipped };
  }

  /**
   * Routes an event log to the appropriate handler based on its topic.
   *
   * @param log - Normalized event log
   * @param topic0 - The first topic (event signature hash)
   * @returns The event type name if handled, null if unhandled
   */
  private static async processEventLog(log: EventLog, topic0: string): Promise<string | null> {
    switch (topic0.toLowerCase()) {
      case EVENT_SIGNATURES.PredictorJoined.toLowerCase():
        await this.handlePredictorJoined(log);
        return "PredictorJoined";

      case EVENT_SIGNATURES.SignalPurchased.toLowerCase():
        await this.handleSignalPurchased(log);
        return "SignalPurchased";

      case EVENT_SIGNATURES.PredictorBlacklisted.toLowerCase():
        await this.handlePredictorBlacklisted(log);
        return "PredictorBlacklisted";

      case EVENT_SIGNATURES.PredictorNFTMinted.toLowerCase():
        await this.handlePredictorNFTMinted(log);
        return "PredictorNFTMinted";

      default:
        logger.debug({
          topic: topic0,
          txHash: log.transactionHash,
        }, "Unhandled event type");
        return null;
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

      // Create predictor record with referral info
      await PredictorService.createFromEvent({
        walletAddress: args.predictor,
        tokenId: Number(args.nftTokenId),
        joinedAt: new Date(), // Could fetch block timestamp if needed
        referredBy: args.referrer,
        referralPaid: args.referralPaid,
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

  /**
   * Handles PredictorNFTMinted events from PredictorAccessPass contract.
   * Creates a new Predictor record when minted via owner mint (MultiSig).
   *
   * This handler covers the case when a predictor is minted directly via
   * the PredictorAccessPass contract's proposeOwnerMint function, bypassing
   * the SignalFriendMarket's joinAsPredictor function (which emits PredictorJoined).
   *
   * Event signature: PredictorNFTMinted(address indexed predictor, uint256 indexed tokenId, bool isOwnerMint)
   *
   * @param log - The normalized event log data
   */
  static async handlePredictorNFTMinted(log: EventLog): Promise<void> {
    const txHash = log.transactionHash;

    try {
      // Decode the event using viem
      const decoded = decodeEventLog({
        abi: predictorAccessPassAbi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      });

      if (decoded.eventName !== "PredictorNFTMinted") {
        logger.warn({ txHash, decoded: decoded.eventName }, "Unexpected event name in PredictorNFTMinted handler");
        return;
      }

      const args = decoded.args as {
        predictor: Address;
        tokenId: bigint;
        isOwnerMint: boolean;
      };

      logger.info({
        predictor: args.predictor,
        tokenId: Number(args.tokenId),
        isOwnerMint: args.isOwnerMint,
        txHash,
      }, "Processing PredictorNFTMinted event");

      // Only process owner mints - regular mints are already handled by PredictorJoined event
      // from SignalFriendMarket which includes referral info
      if (!args.isOwnerMint) {
        logger.debug({
          predictor: args.predictor,
          tokenId: Number(args.tokenId),
          txHash,
        }, "Skipping non-owner mint (already handled by PredictorJoined event)");
        return;
      }

      // Create predictor record for owner mint
      await PredictorService.createFromEvent({
        walletAddress: args.predictor,
        tokenId: Number(args.tokenId),
        joinedAt: new Date(),
      });

      logger.info({
        predictor: args.predictor,
        tokenId: Number(args.tokenId),
        isOwnerMint: args.isOwnerMint,
        txHash,
      }, "Predictor record created successfully from owner mint");

    } catch (error) {
      // Check if it's a conflict error (predictor already exists) - this is OK for idempotency
      if (error instanceof Error && error.message.includes("already exists")) {
        logger.info({ txHash }, "Predictor already exists, skipping (idempotent)");
        return;
      }
      throw error;
    }
  }
}
