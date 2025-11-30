# Changelog

All notable changes to the SignalFriend backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Predictors CRUD routes
- Signals CRUD routes
- Receipts query routes
- Reviews CRUD routes
- Webhook event decoding implementation
- Unit & integration tests
- Docker configuration

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
