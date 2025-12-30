# Changelog

All notable changes to the SignalFriend backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.33.0] - 2025-12-30 🔮 PREDICTION MARKETPLACE PIVOT (Phase 2 & 3: Schema + Categories)

### Changed

**Signal Schema - Prediction Market Focus**
- Removed `riskLevel` field (was: Low/Medium/High/Very High)
- Removed `potentialReward` field (was: Low/Medium/High/Very High)
- Added `confidenceLevel` (1-100%, required) - Predictor's confidence in prediction
- Added `eventUrl` (optional, max 500 chars) - Link to Polymarket/Predict.fun event
- Changed `expiresAt` validation: Now accepts ISO date string, 1-90 days from creation (was 1-2 days via expiryDays)

**Signal Filters**
- Removed `riskLevel` filter parameter
- Removed `potentialReward` filter parameter
- Added `minConfidence` filter (1-100)
- Added `maxConfidence` filter (1-100)

**Category Restructure (6 Main Groups, 33 Subcategories)**
- **Crypto** (7): Bitcoin, Ethereum, Altcoins, DeFi, NFTs/Gaming, Meme Coins, Other
- **Finance** (5): Stocks, Forex, Commodities, Earnings, Other
- **Politics** (5): US Elections, World Politics, Policy, Legal, Other
- **Sports** (7): Football, American Football, Basketball, Combat Sports, Horse Racing, Esports, Other
- **World** (5): Geopolitics, Economy, Climate/Weather, Science, Other
- **Culture** (5): Entertainment, Awards, Tech/AI, Social Media, Other

**Seed Logic Improvements**
- Auto-detect category schema changes on startup
- Automatically reseed when category count changes (19 → 33)
- Detects new mainGroup values and triggers reseed
- Safe for normal restarts (won't reseed if schema unchanged)

### Technical
- Updated `signal.model.ts`: New fields, removed old enums
- Updated `signal.schemas.ts`: New validation schemas
- Updated `signal.service.ts`: New filter logic for confidence
- Updated `category.model.ts`: 6 main groups, 33 prediction-focused subcategories
- Updated `seedOnStartup.ts`: Smart category change detection

---

## [0.32.0] - 2025-12-29 ⏱️ SIGNAL EXPIRY LIMIT REDUCED

### Changed

**Signal Expiration Duration**
- Reduced maximum signal expiration from 7 days to 2 days
- Trading signals are time-sensitive; most become invalid after 2 days
- Improves signal quality and protects buyers from stale signals
- Existing signals with longer expiry will age naturally (no migration needed)

### Technical
- Updated `createSignalSchema` in `signal.schemas.ts`:
  - `expiryDays`: `.max(7)` → `.max(2)`
  - Updated JSDoc comment to reflect new limit

---

## [Unreleased]

### In Progress
- Production deployment to Render (v0.30.0)

### Planned
- Docker configuration
- Redis-based rate limiting for horizontal scaling

### Note
- Admin blacklist via smart contract integration is now handled entirely on the frontend (v0.11.0), calling `proposeBlacklist()` directly on the PredictorAccessPass smart contract

---

## [0.31.0] - 2025-12-23 📊 SIGNAL STATUS FILTER API

### Added

**Signal Status Filter Parameter**
- New `status` query parameter for `/api/signals` endpoint
- Supports three values:
  - `active` (default): Only active signals that haven't expired
  - `inactive`: Signals that are deactivated OR expired
  - `all`: No status filtering, returns all signals
- Backward compatible with existing `active` boolean parameter (deprecated)

### Changed

**Signal Service Query Logic**
- Updated `getAll` method to handle new `status` parameter
- `inactive` status uses `$or` filter: `{ isActive: false } OR { expiresAt <= now }`
- `all` status removes both `isActive` and `expiresAt` filters
- Maintains backward compatibility: `active=true` still works as before

### Technical
- Updated `listSignalsSchema` with new `status` enum validation
- New `status` parameter takes precedence over deprecated `active` parameter

---

## [0.30.0] - 2025-12-17 📦 PRODUCTION DEPLOYMENT PREPARATION

### Added

**Deployment Documentation**
- Created comprehensive `DEPLOYMENT_RENDER.md` guide
  - Step-by-step Render setup instructions
  - Environment variables configuration
  - Custom domain setup with Cloudflare
  - Alchemy webhook configuration
  - Testing and troubleshooting guides
  - Cost estimation and scaling recommendations

**Production Readiness**
- All environment variables documented for production
- MongoDB Atlas integration guide ready
- Rate limiting verified for production workload
- Security checklist completed
- Webhook signature validation enforced in production

### Notes
- Backend is production-ready for Render deployment
- 290 tests passing ✅
- Security score: 93/100 ✅
- CI/CD pipeline active ✅

---

## [0.29.0] - 2025-12-15 🚀 BSC MAINNET DEPLOYMENT

### Added

**BSC Mainnet Smart Contracts**
- Successfully deployed all SignalFriend smart contracts to BSC Mainnet (Chain ID: 56)
- **SignalFriendMarket**: `0xaebec2cd5c2db4c0875de215515b3060a7a652fb`
- **PredictorAccessPass**: `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07`
- **SignalKeyNFT**: `0x2a5f920133e584773ef4ac16260c2f954824491f`
- **USDT Token**: `0x55d398326f99059fF775485246999027B3197955` (BSC native USDT)
- **Treasury**: `0x76e3363f7aF2e46DFdb4824FA143264E58884e1b`

**MultiSig Configuration**
- 3 signers configured for admin operations:
  - `0x38f4B0DcA1d681c18D41543f6D78bd4B018578B11`
  - `0xa2AD948278cA7018f8c05e1A995575AeF3B02EAB`
  - `0x62E3Ba865c11f911A83E01771105E4edbc4Bf148`

### Technical Details
- Deployment timestamp: 1765823707
- Deployment commit: caccc15
- Block: `0x44701cb`
- Total gas used: ~12M across all contracts
- Deployer: `0xa1f3589515d0946fe249fd115472526dde9680cc`

### Changed
- Production environment now targets BSC Mainnet (Chain ID: 56)
- Contract addresses configuration updated for mainnet deployment

---

## [0.28.2] - 2025-12-13 🔒 SECURITY AUDIT & CI/CD

### Added

**CI/CD Pipeline**
- New `.github/workflows/ci.yml` - GitHub Actions workflow
- Runs backend tests: TypeScript compilation, ESLint, Vitest (290 tests)
- Runs frontend build: TypeScript compilation, ESLint, production build
- Parallel execution for faster CI runs
- Triggers on push/PR to main and develop branches

**Security Audit Documentation**
- Created comprehensive `AUDIT.md` with full security assessment
- Security score: 93/100 - PRODUCTION READY
- Documented all rate limiting coverage across endpoints
- Added Alchemy webhook protection summary

**Complete Rate Limiting Coverage**
- Added `writeRateLimiter` to all admin POST/PUT/DELETE routes
- Added `writeRateLimiter` to dispute admin routes
- All 25+ endpoints now have appropriate rate limiting

### Changed

- `admin.routes.ts` - All write operations now rate-limited
- `dispute.routes.ts` - Admin dispute routes now rate-limited
- `SetupWebhooks.md` - Updated with exact working GraphQL query
- `RUNBOOK.md` - Added CI/CD documentation section

### Security

- Full endpoint audit completed
- Rate limiting verified: read (100/15min), write (20/15min), auth (10/15min)
- Webhook signature verification enforced in production
- No security vulnerabilities identified

---

## [0.28.1] - 2025-12-13 🔒 SECURITY: REQUIRE WEBHOOK SIGNING KEY IN PRODUCTION

### Changed

**Production Security Enforcement**
- `ALCHEMY_SIGNING_KEY` is now **REQUIRED** in production mode
- Server will refuse to start in `NODE_ENV=production` without the signing key
- Prevents accidental deployment without webhook signature verification
- Clear error message directs to Alchemy dashboard for key retrieval

**Development Flexibility**
- Added `SKIP_WEBHOOK_SIGNATURE` environment variable (default: `false`)
- When set to `true` in development mode, allows local testing without Alchemy webhooks
- This flag is **IGNORED** in production - signature verification is always enforced

**Improved Webhook Logging**
- Clearer warning when signature verification is skipped (dev only)
- Added warning log for signature mismatch (possible spoofing attempt)

### Updated
- `.env.example` with documentation about production requirement and `SKIP_WEBHOOK_SIGNATURE`

### Security
- This change prevents spoofed webhook attacks in production
- Attackers cannot forge fake `SignalPurchased` or `PredictorJoined` events
- Development mode allows optional bypass for local testing convenience

---

## [0.28.0] - 2025-12-12 🧪 COMPREHENSIVE BACKEND TESTING

### Added

**Unit Tests (277 tests)**
- `contentId.test.ts` - 33 tests for UUID ↔ bytes32 conversion functions
- `textValidation.test.ts` - 46 tests for URL detection, stripping, and validation
- `ApiError.test.ts` - 24 tests for custom error class with factory methods
- `auth.service.test.ts` - 11 tests for SIWE nonce generation and cleanup
- `predictor.schemas.test.ts` - 55 tests for predictor Zod validation schemas
- `signal.schemas.test.ts` - 64 tests for signal CRUD validation schemas
- `review.schemas.test.ts` - 44 tests for rating/review validation schemas

**Integration Tests (13 tests)**
- `testApp.ts` - Minimal Express app factory for integration testing
- `health.test.ts` - 5 tests for health check endpoint
- `errorHandling.test.ts` - 8 tests for 404 handling and error response format

**Dependencies**
- Added `supertest` and `@types/supertest` for HTTP integration testing

### Fixed

**Global Regex State Bug in textValidation.ts**
- Fixed inconsistent URL detection due to global regex flag (`/g`)
- Added `URL_REGEX.lastIndex = 0` reset before each test
- Bug caused `containsUrl()` to return alternating true/false for same input

### Technical Details

**Test Coverage:**
- Utilities: `contentId.ts`, `textValidation.ts`, `ApiError.ts`
- Schemas: `predictor.schemas.ts`, `signal.schemas.ts`, `review.schemas.ts`
- Services: `auth.service.ts`
- API: Health endpoint, 404 handling, error response format

**Test Results:**
- 9 test files, 290 tests passing
- Test duration: ~1.13s

---

## [0.27.0] - 2025-12-12 🔧 VERIFICATION SYSTEM FIX

### Fixed

**Profile Update - Social Links Data Loss on Refetch**
- Fixed telegram and discord fields being cleared after profile update
- Issue: `GET /api/predictors/:address` uses `HIDDEN_FIELDS` to exclude private contact info, but Dashboard refetch after update would overwrite auth store with incomplete data
- Solution: Added `optionalAuth` middleware to the route - when authenticated user views their own profile, backend returns full data including private fields
- Modified files: `predictor.service.ts`, `predictor.controller.ts`, `predictor.routes.ts`

**Verification Application Receipt Count Consistency**
- Fixed verification application failing due to `predictor.totalSales` vs receipt count mismatch
- Backend now uses `earnings.totalSalesCount` (actual receipt count) as source of truth
- This matches frontend display logic and ensures consistency across the application
- Updated `applyForVerification()` to use receipt count instead of `predictor.totalSales`
- Updated `adminRejectVerification()` to record receipt count in `salesAtLastApplication`

**Modified Predictor Stats Script**
- Fixed `modifyPredictorStats.ts` to create receipts based on target sales count, not revenue
- Script now properly syncs `predictor.totalSales` with actual receipt count
- Prevents mismatch between displayed stats and verification eligibility

### Technical Details

**Root Cause:**
- Frontend displayed sales count from earnings API (receipt count)
- Backend verification checked `predictor.totalSales` field (stale/unsynced value)
- Test script created receipts based on revenue calculation, not sales target
- This caused "100 sales shown but only 2 counted" bug

**Solution:**
- All verification logic now uses `earnings.totalSalesCount` (receipt count)
- Script creates exact number of receipts to match target sales count
- `predictor.totalSales` synced for consistency but no longer used in verification logic

---

## [0.26.0] - 2025-12-12 🧪 PRE-DEPLOYMENT TESTING & BUG FIXES

### Added

**Verification Reapplication Progress Tracking**
- Added `earningsAtLastApplication` field to Predictor model
- Predictors can now track incremental progress toward reapplication requirements after rejection
- Dashboard shows "Additional Sales" and "Additional Earnings" since rejection
- System validates BOTH sales AND earnings requirements for reapplication eligibility

**Script Improvements**
- `checkPredictorStats.ts` now supports CLI arguments:
  - `--address=<wallet>` to check specific predictor
  - `--list` to show all predictors with stats
  - Removed hardcoded wallet addresses
- Deleted redundant `fixPredictorStats.ts` (functionality covered by `modifyPredictorStats.ts`)

### Changed

**CORS Multiple Origins Support**
- `security.ts` middleware now properly parses comma-separated `ALLOWED_ORIGINS` env var
- Added `parseOrigins()` utility function to split origins into array
- Supports multiple frontend domains for production deployment

**Rate Limits - Production Values**
- Updated production-ready rate limit values:
  - `AUTH_NONCE`: 100/15min (was 60/15min)
  - `AUTH_VERIFY`: 50/15min (was 20/15min)
  - `READ`: 300/1min (was 200/1min)
  - `WRITE`: 100/15min (was 60/15min)
  - `CRITICAL`: 500/15min (unchanged)
- Updated `.env` `RATE_LIMIT_MAX_REQUESTS` to 500

**Verification Date Mapping**
- `admin.controller.ts` now maps `verificationAppliedAt` to `verificationRequestedAt` for frontend compatibility
- Fixes "Invalid time value" error in admin verification requests page

**Verification Rejection Flow**
- Rejection logic now records BOTH `salesAtLastApplication` AND `earningsAtLastApplication` at rejection time
- Application logic NO LONGER updates baseline values on reapplication (only on rejection)
- Reapplication eligibility check now validates BOTH sales AND earnings requirements
- Prevents re-rejected predictors from seeing inflated "progress since rejection"

### Fixed

**Verification Date Display Bug**
- Admin verification page was showing "Invalid time value" for verification requested dates
- Fixed by mapping `verificationAppliedAt` → `verificationRequestedAt` in admin controller

**Incomplete Profile Handling**
- Admin verification card was crashing on predictors with missing social links
- Backend now ensures proper optional field handling in admin endpoints

### Documentation

**RUNBOOK Updates**
- Added comprehensive rate limiting test documentation
- Documented test scripts usage (`seed:signals`, `predictor:stats`, etc.)
- Added examples for predictor stats modification workflow

---

## [0.25.0] - 2025-12-11 🛠️ MISCELLANEOUS IMPROVEMENTS & SECURITY

### Added

**Webhook Security Enhancements**
- Timestamp validation for webhooks (rejects events >5 minutes old)
- `ProcessedWebhookEvent` model for idempotency protection (prevents replay attacks)
- TTL index auto-deletes processed events after 24 hours
- `validateTimestamp()` method in webhook service
- Comprehensive RUNBOOK documentation for webhook security

**Test Signal Seeding Script**
- New `seedTestSignals.ts` script for bulk test data generation
- Supports `--count=100` or `--count=500` flags
- `--dry-run` mode for previewing without database changes
- `--clear` flag to remove existing seeded signals first
- Realistic data generation with proper category distribution
- npm scripts: `seed:signals`, `seed:signals:100`, `seed:signals:500`

**Predictor Stats Modification Script**
- New `modifyPredictorStats.ts` for testing verification flow
- `--list` flag to show all predictors with their stats
- `--address=0x...` to target specific predictor
- `--sales=N` and `--revenue=N` to set verification-ready stats
- `--reset` flag to clear stats back to zero
- Creates mock receipts with `0xMOCK_VERIFICATION_TEST_` prefix
- npm scripts: `predictor:stats`, `predictor:stats:list`, `predictor:verify-ready`

**Rate Limiting Test Script**
- New `/scripts/test-rate-limits.sh` for comprehensive rate limit testing
- Tests all tiers: auth nonce, auth verify, read, write, critical
- Supports custom base URL parameter
- RUNBOOK documentation with expected results

**Environment Configuration**
- Organized `.env` file with clear sections and comments
- Production values documented (commented out) for easy switching
- Mainnet local testing MongoDB URI option added
- Removed unused maintenance mode env vars (frontend-only feature)

### Changed

**Webhook Service**
- Added timestamp validation before processing events
- Added idempotency check using `ProcessedWebhookEvent` model
- Events are now deduplicated by `eventId` (transaction hash + log index)

**.gitignore Enhancements**
- Added private key patterns (`*.pem`, `*.key`, `private*`)
- Added backup file patterns (`*.bak`, `*.backup`)
- Added additional sensitive file patterns

### Security
- Webhook replay attack protection via timestamp + idempotency
- Sensitive file patterns added to .gitignore
- Real Alchemy API key replaced with placeholder in .env
- Sentry DSN safety comment added to frontend .env

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
- All core endpoints verified
