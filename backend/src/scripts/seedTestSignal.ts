/**
 * Script to create a test prediction signal for webhook testing.
 * 
 * Creates a single prediction signal for the Web3 Prediction Signals Marketplace.
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
      console.log("\n📋 Would create test prediction signal:");
      console.log("   contentId (UUID):", contentId);
      console.log("   contentIdentifier (bytes32):", uuidToBytes32(contentId));
      console.log("   title: Will BTC hit $150k by Q2 2025?");
      console.log("   price: 5 USDT");
      console.log("   confidence: 75%");
      console.log("\n✅ Dry run complete! Run without --dry-run to create the signal.");
    } else {
      // Calculate expiry (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const signal = new Signal({
        contentId,
        predictorId: predictor._id,
        predictorAddress: predictor.walletAddress,
        title: "Will BTC hit $150k by Q2 2025?",
        description: "My analysis of on-chain data and market structure suggests high probability for this outcome. Multiple indicators are aligning for this prediction.",
        content: `📊 PREDICTION ANALYSIS

Current Market Odds: 35%
My Predicted Probability: 65%
Edge: +30%

KEY FACTORS:
1. Institutional accumulation at record levels
2. Bitcoin ETF inflows exceeding $50B
3. Historical halving cycle patterns

RECOMMENDATION: Strong YES position recommended

TIMING: Enter now, event resolves in Q2 2025

⚠️ Risk Note: Always size positions appropriately. This is analysis, not financial advice.`,
        categoryId: category._id,
        mainGroup: category.mainGroup,
        priceUsdt: 5,
        expiresAt,
        confidenceLevel: 75,
        eventUrl: "https://polymarket.com/event/btc-150k-q2-2025",
        totalSales: 0,
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
      });

      await signal.save();

      console.log("\n✅ Test prediction signal created!");
      console.log("   contentId (UUID):", contentId);
      console.log("   contentIdentifier (bytes32):", uuidToBytes32(contentId));
      console.log("   confidence: 75%");
      console.log("   eventUrl: https://polymarket.com/event/btc-150k-q2-2025");
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
