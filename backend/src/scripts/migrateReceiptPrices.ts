/**
 * @fileoverview Migration script to fix receipt priceUsdt values
 * @description
 * Fixes receipts that were incorrectly stored with 6-decimal conversion
 * instead of 18-decimal conversion for USDT prices.
 * 
 * The bug: Backend used formatUnits(price, 6) instead of formatUnits(price, 18)
 * This caused prices to be stored as huge numbers (e.g., 5000000000000 instead of 5)
 * 
 * Fix: Divide existing priceUsdt by 10^12 (difference between 18 and 6 decimals)
 * 
 * Usage:
 *   npx tsx src/scripts/migrateReceiptPrices.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/migrateReceiptPrices.ts            # Apply changes
 */

import mongoose from "mongoose";
import { env } from "../shared/config/env.js";
import { Receipt } from "../features/receipts/receipt.model.js";

const DECIMAL_CORRECTION_FACTOR = 1e12; // 10^18 / 10^6 = 10^12

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

async function migrateReceiptPrices(): Promise<void> {
  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }
  console.log("🔧 Starting receipt price migration...\n");

  // Connect to MongoDB
  await mongoose.connect(env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  try {
    // Find all receipts with suspiciously high prices (> 1000 USDT indicates bug)
    const receipts = await Receipt.find({ priceUsdt: { $gt: 1000 } });

    if (receipts.length === 0) {
      console.log("✅ No receipts need migration. All prices look correct.\n");
      return;
    }

    console.log(`📋 Found ${receipts.length} receipt(s) with incorrect prices:\n`);

    for (const receipt of receipts) {
      const oldPrice = receipt.priceUsdt;
      const newPrice = oldPrice / DECIMAL_CORRECTION_FACTOR;

      console.log(`  Token #${receipt.tokenId}:`);
      console.log(`    Current price: ${oldPrice} USDT (incorrect)`);
      console.log(`    ${isDryRun ? "Would become" : "New price"}: ${newPrice} USDT (corrected)`);

      if (!isDryRun) {
        // Update the receipt
        await Receipt.updateOne(
          { _id: receipt._id },
          { $set: { priceUsdt: newPrice } }
        );
        console.log(`    ✅ Updated\n`);
      } else {
        console.log(`    ⏭️  Skipped (dry run)\n`);
      }
    }

    if (isDryRun) {
      console.log(`\n✅ Dry run complete! ${receipts.length} receipt(s) would be updated.`);
      console.log(`   Run without --dry-run to apply changes.`);
    } else {
      console.log(`\n🎉 Migration complete! Fixed ${receipts.length} receipt(s).`);
    }

  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run migration
migrateReceiptPrices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
