import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3001),

  // MongoDB
  MONGODB_URI: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Blockchain
  CHAIN_ID: z.coerce.number().default(97),
  RPC_URL: z.string().url(),

  // Contract Addresses
  SIGNALFRIEND_MARKET_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  PREDICTOR_ACCESS_PASS_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  SIGNAL_KEY_NFT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  MOCK_USDT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),

  // Alchemy
  ALCHEMY_SIGNING_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
