/**
 * @fileoverview Script to seed test prediction signals into the database
 *
 * Creates realistic test prediction signals for the Web3 Prediction Signals Marketplace.
 * Signals are designed for prediction market events (Polymarket, Predict.fun, etc.)
 * 
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
// Sample Data for Realistic Prediction Signals
// =============================================================================

/**
 * Prediction market event URLs for different platforms
 */
const EVENT_URL_TEMPLATES = [
  "https://polymarket.com/event/{slug}",
  "https://predict.fun/market/{slug}",
  "https://manifold.markets/{slug}",
  "https://kalshi.com/markets/{slug}",
];

/**
 * Signal titles organized by main category group
 * Focused on prediction market events
 */
const SIGNAL_TITLES = {
  Crypto: [
    "Will BTC hit $150k by Q2 2025?",
    "ETH to reach $10k before June?",
    "Solana TVL to surpass $20B?",
    "Bitcoin ETF inflows to exceed $50B?",
    "Will DOGE flip another top 10 coin?",
    "Ethereum L2 TVL to hit $100B?",
    "Will Bitcoin dominance drop below 40%?",
    "Base to become #1 L2 by users?",
    "Will Tether market cap exceed $200B?",
    "Coinbase stock to hit new ATH?",
    "Will Bitcoin mining difficulty increase 20%?",
    "MicroStrategy BTC holdings to exceed 500k?",
    "Will any country adopt BTC as legal tender in 2025?",
    "Uniswap V4 launch before July?",
    "Will Arbitrum flip Optimism in TVL?",
  ],
  Finance: [
    "NVDA to hit $200 before earnings?",
    "S&P 500 to reach 6500 by mid-2025?",
    "Will Fed cut rates in January?",
    "Tesla to deliver 2M vehicles in Q1?",
    "Apple market cap to exceed $4T?",
    "Gold to reach $3000/oz?",
    "Will oil prices exceed $100/barrel?",
    "MSFT to announce stock split?",
    "EUR/USD to reach parity?",
    "Will AAPL announce EV by 2025?",
    "Amazon to split stock again?",
    "Will Meta stock double in 2025?",
    "Netflix to hit 300M subscribers?",
  ],
  Politics: [
    "Will Trump win 2024 election?",
    "Democrats to win Senate majority?",
    "Will there be a government shutdown?",
    "Supreme Court to rule on crypto case?",
    "Will Biden run for re-election?",
    "UK snap election in 2025?",
    "EU crypto regulations passed by Q2?",
    "Will US pass stablecoin legislation?",
    "China to ease crypto restrictions?",
    "Will SEC approve spot ETH ETF?",
    "New Fed Chair appointment in 2025?",
    "Will TikTok be banned in US?",
  ],
  Sports: [
    "Chiefs to win Super Bowl 2025?",
    "Manchester City to win Premier League?",
    "Will Lakers make playoffs?",
    "Djokovic to win another Grand Slam?",
    "Real Madrid to win Champions League?",
    "UFC 300 main event to go distance?",
    "Will Ohtani hit 60 home runs?",
    "Lewis Hamilton to win with Ferrari?",
    "Warriors to make conference finals?",
    "Liverpool to win FA Cup?",
    "Will there be a new F1 champion in 2025?",
    "Patrick Mahomes MVP again?",
  ],
  World: [
    "Global inflation to drop below 3%?",
    "Will there be a major earthquake in 2025?",
    "UN climate agreement ratified?",
    "Will AI regulation pass globally?",
    "Major cyber attack on infrastructure?",
    "New pandemic outbreak in 2025?",
    "Will fusion energy breakthrough happen?",
    "Record heat wave in Europe?",
    "Major tech company breakup?",
    "Will space tourism exceed 1000 passengers?",
  ],
  Culture: [
    "Will Avatar 3 gross $2B?",
    "Taylor Swift to announce retirement?",
    "Oppenheimer to win Best Picture?",
    "Will Twitter/X reach 1B users?",
    "New iPhone to have AI features?",
    "Will ChatGPT-5 launch in 2025?",
    "Spotify to hit 700M users?",
    "Will Apple Vision Pro sell 1M units?",
    "Disney+ to surpass Netflix?",
    "Major streaming service to shut down?",
    "Will TikTok Shop surpass Shein?",
    "Elon Musk to step down from X?",
  ],
};

const DESCRIPTIONS = [
  "My analysis of on-chain data and market structure suggests high probability for this outcome.",
  "Based on historical patterns and current momentum, I'm confident in this prediction.",
  "Multiple indicators are aligning - technical, fundamental, and sentiment all point the same direction.",
  "The smart money is positioned for this. I've tracked whale movements extensively.",
  "This is a high-conviction call based on insider knowledge of market dynamics.",
  "Statistical models give this a strong edge over current market pricing.",
  "My track record on similar predictions is 78%. This setup looks identical.",
  "Sentiment analysis combined with fundamentals makes this a compelling bet.",
  "I've been following this space for years - the signs are unmistakable.",
  "Risk/reward is heavily skewed in our favor at current market odds.",
];

/**
 * Content templates for prediction signal analysis
 */
const CONTENT_TEMPLATES = [
  `📊 PREDICTION ANALYSIS

Current Market Odds: {currentOdds}%
My Predicted Probability: {myOdds}%
Edge: +{edge}%

KEY FACTORS:
{factors}

RECOMMENDATION: {recommendation}

TIMING: {timing}

⚠️ Risk Note: Always size positions appropriately. This is analysis, not financial advice.`,

  `🎯 SIGNAL BREAKDOWN

EVENT: {eventTitle}
POSITION: {position} @ {currentOdds}% odds
CONFIDENCE: {confidence}%

ANALYSIS:
{analysis}

WHY I'M BETTING THIS WAY:
{reasoning}

ENTRY STRATEGY:
• Enter between {entryLow}%-{entryHigh}% odds
• Target exit at {targetOdds}% or event resolution
• Stop loss if odds move to {stopOdds}%

Expected Value: +{ev}%`,

  `🔍 DETAILED PREDICTION

Market: {market}
Current Price: {currentOdds}% YES
My Fair Value: {myOdds}% YES

THESIS:
{thesis}

SUPPORTING EVIDENCE:
1. {evidence1}
2. {evidence2}
3. {evidence3}

RISKS TO CONSIDER:
• {risk1}
• {risk2}

CONCLUSION: {conclusion}

Position size recommendation: {positionSize}% of bankroll`,

  `⚡ QUICK TAKE

{eventTitle}

TL;DR: Betting {position} at {currentOdds}%

The market is mispricing this because:
{mispricing}

My edge comes from:
{edge_source}

Confidence: {confidence}%
Time horizon: {timeHorizon}

Full thesis available - this is my highest conviction play this week.`,
];

// =============================================================================
// Helper Data
// =============================================================================

const FACTORS = [
  "Strong institutional accumulation patterns",
  "Technical breakout confirmed on multiple timeframes",
  "Sentiment at extreme levels (contrarian indicator)",
  "Historical precedent strongly favors this outcome",
  "Key catalyst approaching that market is underpricing",
  "Whale wallet analysis shows significant positioning",
  "On-chain metrics flashing bullish signals",
  "Macro environment increasingly favorable",
  "Competitor weakness creates opportunity",
  "Regulatory clarity improving sentiment",
];

const RECOMMENDATIONS = [
  "Strong YES position recommended",
  "Accumulate on any dips in YES odds",
  "Layer into position over next 48 hours",
  "Maximum conviction - size up",
  "Scale in gradually as thesis confirms",
  "Take profits at 70% odds, hold remainder",
];

const TIMINGS = [
  "Enter now, event resolves in 2-4 weeks",
  "Best entry window: next 24-48 hours",
  "Catalyst expected within 1 week",
  "Resolution expected by end of month",
  "Long-term play - 3+ month horizon",
];

const POSITIONS = ["YES", "NO"];
const MARKETS = ["Polymarket", "Predict.fun", "Kalshi", "Manifold"];
const POSITION_SIZES = ["1-2", "2-5", "5-10", "10-15"];

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

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function generateEventUrl(title: string): string | undefined {
  // 70% of signals have event URLs
  if (Math.random() > 0.7) return undefined;
  
  const template = randomElement(EVENT_URL_TEMPLATES);
  const slug = generateSlug(title);
  return template.replace("{slug}", slug);
}

function generateSignalContent(title: string, confidence: number): string {
  const template = randomElement(CONTENT_TEMPLATES);
  const currentOdds = randomInt(20, 80);
  const myOdds = currentOdds + randomInt(5, 25);
  const edge = myOdds - currentOdds;
  const position = randomElement(POSITIONS);
  const market = randomElement(MARKETS);

  // Generate random factors
  const selectedFactors = randomElements(FACTORS, 3)
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");

  return template
    .replace(/{currentOdds}/g, currentOdds.toString())
    .replace(/{myOdds}/g, Math.min(myOdds, 95).toString())
    .replace(/{edge}/g, edge.toString())
    .replace(/{factors}/g, selectedFactors)
    .replace(/{recommendation}/g, randomElement(RECOMMENDATIONS))
    .replace(/{timing}/g, randomElement(TIMINGS))
    .replace(/{eventTitle}/g, title)
    .replace(/{position}/g, position)
    .replace(/{confidence}/g, confidence.toString())
    .replace(/{analysis}/g, randomElement(DESCRIPTIONS))
    .replace(/{reasoning}/g, randomElement(FACTORS))
    .replace(/{entryLow}/g, Math.max(currentOdds - 10, 10).toString())
    .replace(/{entryHigh}/g, (currentOdds + 5).toString())
    .replace(/{targetOdds}/g, Math.min(currentOdds + 30, 90).toString())
    .replace(/{stopOdds}/g, Math.max(currentOdds - 20, 5).toString())
    .replace(/{ev}/g, randomInt(10, 40).toString())
    .replace(/{market}/g, market)
    .replace(/{thesis}/g, randomElement(DESCRIPTIONS))
    .replace(/{evidence1}/g, randomElement(FACTORS))
    .replace(/{evidence2}/g, randomElement(FACTORS))
    .replace(/{evidence3}/g, randomElement(FACTORS))
    .replace(/{risk1}/g, "Market sentiment could shift unexpectedly")
    .replace(/{risk2}/g, "External events may impact outcome")
    .replace(/{conclusion}/g, `${position} position recommended with ${confidence}% confidence`)
    .replace(/{positionSize}/g, randomElement(POSITION_SIZES))
    .replace(/{mispricing}/g, randomElement(FACTORS))
    .replace(/{edge_source}/g, randomElement(FACTORS))
    .replace(/{timeHorizon}/g, randomElement(["1 week", "2 weeks", "1 month", "Q1 2025"]));
}

function getSignalTitle(mainGroup: string, index: number): string {
  const groupKey = mainGroup as keyof typeof SIGNAL_TITLES;
  const titles = SIGNAL_TITLES[groupKey] || SIGNAL_TITLES.Crypto;
  // Use index to cycle through titles, adding uniqueness
  const baseTitle = titles[index % titles.length];
  // Only add # suffix for duplicates (when we've cycled through all titles)
  if (index >= titles.length) {
    return `${baseTitle} #${Math.floor(index / titles.length) + 1}`;
  }
  return baseTitle as string;
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
    logger.info(`\n🚀 ${isDryRun ? "Would create" : "Creating"} ${signalCount} test prediction signals...\n`);

    const signals: mongoose.AnyObject[] = [];
    const now = new Date();

    for (let i = 0; i < signalCount; i++) {
      const predictor = randomElement(predictors);
      const category = randomElement(categories);
      
      // Vary creation dates over the past 30 days (more recent focus)
      const daysAgo = randomInt(0, 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Expire 7-90 days after creation (prediction market style)
      const expiryDays = randomInt(7, 90);
      const expiresAt = new Date(createdAt.getTime() + expiryDays * 24 * 60 * 60 * 1000);

      // Confidence level 50-95% (realistic range)
      const confidenceLevel = randomInt(50, 95);

      const title = getSignalTitle(category.mainGroup, i);
      
      const signal = {
        contentId: randomUUID(),
        predictorId: predictor._id,
        predictorAddress: predictor.walletAddress,
        title,
        description: randomElement(DESCRIPTIONS),
        content: generateSignalContent(title, confidenceLevel),
        categoryId: category._id,
        mainGroup: category.mainGroup,
        priceUsdt: randomElement([1, 2, 3, 5, 10, 15, 20, 25, 50]),
        expiresAt,
        confidenceLevel,
        eventUrl: generateEventUrl(title),
        totalSales: randomInt(0, 50),
        averageRating: randomFloat(3.5, 5, 1),
        totalReviews: randomInt(0, 30),
        isActive: Math.random() > 0.1, // 90% active
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
      logger.info("\n📋 Sample prediction signals that would be created:\n");
      const sampleSignals = signals.slice(0, 3);
      sampleSignals.forEach((s, i) => {
        logger.info(`   ${i + 1}. "${s.title}"`);
        logger.info(`      Category: ${categories.find(c => c._id.equals(s.categoryId))?.mainGroup} > ${categories.find(c => c._id.equals(s.categoryId))?.name}`);
        logger.info(`      Price: $${s.priceUsdt} | Confidence: ${s.confidenceLevel}%`);
        logger.info(`      Event URL: ${s.eventUrl || "None"}`);
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

      // Confidence distribution
      const confDist = {
        "50-65%": signals.filter(s => s.confidenceLevel >= 50 && s.confidenceLevel < 65).length,
        "65-80%": signals.filter(s => s.confidenceLevel >= 65 && s.confidenceLevel < 80).length,
        "80-95%": signals.filter(s => s.confidenceLevel >= 80 && s.confidenceLevel <= 95).length,
      };
      logger.info("\n📈 Confidence level distribution:");
      for (const [range, count] of Object.entries(confDist)) {
        logger.info(`   ${range}: ${count} signals`);
      }

      logger.info(`\n✅ Dry run complete! Run without --dry-run to create ${signalCount} prediction signals.`);
    } else {
      // Bulk insert for efficiency
      const result = await Signal.insertMany(signals);
      logger.info(`\n✅ Successfully created ${result.length} test prediction signals!`);

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
      
      // Summary stats
      const avgConfidence = signals.reduce((sum, s) => sum + s.confidenceLevel, 0) / signals.length;
      const withEventUrl = signals.filter(s => s.eventUrl).length;
      logger.info(`\n📊 Summary:`);
      logger.info(`   Average confidence: ${avgConfidence.toFixed(1)}%`);
      logger.info(`   Signals with event URLs: ${withEventUrl} (${((withEventUrl / signals.length) * 100).toFixed(1)}%)`);
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
