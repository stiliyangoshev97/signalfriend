/**
 * @fileoverview Script to seed missing predictor records into the database.
 * 
 * These are wallets that registered on-chain before webhooks were connected.
 * The script fetches token IDs from the PredictorAccessPass contract.
 * 
 * Usage:
 *   npx tsx src/scripts/seedMissingPredictors.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/seedMissingPredictors.ts            # Apply changes
 */

import { connectDatabase, disconnectDatabase } from "../shared/config/database.js";
import { PredictorService } from "../features/predictors/predictor.service.js";
import { publicClient } from "../contracts/clients.js";
import { getCurrentAddresses } from "../contracts/addresses.js";
import { predictorAccessPassAbi } from "../contracts/abis/index.js";
import { logger } from "../shared/config/logger.js";
import type { Address } from "viem";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

// Missing predictor wallet addresses (registered on-chain before webhooks)
const MISSING_PREDICTORS: Address[] = [
  "0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2",
  "0xC119B9152afcC5f40C019aABd78A312d37C63926",
  "0xD4fd6333c8290bEdAf34a9911aA4B5a36878C89D",
  "0xa752B9D3C032469b356C29DFf5FFC31e6e627FAC",
  "0x12c69F01f32ce5b5B3421eDeee4d9eB74d6d414d",
  "0x656Ca1721e2da3BB008EbCA79B33F403a58b965C",
];

/**
 * Fetches the token ID for a predictor from the blockchain.
 * Uses the getPredictorTokenId view function on the contract.
 */
async function getTokenIdForAddress(address: Address): Promise<number | null> {
  try {
    const addresses = getCurrentAddresses();
    
    // Use getPredictorTokenId to get the token ID directly
    const tokenId = await publicClient.readContract({
      address: addresses.predictorAccessPass,
      abi: predictorAccessPassAbi,
      functionName: "getPredictorTokenId",
      args: [address],
    }) as bigint;
    
    return Number(tokenId);
  } catch (error) {
    // getPredictorTokenId reverts if address doesn't own an NFT
    logger.warn({ address, error }, "Address does not own a PredictorAccessPass NFT or call failed");
    return null;
  }
}

async function seedMissingPredictors(): Promise<void> {
  try {
    await connectDatabase();

    if (isDryRun) {
      logger.info("🔍 DRY RUN MODE - No changes will be made\n");
    }
    logger.info(`Seeding ${MISSING_PREDICTORS.length} missing predictor(s)...`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const walletAddress of MISSING_PREDICTORS) {
      logger.info(`\nProcessing: ${walletAddress}`);
      
      // Fetch token ID from blockchain
      const tokenId = await getTokenIdForAddress(walletAddress);
      
      if (tokenId === null) {
        logger.warn({ walletAddress }, "Skipping - could not fetch token ID");
        failed++;
        continue;
      }
      
      logger.info({ walletAddress, tokenId }, "Found token ID on blockchain");
      
      if (!isDryRun) {
        try {
          await PredictorService.createFromEvent({
            walletAddress,
            tokenId,
            joinedAt: new Date(), // We don't have exact timestamp, use now
          });
          logger.info({ walletAddress, tokenId }, "✅ Created predictor record");
          created++;
        } catch (error) {
          if (error instanceof Error && error.message.includes("already exists")) {
            logger.info({ walletAddress }, "Predictor already exists, skipping");
            skipped++;
          } else {
            logger.error({ walletAddress, error }, "❌ Failed to create predictor");
            failed++;
          }
        }
      } else {
        logger.info({ walletAddress, tokenId }, "Would create predictor record");
        created++;
      }
    }

    logger.info("\n" + "=".repeat(50));
    if (isDryRun) {
      logger.info(`✅ Dry run complete!`);
      logger.info(`   Would create: ${created}`);
      logger.info(`   Would skip (already exist): ${skipped}`);
      logger.info(`   Would fail: ${failed}`);
      logger.info(`\n   Run without --dry-run to apply changes.`);
    } else {
      logger.info(`✅ Predictor seeding completed`);
      logger.info(`   Created: ${created}`);
      logger.info(`   Skipped (already exist): ${skipped}`);
      logger.info(`   Failed: ${failed}`);
    }
  } catch (error) {
    logger.error({ err: error }, "❌ Predictor seeding failed");
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Run the script
seedMissingPredictors();
