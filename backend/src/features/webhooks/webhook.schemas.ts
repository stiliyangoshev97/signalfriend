/**
 * @fileoverview Zod validation schemas for Alchemy Webhook payloads.
 *
 * Defines schemas for:
 * - Alchemy webhook payload structure
 * - Event signature constants for blockchain events
 *
 * @module features/webhooks/webhook.schemas
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/webhooks/webhook.schemas.ts
import { z } from "zod";

/**
 * Zod schema for Alchemy Custom Webhook payload.
 * Validates the structure of incoming webhook requests from Alchemy.
 *
 * @see https://docs.alchemy.com/reference/custom-webhooks-quickstart
 */
export const alchemyWebhookSchema = z.object({
  /** Unique identifier for the webhook configuration */
  webhookId: z.string(),
  /** Unique identifier for this specific webhook event */
  id: z.string(),
  /** ISO timestamp when the webhook was created */
  createdAt: z.string(),
  /** Type of webhook event */
  type: z.enum(["ADDRESS_ACTIVITY", "MINED_TRANSACTION", "DROPPED_TRANSACTION", "GRAPHQL"]),
  /** Event data containing network info and activity array */
  event: z.object({
    /** Network identifier (e.g., "BNB_TESTNET") */
    network: z.string(),
    /** Array of blockchain activities detected */
    activity: z.array(
      z.object({
        /** Transaction sender address */
        fromAddress: z.string(),
        /** Transaction recipient address */
        toAddress: z.string().optional(),
        /** Block number (as string) */
        blockNum: z.string(),
        /** Transaction hash */
        hash: z.string(),
        /** Event log data (present for contract events) */
        log: z.object({
          /** Contract address that emitted the event */
          address: z.string(),
          /** Array of indexed event topics */
          topics: z.array(z.string()),
          /** ABI-encoded event data */
          data: z.string(),
          /** Block number (as string) */
          blockNumber: z.string(),
          /** Transaction hash */
          transactionHash: z.string(),
          /** Index of transaction in block */
          transactionIndex: z.string(),
          /** Block hash */
          blockHash: z.string(),
          /** Index of log in transaction */
          logIndex: z.string(),
          /** Whether the log was removed due to reorg */
          removed: z.boolean(),
        }).optional(),
        /** Activity category */
        category: z.string(),
        /** Raw contract data */
        rawContract: z.object({
          rawValue: z.string(),
          address: z.string().optional(),
          decimals: z.number().optional(),
        }).optional(),
        /** Transfer value */
        value: z.number().optional(),
        /** Asset symbol */
        asset: z.string().optional(),
      })
    ),
  }),
});

/** Type for validated Alchemy webhook payload */
export type AlchemyWebhookPayload = z.infer<typeof alchemyWebhookSchema>;

/**
 * Keccak256 hashes of event signatures for blockchain event matching.
 * Used to identify which event type was emitted.
 *
 * Generated using: keccak256(toBytes("EventName(type1,type2,...)"))
 * These match the topic[0] of each event log.
 */
export const EVENT_SIGNATURES = {
  /** PredictorJoined(address indexed predictor, address indexed referrer, uint256 nftTokenId, bool referralPaid) */
  PredictorJoined: "0x2f2789d1da7b490fc20c28c5014f1fdd449737869b924042025cd634b2248cc4" as const,
  /** SignalPurchased(address indexed buyer, address indexed predictor, uint256 indexed receiptTokenId, bytes32 contentIdentifier, uint256 signalPrice, uint256 totalCost) */
  SignalPurchased: "0x906c548d19aa6c7ed9e105a3d02cb6a435b802903a30000aa9ad5e01d93ef647" as const,
  /** PredictorBlacklisted(address indexed predictor, bool status) */
  PredictorBlacklisted: "0xad6b8655f145f95522485d58e7cd8ca2689dbe89691511217c7cc914b1226005" as const,
} as const;
