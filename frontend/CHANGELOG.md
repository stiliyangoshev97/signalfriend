# 📝 SignalFriend Frontend - Changelog

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
