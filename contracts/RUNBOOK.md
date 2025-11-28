# 📋 SignalFriend Runbook

> Complete deployment, setup, and operations guide.  
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

## 🔐 Phase 2: MultiSig Setup (BscScan) - DETAILED GUIDE

After Phase 1 deployment, you MUST complete Phase 2 before the platform is usable.
The market's `isFullyInitialized()` must return `true` before any operations work.

### 📍 Contract Addresses (from deployment-addresses.txt)
```
SignalFriendMarket:   0x5133397a4B9463c5270beBa05b22301e6dD184ca
PredictorAccessPass:  0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4
SignalKeyNFT:         0xfb26Df6101e1a52f9477f52F54b91b99fb016aed
```

### 📍 MultiSig Signers
```
Signer 1: 0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2
Signer 2: 0xC119B9152afcC5f40C019aABd78A312d37C63926
Signer 3: 0x6499fe8016cE2C2d3a21d08c3016345Edf3467F1
```

---

### Part A: Set PredictorAccessPass Address

**Step 1: Signer 1 PROPOSES**
1. Go to SignalFriendMarket on BscScan:
   - Testnet: https://testnet.bscscan.com/address/0x5133397a4B9463c5270beBa05b22301e6dD184ca#writeContract
2. Click **"Connect to Web3"** → Connect **Signer 1** wallet in MetaMask
3. Find function: `proposeUpdatePredictorAccessPass`
4. Enter the PredictorAccessPass address: `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4`
5. Click **"Write"** → Confirm in MetaMask
6. Wait for transaction to confirm

**Step 2: Get the actionId from Transaction Logs**
1. After TX confirms, click on the transaction hash
2. Go to the **"Logs"** tab
3. Find the `ActionProposed` event
4. Copy the `actionId` value (bytes32, looks like):
   ```
   0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   ```
   ⚠️ Use **HEX format** with the `0x` prefix!

**Step 3: Signer 2 APPROVES**
1. Disconnect Signer 1, connect **Signer 2** wallet in MetaMask
2. Find function: `approveAction`
3. Paste the `actionId` from Step 2
4. Click **"Write"** → Confirm in MetaMask

**Step 4: Signer 3 APPROVES (Auto-Executes)**
1. Disconnect Signer 2, connect **Signer 3** wallet in MetaMask
2. Find function: `approveAction`
3. Paste the same `actionId`
4. Click **"Write"** → Confirm in MetaMask
5. ✅ On 3rd approval, the action **automatically executes**!

---

### Part B: Set SignalKeyNFT Address

**Repeat the same process:**

**Step 1: Signer 1 PROPOSES**
1. Connect **Signer 1** wallet
2. Find function: `proposeUpdateSignalKeyNFT`
3. Enter the SignalKeyNFT address: `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed`
4. Click **"Write"** → Get new `actionId` from logs

**Step 2: Signer 2 APPROVES**
- `approveAction(new_actionId)`

**Step 3: Signer 3 APPROVES**
- `approveAction(new_actionId)` → auto-executes

---

### Part C: Verify Setup Complete ✅

1. Go to SignalFriendMarket → **Read Contract** tab
2. Find function: `isFullyInitialized`
3. Click **"Query"**
4. Result should be: **`true`**

If `true` → Platform is ready! You can now test `joinAsPredictor`, `buySignalNFT`, etc.

---

### ⏰ Important Notes

- **Action Expiry:** Each proposed action expires after **1 hour**. Complete all 3 approvals within that time.
- **actionId Format:** Always use hex format with `0x` prefix (66 characters total)
- **Order:** You can do Part A and Part B in any order, but both must be complete
- **Gas:** Each signer needs testnet BNB for gas fees

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

---

## 🎯 Manual Testing on BscScan (After Phase 2)

### Test 1: Join as Predictor

**Prerequisites:**
- `isFullyInitialized()` returns `true`
- Wallet has MockUSDT balance (use `mint` function on MockUSDT if needed)

**Step 1: Approve USDT**
1. Go to MockUSDT: https://testnet.bscscan.com/address/0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5#writeContract
2. Connect your wallet
3. Call `approve`:
   - `spender`: `0x5133397a4B9463c5270beBa05b22301e6dD184ca` (SignalFriendMarket)
   - `value`: `20000000000000000000` (20 USDT with 18 decimals)
4. Confirm transaction

**Step 2: Join as Predictor**
1. Go to SignalFriendMarket: https://testnet.bscscan.com/address/0x5133397a4B9463c5270beBa05b22301e6dD184ca#writeContract
2. Call `joinAsPredictor`:
   - `_referrer`: `0x0000000000000000000000000000000000000000` (no referrer)
3. Confirm transaction
4. ✅ You now have a PredictorAccessPass NFT!

**Verify:**
- Go to PredictorAccessPass → Read Contract → `balanceOf(your_address)` should return `1`

---

### Test 2: Buy Signal NFT

**Prerequisites:**
- Buyer wallet has MockUSDT
- A predictor exists (from Test 1)

**Step 1: Approve USDT**
1. Go to MockUSDT → Write Contract
2. Call `approve`:
   - `spender`: `0x5133397a4B9463c5270beBa05b22301e6dD184ca`
   - `value`: `5500000000000000000` (5.5 USDT = 5 price + 0.5 fee)

**Step 2: Buy Signal**
1. Go to SignalFriendMarket → Write Contract
2. Call `buySignalNFT`:
   - `_predictor`: `<predictor_wallet_address>` (e.g., `0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2`)
   - `_signalPrice`: `5000000000000000000` (5 USDT minimum)
   - `_maxCommissionRate`: `500` (5% = 500 basis points, matches current platform rate)
   - `_contentIdentifier`: `0x0000000000000000000000000000000000000000000000000000000000000001` (any bytes32 for testing)
3. Confirm transaction
4. ✅ You now have a SignalKeyNFT!

**Field Explanations:**
| Field | Type | Description |
|-------|------|-------------|
| `_predictor` | address | Wallet address of the predictor selling the signal |
| `_signalPrice` | uint256 | The signal price in wei (5 USDT = 5000000000000000000). This is the **predictor's asking price**, NOT the total cost. |
| `_maxCommissionRate` | uint256 | Front-run protection, use `500` for 5% |
| `_contentIdentifier` | bytes32 | Links NFT to off-chain content (from backend in production) |

**⚠️ IMPORTANT - Total Cost Breakdown:**
```
Total Cost = _signalPrice + buyerAccessFee (0.5 USDT)

Example with 5 USDT signal:
- _signalPrice:    5.00 USDT (what you enter in the field)
- buyerAccessFee:  0.50 USDT (automatic platform fee)
- Total Cost:      5.50 USDT (what you need to approve)

Fee Distribution:
- Predictor gets:  4.75 USDT (95% of _signalPrice)
- Platform gets:   0.75 USDT (5% commission + 0.5 buyer access fee)
```

**Note:** In production, `_contentIdentifier` will be generated by the Express backend (e.g., keccak256 hash of MongoDB document ID) and passed to the frontend for the transaction.

**Note:** A predictor CAN buy their own signal. There is no restriction in the contract preventing this.

---

### Test 3: Mint MockUSDT (for testing)

If you need test USDT:
1. Go to MockUSDT → Write Contract
2. Call `mint`:
   - `to`: `<your_wallet_address>`
   - `amount`: `1000000000000000000000` (1000 USDT)
3. ✅ You now have 1000 test USDT!

---

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ContractsNotInitialized` | Phase 2 not complete | Complete MultiSig setup |
| `InsufficientAllowance` | USDT not approved | Call `approve` on MockUSDT first |
| `AlreadyHasPredictorNFT` | Already a predictor | Can't join twice |
| `InvalidPredictor` | Predictor doesn't exist | Check predictor address |
| `SignalPriceTooLow` | Price < 5 USDT | Use minimum 5 USDT |

---

## 🔧 Administrative Operations (MultiSig)

### Update NFT Metadata URI

If the NFT image/metadata is not showing correctly, you can update the metadata URI via MultiSig. This must be done on each NFT contract separately.

**Available on:**
- PredictorAccessPass: `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4`
- SignalKeyNFT: `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed`

**Step 1: Signer 1 PROPOSES**
1. Go to the NFT contract on BscScan → Write Contract
2. Connect **Signer 1** wallet
3. Find function: `proposeUpdateMetadataURI`
4. Enter the new metadata URI:
   - For PredictorAccessPass: `ipfs://bafybeigp6evjkzdp5d5gqszywcqddhz5nrw6d6wqrmzx6zrrkcvemrxwk4/predictor-pass.json`
   - For SignalKeyNFT: `ipfs://bafybeicmqpgbcbh7ovsrrgchxjrn5lrxm7wvs6exqhjuvgbnvj4x3zs2h4/receipt.json`
5. Click **"Write"** → Confirm in MetaMask
6. Get the `actionId` from transaction logs (see Phase 2 instructions)

**Step 2: Signer 2 APPROVES**
1. Connect **Signer 2** wallet
2. Call `approveAction(actionId)`

**Step 3: Signer 3 APPROVES (Auto-Executes)**
1. Connect **Signer 3** wallet
2. Call `approveAction(actionId)`
3. ✅ Metadata URI updated!

**Verify:**
- Call `tokenURI(1)` on the NFT contract → should return the new URI

---

### Blacklist a Predictor

If a predictor is acting maliciously, they can be blacklisted via MultiSig on PredictorAccessPass.

**Step 1: Signer 1 PROPOSES**
1. Go to PredictorAccessPass → Write Contract
2. Connect **Signer 1** wallet
3. Find function: `proposeSetBlacklist`
4. Enter:
   - `_predictor`: The predictor's wallet address
   - `_blacklisted`: `true` (to blacklist) or `false` (to unblacklist)
5. Click **"Write"** → Get `actionId` from logs

**Steps 2-3: Signers 2 & 3 APPROVE**
- Same process as other MultiSig actions

**Effect of Blacklisting:**
- Blacklisted predictors cannot receive signal purchases
- Their existing NFT is NOT burned, but `isPredictorActive()` returns `false`
- They cannot be used as referrers for new predictors

---

## 📊 Read-Only Queries

### Check Platform Statistics
```bash
# Total predictors joined
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "totalPredictorsJoined()" --rpc-url $BNB_TESTNET_RPC_URL

# Total signals purchased
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "totalSignalsPurchased()" --rpc-url $BNB_TESTNET_RPC_URL

# Total referrals paid
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "totalReferralsPaid()" --rpc-url $BNB_TESTNET_RPC_URL
```

### Check NFT Ownership
```bash
# Check if address is a predictor
cast call 0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4 "balanceOf(address)" <WALLET_ADDRESS> --rpc-url $BNB_TESTNET_RPC_URL

# Check if predictor is active (not blacklisted)
cast call 0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4 "isPredictorActive(address)" <WALLET_ADDRESS> --rpc-url $BNB_TESTNET_RPC_URL

# Get predictor's token ID
cast call 0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4 "getPredictorTokenId(address)" <WALLET_ADDRESS> --rpc-url $BNB_TESTNET_RPC_URL
```

### Check Current Fee Parameters
```bash
# Current commission rate (basis points, 500 = 5%)
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "commissionRate()" --rpc-url $BNB_TESTNET_RPC_URL

# Minimum signal price (18 decimals)
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "minSignalPrice()" --rpc-url $BNB_TESTNET_RPC_URL

# Predictor join fee (18 decimals)
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "predictorJoinFee()" --rpc-url $BNB_TESTNET_RPC_URL

# Buyer access fee (18 decimals)
cast call 0x5133397a4B9463c5270beBa05b22301e6dD184ca "buyerAccessFee()" --rpc-url $BNB_TESTNET_RPC_URL
```
