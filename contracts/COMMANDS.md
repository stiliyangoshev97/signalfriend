# 📋 SignalFriend Commands Reference

> Personal quick reference for common commands.  
> Last Updated: November 29, 2024

---

## 🚀 Deployment Commands

### BNB Testnet (Phase 1)

```bash
# Navigate to contracts directory
cd /Users/stiliyangoshev/Desktop/Coding/Full\ Projects/SignalFriend/contracts

# Deploy with contract verification
source .env && forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BNB_TESTNET_RPC_URL \
  --broadcast \
  --verify

# Deploy WITHOUT verification (faster, verify later)
source .env && forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BNB_TESTNET_RPC_URL \
  --broadcast
```

### Local Anvil (Testing)

```bash
# Terminal 1: Start local node
anvil

# Terminal 2: Deploy
source .env && forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast
```

### BNB Mainnet (Phase 1)

```bash
# ⚠️ MAINNET - Double check everything!
# Make sure DEPLOY_MOCK_USDT = false in Deploy.s.sol

source .env && forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BNB_MAINNET_RPC_URL \
  --broadcast \
  --verify
```

---

## 🔐 Phase 2: MultiSig Setup (BscScan)

After Phase 1 deployment, complete setup manually on BscScan:

### Step 1: Set PredictorAccessPass
1. Go to SignalFriendMarket on BscScan → Write Contract
2. Connect Signer 1 wallet (MetaMask)
3. Call `proposeUpdatePredictorAccessPass(address)` with PredictorAccessPass address
4. Copy the `actionId` from transaction logs
5. Connect Signer 2 → Call `approveAction(actionId)`
6. Connect Signer 3 → Call `approveAction(actionId)` (auto-executes)

### Step 2: Set SignalKeyNFT
1. Connect Signer 1 wallet
2. Call `proposeUpdateSignalKeyNFT(address)` with SignalKeyNFT address
3. Copy the `actionId` from transaction logs
4. Connect Signer 2 → Call `approveAction(actionId)`
5. Connect Signer 3 → Call `approveAction(actionId)` (auto-executes)

### Step 3: Verify
- Call `isFullyInitialized()` → should return `true`

---

## 🧪 Testing Commands

```bash
# Run all tests
forge test

# Verbose output (recommended)
forge test -vv

# Full trace (debugging)
forge test -vvvv

# Specific contract
forge test --match-contract SignalFriendMarketTest
forge test --match-contract PredictorAccessPassTest
forge test --match-contract SignalKeyNFTTest

# Specific test function
forge test --match-test test_JoinAsPredictor_Success

# Gas report
forge test --gas-report

# Coverage
forge coverage
```

---

## 🔨 Build & Development

```bash
# Build contracts
forge build

# Clean build
forge clean && forge build

# Format code
forge fmt

# Gas snapshots
forge snapshot
```

---

## 🔍 Contract Verification (Manual)

```bash
# If auto-verify fails, verify manually:
forge verify-contract <CONTRACT_ADDRESS> SignalFriendMarket \
  --chain-id 97 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address[3],address,address,address)" \
    <USDT_ADDRESS> \
    <SIGNER1> <SIGNER2> <SIGNER3> \
    <TREASURY> \
    0x0000000000000000000000000000000000000000 \
    0x0000000000000000000000000000000000000000)
```

---

## 🌐 Cast Commands (Read Blockchain)

```bash
# Check balance
cast balance <ADDRESS> --rpc-url $BNB_TESTNET_RPC_URL

# Call view function
cast call <CONTRACT> "isFullyInitialized()" --rpc-url $BNB_TESTNET_RPC_URL

# Get block number
cast block-number --rpc-url $BNB_TESTNET_RPC_URL
```

---

## 📁 Environment Setup

```bash
# Copy template (first time only)
cp .env.example .env

# Edit .env with your values
# Required variables:
# - BNB_TESTNET_RPC_URL
# - PRIVATE_KEY_1
# - ETHERSCAN_API_KEY
# - MULTISIG_SIGNER_1, _2, _3
# - PLATFORM_TREASURY
```

---

## 🔗 Useful Links

- **BNB Testnet Faucet:** https://testnet.bnbchain.org/faucet-smart
- **BscScan Testnet:** https://testnet.bscscan.com
- **BscScan Mainnet:** https://bscscan.com
- **Foundry Book:** https://book.getfoundry.sh

---

## 📝 Notes

- Always run `source .env` before deployment commands
- Deployed addresses saved to `deployment-addresses.txt`
- Phase 2 must be completed within 1 hour (action expiry)
- Check `isFullyInitialized()` before using the platform
