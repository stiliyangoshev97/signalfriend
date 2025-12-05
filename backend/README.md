# SignalFriend Backend

Express + MongoDB + Viem backend API for the SignalFriend platform.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Blockchain**: Viem for BNB Chain interaction
- **Auth**: SIWE (Sign-In with Ethereum) + JWT
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- pnpm/npm/yarn
- ngrok (for webhook testing)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/signalfriend
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CHAIN_ID=97
RPC_URL=https://bsc-testnet-rpc.publicnode.com
ALCHEMY_SIGNING_KEY=whsec_xxx  # From Alchemy webhook
```

### Running

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Database Seeding

```bash
# Seed categories
npm run seed:categories

# Seed test signal (for webhook testing)
npx tsx src/scripts/seedTestSignal.ts
```

## Project Structure

```
src/
├── index.ts                 # App entry point
├── contracts/               # Viem clients & ABIs
│   ├── addresses.ts         # Contract addresses by chainId
│   ├── clients.ts           # Viem public client
│   └── abis/
├── features/                # Feature-based modules
│   ├── auth/                # SIWE + JWT authentication
│   ├── predictors/          # Predictor profiles
│   ├── signals/             # Trading signals
│   ├── receipts/            # Purchase receipts (NFTs)
│   ├── reviews/             # Ratings & reviews
│   ├── categories/          # Signal categories
│   └── webhooks/            # Alchemy event indexing (GraphQL)
├── scripts/                 # Utility scripts
│   ├── seedCategories.ts
│   ├── seedTestSignal.ts
│   └── generateEventSignatures.ts
└── shared/                  # Shared utilities
    ├── config/              # Environment, DB, logger
    ├── middleware/          # Auth, validation, errors
    ├── services/            # blockchain.service.ts
    ├── types/               # TypeScript types
    └── utils/               # ApiError, asyncHandler, contentId
```

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/nonce?address=0x...` | No | Get SIWE nonce |
| POST | `/api/auth/verify` | No | Verify signature, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | List all categories |
| GET | `/api/categories/:slug` | No | Get category by slug |
| POST | `/api/categories` | Yes | Create category (admin) |
| PUT | `/api/categories/:slug` | Yes | Update category |
| DELETE | `/api/categories/:slug` | Yes | Delete category |

### Predictors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/predictors` | No | List predictors (filter, sort, paginate) |
| GET | `/api/predictors/top` | No | Get leaderboard |
| GET | `/api/predictors/:address` | No | Get predictor profile |
| GET | `/api/predictors/:address/check` | No | Check if active predictor |
| GET | `/api/predictors/:address/earnings` | Yes | Get own earnings breakdown |
| PUT | `/api/predictors/:address` | Yes | Update own profile (displayName locked after 1 change) |
| POST | `/api/predictors/:address/apply-verification` | Yes | Apply for verification (100+ sales required) |

### Signals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/signals` | No | List signals (filter, paginate) |
| GET | `/api/signals/predictor/:address` | No | Get predictor's signals |
| GET | `/api/signals/:contentId` | No | Get signal metadata |
| GET | `/api/signals/:contentId/content` | Yes | Get protected content (purchaser only) |
| GET | `/api/signals/:contentId/content-identifier` | No | Get bytes32 for on-chain purchase |
| POST | `/api/signals` | Yes | Create signal (predictor only) |
| PUT | `/api/signals/:contentId` | Yes | Update own signal |
| DELETE | `/api/signals/:contentId` | Yes | Deactivate own signal |

### Receipts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/receipts/mine` | Yes | Get user's purchases |
| GET | `/api/receipts/stats` | Yes | Get predictor stats |
| GET | `/api/receipts/check/:contentId` | Yes | Check if purchased |
| GET | `/api/receipts/signal/:contentId` | Yes | Get signal sales (predictor) |
| GET | `/api/receipts/:tokenId` | Yes | Get receipt by token ID |

### Reviews (Ratings) - PERMANENT

> ⚠️ **Ratings are permanent** - Once submitted, they cannot be updated or deleted.
> This ensures rating integrity and prevents manipulation.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/mine` | Yes | Get user's ratings |
| GET | `/api/reviews/signal/:contentId` | No | Get signal ratings |
| GET | `/api/reviews/predictor/:address` | No | Get predictor ratings |
| GET | `/api/reviews/check/:tokenId` | No | Check if rating exists |
| GET | `/api/reviews/:tokenId` | No | Get rating by token ID |
| POST | `/api/reviews` | Yes | Create rating (purchaser only, 1-5 stars, **PERMANENT**) |

### Reports (Scam/False Signal)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/mine` | Yes | Get user's reports |
| GET | `/api/reports/signal/:contentId` | No | Get signal reports |
| GET | `/api/reports/signal/:contentId/count` | No | Get signal report count |
| GET | `/api/reports/predictor/:address` | No | Get predictor reports |
| GET | `/api/reports/predictor/:address/stats` | No | Get predictor report stats |
| GET | `/api/reports/check/:tokenId` | No | Check if report exists |
| GET | `/api/reports/:tokenId` | No | Get report by token ID |
| POST | `/api/reports` | Yes | Create report (purchaser only) |

### Admin (MultiSig Wallet Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/predictors/:address` | Admin | Get full predictor info (includes contacts) |
| POST | `/api/admin/predictors/:address/blacklist` | Admin | Blacklist predictor in DB |
| POST | `/api/admin/predictors/:address/unblacklist` | Admin | Remove blacklist in DB |
| GET | `/api/admin/verification-requests` | Admin | List pending verification requests |
| POST | `/api/admin/predictors/:address/verify` | Admin | Approve verification |
| POST | `/api/admin/predictors/:address/reject` | Admin | Reject verification |
| POST | `/api/admin/predictors/:address/unverify` | Admin | Remove verification badge |
| DELETE | `/api/admin/signals/:contentId` | Admin | Deactivate signal (soft delete) |

> **Note:** Admin endpoints require authentication from one of the 3 MultiSig wallet addresses configured in `ADMIN_ADDRESSES`. Blacklist operations also require a manual on-chain MultiSig transaction for full effect.

### Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/webhooks/alchemy` | Signature | Alchemy event webhook |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |

## Authentication Flow

1. **Frontend** calls `GET /api/auth/nonce?address=0x...`
2. **Backend** returns a nonce (valid 5 minutes)
3. **Frontend** constructs SIWE message and signs with wallet
4. **Frontend** calls `POST /api/auth/verify` with message + signature
5. **Backend** verifies signature, returns JWT
6. **Frontend** includes JWT in `Authorization: Bearer <token>` header

## Alchemy Webhook Setup

We use **Custom (GraphQL) Webhooks** for richer event data. See [SetupWebhooks.md](./SetupWebhooks.md) for detailed instructions.

### Quick Setup
1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/) → Webhooks
2. Create Webhook → **Custom Webhook**
3. Network: **BNB Smart Chain Testnet**
4. Webhook URL: `https://your-ngrok-url.ngrok-free.dev/api/webhooks/alchemy`
5. Add GraphQL query (see SetupWebhooks.md for template)
6. Copy signing key to `ALCHEMY_SIGNING_KEY` env var

### Indexed Events
| Event | Contract | Action |
|-------|----------|--------|
| `PredictorJoined` | SignalFriendMarket | Creates Predictor in MongoDB |
| `SignalPurchased` | SignalFriendMarket | Creates Receipt, increments sales |
| `PredictorBlacklisted` | PredictorAccessPass | Updates isBlacklisted flag |

### Local Testing with ngrok
```bash
# Terminal 1: Start ngrok
ngrok http 3001

# Terminal 2: Start backend
npm run dev
```

## Contract Addresses (BNB Testnet - Chain 97)

| Contract | Address |
|----------|---------|
| SignalFriendMarket | `0x5133397a4B9463c5270beBa05b22301e6dD184ca` |
| PredictorAccessPass | `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` |
| SignalKeyNFT | `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed` |
| MockUSDT | `0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5` |

---

## 🏗️ Building from Scratch - Code Review Guide

This section helps reviewers understand the codebase architecture and where to start.

### Entry Point

The application starts at **`src/index.ts`**:
1. Loads environment variables via `src/shared/config/env.ts` (Zod validation)
2. Connects to MongoDB via `src/shared/config/db.ts`
3. Creates Express app with middleware (CORS, JSON, request logging)
4. Mounts feature routers under `/api/v1/`
5. Sets up global error handler
6. Starts HTTP server

### Core Architecture

```
src/
├── index.ts                    # 👈 START HERE - App bootstrap
├── contracts/                  # Blockchain integration
│   ├── addresses.ts            # Contract addresses by chainId
│   ├── clients.ts              # Viem public client setup
│   └── abis/                   # Contract ABI JSON files
├── features/                   # Domain modules (review these in order)
│   ├── auth/                   # 1️⃣ SIWE + JWT authentication
│   ├── categories/             # 2️⃣ Signal categories (simple CRUD)
│   ├── predictors/             # 3️⃣ Predictor profiles
│   ├── signals/                # 4️⃣ Core business logic - signals
│   ├── receipts/               # 5️⃣ Purchase receipts
│   ├── reviews/                # 6️⃣ Ratings & reviews
│   ├── reports/                # 7️⃣ Scam reporting
│   ├── webhooks/               # 8️⃣ Alchemy event indexing
│   └── admin/                  # 9️⃣ Admin operations
└── shared/                     # Shared utilities
    ├── config/                 # env.ts, db.ts, logger.ts
    ├── middleware/             # auth, validation, errors
    ├── services/               # blockchain.service.ts
    └── utils/                  # ApiError, asyncHandler
```

### Feature Module Structure

Each feature follows a consistent pattern:
```
features/signals/
├── signal.model.ts       # Mongoose schema & model
├── signal.schemas.ts     # Zod validation schemas
├── signal.service.ts     # Business logic (static methods)
├── signal.controller.ts  # Express route handlers
├── signal.routes.ts      # Router definition
└── index.ts              # Barrel export
```

### Recommended Review Order

1. **`src/shared/config/env.ts`** - Environment validation
2. **`src/shared/utils/ApiError.ts`** - Error handling pattern
3. **`src/features/auth/`** - Authentication flow (SIWE)
4. **`src/features/signals/signal.model.ts`** - Core data model
5. **`src/features/signals/signal.service.ts`** - Business logic
6. **`src/features/webhooks/`** - Blockchain event indexing

### Key Concepts

| Concept | File | Description |
|---------|------|-------------|
| Auth flow | `auth/auth.service.ts` | SIWE nonce → verify → JWT |
| Protected content | `signals/signal.service.ts` | Content only revealed to purchasers |
| ContentId bridge | `shared/utils/contentId.ts` | UUID ↔ bytes32 conversion |
| Event indexing | `webhooks/webhook.service.ts` | Alchemy GraphQL → MongoDB |
| Admin check | `shared/middleware/admin.ts` | MultiSig wallet verification |

### Database Models

| Model | Collection | Key Fields |
|-------|------------|------------|
| Category | categories | name, mainGroup, slug |
| Predictor | predictors | walletAddress, displayName, isVerified |
| Signal | signals | contentId, content (protected), categoryId |
| Receipt | receipts | tokenId, contentId, buyerAddress |
| Review | reviews | tokenId, rating (1-5), comment |
| Report | reports | tokenId, reason, description |

---

## Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run test         # Run tests
npm run seed:categories  # Seed default categories
```

## Notes

- **USDT on BNB Chain uses 18 decimals** (not 6 like Ethereum USDT!)
- **Ratings are entirely off-chain** in MongoDB (removed from smart contracts in v0.6.1)
- One review per purchase receipt (enforced by unique `tokenId` in Review model)
- Blacklisted predictors are hidden from API responses
- **ContentId Conversion**: Backend uses UUID, smart contracts use bytes32
  - Use `GET /api/signals/:contentId/content-identifier` to get bytes32 for on-chain calls

---

## Development Phase Guide

### Phase 1: Foundation ✅
> **Goal:** Basic project structure with health check

| Task | Status | Description |
|------|--------|-------------|
| Project setup | ✅ | TypeScript, ESLint, Prettier configuration |
| Express server | ✅ | Basic HTTP server with middleware stack |
| Health endpoint | ✅ | `GET /health` for uptime monitoring |
| Logger setup | ✅ | Pino logger with request/response logging |
| Error handling | ✅ | Global error handler, ApiError class |

### Phase 2: Database & Configuration ✅
> **Goal:** MongoDB connection and environment management

| Task | Status | Description |
|------|--------|-------------|
| MongoDB connection | ✅ | Mongoose with connection retry logic |
| Environment config | ✅ | Zod-validated env vars, .env.example |
| Base models | ✅ | Mongoose schemas with indexes and timestamps |
| Database seeding | ✅ | Category seeding script |

### Phase 3: Authentication ✅
> **Goal:** Web3-native authentication with JWT

| Task | Status | Description |
|------|--------|-------------|
| SIWE integration | ✅ | Sign-In with Ethereum message verification |
| Nonce generation | ✅ | Time-limited nonces for replay protection |
| JWT tokens | ✅ | Access tokens with wallet address payload |
| Auth middleware | ✅ | `requireAuth` for protected routes |

### Phase 4: Core CRUD Features ✅
> **Goal:** All domain models with full REST APIs

| Task | Status | Description |
|------|--------|-------------|
| Categories API | ✅ | List, get by slug, create, update, delete |
| Predictors API | ✅ | Profile management, leaderboards, search |
| Signals API | ✅ | Create, list, protected content unlock |
| Receipts API | ✅ | Purchase history, predictor stats |
| Reviews API | ✅ | Create, update, delete with rating recalc |

### Phase 5: Blockchain Integration ✅
> **Goal:** Viem clients and Alchemy webhook indexing

| Task | Status | Description |
|------|--------|-------------|
| Viem clients | ✅ | Public client for BNB Chain |
| Contract ABIs | ✅ | Type-safe ABI imports for all contracts |
| Webhook endpoint | ✅ | Alchemy signature verification |
| GraphQL webhooks | ✅ | Custom webhook with rich event data |
| Event handlers | ✅ | PredictorJoined, SignalPurchased, Blacklisted |
| ContentId bridge | ✅ | UUID ↔ bytes32 conversion utilities |
| Blockchain service | ✅ | On-chain verification utilities |

### Phase 6: Testing & Quality 🔄
> **Goal:** Comprehensive test coverage

| Task | Status | Description |
|------|--------|-------------|
| Unit tests | 🔄 | Service layer tests with mocks |
| Integration tests | 🔄 | API endpoint tests with test database |
| E2E tests | 🔄 | Full flow tests including blockchain |
| Test fixtures | 🔄 | Factory functions for test data |

### Phase 7: Production Readiness 🔄
> **Goal:** Deployment and monitoring

| Task | Status | Description |
|------|--------|-------------|
| Docker setup | 🔄 | Dockerfile and docker-compose.yml |
| Rate limiting | 🔄 | Request throttling per IP/wallet |
| CORS config | 🔄 | Whitelist frontend origins |
| API documentation | 🔄 | OpenAPI/Swagger spec generation |
| Monitoring | 🔄 | Health metrics, error tracking |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | In Progress |
| ⏳ | Planned |
| ❌ | Blocked |
