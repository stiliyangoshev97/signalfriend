/**
 * @fileoverview Migration script to add confidenceLevel to existing signals
 * 
 * This script sets a default confidence level for any signals that don't have
 * the confidenceLevel field (signals created before the prediction marketplace update).
 * 
 * Usage:
 *   npx tsx src/scripts/migrateConfidenceLevel.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/migrateConfidenceLevel.ts            # Apply changes
 * 
 * @module scripts/migrateConfidenceLevel
 */

import mongoose from "mongoose";
import { env } from "../shared/config/env.js";
import { Signal } from "../features/signals/signal.model.js";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

// Default confidence level for migrated signals (middle-ground value)
const DEFAULT_CONFIDENCE_LEVEL = 70;

async function migrateConfidenceLevel(): Promise<void> {
  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }
  console.log("🚀 Starting confidence level migration...");
  
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all signals without confidenceLevel
    const signalsWithoutConfidence = await Signal.find({
      confidenceLevel: { $exists: false }
    });

    console.log(`📊 Found ${signalsWithoutConfidence.length} signals without confidenceLevel`);

    if (signalsWithoutConfidence.length === 0) {
      console.log("✨ No migration needed - all signals have confidenceLevel");
      return;
    }

    // Update each signal with default confidence level
    let updated = 0;
    for (const signal of signalsWithoutConfidence) {
      if (!isDryRun) {
        await Signal.updateOne(
          { _id: signal._id },
          { $set: { confidenceLevel: DEFAULT_CONFIDENCE_LEVEL } }
        );
        console.log(`  ✓ Updated signal "${signal.title}" - confidenceLevel: ${DEFAULT_CONFIDENCE_LEVEL}%`);
      } else {
        console.log(`  ⏭️  Would update signal "${signal.title}" - would set confidenceLevel: ${DEFAULT_CONFIDENCE_LEVEL}%`);
      }
      updated++;
    }

    if (isDryRun) {
      console.log(`\n✅ Dry run complete! ${updated} signal(s) would be updated.`);
      console.log(`   Default confidence level: ${DEFAULT_CONFIDENCE_LEVEL}%`);
      console.log(`   Run without --dry-run to apply changes.`);
    } else {
      console.log(`\n✅ Migration complete! Updated ${updated} signals with confidenceLevel: ${DEFAULT_CONFIDENCE_LEVEL}%`);
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run the migration
migrateConfidenceLevel();
