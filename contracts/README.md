# 🚀 SignalFriend Smart Contracts

**Production-ready smart contracts for a Web3 NFT-based signal marketplace on BNB Chain.**

SignalFriend connects verified prediction makers (Predictors) with traders through transparent, on-chain NFT mechanisms. Predictors sell trading signals as NFTs, and buyers receive transferable receipts that unlock premium content.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Fee Structure](#fee-structure)
- [Security Features](#security-features)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## 🎯 Overview

SignalFriend is a Web3 signal marketplace built on BNB Chain that leverages:

- **PredictorAccessPass NFT** - Soulbound seller license (ERC-721)
- **SignalKeyNFT** - Transferable buyer receipt with content identifier (ERC-721)
- **SignalFriendMarket** - Logic/orchestrator for payments and minting
- **USDT (BEP-20)** - Payment currency for all transactions
- **3-of-3 MultiSig Governance** - Built-in governance across all contracts

### Key Features

✅ **Soulbound Predictor Licenses** - Non-transferable, one-per-wallet enforcement  
✅ **Referral System** - $5 USDT automatic payouts to valid referrers  
✅ **Flexible Fee Structure** - Platform commission, buyer access fees, minimum pricing  
✅ **Blacklisting System** - On-chain malicious actor prevention  
✅ **Rating Enforcement** - One rating per purchase with on-chain verification  
✅ **Token Enumeration** - Reliable ownership tracking without relying on events  
✅ **Emergency Pause** - MultiSig-controlled circuit breaker  

---

## 🏗️ Architecture

### Contract Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SignalFriendMarket                       │
│                  (Logic/Orchestrator)                        │
│                                                              │
│  • Predictor Registration ($20 USDT)                         │
│  • Signal Purchase (min $5 USDT + $0.5 fee)                 │
│  • Fee Splitting (5% platform, 95% predictor)                │
│  • Rating System (markSignalRated)                           │
│  • MultiSig Governance (11 action types)                     │
└───────────────┬─────────────────────┬────────────────────────┘
                │                     │
                │ mintForLogicContract() 
                │                     │
       ┌────────▼─────────┐  ┌────────▼──────────┐
       │ PredictorAccess  │  │   SignalKeyNFT     │
       │     Pass NFT     │  │                    │
       │                  │  │  • Transferable    │
       │  • Soulbound     │  │  • Content ID      │
       │  • One-per-wallet│  │  • Ownership       │
       │  • Blacklisting  │  │    Enumeration     │
       │  • MultiSig      │  │  • MultiSig        │
       └──────────────────┘  └────────────────────┘
```

---

## 📜 Smart Contracts

### 1. PredictorAccessPass.sol (~600 lines)

**Soulbound ERC-721 NFT for seller licensing**

**Features:**
- Non-transferable (soulbound) with transfer blocking
- One NFT per wallet enforcement
- Dual minting: logic contract + owner-proposed minting
- Built-in 3-of-3 MultiSig governance
- Blacklisting system for malicious actors
- Updateable metadata URI
- Token IDs start from 1

**Key Functions:**
- `mintForLogicContract(address)` - Exclusive minting by SignalFriendMarket
- `proposeOwnerMint(address)` - MultiSig-governed premium client onboarding
- `proposeBlacklist(address)` - MultiSig-governed blacklisting
- `isPredictorActive(address)` - Check if predictor is valid and not blacklisted
- `getPredictorTokenId(address)` - Get token ID for a predictor

### 2. SignalKeyNFT.sol (~600 lines)

**Transferable ERC-721 NFT for signal purchase receipts**

**Features:**
- Fully transferable (not soulbound)
- Stores non-unique `contentIdentifier` (bytes32) per token
- Exclusive minting via SignalFriendMarket
- Built-in 3-of-3 MultiSig governance
- Custom ownership tracking with `_update()` override
- `tokensOfOwner()` for reliable "My Signals" page
- Updateable metadata URI

**Key Functions:**
- `mintForLogicContract(address, bytes32)` - Exclusive minting by SignalFriendMarket
- `getContentIdentifier(uint256)` - Retrieve content ID for a token
- `tokensOfOwner(address)` - Get all tokens owned by an address
- `exists(uint256)` - Check if token exists

### 3. SignalFriendMarket.sol (~1,000 lines)

**Core logic contract orchestrating the marketplace**

**Features:**
- Predictor registration with referral system
- Signal purchase with fee splitting
- USDT payment processing
- Rating system with ownership verification
- Built-in 3-of-3 MultiSig governance (11 action types)
- Emergency pause mechanism
- Two-phase deployment support
- Statistics tracking

**Key Functions:**
- `joinAsPredictor(address)` - Register as predictor with $20 USDT fee
- `buySignalNFT(bytes32, uint256, address)` - Purchase signal NFT
- `markSignalRated(uint256)` - Mark token as rated (one-time only)
- `calculateBuyerCost(uint256)` - Calculate total cost for buyer
- `calculatePredictorPayout(uint256)` - Calculate predictor earnings
- `isValidPredictor(address)` - Check if predictor is active

---

## 💰 Fee Structure

| Fee Type                  | Amount        | Description                                    |
|---------------------------|---------------|------------------------------------------------|
| **Predictor Join Fee**    | $20 USDT      | One-time registration fee                      |
| **Referral Payout**       | $5 USDT       | 25% of join fee to valid referrer              |
| **Platform Commission**   | 5%            | Of signal price (adjustable via MultiSig)      |
| **Buyer Access Fee**      | $0.5 USDT     | Flat fee per purchase (Sybil protection)       |
| **Minimum Signal Price**  | $5 USDT       | Enforced minimum to prevent manipulation       |

**Example Purchase:**
- Signal Price: $10 USDT
- Buyer Access Fee: $0.5 USDT
- **Total Buyer Cost: $10.50 USDT**
- Platform Commission (5%): $0.50 USDT
- **Predictor Receives: $9.50 USDT (95%)**

---

## 🔒 Security Features

### MultiSig Governance (3-of-3)

All critical operations require 3 signers to approve:

**PredictorAccessPass:**
- Owner minting (premium clients)
- Blacklisting predictors
- Updating metadata URI

**SignalKeyNFT:**
- Updating logic contract address
- Updating metadata URI

**SignalFriendMarket:**
- Updating USDT contract address
- Updating NFT contract addresses
- Updating treasury address
- Updating commission rate
- Updating all fee amounts
- Pausing/unpausing contract

### Additional Security

- **Soulbound Enforcement** - Prevents license trading
- **One-per-Wallet** - Prevents multi-license abuse
- **Blacklisting** - Immutable source of truth for banned actors
- **Emergency Pause** - Circuit breaker for critical issues
- **Allowance Validation** - Pre-flight checks for USDT transfers
- **Action Expiry** - 1-hour timeout for pending MultiSig actions

---

## 🛠️ Development Setup

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git
- Solidity 0.8.24

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/SignalFriend.git
cd SignalFriend/contracts

# Install dependencies
forge install

# Build contracts
forge build
```

### Project Structure

```
contracts/
├── src/
│   ├── PredictorAccessPass.sol
│   ├── SignalKeyNFT.sol
│   └── SignalFriendMarket.sol
├── test/
│   └── (test files - coming soon)
├── script/
│   └── (deployment scripts - coming soon)
├── foundry.toml
├── remappings.txt
└── README.md
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/PredictorAccessPass.t.sol

# Gas report
forge test --gas-report
```

### Test Coverage

```bash
# Generate coverage report
forge coverage

# Generate detailed HTML report
forge coverage --report lcov
genhtml lcov.info -o coverage
```

**Note:** Test files are currently in development. See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for testing roadmap.

---

## 🚀 Deployment

### Local Deployment (Anvil)

```bash
# Start local node
anvil

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### BNB Testnet Deployment

```bash
# Set environment variables in .env
# TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
# PRIVATE_KEY=your_private_key
# BSCSCAN_API_KEY=your_api_key

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $TESTNET_RPC_URL --broadcast --verify

# Verify contracts
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain-id 97
```

### BNB Mainnet Deployment

```bash
# Deploy to mainnet (use with caution)
forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC_URL --broadcast --verify
```

**Important:** See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for detailed two-phase deployment strategy.

---

## 📚 Documentation

- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Comprehensive project status and architecture
- **[PROJECT.md](../PROJECT.md)** - Original requirements and specifications

### External Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [BNB Chain Docs](https://docs.bnbchain.org/)

---

## 🔧 Foundry Commands

### Build

```bash
forge build
```

### Format Code

```bash
forge fmt
```

### Gas Snapshots

```bash
forge snapshot
```

### Local Node

```bash
anvil
```

### Cast (Blockchain Interactions)

```bash
# Get block number
cast block-number --rpc-url <RPC_URL>

# Get balance
cast balance <ADDRESS> --rpc-url <RPC_URL>

# Call contract
cast call <CONTRACT_ADDRESS> "balanceOf(address)" <ADDRESS> --rpc-url <RPC_URL>
```

### Help

```bash
forge --help
anvil --help
cast --help
```

---

## 📊 Contract Statistics

| Contract                | Lines of Code | Status      |
|-------------------------|---------------|-------------|
| PredictorAccessPass.sol | ~600          | ✅ Complete |
| SignalKeyNFT.sol        | ~600          | ✅ Complete |
| SignalFriendMarket.sol  | ~1,000        | ✅ Complete |
| **Total**               | **~2,200**    | **✅ Complete** |

---

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

---

## 📄 License

This project is proprietary and confidential.

---

## 🔐 Security

For security concerns, please contact the team directly through private channels.

**Do not create public issues for security vulnerabilities.**

---

## 📞 Support

- **Predictor Support:** Private Discord group for sellers
- **Trader Support:** Separate Discord group for buyers

---

**Built with ❤️ using Foundry, Solidity, and OpenZeppelin**
