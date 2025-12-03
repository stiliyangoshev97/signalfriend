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
 * Usage: npx ts-node src/scripts/migrateReceiptPrices.ts
 */

import mongoose from "mongoose";
import { env } from "../shared/config/env.js";
import { Receipt } from "../features/receipts/receipt.model.js";

const DECIMAL_CORRECTION_FACTOR = 1e12; // 10^18 / 10^6 = 10^12

async function migrateReceiptPrices(): Promise<void> {
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
      console.log(`    Old price: ${oldPrice} USDT (incorrect)`);
      console.log(`    New price: ${newPrice} USDT (corrected)`);

      // Update the receipt
      await Receipt.updateOne(
        { _id: receipt._id },
        { $set: { priceUsdt: newPrice } }
      );

      console.log(`    ✅ Updated\n`);
    }

    console.log(`\n🎉 Migration complete! Fixed ${receipts.length} receipt(s).`);

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
