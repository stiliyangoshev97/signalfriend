# SignalFriend Backend

> Express + MongoDB + Viem backend API for the SignalFriend **Web3 Prediction Signals Marketplace**.  
> **Version:** 0.37.0 | **Last Updated:** December 2025

## 🌐 Production

| Service | URL |
|---------|-----|
| **API Base** | https://api.signalfriend.com |
| **Health Check** | https://api.signalfriend.com/health |

**Infrastructure:**
- **Hosting:** Render (Starter Plan, $7/month)
- **Database:** MongoDB Atlas (M0 Free Tier)
- **Region:** Frankfurt (EU Central)

**Deployment:**
- Auto-deploys from `main` branch on push
- Build: `npm ci && npm run build`
- Start: `npm start`

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
CORS_ORIGIN=http://localhost:5173
ADMIN_ADDRESSES=0x...,0x...,0x...  # Comma-separated admin wallet addresses
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
# Seed categories (33 prediction market categories across 6 main groups)
npm run seed:categories

# Seed single test prediction signal (for webhook testing)
npx tsx src/scripts/seedTestSignal.ts

# Seed 100 prediction signals (default)
npx tsx src/scripts/seedTestSignals.ts

# Seed 500 prediction signals
npx tsx src/scripts/seedTestSignals.ts --count=500

# Preview what would be created (dry run)
npx tsx src/scripts/seedTestSignals.ts --count=500 --dry-run

# Clear test signals before seeding
npx tsx src/scripts/seedTestSignals.ts --clear --count=500

# Backfill predictor earnings (from historical receipts)
npm run backfill:earnings:preview  # Preview changes
npm run backfill:earnings:run      # Apply changes
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
│   ├── signals/             # Prediction signals (with confidenceLevel, eventUrl)
│   ├── receipts/            # Purchase receipts (NFTs)
│   ├── reviews/             # Ratings & reviews
│   ├── categories/          # Signal categories (6 main groups, 33 subcategories)
│   ├── reports/             # Signal scam reports
│   ├── disputes/            # Blacklist dispute appeals
│   ├── admin/               # Admin endpoints
│   ├── stats/               # Platform statistics
│   └── webhooks/            # Alchemy event indexing (GraphQL)
├── scripts/                 # Utility scripts
│   ├── seedCategories.ts        # Seed 33 prediction market categories
│   ├── seedTestSignal.ts        # Create single test prediction signal
│   ├── seedTestSignals.ts       # Bulk seed 100/500 prediction signals
│   ├── backfillPredictorEarnings.ts # Backfill totalEarnings from receipts
│   ├── migrateConfidenceLevel.ts # Add confidenceLevel to old signals
│   ├── migrateSignalExpiry.ts   # Migrate expiryDays to expiresAt
│   └── generateEventSignatures.ts # Generate event topic hashes
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
| GET | `/api/predictors/check-unique` | No | Check if field value (displayName/telegram/discord) is available |
| GET | `/api/predictors/:address` | Optional | Get predictor profile (private contacts if own profile) |
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
| GET | `/api/signals/:contentId/content-identifier` | Yes | Get bytes32 for on-chain purchase |
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

### Disputes (Blacklist Appeals)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/disputes` | Yes | Create dispute (blacklisted predictor only) |
| GET | `/api/disputes/me` | Yes | Get own dispute status |

### Platform Statistics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | No | Get public platform statistics |

### Admin (MultiSig Wallet Only)

#### Predictor Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/predictors/blacklisted` | Admin | Get all blacklisted predictors |
| GET | `/api/admin/predictors/:address` | Admin | Get full predictor info (includes contacts) |
| POST | `/api/admin/predictors/:address/blacklist` | Admin | Blacklist predictor in DB |
| POST | `/api/admin/predictors/:address/unblacklist` | Admin | Remove blacklist in DB |

#### Verification Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/verification-requests` | Admin | List pending verification requests |
| POST | `/api/admin/predictors/:address/verify` | Admin | Approve verification |
| POST | `/api/admin/predictors/:address/reject` | Admin | Reject verification |
| POST | `/api/admin/predictors/:address/unverify` | Admin | Remove verification badge |
| POST | `/api/admin/predictors/:address/manual-verify` | Admin | Manually verify any predictor |

#### Signal Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| DELETE | `/api/admin/signals/:contentId` | Admin | Deactivate signal (soft delete) |

#### Reports Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/reports` | Admin | List all reports for admin review |
| GET | `/api/admin/reports/:id` | Admin | Get single report by ID |
| PUT | `/api/admin/reports/:id` | Admin | Update report status |

#### Disputes Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/disputes` | Admin | List all disputes |
| GET | `/api/admin/disputes/counts` | Admin | Get dispute counts by status |
| PUT | `/api/admin/disputes/:id` | Admin | Update dispute status |
| POST | `/api/admin/disputes/:id/resolve` | Admin | Resolve dispute and unblacklist |

#### Platform Statistics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Get platform earnings breakdown |

> **Note:** Admin endpoints require authentication from one of the 3 MultiSig wallet addresses configured in `ADMIN_ADDRESSES`. Blacklist operations also require a manual on-chain MultiSig transaction for full effect.

### Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/webhooks/alchemy` | Signature | Alchemy event webhook |
| GET | `/api/webhooks/health` | No | Webhook system health check |

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

## Rate Limiting

The API uses a **tiered rate limiting system** to balance security with user experience.

### Rate Limit Tiers

| Tier | Limit | Window | Endpoints |
|------|-------|--------|-----------|
| Auth Nonce | 60 req | 15 min | `GET /auth/nonce` |
| Auth Verify | 20 req | 15 min | `POST /auth/verify` |
| Read | 200 req | 1 min | All GET endpoints |
| Write | 60 req | 15 min | POST/PUT/DELETE (signals, reviews, etc.) |
| Critical | 500 req | 15 min | `/receipts/*` (never block purchases) |
| General | Configurable | Configurable | Fallback safety net |

### Design Principles

1. **Authenticated users get higher limits** - Abuse is traceable by wallet
2. **Reads >> Writes** - Reads are cheap, writes need protection
3. **Never block purchases** - Critical endpoints have very high limits
4. **IP + User hybrid** - IP for unauthenticated, userId for authenticated

### Response Headers

All responses include standard rate limit headers:
```
RateLimit-Limit: 200
RateLimit-Remaining: 195
RateLimit-Reset: 1702234567
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Too many read requests, please try again later."
}
```

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

This section provides a **step-by-step file creation order** for understanding dependencies or rebuilding the backend from scratch.

---

### 📋 File Creation Order & Dependencies

> **Legend:** Files are listed in the order they should be created. Each file's dependencies are shown.

---

#### **Phase 1: Configuration & Core Utilities (No Dependencies)**

These files have no internal dependencies and must be created first:

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 1 | `src/shared/config/env.ts` | Zod-validated environment variables | None |
| 2 | `src/shared/config/logger.ts` | Pino logger instance | `env.ts` |
| 3 | `src/shared/utils/ApiError.ts` | Custom error class | None |
| 4 | `src/shared/utils/asyncHandler.ts` | Express async wrapper | None |
| 5 | `src/shared/utils/contentId.ts` | UUID ↔ bytes32 conversion | None |
| 6 | `src/shared/types/index.ts` | TypeScript types/interfaces | None |

---

#### **Phase 2: Database & Blockchain Setup**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 7 | `src/shared/config/db.ts` | MongoDB connection | `env.ts`, `logger.ts` |
| 8 | `src/contracts/addresses.ts` | Contract addresses by chainId | None |
| 9 | `src/contracts/abis/*.json` | Contract ABI files | None |
| 10 | `src/contracts/clients.ts` | Viem public client | `env.ts`, `addresses.ts` |

---

#### **Phase 3: Middleware Layer**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 11 | `src/shared/middleware/validation.ts` | Zod validation middleware | `ApiError.ts` |
| 12 | `src/shared/middleware/errorHandler.ts` | Global error handler | `ApiError.ts`, `logger.ts` |
| 13 | `src/shared/middleware/rateLimiter.ts` | Rate limiting middleware | `env.ts` |
| 14 | `src/shared/middleware/auth.ts` | JWT auth middleware | `env.ts`, `ApiError.ts` |
| 15 | `src/shared/middleware/admin.ts` | Admin verification | `env.ts`, `auth.ts`, `ApiError.ts` |

---

#### **Phase 4: Feature Modules (Create in This Order)**

Each feature has internal files that must be created in order. **Within each feature, always create files in this order:** Model → Schemas → Service → Controller → Routes → Index

##### **4.1 Categories Feature (Simplest - Start Here)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 16 | `features/categories/category.model.ts` | Mongoose schema | None |
| 17 | `features/categories/category.schemas.ts` | Zod validation | None |
| 18 | `features/categories/category.service.ts` | Business logic | `model`, `ApiError` |
| 19 | `features/categories/category.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 20 | `features/categories/category.routes.ts` | Express router | `controller`, middleware |
| 21 | `features/categories/index.ts` | Barrel export | All above |

##### **4.2 Auth Feature (Foundation for Protected Routes)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 22 | `features/auth/auth.schemas.ts` | Zod validation | None |
| 23 | `features/auth/auth.service.ts` | SIWE + JWT logic | `env.ts`, nonce storage |
| 24 | `features/auth/auth.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 25 | `features/auth/auth.routes.ts` | Express router | `controller`, middleware |
| 26 | `features/auth/index.ts` | Barrel export | All above |

##### **4.3 Predictors Feature**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 27 | `features/predictors/predictor.model.ts` | Mongoose schema | None |
| 28 | `features/predictors/predictor.schemas.ts` | Zod validation | None |
| 29 | `features/predictors/predictor.service.ts` | Business logic | `model`, `ApiError` |
| 30 | `features/predictors/predictor.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 31 | `features/predictors/predictor.routes.ts` | Express router | `controller`, `auth` middleware |
| 32 | `features/predictors/index.ts` | Barrel export | All above |

##### **4.4 Signals Feature (Core Business Logic)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 33 | `features/signals/signal.model.ts` | Mongoose schema | `Category` model ref |
| 34 | `features/signals/signal.schemas.ts` | Zod validation | None |
| 35 | `features/signals/signal.service.ts` | Business logic | `model`, `Predictor`, `Receipt`, `contentId` |
| 36 | `features/signals/signal.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 37 | `features/signals/signal.routes.ts` | Express router | `controller`, `auth` middleware |
| 38 | `features/signals/index.ts` | Barrel export | All above |

##### **4.5 Receipts Feature (Depends on Signals)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 39 | `features/receipts/receipt.model.ts` | Mongoose schema | `Signal` ref |
| 40 | `features/receipts/receipt.schemas.ts` | Zod validation | None |
| 41 | `features/receipts/receipt.service.ts` | Business logic | `model`, `Signal`, `Predictor` |
| 42 | `features/receipts/receipt.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 43 | `features/receipts/receipt.routes.ts` | Express router | `controller`, `auth` middleware |
| 44 | `features/receipts/index.ts` | Barrel export | All above |

##### **4.6 Reviews Feature (Depends on Receipts)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 45 | `features/reviews/review.model.ts` | Mongoose schema | `Receipt` tokenId |
| 46 | `features/reviews/review.schemas.ts` | Zod validation | None |
| 47 | `features/reviews/review.service.ts` | Business logic | `model`, `Receipt`, `Predictor` |
| 48 | `features/reviews/review.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 49 | `features/reviews/review.routes.ts` | Express router | `controller`, `auth` middleware |
| 50 | `features/reviews/index.ts` | Barrel export | All above |

##### **4.7 Reports Feature (Depends on Receipts)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 51 | `features/reports/report.model.ts` | Mongoose schema | `Receipt` tokenId |
| 52 | `features/reports/report.schemas.ts` | Zod validation | None |
| 53 | `features/reports/report.service.ts` | Business logic | `model`, `Receipt`, `Signal` |
| 54 | `features/reports/report.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 55 | `features/reports/report.routes.ts` | Express router | `controller`, `auth` middleware |
| 56 | `features/reports/index.ts` | Barrel export | All above |

##### **4.8 Disputes Feature (Depends on Predictors)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 57 | `features/disputes/dispute.model.ts` | Mongoose schema | `Predictor` ref |
| 58 | `features/disputes/dispute.service.ts` | Business logic | `model`, `Predictor` |
| 59 | `features/disputes/dispute.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 60 | `features/disputes/dispute.routes.ts` | Express router | `controller`, `auth`, `admin` middleware |
| 61 | `features/disputes/index.ts` | Barrel export | All above |

##### **4.9 Stats Feature (Aggregation Layer)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 62 | `features/stats/stats.service.ts` | Aggregation queries | `Predictor`, `Signal`, `Receipt` models |
| 63 | `features/stats/stats.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 64 | `features/stats/stats.routes.ts` | Express router | `controller` |
| 65 | `features/stats/index.ts` | Barrel export | All above |

##### **4.10 Webhooks Feature (Blockchain Integration)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 66 | `features/webhooks/webhook.service.ts` | Event handlers | `Predictor`, `Receipt`, `Signal` models |
| 67 | `features/webhooks/webhook.controller.ts` | Alchemy handler | `service`, `env.ts` (signing key) |
| 68 | `features/webhooks/webhook.routes.ts` | Express router | `controller` |
| 69 | `features/webhooks/index.ts` | Barrel export | All above |

##### **4.11 Admin Feature (Depends on All Models)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 70 | `features/admin/admin.service.ts` | Admin operations | All models |
| 71 | `features/admin/admin.controller.ts` | Route handlers | `service`, `asyncHandler` |
| 72 | `features/admin/admin.routes.ts` | Express router | `controller`, `auth`, `admin` middleware |
| 73 | `features/admin/index.ts` | Barrel export | All above |

---

#### **Phase 5: Application Bootstrap**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 74 | `src/index.ts` | Express app & server | ALL feature routes, ALL middleware |

---

### 🔗 Dependency Diagram

```
                    ┌─────────────────┐
                    │     index.ts    │
                    │  (Entry Point)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌──────────┐       ┌──────────┐        ┌──────────┐
   │ shared/  │       │contracts/│        │features/ │
   │  config  │       │  viem    │        │ modules  │
   └────┬─────┘       └──────────┘        └────┬─────┘
        │                                      │
        ▼                                      │
┌───────────────┐                              │
│  middleware/  │◄─────────────────────────────┘
│ auth, admin,  │
│  validation   │
└───────────────┘

Feature Dependency Chain:

┌────────────┐
│ Categories │ ◄── No dependencies (start here)
└────────────┘
      │
      ▼
┌────────────┐
│    Auth    │ ◄── Foundation for protected routes
└────────────┘
      │
      ▼
┌────────────┐
│ Predictors │ ◄── Uses Auth middleware
└────────────┘
      │
      ▼
┌────────────┐
│  Signals   │ ◄── Refs: Category, Predictor
└────────────┘
      │
      ├────────────────────────┐
      ▼                        ▼
┌────────────┐          ┌────────────┐
│  Receipts  │          │  Disputes  │
│ (tokenId)  │          │(Predictor) │
└────────────┘          └────────────┘
      │
      ├──────────────┐
      ▼              ▼
┌────────────┐ ┌────────────┐
│  Reviews   │ │  Reports   │
│ (tokenId)  │ │ (tokenId)  │
└────────────┘ └────────────┘
      │              │
      └──────┬───────┘
             ▼
┌────────────────────────────┐
│   Stats / Webhooks / Admin │
│    (Aggregation Layer)     │
└────────────────────────────┘
```

---

### 🎯 Quick Start for Reviewers

**If reviewing the codebase:**
1. Start with `src/shared/config/env.ts` → understand configuration
2. Read `src/shared/utils/ApiError.ts` → understand error handling
3. Study `src/features/categories/` → simplest complete feature
4. Study `src/features/auth/` → understand authentication flow
5. Study `src/features/signals/` → core business logic
6. Review `src/features/webhooks/` → blockchain integration

**If rebuilding from scratch:**
1. Follow the Phase 1-5 order above
2. Test each phase before moving to the next
3. Use `npm run seed:categories` after Phase 4.1

---

### 📊 Key Concepts Quick Reference

| Concept | Primary File | Description |
|---------|--------------|-------------|
| Auth flow | `auth/auth.service.ts` | SIWE nonce → verify → JWT |
| Protected content | `signals/signal.service.ts` | Content only revealed to purchasers |
| ContentId bridge | `shared/utils/contentId.ts` | UUID ↔ bytes32 conversion |
| Event indexing | `webhooks/webhook.service.ts` | Alchemy GraphQL → MongoDB |
| Admin check | `shared/middleware/admin.ts` | MultiSig wallet verification |
| Rating recalc | `reviews/review.service.ts` | Updates predictor averageRating |

### 📊 Database Models

| Model | Collection | Key Fields |
|-------|------------|------------|
| Category | categories | name, mainGroup, slug |
| Predictor | predictors | walletAddress, displayName, isVerified, isBlacklisted |
| Signal | signals | contentId, content (protected), categoryId, predictorAddress |
| Receipt | receipts | tokenId, contentId, buyerAddress, predictorAddress |
| Review | reviews | tokenId, rating (1-5), comment |
| Report | reports | tokenId, reason, description, status |
| Dispute | disputes | predictorAddress, status, adminNotes |

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
