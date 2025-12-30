/**
 * @fileoverview DEPRECATED - Migration script for old riskLevel/potentialReward fields
 * 
 * NOTE: This script is DEPRECATED and should not be used.
 * The riskLevel and potentialReward fields have been replaced with:
 * - confidenceLevel (1-100%)
 * - eventUrl (optional prediction market URL)
 * 
 * Use migrateConfidenceLevel.ts for new migrations.
 * 
 * @deprecated Use migrateConfidenceLevel.ts instead
 * @module scripts/migrateRiskReward
 */

import mongoose from "mongoose";
import { env } from "../shared/config/env.js";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

async function migrate() {
  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }
  console.log("🚀 Starting riskLevel/potentialReward migration...\n");

  // Connect to MongoDB
  await mongoose.connect(env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Get the Signal collection directly
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }
  
  const signalsCollection = db.collection("signals");

  // Find signals without riskLevel or potentialReward
  const signalsToMigrate = await signalsCollection
    .find({
      $or: [
        { riskLevel: { $exists: false } },
        { potentialReward: { $exists: false } },
      ],
    })
    .toArray();

  console.log(`📋 Found ${signalsToMigrate.length} signals to migrate\n`);

  if (signalsToMigrate.length === 0) {
    console.log("✅ No signals need migration. All signals have riskLevel and potentialReward.\n");
    await mongoose.disconnect();
    return;
  }

  // Show which signals would be updated
  for (const signal of signalsToMigrate) {
    const hasRisk = signal.riskLevel !== undefined;
    const hasReward = signal.potentialReward !== undefined;
    console.log(`  📝 Signal: ${signal.contentId || signal._id}`);
    console.log(`     Title: ${signal.title}`);
    console.log(`     Missing: ${!hasRisk ? "riskLevel" : ""}${!hasRisk && !hasReward ? ", " : ""}${!hasReward ? "potentialReward" : ""}`);
    console.log(`     ${isDryRun ? "Would set" : "Will set"}: riskLevel=medium, potentialReward=medium\n`);
  }

  if (isDryRun) {
    console.log(`\n✅ Dry run complete! ${signalsToMigrate.length} signal(s) would be updated.`);
    console.log(`   Run without --dry-run to apply changes.\n`);
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    return;
  }

  // Update signals with default values
  const result = await signalsCollection.updateMany(
    {
      $or: [
        { riskLevel: { $exists: false } },
        { potentialReward: { $exists: false } },
      ],
    },
    {
      $set: {
        riskLevel: "medium",
        potentialReward: "medium",
      },
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} signals with default values:`);
  console.log("   - riskLevel: medium");
  console.log("   - potentialReward: medium\n");

  // Verify migration
  const remainingWithoutFields = await signalsCollection.countDocuments({
    $or: [
      { riskLevel: { $exists: false } },
      { potentialReward: { $exists: false } },
    ],
  });

  if (remainingWithoutFields === 0) {
    console.log("✅ Migration complete! All signals now have riskLevel and potentialReward.\n");
  } else {
    console.log(`⚠️ Warning: ${remainingWithoutFields} signals still missing fields.\n`);
  }

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
