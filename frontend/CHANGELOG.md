<!-- filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/frontend/CHANGELOG.md -->
# Changelog

All notable changes to the SignalFriend frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Signal outcome tracking
- Predictor leaderboards
- Advanced filtering

---

## [0.2.1] - 2025-12-05 🔧 PREDICTOR SYNC & AUTH ERROR FIX

### Fixed
- **Dashboard Redirect Loop**: Fixed issue where new predictors were redirected to home page when accessing dashboard
  - **Root Cause**: `PredictorRoute` was calling `clearAuth()` when detecting NFT but no predictor record, which set `isAuthenticated=false` and triggered redirect to home before re-auth could complete.
  - **Solution**: Removed automatic `clearAuth()` call. Instead, show a "Sign In to Activate" prompt that lets user manually trigger re-authentication without clearing current auth state first.

- **Dashboard "Syncing" Loop**: Fixed issue where predictor dashboard was stuck on "Syncing Your Account..." message
  - **Root Cause**: After minting NFT, the auth store had old data (no predictor record). Query invalidation didn't help because predictor data comes from SIWE login, not a separate query.
  - **Solution**: `PredictorRoute` now detects NFT ownership and prompts user to sign in again to get fresh predictor data from backend.

- **Auth Sign-In Rejection Error**: Added user-friendly error handling for wallet signature rejection
  - Previously showed raw `UserRejectedRequestError` in console
  - Now shows "Sign In Cancelled" with friendly message
  - **Root Cause**: `PredictorRoute` was calling `logout()` which clears auth AND disconnects wallet
  - **Solution**: Now uses `clearAuth()` from auth store directly, which only clears auth state without disconnecting wallet

### Changed
- **PredictorRoute Guard** (`src/router/guards/PredictorRoute.tsx`):
  - Added NFT ownership check as fallback for backend sync delays
  - Shows "Sign In to Activate" button when NFT detected but no predictor record
  - Auto-triggers re-authentication flow when NFT is detected
  - Uses `useAuth` hook for re-authentication instead of query invalidation

- **useAuth Hook** (`src/features/auth/api/authHooks.ts`):
  - Added `parsedError` field with user-friendly error messages
  - Added `isUserRejection` boolean for UI conditional styling
  - Added `resetError` function to clear error state
  - Uses shared `parseWalletError` utility for consistent error handling

- **BecomePredictorPage** (`src/features/predictors/pages/BecomePredictorPage.tsx`):
  - `AuthPromptContent` now accepts and displays auth errors
  - Shows yellow "cancelled" styling for user rejections vs red for real errors

---

## [0.2.0] - 2025-12-05 🚀 BECOME A PREDICTOR FLOW

### Added
- **BecomePredictorPage** (`src/features/predictors/pages/BecomePredictorPage.tsx`):
  - Complete registration flow for becoming a predictor
  - Benefits overview (earn from signals, build reputation, referral rewards, NFT pass)
  - USDT balance check with clear messaging for insufficient funds
  - Optional referral toggle with address input (supports URL param `?ref=0x...`)
  - Multi-step flow: Review → Approve USDT (if needed) → Register → Success
  - Step indicator showing progress
  - Wallet error handling with user-friendly messages
  - Auto-redirect to dashboard after successful registration
  - Detection of existing predictor status (shows "Already a Predictor" message)
  - **Public access with auth prompt**: Page is accessible without authentication
    - Shows "Connect Wallet" prompt for disconnected users
    - Shows "Sign In" prompt for connected but unauthenticated users
    - User-friendly error messages for sign-in rejection (yellow warning, not red error)
    - Shows full registration flow only for authenticated users

- **useBecomePredictor Hook** (`src/features/predictors/hooks/useBecomePredictor.ts`):
  - `usePredictorNFTBalance` - Check if user owns PredictorAccessPass NFT
  - `usePlatformParameters` - Read join fee from contract
  - `useUSDTBalanceForPredictor` - Check USDT balance
  - `useUSDTAllowanceForPredictor` - Check USDT allowance for market contract
  - `useApproveUSDTForPredictor` - Approve USDT spending
  - `useJoinAsPredictor` - Call joinAsPredictor contract method
  - `useBecomePredictor` - Combined hook for complete flow
  - **Delayed cache invalidation pattern**: Uses `useEffect` with multiple timeouts
    (2s, 5s, 10s) to handle webhook processing delays and API rate limits
    (same pattern as `usePurchase.ts` - see PATTERN REFERENCE below)

- **Contract ABIs** (`src/shared/config/abis/index.ts`):
  - Added `PREDICTOR_ACCESS_PASS_ABI` with `balanceOf` function
  - Added `joinAsPredictor` to `SIGNAL_FRIEND_MARKET_ABI`
  - Added `getPlatformParameters` to `SIGNAL_FRIEND_MARKET_ABI`
  - Added `PredictorJoined` event to `SIGNAL_FRIEND_MARKET_ABI`

- **PredictorRoute Guard Enhancement** (`src/router/guards/PredictorRoute.tsx`):
  - Now checks NFT ownership on-chain as fallback when backend record doesn't exist
  - Shows "Syncing Your Account..." message when NFT owned but webhook hasn't processed
  - Auto-refreshes predictor data with delayed invalidations (2s, 5s, 10s)
  - Prevents redirect loop when user has NFT but backend hasn't synced yet

- **Auth Error Handling** (`src/features/auth/api/authHooks.ts`):
  - Added `parsedError` field with user-friendly title and message
  - Added `isUserRejection` flag to differentiate user cancellation from errors
  - Added `resetError` function to clear error state
  - Sign-in rejection now shows yellow warning instead of scary red error

### Changed
- Updated router to use real `BecomePredictorPage` (was placeholder)
- Removed `ProtectedRoute` wrapper from `/become-predictor` route (page handles auth internally)
- Updated hooks barrel export to include new become-predictor hooks

### Fixed
- **Bug**: Dashboard redirect loop when user mints NFT but backend webhook hasn't processed
  - **Root Cause**: `PredictorRoute` only checked backend predictor record, not NFT ownership
  - **Solution**: Added on-chain NFT check as fallback, show sync message while waiting

- **Bug**: Raw technical error shown when user rejects sign-in request
  - **Root Cause**: `useAuth` returned raw error without parsing
  - **Solution**: Added `parseWalletError` to return user-friendly messages

### Technical Notes

#### PATTERN REFERENCE: Delayed Cache Invalidation for Webhook Delays

When blockchain transactions succeed but the backend webhook hasn't processed yet
(due to rate limits or slow processing), the UI won't reflect the new state.

**Solution**: Use `useEffect` with multiple delayed `queryClient.invalidateQueries()` calls:

```typescript
// In useBecomePredictor.ts and usePurchase.ts
useEffect(() => {
  if (isJoinConfirmed) {
    // Immediate invalidation
    queryClient.invalidateQueries({ queryKey: ['predictor'] });
    
    // Delayed invalidations for webhook processing
    const timeouts = [
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['predictor'] }), 2000),
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['predictor'] }), 5000),
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['predictor'] }), 10000),
    ];
    
    return () => timeouts.forEach(clearTimeout);
  }
}, [isJoinConfirmed]);
```

**Why this works**:
1. Blockchain confirmation is instant, but webhook may be delayed
2. Multiple retries at 2s, 5s, 10s ensure we catch the update
3. React Query's `invalidateQueries` only refetches if the query is active
4. Cleanup function prevents memory leaks if component unmounts

**When to use**: Any flow where on-chain transaction must sync with backend via webhooks

---

## [0.1.4] - 2025-12-05 🔄 RATING & PURCHASE CACHE FIX

### Changed
- **useCreateReview Hook** (`src/features/signals/hooks/useReviews.ts`):
  - Now accepts `contentId` and `predictorAddress` options for cache invalidation
  - Invalidates signal detail query after rating submission
  - Invalidates predictor profile query to update average rating
  - Invalidates signal lists to refresh ratings in marketplace

- **RatingSection Component** (`src/features/signals/components/RatingSection.tsx`):
  - Added `contentId` and `predictorAddress` props
  - Passes these to `useCreateReview` for proper cache invalidation

- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Updated to pass `contentId` and `predictorAddress` to RatingSection

- **usePurchaseFlow Hook** (`src/features/signals/hooks/usePurchase.ts`):
  - Added aggressive cache invalidation after purchase confirmation
  - Invalidates purchase check, signal detail, receipts, and content queries
  - Multiple delayed invalidations (2s, 5s, 10s) to handle webhook processing delays
  - Handles cases where API might be temporarily rate-limited

### Fixed
- **Bug 1**: Rating submission didn't update predictor profile or signal detail without page refresh
  - **Root Cause**: Only review-specific queries were invalidated, not signal/predictor queries
  - **Solution**: Added cache invalidation for signal detail, predictor profile, and signal lists

- **Bug 2**: Purchase transaction succeeded on-chain but wasn't reflected in UI
  - **Root Cause**: If backend webhook was rate-limited, purchase status wasn't updated
  - **Solution**: Added multiple delayed cache invalidations to let webhook process

---

## [0.1.3] - 2025-12-05 🐛 AUTH API FIX

### Changed
- **useSessionSync Hook** (`src/features/auth/api/authHooks.ts`):
  - Now only tracks wallet addresses when user is authenticated
  - Added `hasHandledWalletChangeRef` to prevent duplicate redirects
  - Clears `previousAddressRef` when user logs out
  - More robust wallet change detection logic

- **PredictorProfilePage** (`src/features/predictors/pages/PredictorProfilePage.tsx`):
  - Changed `useMyPurchasedContentIds` to check `isAuthenticated` instead of wallet connection
  - Removed unused `useAccount` import
  - Added `useAuthStore` import for authentication state

### Fixed
- **Bug**: Backend returned 401 "No token provided" when visiting predictor profile with connected wallet but not signed in
- **Root Cause**: `useMyPurchasedContentIds` hook was enabled when wallet was connected, but API requires SIWE authentication
- **Solution**: Only fetch purchased content IDs when user is authenticated (signed in), not just when wallet is connected

---

## [0.1.2] - 2025-12-05 🔄 WALLET CHANGE REDIRECT FIX

### Changed
- **useSessionSync Hook** (`src/features/auth/api/authHooks.ts`):
  - Now redirects to home page (`/`) when user switches wallets
  - Prevents stale data from previous wallet showing on current page
  - Uses router.navigate() for immediate navigation after logout

### Fixed
- **Bug**: Pages showed stale data after wallet switch (e.g., "Purchased" badges for wrong wallet)
- **Root Cause**: Wallet change triggered logout but user stayed on current page with cached data
- **Solution**: Redirect to home page on wallet change to force fresh data load

---

## [0.1.1] - 2025-12-05 🛒 PURCHASED SIGNALS DISPLAY FIX

### Added
- **Receipts API** (`src/features/signals/api/receipts.api.ts`):
  - `getMyReceipts(params)` - Fetch user's purchase history with pagination
  - `getMyPurchasedContentIds()` - Fetch all purchased content IDs (handles pagination)

- **Receipts Hook** (`src/features/signals/hooks/useReceipts.ts`):
  - `useMyPurchasedContentIds(enabled)` - Query hook to get purchased content IDs
  - Only runs when user is authenticated
  - 5-minute stale time for caching

### Changed
- **SignalCard** (`src/features/signals/components/SignalCard.tsx`):
  - Added optional `isPurchased` prop
  - Displays "Purchased" badge with checkmark icon when true
  - Badge takes priority over Active/Inactive status display

- **SignalGrid** (`src/features/signals/components/SignalGrid.tsx`):
  - Added optional `purchasedContentIds` prop
  - Creates Set for O(1) lookup of purchased signals
  - Passes `isPurchased` prop to each SignalCard

- **PredictorProfilePage** (`src/features/predictors/pages/PredictorProfilePage.tsx`):
  - Removed `excludeBuyerAddress` filter - now shows ALL signals from predictor
  - Fetches user's purchased content IDs when authenticated
  - Passes purchased IDs to SignalGrid for badge display

### Fixed
- **Bug**: Predictor profile showed "No signals found" when user purchased all signals
- **Root Cause**: `excludeBuyerAddress` filter was hiding purchased signals
- **Solution**: Show all signals with "Purchased" badge for owned ones

---

## [0.1.0] - 2025-12-05 ⭐ PERMANENT RATING SYSTEM

### Added
- **StarRating Component** (`src/shared/components/ui/StarRating.tsx`):
  - Interactive star rating with hover effects
  - Read-only mode for display
  - Customizable sizes (sm, md, lg)
  - Optional numeric value display
  - Accessibility support

- **Reviews API** (`src/features/signals/api/reviews.api.ts`):
  - `checkReviewExists(tokenId)` - Check if user already rated a purchase
  - `getReviewByTokenId(tokenId)` - Get existing review details
  - `createReview({ tokenId, score })` - Submit permanent rating (1-5 stars)

- **Reviews Hooks** (`src/features/signals/hooks/useReviews.ts`):
  - `useCheckReview(tokenId)` - Query hook to check if review exists
  - `useGetReview(tokenId)` - Query hook to get review details
  - `useCreateReview()` - Mutation hook to submit rating

- **RatingSection Component** (`src/features/signals/components/RatingSection.tsx`):
  - Interactive rating form for unrated purchases
  - Confirmation dialog warning about permanent ratings
  - Read-only display for already-rated signals
  - Error handling and loading states

### Changed
- **SignalDetailPage** (`src/features/signals/pages/SignalDetailPage.tsx`):
  - Integrated RatingSection below SignalContent for purchased signals
  - Rating only shown to buyers (not predictors viewing own signals or admins)

- **Components Export** (`src/features/signals/components/index.ts`):
  - Added `RatingSection` to barrel export

- **Hooks Export** (`src/features/signals/hooks/index.ts`):
  - Added `useReviews` hooks to barrel export

- **API Export** (`src/features/signals/api/index.ts`):
  - Added reviews API functions to barrel export

### Design Decisions
- **Permanent Ratings**: Once submitted, ratings cannot be changed or deleted
- **Rating Integrity**: Prevents rating manipulation and gaming
- **Token-Based**: Ratings tied to SignalKeyNFT tokenId (one rating per purchase)
- **Confirmation Required**: Users must confirm before submitting due to permanence

---

## [0.0.1] - 2024-12-01

### Added
- Initial project setup with Vite + React + TypeScript
- Tailwind CSS with custom logo-inspired color palette
- RainbowKit wallet connection
- SIWE authentication flow
- Signal marketplace with filtering and pagination
- Signal detail page with purchase flow
- Predictor profile pages
- Protected content reveal for purchased signals
