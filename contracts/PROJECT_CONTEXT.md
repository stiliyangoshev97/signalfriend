# SignalFriend - Project Context

> **Last Updated:** November 23, 2024  
> **Current Phase:** Smart Contract Development - All 3 Contracts + MockUSDT Complete  
> **Project Status:** 🟢 Contracts Complete - Ready for Testing

---

## 📋 Project Overview

**SignalFriend** is a Web3-native, transparent signal marketplace built on BNB Chain. The platform connects verified prediction makers (Predictors) with traders (Traders) via a trustless, on-chain NFT mechanism that eliminates trust issues inherent in traditional signal services.

### Core Concept
- **Product:** Trading signals/reports packaged as NFTs
- **NFT Function:** Acts as a secure, one-time-use key to unlock private signal content stored off-chain
- **Legal Structure:** NFT-based digital information marketplace (NOT gambling/betting)
- **Target Chain:** BNB Chain (BEP-20 for payments, BEP-721 for NFTs)
- **Payment Currency:** USDT (BEP-20) for all transactions

---

## 🎯 Business Model

| Revenue Stream | Amount | Description |
|----------------|--------|-------------|
| **Predictor Join Fee** | $20 USDT | One-time, non-refundable registration fee |
| **Referral Payout** | $5 USDT | 25% of join fee paid to referring predictor |
| **Trader Access Fee** | $0.5 USDT | Flat fee per signal purchase (anti-Sybil) |
| **Minimum Signal Price** | $5 USDT | Prevents rating manipulation via self-purchase |
| **Platform Commission** | 5% | Of signal price (95% goes to predictor) |

### Financial Flow:
```
Trader purchases $10 signal:
├─ Trader pays: $10.50 USDT ($10 signal + $0.50 access fee)
├─ Platform receives: $0.50 (access fee) + $0.50 (5% of $10) = $1.00 USDT
└─ Predictor receives: $9.50 USDT (95% of signal price)
```

---

## 🏗️ Architecture

### Smart Contract Architecture (3 Contracts)

#### 1. ✅ **PredictorAccessPass** (COMPLETE)
- **Type:** ERC-721 NFT (Soulbound/Non-Transferable)
- **Purpose:** Immutable seller license
- **Status:** ✅ Built, ✅ Compiled, ⏳ Testing Pending
- **Location:** `/contracts/src/PredictorAccessPass.sol`
- **Key Features:**
  - Dual minting: Logic contract + MultiSig owner mint
  - Built-in 3-of-3 MultiSig governance
  - Blacklisting system
  - One NFT per wallet enforcement
  - Token IDs start from 1
  - Fixed metadata URI for all tokens

#### 2. ✅ **SignalKeyNFT** (COMPLETE)
- **Type:** ERC-721 NFT (Transferable)
- **Purpose:** Trader receipt/key to unlock signals
- **Status:** ✅ Built, ✅ Compiled, ⏳ Testing Pending
- **Location:** `/contracts/src/SignalKeyNFT.sol`
- **Key Features:**
  - Stores non-unique ContentIdentifier (bytes32) on-chain
  - Minting only via SignalFriendMarket contract
  - Auto-incremented unique token IDs starting from 1
  - Transferable (can be resold/gifted)
  - Built-in 3-of-3 MultiSig governance
  - Updateable Logic contract address
  - Token ownership tracking (`tokensOfOwner`)
  - Fixed metadata URI for all tokens

#### 3. ✅ **SignalFriendMarket** (COMPLETE)
- **Type:** Logic/Orchestrator Contract
- **Purpose:** Business logic, payment processing, minting orchestration
- **Status:** ✅ Built, ✅ Compiled, ⏳ Testing Pending
- **Location:** `/contracts/src/SignalFriendMarket.sol`
- **Key Features:**
  - USDT (BEP-20) payment processing
  - Fee splitting logic (5% platform, 95% predictor)
  - Predictor registration with referral system ($5 payout)
  - Signal purchase flow with minimum price (5 USDT)
  - Minting orchestration for both NFT contracts
  - Built-in 3-of-3 MultiSig governance (11 action types)
  - Emergency pause mechanism
  - User-callable rating system with ownership verification
  - Two-phase deployment support (address(0) initial values)
  - Comprehensive statistics tracking
  - 10+ view functions for frontend/backend

#### 4. ✅ **MockUSDT** (COMPLETE)
- **Type:** ERC-20 Token (Test & Testnet)
- **Purpose:** Mock Binance-Peg BSC-USD for testing
- **Status:** ✅ Built, ✅ Compiled, ⏳ Testing Pending
- **Location:** `/contracts/src/MockUSDT.sol`
- **Key Features:**
  - 18 decimals (matching real BSC-USD on BNB Chain)
  - Mimics mainnet BSC-USD: `0x55d398326f99059fF775485246999027B3197955`
  - Owner-only minting: `mint()` and `batchMint()`
  - Public faucet: `claimFaucet()` - 100 USDT per hour per address
  - Max supply cap: 1 billion USDT
  - Utility functions: `toSmallestUnit()`, `toUSDT()`
  - Initial supply: 10,000 USDT to deployer
- **Use Cases:**
  - Local testing (Anvil) - Unlimited minting
  - BNB testnet deployment - Public faucet for users
  - Integration tests - Batch minting for test accounts
- **Important Note:** 
  - NOT Tether USDT (6 decimals on Ethereum)
  - On BNB Chain, "USDT" = Binance-Peg BSC-USD (18 decimals)

### Backend Architecture

#### Technology Stack:
- **Backend:** Express.js + MongoDB
- **Blockchain Interaction:** Viem (event listening, contract reads)
- **Frontend:** React + Tailwind CSS + Wagmi + RainbowKit

#### Data Flow:
```
1. Predictor uploads signal → Express API → MongoDB (assigns ContentID)
2. Trader purchases signal → SignalFriendMarket contract → Mints SignalKeyNFT
3. Contract emits SignalPurchased(buyer, tokenID, contentID)
4. Express indexer catches event → MongoDB Receipt Model (tokenID → contentID)
5. Trader views signal → Express verifies ownership → Unlocks content
```

#### MongoDB Models (4 Core):

1. **Predictor Model**
   - Primary Key: `walletAddress`
   - Fields: `isBlacklisted`, `totalSalesCount`, `averageRating`, `nickname`, `bio`, etc.

2. **Signal Model**
   - Primary Key: `contentId` (non-unique, reusable)
   - Fields: `predictorWallet`, `name`, `description`, `priceUSDT`, `category`, `riskLevel`, `potentialReward`, `expiryDate`, `fullContent`, `reasoning`

3. **Receipt Model** (Critical mapping)
   - Primary Key: `tokenId` (unique NFT receipt)
   - Fields: `buyerWallet`, `contentId`, `purchaseDate`

4. **Review Model**
   - Primary Key: `tokenId` (one rating per purchase)
   - Fields: `predictorWallet`, `score` (1-5), `reviewText`, `isRatedOnChain`

---

## 📊 Current Development State

### ✅ Completed

#### Smart Contracts:
- [x] **PredictorAccessPass contract** implemented ✅
  - [x] Soulbound (non-transferable) functionality
  - [x] Built-in 3-of-3 MultiSig governance system
  - [x] Blacklisting mechanism with events
  - [x] Dual minting (Logic contract + Owner mint)
  - [x] One NFT per wallet enforcement
  - [x] Metadata URI management
  - [x] Comprehensive view functions (11 total)
  - [x] Action cleanup for gas optimization
  - [x] Contract compilation verified
- [x] **SignalKeyNFT contract** implemented ✅
  - [x] Transferable ERC-721 functionality
  - [x] Content identifier storage (bytes32)
  - [x] Built-in 3-of-3 MultiSig governance system
  - [x] Updateable Logic contract address
  - [x] Token ownership tracking (`tokensOfOwner`)
  - [x] Exclusive minting via Logic contract
  - [x] Metadata URI management
  - [x] Comprehensive view functions (13 total)
  - [x] Action cleanup for gas optimization
  - [x] Contract compilation verified
- [x] **SignalFriendMarket contract** implemented ✅
  - [x] USDT payment processing
  - [x] Predictor registration with referral logic
  - [x] Signal purchase with fee splitting
  - [x] Built-in 3-of-3 MultiSig governance (11 action types)
  - [x] Emergency pause mechanism
  - [x] User-callable rating system
  - [x] Two-phase deployment support
  - [x] Comprehensive view functions (10+ total)
  - [x] Statistics tracking
  - [x] Action cleanup for gas optimization
  - [x] Contract compilation verified
- [x] **MockUSDT contract** implemented ✅
  - [x] 18 decimals (matching real BSC-USD on BNB Chain)
  - [x] Mimics mainnet BSC-USD: `0x55d398326f99059fF775485246999027B3197955`
  - [x] Owner-only minting: `mint()` and `batchMint()`
  - [x] Public faucet: `claimFaucet()` - 100 USDT per hour per address
  - [x] Max supply cap: 1 billion USDT
  - [x] Utility functions: `toSmallestUnit()`, `toUSDT()`
  - [x] Initial supply: 10,000 USDT to deployer
- [x] OpenZeppelin v5.5.0 integration
- [x] Remappings configured
- [x] **ALL 3 SMART CONTRACTS COMPLETE!** 🎉

#### Project Setup:
- [x] Foundry project structure in `/contracts`
- [x] OpenZeppelin contracts installed
- [x] Remappings configured
- [x] Environment variables template (`.env`)

### 🟡 In Progress

- [ ] **Write Comprehensive Tests** (Next immediate task)
  - Unit tests for MockUSDT contract
  - Unit tests for all 3 main contracts
  - Integration tests (full flow: join → buy → rate)
  - Edge case testing
  - Gas optimization analysis
  - Security testing

### ⏳ Pending (Prioritized)

#### Phase 1: Testing & Deployment
1. [ ] Write comprehensive tests for MockUSDT
2. [ ] Write comprehensive tests for all 3 main contracts
3. [ ] Integration testing (full user flows)
4. [ ] Deployment scripts for local Anvil
5. [ ] BNB Testnet deployment (with MockUSDT)
6. [ ] Gas optimization analysis
7. [ ] Security audit preparation

#### Phase 2: Backend Development
1. [ ] Express.js API setup
2. [ ] MongoDB schema implementation
3. [ ] Viem event indexing system
4. [ ] Signal unlock verification logic
5. [ ] Rating system implementation

#### Phase 3: Frontend Development
1. [ ] React UI with Tailwind CSS
2. [ ] Wagmi + RainbowKit wallet integration
3. [ ] Predictor dashboard
4. [ ] Trader marketplace
5. [ ] Signal purchase flow

---

## 🔑 Key Design Decisions & Rationale

### 1. Built-in MultiSig (Not Gnosis Safe)
**Decision:** Implement custom 3-of-3 MultiSig voting mechanism  
**Rationale:**
- Full control and transparency
- No external dependencies
- Custom logic tailored to project needs
- Educational value and complete ownership

### 2. Blacklisting in Smart Contract (Not Just Backend)
**Decision:** Implement blacklisting on-chain with event emissions  
**Rationale:**
- Blockchain as immutable source of truth
- Prevents direct contract interaction bypassing backend
- Trustless verification by third parties
- Express backend mirrors state for fast queries

### 3. Soulbound Predictor NFT
**Decision:** Non-transferable license  
**Rationale:**
- Prevents license trading/selling
- Ties reputation to original wallet
- Blocks malicious seller wallet changes
- Protects platform integrity

### 4. Separate NFT Contracts
**Decision:** Two separate ERC-721 contracts (not combined)  
**Rationale:**
- Clear separation of concerns
- Predictor license is soulbound, signal receipt is transferable
- Different metadata requirements
- Easier to audit and maintain

### 5. One-Hour Action Expiry
**Decision:** MultiSig actions expire after 1 hour  
**Rationale:**
- Ensures timely governance decisions
- Prevents state bloat from stale proposals
- Cleanup functions enable gas-efficient management
- Balance between urgency and coordination time

---

## 🎨 Category Structure

### Active Categories (All Live at Launch):

**Crypto** (Primary Market):
- Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, Other

**Traditional Finance**:
- US Stocks (Tech/General), Forex Majors, Commodities (Metals/Energy), Other

**Macro / Other**:
- Economic Data, Geopolitical Events, Sports Betting Models, Other

---

## 🛠️ Technical Stack Summary

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Solidity 0.8.24, OpenZeppelin v5.5.0, Foundry |
| **Blockchain** | BNB Chain (Testnet → Mainnet) |
| **Backend** | Express.js, MongoDB, Viem |
| **Frontend** | React, Tailwind CSS, Wagmi, RainbowKit |
| **Payment** | USDT (BEP-20) |
| **NFTs** | ERC-721 (BEP-721) |
| **RPC** | Alchemy (custom RPC endpoints) |

---

## 📝 Important Constructor Parameters

### PredictorAccessPass Deployment:
```solidity
constructor(
    address _signalFriendMarketAddress,  // Set after deploying SignalFriendMarket
    address[3] memory _multiSigSigners,  // Three signer wallet addresses
    string memory _initialBaseTokenURI  // IPFS/hosted metadata URI
)
```

**Deployment Order:**
1. Deploy PredictorAccessPass with placeholder for SignalFriendMarket
2. Deploy SignalKeyNFT with placeholder for SignalFriendMarket  
3. Deploy SignalFriendMarket with both NFT addresses
4. Update NFT contract references (if needed via MultiSig)

**Alternative:** Use CREATE2 for deterministic addresses

---

## 🔐 Security Considerations

### Current Implementation:
- ✅ Custom errors for gas optimization
- ✅ Input validation (zero address checks, duplicate signer checks)
- ✅ Access control modifiers
- ✅ Immutable critical addresses
- ✅ One-time minting enforcement
- ✅ Action expiry mechanism

### Pending Security Tasks:
- [ ] Comprehensive testing suite
- [ ] Gas optimization review
- [ ] Reentrancy analysis (for future contracts with payments)
- [ ] External security audit (before mainnet)
- [ ] Formal verification considerations

---

## 📍 Current Location in Project

**You are here:** ✅ ALL 3 CONTRACTS COMPLETE! → 🟡 Testing Phase  

**Next Immediate Steps:**
1. Write comprehensive Foundry tests
   - Test each contract individually
   - Test MultiSig workflows
   - Test edge cases
2. Integration testing
   - Full flow: deploy all 3 contracts
   - Test predictor registration with referral
   - Test signal purchase with fee splitting
   - Test rating system
3. Create deployment scripts
4. Deploy to local Anvil for manual testing
5. Deploy to BNB Testnet

**Achievement Unlocked:** 🎉
- ✅ 4/4 Smart Contracts Built (3 main + MockUSDT)
- ✅ ~2,400 lines of production-ready Solidity
- ✅ All contracts compiled successfully
- ✅ MultiSig governance across all contracts
- ✅ MockUSDT ready for testing and testnet deployment
- ✅ Ready for comprehensive testing phase

---

## 🎯 Project Timeline (Estimated)

| Phase | Timeline | Status |
|-------|----------|--------|
| **Phase 1: Smart Contracts** | Weeks 1-3 | ✅ Week 1 COMPLETE! |
| Contract 1: PredictorAccessPass | Week 1 | ✅ Complete (~600 lines) |
| Contract 2: SignalKeyNFT | Week 1 | ✅ Complete (~600 lines) |
| Contract 3: SignalFriendMarket | Week 1 | ✅ Complete (~1,000 lines) |
| Contract 4: MockUSDT | Week 1 | ✅ Complete (~200 lines) |
| Testing & Deployment | Week 2 | 🟡 In Progress |
| **Phase 2: Backend** | Weeks 4-6 | ⏳ Not Started |
| Express API & MongoDB | Week 4-5 | ⏳ Pending |
| Event Indexing | Week 5-6 | ⏳ Pending |
| **Phase 3: Frontend** | Weeks 7-10 | ⏳ Not Started |
| UI Components | Week 7-8 | ⏳ Pending |
| Web3 Integration | Week 9 | ⏳ Pending |
| Testing & Polish | Week 10 | ⏳ Pending |

---

## 📚 Key Files & Locations

### Smart Contracts:
- **Contract 1:** `/contracts/src/PredictorAccessPass.sol` ✅ (~600 lines)
- **Contract 2:** `/contracts/src/SignalKeyNFT.sol` ✅ (~600 lines)
- **Contract 3:** `/contracts/src/SignalFriendMarket.sol` ✅ (~1,000 lines)
- **Contract 4:** `/contracts/src/MockUSDT.sol` ✅ (~200 lines)
- **Tests:** `/contracts/test/` (to be created)
- **Deploy Scripts:** `/contracts/script/` (to be created)
- **Config:** `/contracts/foundry.toml` ✅
- **Remappings:** `/contracts/remappings.txt` ✅

### Documentation:
- **Project Overview:** `/PROJECT.md` (main requirements doc)
- **This File:** `/contracts/PROJECT_CONTEXT.md`
- **Changelog:** `/contracts/CHANGELOG.md`

### Examples (Reference):
- **Example Contract:** `/examples/src/token.sol`
- **Example Tests:** `/examples/test/*.t.sol`
- **Example Deploy:** `/examples/script/Deploy.s.sol`

---

## 💡 Notes for Future Sessions

### When You Return:
1. Check this `PROJECT_CONTEXT.md` for current state
2. Check `CHANGELOG.md` for recent changes
3. Look at **Current Development State** section above
4. Continue from **Next Immediate Steps**

### Testing Approach:
- Follow structure from `/examples/test/` folder
- Base test contract with common setup
- Separate test files for each major feature
- Use Foundry's cheatcodes for time manipulation (action expiry tests)
- Test both success and failure cases

### Gas Optimization Tips:
- Custom errors are already implemented ✅
- Consider `calldata` vs `memory` for function params
- Batch operations where possible (already done: `batchCleanActions`)
- Minimize storage reads/writes

---

**End of Project Context Document**  
*This document should be updated after each major milestone or significant change.*
