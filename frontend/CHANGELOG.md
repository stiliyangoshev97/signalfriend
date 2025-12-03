# 📝 SignalFriend Frontend - Changelog

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
