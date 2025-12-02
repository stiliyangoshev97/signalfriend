import { z } from 'zod';

// ============================================================================
// Receipt Schemas (SignalKey NFT)
// ============================================================================

/**
 * Receipt status enum
 */
export const receiptStatusSchema = z.enum([
  'pending',
  'minted',
  'claimed',
  'expired',
  'refunded',
]);

export type ReceiptStatus = z.infer<typeof receiptStatusSchema>;

/**
 * Receipt schema
 */
export const receiptSchema = z.object({
  id: z.string(),
  tokenId: z.number().nullable(),
  signalId: z.string(),
  buyerAddress: z.string(),
  predictorAddress: z.string(),
  price: z.string(), // BigInt as string
  status: receiptStatusSchema,
  transactionHash: z.string().nullable(),
  mintedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Receipt = z.infer<typeof receiptSchema>;

/**
 * Receipt with signal details
 */
export const receiptWithSignalSchema = receiptSchema.extend({
  signal: z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    predictorUsername: z.string().nullable(),
  }),
});

export type ReceiptWithSignal = z.infer<typeof receiptWithSignalSchema>;

/**
 * Purchase signal request schema
 */
export const purchaseSignalRequestSchema = z.object({
  signalId: z.string(),
  transactionHash: z.string(),
});

export type PurchaseSignalRequest = z.infer<typeof purchaseSignalRequestSchema>;

/**
 * Claim refund request schema
 */
export const claimRefundRequestSchema = z.object({
  receiptId: z.string(),
  transactionHash: z.string(),
});

export type ClaimRefundRequest = z.infer<typeof claimRefundRequestSchema>;

/**
 * Receipt list query params
 */
export const receiptListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: receiptStatusSchema.optional(),
  signalId: z.string().optional(),
});

export type ReceiptListQuery = z.infer<typeof receiptListQuerySchema>;
