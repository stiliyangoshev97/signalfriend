/**
 * @fileoverview Script to check predictor stats for verification testing
 *
 * This script displays a predictor's current sales, earnings, and verification-related
 * baseline values used for tracking reapplication requirements after rejection.
 *
 * DISPLAYED STATS:
 * - totalSales: Current total number of signal sales
 * - salesAtLastApplication: Sales count at time of last rejection
 * - earningsAtLastApplication: Earnings (USDT) at time of last rejection
 * - verificationStatus: Current verification status (pending/approved/rejected)
 * - salesSinceRejection: Calculated incremental sales since last rejection
 *
 * Usage:
 *   npx tsx src/scripts/checkPredictorStats.ts --address=0x123...
 *   npx tsx src/scripts/checkPredictorStats.ts --list
 *
 * Options:
 *   --address=<wallet>  Predictor wallet address to check (required unless --list)
 *   --list              List all predictors with their verification stats
 *
 * @module scripts/checkPredictorStats
 */

import mongoose from 'mongoose';
import { Predictor } from '../features/predictors/predictor.model.js';

// =============================================================================
// Configuration
// =============================================================================

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/signalfriend";

// Parse CLI arguments
const shouldList = process.argv.includes("--list");
const addressArg = process.argv.find(arg => arg.startsWith("--address="));
const targetAddress = addressArg?.split("=")[1]?.toLowerCase();

// =============================================================================
// Main Functions
// =============================================================================

async function listAllPredictors() {
  const predictors = await Predictor.find({}).select(
    'walletAddress displayName totalSales salesAtLastApplication earningsAtLastApplication verificationStatus'
  );

  if (predictors.length === 0) {
    console.log('\nNo predictors found.');
    return;
  }

  console.log('\n=== All Predictors ===\n');
  predictors.forEach(predictor => {
    const salesSinceRejection = predictor.totalSales - (predictor.salesAtLastApplication || 0);
    console.log(`Wallet: ${predictor.walletAddress}`);
    console.log(`Display Name: ${predictor.displayName || 'N/A'}`);
    console.log(`Total Sales: ${predictor.totalSales}`);
    console.log(`Sales at Last Application: ${predictor.salesAtLastApplication || 0}`);
    console.log(`Earnings at Last Application: ${predictor.earningsAtLastApplication || 0} USDT`);
    console.log(`Verification Status: ${predictor.verificationStatus}`);
    console.log(`Sales Since Rejection: ${salesSinceRejection}`);
    console.log('---');
  });
}

async function checkPredictorStats(walletAddress: string) {
  const predictor = await Predictor.findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  });
  
  if (!predictor) {
    console.log(`\nPredictor not found for wallet: ${walletAddress}`);
    return;
  }
  
  const salesSinceRejection = predictor.totalSales - (predictor.salesAtLastApplication || 0);
  
  console.log('\n=== Predictor Stats ===');
  console.log('Wallet Address:', predictor.walletAddress);
  console.log('Display Name:', predictor.displayName || 'N/A');
  console.log('Total Sales:', predictor.totalSales);
  console.log('Sales at Last Application:', predictor.salesAtLastApplication || 0);
  console.log('Earnings at Last Application:', predictor.earningsAtLastApplication || 0, 'USDT');
  console.log('Verification Status:', predictor.verificationStatus);
  console.log('\n=== Calculated ===');
  console.log('Sales Since Rejection:', salesSinceRejection);
  console.log('');
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);

    if (shouldList) {
      await listAllPredictors();
    } else if (targetAddress) {
      await checkPredictorStats(targetAddress);
    } else {
      console.log('\nError: Please provide either --address=<wallet> or --list');
      console.log('\nUsage:');
      console.log('  npx tsx src/scripts/checkPredictorStats.ts --address=0x123...');
      console.log('  npx tsx src/scripts/checkPredictorStats.ts --list');
      console.log('');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
