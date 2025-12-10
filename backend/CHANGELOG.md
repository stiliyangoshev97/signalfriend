# Changelog

All notable changes to the SignalFriend backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Unit & integration tests
- Docker configuration
- Redis-based rate limiting for horizontal scaling

### Note
- Admin blacklist via smart contract integration is now handled entirely on the frontend (v0.11.0), calling `proposeBlacklist()` directly on the PredictorAccessPass smart contract

---

## [0.24.0] - 2025-12-10 🛡️ PRODUCTION-READY TIERED RATE LIMITING

### Added

**Tiered Rate Limiting System**
- Production-ready rate limiting with per-endpoint-type limits
- Separate rate limiters for different operation types:
  - **Auth Nonce**: 60 req/15min (supports wallet switching)
  - **Auth Verify**: 20 req/15min (prevents brute force)
  - **Auth Logout**: 30 req/15min
  - **Read Operations**: 200 req/min (high frequency browsing)
  - **Write Operations**: 60 req/15min (data modification)
  - **Critical Operations**: 500 req/15min (purchases - never block revenue)
  - **General Fallback**: Configurable via env vars

**Rate Limiter Features**
- IP-based tracking for unauthenticated requests
- Hybrid IP/User tracking for authenticated requests (more lenient)
- Detailed logging when rate limits are exceeded
- Standard rate limit headers (`RateLimit-*`)
- Skip function for critical authenticated operations

**Route-Level Rate Limiting**
- Auth routes: Specific nonce/verify limiters
- Signal/Predictor/Category routes: Read limiter for GETs
- Signal/Predictor/Review/Report routes: Write limiter for POST/PUT/DELETE
- Receipt routes: Critical limiter (never block purchases)
- Webhook routes: No rate limiting (protected by signature verification)

### Changed

**Rate Limiter Configuration**
- Refactored `rateLimiter.ts` from 2 simple limiters to comprehensive tiered system
- Auth rate limit increased from 10/15min to 60/15min for nonce, 20/15min for verify
- Global rate limiter now serves as fallback safety net

**Route Files Updated**
- `auth.routes.ts`: Uses `authNonceRateLimiter` and `authVerifyRateLimiter`
- `signal.routes.ts`: Write limiter on POST/PUT/DELETE
- `predictor.routes.ts`: Write limiter on PUT/POST
- `review.routes.ts`: Write limiter on POST
- `report.routes.ts`: Write limiter on POST
- `dispute.routes.ts`: Write limiter on POST
- `category.routes.ts`: Write limiter on POST/PUT/DELETE
- `index.ts`: Tiered rate limiters applied by route category

### Design Principles
1. **Authenticated users get higher limits** - Abuse is traceable by wallet
2. **Reads >> Writes** - Reads are cheap, writes need protection
3. **Never block purchases** - Lost revenue + terrible UX
4. **IP + User hybrid** - IP for unauthenticated, userId for authenticated

---

## [0.23.0] - 2025-12-10 🔧 FILTERS & SORTING IMPROVEMENTS

### Added

**Predictor Verified Filter**
- New `verified` query parameter for `/api/predictors` endpoint
- `verified=true` returns only verified predictors
- `verified=false` returns only unverified predictors
- `undefined` (default) returns all predictors

**Compound Sorting for Predictors**
- Intelligent tiebreakers when primary sort values are equal
- Sort by `averageRating`: tiebreaks by `totalReviews` → `totalSales` → `joinedAt`
- Sort by `totalSales`: tiebreaks by `averageRating` → `totalReviews` → `joinedAt`
- Sort by `totalSignals`: tiebreaks by `totalSales` → `averageRating` → `joinedAt`
- Sort by `joinedAt`: tiebreaks by `totalSales` → `averageRating`
- Applied to both `getAll()` and `getTopPredictors()` methods

**Smart Signal Sorting**
- Quality-first default sort when no `sortBy` is specified (rating → sales → reviews → date)
- User's explicit sort selection is respected as primary sort
- Tiebreakers applied when primary values are equal
- Fixes misleading behavior where "Price Low→High" showed expensive signals first

### Changed

**Signal Schema**
- Removed default value from `sortBy` in `listSignalsSchema`
- `sortBy=undefined` now triggers quality-first sorting
- Explicit sort selection overrides quality-first behavior

---

## [0.22.0] - 2025-12-09 🛠️ RESERVED DISPLAY NAMES

### Added

**Reserved Display Name Validation**
- `RESERVED_DISPLAY_NAMES` constant array with prohibited names:
  - admin, administrator, signalfriend, signal_friend, signal-friend
  - moderator, mod, support, help, official
  - team, staff, system, bot, root, owner, founder
- `isReservedDisplayName()` function for checking reserved names
  - Case-insensitive matching
  - Partial match blocking (e.g., "admin123" blocked)
  - Any name containing "signalfriend" blocked
- Zod schema validation with `.refine()` in `updatePredictorProfileSchema`
- Defense-in-depth check in `PredictorService.updateProfile()`

### Changed

**Predictor Schema Exports**
- `RESERVED_DISPLAY_NAMES` now exported for potential frontend use
- `isReservedDisplayName()` now exported for reuse

---

## [0.21.0] - 2025-12-08 ✅ PHASE 3 MISC FIXES COMPLETE

### Added

**Admin Manual Verification Endpoints**
- `POST /api/admin/predictors/:address/manual-verify` - Admin can verify any predictor regardless of sales
- `POST /api/admin/predictors/:address/unverify` - Admin can remove verification from any predictor
- `adminManualVerify()` method in PredictorService
- Updates predictor's `isVerified`, `verificationStatus`, and `manuallyVerified` fields

**Admin Predictor Profile Earnings**
- `getAdminPredictorByAddress()` now returns full earnings breakdown
- Returns: totalSalesRevenue, predictorEarnings, platformCommission, referralEarnings, totalEarnings, etc.
- `getReferralEarnings()` helper method for calculating referral bonuses

**Verification Requirements Update**
- Verification now requires 100 sales AND $1000 USDT total earnings (not just sales)
- Updated `applyForVerification()` to check both conditions
- Added earnings check using `getPredictorEarnings()` helper

### Changed

**AdminPredictorProfile Response**
- Now includes `earnings` object with all financial metrics
- Now includes `verificationStatus` field

---

## [0.20.0] - 2025-12-08 🔒 COMPLETE BLACKLIST SYSTEM OVERHAUL

### Changed

**Signal Listing with Blacklist Check**
- `getAll()` now properly handles `predictorAddress` filter with blacklist check
- When requesting a specific predictor's signals, checks if they're blacklisted first
- Returns empty results for blacklisted predictor signal queries
- Prevents signals from appearing on blacklisted predictor's profile page

**Signal Populate Fields**
- `getByContentId()` now includes `isBlacklisted` in predictor population
- `getAll()` now includes `isBlacklisted` in predictor population
- Ensures frontend can display blacklist status correctly

**Unblacklist Auto-Resolve Disputes**
- `adminUnblacklist()` now auto-resolves any pending/contacted disputes
- Sets dispute status to 'resolved' with `resolvedAt` timestamp
- Keeps system consistent - no orphan disputes after unblacklist

### Fixed
- Blacklisted predictor signals no longer visible on their profile page
- Signal detail page correctly shows blacklist status from populated predictor
- Disputes don't remain open after predictor is unblacklisted

---

## [0.19.0] - 2025-12-08 🐛 BLACKLIST SYSTEM & VALIDATION FIXES

### Added

**URL Validation Utility** (`src/shared/utils/textValidation.ts`)
- `containsUrl()` - Check if text contains URLs
- `stripUrls()` - Remove URLs from text
- `validateNoUrls()` - Throws ApiError if URLs found

**Admin Predictor Profile Hook**
- Frontend can now fetch full predictor profile with contact info via admin endpoint
- Added `useAdminPredictorProfile()` hook and `fetchAdminPredictorProfile()` API

### Changed

**Blacklist System Improvements**
- `getAll()` in SignalService now filters out signals from blacklisted predictors
- `getContentIdentifier()` blocks retrieval for blacklisted predictor signals
- `createSignal()` returns better error message when predictor is blacklisted
- `blacklistPredictor()` now resets any existing dispute to pending status
- `blacklistPredictor()` prevents blacklisting admin wallet addresses

**Input Validation**
- Signal creation now validates title, description, and content for URLs
- Report creation now strips URLs from description on input (not just display)

### Fixed
- Blacklisted predictor signals no longer visible in marketplace
- Cannot purchase signals from blacklisted predictors
- Disputes are properly reset when predictor is re-blacklisted
- Admins cannot be blacklisted
- Better error message for blacklisted predictor creating signals

---

## [0.18.0] - 2025-12-07 📝 BUYER REPORTS & ADMIN BLACKLIST MANAGEMENT

### Added

**Buyer Reports Endpoints** (`src/features/reports/`)
- `POST /api/reports` - Create report (requires tokenId ownership)
- `GET /api/reports/check/:tokenId` - Check if report exists for purchase
- URL stripping in report descriptions for security (replaces URLs with `[link removed]`)

**Admin Blacklist Management**
- `GET /api/admin/predictors/blacklisted` - List all blacklisted predictors
- Added `getBlacklistedPredictors()` to PredictorService
- Added `getBlacklistedPredictors` controller handler

### Changed
- Split blacklist API into separate endpoints:
  - `POST /api/admin/predictors/:address/blacklist` (was PUT with toggle)
  - `POST /api/admin/predictors/:address/unblacklist` (new)
- Admin reports API response now wraps data correctly:
  - `{ success: true, data: { reports: [...], pagination: {...} } }`
- Admin disputes API response now wraps data correctly:
  - `{ success: true, data: { disputes: [...], pagination: {...} } }`

### Security
- Report descriptions now have URLs automatically stripped
- Prevents phishing/scam links in user-submitted content

---

## [0.17.0] - 2025-12-06 🛡️ ADMIN DASHBOARD & MODERATION SYSTEM

### Added

**Admin Service** (`src/features/admin/admin.service.ts`)
- New service file for admin business logic
- `getPlatformEarnings()` - Calculates platform revenue breakdown:
  - fromPredictorJoins: $15 × predictors (assumes all had referrals)
  - fromBuyerAccessFees: $0.50 × purchases
  - fromCommissions: 5% × total signal volume
  - Includes details: totalPredictors, totalPurchases, totalSignalVolume
- `listReports()` - Lists all reports with full signal/predictor details
- `getReportById()` - Gets single report with populated data
- `updateReportStatus()` - Updates report status and admin notes

**Admin Endpoints** (`src/features/admin/admin.controller.ts`, `admin.routes.ts`)
- `GET /api/admin/stats` - Platform earnings breakdown
- `GET /api/admin/reports` - List all reports (pagination, status filter)
- `GET /api/admin/reports/:id` - Get single report by ID
- `PUT /api/admin/reports/:id` - Update report status

**Disputes Feature** (`src/features/disputes/`)
- New feature module for blacklist dispute handling
- `dispute.model.ts` - Mongoose model (predictorAddress unique, status, adminNotes)
- `dispute.schemas.ts` - Zod validation schemas
- `dispute.service.ts` - Business logic:
  - `create()` - Creates dispute (blacklisted predictor only)
  - `getByPredictor()` - Get predictor's dispute
  - `hasActiveDispute()` - Check for pending/contacted dispute
  - `listForAdmin()` - List disputes with predictor info
  - `updateStatus()` - Update dispute status
  - `resolve()` - Resolve dispute and unblacklist predictor
  - `getCounts()` - Get counts by status for dashboard
- `dispute.controller.ts` - Route handlers
- `dispute.routes.ts` - Route definitions:
  - `POST /api/disputes` - Create dispute (authenticated predictor)
  - `GET /api/disputes/me` - Get own dispute status
  - `GET /api/admin/disputes` - List all disputes (admin)
  - `GET /api/admin/disputes/counts` - Get counts by status (admin)
  - `PUT /api/admin/disputes/:id` - Update dispute status (admin)
  - `POST /api/admin/disputes/:id/resolve` - Resolve and unblacklist (admin)

**Routes Mounted** (`src/index.ts`)
- Added `/api/disputes` route mounting
- Added `/api/admin/disputes` route mounting

### Design Decisions
- **Disputes have no explanation field** - Admin contacts predictor via preferred method (Telegram/Discord)
- **One dispute per predictor** - Enforced by unique index on predictorAddress
- **Earnings calculation conservative** - Assumes all predictor joins had valid referrals ($15 kept vs $20)

---

## [0.16.8] - 2025-12-06 🖼️ AVATAR URL SECURITY

### Changed
- **Avatar URL Validation** (Security Fix):
  - Only JPG, PNG, and GIF images are now allowed
  - **SVG files are blocked** for security reasons (can contain malicious JavaScript/XSS)
  - Added regex validation: `/\.(jpg|jpeg|png|gif)(\?.*)?$/i`
  - Returns clear error: "Only JPG, PNG, and GIF images are allowed"

### Security
- SVG files can contain embedded `<script>` tags and XSS payloads
- SVG can exploit XML parser vulnerabilities
- GIF files are safe (raster format, pixel data only, no scripting)
- Defense in depth: validated on both frontend and backend

---

## [0.16.7] - 2025-12-06 🔄 REAL-TIME UNIQUENESS VALIDATION

### Added
- **Real-time Field Uniqueness Check Endpoint** (`GET /api/predictors/check-unique`)
  - Query params: `field` (displayName|telegram|discord), `value`, `excludeAddress` (optional)
  - Returns `{ available: boolean }` for real-time form validation
  - Case-insensitive matching for all fields
  - `predictor.routes.ts`: Added `/check-unique` route
  - `predictor.controller.ts`: Added `checkFieldUniqueness` handler
  - `predictor.service.ts`: Added `checkFieldUniqueness` method
  - `predictor.schemas.ts`: Added `checkFieldUniquenessSchema` and `CheckFieldUniquenessQuery` type

### Changed
- **Profile Update Validation** (`predictor.service.ts`)
  - Added Telegram handle uniqueness check (case-insensitive)
  - Added Discord handle uniqueness check (case-insensitive)
  - Added bio URL/link validation (prevents links in bio)
  - Twitter/X is intentionally NOT unique (scam prevention - don't let scammers block legit users)

---

## [0.16.6] - 2025-12-05 📏 SIGNAL CONTENT LIMIT FIX

### Fixed
- **Request Entity Too Large Error**: Reduced signal content character limit from 10,000 to 1,000
  - **Root Cause**: Large signal content caused "request entity too large" error when creating signals
  - **Solution**: Reduced max content length to 1,000 characters (same as description)

### Changed
- Updated `createSignalSchema` content max length from 10,000 to 1,000 characters
- Updated `updateSignalSchema` content max length from 10,000 to 1,000 characters

---

## [0.16.5] - 2025-12-05 ⭐ PERMANENT RATING SYSTEM

### Changed
- **Review System Made Permanent** - Ratings can no longer be updated or deleted:
  - **Routes** (`src/features/reviews/review.routes.ts`):
    - Removed `PUT /reviews/:tokenId` route
    - Removed `DELETE /reviews/:tokenId` route
    - Only `POST /reviews` remains for creating ratings
  - **Service** (`src/features/reviews/review.service.ts`):
    - Removed `update()` method
    - Removed `delete()` method
    - Added documentation noting ratings are permanent
  - **Controller** (`src/features/reviews/review.controller.ts`):
    - Removed `updateReview` controller function
    - Removed `deleteReview` controller function

- **Receipts Check Endpoint Enhanced** (`src/features/receipts/receipt.controller.ts`):
  - `GET /api/receipts/check/:contentId` now returns full receipt data when purchased
  - Includes `tokenId`, `purchasedAt`, `transactionHash` in response
  - Enables frontend rating system to know which tokenId to rate

### Rationale
- **Rating Integrity**: Permanent ratings prevent manipulation
- **Trust**: Users can rely on ratings being authentic and unaltered
- **Fairness**: Predictors cannot be unfairly targeted by rating changes

---

## [0.16.4] - 2025-12-05 🔧 SIGNAL DETAIL PREDICTOR DATA FIX

### Fixed
- **Signal Detail Endpoint** (`src/features/signals/signal.service.ts`):
  - Fixed incomplete predictor data in `getByContentId()` method
  - **Before**: Only returned `displayName`, `avatarUrl`, `averageRating`, `walletAddress`
  - **After**: Now also returns `totalSales`, `totalReviews`, `bio`, `isVerified`, `verificationStatus`
  - **Impact**: PredictorInfoCard on signal detail page now shows correct sales count, reviews, bio, and verified badge

---

## [0.16.3] - 2025-12-05 🖼️ AVATAR URL POLICY CHANGE

### Changed
- **Predictor Profile Updates** (`src/features/predictors/predictor.service.ts`):
  - **All predictors can now set avatar URLs**, not just verified ones
  - Removed `if (!predictor.isVerified)` restriction on avatar URL updates
  - Removed code that cleared `avatarUrl` when unverifying a predictor
  - **Policy**: Abuse of avatar feature = blacklist (reactive moderation vs preventive restriction)

### Rationale
- Verification is primarily for business features (premium placement, trust badges)
- Profile customization (avatar) should be available to all predictors
- Easier for new predictors to build their brand identity from day one
- Admin blacklist provides sufficient abuse prevention

---

## [0.16.2] - 2025-12-05 🔧 OWNER MINT PREDICTOR INDEXING FIX

### Added
- **Webhook Schemas** (`src/features/webhooks/webhook.schemas.ts`):
  - Added `PredictorNFTMinted` event signature to `EVENT_SIGNATURES`
  - Event: `PredictorNFTMinted(address indexed predictor, uint256 indexed tokenId, bool isOwnerMint)`
  - Signature: `0x7cfc4d30050d18b034fe455eba1875eafe455de2dab7696a1fc7f8918d409f12`

- **Webhook Service** (`src/features/webhooks/webhook.service.ts`):
  - Added `handlePredictorNFTMinted()` handler for owner mint events
  - Handler processes mints from `PredictorAccessPass.proposeOwnerMint()` (MultiSig)
  - Only creates predictor record for `isOwnerMint=true` (regular mints handled by `PredictorJoined`)
  - Idempotent: skips if predictor already exists in database

### Changed
- **Minimum Signal Price** reduced from $5 USDT to $1 USDT
  - `src/shared/config/env.ts`: Default `MIN_SIGNAL_PRICE_USDT` changed to 1
  - `.env.example`: Updated example value to 1
  - Must match smart contract value (update via MultiSig `proposeUpdateMinSignalPrice`)

### Fixed
- **Critical Bug**: Predictors minted via MultiSig `proposeOwnerMint` were not being indexed
  - **Root Cause**: Owner mints bypass `SignalFriendMarket.joinAsPredictor()` which emits `PredictorJoined`
  - Owner mints go directly to `PredictorAccessPass` which emits `PredictorNFTMinted`
  - Backend was only listening for `PredictorJoined`, missing owner mints entirely
  - **Impact**: Premium clients minted via MultiSig couldn't use the platform (not recognized as predictors)

- **Price Decimal Validation Bug** (`src/features/signals/signal.schemas.ts`):
  - Fixed bug where prices like 1.1, 5.1, 7.12 were incorrectly rejected
  - **Root Cause**: JavaScript floating-point precision issue (`1.1 * 100 = 110.00000000000001`)
  - **Fix**: Changed from `Number.isInteger(val * 100)` to tolerance-based check

### Technical Details
| Event | Contract | When Emitted |
|-------|----------|--------------|
| `PredictorJoined` | SignalFriendMarket | Regular $20 USDT registration via `joinAsPredictor()` |
| `PredictorNFTMinted` | PredictorAccessPass | ALL mints (both regular and owner mint) |

The fix adds handling for `PredictorNFTMinted` but only processes owner mints (`isOwnerMint=true`) to avoid duplicate predictor creation for regular registrations.

---

## [0.16.1] - 2025-12-04

### Added

#### MainGroup Signal Filtering
- **Signal Schemas** (`src/features/signals/signal.schemas.ts`):
  - Added `mainGroup` query parameter to `listSignalsSchema`
  - Allows filtering signals by category group without selecting a specific subcategory

- **Signal Service** (`src/features/signals/signal.service.ts`):
  - Added `mainGroup` filter support in `getAll()` method
  - When `mainGroup` is provided without `categoryId`, filters signals by their mainGroup field
  - Example: `GET /api/signals?mainGroup=Traditional%20Finance` returns all TradFi signals

---

## [0.16.0] - 2025-12-04 📂 CATEGORY/SUBCATEGORY SYSTEM

### Added
- **Category Model** (`src/features/categories/category.model.ts`):
  - Added `mainGroup` field to Category model for hierarchical categorization
  - Added `MAIN_GROUPS` constant export with: Crypto, Traditional Finance, Macro / Other
  - Updated `DEFAULT_CATEGORIES` with 19 subcategories across 3 main groups:
    - **Crypto** (9): Bitcoin, Ethereum, Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, Other
    - **Traditional Finance** (6): US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, Other
    - **Macro / Other** (4): Economic Data, Geopolitical Events, Sports, Other
  - Changed `name` from unique to compound unique index with `mainGroup`
  - Renamed "Sports Betting Models" to "Sports" for legal compliance

- **Signal Model** (`src/features/signals/signal.model.ts`):
  - Added `mainGroup` field (denormalized from Category for read performance)
  - Added compound index on `isActive` + `mainGroup` for efficient filtering

- **Signal Service** (`src/features/signals/signal.service.ts`):
  - Signal creation now stores `mainGroup` from category for efficient filtering
  - `getByPredictor()` now transforms signals to include `category` object (matching `getAll()` format)
  - Category populate now includes `mainGroup` field in all endpoints

- **Migration Scripts**:
  - `src/scripts/migrateCategories.ts` - Migrate categories to new mainGroup structure
  - `src/scripts/dropOldCategoryIndexes.ts` - Drop old unique index on category name

### Changed
- **Category Schemas** (`src/features/categories/category.schemas.ts`):
  - Added `mainGroup` to create and update schemas

### Migration Guide
```bash
# Step 1: Drop old unique index on category name
npx tsx src/scripts/dropOldCategoryIndexes.ts

# Step 2: Preview migration changes
npx tsx src/scripts/migrateCategories.ts --dry-run

# Step 3: Apply migration
npx tsx src/scripts/migrateCategories.ts
```

---

## [0.15.8] - 2025-12-04 🔧 SALES COUNT MIGRATION SCRIPT

### Added
- **Migration Script** (`src/scripts/recalculateSalesCounts.ts`):
  - Script to recalculate totalSales for all signals and predictors from receipts
  - Aggregates Receipt collection by contentId and predictorAddress
  - Updates Signal.totalSales and Predictor.totalSales based on actual receipt count
  - Also resets signals/predictors with no sales to 0
  - Supports `--dry-run` flag to preview changes without applying them

### Usage
```bash
# Preview changes
npx tsx src/scripts/recalculateSalesCounts.ts --dry-run

# Apply changes
npx tsx src/scripts/recalculateSalesCounts.ts
```

### Why This Script
The sales count fix in v0.15.7 only fixes new purchases. Existing data where sales counts are stuck at 0 needs this migration to recalculate from actual receipt records.

---

## [0.15.7] - 2025-12-04 🛒 HIDE PURCHASED SIGNALS & FIX SALES COUNT

### Added
- **Signal Schemas** (`src/features/signals/signal.schemas.ts`):
  - Added `excludeBuyerAddress` optional query param to list signals endpoint
  - Allows filtering out signals already purchased by a specific wallet address

### Changed
- **Signal Service** (`src/features/signals/signal.service.ts`):
  - `getAll()` now accepts `excludeBuyerAddress` filter
  - Queries Receipt collection to find buyer's purchased contentIds
  - Excludes those signals from the returned list

### Fixed
- **Receipt Service** (`src/features/receipts/receipt.service.ts`):
  - Fixed bug where sales count was always 0 after purchase
  - Line 291: Changed `data.contentId` (bytes32 hash) to `lookupContentId` (UUID)
  - Signal.totalSales now correctly increments on each purchase

### Why These Changes
- **Hide Purchased**: Users don't need to see signals they already own in marketplace
- **Sales Count**: Webhook was receiving bytes32 contentId but trying to update by UUID, so update never matched

---

## [0.15.6] - 2025-12-04 🛡️ SELF-PURCHASE PREVENTION

### Changed
- **Signal Routes** (`src/features/signals/signal.routes.ts`):
  - `GET /api/signals/:contentId/content-identifier` now requires authentication
  - Previously public, now protected to enable self-purchase validation

- **Signal Controller** (`src/features/signals/signal.controller.ts`):
  - `getContentIdentifier` now passes caller's wallet address to service
  - Enables backend to block predictors from purchasing their own signals

- **Signal Service** (`src/features/signals/signal.service.ts`):
  - `getContentIdentifier()` accepts optional `callerAddress` parameter
  - Returns 400 error if caller is the signal's predictor
  - Error message: "You cannot purchase your own signal"

### Why This Change
Predictors should not be able to buy their own signals. While the frontend also blocks this, the backend validation ensures security even if someone bypasses the UI.

---

## [0.15.5] - 2025-12-04 📊 RISK LEVEL & POTENTIAL REWARD

### Added
- **Signal Model** (`src/features/signals/signal.model.ts`):
  - Added `riskLevel` field: "low" | "medium" | "high" (required, indexed)
  - Added `potentialReward` field: "normal" | "medium" | "high" (required, indexed)
  
- **Signal Schemas** (`src/features/signals/signal.schemas.ts`):
  - Added `riskLevel` and `potentialReward` to create signal schema (required)
  - Added `riskLevel` and `potentialReward` to list query params (optional filters)

- **Signal Service** (`src/features/signals/signal.service.ts`):
  - Added filtering support for `riskLevel` and `potentialReward` in `getAll()`
  - Marketplace can now filter signals by risk level and potential reward

- **Migration Script** (`src/scripts/migrateRiskReward.ts`):
  - Created migration to update existing signals with default values (medium/medium)
  - Supports `--dry-run` flag to preview changes without modifying database
  - Run with: `npx tsx src/scripts/migrateRiskReward.ts` or `npx tsx src/scripts/migrateRiskReward.ts --dry-run`

### Migration
- Executed migration: 5 existing signals updated with `riskLevel: "medium"` and `potentialReward: "medium"`

---

## [0.15.4] - 2025-12-04 🏆 SIGNAL SORTING & CATEGORY DISPLAY

### Changed
- **Signal Service** (`src/features/signals/signal.service.ts`):
  - Default sort now prioritizes: `averageRating` (desc) → `totalSales` (desc) → user's preference
  - Best rated signals with most sales appear first in marketplace
  - Added `TransformedSignal` interface for proper typing
  - `getAll()` transforms `categoryId` → `category` and `predictorId` → `predictor`
  - `getByContentId()` applies same transformation for signal detail page
  - Uses `.lean()` for better performance in queries

### Why This Change
- Categories weren't displaying on signal cards because frontend expected `category` but backend returned `categoryId`
- Signals should show best-rated with most sales first to highlight quality content

---

## [0.15.3] - 2025-12-04 🎯 MY SIGNALS PAGE FIX

### Changed
- **Receipt Service** (`src/features/receipts/receipt.service.ts`):
  - `getMyReceipts()` now transforms `signalId` → `signal` in response
  - Nested `categoryId` transformed to `category` for consistency
  - Uses `.lean()` for better performance

### Fixed
- My Signals page showing "Uncategorized" and "Untitled Signal" for purchased signals
- Root cause: Mongoose populate puts data in `signalId` field, frontend expected `signal`

---

## [0.15.2] - 2025-12-04 🔐 AUTH VERIFY RETURNS PREDICTOR

### Changed
- **Auth Service** (`src/features/auth/auth.service.ts`):
  - `verify()` now returns predictor data along with JWT token
  - Looks up predictor by wallet address after signature verification
  - Returns `{ token, predictor }` instead of `{ token, address }`
  - Predictor is `null` if user is not a registered predictor

- **Auth Types** (`src/features/auth/auth.types.ts`):
  - Added `AuthPredictor` interface for predictor data in auth responses
  - Updated `VerifyResponse` to include `predictor: AuthPredictor | null`
  - Removed `address` from response (frontend gets it from predictor or JWT)

- **Signal Schema** (`src/features/signals/signal.schemas.ts`):
  - Added max 2 decimal places validation for `priceUsdt` field

### Why This Change
The frontend needs predictor data immediately after login to:
1. Store in auth state for route guards
2. Persist to localStorage for session restoration
3. Avoid extra API call to fetch predictor profile

Previously, the frontend had to call `/api/predictors/:address` after login to get predictor data, and on page refresh the predictor data was lost because it wasn't persisted.

---

## [0.15.1] - 2024-12-04 🔧 MISSING PREDICTORS SCRIPT

### Added
- **Missing Predictors Script** (`src/scripts/seedMissingPredictors.ts`):
  - Seeds predictor records for wallets registered on-chain before webhooks were connected
  - Fetches token IDs from blockchain using `getPredictorTokenId()` contract function
  - Supports `--dry-run` flag to preview changes
  - Run with: `npx tsx src/scripts/seedMissingPredictors.ts`
  - Run preview: `npx tsx src/scripts/seedMissingPredictors.ts --dry-run`

### Fixed
- 6 missing predictor records can now be added to MongoDB for wallets that registered before webhook setup

---

## [0.15.0] - 2024-12-03 ⏰ SIGNAL EXPIRY FEATURE

### Added
- **Signal Expiry System**
  - `expiresAt: Date` field added to Signal model (required)
  - `expiryDays` parameter in create signal schema (1-30 days max)
  - Signals automatically filtered from marketplace when expired
  - Compound index on `{ isActive: 1, expiresAt: 1 }` for efficient queries

- **Migration Script** (`src/scripts/migrateSignalExpiry.ts`):
  - Adds `expiresAt` to existing signals (30 days from creation date)
  - Run with: `npx tsx src/scripts/migrateSignalExpiry.ts`

- **Purchase Protection**:
  - `getContentIdentifier` blocks expired signals (400 error)
  - `getContentIdentifier` blocks inactive/deactivated signals (400 error)
  - Prevents on-chain purchase attempts for unavailable signals

### Changed
- **Signal Model** (`src/features/signals/signal.model.ts`):
  - Added required `expiresAt: Date` field
  - Added index on `expiresAt` for query performance

- **Signal Schema** (`src/features/signals/signal.schemas.ts`):
  - Added `expiryDays` to `createSignalSchema` (integer, 1-30)
  
- **Signal Service** (`src/features/signals/signal.service.ts`):
  - `create()` calculates `expiresAt` from `expiryDays`
  - `getAll()` filters out expired signals when `active=true`
  - `getContentIdentifier()` validates signal is active and not expired
  - Added `expiresAt` to `PublicSignal` interface

### Business Rules
- Predictors must set expiry when creating signals (1-30 days)
- Predictors can deactivate signals at any time (`isActive: false`)
- Expired/deactivated signals are hidden from marketplace (not deleted)
- Buyers cannot purchase expired or deactivated signals
- Buyers who purchased before expiry/deactivation retain access
- Keeps marketplace fresh with time-sensitive content

---

## [0.14.0] - 2024-12-03 📡 CONTENT IDENTIFIER ENDPOINT

### Added
- **Content Identifier Endpoint**
  - `GET /api/signals/:contentId/content-identifier` - Public endpoint
  - Returns bytes32 hex string needed for on-chain `buySignalNFT` call
  - Converts UUID contentId to bytes32 format
  - Added `getContentIdentifier` controller function
  - Added route in `signal.routes.ts`

### Technical Details
- Frontend needs bytes32 to call `SignalFriendMarket.buySignalNFT()`
- UUID format: `a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5`
- Bytes32 format: `0xa1b2c3d4e5f64a7b8c9de0f1a2b3c4d5000000000000000000000000`

---

## [0.13.0] - 2024-12-02 🚧 MAINTENANCE MODE & TESTING

### Added
- **Maintenance Mode**
  - `MAINTENANCE_MODE` environment variable (default: false)
  - `MAINTENANCE_END` optional ETA timestamp
  - `src/shared/middleware/maintenance.ts` - Middleware that blocks all requests
  - Returns 503 Service Unavailable with optional ETA during maintenance
  - Health check endpoint (`/health`) always accessible

### Changed
- `src/shared/config/env.ts` - Added maintenance mode configuration
- `src/index.ts` - Added maintenance middleware after rate limiter
- `.env.example` - Added maintenance mode documentation

### Tested
- ✅ Manual API testing completed (December 2024)
  - Health check endpoint
  - Categories endpoint (database queries)
  - Predictors endpoint (with new verification fields)
  - Signals endpoint
  - Auth nonce generation
- All core endpoints verified working

---

## [0.12.0] - 2024-12-02 ✅ PREDICTOR VERIFICATION SYSTEM

### Added
- **Predictor Verification**
  - New fields in Predictor model: `isVerified`, `verificationStatus`, `salesAtLastApplication`, `verificationAppliedAt`, `displayNameChanged`
  - Verification status can be: `none`, `pending`, `rejected`
  - Predictors with 100+ sales can apply for verification badge
  - Rejected predictors need 100 MORE sales to re-apply

- **Verification Endpoints**
  - `POST /api/predictors/:address/apply-verification` - Apply for verification (100+ sales)
  - `GET /api/admin/verification-requests` - List pending applications (admin)
  - `POST /api/admin/predictors/:address/verify` - Approve verification (admin)
  - `POST /api/admin/predictors/:address/reject` - Reject verification (admin)
  - `POST /api/admin/predictors/:address/unverify` - Remove verification (admin)

- **Avatar Restrictions**
  - Only verified predictors can set `avatarUrl`
  - Non-verified predictors get 403 error when trying to set avatar
  - Unverifying a predictor automatically removes their avatar

- **Display Name Locking**
  - Display name can only be changed ONCE (then locked forever)
  - Display names must be unique (case-insensitive)
  - Added unique index with case-insensitive collation

### Changed
- `predictor.model.ts` - Added verification fields and displayNameChanged flag
- `predictor.service.ts` - Added verification methods, updated updateProfile() with restrictions
- `predictor.controller.ts` - Added applyForVerification handler
- `predictor.routes.ts` - Added apply-verification route
- `admin.controller.ts` - Added verification management handlers
- `admin.routes.ts` - Added verification management routes

---

## [0.11.0] - 2024-12-02 🔐 ADMIN FEATURES

### Added
- **Admin Middleware**
  - `src/shared/middleware/admin.ts` - Admin authentication middleware
  - `isAdmin(address)` helper to check if wallet is in admin list
  - `requireAdmin` middleware requiring MultiSig wallet authentication
  - Configured via `ADMIN_ADDRESSES` environment variable (comma-separated)

- **Admin API Endpoints**
  - `GET /api/admin/predictors/:address` - Get full predictor info with hidden contacts
  - `POST /api/admin/predictors/:address/blacklist` - Blacklist predictor in database
  - `POST /api/admin/predictors/:address/unblacklist` - Remove blacklist from database
  - `DELETE /api/admin/signals/:contentId` - Deactivate signal (soft delete)
  - All endpoints require authentication from one of 3 MultiSig wallet addresses

- **Admin Signal Access**
  - Admins can view any signal's protected content without purchasing
  - Bypass added to `SignalService.getProtectedContent()`

- **Admin Feature Module**
  - `src/features/admin/admin.controller.ts` - Request handlers
  - `src/features/admin/admin.routes.ts` - Route definitions
  - `src/features/admin/index.ts` - Module exports

### Changed
- **Hidden Contact Info from Public API**
  - `telegram`, `discord`, and `preferredContact` now hidden from public responses
  - Only `twitter` visible to regular users in predictor profiles
  - Affects `getAll()`, `getByAddress()`, `getTopPredictors()` in PredictorService
  - Admins can still access full contact info via admin endpoints

- **Predictor Service**
  - Added `HIDDEN_FIELDS` constant for excluded fields
  - Added `getByAddressAdmin()` - returns full predictor info
  - Added `adminBlacklist()` - sets `isBlacklisted = true`
  - Added `adminUnblacklist()` - sets `isBlacklisted = false`

- **Signal Service**
  - Added `adminDeactivate()` - sets `isActive = false` for admin removal
  - Updated `getProtectedContent()` with admin bypass

- **Environment Configuration**
  - Added `ADMIN_ADDRESSES` to `env.ts` (comma-separated list)
  - Updated `.env.example` with admin addresses documentation

### Notes
- Blacklist operations require manual on-chain MultiSig transaction for full effect
- Admin should contact predictor via their preferred contact method to explain signal removal
- All 3 MultiSig wallet addresses have equal admin privileges

---

## [0.10.0] - 2024-12-02 🎯 PREDICTOR ENHANCEMENTS

### Added
- **Preferred Contact Field**
  - Added `preferredContact` field to Predictor model (`telegram` | `discord`)
  - Allows admin to know how to contact predictors for moderation
  - Defaults to `telegram`
  - Can be updated via `PUT /api/predictors/:address`

- **Earnings Endpoint**
  - `GET /api/predictors/:address/earnings` - Get predictor's earnings breakdown
  - Returns: `totalSalesRevenue`, `predictorEarnings` (95%), `platformCommission` (5%), `totalSalesCount`
  - Requires authentication - only predictor can view their own earnings
  - Aggregates data from Receipt collection

- **Configurable Minimum Signal Price**
  - Added `MIN_SIGNAL_PRICE_USDT` environment variable (default: 5)
  - Signal creation validates against this value
  - To change: update `.env` and restart (must match smart contract)

### Changed
- `predictor.model.ts` - Added `preferredContact` enum field
- `predictor.schemas.ts` - Added `preferredContact` to update schema
- `predictor.service.ts` - Added `getEarnings()` method, updated `updateProfile()`
- `predictor.controller.ts` - Added `getPredictorEarnings` handler
- `predictor.routes.ts` - Added `GET /:address/earnings` route
- `signal.schemas.ts` - Now uses `env.MIN_SIGNAL_PRICE_USDT` for validation
- `env.ts` - Added `MIN_SIGNAL_PRICE_USDT` config
- `.env.example` - Added `MIN_SIGNAL_PRICE_USDT` documentation

---

## [0.9.0] - 2024-12-XX 📝 REVIEWS ENHANCEMENT & REPORTS FEATURE

### Added
- **Report Feature** (New)
  - Complete reporting system for buyers to flag scam/false signals
  - `src/features/reports/report.model.ts` - MongoDB model with status workflow
  - `src/features/reports/report.schemas.ts` - Zod validation schemas
  - `src/features/reports/report.service.ts` - Business logic with CRUD operations
  - `src/features/reports/report.controller.ts` - Express request handlers
  - `src/features/reports/report.routes.ts` - API route definitions
  - Report reasons: `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`
  - Status workflow: `pending` → `reviewed` → `resolved` / `dismissed`
  - One report per purchase (unique `tokenId` constraint)

- **Report API Endpoints**
  - `POST /api/reports` - Create a report (authenticated, must own Receipt)
  - `GET /api/reports/mine` - Get user's submitted reports
  - `GET /api/reports/signal/:contentId` - Get reports for a specific signal
  - `GET /api/reports/predictor/:address` - Get reports against a predictor
  - `GET /api/reports/predictor/:address/stats` - Get report statistics
  - `GET /api/reports/check/:tokenId` - Check if report exists for tokenId

### Changed
- **Review Model Simplified to Rating-Only**
  - Removed `reviewText` field from `IReview` interface
  - Removed `reviewText` from Mongoose schema
  - Updated `createReviewSchema` and `updateReviewSchema` (Zod)
  - Updated `ReviewService` - removed `reviewText` from create/update methods
  - Reviews are now pure ratings (1-5 score) as per original PROJECT.md spec
  - Comments/text moved to separate Report feature for flagging issues

- **Documentation Updated**
  - `README.md` - Added Reports API section, clarified Reviews as "Ratings"
  - Clarified that ratings are off-chain only (no `markSignalRated` on-chain)

### Technical Notes
- Reports are separate from ratings - users can rate AND report
- Report validation requires Receipt ownership (same as reviews)
- Reports are for moderation/flagging; ratings are for reputation
- No on-chain component for reviews/ratings (purely off-chain feature)

---

## [0.8.0] - 2024-12-01 🎯 WEBHOOK INTEGRATION COMPLETE

### Added
- **GraphQL Webhook Support**
  - Support for Alchemy Custom (GraphQL) webhooks alongside Address Activity
  - Discriminated union schema for webhook payload types
  - `processGraphqlWebhook()` method for GraphQL payload processing
  - Log normalization for unified event processing

- **ContentId Format Conversion**
  - New `src/shared/utils/contentId.ts` utility module
  - `uuidToBytes32()` - Convert UUID to bytes32 for smart contract calls
  - `bytes32ToUuid()` - Convert bytes32 back to UUID for MongoDB lookups
  - Seamless bridge between backend UUID format and on-chain bytes32 format

- **Signal ContentIdentifier Endpoint**
  - `SignalService.getContentIdentifier()` - Returns bytes32 for frontend to use in `buySignalNFT` calls
  - Enables frontend to get the on-chain compatible content identifier

- **Database Seeding Scripts**
  - `src/scripts/seedTestSignal.ts` - Create test signals for webhook testing

### Changed
- **`receipt.service.ts`** - Enhanced contentId handling
  - Automatically converts bytes32 to UUID when processing blockchain events
  - Supports both UUID and bytes32 formats for signal lookups

- **`webhook.service.ts`** - GraphQL webhook support
  - Routes to appropriate processor based on webhook type
  - Handles both `event.data.block.logs[]` (GraphQL) and `event.activity[]` (Address Activity)

- **`webhook.schemas.ts`** - Extended payload schemas
  - Added `GraphqlWebhookPayload` and `GraphqlWebhookLog` schemas
  - Discriminated union for type-safe payload handling

### Tested
- ✅ **PredictorJoined** - Creates Predictor record in MongoDB
- ✅ **SignalPurchased** - Creates Receipt record, links to Signal via UUID conversion
- ✅ **PredictorBlacklisted** - Updates Predictor.isBlacklisted status

### Technical Notes
- USDT on BNB Chain uses **18 decimals** (not 6 like Ethereum USDT)
- GraphQL webhooks provide richer data structure with transaction context
- ContentId conversion: `00000000-0000-0000-0000-000000000001` ↔ `0x0000000000000000000000000000000100000000...`

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
