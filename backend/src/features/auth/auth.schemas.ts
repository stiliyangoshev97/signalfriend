import { z } from "zod";

export const getNonceSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export const verifySchema = z.object({
  message: z.string().min(1, "Message is required"),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format"),
});

export type GetNonceInput = z.infer<typeof getNonceSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
