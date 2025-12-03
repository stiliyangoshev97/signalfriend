/**
 * @fileoverview Migration script to add expiresAt to existing signals
 * 
 * This script sets a default expiry date (30 days from creation) for any
 * signals that don't have an expiresAt field.
 * 
 * Usage:
 *   npx tsx src/scripts/migrateSignalExpiry.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/migrateSignalExpiry.ts            # Apply changes
 */

import mongoose from "mongoose";
import { env } from "../shared/config/env.js";
import { Signal } from "../features/signals/signal.model.js";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

async function migrateSignalExpiry(): Promise<void> {
  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }
  console.log("🚀 Starting signal expiry migration...");
  
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all signals without expiresAt
    const signalsWithoutExpiry = await Signal.find({
      expiresAt: { $exists: false }
    });

    console.log(`📊 Found ${signalsWithoutExpiry.length} signals without expiresAt`);

    if (signalsWithoutExpiry.length === 0) {
      console.log("✨ No migration needed - all signals have expiresAt");
      return;
    }

    // Update each signal with a default expiry (30 days from creation)
    let updated = 0;
    for (const signal of signalsWithoutExpiry) {
      const expiresAt = new Date(signal.createdAt);
      expiresAt.setDate(expiresAt.getDate() + 30);

      if (!isDryRun) {
        await Signal.updateOne(
          { _id: signal._id },
          { $set: { expiresAt } }
        );
        console.log(`  ✓ Updated signal ${signal.contentId} - expires ${expiresAt.toISOString()}`);
      } else {
        console.log(`  ⏭️  Would update signal ${signal.contentId} - would expire ${expiresAt.toISOString()}`);
      }
      updated++;
    }

    if (isDryRun) {
      console.log(`\n✅ Dry run complete! ${updated} signal(s) would be updated.`);
      console.log(`   Run without --dry-run to apply changes.`);
    } else {
      console.log(`\n✅ Migration complete! Updated ${updated} signals`);
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
migrateSignalExpiry();
