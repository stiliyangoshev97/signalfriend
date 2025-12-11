/**
 * @fileoverview Script to modify predictor sales/earnings for testing verification flow
 *
 * This script allows you to modify a predictor's totalSales and create mock receipts
 * to test the verification application flow without making real purchases.
 *
 * VERIFICATION REQUIREMENTS:
 * - Minimum 100 sales (totalSales >= 100)
 * - Minimum $1000 USDT in total sales revenue (from Receipt aggregation)
 *
 * Usage:
 *   npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --sales=150 --revenue=1500
 *   npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --sales=150 --revenue=1500 --dry-run
 *   npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --reset
 *   npx tsx src/scripts/modifyPredictorStats.ts --list
 *
 * Options:
 *   --address=<wallet>  Predictor wallet address (required unless --list)
 *   --sales=<number>    Set totalSales to this value (default: 100)
 *   --revenue=<number>  Total revenue in USDT to simulate (default: 1000)
 *   --dry-run           Preview changes without applying
 *   --reset             Reset predictor to 0 sales and remove mock receipts
 *   --list              List all predictors with their current stats
 *
 * @module scripts/modifyPredictorStats
 */

import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { Predictor } from "../features/predictors/predictor.model.js";
import { Receipt } from "../features/receipts/receipt.model.js";
import { Signal } from "../features/signals/signal.model.js";
import { logger } from "../shared/config/logger.js";

// =============================================================================
// Configuration
// =============================================================================

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/signalfriend";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");
const shouldReset = process.argv.includes("--reset");
const shouldList = process.argv.includes("--list");

const addressArg = process.argv.find(arg => arg.startsWith("--address="));
const salesArg = process.argv.find(arg => arg.startsWith("--sales="));
const revenueArg = process.argv.find(arg => arg.startsWith("--revenue="));

const targetAddress = addressArg?.split("=")[1]?.toLowerCase();
const targetSales = salesArg ? parseInt(salesArg.split("=")[1] ?? "100", 10) : 100;
const targetRevenue = revenueArg ? parseFloat(revenueArg.split("=")[1] ?? "1000") : 1000;

// Mock receipt prefix for identification
const MOCK_TX_PREFIX = "0xMOCK_VERIFICATION_TEST_";

// =============================================================================
// Helper Functions
// =============================================================================

function printUsage(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║              PREDICTOR STATS MODIFIER - Verification Testing                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Modify predictor sales/earnings to test the verification application flow  ║
║                                                                              ║
║  VERIFICATION REQUIREMENTS:                                                  ║
║  • Minimum 100 sales (totalSales >= 100)                                     ║
║  • Minimum $1000 USDT total revenue (from Receipt aggregation)               ║
╚══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  npx tsx src/scripts/modifyPredictorStats.ts [options]

OPTIONS:
  --address=<wallet>  Predictor wallet address (required unless --list)
  --sales=<number>    Set totalSales to this value (default: 100)
  --revenue=<number>  Total revenue in USDT to simulate (default: 1000)
  --dry-run           Preview changes without applying
  --reset             Reset predictor stats and remove mock receipts
  --list              List all predictors with their current stats

EXAMPLES:
  # Set predictor to meet verification requirements
  npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --sales=100 --revenue=1000

  # Set higher stats for testing
  npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --sales=250 --revenue=5000

  # Preview changes without applying
  npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --sales=100 --dry-run

  # Reset predictor to original state
  npx tsx src/scripts/modifyPredictorStats.ts --address=0x123... --reset

  # List all predictors and their stats
  npx tsx src/scripts/modifyPredictorStats.ts --list
`);
}

async function listPredictors(): Promise<void> {
  const predictors = await Predictor.find({}).sort({ totalSales: -1 }).limit(50);

  if (predictors.length === 0) {
    console.log("\n❌ No predictors found in the database.\n");
    return;
  }

  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                           PREDICTOR STATS                                    ║");
  console.log("╠══════════════════════════════════════════════════════════════════════════════╣");

  for (const p of predictors) {
    // Get earnings from receipts
    const result = await Receipt.aggregate([
      { $match: { predictorAddress: p.walletAddress } },
      { $group: { _id: null, totalRevenue: { $sum: "$priceUsdt" }, count: { $sum: 1 } } },
    ]);

    const revenue = result[0]?.totalRevenue || 0;
    const receiptCount = result[0]?.count || 0;

    // Check mock receipts
    const mockCount = await Receipt.countDocuments({
      predictorAddress: p.walletAddress,
      transactionHash: { $regex: /^0xMOCK_VERIFICATION_TEST_/ },
    });

    const verifiedIcon = p.isVerified ? "✓" : " ";
    const pendingIcon = p.verificationStatus === "pending" ? "⏳" : "";
    const canApply = p.totalSales >= 100 && revenue >= 1000 && !p.isVerified;

    console.log(`║ ${verifiedIcon} ${p.displayName.padEnd(20)} │ Sales: ${String(p.totalSales).padStart(5)} │ Revenue: $${revenue.toFixed(0).padStart(6)} │ ${pendingIcon}${canApply ? "✅ Can verify" : ""}`);
    if (mockCount > 0) {
      console.log(`║   └─ (${mockCount} mock receipts for testing)`);
    }
  }

  console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
  console.log(`\nShowing ${predictors.length} predictors. Use --address to modify a specific one.\n`);
}

async function resetPredictor(address: string): Promise<void> {
  const predictor = await Predictor.findOne({ walletAddress: address });

  if (!predictor) {
    console.log(`\n❌ Predictor not found: ${address}\n`);
    return;
  }

  // Count real and mock receipts
  const mockReceiptCount = await Receipt.countDocuments({
    predictorAddress: address,
    transactionHash: { $regex: /^0xMOCK_VERIFICATION_TEST_/ },
  });

  const realReceiptCount = await Receipt.countDocuments({
    predictorAddress: address,
    transactionHash: { $not: { $regex: /^0xMOCK_VERIFICATION_TEST_/ } },
  });

  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                         RESET PREDICTOR STATS                                ║");
  console.log("╠══════════════════════════════════════════════════════════════════════════════╣");
  console.log(`║ Address:          ${address}`);
  console.log(`║ Display Name:     ${predictor.displayName}`);
  console.log(`║ Current Sales:    ${predictor.totalSales}`);
  console.log(`║ Mock Receipts:    ${mockReceiptCount} (will be deleted)`);
  console.log(`║ Real Receipts:    ${realReceiptCount} (will be kept)`);
  console.log(`║ New Sales Count:  ${realReceiptCount}`);
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝");

  if (isDryRun) {
    console.log("\n🔍 DRY RUN - No changes made.\n");
    return;
  }

  // Delete mock receipts
  const deleteResult = await Receipt.deleteMany({
    predictorAddress: address,
    transactionHash: { $regex: /^0xMOCK_VERIFICATION_TEST_/ },
  });

  // Update predictor sales to match real receipt count
  predictor.totalSales = realReceiptCount;
  
  // Reset verification status if needed
  if (predictor.verificationStatus === "pending") {
    predictor.verificationStatus = "none";
    predictor.verificationAppliedAt = undefined;
  }

  await predictor.save();

  console.log(`\n✅ Reset complete!`);
  console.log(`   - Deleted ${deleteResult.deletedCount} mock receipts`);
  console.log(`   - Set totalSales to ${realReceiptCount}\n`);
}

async function modifyPredictor(address: string, sales: number, revenue: number): Promise<void> {
  const predictor = await Predictor.findOne({ walletAddress: address });

  if (!predictor) {
    console.log(`\n❌ Predictor not found: ${address}\n`);
    return;
  }

  // Get current stats
  const currentResult = await Receipt.aggregate([
    { $match: { predictorAddress: address } },
    { $group: { _id: null, totalRevenue: { $sum: "$priceUsdt" }, count: { $sum: 1 } } },
  ]);

  const currentRevenue = currentResult[0]?.totalRevenue || 0;
  const currentReceiptCount = currentResult[0]?.count || 0;

  // Calculate how many mock receipts we need
  const revenueNeeded = Math.max(0, revenue - currentRevenue);
  const receiptsToCreate = revenueNeeded > 0 ? Math.ceil(revenueNeeded / 10) : 0; // $10 avg per receipt
  const pricePerReceipt = receiptsToCreate > 0 ? revenueNeeded / receiptsToCreate : 0;

  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                       MODIFY PREDICTOR STATS                                 ║");
  console.log("╠══════════════════════════════════════════════════════════════════════════════╣");
  console.log(`║ Address:            ${address}`);
  console.log(`║ Display Name:       ${predictor.displayName}`);
  console.log("╠──────────────────────────────────────────────────────────────────────────────╣");
  console.log(`║ Current totalSales: ${predictor.totalSales} → ${sales}`);
  console.log(`║ Current revenue:    $${currentRevenue.toFixed(2)} → $${revenue.toFixed(2)}`);
  console.log(`║ Receipts to create: ${receiptsToCreate} (at ~$${pricePerReceipt.toFixed(2)} each)`);
  console.log("╠──────────────────────────────────────────────────────────────────────────────╣");
  console.log(`║ Verification Status: ${predictor.verificationStatus}`);
  console.log(`║ Is Verified:         ${predictor.isVerified}`);
  console.log("╠──────────────────────────────────────────────────────────────────────────────╣");

  const meetsRequirements = sales >= 100 && revenue >= 1000;
  if (meetsRequirements && !predictor.isVerified) {
    console.log("║ ✅ After changes: ELIGIBLE for verification application                     ║");
  } else if (predictor.isVerified) {
    console.log("║ ✓ Already verified                                                          ║");
  } else {
    console.log("║ ❌ After changes: NOT eligible (need 100+ sales AND $1000+ revenue)         ║");
  }
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝");

  if (isDryRun) {
    console.log("\n🔍 DRY RUN - No changes made.\n");
    return;
  }

  // Get or create a signal for mock receipts
  let signal = await Signal.findOne({ predictorAddress: address });
  if (!signal && receiptsToCreate > 0) {
    // Create a mock signal if none exists
    signal = await Signal.create({
      contentId: `mock-signal-${randomUUID().slice(0, 8)}`,
      predictorAddress: address,
      title: "Mock Signal for Testing",
      summary: "Auto-generated for verification testing",
      content: "This is a mock signal created for testing purposes.",
      category: "crypto",
      priceUsdt: pricePerReceipt,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdOnChain: true,
      salesCount: 0,
    });
    console.log(`\n📝 Created mock signal: ${signal.contentId}`);
  }

  // Create mock receipts
  if (receiptsToCreate > 0 && signal) {
    const mockReceipts = [];
    const baseTokenId = Date.now();

    for (let i = 0; i < receiptsToCreate; i++) {
      mockReceipts.push({
        tokenId: baseTokenId + i,
        contentId: signal.contentId,
        buyerAddress: `0xmockbuyer${i.toString().padStart(32, "0")}`,
        predictorAddress: address,
        signalId: signal._id,
        priceUsdt: pricePerReceipt,
        purchasedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        transactionHash: `${MOCK_TX_PREFIX}${randomUUID()}`,
      });
    }

    await Receipt.insertMany(mockReceipts);
    console.log(`📜 Created ${receiptsToCreate} mock receipts`);
  }

  // Update predictor sales
  predictor.totalSales = sales;
  await predictor.save();

  console.log(`✅ Updated totalSales to ${sales}`);

  // Verify final state
  const finalResult = await Receipt.aggregate([
    { $match: { predictorAddress: address } },
    { $group: { _id: null, totalRevenue: { $sum: "$priceUsdt" } } },
  ]);

  const finalRevenue = finalResult[0]?.totalRevenue || 0;
  console.log(`\n📊 Final state:`);
  console.log(`   - totalSales: ${sales}`);
  console.log(`   - Total revenue: $${finalRevenue.toFixed(2)}`);
  console.log(`   - Can apply for verification: ${sales >= 100 && finalRevenue >= 1000 ? "YES ✅" : "NO ❌"}\n`);
}

// =============================================================================
// Main Execution
// =============================================================================

async function main(): Promise<void> {
  // Show usage if no arguments or help requested
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  // Validate arguments
  if (!shouldList && !targetAddress) {
    printUsage();
    console.error("❌ Error: --address is required unless using --list\n");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB");

    if (shouldList) {
      await listPredictors();
    } else if (shouldReset && targetAddress) {
      await resetPredictor(targetAddress);
    } else if (targetAddress) {
      await modifyPredictor(targetAddress, targetSales, targetRevenue);
    }

    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Script error");
    process.exit(1);
  }
}

main();
