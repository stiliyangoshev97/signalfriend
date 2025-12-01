/**
 * @fileoverview Zod validation schemas for Alchemy Webhook payloads.
 *
 * Defines schemas for:
 * - Alchemy webhook payload structure (both Address Activity and GraphQL types)
 * - Event signature constants for blockchain events
 *
 * @module features/webhooks/webhook.schemas
 */
import { z } from "zod";

/**
 * Schema for GraphQL webhook log structure.
 * Used when webhook type is "GRAPHQL".
 */
const graphqlLogSchema = z.object({
  transaction: z.object({
    hash: z.string(),
    from: z.object({ address: z.string() }),
    to: z.object({ address: z.string() }).nullable(),
  }),
  topics: z.array(z.string()),
  data: z.string(),
  account: z.object({ address: z.string() }),
});

/**
 * Schema for Address Activity webhook activity structure.
 * Used when webhook type is "ADDRESS_ACTIVITY".
 */
const addressActivitySchema = z.object({
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
});

/**
 * Zod schema for Alchemy Custom Webhook payload (GraphQL type).
 * This is the recommended type for capturing custom contract events.
 *
 * @see https://docs.alchemy.com/reference/custom-webhooks-quickstart
 */
export const alchemyGraphqlWebhookSchema = z.object({
  webhookId: z.string(),
  id: z.string(),
  createdAt: z.string(),
  type: z.literal("GRAPHQL"),
  event: z.object({
    data: z.object({
      block: z.object({
        logs: z.array(graphqlLogSchema),
      }),
    }),
    sequenceNumber: z.string(),
    network: z.string().optional(),
  }),
});

/**
 * Zod schema for Alchemy Address Activity Webhook payload.
 * Note: This type only captures token transfers, not custom events.
 *
 * @see https://docs.alchemy.com/reference/address-activity-webhook
 */
export const alchemyAddressActivityWebhookSchema = z.object({
  webhookId: z.string(),
  id: z.string(),
  createdAt: z.string(),
  type: z.literal("ADDRESS_ACTIVITY"),
  event: z.object({
    network: z.string(),
    activity: z.array(addressActivitySchema),
  }),
});

/**
 * Combined schema that accepts both webhook types.
 * The service will handle each type differently.
 */
export const alchemyWebhookSchema = z.discriminatedUnion("type", [
  alchemyGraphqlWebhookSchema.extend({ type: z.literal("GRAPHQL") }),
  alchemyAddressActivityWebhookSchema.extend({ type: z.literal("ADDRESS_ACTIVITY") }),
]);

/** Type for GraphQL webhook payload */
export type AlchemyGraphqlWebhookPayload = z.infer<typeof alchemyGraphqlWebhookSchema>;

/** Type for Address Activity webhook payload */
export type AlchemyAddressActivityWebhookPayload = z.infer<typeof alchemyAddressActivityWebhookSchema>;
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
