/**
 * @fileoverview Environment variable configuration with Zod validation.
 *
 * Loads and validates all required environment variables at startup.
 * Exits the process if validation fails, preventing runtime errors
 * due to missing or invalid configuration.
 *
 * @module shared/config/env
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/config/env.ts
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Zod schema for environment variable validation.
 * Defines all required and optional configuration values.
 */
const envSchema = z.object({
  // Server Configuration
  /** Application environment (development, production, or test) */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  /** HTTP server port */
  PORT: z.coerce.number().default(3001),

  // MongoDB Configuration
  /** MongoDB connection URI */
  MONGODB_URI: z.string().url(),

  // JWT Configuration
  /** Secret key for JWT signing (minimum 32 characters) */
  JWT_SECRET: z.string().min(32),
  /** JWT token expiration time (e.g., "7d", "24h") */
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Blockchain Configuration
  /** Target blockchain chain ID (97 = BNB Testnet, 56 = BNB Mainnet) */
  CHAIN_ID: z.coerce.number().refine((val) => val === 97 || val === 56, {
    message: "CHAIN_ID must be 97 (testnet) or 56 (mainnet)",
  }),
  /** RPC endpoint URL for blockchain interactions */
  RPC_URL: z.string().url(),

  // Alchemy Configuration
  /** Alchemy webhook signing key (optional for development) */
  ALCHEMY_SIGNING_KEY: z.string().optional(),

  // CORS Configuration
  /** Allowed CORS origin for frontend */
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Rate Limiting Configuration
  /** Rate limit window in milliseconds (default: 15 minutes) */
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  /** Maximum requests per window */
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/** Validated environment configuration object */
export const env = parsed.data;

/** TypeScript type for environment configuration */
export type Env = z.infer<typeof envSchema>;
