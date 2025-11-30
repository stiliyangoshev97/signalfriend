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

export class WebhookService {
  /**
   * Verify Alchemy webhook signature
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
   * Process Alchemy webhook payload
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
   * Handle PredictorJoined event
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
   * Handle SignalPurchased event
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
   * Handle PredictorBlacklisted event
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
