/**
 * Script to create a test signal for webhook testing.
 * 
 * Usage:
 *   npx tsx src/scripts/seedTestSignal.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/seedTestSignal.ts            # Apply changes
 */
import mongoose from "mongoose";
import { Signal } from "../features/signals/signal.model.js";
import { Predictor } from "../features/predictors/predictor.model.js";
import { Category } from "../features/categories/category.model.js";
import { uuidToBytes32 } from "../shared/utils/contentId.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/signalfriend";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

async function seedTestSignal() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    if (isDryRun) {
      console.log("🔍 DRY RUN MODE - No changes will be made\n");
    }

    // Find the predictor created by webhook
    const predictor = await Predictor.findOne({ 
      walletAddress: "0xe5bc99060d9e00c25c6c1b373e5f74b1091afa9f" 
    });

    if (!predictor) {
      console.error("❌ Predictor not found. Run joinAsPredictor first.");
      process.exit(1);
    }

    console.log("✅ Found predictor:", predictor.walletAddress);

    // Find a category
    const category = await Category.findOne({ isActive: true });
    if (!category) {
      console.error("❌ No active category found. Run seedCategories first.");
      process.exit(1);
    }

    console.log("✅ Using category:", category.name);

    // Create test signal with a valid UUID v4 contentId
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a, or b
    const contentId = "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5";
    
    // Check if already exists
    const existing = await Signal.findOne({ contentId });
    if (existing) {
      console.log("⚠️ Test signal already exists");
      console.log("   contentId (UUID):", contentId);
      console.log("   contentIdentifier (bytes32):", uuidToBytes32(contentId));
      process.exit(0);
    }

    if (isDryRun) {
      console.log("\n📋 Would create test signal:");
      console.log("   contentId (UUID):", contentId);
      console.log("   contentIdentifier (bytes32):", uuidToBytes32(contentId));
      console.log("   title: Test Signal for Webhook");
      console.log("   price: 5 USDT");
      console.log("\n✅ Dry run complete! Run without --dry-run to create the signal.");
    } else {
      const signal = new Signal({
        contentId,
        predictorId: predictor._id,
        predictorAddress: predictor.walletAddress,
        title: "Test Signal for Webhook",
        description: "This is a test signal created for webhook testing",
        content: "SECRET: This is the protected content revealed after purchase!",
        categoryId: category._id,
        priceUsdt: 5,
        totalSales: 0,
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
      });

      await signal.save();

      console.log("\n✅ Test signal created!");
      console.log("   contentId (UUID):", contentId);
      console.log("   contentIdentifier (bytes32):", uuidToBytes32(contentId));
      console.log("\n📝 Use this bytes32 value when calling buySignalNFT on-chain:");
      console.log("   ", uuidToBytes32(contentId));
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

seedTestSignal();
