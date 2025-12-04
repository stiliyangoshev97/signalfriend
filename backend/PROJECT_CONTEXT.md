# SignalFriend Backend - Project Context

> **Last Updated:** December 2024  
> **Current Phase:** Manual Testing Complete, Maintenance Mode Added  
> **Project Status:** 🟢 **Ready for Frontend (100/100)** - All Features Complete & Tested  
> **Branch:** `main`

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

### Key Technical Details
- **USDT Decimals:** 18 (BNB Chain, not 6 like Ethereum)
- **ContentId Format:** UUID in MongoDB ↔ bytes32 on-chain
- **Webhook Type:** Alchemy Custom (GraphQL) webhooks

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
│   │   └── admin/               # Admin endpoints (MultiSig only) ✅ (NEW)
│   ├── scripts/
│   │   ├── seedCategories.ts    # Database seeding
│   │   ├── seedTestSignal.ts    # Test signal for webhook testing
│   │   └── generateEventSignatures.ts  # Event hash generator
│   └── shared/
│       ├── config/              # env, database, logger
│       ├── middleware/          # auth, validation, errors, security, admin
│       ├── services/            # blockchain.service.ts (viem)
│       ├── types/               # TypeScript types
│       └── utils/               # ApiError, asyncHandler, contentId
├── tests/
│   └── setup.ts                 # Test configuration
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.js
```

---

## 🔗 Smart Contract Integration

### Contract Addresses (BNB Testnet - Chain ID 97)
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

### Events to Index (via Alchemy Webhooks)
| Event | Contract | Action |
|-------|----------|--------|
| `PredictorJoined` | SignalFriendMarket | Create Predictor record |
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
  salesAtLastApplication: number,  // For re-apply logic after rejection
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

### Report Model (NEW)
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
| POST | `/api/reviews` | Yes | Create rating (1-5 score) |
| PUT | `/api/reviews/:tokenId` | Yes | Update own rating |
| DELETE | `/api/reviews/:tokenId` | Yes | Delete own rating |
| POST | `/api/reports` | Yes | Create report (scam/false signal) |
| GET | `/api/reports/mine` | Yes | Get user's reports |
| GET | `/api/reports/signal/:contentId` | No | Get signal reports |
| GET | `/api/reports/predictor/:address` | No | Get predictor reports |
| GET | `/api/reports/predictor/:address/stats` | No | Get report statistics |
| GET | `/api/reports/check/:tokenId` | No | Check if report exists |
| GET | `/api/admin/predictors/:address` | Admin | Get full predictor info (includes contacts) |
| POST | `/api/admin/predictors/:address/blacklist` | Admin | Blacklist predictor in DB |
| POST | `/api/admin/predictors/:address/unblacklist` | Admin | Remove blacklist in DB |
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
| 4. MongoDB Models | ✅ Complete | All 5 models defined |
| 5. Auth Feature | ✅ Complete | SIWE + JWT flow |
| 6. Webhook Feature | ✅ **Complete** | GraphQL + Address Activity webhooks, all 3 events tested |
| 7. All CRUD Features | ✅ Complete | Categories, Predictors, Signals, Receipts, Reviews |
| 8. ContentId Bridge | ✅ Complete | UUID ↔ bytes32 conversion for on-chain compatibility |
| 9. Testing | ⏳ Pending | Unit & integration tests |
| 10. Deployment | ⏳ Pending | Docker, MongoDB Atlas |

---

## 📝 Key Design Decisions

1. **Ratings are entirely off-chain** - Removed from smart contracts in v0.6.1, stored in MongoDB
2. **One review per purchase** - Enforced by unique `tokenId` constraint in Review model
3. **Feature-based folder structure** - Each feature has its own schemas, service, controller, routes
4. **SIWE for auth** - Wallet signature proves ownership, JWT for session management
5. **Alchemy GraphQL webhooks for indexing** - Real-time blockchain event processing with rich data
6. **Pino for logging** - Fast, JSON-based logging with pretty printing in dev
7. **Zod for validation** - Runtime type checking with TypeScript inference
8. **UUID ↔ bytes32 bridge** - Seamless conversion between backend and on-chain content identifiers
9. **USDT 18 decimals** - BNB Chain USDT uses 18 decimals, unlike Ethereum's 6
