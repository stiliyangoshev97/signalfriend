/**
 * @fileoverview Business logic service for Alchemy webhook processing.
 *
 * Handles blockchain event indexing via Alchemy Custom Webhooks:
 * - Signature verification for webhook security
 * - Event decoding and processing
 * - Database updates based on blockchain events
 *
 * Events handled:
 * - PredictorJoined: Creates new Predictor record
 * - SignalPurchased: Creates new Receipt record
 * - PredictorBlacklisted: Updates Predictor blacklist status
 *
 * @module features/webhooks/webhook.service
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/webhooks/webhook.service.ts
import { createHmac } from "crypto";
import { decodeEventLog } from "viem";
import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/config/logger.js";
import { Predictor } from "../predictors/predictor.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { Signal } from "../signals/signal.model.js";
import type { AlchemyWebhookPayload } from "./webhook.schemas.js";

// TODO: Import ABIs when available
// import { signalFriendMarketAbi } from "../../contracts/abis/SignalFriendMarket.js";

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
   * Processes all activities in an Alchemy webhook payload.
   * Iterates through events and routes them to appropriate handlers.
   *
   * @param payload - The validated Alchemy webhook payload
   */
  static async processWebhook(payload: AlchemyWebhookPayload): Promise<void> {
    const { activity } = payload.event;

    for (const event of activity) {
      if (!event.log) continue;

      const topic0 = event.log.topics[0];
      if (!topic0) continue;

      try {
        // TODO: Match against actual event signatures and decode
        // For now, log the events
        logger.info({
          topic: topic0,
          txHash: event.hash,
          blockNum: event.blockNum,
        }, "Received blockchain event");

        // Example event handling structure:
        // switch (topic0) {
        //   case EVENT_SIGNATURES.PredictorJoined:
        //     await this.handlePredictorJoined(event.log);
        //     break;
        //   case EVENT_SIGNATURES.SignalPurchased:
        //     await this.handleSignalPurchased(event.log);
        //     break;
        //   case EVENT_SIGNATURES.PredictorBlacklisted:
        //     await this.handlePredictorBlacklisted(event.log);
        //     break;
        // }
      } catch (error) {
        logger.error({ err: error, event }, "Error processing event");
      }
    }
  }

  /**
   * Handles PredictorJoined events from SignalFriendMarket contract.
   * Creates a new Predictor record in the database.
   *
   * @param log - The event log data from the blockchain
   * @param log.topics - Indexed event parameters
   * @param log.data - ABI-encoded non-indexed parameters
   * @param log.transactionHash - Hash of the transaction that emitted the event
   * @todo Implement ABI decoding and database record creation
   */
  static async handlePredictorJoined(log: {
    topics: string[];
    data: string;
    transactionHash: string;
  }): Promise<void> {
    // TODO: Decode with actual ABI
    // const decoded = decodeEventLog({
    //   abi: signalFriendMarketAbi,
    //   data: log.data,
    //   topics: log.topics,
    // });

    // Example: Create predictor record
    // const predictor = new Predictor({
    //   walletAddress: decoded.args.predictor,
    //   tokenId: Number(decoded.args.tokenId),
    //   displayName: `Predictor #${decoded.args.tokenId}`,
    //   joinedAt: new Date(Number(decoded.args.timestamp) * 1000),
    // });
    // await predictor.save();

    logger.info({ txHash: log.transactionHash }, "PredictorJoined event processed");
  }

  /**
   * Handles SignalPurchased events from SignalFriendMarket contract.
   * Creates a new Receipt record linked to the SignalKeyNFT.
   *
   * @param log - The event log data from the blockchain
   * @param log.topics - Indexed event parameters (buyer, predictor)
   * @param log.data - ABI-encoded non-indexed parameters
   * @param log.transactionHash - Hash of the transaction
   * @param log.blockNumber - Block number containing the transaction
   * @todo Implement ABI decoding and Receipt record creation
   */
  static async handleSignalPurchased(log: {
    topics: string[];
    data: string;
    transactionHash: string;
    blockNumber: string;
  }): Promise<void> {
    // TODO: Decode with actual ABI and create receipt
    logger.info({ txHash: log.transactionHash }, "SignalPurchased event processed");
  }

  /**
   * Handles PredictorBlacklisted events from PredictorAccessPass contract.
   * Updates the Predictor's isBlacklisted status to true.
   *
   * @param log - The event log data from the blockchain
   * @param log.topics - Indexed event parameters (predictor address)
   * @param log.data - ABI-encoded non-indexed parameters
   * @param log.transactionHash - Hash of the transaction
   * @todo Implement ABI decoding and Predictor status update
   */
  static async handlePredictorBlacklisted(log: {
    topics: string[];
    data: string;
    transactionHash: string;
  }): Promise<void> {
    // TODO: Decode with actual ABI
    // const predictorAddress = decoded.args.predictor;
    // await Predictor.updateOne(
    //   { walletAddress: predictorAddress.toLowerCase() },
    //   { isBlacklisted: true }
    // );

    logger.info({ txHash: log.transactionHash }, "PredictorBlacklisted event processed");
  }
}
