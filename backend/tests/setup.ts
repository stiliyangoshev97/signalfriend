// Test setup file
// This runs before all tests

import { beforeAll, afterAll } from "vitest";

// You can set up test database connection here
// import { connectDatabase, disconnectDatabase } from "../src/shared/config/database.js";

beforeAll(async () => {
  // Set test environment
  process.env["NODE_ENV"] = "test";
  process.env["JWT_SECRET"] = "test-secret-key-for-testing-only-32chars";
  process.env["MONGODB_URI"] = "mongodb://localhost:27017/signalfriend-test";
  process.env["RPC_URL"] = "https://bsc-testnet-rpc.publicnode.com";
  process.env["CHAIN_ID"] = "97";
  process.env["SIGNALFRIEND_MARKET_ADDRESS"] = "0x5133397a4B9463c5270beBa05b22301e6dD184ca";
  process.env["PREDICTOR_ACCESS_PASS_ADDRESS"] = "0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4";
  process.env["SIGNAL_KEY_NFT_ADDRESS"] = "0xfb26Df6101e1a52f9477f52F54b91b99fb016aed";
  process.env["MOCK_USDT_ADDRESS"] = "0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5";

  // Connect to test database if needed
  // await connectDatabase();
});

afterAll(async () => {
  // Disconnect from test database if needed
  // await disconnectDatabase();
});
