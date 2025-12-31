/**
 * @fileoverview Backfill script to populate totalEarnings field for all predictors
 * @description
 * This script calculates and updates totalEarnings for all predictors
 * based on actual receipt records. Earnings = 95% of total sales revenue.
 * 
 * Note: This does NOT include referral earnings - only signal sales earnings.
 *
 * Usage:
 *   npm run backfill:earnings:preview  - Preview changes without making them
 *   npm run backfill:earnings:run      - Actually apply the changes
 * 
 * Or directly with tsx:
 *   npx tsx src/scripts/backfillPredictorEarnings.ts --preview
 *   npx tsx src/scripts/backfillPredictorEarnings.ts --run
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { Predictor } from "../features/predictors/predictor.model.js";
import { Receipt } from "../features/receipts/receipt.model.js";

// Load environment variables
config();

// Parse command line arguments
const args = process.argv.slice(2);
const isPreview = args.includes("--preview");
const isRun = args.includes("--run");

// Require explicit mode
if (!isPreview && !isRun) {
  console.log("❌ Error: You must specify either --preview or --run\n");
  console.log("Usage:");
  console.log("  npm run backfill:earnings:preview  - Preview changes without making them");
  console.log("  npm run backfill:earnings:run      - Actually apply the changes");
  console.log("\nOr directly:");
  console.log("  npx tsx src/scripts/backfillPredictorEarnings.ts --preview");
  console.log("  npx tsx src/scripts/backfillPredictorEarnings.ts --run");
  process.exit(1);
}

/** Platform commission rate (5%) */
const PLATFORM_COMMISSION_RATE = 0.05;
/** Predictor earnings rate (95%) */
const PREDICTOR_EARNINGS_RATE = 1 - PLATFORM_COMMISSION_RATE;

async function backfillPredictorEarnings() {
  console.log("💰 Backfilling predictor earnings from receipts...");
  console.log(`📋 Mode: ${isPreview ? "PREVIEW (no changes will be made)" : "RUN (changes will be applied)"}\n`);

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get total revenue per predictor from receipts
    const predictorRevenue = await Receipt.aggregate([
      {
        $group: {
          _id: "$predictorAddress",
          totalRevenue: { $sum: "$priceUsdt" },
          salesCount: { $sum: 1 },
        },
      },
    ]);

    console.log(`📊 Found ${predictorRevenue.length} predictors with sales receipts\n`);

    // Track statistics
    let predictorsUpdated = 0;
    let predictorsSkipped = 0;
    let totalEarningsSet = 0;

    // Process each predictor with sales
    console.log("📝 Changes to apply:\n");
    console.log("Address".padEnd(44) + "| Sales | Revenue  | Earnings | Current | Action");
    console.log("-".repeat(100));

    for (const { _id: address, totalRevenue, salesCount } of predictorRevenue) {
      const predictor = await Predictor.findOne({ walletAddress: address });
      
      // Calculate earnings (95% of revenue)
      const calculatedEarnings = Math.round(totalRevenue * PREDICTOR_EARNINGS_RATE * 100) / 100;
      
      if (predictor) {
        const currentEarnings = predictor.totalEarnings || 0;
        const needsUpdate = Math.abs(currentEarnings - calculatedEarnings) > 0.01; // Allow for rounding differences
        
        const action = needsUpdate ? "UPDATE" : "SKIP (same)";
        console.log(
          `${address.padEnd(44)}| ${String(salesCount).padStart(5)} | $${totalRevenue.toFixed(2).padStart(7)} | $${calculatedEarnings.toFixed(2).padStart(7)} | $${currentEarnings.toFixed(2).padStart(7)} | ${action}`
        );
        
        if (needsUpdate) {
          if (isRun) {
            await Predictor.updateOne(
              { walletAddress: address },
              { $set: { totalEarnings: calculatedEarnings } }
            );
          }
          predictorsUpdated++;
          totalEarningsSet += calculatedEarnings;
        } else {
          predictorsSkipped++;
        }
      } else {
        console.log(
          `${address.padEnd(44)}| ${String(salesCount).padStart(5)} | $${totalRevenue.toFixed(2).padStart(7)} | $${calculatedEarnings.toFixed(2).padStart(7)} |    N/A  | ⚠️  NO PREDICTOR RECORD`
        );
      }
    }

    // Also check for predictors with totalEarnings but no receipts (should be reset to 0)
    const addressesWithReceipts = predictorRevenue.map((p) => p._id);
    const predictorsToReset = await Predictor.find({
      walletAddress: { $nin: addressesWithReceipts },
      totalEarnings: { $gt: 0 },
    });

    if (predictorsToReset.length > 0) {
      console.log("\n⚠️  Predictors with earnings but no receipts (will be reset to $0):\n");
      for (const predictor of predictorsToReset) {
        console.log(
          `${predictor.walletAddress.padEnd(44)}| $${predictor.totalEarnings.toFixed(2)} → $0.00`
        );
        if (isRun) {
          await Predictor.updateOne(
            { walletAddress: predictor.walletAddress },
            { $set: { totalEarnings: 0 } }
          );
        }
        predictorsUpdated++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(100));
    console.log("📊 SUMMARY");
    console.log("=".repeat(100));
    console.log(`  Predictors updated: ${predictorsUpdated}`);
    console.log(`  Predictors skipped (already correct): ${predictorsSkipped}`);
    console.log(`  Total earnings set: $${totalEarningsSet.toFixed(2)}`);
    
    if (isPreview) {
      console.log("\n🔍 This was a PREVIEW. No changes were made.");
      console.log("   Run with --run to apply these changes.");
    } else {
      console.log("\n✅ Changes have been applied successfully!");
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
backfillPredictorEarnings();
