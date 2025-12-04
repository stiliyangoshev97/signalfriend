/**
 * @fileoverview Migration script to recalculate sales counts from receipts
 * @description
 * This script recalculates totalSales for all signals and predictors
 * based on actual receipt records. Run this if sales counts are out of sync.
 *
 * Usage:
 *   npx tsx src/scripts/recalculateSalesCounts.ts
 *   npx tsx src/scripts/recalculateSalesCounts.ts --dry-run
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { Signal } from "../features/signals/signal.model.js";
import { Predictor } from "../features/predictors/predictor.model.js";
import { Receipt } from "../features/receipts/receipt.model.js";

// Load environment variables
config();

const DRY_RUN = process.argv.includes("--dry-run");

async function recalculateSalesCounts() {
  console.log("🔄 Recalculating sales counts from receipts...");
  if (DRY_RUN) {
    console.log("📋 DRY RUN - No changes will be made\n");
  }

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get sales count per signal (contentId)
    const signalSales = await Receipt.aggregate([
      {
        $group: {
          _id: "$contentId",
          totalSales: { $sum: 1 },
        },
      },
    ]);

    console.log(`📊 Found ${signalSales.length} signals with sales\n`);

    // Update signals
    let signalsUpdated = 0;
    for (const { _id: contentId, totalSales } of signalSales) {
      const signal = await Signal.findOne({ contentId });
      if (signal) {
        const currentSales = signal.totalSales || 0;
        if (currentSales !== totalSales) {
          console.log(
            `  Signal "${signal.title}" (${contentId}): ${currentSales} → ${totalSales}`
          );
          if (!DRY_RUN) {
            await Signal.updateOne({ contentId }, { totalSales });
          }
          signalsUpdated++;
        }
      } else {
        console.log(`  ⚠️  No signal found for contentId: ${contentId}`);
      }
    }

    // Also reset signals with no sales to 0
    const signalsWithSales = signalSales.map((s) => s._id);
    const signalsToReset = await Signal.find({
      contentId: { $nin: signalsWithSales },
      totalSales: { $gt: 0 },
    });

    for (const signal of signalsToReset) {
      console.log(
        `  Signal "${signal.title}" (${signal.contentId}): ${signal.totalSales} → 0`
      );
      if (!DRY_RUN) {
        await Signal.updateOne({ contentId: signal.contentId }, { totalSales: 0 });
      }
      signalsUpdated++;
    }

    console.log(`\n✅ Signals updated: ${signalsUpdated}`);

    // Get sales count per predictor
    const predictorSales = await Receipt.aggregate([
      {
        $group: {
          _id: "$predictorAddress",
          totalSales: { $sum: 1 },
        },
      },
    ]);

    console.log(`\n📊 Found ${predictorSales.length} predictors with sales\n`);

    // Update predictors
    let predictorsUpdated = 0;
    for (const { _id: predictorAddress, totalSales } of predictorSales) {
      const predictor = await Predictor.findOne({
        walletAddress: predictorAddress.toLowerCase(),
      });
      if (predictor) {
        const currentSales = predictor.totalSales || 0;
        if (currentSales !== totalSales) {
          console.log(
            `  Predictor "${predictor.displayName || predictorAddress}": ${currentSales} → ${totalSales}`
          );
          if (!DRY_RUN) {
            await Predictor.updateOne(
              { walletAddress: predictorAddress.toLowerCase() },
              { totalSales }
            );
          }
          predictorsUpdated++;
        }
      } else {
        console.log(`  ⚠️  No predictor found for address: ${predictorAddress}`);
      }
    }

    // Also reset predictors with no sales to 0
    const predictorsWithSales = predictorSales.map((p) => p._id?.toLowerCase());
    const predictorsToReset = await Predictor.find({
      walletAddress: { $nin: predictorsWithSales },
      totalSales: { $gt: 0 },
    });

    for (const predictor of predictorsToReset) {
      console.log(
        `  Predictor "${predictor.displayName || predictor.walletAddress}": ${predictor.totalSales} → 0`
      );
      if (!DRY_RUN) {
        await Predictor.updateOne(
          { walletAddress: predictor.walletAddress },
          { totalSales: 0 }
        );
      }
      predictorsUpdated++;
    }

    console.log(`\n✅ Predictors updated: ${predictorsUpdated}`);

    if (DRY_RUN) {
      console.log("\n📋 DRY RUN COMPLETE - No changes were made");
      console.log("   Run without --dry-run to apply changes");
    } else {
      console.log("\n✅ Migration complete!");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

recalculateSalesCounts();
