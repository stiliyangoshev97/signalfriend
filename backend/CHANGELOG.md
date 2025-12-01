# Changelog

All notable changes to the SignalFriend backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Unit & integration tests
- Docker configuration

---

## [0.7.0] - 2024-12-01 🌐 NETWORK CONFIGURATION

### Added
- **Network Detection & Configuration**
  - `isTestnet()` - Check if running on BNB Testnet (97)
  - `isMainnet()` - Check if running on BNB Mainnet (56)
  - `getNetworkName()` - Get human-readable network name
  - `getCurrentAddresses()` - Get addresses for current environment

- **Mainnet Address Validation**
  - Automatic validation when `CHAIN_ID=56`
  - Throws clear error if mainnet addresses not configured
  - Pre-configured official BSC USDT address for mainnet

- **Simplified Environment Configuration**
  - Removed contract addresses from `.env` (now in code)
  - Single `CHAIN_ID` variable controls network selection
  - Addresses automatically selected based on chain ID
  - Better documentation in `.env.example`

### Changed
- **`addresses.ts`** - Complete rewrite with network helpers
  - Renamed `mockUSDT` → `usdt` (same field for testnet MockUSDT and mainnet USDT)
  - Added `NETWORK_NAMES` constant for display
  - Added mainnet zero-address validation
  - Exported `ChainId` type and `ContractAddresses` interface

- **`clients.ts`** - Improved with network logging
  - Logs network info on startup (development only)
  - Better error messages for unsupported chains

- **`env.ts`** - Simplified blockchain config
  - Removed individual contract address env vars
  - Added Zod validation for valid chain IDs (97 or 56)

### Removed
- `SIGNALFRIEND_MARKET_ADDRESS` env var (use `addresses.ts`)
- `PREDICTOR_ACCESS_PASS_ADDRESS` env var (use `addresses.ts`)
- `SIGNAL_KEY_NFT_ADDRESS` env var (use `addresses.ts`)
- `MOCK_USDT_ADDRESS` env var (use `addresses.ts`)

---

## [0.6.0] - 2024-12-01 🔗 WEBHOOK EVENT DECODING & BLOCKCHAIN SERVICE

### Added
- **Webhook Event Decoding - Full Implementation**
  - Complete `webhook.service.ts` rewrite with viem `decodeEventLog`
  - Proper event signature hashes generated via `toEventSelector`
  - `handlePredictorJoined()` - Decodes event, creates Predictor record
  - `handleSignalPurchased()` - Decodes event, creates Receipt record
  - `handlePredictorBlacklisted()` - Decodes event, updates blacklist status
  - Idempotent event handling (safe to replay webhooks)

- **Blockchain Service - On-Chain Verification**
  - New `src/shared/services/blockchain.service.ts`
  - `verifySignalKeyOwnership()` - Check NFT ownership on-chain
  - `verifyPredictorStatus()` - Check if address holds PredictorAccessPass
  - `isPredictorBlacklisted()` - Check blacklist status on-chain
  - `getSignalKeyOwner()` - Get current owner of SignalKeyNFT
  - `getSignalKeyContentId()` - Get content ID from NFT
  - Uses viem `publicClient` for read-only contract calls

- **Event Signature Generation**
  - `src/scripts/generateEventSignatures.ts` - Script to generate topic0 hashes
  - Correct signatures for all 3 events:
    - `PredictorJoined`: `0x2f2789d1da7b490fc20c28c5014f1fdd449737869b924042025cd634b2248cc4`
    - `SignalPurchased`: `0x906c548d19aa6c7ed9e105a3d02cb6a435b802903a30000aa9ad5e01d93ef647`
    - `PredictorBlacklisted`: `0xad6b8655f145f95522485d58e7cd8ca2689dbe89691511217c7cc914b1226005`

### Technical Details
- viem properly integrated for blockchain interactions
- ABIs imported from `src/contracts/abis/` for type-safe decoding
- Event handlers integrate with existing service layer
- Comprehensive logging with Pino for debugging

---

## [0.5.0] - 2024-11-30 🎯 ALL CRUD FEATURES COMPLETE

### Added
- **Signals Feature - Full CRUD Implementation**
  - `signal.schemas.ts` - Zod validation for list/get/create/update operations
  - `signal.service.ts` - Business logic with protected content handling
  - `signal.controller.ts` - Express route handlers
  - `signal.routes.ts` - Route definitions with middleware

- **Receipts Feature - Query Implementation**
  - `receipt.schemas.ts` - Zod validation for list/check operations
  - `receipt.service.ts` - Business logic with purchase verification
  - `receipt.controller.ts` - Express route handlers
  - `receipt.routes.ts` - Route definitions (all auth required)

- **Reviews Feature - Full CRUD Implementation**
  - `review.schemas.ts` - Zod validation for create/update/list operations
  - `review.service.ts` - Business logic with rating calculations
  - `review.controller.ts` - Express route handlers
  - `review.routes.ts` - Route definitions with middleware

### API Endpoints (v0.5.0)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/signals` | No | List signals (filter, paginate) |
| GET | `/api/signals/predictor/:address` | No | Get predictor's signals |
| GET | `/api/signals/:contentId` | No | Get signal metadata |
| GET | `/api/signals/:contentId/content` | Yes | Get protected content |
| POST | `/api/signals` | Yes | Create signal (predictor) |
| PUT | `/api/signals/:contentId` | Yes | Update own signal |
| DELETE | `/api/signals/:contentId` | Yes | Deactivate own signal |
| GET | `/api/receipts/mine` | Yes | Get user's purchases |
| GET | `/api/receipts/stats` | Yes | Get predictor stats |
| GET | `/api/receipts/check/:contentId` | Yes | Check if purchased |
| GET | `/api/receipts/signal/:contentId` | Yes | Get signal sales |
| GET | `/api/receipts/:tokenId` | Yes | Get receipt by ID |
| GET | `/api/reviews/mine` | Yes | Get user's reviews |
| GET | `/api/reviews/signal/:contentId` | No | Get signal reviews |
| GET | `/api/reviews/predictor/:address` | No | Get predictor reviews |
| GET | `/api/reviews/check/:tokenId` | No | Check if review exists |
| GET | `/api/reviews/:tokenId` | No | Get review by ID |
| POST | `/api/reviews` | Yes | Create review |
| PUT | `/api/reviews/:tokenId` | Yes | Update own review |
| DELETE | `/api/reviews/:tokenId` | Yes | Delete own review |

### Technical Details
- Signals have public metadata and protected content (revealed after purchase)
- Receipts are created via webhooks, not API (idempotent createFromEvent)
- Reviews enforce one per purchase via unique tokenId constraint
- Rating statistics auto-calculated on review create/update/delete
- All features include comprehensive JSDoc documentation

---

## [0.4.0] - 2024-11-30 👤 PREDICTORS FEATURE

### Added
- **Predictors Feature - Full CRUD Implementation**
  - `predictor.schemas.ts` - Zod validation for list/get/update operations
  - `predictor.service.ts` - Business logic with filtering, pagination, stats
  - `predictor.controller.ts` - Express route handlers
  - `predictor.routes.ts` - Route definitions with middleware

### API Endpoints (v0.4.0)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/predictors` | No | List predictors (filter, sort, paginate, search) |
| GET | `/api/predictors/top` | No | Get leaderboard (by sales, rating, signals) |
| GET | `/api/predictors/:address` | No | Get predictor by wallet address |
| GET | `/api/predictors/:address/check` | No | Check if address is active predictor |
| PUT | `/api/predictors/:address` | Yes | Update own profile (predictor only) |

### Technical Details
- Ethereum address validation via regex pattern
- Profile updates restricted to predictor owner only
- Blacklist status checks prevent profile updates
- Category validation on profile update
- Rating statistics calculated incrementally (weighted average)
- Internal methods for webhook integration:
  - `createFromEvent()` - Create predictor from PredictorJoined event
  - `updateBlacklistStatus()` - Update from PredictorBlacklisted event
  - `incrementSignalCount()` - Called when new signal created
  - `incrementSalesCount()` - Called when signal purchased
  - `updateRatingStats()` - Called when review submitted

---

## [0.3.0] - 2024-11-30 📁 CATEGORIES FEATURE

### Added
- **Categories Feature - Full CRUD Implementation**
  - `category.schemas.ts` - Zod validation schemas for all operations
  - `category.service.ts` - Business logic with error handling
  - `category.controller.ts` - Express route handlers
  - `category.routes.ts` - Route definitions with middleware

### API Endpoints (v0.3.0)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | List categories (filter by active) |
| GET | `/api/categories/:slug` | No | Get category by slug |
| POST | `/api/categories` | Yes | Create category (admin) |
| PUT | `/api/categories/:slug` | Yes | Update category (admin) |
| DELETE | `/api/categories/:slug` | Yes | Delete category (admin) |

### Technical Details
- Zod schemas with proper validation (slug format, max lengths)
- Service layer handles duplicate checking for name/slug
- Conflict handling for category deletion with signals (TODO)
- Public routes for read operations, auth required for mutations

### Added JSDoc Comments
- Comprehensive documentation added to all backend files
- File-level module descriptions
- Function/method documentation with @param and @returns

---

## [0.2.0] - 2024-11-30 📦 CONTRACT ABIs

### Added
- **Contract ABIs extracted from Foundry build**
  - `SignalFriendMarket.ts` - Main orchestrator ABI
  - `PredictorAccessPass.ts` - Predictor NFT ABI
  - `SignalKeyNFT.ts` - Purchase receipt NFT ABI
  - `MockUSDT.ts` - Test USDT token ABI
  - `index.ts` - Barrel export file

### Technical Details
- ABIs extracted from `contracts/out/` Foundry artifacts
- Exported with `as const` for full TypeScript type inference with Viem
- Ready for use in webhook event decoding and direct contract reads

---

## [0.1.0] - 2024-11-30 🚀 INITIAL BACKEND SETUP

### Added

#### Project Foundation
- **Express.js server** with TypeScript (ES modules)
- **MongoDB/Mongoose** connection with graceful shutdown
- **Feature-based folder structure** following best practices
- **Package.json** with all dependencies
- **TSConfig** with strict mode enabled
- **ESLint + Prettier** configuration
- **Vitest** testing setup

#### Shared Infrastructure (`src/shared/`)
- **Config**
  - `env.ts` - Zod-validated environment variables
  - `database.ts` - MongoDB connection management
  - `logger.ts` - Pino logger with pretty printing in dev
- **Middleware**
  - `security.ts` - Helmet & CORS configuration
  - `rateLimiter.ts` - Express rate limiting (general + auth)
  - `validation.ts` - Zod schema validation middleware
  - `auth.ts` - JWT verification middleware
  - `errorHandler.ts` - Global error handler + 404 handler
- **Utils**
  - `ApiError.ts` - Custom error class with HTTP status codes
  - `asyncHandler.ts` - Async route wrapper for error handling
- **Types**
  - `api.types.ts` - API response types
  - `common.types.ts` - Shared types (Address, HexString)

#### Contract Integration (`src/contracts/`)
- `addresses.ts` - Contract addresses by chainId (BNB Testnet/Mainnet)
- `clients.ts` - Viem public client setup

#### MongoDB Models (`src/features/*/`)
- `Predictor` - Seller profiles with ratings, categories, blacklist status
- `Signal` - Trading signal content and metadata
- `Receipt` - Purchase receipts linked to SignalKeyNFT
- `Review` - Ratings & reviews (one per purchase via tokenId)
- `Category` - Platform categories with seed data

#### Authentication Feature (`src/features/auth/`)
- `auth.schemas.ts` - Zod schemas for nonce and verify endpoints
- `auth.service.ts` - SIWE verification + JWT signing
- `auth.controller.ts` - Route handlers (getNonce, verify, me)
- `auth.routes.ts` - Route definitions with rate limiting
- `auth.types.ts` - Auth-specific TypeScript types
- **Flow:** GET nonce → Sign SIWE message → POST verify → Receive JWT

#### Webhook Feature (`src/features/webhooks/`)
- `webhook.schemas.ts` - Alchemy webhook payload schema
- `webhook.service.ts` - Event handler scaffolding
- `webhook.controller.ts` - Webhook processing with signature verification
- `webhook.routes.ts` - POST /api/webhooks/alchemy
- **Events scaffolded:** PredictorJoined, SignalPurchased, PredictorBlacklisted

#### Scripts (`src/scripts/`)
- `seedCategories.ts` - Database seeding for default categories

#### Main Entry (`src/index.ts`)
- Express app setup with all middleware
- Route mounting (`/api/auth`, `/api/webhooks`)
- Health check endpoint (`/health`)
- Graceful shutdown handling

### Configuration Files
- `.env.example` - Environment variables template
- `.gitignore` - Node.js + IDE files
- `.prettierrc` - Code formatting rules
- `eslint.config.js` - Linting configuration
- `vitest.config.ts` - Test runner configuration
- `tests/setup.ts` - Test environment setup

### API Endpoints (v0.1.0)
| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET | `/health` | No | ✅ |
| GET | `/api/auth/nonce` | No | ✅ |
| POST | `/api/auth/verify` | No | ✅ |
| GET | `/api/auth/me` | Yes | ✅ |
| POST | `/api/webhooks/alchemy` | Signature | ✅ (scaffolded) |

### Technical Decisions
- **Pino over Winston** - Faster, smaller bundle, JSON-native
- **Feature-based structure** - Each feature self-contained with its own files
- **SIWE + JWT** - Wallet proves identity, JWT for session management
- **Zod validation** - Runtime type checking with TypeScript inference
- **Vitest** - Fast, modern test runner with TypeScript support

### Dependencies
```json
{
  "express": "^4.21.1",
  "mongoose": "^8.8.3",
  "viem": "^2.21.44",
  "siwe": "^2.3.2",
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.23.8",
  "helmet": "^8.0.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.4.1",
  "pino": "^10.1.0",
  "pino-pretty": "^13.1.2",
  "dotenv": "^16.4.5",
  "cookie-parser": "^1.4.7"
}
```

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.3.0 | 2024-11-30 | Categories CRUD feature |
| 0.2.0 | 2024-11-30 | Contract ABIs added |
| 0.1.0 | 2024-11-30 | Initial backend setup with auth & webhooks |
