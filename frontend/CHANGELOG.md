# 📝 SignalFriend Frontend - Changelog

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.9.6] - 2025-12-04

### Fixed

#### Public Signal Detail Page (Unauthenticated Access)
- **usePurchase Hook** (`src/features/signals/hooks/usePurchase.ts`):
  - Added `isAuthenticated` and `_hasHydrated` checks from `useAuthStore`
  - Added `hasToken` check against localStorage to prevent stale state issues
  - Updated `useCheckPurchase`, `useSignalContent`, `useMyReceipts`, and `useContentIdentifier`
  - All protected API queries now wait for auth store hydration before enabling
  - Prevents 401 errors that would redirect unauthenticated users away from public pages

- **API Client** (`src/shared/api/apiClient.ts`):
  - Updated 401 response interceptor to not redirect for public endpoints
  - Added `isPublicEndpoint` check for `/signals`, `/categories`, `/predictors`
  - Excludes `/content` endpoint which requires authentication
  - Only auto-logout for protected endpoints

#### Price Input Decimal Handling
- **CreateSignalModal** (`src/features/predictors/components/CreateSignalModal.tsx`):
  - Changed price input from `type="number"` to `type="text"` with `inputMode="decimal"`
  - Fixed bug where trailing zeros/decimals were blocked (e.g., 8.3, 8.30)
  - Added custom `onKeyDown` handler to filter invalid characters
  - Uses `setValueAs` to convert string to number on form submit
  - Blocks comma input, users must use period for decimals

#### SignalCard Layout Consistency
- **SignalCard** (`src/features/signals/components/SignalCard.tsx`):
  - Removed description from card (description shown on detail page only)
  - Changed container to `flex flex-col h-full` for consistent card heights
  - Added `mt-auto` to footer to push it to bottom regardless of content length
  - Added `min-h-[3.5rem]` to title for consistent title area height
  - Added `whitespace-nowrap` to expiry and sales text to prevent wrapping
  - Footer elements (price, expiry, sales) now align consistently across all cards

- **Expiry Display** (`getExpiryInfo` function):
  - Changed from verbose "Expires in about 8 hours" to compact "Expires in 8h"
  - Uses abbreviated time units: `d` (days), `h` (hours), `m` (minutes)
  - Prevents text wrapping that caused inconsistent card heights
  - Clearer and more scannable format

### Why These Changes
- **Public Access**: Signal detail pages should be viewable without logging in
- **Stale Auth State**: Queries could fire before auth store hydrated from localStorage, causing spurious 401s
- **Price Decimals**: `type="number"` with `valueAsNumber` strips trailing decimals on each keystroke
- **Card Layout**: Variable content lengths and long expiry text caused footer elements to appear at different heights

---

## [0.9.5] - 2025-12-04

### Fixed

#### Hide Purchased Signals from Marketplace
- **SignalsPage** (`src/features/signals/pages/SignalsPage.tsx`):
  - When user is connected, marketplace excludes signals they've already purchased
  - Uses `excludeBuyerAddress` query param to filter out owned signals
  - Unauthenticated users still see all available signals

- **SignalFilters Schema** (`src/shared/schemas/signal.schemas.ts`):
  - Added `excludeBuyerAddress` optional field for hiding purchased signals

- **Signals API** (`src/features/signals/api/signals.api.ts`):
  - Updated `buildQueryString` to include `excludeBuyerAddress` param

#### Inactive Signal Handling
- **PurchaseCard** (`src/features/signals/components/PurchaseCard.tsx`):
  - Added `isActive` prop to detect deactivated signals
  - Disables purchase button with "Signal Unavailable" message
  - Shows info that signal has been deactivated by the predictor

#### CreateSignalModal Duration Slider
- **CreateSignalModal** (`src/features/predictors/components/CreateSignalModal.tsx`):
  - Fixed text overlap on duration slider for values >= 10 days
  - Increased min-width from 80px to 100px for day count display

#### Consistent Potential Reward Colors
- **SignalCard** (`src/features/signals/components/SignalCard.tsx`):
  - Changed badge colors to warm theme: fur-cream / fur-light / fur-main
- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Changed badge colors to match SignalCard and FilterPanel

### Why These Changes
- **Hide Purchased**: Users shouldn't see signals they already own in the marketplace
- **Inactive Signals**: Users were able to start approval but purchase would fail
- **Duration Slider**: "11 days", "12 days" etc. was getting clipped
- **Color Consistency**: All potential reward indicators now use the same warm color palette

---

## [0.9.4] - 2025-12-04

### Fixed

#### Self-Purchase Prevention
- **PurchaseCard** (`src/features/signals/components/PurchaseCard.tsx`):
  - Added `isOwnSignal` prop to detect if current user is the signal's predictor
  - Disables purchase button with "This Is Your Signal" message
  - Shows info message directing predictors to view from dashboard

- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Added wallet address check to detect if user is the signal owner
  - Passes `isOwnSignal` prop to PurchaseCard
  - Predictors can still view their own signal content (for preview)

#### Potential Reward Filter Colors
- **FilterPanel** (`src/features/signals/components/FilterPanel.tsx`):
  - Fixed color mismatch between filter buttons and SignalCard badges
  - Filter colors now match signal card badge colors:
    - Normal: Gray (was cream)
    - Medium: Blue (was golden)
    - High: Purple (was orange)

### Why These Changes
- **Self-Purchase**: Predictors should not be able to buy their own signals. This is enforced on both frontend (disabled button) and backend (API rejection).
- **Color Consistency**: Users selecting "High" reward in filters expected to see purple badges on cards, but previously the filter button was orange and cards showed purple. Now they match.

---

## [0.9.3] - 2025-12-04

### Added

#### Risk Level & Potential Reward for Signal Creation
- **Create Signal Modal** (`src/features/predictors/components/CreateSignalModal.tsx`):
  - Added Risk Level selection: Low / Medium / High (button group)
  - Added Potential Reward selection: Normal / Medium / High (button group)
  - Both fields are required when creating a signal
  - Styled to match existing modal design

- **Signal Schema** (`src/shared/schemas/signal.schemas.ts`):
  - Added `riskLevel` field: "low" | "medium" | "high" (required)
  - Added `potentialReward` field: "normal" | "medium" | "high" (required)

### Why This Change
- Filters for risk level and potential reward existed in the UI but signals couldn't be created with these values
- Now predictors can properly categorize their signals by risk and reward levels
- Users can filter the marketplace by these criteria

---

## [0.9.2] - 2025-12-04

### Fixed

#### My Signals Page - "Untitled Signal" and "Uncategorized" Bug
- **Problem**: Purchased signals on My Signals page showed "Untitled Signal" and "Uncategorized" instead of actual data.
- **Root Cause**: Backend populated `signalId` field via Mongoose, but frontend expected `signal` field.
- **Solution**: Backend now transforms `signalId` → `signal` and nested `categoryId` → `category` in receipt responses.
- **Backend PR**: fix/my-signals-display

#### Signal Category Not Displaying on Signal Cards
- **Problem**: Signal cards in marketplace and detail page weren't showing category badges.
- **Root Cause**: Backend returned `categoryId` (populated object), frontend expected `category`.
- **Solution**: Backend now transforms `categoryId` → `category` and `predictorId` → `predictor` in signal responses.
- **Backend PR**: fix/signal-category-and-filters

### Changed

#### Default Signal Sorting
- Signals now sorted by: `averageRating` (desc) → `totalSales` (desc) → user's preference
- Best rated signals with most sales appear first in marketplace
- No UI changes required - handled by backend

---

## [0.9.1] - 2025-12-04

### Fixed

#### Protected Signal Content Not Showing After Purchase
- **Problem**: After purchasing a signal, the "Signal Content" section showed "No additional content available" instead of the actual protected content.
- **Root Cause**: `SignalDetailPage` was passing `signal.content` to `SignalContent` component, but the `/api/signals/:contentId` endpoint returns public data only (excludes `content` field for security).
- **Solution**: Added new API function and hook to fetch protected content separately.

**Files Changed:**
- `src/features/signals/api/purchase.api.ts`:
  - Added `fetchSignalContent()` function to call `/api/signals/:contentId/content`
  - Added `SignalContentResponse` interface
  
- `src/features/signals/hooks/usePurchase.ts`:
  - Added `useSignalContent()` hook that fetches protected content only when user owns the signal
  - Added `content` key to `purchaseKeys` factory

- `src/features/signals/pages/SignalDetailPage.tsx`:
  - Added `useSignalContent` hook to fetch protected content when `isOwned=true`
  - Passes `contentData?.content` to `SignalContent` instead of `signal.content`
  - Added `purchaseKeys.content` invalidation on purchase success

---

## [0.9.0] - 2025-12-04

### Added

#### Predictor Dashboard
Complete dashboard for predictors to manage their signals and view statistics.

- **PredictorDashboardPage** (`src/features/predictors/pages/PredictorDashboardPage.tsx`):
  - Dashboard stats overview (total signals, active signals, total sales, earnings, rating)
  - My Signals grid with filter tabs (All/Active/Inactive)
  - Signal management actions (view, deactivate, reactivate)
  - Create Signal button (available to all predictors)
  - Verification status display with badge
  - Empty state with CTA to create first signal
  - Loading skeletons for better UX

- **DashboardStats** (`src/features/predictors/components/DashboardStats.tsx`):
  - Four-card stats grid (signals, sales, earnings, rating)
  - Star rating display with review count
  - Active/inactive signal breakdown
  - Loading state with skeleton animation

- **MySignalCard** (`src/features/predictors/components/MySignalCard.tsx`):
  - Signal card for dashboard with status indicators
  - Stats display (price, sales, earnings)
  - Expiry tracking with warning for soon-to-expire signals
  - Action buttons (view, deactivate/reactivate)
  - Hover effects for action visibility

- **CreateSignalModal** (`src/features/predictors/components/CreateSignalModal.tsx`):
  - Full form for creating new signals
  - Title, description, and protected content fields
  - Category selection dropdown
  - Price input with validation ($5 minimum)
  - Expiry duration slider (1-30 days)
  - Price breakdown showing buyer cost and predictor earnings
  - Character counters for text fields
  - Form validation with Zod + React Hook Form
  - Loading and error states

- **Predictor API Functions** (`src/features/predictors/api/`):
  - `fetchMyProfile()` - Get current predictor profile
  - `fetchPredictorByAddress()` - Get predictor by wallet
  - `fetchMySignals()` - Get predictor's signals with filters
  - `fetchPredictorEarnings()` - Get earnings breakdown
  - `updatePredictorProfile()` - Update profile fields
  - `applyForVerification()` - Apply for verified badge
  - `createSignal()` - Create new signal
  - `updateSignal()` - Update existing signal
  - `deactivateSignal()` - Soft delete signal
  - `reactivateSignal()` - Restore deactivated signal

- **Predictor Hooks** (`src/features/predictors/hooks/`):
  - `useMySignals()` - Fetch own signals with React Query
  - `useMyEarnings()` - Fetch earnings breakdown
  - `usePredictorProfile()` - Fetch predictor profile
  - `useUpdateProfile()` - Mutation for profile updates
  - `useApplyForVerification()` - Mutation for verification
  - `useCreateSignal()` - Mutation for signal creation
  - `useUpdateSignal()` - Mutation for signal updates
  - `useDeactivateSignal()` - Mutation for deactivation
  - `useReactivateSignal()` - Mutation for reactivation
  - `predictorKeys` - Query key factory for caching

- **Auth Session Sync** (`src/features/auth/api/authHooks.ts`):
  - `useSessionSync()` - Validates stored token on page refresh
  - Handles wagmi reconnection race condition
  - Clears auth if token expired or wallet changed
  - Prevents redirect flash on protected routes

- **Session Validation API** (`src/features/auth/api/authApi.ts`):
  - `validateSession()` - Check if current JWT is still valid
  - Uses new `AUTH_ME` endpoint

### Changed

- **Router** (`src/router/index.tsx`):
  - Replaced placeholder with real `PredictorDashboardPage`
  - Route `/dashboard` now shows predictor dashboard
  - Route `/dashboard/create-signal` redirects to dashboard

- **Modal Component** (`src/shared/components/ui/Modal.tsx`):
  - Added '2xl' size option (max-w-2xl) for larger forms
  - Made modal content scrollable with `max-h-[90vh]`
  - Improved layout with flex-col and flex-shrink-0 for header
  - Content area now uses `overflow-y-auto` and `flex-1`

- **ProtectedRoute Guard** (`src/router/guards/ProtectedRoute.tsx`):
  - Added loading state during wallet reconnection
  - Uses `useSessionSync` to validate auth before redirect
  - Shows spinner while reconnecting/validating

- **PredictorRoute Guard** (`src/router/guards/PredictorRoute.tsx`):
  - Added loading state during wallet reconnection
  - Uses `useSessionSync` to validate auth before redirect
  - Shows spinner while reconnecting/validating
  - Waits for Zustand store hydration before redirect decisions

- **Auth Store** (`src/features/auth/store/authStore.ts`):
  - Added `_hasHydrated` flag to track localStorage rehydration
  - Derives `isAuthenticated` from token on rehydration
  - Properly persists and restores predictor data

- **Predictor Schema** (`src/shared/schemas/predictor.schemas.ts`):
  - Updated to match backend response structure
  - Added `_id`, `tokenId`, `socialLinks`, `categoryIds` fields
  - Made `verificationStatus` optional for compatibility

- **API Config** (`src/shared/config/api.config.ts`):
  - Added `AUTH_ME` endpoint for session validation
  - Fixed `PREDICTOR_SIGNALS` endpoint path

- **Signal Schema** (`src/shared/schemas/signal.schemas.ts`):
  - Added max 2 decimal places validation for price input

- **CreateSignalModal** (`src/features/predictors/components/CreateSignalModal.tsx`):
  - Blocks comma key input in price field (enforces period for decimals)
  - Updated placeholder to "5.00" with helper text

### Fixed

- **Auth persistence on page refresh**: Fixed issue where predictor data was lost after refresh. The backend `/api/auth/verify` endpoint now returns predictor data along with the JWT token, which gets properly persisted and restored from localStorage.

- **Route guard race condition**: Fixed redirect flash on page refresh by waiting for both wagmi reconnection AND Zustand hydration before making auth decisions.

- **Modal sizing**: CreateSignalModal now uses `size="2xl"` for better form display with all fields visible.

- **Price validation**: Prevents entering prices with more than 2 decimal places on both frontend and backend.

### File Structure

```
src/features/predictors/
├── api/
│   ├── index.ts
│   ├── predictors.api.ts    # Profile & stats API
│   └── signals.api.ts       # Signal CRUD API
├── components/
│   ├── index.ts
│   ├── DashboardStats.tsx   # Stats cards component
│   ├── MySignalCard.tsx     # Signal card for dashboard
│   └── CreateSignalModal.tsx # Create signal form modal
├── hooks/
│   ├── index.ts
│   └── usePredictorDashboard.ts # React Query hooks
├── pages/
│   ├── index.ts
│   └── PredictorDashboardPage.tsx
├── types/
└── index.ts                 # Feature barrel export
```

### Notes

- All predictors can create signals (verification is for extra privileges only)
- Verified predictors get a badge and future premium features
- Signals can be deactivated but not deleted (preserves buyer access)
- Expired signals cannot be reactivated
- Platform takes 5% commission on signal sales

---

## [0.8.2] - 2025-12-03

### Added

#### My Purchased Signals Page
Complete page for users to view and manage their purchased signals.

- **MyPurchasedSignalsPage** (`src/features/signals/pages/MyPurchasedSignalsPage.tsx`):
  - Grid display of all user's purchased signals (receipts)
  - Sort options: newest first, oldest first, highest price, lowest price
  - Empty state with CTA to browse marketplace
  - Loading skeleton for better UX
  - Error handling with user-friendly messages
  - Marketplace CTA for users with existing purchases

- **PurchasedSignalCard** (`src/features/signals/components/PurchasedSignalCard.tsx`):
  - Displays purchased signal info with "Owned" badge
  - Shows: signal title, category, purchase date, price paid, token ID, predictor address
  - "View Signal" button links to signal detail page (unlocked content)
  - "View TX" button links to BSCScan transaction

- **useMyReceipts Hook** (`src/features/signals/hooks/usePurchase.ts`):
  - React Query hook to fetch user's purchase receipts
  - Supports pagination and sorting parameters
  - Query key factory pattern for cache management
  - Only enabled when user is connected

### Changed

- **Router** (`src/router/index.tsx`):
  - Replaced placeholder page with real `MyPurchasedSignalsPage`
  - Route `/my-signals` now shows purchased signals (requires auth)

- **Components Index** (`src/features/signals/components/index.ts`):
  - Added export for `PurchasedSignalCard`

- **Pages Index** (`src/features/signals/pages/index.ts`):
  - Added export for `MyPurchasedSignalsPage`

### Notes

- Navigation link "My Signals" already exists in Header (for authenticated users)
- Clicking "View Signal" on a purchased signal shows unlocked content on detail page
- Transaction hash links to BSC Testnet explorer

---

## [0.8.1] - 2025-12-03

### Fixed

#### Signal Expiry System - Complete Implementation
Fixed critical bug where all signals incorrectly showed as "Expired" and implemented full signal expiration system.

- **Root Cause**: `SignalCard` was using `createdAt` (always in the past) with expiry logic
- **Solution**: Implemented proper `expiresAt` field throughout the stack with 1-30 day expiry requirement

### Changed

- **SignalCard** (`src/features/signals/components/SignalCard.tsx`):
  - Now uses real `expiresAt` field from API
  - Shows "Expires in X days" for active signals
  - Shows "Expired" with red styling for expired signals
  - Exported `getExpiryInfo()` utility function for reuse
  - Removed unused `getCreatedText()` function

- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Added expiry date display in Signal Details section
  - Shows "Expired" badge for expired signals (separate from "Inactive")
  - Properly passes `isExpired` to PurchaseCard

- **Signal Schema** (`src/shared/schemas/signal.schemas.ts`):
  - Made `expiresAt` required in signal schema
  - Updated `createSignalSchema` to use `expiryDays` (1-30 days)
  - Added `content` field for signal creation
  - Aligned with backend field requirements

### Notes

- Expired signals are hidden from marketplace but accessible via direct URL
- Buyers who purchased before expiry can still view content
- Backend blocks purchase attempts on expired/inactive signals

---

## [0.8.0] - 2025-12-03

### Added

#### Purchase Flow
Complete implementation for users to purchase signals through smart contract interaction.

- **Contract ABIs** (`src/shared/config/abis/index.ts`):
  - `SIGNAL_FRIEND_MARKET_ABI` - buySignalNFT, fee calculations, events
  - `ERC20_ABI` - approve, allowance, balanceOf for USDT
  - Minimal ABIs containing only functions needed by frontend

- **Purchase API Functions** (`src/features/signals/api/purchase.api.ts`):
  - `fetchContentIdentifier()` - Get bytes32 for on-chain purchase
  - `checkPurchase()` - Check if user owns a signal
  - `fetchMyReceipts()` - Get user's purchase history

- **API Config Updates** (`src/shared/config/api.config.ts`):
  - Added `SIGNAL_CONTENT_IDENTIFIER` endpoint
  - Added `RECEIPTS_MINE`, `RECEIPTS_CHECK`, `RECEIPTS_STATS` endpoints

- **Purchase Hooks** (`src/features/signals/hooks/usePurchase.ts`):
  - `useCheckPurchase()` - Query hook to check signal ownership
  - `useContentIdentifier()` - Query hook to fetch bytes32 content ID
  - `useUSDTBalance()` - Read USDT balance with wagmi
  - `useUSDTAllowance()` - Read USDT allowance for market contract
  - `useApproveUSDT()` - Write hook to approve USDT spending
  - `useBuySignal()` - Write hook to execute buySignalNFT
  - `usePurchaseFlow()` - Combined hook managing entire purchase flow

- **PurchaseModal Component** (`src/features/signals/components/PurchaseModal.tsx`):
  - Multi-step purchase flow modal
  - Step indicators (pending, active, complete, error states)
  - Balance check with warning for insufficient funds
  - USDT approval step with progress indication
  - Purchase execution with transaction confirmation
  - Success/error states with clear messaging
  - Responsive and accessible design

### Changed

- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Integrated `useCheckPurchase` hook for real ownership detection
  - Added `showPurchaseModal` state and modal rendering
  - Added `handlePurchaseSuccess` callback for post-purchase refresh
  - PurchaseCard now triggers modal on click
  - Cache invalidation on successful purchase

### Backend Changes (included in this feature)

- **Content Identifier Endpoint** (`backend/src/features/signals/`):
  - Added `getContentIdentifier` controller function
  - Added `GET /api/signals/:contentId/content-identifier` route
  - Returns bytes32 hex string needed for on-chain purchase

---

## [0.7.0] - 2025-12-03

### Added

#### Signal Detail Page
Complete detail page for viewing individual signals with purchase flow preparation.

- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Full signal information display with responsive layout
  - Breadcrumb navigation (Marketplace → Category → Signal)
  - Risk level and potential reward badges (color-coded with icons)
  - Signal metadata: created date, expiry, buyers count, signal ID
  - Error state with "Signal Not Found" message
  - Loading state with skeleton

- **SignalDetailSkeleton** (`src/features/signals/components/SignalDetailSkeleton.tsx`):
  - Animated placeholder matching detail page layout
  - Shows skeleton for header, details, content, and sidebar

- **PredictorInfoCard** (`src/features/signals/components/PredictorInfoCard.tsx`):
  - Predictor avatar with initials fallback
  - Display name with verification badge
  - Stats: total sales, average rating (5-star), total reviews
  - Bio preview (if available)
  - Link to predictor profile page

- **PurchaseCard** (`src/features/signals/components/PurchaseCard.tsx`):
  - Large price display in USDT
  - Dynamic button states based on auth status:
    - Not connected: "Connect Wallet to Purchase"
    - Not signed in: "Sign In to Purchase"
    - Ready: "Purchase Signal"
    - Owned: "View Full Content"
    - Expired: "Signal Expired"
  - Purchase benefits list (instant access, NFT receipt, secure)
  - Context-aware helper messages

- **SignalContent** (`src/features/signals/components/SignalContent.tsx`):
  - Locked state for non-owners:
    - Lock icon with "Content Locked" message
    - Price to unlock badge
    - Teaser cards showing what's included
  - Unlocked state for owners:
    - Full signal content display
    - Analysis & reasoning section
    - "Unlocked" badge indicator

- **Share Card**:
  - Copy link button
  - Twitter share button

- **Router Update**:
  - `/signals/:contentId` now renders `SignalDetailPage`

### Changed
- Updated components barrel export to include detail page components
- Updated pages barrel export to include SignalDetailPage

### Fixed

#### Schema Alignment with Backend
Fixed frontend type definitions to match actual backend API response fields.

- **Signal Schema** (`src/shared/schemas/signal.schemas.ts`):
  - `title` instead of `name`
  - `priceUsdt` instead of `priceUSDT`
  - `predictorAddress` instead of `predictorWallet`
  - `totalSales` instead of `totalBuyers`
  - `isActive` instead of `status`/`expiresAt`
  - `content` instead of `fullContent`
  - Added `_id`, `predictorId`, `averageRating`, `totalReviews`, `updatedAt`

- **SignalCard Component**:
  - Updated to use `signal.title`, `signal.priceUsdt`, `signal.predictorAddress`
  - Uses `signal.isActive` for status badge
  - Shows `signal.totalSales` instead of `totalBuyers`

- **SignalDetailPage**:
  - Updated all field references to match backend
  - Removed expiry-based logic (backend uses `isActive`)
  - Fixed predictor wallet address reference

- **API Sort Mapping** (`src/features/signals/api/signals.api.ts`):
  - `priceUsdt` (lowercase) for price sorting
  - `totalSales` for popularity sorting

- **Backend Seed Script** (`backend/src/scripts/seedTestSignal.ts`):
  - Changed test contentId to valid UUID v4 format
  - Old: `00000000-0000-0000-0000-000000000001` (invalid)
  - New: `a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5` (valid UUID v4)

---

## [0.6.0] - 2025-12-03

### Added

#### Signal Marketplace Page
Complete marketplace page for browsing and filtering trading signals.

- **API Functions** (`src/features/signals/api/signals.api.ts`):
  - `fetchSignals()` - Paginated signals with filters
  - `fetchSignalById()` - Single signal by contentId
  - `fetchCategories()` - All active categories
  - `fetchSignalsByPredictor()` - Signals by predictor address
  - Query string builder for filter parameters

- **React Query Hooks** (`src/features/signals/hooks/useSignals.ts`):
  - `useSignals()` - Fetch signals with filters and caching
  - `useSignal()` - Fetch single signal with caching
  - `useCategories()` - Fetch categories (long cache time)
  - Query key factories for cache invalidation

- **SignalCard** (`src/features/signals/components/SignalCard.tsx`):
  - Displays signal name, description, category
  - Risk level and potential reward badges (color-coded)
  - Predictor info with verification badge
  - Price in USDT, expiry time, buyer count
  - Hover animations and link to detail page
  - Safe handling of null/undefined values

- **FilterPanel** (`src/features/signals/components/FilterPanel.tsx`):
  - Category dropdown (grouped by mainGroup)
  - Risk level toggle buttons (green/yellow/red)
  - Potential reward toggle buttons (warm golden tones)
  - Price range inputs (min/max) with dark theme
  - Sort by dropdown (newest, price, popular)
  - Reset filters button
  - Logo-inspired color scheme

- **SignalGrid** (`src/features/signals/components/SignalGrid.tsx`):
  - Responsive 1-3 column grid layout
  - Loading skeleton animation (dark theme)
  - Empty state with friendly message
  - Error state with message display

- **Pagination** (`src/features/signals/components/Pagination.tsx`):
  - Previous/Next buttons
  - Page number buttons with ellipsis
  - Results summary text
  - Scroll to top on page change
  - Golden accent for active page

- **SignalsPage** (`src/features/signals/pages/SignalsPage.tsx`):
  - Combines all components into marketplace
  - URL-synced filters (shareable/bookmarkable)
  - Mobile-friendly collapsible filter panel
  - Page header with description

- **Barrel exports**:
  - `src/features/signals/api/index.ts`
  - `src/features/signals/hooks/index.ts`
  - `src/features/signals/components/index.ts`
  - `src/features/signals/pages/index.ts`
  - `src/features/signals/index.ts`

### Fixed
- Date parsing errors with `date-fns` (graceful handling of invalid dates)
- Null/undefined safety in SignalCard for all signal properties
- Color scheme now uses proper theme colors (dark-600, dark-800, dark-900, fur-cream, fur-light)

### Changed
- Router now renders `SignalsPage` at `/signals` route
- PROJECT_CONTEXT.md updated to 55% completion
- All marketplace components use logo-inspired color palette

---

## [0.5.0] - 2025-12-03

### Added

#### Landing Page Implementation
Complete marketing landing page with logo-inspired theme (warm greens, golden tones).

- **HeroSection** (`src/features/home/components/HeroSection.tsx`):
  - Main tagline: "Trusted Signals. Verified Predictors. Your Edge in Crypto."
  - Value proposition description
  - Dual CTA buttons (Browse Signals / Become a Predictor)
  - Trust indicators (USDT, BNB Chain, Smart Contract security)
  - Cute doggy mascot logo integration

- **FeaturesSection** (`src/features/home/components/FeaturesSection.tsx`):
  - 6-card responsive grid layout
  - Key features: Verified Predictors, Auto Refunds, NFT Receipts, Multi-Category, Transparent Reviews, Secure Payments
  - Emoji icons with themed styling

- **HowItWorksSection** (`src/features/home/components/HowItWorksSection.tsx`):
  - Tab-based UI switching between Buyer and Predictor flows
  - Buyer journey: 5 numbered steps with icons
  - Predictor journey: 4 numbered steps with icons
  - Clean vertical timeline design

- **CTASection** (`src/features/home/components/CTASection.tsx`):
  - Final conversion-focused CTA
  - Platform statistics preview (signals, predictors, earnings)
  - Dual action buttons

- **HomePage** (`src/features/home/pages/HomePage.tsx`):
  - Combines all sections into cohesive landing page
  - Comprehensive JSDoc documentation

- **Barrel exports**:
  - `src/features/home/components/index.ts`
  - `src/features/home/pages/index.ts`
  - `src/features/home/index.ts`

### Changed
- Router now renders `HomePage` at root path instead of placeholder
- PROJECT_CONTEXT.md updated to 50% completion

---

## [0.4.0] - 2025-12-03

### Added

#### Route Guards for Protected Pages
- **ProtectedRoute** - Authentication guard:
  - Requires wallet connection (RainbowKit)
  - Requires SIWE authentication (JWT obtained)
  - Redirects to home with message if not authenticated
  - Passes `from` path in state for redirect after login
- **AdminRoute** - Admin-only guard:
  - Extends ProtectedRoute requirements
  - Checks wallet address against admin whitelist
  - Shows "Access Denied" message for non-admins
- **PredictorRoute** - Predictor-only guard:
  - Extends ProtectedRoute requirements
  - Checks if user is registered predictor
  - Optional `requireVerified` prop for verified predictors only
  - Shows verification pending message if not verified
- **Route guards barrel export** - `src/router/guards/index.ts`

### Changed
- `/my-signals` now uses ProtectedRoute
- `/profile` now uses ProtectedRoute
- `/dashboard` now uses PredictorRoute
- `/dashboard/create-signal` now uses PredictorRoute with `requireVerified`
- `/admin` now uses AdminRoute
- Added `/become-predictor` route (ProtectedRoute)
- Router JSDoc updated with new route structure and guard hierarchy

---

## [0.3.0] - 2025-12-03

### Added

#### Comprehensive JSDoc Documentation
- **UI Components** - All components documented with:
  - Module description and feature list
  - Usage examples with code snippets
  - Props reference and variants
  - Accessibility notes
  - Styling information
- **Auth Feature** - Complete documentation for:
  - `useAuth` hook with authentication flow diagram
  - `authApi` functions with response format
  - `AuthButton` with state transition diagram
  - `authStore` with selector patterns
- **Providers** - Each provider documented with:
  - Configuration details
  - Nesting requirements
  - Usage examples
- **Config Files** - Documentation for:
  - Environment variables and setup
  - API endpoints and naming conventions
  - Wagmi/RainbowKit configuration
  - Contract addresses per chain
- **Hooks & Utils** - Documented with:
  - Use cases and examples
  - Return values
  - Security notes where applicable
- **Types & Schemas** - Explained:
  - Zod schema architecture
  - Type inference patterns
  - Usage with forms and API calls

### Changed
- PROJECT_CONTEXT.md updated to 40% completion
- All barrel exports now include comprehensive module documentation

---

## [0.2.0] - 2025-12-03

### Added

#### Complete SIWE Authentication Flow
- **AuthButton Component** - Smart button handling full auth lifecycle:
  - Shows RainbowKit ConnectButton when wallet not connected
  - Shows "Sign In" button after wallet connection (pre-auth)
  - Shows user address with "Sign Out" after authentication
  - Error display for failed authentication attempts
- **SIWE Message Format** - Proper Sign-In with Ethereum message:
  - Domain, URI, nonce, chainId included
  - Statement: "Sign in to SignalFriend - Web3 Signal Marketplace"
- **Auth API Integration** - Proper response unwrapping for backend API
- **Header Updates** - Nav links (My Signals, Dashboard) only show when authenticated

### Changed
- `useAuth` hook now uses React Query mutation for better async state handling
- Header uses `AuthButton` instead of raw RainbowKit `ConnectButton`
- Auth API functions properly unwrap `{ success, data }` response format

### Fixed
- CORS configuration updated in backend `.env` (port 5173 for Vite)

---

## [0.1.0] - 2025-12-03

### Added

#### Project Setup
- Initialized Vite + React + TypeScript project
- Configured Tailwind CSS with logo-inspired theme
- Set up ESLint and TypeScript configurations
- Added path alias `@/` for clean imports

#### Logo-Inspired Color Theme
- Custom color palette extracted from cute doggy mascot logo
- Warm forest greens for backgrounds (`#2D5030`, `#1E3A20`)
- Golden/cream tones for text (`#FBE3A8`, `#F4C56A`)
- Logo red for errors/accents (`#C63732`)
- Logo green for success states (`#4A7D4B`)
- Goggle grays for muted elements (`#A4AAB5`)

#### Web3 Integration
- Added wagmi v2 for React Ethereum hooks
- Added viem v2 for blockchain interactions
- Added RainbowKit v2 for wallet connection UI
- Configured BNB Chain (Mainnet + Testnet) support
- Created wagmi config with WalletConnect project ID

#### Providers
- `Web3Provider` - Wagmi + RainbowKit with dark theme
- `QueryProvider` - TanStack Query with optimized defaults
- `SentryProvider` - Error boundary with error tracking

#### Base UI Components
- `Button` - Primary, secondary, danger, ghost, outline variants
- `Input` - With label, error, and helper text support
- `Textarea` - Multi-line input with same features
- `Select` - Dropdown with custom styling
- `Card` - Container with header, content, footer sub-components
- `Modal` - Accessible dialog with portal rendering
- `Badge` - Status indicators with color variants
- `Spinner` / `PageLoader` - Loading indicators
- `Avatar` - User avatars with fallback to initials

#### Shared Utilities
- `cn()` - Class name utility for conditional classes
- `formatAddress()` - Shorten wallet addresses
- `formatUSD()` - Currency formatting
- `formatRelativeTime()` - "2 hours ago" style dates
- `getTimeRemaining()` - Countdown formatting

#### Configuration
- Environment configuration (`env.ts`)
- API configuration with endpoint definitions
- Contract addresses for BNB Chain
- Wagmi + RainbowKit chain configuration

#### API Layer
- Axios client with JWT interceptor
- Automatic token attachment to requests
- Global error handling (401, 503)

#### State Management
- Auth store with Zustand + persistence
- JWT token and predictor profile storage

#### Routing
- React Router v7 setup
- Root layout with header and footer
- Navigation header with RainbowKit ConnectButton
- Cute doggy logo in header and footer
- Placeholder pages for all routes

#### Zod Schemas
- `api.schemas.ts` - API response wrappers
- `auth.schemas.ts` - Authentication types
- `category.schemas.ts` - Category types
- `predictor.schemas.ts` - Predictor types
- `signal.schemas.ts` - Signal types with filters
- `review.schemas.ts` - Review types
- `receipt.schemas.ts` - SignalKey NFT receipt types

#### Hooks
- `useAuth` - Authentication with SIWE flow

#### Documentation
- README.md with setup instructions
- PROJECT_CONTEXT.md with architecture details
- CHANGELOG.md (this file)
- RUNBOOK.md placeholder
- TO-DO-FRONTEND.txt with phase planning

---

## [Unreleased]

### Planned
- Landing page with hero section
- Signal marketplace page with filters
- Predictor profile pages
- Purchase flow with wallet integration
- My Signals (purchased signals) page
- Predictor dashboard for creating signals
- Admin panel for moderation
- `useAuth` - Complete authentication hook with SIWE flow

#### Documentation
- README.md with detailed setup instructions
- PROJECT_CONTEXT.md for AI/developer reference
- CHANGELOG.md (this file)
- RUNBOOK.md (placeholder)
- TO-DO-FRONTEND.txt with pending tasks

---

## [Unreleased]

### Planned
- Landing/Home page
- Signal marketplace with filters
- Predictor profile pages
- Signal purchase flow (smart contract interaction)
- My Signals page (purchased signals)
- Predictor dashboard (create signals, view stats)
- Admin panel for MultiSig holders
