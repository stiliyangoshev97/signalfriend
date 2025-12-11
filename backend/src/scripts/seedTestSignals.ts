/**
 * @fileoverview Script to seed test signals into the database
 *
 * Creates realistic test signals with varied data for testing and development.
 * Supports seeding 100 or 500 signals with the --count flag.
 *
 * Usage:
 *   npx tsx src/scripts/seedTestSignals.ts --dry-run           # Preview 100 signals
 *   npx tsx src/scripts/seedTestSignals.ts                     # Create 100 signals
 *   npx tsx src/scripts/seedTestSignals.ts --count=500         # Create 500 signals
 *   npx tsx src/scripts/seedTestSignals.ts --count=500 --dry-run # Preview 500 signals
 *   npx tsx src/scripts/seedTestSignals.ts --clear             # Delete all test signals first
 *
 * @module scripts/seedTestSignals
 */

import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { Signal } from "../features/signals/signal.model.js";
import { Predictor } from "../features/predictors/predictor.model.js";
import { Category } from "../features/categories/category.model.js";
import { logger } from "../shared/config/logger.js";

// =============================================================================
// Configuration
// =============================================================================

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/signalfriend";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");
const shouldClear = process.argv.includes("--clear");
const countArg = process.argv.find(arg => arg.startsWith("--count="));
const signalCount = countArg ? parseInt(countArg.split("=")[1] ?? "100", 10) : 100;

// =============================================================================
// Sample Data for Realistic Signals
// =============================================================================

const SIGNAL_TITLES = {
  crypto: [
    "BTC Breaking Out of Consolidation",
    "ETH Heading Toward $5000",
    "Altcoin Season Incoming",
    "DeFi Blue Chip Accumulation Zone",
    "Layer 2 Token Opportunity",
    "Meme Coin Breakout Alert",
    "Bitcoin Dominance Shift",
    "Ethereum Gas Optimization Play",
    "Solana Ecosystem Growth",
    "Cross-Chain Bridge Opportunity",
    "NFT Market Recovery Signal",
    "Perpetual Futures Long Setup",
    "Whale Accumulation Detected",
    "Technical Breakout Imminent",
    "On-Chain Data Bullish Signal",
  ],
  tradfi: [
    "AAPL Earnings Play",
    "NVDA Support Level Entry",
    "MSFT Cloud Revenue Beat",
    "GOOGL Undervalued Entry",
    "SPY Breakout Confirmation",
    "EUR/USD Reversal Pattern",
    "Gold Heading Higher",
    "Oil Supply Squeeze",
    "Treasury Yield Prediction",
    "Tech Sector Rotation",
    "Semiconductor Cycle Bottom",
    "Banking Sector Recovery",
  ],
  macro: [
    "CPI Data Prediction",
    "Fed Rate Decision Analysis",
    "Jobs Report Forecast",
    "GDP Growth Projection",
    "Inflation Peak Signal",
    "Election Impact Analysis",
    "Trade War Development",
    "Central Bank Policy Shift",
    "Housing Market Indicator",
    "Consumer Sentiment Forecast",
  ],
};

const DESCRIPTIONS = [
  "Based on technical analysis and on-chain metrics, I'm seeing a strong setup forming.",
  "Multiple confluence factors align for this trade. Risk/reward looks favorable.",
  "Historical patterns suggest we're at a critical decision point.",
  "Smart money is accumulating at these levels according to my analysis.",
  "Chart structure and volume profile indicate potential movement incoming.",
  "Fundamental analysis combined with technical signals point to this opportunity.",
  "Market structure suggests a high probability setup is forming.",
  "Key indicators are flashing signals that historically precede major moves.",
  "This setup has appeared multiple times with consistent results.",
  "Combining macro analysis with micro price action for this call.",
];

const CONTENT_TEMPLATES = [
  "Entry: {price}\nTarget 1: {target1} (+{percent1}%)\nTarget 2: {target2} (+{percent2}%)\nStop Loss: {stop} (-{stopPercent}%)\n\nRationale: Technical breakout confirmed with volume. Key support held multiple times.",
  "Trade Setup:\n- Asset: {asset}\n- Direction: {direction}\n- Entry Zone: {price} - {entryHigh}\n- Take Profit: {target1}\n- Stop Loss: {stop}\n\nManagement: Trail stop after TP1 hit.",
  "SIGNAL DETAILS:\n\nEntry Price: {price}\nPosition Size: 2-5% of portfolio\nTimeframe: 1-4 weeks\n\nTargets:\n1. {target1} (25% of position)\n2. {target2} (50% of position)\n3. {target3} (25% of position)\n\nInvalidation below {stop}",
  "Analysis Summary:\n\nThe chart shows a clear {pattern} pattern forming on the {timeframe} timeframe. Entry at {price} with stops at {stop}. First target is {target1}, second target {target2}.\n\nRisk: {stopPercent}%\nReward: {percent2}%\nRR Ratio: {rrRatio}",
];

const RISK_LEVELS: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
const REWARD_LEVELS: ("normal" | "medium" | "high")[] = ["normal", "medium", "high"];

// =============================================================================
// Helper Functions
// =============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function generateSignalContent(): string {
  const template = randomElement(CONTENT_TEMPLATES);
  const basePrice = randomFloat(10, 50000);
  const percentGain1 = randomInt(5, 20);
  const percentGain2 = randomInt(20, 50);
  const percentGain3 = randomInt(50, 100);
  const stopPercent = randomInt(3, 15);

  return template
    .replace(/{price}/g, basePrice.toFixed(2))
    .replace(/{entryHigh}/g, (basePrice * 1.02).toFixed(2))
    .replace(/{target1}/g, (basePrice * (1 + percentGain1 / 100)).toFixed(2))
    .replace(/{target2}/g, (basePrice * (1 + percentGain2 / 100)).toFixed(2))
    .replace(/{target3}/g, (basePrice * (1 + percentGain3 / 100)).toFixed(2))
    .replace(/{stop}/g, (basePrice * (1 - stopPercent / 100)).toFixed(2))
    .replace(/{percent1}/g, percentGain1.toString())
    .replace(/{percent2}/g, percentGain2.toString())
    .replace(/{stopPercent}/g, stopPercent.toString())
    .replace(/{asset}/g, randomElement(["BTC", "ETH", "SOL", "AAPL", "GOLD"]))
    .replace(/{direction}/g, randomElement(["LONG", "SHORT"]))
    .replace(/{pattern}/g, randomElement(["bull flag", "ascending triangle", "cup and handle", "inverse head and shoulders"]))
    .replace(/{timeframe}/g, randomElement(["4H", "daily", "weekly"]))
    .replace(/{rrRatio}/g, (percentGain2 / stopPercent).toFixed(1));
}

function getSignalTitle(mainGroup: string, index: number): string {
  let titles: string[];
  if (mainGroup.includes("Crypto")) {
    titles = SIGNAL_TITLES.crypto;
  } else if (mainGroup.includes("Traditional")) {
    titles = SIGNAL_TITLES.tradfi;
  } else {
    titles = SIGNAL_TITLES.macro;
  }
  // Add index for uniqueness
  return `${randomElement(titles)} #${index + 1}`;
}

// =============================================================================
// Main Script
// =============================================================================

async function seedTestSignals(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("✅ Connected to MongoDB");

    if (isDryRun) {
      logger.info("🔍 DRY RUN MODE - No changes will be made\n");
    }

    // Optionally clear existing test signals
    if (shouldClear && !isDryRun) {
      const deleteResult = await Signal.deleteMany({ title: /^.*#\d+$/ });
      logger.info(`🗑️  Cleared ${deleteResult.deletedCount} existing test signals`);
    }

    // Get all predictors
    const predictors = await Predictor.find({ isBlacklisted: false });
    if (predictors.length === 0) {
      logger.error("❌ No predictors found. Create predictors first via webhook or seedMissingPredictors.");
      process.exit(1);
    }
    logger.info(`📊 Found ${predictors.length} predictor(s)`);

    // Get all categories
    const categories = await Category.find({ isActive: true });
    if (categories.length === 0) {
      logger.error("❌ No categories found. Run seedCategories first.");
      process.exit(1);
    }
    logger.info(`📁 Found ${categories.length} categories`);

    // Generate signals
    logger.info(`\n🚀 ${isDryRun ? "Would create" : "Creating"} ${signalCount} test signals...\n`);

    const signals: mongoose.AnyObject[] = [];
    const now = new Date();

    for (let i = 0; i < signalCount; i++) {
      const predictor = randomElement(predictors);
      const category = randomElement(categories);
      
      // Vary creation dates over the past 90 days
      const daysAgo = randomInt(0, 90);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Expire 30-180 days after creation
      const expiryDays = randomInt(30, 180);
      const expiresAt = new Date(createdAt.getTime() + expiryDays * 24 * 60 * 60 * 1000);

      const signal = {
        contentId: randomUUID(),
        predictorId: predictor._id,
        predictorAddress: predictor.walletAddress,
        title: getSignalTitle(category.mainGroup, i),
        description: randomElement(DESCRIPTIONS),
        content: generateSignalContent(),
        categoryId: category._id,
        mainGroup: category.mainGroup,
        priceUsdt: randomElement([1, 2, 3, 5, 10, 15, 20, 25, 50]),
        expiresAt,
        totalSales: randomInt(0, 50),
        averageRating: randomFloat(3.5, 5, 1),
        totalReviews: randomInt(0, 30),
        isActive: Math.random() > 0.1, // 90% active
        riskLevel: randomElement(RISK_LEVELS),
        potentialReward: randomElement(REWARD_LEVELS),
        createdAt,
        updatedAt: createdAt,
      };

      signals.push(signal);

      // Progress indicator every 50 signals
      if ((i + 1) % 50 === 0) {
        logger.info(`   Progress: ${i + 1}/${signalCount} signals prepared`);
      }
    }

    if (isDryRun) {
      // Show sample of what would be created
      logger.info("\n📋 Sample signals that would be created:\n");
      const sampleSignals = signals.slice(0, 3);
      sampleSignals.forEach((s, i) => {
        logger.info(`   ${i + 1}. "${s.title}"`);
        logger.info(`      Category: ${categories.find(c => c._id.equals(s.categoryId))?.name}`);
        logger.info(`      Price: $${s.priceUsdt} | Risk: ${s.riskLevel} | Reward: ${s.potentialReward}`);
        logger.info(`      Sales: ${s.totalSales} | Rating: ${s.averageRating}/5`);
        logger.info("");
      });
      
      // Distribution summary
      const categoryDist = signals.reduce((acc, s) => {
        const cat = categories.find(c => c._id.equals(s.categoryId))?.mainGroup || "Unknown";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      logger.info("📊 Category distribution:");
      for (const [group, count] of Object.entries(categoryDist)) {
        logger.info(`   ${group}: ${count} signals`);
      }

      logger.info(`\n✅ Dry run complete! Run without --dry-run to create ${signalCount} signals.`);
    } else {
      // Bulk insert for efficiency
      const result = await Signal.insertMany(signals);
      logger.info(`\n✅ Successfully created ${result.length} test signals!`);

      // Update predictor signal counts
      const predictorSignalCounts = signals.reduce((acc, s) => {
        const addr = s.predictorAddress as string;
        acc[addr] = (acc[addr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      for (const [address, count] of Object.entries(predictorSignalCounts)) {
        await Predictor.findOneAndUpdate(
          { walletAddress: address },
          { $inc: { totalSignals: count } }
        );
      }
      logger.info(`📈 Updated signal counts for ${Object.keys(predictorSignalCounts).length} predictor(s)`);
    }

  } catch (error) {
    logger.error({ err: error }, "❌ Seed script failed");
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info("\n✅ Disconnected from MongoDB");
  }
}

// Run the script
seedTestSignals();
