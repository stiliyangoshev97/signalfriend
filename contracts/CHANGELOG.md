# Changelog

All notable changes to the SignalFriend smart contracts project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### [0.4.0] - 2024-11-23

#### Added - MockUSDT Contract (Test & Testnet Token)

**Core Features:**
- ✅ **Binance-Peg BSC-USD Mock** - Accurate replica for testing
  - 18 decimals (matching real BSC-USD on BNB Chain)
  - Mimics mainnet address: `0x55d398326f99059fF775485246999027B3197955`
  - Standard ERC20 implementation (not 6-decimal Tether USDT)
- ✅ **Minting Functions:**
  - `mint(address, uint256)` - Owner-only minting for test setup
  - `batchMint(address[], uint256[])` - Batch minting for multiple accounts
  - MAX_SUPPLY cap (1 billion USDT) for safety
- ✅ **Public Faucet (Testnet):**
  - `claimFaucet()` - Users can claim 100 USDT per hour
  - 1-hour cooldown period per address
  - `canClaimFaucet(address)` - Check eligibility and cooldown
  - Perfect for BNB testnet deployment
- ✅ **Utility Functions:**
  - `toSmallestUnit(uint256)` - Convert USDT to wei (helper for tests)
  - `toUSDT(uint256)` - Convert wei to USDT (helper for tests)
  - Initial supply: 10,000 USDT minted to deployer

**Technical Details:**
- Inherits from OpenZeppelin ERC20 and Ownable
- Custom events: `Minted`, `FaucetClaimed`
- Custom errors: `ExceedsMaxSupply`, `FaucetCooldownActive`
- Fully compatible with SignalFriendMarket USDT interface

**Use Cases:**
1. **Local Testing (Anvil)** - Mint unlimited USDT for unit tests
2. **BNB Testnet** - Deploy and let users claim from faucet
3. **Integration Tests** - Batch mint to multiple test accounts

**Important Note:**
- This is NOT Tether USDT (which has 6 decimals on Ethereum)
- On BNB Chain, "USDT" refers to Binance-Peg BSC-USD with 18 decimals
- For mainnet deployment, use real BSC-USD: `0x55d398326f99059fF775485246999027B3197955`

---

### [0.3.0] - 2024-11-22

#### Added - SignalFriendMarket Contract (Third and Final Smart Contract)

**Core Features:**
- ✅ **Logic/Orchestrator Contract** - Brain of the SignalFriend platform
- ✅ **Predictor Registration:**
  - `joinAsPredictor(address _referrer)` - Pay $20 USDT join fee
  - Automatic referral payout ($5 USDT to valid referrer)
  - Mints PredictorAccessPass NFT via orchestration
  - Validates referrer has active Predictor NFT
- ✅ **Signal Purchase Flow:**
  - `buySignalNFT(address, uint256, bytes32)` - Purchase signal with USDT
  - Minimum signal price: **5 USDT** (configurable via MultiSig)
  - Buyer access fee: **$0.5 USDT** (anti-Sybil measure)
  - Automatic fee splitting: 5% platform, 95% predictor
  - Mints SignalKeyNFT receipt with content identifier
- ✅ **USDT Payment Processing:**
  - Interfaces with USDT (BEP-20) token
  - Secure transferFrom and transfer patterns
  - Allowance validation before transfers
- ✅ **Rating System:**
  - `markSignalRated(uint256)` - User-callable rating marker
  - Verifies token ownership on-chain
  - Prevents double-rating per purchase
  - Events for Express backend indexing
- ✅ **Built-in 3-of-3 MultiSig Governance:**
  - All parameters updateable via MultiSig
  - 11 different action types
  - Same approval pattern as other contracts
  - 1-hour action expiry
- ✅ **Emergency Pause Mechanism:**
  - MultiSig-governed pause/unpause
  - Protects business functions when paused
  - Admin functions remain accessible
- ✅ **Comprehensive View Functions:**
  - `getPlatformParameters()` - All fees and rates
  - `isValidPredictor(address)` - Check predictor status
  - `calculateBuyerCost(uint256)` - Preview total cost
  - `calculatePredictorPayout(uint256)` - Preview earnings
  - `calculatePlatformEarnings(uint256)` - Preview commission
  - `isFullyInitialized()` - Check contract readiness
  - `isTokenRated(uint256)` - Check rating status
  - 10+ total view functions
- ✅ **Statistics Tracking:**
  - `totalPredictorsJoined` - Total predictor registrations
  - `totalSignalsPurchased` - Total signal sales
  - `totalReferralsPaid` - Total referral payouts
- ✅ **Two-Phase Deployment Support:**
  - Constructor accepts `address(0)` for NFT contracts
  - `contractsInitialized()` modifier prevents premature use
  - MultiSig setters for NFT contract addresses

**Technical Implementation:**
- Solidity version: 0.8.24
- OpenZeppelin v5.5.0 (IERC20, IERC721)
- Custom interfaces for NFT contracts
- Optimized gas usage (removed redundant transfers)
- Custom error messages throughout
- Comprehensive event emissions

**Security Features:**
- Updateable contract addresses (USDT, both NFTs, treasury)
- 3-of-3 MultiSig requirement for all admin actions
- Pause mechanism for emergency response
- Allowance validation before transfers
- Ownership verification for rating
- Blacklist integration via PredictorAccessPass

**MultiSig-Governed Parameters:**
- `usdtToken` address
- `predictorAccessPass` address
- `signalKeyNFT` address
- `platformTreasury` address
- `commissionRate` (default: 500 = 5%)
- `minSignalPrice` (default: 5 USDT)
- `predictorJoinFee` (default: 20 USDT)
- `referralPayout` (default: 5 USDT)
- `buyerAccessFee` (default: 0.5 USDT)
- `paused` status

**Events Emitted:**
- `PredictorJoined(address indexed predictor, address indexed referrer, uint256 nftTokenId, bool referralPaid)`
- `SignalPurchased(address indexed buyer, address indexed predictor, uint256 indexed receiptTokenId, bytes32 contentIdentifier, uint256 signalPrice, uint256 totalCost)`
- `SignalRated(uint256 indexed tokenId, address indexed rater)`
- `USDTAddressUpdated(address oldAddress, address newAddress)`
- `PredictorAccessPassUpdated(address oldAddress, address newAddress)`
- `SignalKeyNFTUpdated(address oldAddress, address newAddress)`
- `TreasuryUpdated(address oldAddress, address newAddress)`
- `CommissionRateUpdated(uint256 oldRate, uint256 newRate)`
- `MinSignalPriceUpdated(uint256 oldPrice, uint256 newPrice)`
- `PredictorJoinFeeUpdated(uint256 oldFee, uint256 newFee)`
- `ReferralPayoutUpdated(uint256 oldPayout, uint256 newPayout)`
- `BuyerAccessFeeUpdated(uint256 oldFee, uint256 newFee)`
- `ContractPaused(address indexed pauser)`
- `ContractUnpaused(address indexed unpauser)`
- MultiSig events (Proposed, Approved, Executed, Cleaned)

**Constructor Parameters:**
```solidity
constructor(
    address _usdt,                      // USDT token (can be address(0) initially)
    address[3] memory _multiSigSigners, // Three MultiSig signer addresses
    address _platformTreasury,          // Platform treasury address
    address _predictorAccessPass,       // PredictorAccessPass (can be address(0) initially)
    address _signalKeyNFT               // SignalKeyNFT (can be address(0) initially)
)
```

**Deployment Flow (Two-Phase):**
```bash
# Step 1: Deploy SignalFriendMarket (with address(0) for NFTs)
# Step 2: Deploy PredictorAccessPass (with Market address)
# Step 3: Deploy SignalKeyNFT (with Market address)
# Step 4: Update Market via MultiSig (set both NFT addresses)
# Step 5: Verify initialization (isFullyInitialized = true)
```

### [0.2.0] - 2024-11-22

#### Added - SignalKeyNFT Contract (Second Smart Contract)

**Core Features:**
- ✅ **Transferable ERC-721 NFT** - Receipt/key for traders to unlock signals
- ✅ **Content Identifier Storage:**
  - Stores non-unique `contentIdentifier` (bytes32) per tokenId
  - Links unique NFT receipt to reusable signal content
- ✅ **Exclusive Minting:**
  - `mintForLogicContract(address, bytes32)` - Only callable by SignalFriendMarket
  - Mints receipt after payment verification in Logic contract
- ✅ **Built-in 3-of-3 MultiSig Governance System:**
  - Action proposal and approval mechanism
  - Auto-execution when 3 approvals are reached
  - 1-hour expiry time for pending actions
  - Action cleanup functions to save gas
- ✅ **Updateable Logic Contract:**
  - `proposeUpdateLogicContract(address)` - Update orchestrator address via MultiSig
  - Allows contract upgrades without redeployment
- ✅ **Metadata Management:**
  - Fixed URI for all tokens (all NFTs share same metadata)
  - MultiSig-governed URI updates via `proposeUpdateMetadataURI(string)`
- ✅ **Token Ownership Tracking:**
  - Custom `_update` override maintains owner → tokenIds mapping
  - `tokensOfOwner(address)` for "My Signals" page
  - Reliable on-chain enumeration (doesn't rely on events)
- ✅ **Comprehensive View Functions:**
  - `getContentIdentifier(uint256)` - **Critical for Express backend**
  - `tokensOfOwner(address)` - Get all receipts owned by user
  - `totalMinted()` - Total NFTs minted
  - `exists(uint256)` - Check if token exists
  - `getActionApprovals(bytes32)` - Get approval count
  - `isActionExecuted(bytes32)` - Check if action executed
  - `isActionExpired(bytes32)` - Check if action expired
  - `hasSignerApproved(bytes32, address)` - Check signer approval
  - `getBaseTokenURI()` - Get metadata URI
  - `getAllActionIds()` - Get all pending actions
  - `getActionDetails(bytes32)` - Get full action details

**Technical Implementation:**
- Solidity version: 0.8.24
- OpenZeppelin v5.5.0 contracts (ERC721)
- Custom error messages for gas optimization
- Comprehensive event emissions for off-chain indexing
- Token counter starts from 1
- Uses OpenZeppelin v5.x `_update` hook for ownership tracking

**Security Features:**
- Updateable SignalFriendMarket address (via MultiSig)
- 3-of-3 MultiSig requirement for all admin actions
- Signer validation (no zero addresses, no duplicates)
- Action expiry to prevent stale proposals
- Custom errors for gas-efficient reverts

**Events Emitted:**
- `SignalReceiptMinted(address indexed buyer, uint256 indexed tokenId, bytes32 indexed contentIdentifier)`
- `LogicContractUpdated(address oldLogic, address newLogic)`
- `MetadataURIUpdated(string oldURI, string newURI)`
- `ActionProposed(bytes32 indexed actionId, ActionType actionType, address indexed proposer, uint256 expiryTime)`
- `ActionApproved(bytes32 indexed actionId, address indexed approver, uint8 approvalCount)`
- `ActionExecuted(bytes32 indexed actionId, ActionType actionType)`
- `ActionCleaned(bytes32 indexed actionId, ActionType actionType)`

**Constructor Parameters:**
```solidity
constructor(
    address _signalFriendMarketAddress,  // The orchestrator/logic contract
    address[3] memory _multiSigSigners,   // Three MultiSig signer addresses
    string memory _initialBaseTokenURI   // Fixed metadata URI for all tokens
)
```

**Key Differences from PredictorAccessPass:**
- ✅ Transferable (not soulbound)
- ✅ No one-per-wallet limit (users can own multiple)
- ✅ No blacklisting (handled in Logic contract)
- ✅ No owner minting (only paid purchases via Logic)
- ✅ Stores contentIdentifier (unique feature)
- ✅ Updateable Logic contract address
- ✅ Token ownership enumeration (`tokensOfOwner`)

### [0.1.0] - 2024-11-22

#### Added - PredictorAccessPass Contract (First Smart Contract)

**Core Features:**
- ✅ **Soulbound ERC-721 NFT** - Non-transferable license for signal sellers
- ✅ **Dual Minting System:**
  - `mintForLogicContract(address)` - Callable only by SignalFriendMarket orchestrator contract
  - `proposeOwnerMint(address)` - MultiSig-governed free minting for premium clients
- ✅ **Built-in 3-of-3 MultiSig Governance System:**
  - Action proposal and approval mechanism
  - Auto-execution when 3 approvals are reached
  - 1-hour expiry time for pending actions
  - Action cleanup functions to save gas
- ✅ **Blacklisting System:**
  - MultiSig-governed blacklist management via `proposeBlacklist(address, bool)`
  - Prevents blacklisted addresses from receiving new NFTs
  - Emits events for backend Express/MongoDB indexing
- ✅ **Metadata Management:**
  - Fixed URI for all tokens (all NFTs share same metadata)
  - MultiSig-governed URI updates via `proposeUpdateMetadataURI(string)`
- ✅ **One NFT Per Wallet Enforcement:**
  - Prevents duplicate minting to same address
  - Maintains mapping of predictor address to token ID
- ✅ **Comprehensive View Functions:**
  - `totalMinted()` - Total NFTs minted
  - `isPredictorActive(address)` - Check if predictor has NFT and is not blacklisted
  - `getPredictorTokenId(address)` - Get token ID for predictor address
  - `isBlacklisted(address)` - Check blacklist status
  - `getActionApprovals(bytes32)` - Get approval count for action
  - `isActionExecuted(bytes32)` - Check if action executed
  - `isActionExpired(bytes32)` - Check if action expired
  - `hasSignerApproved(bytes32, address)` - Check if signer approved action
  - `getBaseTokenURI()` - Get current metadata URI
  - `getAllActionIds()` - Get all pending action IDs
  - `getActionDetails(bytes32)` - Get full action details

**Technical Implementation:**
- Solidity version: 0.8.24
- OpenZeppelin v5.5.0 contracts (ERC721)
- Custom error messages for gas optimization
- Comprehensive event emissions for off-chain indexing
- Token counter starts from 1
- Uses OpenZeppelin v5.x `_update` hook (not deprecated `_beforeTokenTransfer`)

**Security Features:**
- Immutable SignalFriendMarket address (set in constructor)
- 3-of-3 MultiSig requirement for all admin actions
- Signer validation (no zero addresses, no duplicates)
- Action expiry to prevent stale proposals
- Custom errors for gas-efficient reverts
- One-time minting enforcement per address

**Events Emitted:**
- `PredictorNFTMinted(address indexed predictor, uint256 indexed tokenId, bool isOwnerMint)`
- `PredictorBlacklisted(address indexed predictor, bool status)`
- `MetadataURIUpdated(string oldURI, string newURI)`
- `ActionProposed(bytes32 indexed actionId, ActionType actionType, address indexed proposer, uint256 expiryTime)`
- `ActionApproved(bytes32 indexed actionId, address indexed approver, uint8 approvalCount)`
- `ActionExecuted(bytes32 indexed actionId, ActionType actionType)`
- `ActionCleaned(bytes32 indexed actionId, ActionType actionType)`

**Constructor Parameters:**
```solidity
constructor(
    address _signalFriendMarketAddress,  // The orchestrator/logic contract
    address[3] memory _multiSigSigners,   // Three MultiSig signer addresses
    string memory _initialBaseTokenURI   // Fixed metadata URI for all tokens
)
```

#### Project Setup
- ✅ Installed OpenZeppelin Contracts v5.5.0 via Foundry
- ✅ Created `remappings.txt` for OpenZeppelin imports
- ✅ Set up Foundry project structure in `/contracts` folder
- ✅ Verified compilation with `forge build`

---

## Future Development Pipeline

### Next Contracts to Build:
1. **SignalKeyNFT** (Trader Receipt NFT)
   - Transferable ERC-721
   - Stores non-unique ContentIdentifier
   - Minting only via SignalFriendMarket contract
   - Auto-incremented unique token IDs

2. **SignalFriendMarket** (Logic/Orchestrator Contract)
   - Payment processing (USDT BEP-20)
   - Fee splitting (5% platform, 95% predictor)
   - Minimum signal price enforcement ($10 USDT)
   - Flat trader access fee ($0.5 USDT)
   - Predictor registration ($20 USDT)
   - Referral system ($5 USDT payout)
   - Minting orchestration for both NFT contracts
   - MultiSig-governed parameter updates

### Testing & Deployment Pipeline:
- [ ] Comprehensive Foundry tests for PredictorAccessPass
- [ ] Deployment script for local Anvil testing
- [ ] BNB Testnet deployment
- [ ] Contract verification on BscScan
- [ ] Integration tests with all three contracts
- [ ] Gas optimization analysis
- [ ] Security audit preparation

---

## Notes

### Design Decisions:
1. **Built-in MultiSig vs External (Gnosis Safe):**
   - Chose built-in for full control and transparency
   - Reduces external dependencies
   - Custom implementation tailored to project needs

2. **Blacklisting in Smart Contract:**
   - Blockchain as source of truth (immutable, verifiable)
   - Prevents direct contract interaction bypassing backend
   - Events enable Express backend to mirror state in MongoDB

3. **Action Expiry Time:**
   - Set to 1 hour to ensure timely governance decisions
   - Prevents stale proposals from cluttering state
   - Cleanup functions allow gas-efficient state management

4. **Soulbound Implementation:**
   - Uses OpenZeppelin v5.x `_update` hook
   - Allows minting, blocks all transfers (including burns)
   - Ensures license integrity and prevents trading

### Integration Points with Backend:
- Express.js will index events using Viem
- MongoDB will store:
  - Predictor profiles (synced with NFT ownership)
  - Blacklist status (synced with contract events)
  - Action proposals and approvals (for admin dashboard)
  - Minting history
