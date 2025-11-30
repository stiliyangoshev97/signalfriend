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
 * @todo Generate actual hashes using viem's keccak256 function
 */
export const EVENT_SIGNATURES = {
  /** PredictorJoined(address indexed predictor, uint256 tokenId, uint256 timestamp) */
  PredictorJoined: "0x" as const,
  /** SignalPurchased(address indexed buyer, address indexed predictor, uint256 tokenId, string contentIdentifier, uint256 price) */
  SignalPurchased: "0x" as const,
  /** PredictorBlacklisted(address indexed predictor) */
  PredictorBlacklisted: "0x" as const,
} as const;
