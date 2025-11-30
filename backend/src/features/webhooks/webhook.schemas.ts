import { z } from "zod";

// Alchemy webhook payload schema
export const alchemyWebhookSchema = z.object({
  webhookId: z.string(),
  id: z.string(),
  createdAt: z.string(),
  type: z.enum(["ADDRESS_ACTIVITY", "MINED_TRANSACTION", "DROPPED_TRANSACTION", "GRAPHQL"]),
  event: z.object({
    network: z.string(),
    activity: z.array(
      z.object({
        fromAddress: z.string(),
        toAddress: z.string().optional(),
        blockNum: z.string(),
        hash: z.string(),
        log: z.object({
          address: z.string(),
          topics: z.array(z.string()),
          data: z.string(),
          blockNumber: z.string(),
          transactionHash: z.string(),
          transactionIndex: z.string(),
          blockHash: z.string(),
          logIndex: z.string(),
          removed: z.boolean(),
        }).optional(),
        category: z.string(),
        rawContract: z.object({
          rawValue: z.string(),
          address: z.string().optional(),
          decimals: z.number().optional(),
        }).optional(),
        value: z.number().optional(),
        asset: z.string().optional(),
      })
    ),
  }),
});

export type AlchemyWebhookPayload = z.infer<typeof alchemyWebhookSchema>;

// Event signatures (keccak256 hashes of event signatures)
export const EVENT_SIGNATURES = {
  // PredictorJoined(address indexed predictor, uint256 tokenId, uint256 timestamp)
  PredictorJoined: "0x" as const,
  // SignalPurchased(address indexed buyer, address indexed predictor, uint256 tokenId, string contentIdentifier, uint256 price)
  SignalPurchased: "0x" as const,
  // PredictorBlacklisted(address indexed predictor)
  PredictorBlacklisted: "0x" as const,
} as const;
