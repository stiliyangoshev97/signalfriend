/**
 * @fileoverview Zod validation schemas for Dispute operations.
 *
 * @module features/disputes/dispute.schemas
 */
import { z } from "zod";

/**
 * Schema for updating dispute status (admin only).
 */
export const updateDisputeStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "contacted", "resolved", "rejected"]),
    adminNotes: z.string().max(2000).optional(),
  }),
});

export type UpdateDisputeStatusInput = z.infer<
  typeof updateDisputeStatusSchema
>["body"];

/**
 * Schema for listing disputes (admin only).
 */
export const listDisputesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(20),
    status: z
      .enum(["pending", "contacted", "resolved", "rejected"])
      .optional(),
  }),
});

export type ListDisputesQuery = z.infer<
  typeof listDisputesQuerySchema
>["query"];
