# SignalFriend Backend - Project Context

> **Last Updated:** November 30, 2024  
> **Current Phase:** Foundation Complete ✅ → Building Features  
> **Project Status:** 🟡 **In Development (40/100)** - Core Infrastructure Ready  
> **Branch:** `main` (foundation merged)

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
│   │   ├── webhooks/            # Alchemy event indexing ✅
│   │   ├── categories/          # Signal categories ⏳
│   │   ├── predictors/          # Predictor profiles ⏳
│   │   ├── signals/             # Trading signals ⏳
│   │   ├── receipts/            # Purchase receipts ⏳
│   │   └── reviews/             # Ratings & reviews ⏳
│   ├── scripts/
│   │   └── seedCategories.ts    # Database seeding
│   └── shared/
│       ├── config/              # env, database, logger
│       ├── middleware/          # auth, validation, errors, security
│       ├── types/               # TypeScript types
│       └── utils/               # ApiError, asyncHandler
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

### Events to Index (via Alchemy Webhooks)
| Event | Contract | Action |
|-------|----------|--------|
| `PredictorJoined` | SignalFriendMarket | Create Predictor record |
| `SignalPurchased` | SignalFriendMarket | Create Receipt record |
| `PredictorBlacklisted` | PredictorAccessPass | Update Predictor.isBlacklisted |

---

## 💾 MongoDB Data Models

### Predictor Model
```typescript
{
  walletAddress: string,      // Unique, indexed
  tokenId: number,            // PredictorAccessPass NFT ID
  displayName: string,
  bio: string,
  avatarUrl: string,
  socialLinks: { twitter?, telegram?, discord? },
  categoryIds: ObjectId[],    // References to Category
  totalSignals: number,
  totalSales: number,
  averageRating: number,      // Calculated from reviews
  totalReviews: number,
  isBlacklisted: boolean,     // Synced from blockchain
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
  priceUsdt: number,
  totalSales: number,
  averageRating: number,
  totalReviews: number,
  isActive: boolean,
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

### Review Model
```typescript
{
  tokenId: number,            // Unique - one review per purchase
  signalId: ObjectId,
  contentId: string,
  buyerAddress: string,
  predictorAddress: string,
  score: number,              // 1-5
  reviewText: string,
}
```

### Category Model
```typescript
{
  name: string,               // Unique
  slug: string,               // URL-friendly
  description: string,
  icon: string,
  isActive: boolean,
  sortOrder: number,
}
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

### Planned ⏳
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | List all categories |
| GET | `/api/categories/:slug` | No | Get category by slug |
| GET | `/api/predictors` | No | List predictors (filtered) |
| GET | `/api/predictors/:address` | No | Get predictor profile |
| PUT | `/api/predictors/:address` | Yes | Update own profile |
| GET | `/api/signals` | No | List signals (filtered) |
| GET | `/api/signals/:contentId` | No | Get signal details |
| POST | `/api/signals` | Yes | Create signal (predictor only) |
| GET | `/api/signals/:contentId/content` | Yes | Get protected content (owner only) |
| GET | `/api/receipts/mine` | Yes | Get user's purchases |
| POST | `/api/reviews` | Yes | Submit review (owner only) |
| GET | `/api/reviews/signal/:contentId` | No | Get signal reviews |

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
| 6. Webhook Feature | ✅ Scaffolded | Routes ready, event decoding pending |
| 7. Core Features | ⏳ Pending | Categories, Predictors, Signals, etc. |
| 8. Testing | ⏳ Pending | Unit & integration tests |
| 9. Deployment | ⏳ Pending | Docker, MongoDB Atlas |

---

## 📝 Key Design Decisions

1. **Ratings are entirely off-chain** - Removed from smart contracts in v0.6.1, stored in MongoDB
2. **One review per purchase** - Enforced by unique `tokenId` constraint in Review model
3. **Feature-based folder structure** - Each feature has its own schemas, service, controller, routes
4. **SIWE for auth** - Wallet signature proves ownership, JWT for session management
5. **Alchemy webhooks for indexing** - Real-time blockchain event processing
6. **Pino for logging** - Fast, JSON-based logging with pretty printing in dev
7. **Zod for validation** - Runtime type checking with TypeScript inference
