# SignalFriend Backend - Project Context

> **Last Updated:** December 23, 2025  
> **Current Phase:** Production - BSC Mainnet Live  
> **Project Status:** 🟢 **Backend v0.31.0** - BSC Mainnet Deployed, 290 Tests Passing, CI/CD Active  
> **Branch:** `fix/predictor-profile-signal-count`

---

## 🏗️ Architecture Overview

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 20+ | Server runtime |
| Framework | Express.js | HTTP server & routing |
| Database | MongoDB + Mongoose | Data persistence |
| Blockchain | Viem | BNB Chain interaction |
| Auth | SIWE + JWT | Wallet-based authentication |
| Validation | Zod | Schema validation |
| Logging | Pino | Structured logging |
| Testing | Vitest | Unit & integration tests |
| Rate Limiting | express-rate-limit | Tiered API protection |

### Key Technical Details
- **USDT Decimals:** 18 (BNB Chain, not 6 like Ethereum)
- **ContentId Format:** UUID in MongoDB ↔ bytes32 on-chain
- **Webhook Type:** Alchemy Custom (GraphQL) webhooks
- **Webhook Security:** Timestamp validation (5 min max age) + idempotency protection

### Project Structure
```
backend/
├── src/
│   ├── index.ts                 # App entry point
│   ├── contracts/               # Blockchain integration
│   │   ├── addresses.ts         # Contract addresses by chainId
│   │   ├── clients.ts           # Viem public client
│   │   └── abis/                # Contract ABIs (extracted from Foundry)
│   │       ├── SignalFriendMarket.ts
│   │       ├── PredictorAccessPass.ts
│   │       ├── SignalKeyNFT.ts
│   │       └── MockUSDT.ts
│   ├── features/                # Feature-based modules
│   │   ├── auth/                # SIWE + JWT authentication ✅
│   │   ├── webhooks/            # Alchemy event indexing ✅ (GraphQL + Address Activity)
│   │   ├── categories/          # Signal categories ✅
│   │   ├── predictors/          # Predictor profiles ✅
│   │   ├── signals/             # Trading signals ✅
│   │   ├── receipts/            # Purchase receipts ✅
│   │   ├── reviews/             # Ratings (1-5 score, off-chain) ✅
│   │   ├── reports/             # Scam/false signal reports ✅
│   │   ├── disputes/            # Blacklist dispute appeals ✅
│   │   └── admin/               # Admin endpoints (MultiSig only) ✅
│   ├── scripts/
│   │   ├── seedCategories.ts    # Database seeding
│   │   ├── seedTestSignal.ts    # Single test signal
│   │   ├── seedTestSignals.ts   # Bulk test signals (100/500)
│   │   ├── modifyPredictorStats.ts  # Test verification flow
│   │   └── generateEventSignatures.ts  # Event hash generator
│   └── shared/
│       ├── config/              # env, database, logger
│       ├── middleware/          # auth, validation, errors, security, admin, rateLimiter
│       ├── services/            # blockchain.service.ts (viem)
│       ├── types/               # TypeScript types
│       └── utils/               # ApiError, asyncHandler, contentId
├── tests/
│   ├── setup.ts                 # Test configuration
│   ├── unit/                    # Unit tests (277 tests)
│   │   ├── utils/               # contentId, textValidation, ApiError
│   │   └── features/            # auth, predictors, signals, reviews
│   └── integration/             # Integration tests (13 tests)
│       ├── helpers/             # testApp.ts
│       ├── health.test.ts
│       └── errorHandling.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.js
```

---

## 🔗 Smart Contract Integration

### Contract Addresses (BSC Mainnet - Chain ID 56) 🚀 LIVE
| Contract | Address | Purpose |
|----------|---------|---------|
| SignalFriendMarket | `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` | Main orchestrator |
| PredictorAccessPass | `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` | Predictor NFT (soulbound) |
| SignalKeyNFT | `0x2a5f920133e584773ef4ac16260c2f954824491f` | Purchase receipt NFT |
| USDT | `0x55d398326f99059fF775485246999027B3197955` | BSC native USDT |
| Treasury | `0x76e3363f7aF2e46DFdb4824FA143264E58884e1b` | Platform treasury |

### MultiSig Signers (3 of 3 required for admin operations)
| # | Address |
|---|---------|
| 1 | `0x38f4B0DcA1d681c18D41543f6D78bd4B08578B11` |
| 2 | `0xa2AD948278cA7018f8c05e1A995575AeF3B02EAB` |
| 3 | `0x62E3Ba865c11f911A83E01771105E4edbc4Bf148` |

### Contract Addresses (BNB Testnet - Chain ID 97) - Legacy
| Contract | Address | Purpose |
|----------|---------|---------|
| SignalFriendMarket | `0x5133397a4B9463c5270beBa05b22301e6dD184ca` | Main orchestrator |
| PredictorAccessPass | `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` | Predictor NFT (soulbound) |
| SignalKeyNFT | `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed` | Purchase receipt NFT |
| MockUSDT | `0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5` | Test USDT token |

### Event Signatures (Topic0 Hashes)
| Event | Signature Hash |
|-------|----------------|
| `PredictorJoined` | `0x2f2789d1da7b490fc20c28c5014f1fdd449737869b924042025cd634b2248cc4` |
| `SignalPurchased` | `0x906c548d19aa6c7ed9e105a3d02cb6a435b802903a30000aa9ad5e01d93ef647` |
| `PredictorBlacklisted` | `0xad6b8655f145f95522485d58e7cd8ca2689dbe89691511217c7cc914b1226005` |
| `PredictorNFTMinted` | `0x7cfc4d30050d18b034fe455eba1875eafe455de2dab7696a1fc7f8918d409f12` |

### Events to Index (via Alchemy Webhooks)
| Event | Contract | Action |
|-------|----------|--------|
| `PredictorJoined` | SignalFriendMarket | Create Predictor record (regular $20 registration) |
| `PredictorNFTMinted` | PredictorAccessPass | Create Predictor record (owner mint via MultiSig only) |
| `SignalPurchased` | SignalFriendMarket | Create Receipt record |
| `PredictorBlacklisted` | PredictorAccessPass | Update Predictor.isBlacklisted |

### Blockchain Service (viem)
The `BlockchainService` provides on-chain verification utilities:
```typescript
// Verify SignalKeyNFT ownership
BlockchainService.verifySignalKeyOwnership(tokenId, address): Promise<boolean>

// Check if address is a predictor
BlockchainService.verifyPredictorStatus(address): Promise<boolean>

// Check blacklist status on-chain
BlockchainService.isPredictorBlacklisted(address): Promise<boolean>

// Get SignalKeyNFT owner
BlockchainService.getSignalKeyOwner(tokenId): Promise<string | null>

// Get content ID from SignalKeyNFT
BlockchainService.getSignalKeyContentId(tokenId): Promise<string | null>
```

---

## 💾 MongoDB Data Models

### Predictor Model
```typescript
{
  walletAddress: string,      // Unique, indexed
  tokenId: number,            // PredictorAccessPass NFT ID
  displayName: string,        // Unique, can only be changed ONCE
  displayNameChanged: boolean,// True after first change (locked)
  bio: string,
  avatarUrl: string,          // Only verified predictors can set
  socialLinks: { twitter?, telegram?, discord? },
  preferredContact: 'telegram' | 'discord',  // For admin communication
  categoryIds: ObjectId[],    // References to Category
  totalSignals: number,
  totalSales: number,
  averageRating: number,      // Calculated from reviews
  totalReviews: number,
  isBlacklisted: boolean,     // Synced from blockchain
  isVerified: boolean,        // Has verified badge (admin approved)
  verificationStatus: 'none' | 'pending' | 'rejected',
  salesAtLastApplication: number,     // For re-apply logic after rejection
  earningsAtLastApplication: number,  // Added in v0.26.0 - tracks earnings at rejection
  verificationAppliedAt?: Date,
  joinedAt: Date,             // From blockchain event
}
```

### Signal Model
```typescript
{
  contentId: string,          // Unique identifier (UUID)
  predictorId: ObjectId,
  predictorAddress: string,
  title: string,
  description: string,
  content: string,            // Protected signal content
  categoryId: ObjectId,
  mainGroup: string,          // Denormalized from Category for efficient filtering
  priceUsdt: number,
  expiresAt: Date,            // When signal can no longer be purchased
  totalSales: number,
  averageRating: number,
  totalReviews: number,
  isActive: boolean,
  riskLevel: enum,            // low, medium, high
  potentialReward: enum,      // normal, medium, high
}
```

### Receipt Model
```typescript
{
  tokenId: number,            // SignalKeyNFT token ID (unique)
  contentId: string,          // Links to Signal
  buyerAddress: string,
  predictorAddress: string,
  signalId: ObjectId,
  priceUsdt: number,
  purchasedAt: Date,
  transactionHash: string,
}
```

### Review Model (Rating-Only)
```typescript
{
  tokenId: number,            // Unique - one review per purchase
  signalId: ObjectId,
  contentId: string,
  buyerAddress: string,
  predictorAddress: string,
  score: number,              // 1-5 (off-chain only, no markSignalRated on-chain)
}
```

### Report Model
```typescript
{
  tokenId: number,            // Unique - one report per purchase
  signalId: ObjectId,
  contentId: string,
  buyerAddress: string,
  predictorAddress: string,
  reason: enum,               // false_signal, misleading_info, scam, duplicate_content, other
  description: string,        // Optional (required if reason is "other")
  status: enum,               // pending, reviewed, resolved, dismissed
  adminNotes: string,         // Internal admin notes
}
```

### Dispute Model (NEW)
```typescript
{
  predictorAddress: string,   // Unique - one dispute per predictor
  status: enum,               // pending, contacted, resolved, rejected
  adminNotes: string,         // Internal tracking (e.g., "Contacted on TG 12/6")
  createdAt: Date,
  resolvedAt?: Date,
}
```

### Category Model
```typescript
{
  name: string,               // Subcategory name (unique within mainGroup)
  slug: string,               // URL-friendly identifier (unique globally)
  mainGroup: string,          // Main category: "Crypto", "Traditional Finance", "Macro / Other"
  description: string,
  icon: string,
  isActive: boolean,
  sortOrder: number,
}

// Main Groups (verticals)
MAIN_GROUPS = {
  CRYPTO: "Crypto",
  TRADITIONAL_FINANCE: "Traditional Finance", 
  MACRO_OTHER: "Macro / Other",
}

// 19 subcategories across 3 main groups:
// Crypto (9): Bitcoin, Ethereum, Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, Other
// Traditional Finance (6): US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, Other
// Macro / Other (4): Economic Data, Geopolitical Events, Sports, Other
```

---

## 🔐 Authentication Flow (SIWE + JWT)

```
┌─────────────┐     1. GET /auth/nonce?address=0x...     ┌─────────────┐
│   Frontend  │ ──────────────────────────────────────► │   Backend   │
│             │ ◄────────────────────────────────────── │             │
│             │     2. { nonce: "abc123..." }           │             │
│             │                                         │             │
│             │     3. User signs SIWE message          │             │
│             │        with wallet                      │             │
│             │                                         │             │
│             │     4. POST /auth/verify                │             │
│             │        { message, signature }           │             │
│             │ ──────────────────────────────────────► │             │
│             │ ◄────────────────────────────────────── │             │
│             │     5. { token: "jwt...", address }     │             │
│             │                                         │             │
│             │     6. All requests include             │             │
│             │        Authorization: Bearer <jwt>      │             │
└─────────────┘                                         └─────────────┘
```

---

## 📡 API Endpoints

### Implemented ✅
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/auth/nonce` | No | Get SIWE nonce |
| POST | `/api/auth/verify` | No | Verify signature, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/webhooks/alchemy` | Signature | Blockchain event webhook |
| GET | `/api/categories` | No | List all categories |
| GET | `/api/categories/:slug` | No | Get category by slug |
| POST | `/api/categories` | Yes | Create category (admin) |
| PUT | `/api/categories/:slug` | Yes | Update category (admin) |
| DELETE | `/api/categories/:slug` | Yes | Delete category (admin) |
| GET | `/api/predictors` | No | List predictors (filter, sort, paginate) |
| GET | `/api/predictors/top` | No | Get leaderboard |
| GET | `/api/predictors/:address` | No | Get predictor profile |
| GET | `/api/predictors/:address/check` | No | Check if active predictor |
| PUT | `/api/predictors/:address` | Yes | Update own profile |
| GET | `/api/signals` | No | List signals (filter, paginate) |
| GET | `/api/signals/predictor/:address` | No | Get predictor's signals |

### Signal Status Filter
The `/api/signals` endpoint supports a `status` query parameter:
| Value | Filter | Description |
|-------|--------|-------------|
| `active` (default) | `isActive: true` AND `expiresAt > now` | Only purchasable signals |
| `inactive` | `isActive: false` OR `expiresAt <= now` | Deactivated or expired signals |
| `all` | No filter | All signals regardless of status |

```bash
# Examples
GET /api/signals?status=active          # Default behavior
GET /api/signals?status=inactive        # Expired/deactivated only
GET /api/signals?predictorAddress=0x...&status=inactive  # Predictor's inactive signals
```

### Signal Endpoints (continued)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/signals/:contentId` | No | Get signal metadata |
| GET | `/api/signals/:contentId/content` | Yes | Get protected content |
| GET | `/api/signals/:contentId/content-identifier` | Yes | Get bytes32 for purchase (blocks self-purchase) |
| POST | `/api/signals` | Yes | Create signal (predictor) |
| PUT | `/api/signals/:contentId` | Yes | Update own signal |
| DELETE | `/api/signals/:contentId` | Yes | Deactivate own signal |
| GET | `/api/receipts/mine` | Yes | Get user's purchases |
| GET | `/api/receipts/stats` | Yes | Get predictor stats |
| GET | `/api/receipts/check/:contentId` | Yes | Check if purchased |
| GET | `/api/receipts/signal/:contentId` | Yes | Get signal sales |
| GET | `/api/receipts/:tokenId` | Yes | Get receipt by ID |
| GET | `/api/reviews/mine` | Yes | Get user's ratings |
| GET | `/api/reviews/signal/:contentId` | No | Get signal ratings |
| GET | `/api/reviews/predictor/:address` | No | Get predictor ratings |
| GET | `/api/reviews/check/:tokenId` | No | Check if rating exists |
| GET | `/api/reviews/:tokenId` | No | Get rating by ID |
| POST | `/api/reviews` | Yes | Create rating (1-5 score, PERMANENT) |
| POST | `/api/reports` | Yes | Create report (scam/false signal) |
| GET | `/api/reports/mine` | Yes | Get user's reports |
| GET | `/api/reports/signal/:contentId` | No | Get signal reports |
| GET | `/api/reports/predictor/:address` | No | Get predictor reports |
| GET | `/api/reports/predictor/:address/stats` | No | Get report statistics |
| GET | `/api/reports/check/:tokenId` | No | Check if report exists |
| GET | `/api/admin/predictors/:address` | Admin | Get full predictor info (includes contacts) |
| GET | `/api/admin/predictors/blacklisted` | Admin | Get all blacklisted predictors |
| POST | `/api/admin/predictors/:address/blacklist` | Admin | Blacklist predictor in DB |
| POST | `/api/admin/predictors/:address/unblacklist` | Admin | Remove blacklist in DB |
| GET | `/api/admin/reports` | Admin | Get all reports (paginated) |
| PUT | `/api/admin/reports/:tokenId` | Admin | Update report status/notes |
| GET | `/api/admin/disputes` | Admin | Get all disputes (paginated) |
| PUT | `/api/admin/disputes/:predictorAddress` | Admin | Update dispute status/notes |
| DELETE | `/api/admin/signals/:contentId` | Admin | Deactivate signal (soft delete) |

> **Admin Endpoints:** Require authentication from one of 3 MultiSig wallet addresses configured in `ADMIN_ADDRESSES`.

---

## 🔄 Alchemy Webhook Integration

### Setup Steps
1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/) → Webhooks
2. Create Webhook → Custom Webhook → Specific events
3. Add `SignalFriendMarket` address: `0x5133397a4B9463c5270beBa05b22301e6dD184ca`
4. Select events: `PredictorJoined`, `SignalPurchased`
5. Add `PredictorAccessPass` address for `PredictorBlacklisted` event
6. Set webhook URL: `https://your-backend.com/api/webhooks/alchemy`
7. Copy signing key to `ALCHEMY_SIGNING_KEY` env var

### Event Flow
```
Blockchain Event → Alchemy → POST /api/webhooks/alchemy → Decode Event → Update MongoDB
```

---

## ⚙️ Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/signalfriend

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Blockchain
CHAIN_ID=97
RPC_URL=https://bsc-testnet-rpc.publicnode.com

# Contract Addresses
SIGNALFRIEND_MARKET_ADDRESS=0x5133397a4B9463c5270beBa05b22301e6dD184ca
PREDICTOR_ACCESS_PASS_ADDRESS=0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4
SIGNAL_KEY_NFT_ADDRESS=0xfb26Df6101e1a52f9477f52F54b91b99fb016aed
MOCK_USDT_ADDRESS=0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5

# Alchemy
ALCHEMY_SIGNING_KEY=your-alchemy-webhook-signing-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🛡️ Tiered Rate Limiting

The API uses a production-ready tiered rate limiting system to balance security with user experience.

### Rate Limit Tiers
| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| Auth Nonce | 60 req | 15 min | Nonce generation (supports wallet switching) |
| Auth Verify | 20 req | 15 min | Signature verification (prevents brute force) |
| Auth Logout | 30 req | 15 min | Logout operations |
| Read | 200 req | 1 min | GET operations (browsing, listing) |
| Write | 60 req | 15 min | POST/PUT/DELETE (data modification) |
| Critical | 500 req | 15 min | Purchase operations (never block revenue) |
| General | Configurable | Configurable | Fallback safety net |

### Route Assignments
```
Authentication:
├── GET /auth/nonce      → authNonceRateLimiter  (60/15min)
├── POST /auth/verify    → authVerifyRateLimiter (20/15min)

Read Operations (200/min):
├── GET /signals/*       → readRateLimiter
├── GET /predictors/*    → readRateLimiter
├── GET /categories/*    → readRateLimiter
├── GET /stats/*         → readRateLimiter
├── GET /reviews/*       → readRateLimiter
├── GET /reports/*       → readRateLimiter

Write Operations (60/15min):
├── POST /signals        → writeRateLimiter
├── PUT /signals/:id     → writeRateLimiter
├── POST /reviews        → writeRateLimiter
├── POST /reports        → writeRateLimiter
├── PUT /predictors/:id  → writeRateLimiter

Critical (500/15min - never block):
├── /api/receipts/*      → criticalRateLimiter

Excluded:
├── /api/webhooks/*      → No rate limiting (protected by signature)
```

### Design Principles
1. **Authenticated users get higher limits** - Abuse is traceable by wallet address
2. **Reads >> Writes** - Reads are cheap, writes need protection
3. **Never block purchases** - Lost revenue + terrible UX
4. **IP + User hybrid tracking** - IP for unauthenticated, userId for authenticated

---

## 🐛 Recent Bug Fixes (v0.27.0)

### Bug #1: Verification Sales Count Mismatch
**Problem:** Frontend showed 100 sales but backend rejected verification saying "only 2 sales"
- **Root Cause:** Backend checked `predictor.totalSales` (stale field) vs frontend displayed `earnings.totalSalesCount` (receipt count from aggregation)
- **Solution:** Changed verification logic to use `earnings.totalSalesCount` as source of truth
- **Files Modified:**
  - `predictor.service.ts`: `applyForVerification()` now uses receipt count
  - `predictor.service.ts`: `adminRejectVerification()` records receipt count in `salesAtLastApplication`
  - `modifyPredictorStats.ts`: Fixed to create receipts based on sales count target, not revenue calculation

### Bug #2: Profile Telegram/Discord Not Saving
**Problem:** After updating profile, telegram and discord fields were cleared on page refresh
- **Root Cause:** `GET /api/predictors/:address` uses `HIDDEN_FIELDS` to exclude private contact info for public viewing. Dashboard's `useEffect` refetched predictor data after update, calling this endpoint which returned incomplete data and overwrote the auth store.
- **Solution:** Added `optionalAuth` middleware to the route - when authenticated user views their own profile, backend returns full data including private fields
- **Files Modified:**
  - `predictor.service.ts`: `getByAddress()` accepts optional `callerAddress`, returns full data for own profile
  - `predictor.controller.ts`: Pass `req.user?.address` from optional auth middleware
  - `predictor.routes.ts`: Added `optionalAuth` middleware to `GET /:address` route

**Key Learning:** Receipt count from `Receipt.aggregate()` is the authoritative source for sales metrics, not the `predictor.totalSales` denormalized field.

---

## 🚀 Quick Start

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start MongoDB (if local)
mongod

# Development server (with hot reload)
npm run dev

# Seed categories
npm run seed:categories

# Run tests
npm test
```

---

## 📊 Development Progress

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Project Setup | ✅ Complete | Folder structure, package.json, configs |
| 2. Shared Infrastructure | ✅ Complete | Config, middleware, utils |
| 3. Contract Integration | ✅ Complete | ABIs, addresses, Viem client |
| 4. MongoDB Models | ✅ Complete | All 6 models defined (including Dispute) |
| 5. Auth Feature | ✅ Complete | SIWE + JWT flow |
| 6. Webhook Feature | ✅ Complete | GraphQL + Address Activity webhooks |
| 7. All CRUD Features | ✅ Complete | Categories, Predictors, Signals, Receipts, Reviews |
| 8. ContentId Bridge | ✅ Complete | UUID ↔ bytes32 conversion for on-chain |
| 9. Admin Dashboard | ✅ Complete | Stats, Reports, Disputes management |
| 10. Testing | ⏳ Pending | Unit & integration tests |
| 11. Deployment | ⏳ Pending | Docker, MongoDB Atlas |

---

## 📝 Key Design Decisions

1. **Ratings are entirely off-chain** - Removed from smart contracts in v0.6.1, stored in MongoDB
2. **One review per purchase** - Enforced by unique `tokenId` constraint in Review model
3. **One report per purchase** - Enforced by unique `tokenId` constraint in Report model
4. **URL stripping in reports** - Report descriptions have URLs replaced with `[link removed]` for security
5. **Feature-based folder structure** - Each feature has its own schemas, service, controller, routes
6. **SIWE for auth** - Wallet signature proves ownership, JWT for session management
7. **Alchemy GraphQL webhooks for indexing** - Real-time blockchain event processing with rich data
8. **Pino for logging** - Fast, JSON-based logging with pretty printing in dev
9. **Zod for validation** - Runtime type checking with TypeScript inference
10. **UUID ↔ bytes32 bridge** - Seamless conversion between backend and on-chain content identifiers
11. **USDT 18 decimals** - BNB Chain USDT uses 18 decimals, unlike Ethereum's 6
