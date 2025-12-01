/**
 * @fileoverview Script to generate event signatures (topic0) for webhook matching.
 * 
 * Run with: npx tsx src/scripts/generateEventSignatures.ts
 */
import { toEventSelector } from "viem";

// Event definitions exactly as they appear in the contracts
const events = {
  // From SignalFriendMarket
  PredictorJoined: "event PredictorJoined(address indexed predictor, address indexed referrer, uint256 nftTokenId, bool referralPaid)",
  SignalPurchased: "event SignalPurchased(address indexed buyer, address indexed predictor, uint256 indexed receiptTokenId, bytes32 contentIdentifier, uint256 signalPrice, uint256 totalCost)",
  
  // From PredictorAccessPass
  PredictorBlacklisted: "event PredictorBlacklisted(address indexed predictor, bool status)",
};

console.log("Event Signatures (topic0 hashes):\n");

for (const [name, signature] of Object.entries(events)) {
  const hash = toEventSelector(signature);
  console.log(`${name}:`);
  console.log(`  Signature: ${signature}`);
  console.log(`  Hash: ${hash}`);
  console.log();
}

console.log("\nCopy-paste for webhook.schemas.ts:\n");
console.log("export const EVENT_SIGNATURES = {");
for (const [name, signature] of Object.entries(events)) {
  const hash = toEventSelector(signature);
  console.log(`  /** ${signature.replace("event ", "")} */`);
  console.log(`  ${name}: "${hash}" as const,`);
}
console.log("} as const;");
