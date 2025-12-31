# Changelog

All notable changes to the SignalFriend frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.35.0] - 2025-12-31 💰 PUBLIC PREDICTOR EARNINGS

### Added

**Predictor Earnings Display**
- Added `totalEarnings` field to Predictor schema
- PredictorCard now shows earnings as 4th stat (Signals | Sales | Earnings | Rating)
- PredictorProfilePage now shows 5th stat card for "Total Earnings" with dollar icon
- Earnings displayed in gold/yellow color (`text-fur-light`)

**Sort by Earnings**
- Added "💰 Most Earnings" option in sort dropdown
- Added "💰 Most Earnings" quick filter button
- Quick filters now stack vertically for better mobile UX

**Auto-Refresh After Purchase**
- Purchase flow now invalidates predictor profile cache
- Predictor's earnings update immediately after purchase without page refresh

### Changed

**PredictorCard Stats Grid**
- Changed from 3 columns to 4 columns to accommodate earnings
- Rating shows "N/A" instead of "No ratings" for compact display

**PredictorProfilePage Stats Grid**
- Changed from 4 columns to 5 columns for earnings card
- Responsive: 2 cols on mobile, 3 on md, 5 on lg

**PredictorFilterPanel**
- Quick filters now use `flex-col` for vertical stacking
- Fixed default filter to point to "New Predictors" (joinedAt desc)
- Fixed `resetFilters()` to use correct default (was: totalSales, now: joinedAt)
- Fixed `hasActiveFilters` check to use correct default

**PredictorsPage**
- Added `totalEarnings` to valid sortBy URL params

### Technical
- Updated `predictor.schemas.ts` (Zod): Added `totalEarnings` to Predictor schema
- Updated `predictorsList.api.ts`: Added `totalEarnings` to PredictorFilters sortBy
- Updated `admin.types.ts`: Added `totalEarnings` to AdminPredictorProfile
- Updated `usePurchase.ts`: Added predictor profile invalidation after purchase

---

## [0.34.0] - 2025-12-30 ✨ PREMIUM SIGNALS BRANDING

### Changed

**Branding Update: "Expert Signals" → "Premium Signals"**
- Updated HeroSection heading: "Predict Smarter with Premium Signals"
- Updated all SEO meta descriptions to use "professional analysis" (index.html, useSEO.ts)
- Updated HowItWorksSection step description
- Updated SignalsPage SEO description
- Consistent branding: "Premium Signals" + "professional analysis" throughout

**Predictors Page Simplification**
- Changed header from "🏆 Top Predictors" to "Predictors"
- Changed subtitle to "Discover signal providers on the platform"
- Updated SEO title from "Top Predictors Leaderboard" to "Predictors"
- Simpler, more accurate description since page shows all predictors with filters

---

## [0.33.0] - 2025-12-30 📊 ACCURATE PLATFORM EARNINGS DISPLAY

### Fixed

**Admin Dashboard - Platform Earnings**
- Fixed earnings display showing inaccurate calculation for predictor joins
- Previously: Displayed `X predictors × $15` (assumed all used referrals)
- Now: Shows accurate breakdown based on actual referral data
  - `X × $20 + Y × $15 (referral)` when mixed
  - `X predictors × $20` when none used referrals
  - `X predictors × $15 (all with referral)` when all used referrals

### Changed

**PlatformEarnings Type**
- Added `details.predictorsWithReferral` - Predictors who joined with paid referral
- Added `details.predictorsWithoutReferral` - Predictors who joined without referral

### Technical
- Updated `AdminStatsCard.tsx`: Dynamic subtext based on referral breakdown
- Updated `admin.types.ts`: New fields in PlatformEarnings interface
- Updated `AdminDashboardPage.tsx`: Default values for new fields

---

## [0.32.0] - 2025-12-30 📝 DOCUMENTATION SYNC

### Changed

**Documentation Updates**
- Synchronized all documentation with backend v0.35.0 changes
- Updated PROJECT_CONTEXT.md with current version and status
- Updated README.md with correct version number
- Updated CHANGELOG with recent changes

### Technical
- No code changes, documentation only

---

## [0.31.0] - 2025-12-30 📝 DOCUMENTATION & UI POLISH

### Changed

**Pagination Component**
- Added `itemLabel` prop to Pagination component (defaults to "signals")
- PredictorsPage now shows "total predictors" instead of "total signals"

**Domain Badge Improvements**
- Changed domain badge color from orange to green across all components
- Domain badge now displays inline with confidence badge (not on new line)
- Added truncation for long domain names with hover tooltip
- Added domain badge to PurchasedSignalCard (My Signals page)

**Documentation Updates**
- Updated all README.md files to clarify "Web3 Prediction Signals Marketplace" positioning
- Updated PROJECT_CONTEXT.md with current version and platform description
- Clarified that platform is for prediction market events (Polymarket, Predict.fun, etc.)

### Technical
- Updated `Pagination.tsx`: New `itemLabel` prop
- Updated `PredictorsPage.tsx`: Pass `itemLabel="predictors"` to Pagination
- Updated `PurchasedSignalCard.tsx`: Added domain badge with getUrlDomain helper
- Added `eventUrl` to Receipt type in `purchase.api.ts`

---

## [0.30.0] - 2025-12-30 🔮 PREDICTION MARKETPLACE PIVOT (Phase 2 & 3: Schema + Categories)

### Changed

**Signal Schema Updates**
- Removed `riskLevel` display (badge and filters)
- Removed `potentialReward` display (badge and filters)
- Added `confidenceLevel` badge (1-100%, color-coded: green ≥80%, yellow ≥50%, red <50%)
- Added `eventUrl` display as "View Event" button on signal detail page

**CreateSignalModal - Complete Redesign**
- Replaced 1-2 day slider with date picker (1-90 days expiration)
- Added confidence level slider (1-100%)
- Added optional Event URL input with domain preview
- Updated category group order to match new 6 groups

**FilterPanel Updates**
- Removed Risk Level filter section
- Removed Potential Reward filter section
- Added confidence level filter support (API ready)
- Updated MAIN_GROUP_ORDER: Crypto, Finance, Politics, Sports, World, Culture

**SignalCard Updates**
- Replaced risk/reward badges with confidence level badge
- Color-coded confidence display

**SignalDetailPage Updates**
- Replaced risk/reward config display with confidence level
- Added clickable "View Event" button for eventUrl
- Updated SEO description

**API Integration Updates**
- Updated `signals.api.ts`: Replaced riskLevel/potentialReward params with minConfidence/maxConfidence
- Updated `predictorProfile.api.ts`: Same filter param changes
- Updated URL param handling in SignalsPage and PredictorProfilePage

**FAQ Page Updates**
- Updated category documentation to show all 6 groups with correct subcategories
- Crypto: Bitcoin, Ethereum, Altcoins, DeFi, NFTs/Gaming, Meme Coins
- Finance: Stocks, Forex, Commodities, Earnings
- Politics: US Elections, World Politics, Policy, Legal
- Sports: Football, American Football, Basketball, Combat Sports, Horse Racing, Esports
- World: Geopolitics, Economy, Climate/Weather, Science
- Culture: Entertainment, Awards, Tech/AI, Social Media

### Technical
- Updated `signal.schemas.ts`: New schema fields, removed old enums
- Updated `types/index.ts`: Removed RiskLevel and PotentialReward exports
- All forms validated with Zod schemas

---

## [0.29.0] - 2025-12-30 🔮 PREDICTION MARKETPLACE PIVOT (Phase 1: Text/SEO)

### Changed

**Platform Messaging Pivot**
- SignalFriend now positions as a **Prediction Signals Marketplace** (vs. trading signals)
- Focus on analysis for prediction market events (Polymarket, Predict.fun, etc.)
- Keeping "Signal" terminology while shifting narrative to predictions

**SEO & Meta Tags**
- Updated `index.html`:
  - Title: "Decentralized Prediction Signals Marketplace"
  - Description: "Get expert analysis for prediction market events..."
  - Keywords: Added "prediction markets, polymarket analysis, predict.fun"
- Updated Open Graph and Twitter Card meta tags
- Updated `useSEO.ts` default description
- Updated `site.webmanifest` description

**Home Page**
- HeroSection: "Predict Smarter with Premium Signals"
- Badge: "Web3 Prediction Signals Marketplace"
- Description: Focus on prediction market events, crypto, politics, sports
- FeaturesSection: Updated multi-category description
- HowItWorksSection: Updated buyer/predictor steps for predictions
- CTASection: "Ready to Predict with Confidence"

**Signals Pages**
- SignalsPage: SEO title "Prediction Signals Marketplace"
- SignalDetailPage: SEO now says "Prediction Signal" vs "Trading Signal"
- MyPurchasedSignalsPage: Updated descriptions
- SignalContent: "Full analysis and recommendation" vs "trading strategy"

**Predictor Pages**
- PredictorProfilePage: Updated SEO descriptions
- PredictorDashboardPage: Updated SEO and empty state text
- BecomePredictorPage: "prediction insights" vs "trading insights"
- CreateSignalModal: Updated placeholder text
- EditProfileModal: Updated bio placeholder

**FAQ Page**
- Renamed "Trading & Signals" category to "Signals & Purchases"
- Updated signal expiry FAQ (1-2 days)
- Updated purchase signal steps

**News Page**
- Updated launch announcements to reference "prediction signals"

### Technical Notes
- This is Phase 1 (text/SEO only) - no data model changes
- Future phases will add: `sourceMarket`, `eventUrl`, `confidenceLevel` fields
- Categories will be restructured in Phase 2

---

## [0.28.2] - 2025-12-29 ⏱️ SIGNAL EXPIRY + FAVICON FIX

### Changed

**Signal Expiration Duration**
- Reduced maximum signal expiration from 7 days to 2 days
- Trading signals are time-sensitive; most become invalid after 2 days
- Improves signal quality and buyer protection
- Existing signals with longer expiry will age naturally (no migration)

### Fixed

**Google Favicon/Logo Display**
- Added proper favicon files for Google indexing:
  - `favicon.ico` (primary - Google looks for this)
  - `favicon-16x16.png`, `favicon-32x32.png` (sized variants)
  - `apple-touch-icon.png` (iOS)
  - `android-chrome-192x192.png`, `android-chrome-512x512.png` (Android/PWA)
- Added `site.webmanifest` with app name, icons, and theme colors
- Updated `index.html` with proper favicon link tags
- Google should now display the SignalFriend logo in search results

### Technical
- Updated `signal.schemas.ts`: `.max(7)` → `.max(2)` with new error message
- Updated `CreateSignalModal.tsx`:
  - Default expiry: `7` → `2` days
  - Slider max: `7` → `2`
  - Help text: "(1-7 days)" → "(1-2 days)"
- New favicon files in `/public/`
- New `site.webmanifest` with SignalFriend branding

---

## [0.28.1] - 2025-12-28 🐛 QUERY INVALIDATION FIX

### Fixed

**Signal Deactivation/Reactivation Query Invalidation**
- Fixed bug where deactivating a signal on the predictor dashboard didn't update the predictor's public profile page
- The signal would remain in the "active" tab on the profile page until manual refresh
- **Root Cause:** `useDeactivateSignal` and `useReactivateSignal` hooks only invalidated dashboard queries (`['predictor', 'signals', ...]`) but not public profile queries (`['predictor', 'public-signals', ...]`)
- **Fix:** Added query invalidation for `['predictor', 'public-signals', address]` to both hooks

### Technical
- Updated `usePredictorDashboard.ts`:
  - `useDeactivateSignal()` now also invalidates public predictor signals
  - `useReactivateSignal()` now also invalidates public predictor signals
- Query key pattern: `['predictor', 'public-signals', address.toLowerCase()]`

---

## [0.28.0] - 2025-12-26 🆕 DEFAULT SORT BY NEWEST

### Changed

**Signal Marketplace Default Sort**
- Changed default sort from "Best Quality" to "Newest First"
- Fresh signals now appear first on initial page load
- Gives new predictors better visibility in the marketplace
- Users can still switch to other sort options (Best Quality, Most Popular, Price)

**Sort Options Reordered**
- New order: Newest First → Best Quality → Most Popular → Price Low → Price High
- Added explicit `quality` sort value for "Best Quality" option
- "Best Quality" now persists correctly in URL (`?sort=quality`)

### Technical
- Updated `SignalsPage.tsx` to default `sortBy` to `'newest'`
- Updated `FilterPanel.tsx` sort dropdown order and values
- Added `'quality'` to `signalFiltersSchema` sortBy enum
- Updated `signals.api.ts` to skip sortBy param when `quality` selected (uses backend default)

---

## [Unreleased]

### Added

**SEO: robots.txt and sitemap.xml**
- Added `public/robots.txt` to guide search engine crawlers
  - Allows all crawlers to index public pages
  - Blocks `/admin` and `/dashboard` private areas
  - Points to sitemap location
- Added `public/sitemap.xml` with all public pages
  - Homepage, Signals, Predictors, How It Works, Become Predictor
  - Terms and Privacy legal pages
- Improves Google indexing and SEO discoverability

### Fixed

**Mobile Tab Button Styling**
- Fixed signal tab buttons ("Active" / "Expired / Inactive") not fitting well on mobile screens
- Buttons now stack vertically on small screens (<640px) and display inline on larger screens
- Shortened tab labels for better fit: "Active Signals" → "Active", "Expired / Deactivated" → "Expired / Inactive"
- Reduced padding and font size on mobile (text-xs, px-3) with larger sizes on sm+ (text-sm, px-4)
- Added flexbox centering and proper gap between text and count badges

### Planned
- Signal outcome tracking

---

## [0.27.0] - 2025-12-23 📊 PREDICTOR PROFILE SIGNAL TABS

### Added

**Inactive/Expired Signals Tab on Predictor Profile**
- New tab system on predictor profile page: "Active Signals" | "Expired / Deactivated"
- Users can now view a predictor's inactive (expired or manually deactivated) signals
- Each tab shows count badge with number of signals in that category
- Separate query for "other tab" count to always show both counts
- Stats header shows total signals count (`predictor.totalSignals`) - sum of all active + inactive

**Signal Filter Status Schema**
- Added `signalFilterStatusSchema` to frontend schemas (`active`, `inactive`, `all`)
- Updated `SignalFilters` type to support new status filter
- API integration for `status` parameter in predictor signals endpoint

### Changed

**Predictor Profile Page UX**
- Stats header "Signals" now shows total count (active + expired/deactivated)
- Tab buttons use consistent dark styling (`bg-dark-600`) when selected
- Dynamic signal count label: "active signals" vs "expired/deactivated signals"
- Reset to page 1 when switching between tabs
- Filters persist across tab switches

### Technical
- Added `activeTab` state management with `'active' | 'inactive'` type
- Added `otherTabData` query for inactive tab count display
- Updated `fetchPredictorSignalsPublic` API to pass `status` parameter
- Removed redundant `activeSignalsForStats` query (now uses `predictor.totalSignals`)

---

## [0.26.0] - 2025-12-21 🇪🇺 MICA COMPLIANCE & LEGAL UPDATES

### Added

**EU/EEA Region Disclaimer Modal**
- New `RegionDisclaimerModal` component blocks access until user confirms they are not from EU/EEA
- Shows on first visit, stores acknowledgment in localStorage
- Checkbox confirmation: "I confirm that I am not a resident of, located in, or acting on behalf of a person in the European Union or European Economic Area"
- Links to Terms page for full details
- Similar approach to Uniswap's legal disclaimer

**FAQ - Signal Categories**
- Added new FAQ entry: "What categories can I post signals in?"
- Documents all supported signal categories:
  - **Crypto**: Bitcoin, Ethereum, Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, Others
  - **Traditional Finance**: US Stock - Tech, US Stock - General, Forex - Majors, Commodities - Metals, Commodities - Energy, Others
  - **Macro/Other**: Economic Data, Geopolitical Events, Sports, Others
- Styled with category tags/chips for easy reading

### Changed

**Terms & Conditions - MiCA Compliance Updates**
- Added **Section 2: Jurisdictional Restrictions (EU/EEA Exclusion)** with prominent warning styling
- Added MiCA Compliance Notice explaining platform does NOT offer crypto-asset services under MiCA
- Strengthened NFT-based language throughout:
  - Section 3.1: "NFT Marketplace — Not a Crypto-Asset Service"
  - Clarified purchases are for "digital collectibles (NFTs)" not just content access
  - Section 3.3: Updated gambling disclaimer to emphasize NFT purchase
  - Section 4: Added "Jurisdictional Eligibility" user acknowledgment
  - Section 5: Added EU/EEA confirmation for Predictors
  - Section 6: Clarified purchases as "NFT Minting"
  - Section 7: Strengthened SignalKey NFT as "unique digital collectible"
  - Section 8: Added "Accessing from Restricted Jurisdiction" as prohibited activity
  - Section 9: Added NFT-specific risks and liability language
  - Section 10: Added "violation of jurisdictional restrictions" to indemnification
- Renumbered all sections (now 13 sections)
- Updated date to December 21, 2025

### Files Changed
- `src/shared/components/RegionDisclaimerModal.tsx` (new)
- `src/App.tsx` - Added RegionDisclaimerModal
- `src/features/legal/pages/TermsPage.tsx` - MiCA compliance updates
- `src/features/faq/pages/FaqPage.tsx` - Signal categories FAQ

---

## [0.25.0] - 2025-12-20 🔧 MOBILE FIXES & UX IMPROVEMENTS

### Fixed

**About Page - Contract Addresses Mobile Overflow**
- Fixed horizontal scroll issue on mobile caused by full contract addresses overflowing container
- Removed `showFull` prop from `CopyableAddress` - addresses now show truncated format (e.g., `0xAebe...52FB`)
- Changed layout to stack vertically on mobile (`flex-col`), horizontally on desktop (`sm:flex-row`)
- Added `overflow-hidden` to container to prevent any potential overflow
- Users can still copy full address or click "View on BscScan" link

### Changed

**Edit Profile Modal - Smart Optional Social Links**
- Made Telegram and Discord fields **optional** instead of required
- Implemented smart preferred contact auto-selection logic:
  - **Only Telegram filled** → Telegram auto-selected as preferred (no choice needed)
  - **Only Discord filled** → Discord auto-selected as preferred (no choice needed)  
  - **Both filled** → User must choose preferred contact method (radio buttons shown)
  - **Neither filled** → No preferred contact (radio buttons hidden)
- Added helper text: "Optional — recommended for faster support & trust"
- Shows info message when only one social is filled: "Telegram/Discord will be set as your preferred contact method"
- Save button shows "Select Preferred Contact" when both socials filled but no choice made
- Removed confusing "None" option from preferred contact selector
- Added helper text: "Optional — recommended for faster support & trust"
- Added "None" option for Preferred Contact Method
- Updated Zod schema to allow empty strings for both social fields
- Smart handling: If user selects a preferred contact but leaves that field empty, system auto-clears preference
- Removed required asterisk (*) from Telegram and Discord labels

**Improved User Experience**
- New predictors no longer blocked from saving profile if they don't have both social accounts
- Existing predictors can now remove their social handles if desired
- Preferred Contact section now clearly indicates it's optional

---

## [0.24.0] - 2025-12-20 🔧 UI FIXES & CACHE IMPROVEMENTS

### Fixed

**Become Predictor Page - Help Link**
- Changed "Need Help? Read our predictor guide" link from broken external docs URL to internal `/faq` page
- Now uses React Router `Link` component instead of external `<a>` tag

**Purchase Modal - Insufficient Balance Message After Success**
- Fixed bug where "Insufficient Balance" warning appeared after successful purchase
- Root cause: Balance check ran before success check, so when balance dropped post-purchase, warning showed
- Solution: Check `isPurchaseConfirmed` first in step determination logic
- Also added `step !== 'success'` condition to balance warning display

**Purchase Modal - Layout Shift After Success**
- Fixed modal "stretching then shrinking" after purchase confirmation
- Root cause: Progress steps disappeared when `hasEnoughBalance` became false after purchase
- Solution: Keep progress steps visible on success with `(hasEnoughBalance || step === 'success')`

**My Signals Page - Card Layout Consistency**
- Fixed inconsistent separator line position across purchased signal cards
- Cards with shorter titles/descriptions now align with cards having longer content
- Solution: Added `flex flex-col h-full` with `flex-grow` wrapper for variable content
- Separator line and action buttons now always at consistent vertical position

**Predictor Dashboard - Signal Card Layout Consistency**
- Same fix applied to `MySignalCard` component on Predictor Dashboard
- Price/Sales/Earnings boxes now aligned across all signal cards regardless of title/description length

**New Signal Not Appearing on Signals Page**
- Fixed: Creating a signal from Predictor Dashboard didn't show on Signals page without refresh
- Added `signalKeys.lists()` invalidation to `useCreateSignal` hook
- New signals now appear immediately on the Signals page

---

## [0.23.3] - 2025-12-20 📊 HOMEPAGE STATS IMPROVEMENT

### Changed

**Homepage Stats: "Signals Purchased" Replaces "Total Signals"**
- Changed first stat on homepage CTA section from "Total Signals" to "Signals Purchased"
- Displays `totalPurchases` instead of `totalSignals` from the public stats API
- More meaningful metric showing actual marketplace activity vs just content count
- Backend already provided `totalPurchases` in `/api/stats` response (no API changes needed)

---

## [0.23.2] - 2025-12-20 🔧 SIGNALS CACHE INVALIDATION FIX

### Fixed

**Purchased Signals Now Immediately Disappear from Signals Page**
- Fixed bug where purchased signals would briefly remain visible on the Signals page after purchase
- Added `signalKeys.lists()` to cache invalidation in `usePurchaseFlow`
- Signals list now refetches immediately after purchase confirmation, removing the purchased signal

**Root Cause**
- After purchase, cache invalidation was missing for the signals list query
- Only `purchaseKeys.check`, `signalKeys.detail`, and `myReceipts` were being invalidated
- The Signals page uses `excludeBuyerAddress` filter which depends on backend Receipt records
- Without list invalidation, stale cache showed purchased signal until 2-minute staleTime expired

---

## [0.23.1] - 2025-12-19 🔧 FAQ & NAVIGATION FIXES

### Fixed

**Scroll to Top on Navigation**
- Added `ScrollToTop` component that scrolls to page top on every route change
- Fixed issue where navigating between pages (FAQ → About → Home) would land in the middle of the page
- All internal navigation now correctly scrolls to the top

**FAQ Content Corrections**
- Fixed verification reapplication requirements: "50 sales and $500 USDT" → "100 sales and $1,000 USDT"
- Matches actual backend requirements (MIN_SALES_FOR_VERIFICATION = 100, MIN_EARNINGS_FOR_VERIFICATION = 1000)

**Wallet Support List**
- Updated to mention RainbowKit and 100+ wallet support
- Added Bitget Wallet and OKX Wallet to the list
- Clarified that any WalletConnect-compatible wallet works

---

## [0.23.0] - 2025-12-19 📄 ABOUT PAGE, FAQ PAGE & BLOCKAID ANNOUNCEMENT

### Added

**About Page (`/about`)**
- New page displaying official SignalFriend contract addresses
- All 3 contract addresses with copy buttons and BscScan links
- Security verification badge (Blockaid whitelisted)
- Platform overview and key features section
- Links to FAQ, Terms, and News pages
- Accessible from footer navigation

**FAQ Page (`/faq`)**
- Comprehensive FAQ with expandable accordion sections
- Category filtering (Wallet & NFTs, Predictors, Trading, Fees, Security, General)
- Questions about:
  - NFT visibility on mobile wallets (MetaMask import guide)
  - Blank NFT images explanation
  - Difference between Predictor Pass and Signal Key NFTs
  - How to become a predictor
  - Verification requirements (100 sales + $1,000 earnings)
  - Blacklist and dispute process
  - Signal purchase flow
  - Rating system
  - Signal expiration
  - Fee structure breakdown
  - Referral program details
  - Payment security
  - Contract verification
  - Supported wallets
  - Where to get USDT on BNB Chain
- Community links (Discord, X/Twitter)
- Accessible from navbar navigation

**Blockaid Security Announcement**
- Added news item announcing Blockaid security verification
- All 3 contracts and domain (signalfriend.com) whitelisted
- Contract addresses listed in announcement

### Changed

**Navigation Updates**
- Added "FAQ" link to navbar (desktop and mobile)
- Added "About" link to footer (before Terms)
- Updated router documentation with new routes

**File Structure**
```
src/features/
├── about/
│   ├── index.ts
│   └── pages/
│       └── AboutPage.tsx
├── faq/
│   ├── index.ts
│   └── pages/
│       └── FaqPage.tsx
```

---

## [0.22.0] - 2025-12-18 🔧 PRODUCTION FIX - SPA ROUTING

### Fixed

**404 Errors on Page Refresh**
- Added `rewrites` configuration to `vercel.json` to fix SPA routing
- Issue: Direct navigation or page refresh on routes like `/signals`, `/predictors` returned 404
- Root cause: Vercel server didn't know to serve `index.html` for client-side routes
- Solution: Added rewrite rule `"/(.*)" → "/index.html"` to let React Router handle all routing
- All routes now work correctly on refresh or direct URL access

**Technical Details**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Notes
- This is a critical production fix for SPA (Single Page Application) routing
- Security headers remain unchanged (X-Content-Type-Options, X-Frame-Options, etc.)

---

## [0.21.0] - 2025-12-17 📦 PRODUCTION DEPLOYMENT PREPARATION

### Added

**Deployment Documentation**
- Created comprehensive `DEPLOYMENT_VERCEL.md` guide
  - Step-by-step Vercel setup instructions
  - Environment variables configuration for production
  - Custom domain setup with Cloudflare
  - SSL/TLS configuration guide
  - Testing and troubleshooting guides
  - WalletConnect Project ID setup
  - Sentry integration guide
  - Performance optimization checklist

**Production Readiness**
- All environment variables documented for BSC Mainnet
- Custom domain configuration ready
- Security headers configured in `vercel.json`
- Mobile responsive testing guide
- Post-deployment testing checklist

### Notes
- Frontend is production-ready for Vercel deployment
- All features complete ✅
- SEO & meta tags configured ✅
- Mobile responsive ✅

---

## [0.20.0] - 2025-12-16 🐛 BUG FIXES & IMPROVEMENTS

### Added

**Dynamic Explorer URLs**
- New `src/shared/utils/explorer.ts` with chain-aware URL generation
- `getExplorerTxUrl(txHash)` - Transaction URL for mainnet/testnet
- `getExplorerAddressUrl(address)` - Address URL for mainnet/testnet
- `getExplorerTokenUrl(tokenAddress)` - Token URL for mainnet/testnet
- URLs automatically switch based on `VITE_CHAIN_ID` (56=mainnet, 97=testnet)

**Admin Addresses from Environment**
- Admin addresses now read from `VITE_ADMIN_ADDRESSES` environment variable
- Easier to switch between testnet and mainnet admin wallets
- Updated `useIsAdmin.ts` hook to parse env variable

**Dispute Resolution Smart Contract Integration**
- "Resolve & Unblacklist" button in admin disputes tab now calls smart contract
- Creates MultiSig proposal for on-chain unblacklist (1st of 3 required signatures)
- Predictor **remains blacklisted** until all 3 signatures collected
- Database updated automatically by backend webhook when smart contract event fires
- Dispute status changed to "contacted" to indicate proposal was submitted
- New confirmation modal with transaction status, hash, Action ID, and next steps

**Blacklisted Tab Smart Contract Integration**
- "Unblacklist" button in admin blacklisted tab now calls smart contract
- Rewrote `BlacklistedPredictorCard.tsx` with full smart contract flow
- Creates MultiSig proposal (1st signature), predictor **remains blacklisted**
- No immediate database update - waits for webhook after all 3 signatures
- Confirmation modal with MultiSig explanation and transaction status
- Shows transaction hash and Action ID for other signers to approve

### Fixed

**Hardcoded Testnet Explorer URLs**
- Fixed `PredictorProfilePage.tsx` - blacklist success modal was linking to testnet
- Fixed `PurchasedSignalCard.tsx` - receipt transaction was linking to testnet
- Both now use dynamic `getExplorerTxUrl()` based on chain ID

**Dispute Resolution Database-Only Bug**
- Previously, resolving a dispute updated the database immediately after 1st signature
- This caused predictor to appear unblacklisted before all 3 MultiSig signatures
- Now only submits proposal to smart contract (1st signature)
- Dispute status changed to "contacted" instead of "resolved"
- Database only updated when backend webhook receives `PredictorBlacklisted` event after 3rd signature

**Blacklisted Tab Database-Only Bug**
- Previously, unblacklisting updated database immediately after 1st signature
- Predictor incorrectly appeared unblacklisted in UI before MultiSig completion
- Now only submits proposal to smart contract
- Predictor remains in blacklist until all 3 signatures collected
- Database update handled by backend webhook for proper state synchronization

**Predictor Verification Cache Invalidation**
- Fixed: Verifying/unverifying predictor from profile didn't update Predictors list
- `useManualVerifyPredictor` and `useUnverifyPredictor` hooks now invalidate `['predictors']`
- Previously only invalidated `['predictor']` (singular) which didn't match list query key

### Changed
- Updated `.env.example` with `VITE_ADMIN_ADDRESSES` configuration
- `DisputeCard` component now includes smart contract integration
- `BlacklistedPredictorCard` component fully rewritten with smart contract integration
- Better documentation in `useIsAdmin.ts` explaining security model

---

## [0.19.0] - 2025-12-15 🚀 BSC MAINNET DEPLOYMENT

### Added

**BSC Mainnet Smart Contracts**
- SignalFriend is now live on BSC Mainnet (Chain ID: 56)
- **SignalFriendMarket**: `0xaebec2cd5c2db4c0875de215515b3060a7a652fb`
- **PredictorAccessPass**: `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07`
- **SignalKeyNFT**: `0x2a5f920133e584773ef4ac16260c2f954824491f`
- **USDT Token**: `0x55d398326f99059fF775485246999027B3197955` (BSC native USDT)

**MultiSig Admin Configuration**
- 3 signers for admin operations (blacklist proposals, etc.)

### Changed
- Production environment now targets BSC Mainnet
- Contract addresses configuration updated for mainnet
- Users can now trade with real USDT on mainnet

### Technical Details
- Deployment timestamp: 1765823707
- Block: `0x44701cb`

---

## [0.18.1] - 2025-12-15 🐛 FIX: MY SIGNALS PAGE QUERY INVALIDATION

### Fixed

**My Signals Page Not Updating After Purchase**
- Fixed query cache invalidation after signal purchase
- The "My Signals" page (`/my-signals`) now immediately shows newly purchased signals
- Previously required a manual page refresh to see new purchases
- Root cause: Incorrect query key used for cache invalidation
  - Was using `['receipts']` which didn't match the actual query key
  - Now uses `['purchase', 'myReceipts', address]` which properly matches `useMyReceipts` hook

**Modal Background Scroll When Interacting with Form Inputs**
- Fixed background page scrolling when clicking on inputs inside modals (e.g., Edit Profile)
- Modal now uses `position: fixed` body lock technique instead of just `overflow: hidden`
- Saves and restores scroll position using a ref to persist across renders
- Completely prevents scroll chaining from modal to the page behind it
- Fixed radio button styling in Edit Profile modal that could cause scroll jumps
  - Changed from `sr-only peer` to `absolute opacity-0 w-0 h-0 peer` to avoid off-screen positioning
- Affected modals: Edit Profile, Create Signal, Purchase, and all other modals

### Technical Details
- Updated `usePurchaseFlow` hook in `src/features/signals/hooks/usePurchase.ts`
- Query invalidation now properly targets all `myReceipts` queries for the current user
- Multiple delayed invalidations (2s, 5s, 10s) handle webhook processing delays
- Updated `Modal` component in `src/shared/components/ui/Modal.tsx` with proper body scroll lock

---

## [0.18.0] - 2025-12-13 🔧 CONFIGURABLE SOCIAL LINKS & CI/CD

### Added

**Environment-Based Social Links Configuration**
- New `src/shared/config/social.ts` - centralized social links config
- Discord, Twitter/X, and contact email now read from environment variables
- No more hardcoded social URLs scattered across components
- Falls back to defaults for Twitter/email, Discord requires explicit config

**Environment Variables (Frontend)**
- `VITE_DISCORD_URL` - Discord server invite URL (required, no fallback)
- `VITE_TWITTER_URL` - Twitter/X profile URL (default: x.com/signalfriend1)
- `VITE_CONTACT_EMAIL` - Contact email (default: contact@signalfriend.com)

**CI/CD Pipeline**
- New `.github/workflows/ci.yml` - GitHub Actions workflow
- Runs backend tests (tsc, lint, vitest) and frontend build (tsc, lint, build) in parallel
- Triggers on push/PR to main and develop branches
- Node.js 20.x with npm caching for faster builds

**Vercel Preview Deployments**
- Added `Dummy.txt` for Vercel preview workflow triggers

**News Page Updates**
- Updated all dates from 2024 to 5
- Added referral program announcement ("Earn 5 USDT per referred predictor!")
- Removed outdated maintenance notice

**How It Works Section**
- Added Step 5: "Refer & Earn" - earn 5 USDT for each referred predictor

### Changed

- `RootLayout.tsx` - Footer now uses `socialLinks` config
- `MaintenancePage.tsx` - Uses `socialLinks` config for Discord/Twitter
- `TermsPage.tsx` - Uses `socialLinks` config for all contact links
- `.env.example` - Added social link environment variables

### Security

- Full security audit completed (AUDIT.md) - 93/100 score
- All rate limiting verified across all endpoints
- Production-ready security posture confirmed

---

## [0.17.1] - 2025-12-12 🔒 SECURITY & BUG FIXES

### Fixed

**Breadcrumb Navigation Bug**
- Simplified breadcrumb on signal detail page: `Marketplace > Signal Title`
- Removed category link that caused "Cast to ObjectId failed" error
- Category is still visible in the badge below the breadcrumb

### Added

**Vercel Security Headers**
- Created `vercel.json` with HTTP security headers
- Headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Automatically applied when deployed to Vercel
- Updated RUNBOOK.md with Vercel deployment documentation

---

## [0.17.0] - 2025-12-12 ⚡ PERFORMANCE OPTIMIZATION

### Added

**React.lazy Route Splitting**
- All pages except HomePage now use `React.lazy()` for code splitting
- Reduces initial bundle size - pages load on demand
- Suspense fallback already in place in RootLayout

**Debounced Search Inputs**
- New `useDebounce` hook in `@/shared/hooks`
- PredictorFilterPanel search now auto-triggers after 300ms delay
- Reduces API calls while typing
- No need to press Enter anymore - search happens automatically

### Changed

- Added default exports to: PredictorsPage, PredictorDashboardPage, AdminDashboardPage
- Updated hooks barrel export to include useDebounce

### Technical Details

- useDebounce accepts any value type and delay (default 300ms)
- Lazy-loaded pages: SignalsPage, SignalDetailPage, MyPurchasedSignalsPage, PredictorsPage, PredictorProfilePage, PredictorDashboardPage, BecomePredictorPage, AdminDashboardPage, TermsPage, NewsPage
- HomePage loads immediately (most visited, good for SEO)

---

## [0.16.0] - 2025-12-12 🔍 SEO & META TAGS

### Added

**SEO Infrastructure**
- Created `useSEO` hook for dynamic page titles and meta tags
- Created `getSEOUrl` utility for generating canonical URLs
- Updated `index.html` with comprehensive meta tags

**Meta Tags (index.html)**
- Primary meta tags: title, description, keywords, author, robots
- Open Graph tags for Facebook/LinkedIn sharing
- Twitter Card tags for Twitter/X sharing
- Theme color for mobile browsers
- Canonical URL
- Favicon updated to use SignalFriend logo

**Page-Specific SEO**
- HomePage: Uses default meta tags with canonical URL
- SignalsPage: "Trading Signals Marketplace" with filters description
- SignalDetailPage: Dynamic title/description based on signal data
- PredictorsPage: "Top Predictors Leaderboard" with predictor discovery
- PredictorProfilePage: Dynamic title/description based on predictor data
- PredictorDashboardPage: noIndex (private page)
- AdminDashboardPage: noIndex (private page)
- TermsPage: Legal terms with proper SEO

**Social Media Preview**
- Signals shared on social media now display with proper title, description, and logo
- Predictor profiles show personalized previews with stats

### Technical Details

- Uses native DOM manipulation (no external library needed)
- Works with React 19
- Automatic cleanup on component unmount
- Supports article, website, and profile OG types
- noIndex option for private/admin pages

---

## [0.15.0] - 2025-12-12 🧪 PRE-DEPLOYMENT TESTING & BUG FIXES

### Added

**Verification Reapplication Progress Tracking**
- Added `salesAtLastApplication` and `earningsAtLastApplication` to Predictor schema
- New "Verification Rejected" card in PredictorDashboardPage (red theme)
- Shows incremental progress: "Additional Sales" and "Additional Earnings" since rejection
- "Reapply for Verification" button appears when both requirements are met
- Progress bars track towards reapplication thresholds (50 additional sales, $500 additional earnings)

**Dashboard Data Refresh**
- Added `useEffect` to PredictorDashboardPage to refresh predictor data on mount
- Ensures fresh data after verification status changes

### Changed

**API Configuration**
- Added `ADMIN_REJECT_VERIFICATION` endpoint to `api.config.ts`
- `admin.api.ts` `updateVerification()` now calls different endpoints based on `approved` flag:
  - `true` → calls `/admin/verify/:address`
  - `false` → calls `/admin/reject/:address`

**Admin Verification Flow**
- `useUpdateVerification` hook now invalidates predictor queries after approval/rejection
- Ensures predictor profiles update immediately after admin action

**Verification Button State**
- Fixed "Get Verified" button to immediately change to "Verification Pending" badge after clicking
- `useApplyForVerification` hook now updates auth store via `setPredictor` in onSuccess callback

**Verification Dashboard Logic**
- Updated `showVerificationButton` logic to exclude `rejected` status
- Rejected predictors see dedicated "Verification Rejected" card instead of "Get Verified" button

### Fixed

**Verification Rejection Workflow Bug**
- Admin rejection was incorrectly calling verify endpoint and verifying users instead of rejecting
- Fixed by adding proper endpoint routing in `updateVerification()` API function
- Rejection now properly sets `verificationStatus: 'rejected'` and clears `isVerified` flag

**Admin Verification Date Display**
- Fixed "Invalid time value" error on admin verification requests page
- Backend now properly maps `verificationAppliedAt` → `verificationRequestedAt`

**Incomplete Profile Handling**
- Fixed `VerificationRequestCard` crashes on predictors with missing social links
- Added optional chaining (`?.`) for `socialLinks.telegram` and `socialLinks.discord`
- Added fallback "Not specified" for missing `preferredContact`

**Verification Button State After Application**
- Button now immediately updates to "Verification Pending" badge after clicking
- Previously required page refresh to see updated state
- Fixed via immediate auth store update in `useApplyForVerification` hook

### Technical Details

**Reapplication Validation**
- Frontend calculates `salesSinceRejection = totalSales - salesAtLastApplication`
- Frontend calculates `earningsSinceRejection = totalEarnings - earningsAtLastApplication`
- Reapply button enabled when BOTH conditions met:
  - `salesSinceRejection >= 50`
  - `earningsSinceRejection >= 500`

**Query Invalidation**
- Admin approval/rejection now invalidates:
  - Predictor by address query
  - All predictor queries
  - Ensures UI updates across entire app

---

## [0.14.0] - 2025-12-11 📰 NEWS SYSTEM & ANNOUNCEMENTS

### Added

**Announcement Banner Component**
- New `AnnouncementBanner` component in `/shared/components/ui/`
- Environment variable controlled (`VITE_ANNOUNCEMENT_ENABLED`, `VITE_ANNOUNCEMENT_MESSAGE`)
- 4 variants: `info` (blue), `warning` (amber), `success` (green), `error` (red)
- Dismissible per session (not persisted to localStorage)
- Auto-hides when user is on the `/news` page
- Optional link to News page with "Learn More" CTA
- Consistent gold/orange badge styling

**News Page**
- New `/news` route with full News page
- 5 sample news items with dates and categories
- Category badges: `Update`, `Feature`, `Security`, `Community`
- Responsive grid layout
- "View Full Article" links (ready for future expansion)

**Navigation Updates**
- "News" link added to navbar (after Dashboard)
- Mobile hamburger menu includes News link

### Changed

**Environment Configuration**
- Added `VITE_ANNOUNCEMENT_ENABLED`, `VITE_ANNOUNCEMENT_MESSAGE`, `VITE_ANNOUNCEMENT_TYPE`, `VITE_ANNOUNCEMENT_LINK`
- Updated `.env.example` and `.env.local` with announcement variables

**RUNBOOK Documentation**
- Added Announcement Banner configuration section
- Added News Page documentation
- Added network configuration (`VITE_ENABLE_TESTNET`) documentation

---

## [0.13.0] - 2025-12-10 🔧 FILTERS & SORTING IMPROVEMENTS

### Added

**Verified Predictors Filter**
- New "✓ Verified Only" toggle button in PredictorFilterPanel Quick Filters
- Filters predictors list to show only verified predictors when active
- Toggle on/off behavior (click again to show all)

**Best Quality Sort Option for Signals**
- New "⭐ Best Quality" option in Signals FilterPanel sort dropdown
- Default sort option showing highest-rated signals with most sales first
- Quality-first sorting: rating → sales → reviews → date

### Changed

**Signal Sort Dropdown**
- Added "⭐ Best Quality" as first/default option
- Reordered options: Best Quality, Newest, Price Low→High, Price High→Low, Most Popular
- Explicit sort selection now properly respected (fixes price sorting issues)

**PredictorFilters Type**
- Added `verified?: boolean` to `PredictorFilters` interface
- API now passes `verified` param when filter is active

**Signals API**
- `fetchSignals()` no longer sends `sortBy` when using quality-first default
- Explicit sort selections properly mapped to backend params

---

## [0.12.0] - 2025-12-09 🛡️ FRONTEND VALIDATION & POLISH

### Added

**Reserved Names & Handles Validation (Frontend)**
- `RESERVED_DISPLAY_NAMES` array with 30+ prohibited display names
- `isReservedDisplayName()` function with case-insensitive + partial match checking
- `RESERVED_SOCIAL_HANDLES` array for Twitter, Telegram, Discord
- `isReservedSocialHandle()` function to prevent impersonation of official accounts
- Zod `.refine()` validation on displayName, twitter, telegram, discord fields

**Avatar URL Length Limit**
- Added `.max(500)` validation to avatarUrl field in EditProfileModal
- Prevents excessively long URLs (like Dropbox preview links) that fail backend validation
- User-friendly error message suggesting postimages.org

**Bio Text Truncation Fix**
- Added `break-all` CSS class to PredictorCard and PredictorInfoCard bio sections
- Long unbroken strings (e.g., "sssssss...") now properly wrap and show ellipsis
- Works with existing `line-clamp-2` and `line-clamp-3` utilities

### Changed

**Admin Badge Rename**
- Changed "🔐 Multisig" badge to "🔐 Admin" in AuthButton
- Updated tooltip from "Multisig signer wallet detected" to "Admin wallet detected"
- Better reflects actual functionality (admins handle reports/disputes, not just signing)

**useIsAdmin Hook Documentation**
- Updated comments to clarify admin vs multisig distinction
- Added note that admin privileges are off-chain only
- Added comment for adding new admins

---

## [0.11.0] - 2025-12-09 🔗 ADMIN BLACKLIST VIA SMART CONTRACT

### Added

**Smart Contract Blacklist Integration**
- New `useProposeBlacklist` hook for calling `proposeBlacklist` on PredictorAccessPass contract
- Admin blacklist/unblacklist now creates MultiSig proposals on-chain
- Confirmation modal explaining MultiSig process (requires 2 more approvals)
- Success state shows transaction hash and actionId for further approvals
- Error handling with user-friendly messages for transaction rejections

**Extended PredictorAccessPass ABI**
- Added `proposeBlacklist(address, bool)` function
- Added `isBlacklisted(address)` view function
- Added `ActionProposed` and `PredictorBlacklisted` events

### Changed

**Admin Blacklist Flow**
- Blacklist button now opens confirmation modal instead of direct API call
- Shows warning about MultiSig requirement before proceeding
- Displays next steps after successful proposal (go to BscScan, approve with other signers)
- Transaction hash and actionId displayed for tracking

**Verification Progress Bar Fix**
- Now uses `predictor.totalSales` as primary source (synced from receipts)
- Falls back to `earnings.totalSalesCount`, then signal calculation
- Fixed earnings calculation to use explicit undefined check (allows 0 as valid value)
- Progress bar now increments properly instead of showing 0% until target met

### Technical Details
- `useProposeBlacklist` hook manages transaction lifecycle (pending → confirming → success/error)
- Extracts `actionId` from `ActionProposed` event logs
- Uses `parseWalletError` for user-friendly error messages
- Proper TypeScript typing for viem log decoding

---

## [0.10.0] - 2025-12-09 🛠️ POLISH & FIXES

### Added

**Terms and Conditions Page**
- Comprehensive legal Terms and Conditions page at `/terms`
- 12 sections covering: Introduction, Platform Nature (NFT marketplace disclaimers), User Responsibilities, Predictor Terms, Fees, NFT Ownership, Prohibited Activities, Disclaimers, Indemnification, Modifications, Governing Law, Contact Information
- Positions platform as NFT marketplace, NOT financial advisors or gambling
- Contact information with email, Discord, and X links

**Maintenance Mode**
- `MaintenancePage` component with customizable message and end time
- Enable via `VITE_MAINTENANCE_MODE=true` in `.env.local`
- Optional `VITE_MAINTENANCE_MESSAGE` for custom message
- Optional `VITE_MAINTENANCE_END_TIME` for expected end time display
- Documented in RUNBOOK.md

**Legal Feature Module**
- New `/features/legal` module with barrel exports
- `TermsPage` component with full legal terms

**Maintenance Feature Module**
- New `/features/maintenance` module with barrel exports
- `MaintenancePage` component for site downtime

### Changed

**Footer Updates**
- Added "Terms" link to footer (React Router Link)
- Added "Contact" email link (mailto:contact@signalfriend.com)
- Changed "Twitter" to "X" with correct branding
- Updated Discord link to `https://discord.gg/jSRspBYK`
- Updated X link to `https://x.com/signalfriend1`
- Footer now shows: Terms | Contact | Discord | X

**Signals Page**
- Updated subtitle from refund claims to: "Browse trading signals sorted by rating, sales, and verified status. All purchases are secured by smart contracts on BNB Chain."

**App.tsx**
- Added maintenance mode check before rendering router
- Imports MaintenancePage from maintenance feature

### Fixed
- Removed inaccurate refund protection claims from Signals page

---

## [0.9.0] - 2025-12-08 ✅ PHASE 3 MISC FIXES COMPLETE

### Added

**Admin Manual Verification System**
- Admin can manually verify/unverify any predictor from their profile page
- New "Admin Actions" section on predictor profiles with Verify and Blacklist buttons
- `useManualVerifyPredictor()` and `useUnverifyPredictor()` React Query hooks
- API endpoints: `POST /api/admin/predictors/:address/manual-verify` and `/unverify`

**Admin Earnings Display**
- "Admin Only - Earnings" card on predictor profile pages (visible to admins only)
- Shows: Total Earnings, From Sales, From Referrals, Platform Fee (5%)
- Shows total sales revenue and count at bottom
- Uses green theme consistent with site design

**Predictor Dashboard Referral Card**
- Referral Earnings card now always visible (not just when has referrals)
- Shows referral count and earnings
- When no referrals: shows explanation about earning $5 per referral
- Updated to green theme (was pink/purple)

**Verified Badge on Predictors Page**
- PredictorCard now shows green "Verified" badge with checkmark icon
- Matches the verified badge style on predictor profile pages
- Uses Badge component with `variant="success"`

**Referral Address Validation**
- Lenient address format validation (accepts any valid hex address regardless of EIP-55 checksum casing)
- Added `isValidAddressFormat()` helper that validates format without strict checksum
- Added `normalizeAddress()` helper to convert addresses to proper checksum format
- Improved error messages:
  - Invalid format: "Invalid address format. Please enter a valid wallet address (0x...)"
  - Valid address, not a predictor: "This address is not a registered predictor. Only existing predictors can be used as referrers."
- Immediate loading state when format is valid while checking predictor status

### Changed

**Admin Section UI Improvements**
- "Admin Only - Contact Info" card now uses green theme (was purple/pink)
- "Admin Only - Earnings" card uses green theme
- Admin action buttons now in "Admin Actions" container with proper spacing
- Verify button uses `primary` variant (orange/gold)
- Blacklist button uses `danger` variant (red)
- Buttons displayed side-by-side with flex gap

**AdminPredictorProfile Type**
- Added `earnings` object with all earnings fields (totalSalesRevenue, predictorEarnings, referralEarnings, totalEarnings, platformCommission, etc.)
- Added `verificationStatus` field

### Fixed
- Verification Progress card no longer shows for already verified predictors
- Admin buttons properly spaced (were attached before)
- Referral card color scheme matches site design

---

## [0.8.0] - 2025-12-08 🔒 COMPLETE BLACKLIST SYSTEM OVERHAUL

### Added

**Blacklisted Predictor Restrictions**
- "Edit Profile" button disabled when blacklisted (with tooltip)
- "Create Signal" button disabled when blacklisted (with tooltip)
- Blacklist banner message updated to mention profile editing restriction

**Required Profile Fields**
- Red asterisks (*) on Display Name, Telegram, and Discord fields
- Notice banner explaining required fields
  - Form validation prevents saving without required fields

**Report URL Validation**
- Real-time URL detection in report descriptions
- Red border and warning when URL is detected
- Submit button disabled when URL is present
- Blocks: http://, https://, www., and common TLDs

**Auto-Refresh Improvements**
- Reports list auto-refreshes in admin dashboard when new report is created
- All predictor queries invalidated on blacklist/unblacklist actions

### Changed

**Blacklist/Unblacklist Hooks**
- Now invalidate ALL predictor-related queries (dashboard, public profile, signals)
- Invalidate admin predictor profile query
- Ensures UI stays in sync across all views

**Predictor Profile Bio**
- Added `break-words whitespace-pre-wrap overflow-hidden` to prevent long text overflow

**Preferred Contact Default**
- Explicitly validates and defaults to 'discord' if not set
- More robust handling of invalid/missing values

### Fixed
- Blacklisted predictor signals now hidden on their profile page (backend fix)
- Specific predictor signal queries now check blacklist status
- UI properly refreshes after unblacklist from admin dashboard
- Predictor dashboard reflects blacklist status immediately
- Disputes auto-resolve when predictor is unblacklisted

---

## [0.7.0] - 2025-12-08 🐛 BLACKLIST SYSTEM & ADMIN IMPROVEMENTS

### Added

**Admin Contact Info Display**
- Admins can now see predictor's telegram, discord, and preferred contact on profile
- New purple "Admin Only - Contact Info" section on predictor profiles
- `useAdminPredictorProfile()` hook fetches full predictor data for admins
- "Preferred" badge shows which contact method the predictor prefers

**Blacklist Warning Banner**
- Blacklisted predictor profiles now show a prominent red warning banner
- Informs users that signals from this predictor cannot be purchased

**Save Notes Feature**
- Admin notes in Reports and Disputes can now be saved independently
- "Save Notes" button appears when notes are modified
- No longer requires changing status to save notes

### Changed

**PurchaseCard Component**
- Added `isPredictorBlacklisted` prop
- Button shows "Predictor Blacklisted" and is disabled for blacklisted predictors

**SignalDetailPage**
- Shows warning banner when predictor is blacklisted
- Passes blacklist status to PurchaseCard
- Double-checks blacklist before opening purchase modal

**PredictorProfilePage**
- Fetches admin profile with contact info when admin is viewing
- Invalidates signals queries after blacklist/unblacklist for UI refresh

**EditProfileModal**
- `displayName`, `telegram`, and `discord` are now required fields
- `preferredContact` defaults to 'discord' and is required
- Save button is disabled until all required fields are valid
- Real-time validation (`mode: 'onChange'`) for immediate feedback

### Fixed
- Signals from blacklisted predictors no longer appear in marketplace
- Cannot purchase signals from blacklisted predictors
- UI refreshes properly after blacklist/unblacklist without page reload
- Admin notes can now be edited after initial save
- Signal creation now validates URLs in real-time for title, description, and content fields

---

## [0.6.0] - 2025-12-07 📝 BUYER REPORTS & ADMIN BLACKLIST MANAGEMENT

### Added

- **Buyer Report Signal Feature**:
  - `ReportSignalModal` component with reason dropdown and description
  - Report reasons: False Signal, Misleading Info, Scam, Duplicate Content, Other
  - One report per purchase (tokenId-based)
  - Description field (required for "Other" reason)
  - Warning notice about false reports
  - `reports.api.ts` with `createReport()` and `checkReportExists()` functions
  - `useReports.ts` hooks (`useCheckReport`, `useCreateReport`)
  - Report section on SignalDetailPage for purchased signals
  - Shows "Already Reported" state after submitting

- **Admin Blacklist Button on Predictor Profiles**:
  - Blacklist/Unblacklist button on PredictorProfilePage (admin only)
  - Red "Blacklist Predictor" button for non-blacklisted predictors
  - "Unblacklist Predictor" button with confirmation for blacklisted ones
  - Warning indicator when predictor is currently blacklisted
  - Separate API functions: `blacklistPredictor()`, `unblacklistPredictor()`
  - Separate hooks: `useBlacklistPredictor()`, `useUnblacklistPredictor()`

- **Blacklisted Predictors Tab in Admin Dashboard**:
  - New "Blacklisted" tab showing all blacklisted predictors
  - `BlacklistedPredictorCard` component with predictor stats
  - Unblacklist action with confirmation prompt
  - Link to view predictor profile
  - Reminder about on-chain MultiSig action
  - Badge count in tab header
  - Auto-refresh after blacklist/unblacklist actions

- **API Endpoints** added to `api.config.ts`:
  - `REPORTS` - Create report
  - `REPORT_CHECK` - Check if report exists for tokenId
  - `ADMIN_BLACKLISTED_PREDICTORS` - List blacklisted predictors
  - `ADMIN_UNBLACKLIST` - Unblacklist predictor

- **Types** added to `admin.types.ts`:
  - `BlacklistedPredictor` interface

### Changed
- Admin dashboard now has 5 tabs (Earnings, Verifications, Reports, Disputes, Blacklisted)
- `useBlacklistPredictor` and `useUnblacklistPredictor` now invalidate blacklisted list

### Fixed
- Admin reports API response structure (was `data: reports[]`, now `data: { reports, pagination }`)

---

## [0.5.0] - 2025-12-07 🛡️ ADMIN DASHBOARD & MODERATION SYSTEM

### Added

- **Admin Dashboard Page** (`/features/admin/pages/AdminDashboardPage.tsx`):
  - Tab-based navigation (Earnings, Verifications, Reports, Disputes)
  - Real-time badge counts for pending items
  - Only accessible to admin wallets via AdminRoute guard
  - Dark theme consistent with app design

- **Platform Earnings Tab**:
  - `AdminStatsCard` component with earnings breakdown
  - Revenue from predictor joins ($15 per join after referral)
  - Revenue from buyer access fees ($0.50 per purchase)
  - Revenue from commissions (5% of signal volume)
  - Total earnings with details (predictors, purchases, volume)
  - Quick stats panel for pending verifications and disputes

- **Verifications Management**:
  - `VerificationRequestCard` component
  - List pending verification requests
  - Predictor info (name, wallet, bio, contact method, social links)
  - Approve/Reject buttons with loading states
  - Direct contact links (Telegram, Discord icons)

- **Reports Management**:
  - `ReportCard` component with expandable details
  - Reports list with status filtering (pending/reviewed/resolved/dismissed)
  - Signal info (title, price, link to detail page)
  - Reporter and predictor addresses with copy functionality
  - Admin notes (editable textarea)
  - Status workflow: pending → reviewed → resolved/dismissed
  - Pagination support

- **Disputes Management**:
  - `DisputeCard` component with expandable details
  - Disputes list with status filtering (pending/contacted/resolved/rejected)
  - Predictor info with sales/signals stats
  - Contact links (Telegram, Discord)
  - Admin notes for tracking communication
  - "Resolve & Unblacklist" action (clears blacklist in DB)
  - Pagination support

- **Predictor Blacklist Banner** (`/features/predictors/components/BlacklistBanner.tsx`):
  - Banner shown to blacklisted predictors on their dashboard
  - Explains blacklist status and dispute option
  - "File Dispute" button to request admin review
  - Shows dispute status after filing (pending/contacted/resolved/rejected)
  - Integrated with PredictorDashboardPage

- **Predictor Disputes API** (`/features/predictors/api/disputes.api.ts`):
  - `createDispute()` - File a dispute (blacklisted predictors only)
  - `getMyDispute()` - Check own dispute status
  - `useMyDispute` and `useCreateDispute` React Query hooks

- **Admin Header Link**:
  - "Admin" navigation link in Header
  - Only visible to admin wallets (3 MultiSig signers)
  - Visible on both desktop and mobile navigation

- **Admin Feature Module**:
  - `types/admin.types.ts` - TypeScript interfaces
  - `api/admin.api.ts` - API functions for all admin endpoints
  - `hooks/useAdmin.ts` - React Query hooks with proper cache invalidation
  - Component barrel exports for clean imports
  - Page barrel exports

- **API Endpoints** added to `api.config.ts`:
  - `ADMIN_STATS` - Platform earnings
  - `ADMIN_REPORTS` - Reports listing
  - `ADMIN_REPORT_BY_ID` - Single report
  - `ADMIN_DISPUTES` - Disputes listing
  - `ADMIN_DISPUTE_COUNTS` - Counts by status
  - `ADMIN_DISPUTE_BY_ID` - Single dispute
  - `ADMIN_DISPUTE_RESOLVE` - Resolve dispute
  - `DISPUTES` - Predictor create dispute
  - `DISPUTE_ME` - Predictor's own dispute

### Changed
- Router now uses real `AdminDashboardPage` instead of placeholder

### Fixed
- Duplicate `Receipt` interface export in signals/api (renamed to `ReceiptWithSignalInfo`)

---

## [0.4.0] - 2025-12-06 🐛 UI BUG FIXES & MOBILE IMPROVEMENTS

### Added
- **CopyableAddress Component** (`/shared/components/ui/CopyableAddress.tsx`):
  - Reusable component for displaying wallet addresses with copy-to-clipboard
  - Truncated display (0x1234...5678) with full address on copy
  - Visual feedback: checkmark icon appears for 2 seconds after copying
  - Size variants: `sm` and `md`
  - Used in: Predictor Profile, Predictor Cards, Signal Detail (PredictorInfoCard)

- **Mobile Hamburger Menu** in Header:
  - New hamburger icon button for mobile navigation
  - Collapsible navigation menu on mobile devices
  - Menu closes automatically when a link is clicked
  - Proper accessibility with aria-label and aria-expanded

### Changed
- **Header Mobile Responsiveness**:
  - Reduced header height on mobile (h-16 vs h-20 on desktop)
  - Smaller logo on mobile (h-10/w-10 vs h-14/w-14)
  - Scaled down AuthButton on mobile (scale-90)
  - Navigation now accessible via hamburger menu on mobile

- **Predictors Page Search Filter** (Bug Fix):
  - Fixed issue where search filter couldn't be cleared/reset
  - Added clear button (✕) inside the search input
  - Search can now be cleared via: X button, Reset button, or deleting text + Enter
  - Parent component now properly removes filter keys instead of keeping undefined values

- **Quick Filters Highlight Logic** (Bug Fix):
  - Quick filters now only highlight when BOTH sortBy AND sortOrder match
  - "Oldest" no longer incorrectly highlights "New Predictors"
  - "Lowest Rated" no longer incorrectly highlights "Best Rated"
  - "Least Sales" no longer incorrectly highlights "Top Sellers"

- **Pagination Scroll Behavior** (Bug Fix):
  - All pagination controls (arrows AND page numbers) now scroll to top consistently
  - Uses setTimeout to ensure scroll happens after React re-render
  - Unified behavior across all pagination buttons

### Fixed
- Mobile navigation hidden when wallet connected
- Wallet address overlapping navigation on mobile
- Connect wallet button too large on mobile
- Search filter text re-appearing after deletion
- Inconsistent scroll behavior between pagination arrows and page numbers

---

## [0.3.2] - 2025-12-06 🖼️ AVATAR SECURITY & UX IMPROVEMENTS

### Added
- **"View Profile" Button** on Predictor Dashboard:
  - Quick access to view own public profile
  - Located alongside Edit Profile and Create Signal buttons
  - Uses eye icon for clear visual indication

- **Image Hosting Tip** for Avatar URL:
  - Added recommendation for postimages.org (free, no signup required)
  - Clickable link opens in new tab

### Changed
- **Avatar URL Validation** (Security Fix):
  - Only JPG, PNG, and GIF images are now allowed
  - **SVG files are blocked** for security reasons (can contain malicious JavaScript/XSS)
  - Validation on both frontend and backend (defense in depth)
  - Clear error message: "Only JPG, PNG, and GIF images are allowed (no SVG for security reasons)"

- **Profile Completeness Check**:
  - Now requires **all 6 fields**: Display Name, Bio, Avatar URL, Twitter, Telegram, Discord
  - Updated banner message to mention all required fields

### Security
- SVG files can contain embedded JavaScript and XSS attacks
- GIF files are safe (raster format, no executable code)
- Backend validates image extensions before saving to database

---

## [0.3.1] - 2025-12-06 🔄 REAL-TIME UNIQUENESS VALIDATION

### Added
- **Real-time Field Uniqueness Checking** in Edit Profile Modal:
  - Live validation for Display Name, Telegram, and Discord handles
  - Visual indicators: spinner while checking, green check for available, red X for taken
  - Debounced API calls (500ms) to prevent excessive requests
  - Submit button disabled until uniqueness checks pass
  - `useCheckFieldUniqueness` hook with debounce
  - `checkFieldUniqueness` API function

### Changed
- **Profile Completeness Banner**:
  - Now requires ALL fields: Display Name, Bio, Avatar URL, Telegram, and Discord
  - Updated messaging to reflect full profile requirements
  
- **Avatar URL Validation**:
  - Better error message: "Please enter a valid image URL (must start with http:// or https://)"
  
- **Bio Validation**:
  - Added URL/link detection to prevent links in bio
  - Shows "No links allowed" helper text

### Note
- **Twitter/X is NOT unique** - This is intentional to prevent scammers from blocking legitimate users by claiming their Twitter handles

---

## [0.3.0] - 2025-12-05 ✏️ EDIT PREDICTOR PROFILE

### Added
- **EditProfileModal** (`src/features/predictors/components/EditProfileModal.tsx`):
  - Full profile editing for predictors
  - Fields: Display Name, Avatar URL, Bio, Twitter, Telegram, Discord, Preferred Contact
  - Form validation with Zod schema
  - Character counters for name and bio
  - Privacy indicators (Telegram/Discord marked as private)
  - Pre-fills form with current predictor data
  - Updates auth store on successful save

- **Profile Incomplete Banner**:
  - Shows on dashboard when predictor has no display name or bio
  - Encourages profile completion for better sales
  - Links directly to Edit Profile modal

- **Edit Profile Button** on Predictor Dashboard:
  - Located next to "Create Signal" button
  - Opens EditProfileModal

### Changed
- **useUpdateProfile hook**: Now updates auth store with new predictor data on success
- **updatePredictorProfile API**: Added `avatarUrl` support, uses `socialLinks` object format

### Privacy Notes
- **Public fields**: Display Name, Avatar URL, Bio, Twitter/X handle
- **Private fields** (visible only to admin and predictor): Telegram, Discord, Preferred Contact

---

## [0.2.2] - 2025-12-05 📏 SIGNAL CONTENT LIMIT FIX

### Fixed
- **Request Entity Too Large Error**: Reduced signal content character limit from 10,000 to 1,000
  - **Root Cause**: Large signal content caused "request entity too large" error when creating signals
  - **Solution**: Reduced max content length to 1,000 characters (same as description)
  - This is sufficient for signal content and prevents oversized requests

### Changed
- Updated `createSignalSchema` content max length from 10,000 to 1,000 characters
- Updated `CreateSignalModal` character counter to show `/1000` instead of `/10000`

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
- **BecomePredictorPage** (`src/features/predictors/pages/BecomePredictorPage.ts`):
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
