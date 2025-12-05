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
