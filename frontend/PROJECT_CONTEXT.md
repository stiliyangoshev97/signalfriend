# 📋 SignalFriend Frontend - Project Context

> Quick reference for AI assistants and developers.  
> Last Updated: 12 December 2025 (v0.17.1 - Security & Bug Fixes)

---

## 📊 Current Status

| Component | Progress | Notes |
|-----------|----------|-------|
| Project Setup | ✅ 100% | Vite + React + TypeScript |
| Logo-Inspired Theme | ✅ 100% | Warm greens + golden tones |
| Web3 Integration | ✅ 100% | wagmi + RainbowKit + BNB Chain |
| Providers Setup | ✅ 100% | Query, Web3, Sentry |
| Base UI Components | ✅ 100% | Button, Input, Card, Modal, CopyableAddress, AnnouncementBanner, etc. |
| Router Setup | ✅ 100% | Routes defined, React.lazy code splitting |
| Auth Store | ✅ 100% | Zustand with persistence |
| API Client | ✅ 100% | Axios with JWT interceptors |
| Zod Schemas | ✅ 100% | All domain schemas defined |
| **Auth Flow** | ✅ 100% | SIWE authentication (Connect → Sign In → JWT) |
| Logo Integration | ✅ 100% | Cute doggy logo in header/footer |
| **JSDoc Documentation** | ✅ 100% | All files documented with examples |
| **Route Guards** | ✅ 100% | ProtectedRoute, AdminRoute, PredictorRoute |
| **Landing Page** | ✅ 100% | Hero, Features, HowItWorks, CTA sections |
| **Signal Marketplace** | ✅ 100% | Full marketplace with filters, cards, pagination |
| **Signal Detail Page** | ✅ 100% | Full detail view with purchase UI |
| **Purchase Flow** | ✅ 100% | Multi-step modal with USDT approval + purchase |
| **Become a Predictor** | ✅ 100% | Full registration flow with referral validation |
| **My Purchased Signals** | ✅ 100% | View/access purchased signals with receipts |
| **Predictor Dashboard** | ✅ 100% | Stats, signal management, edit profile, referral earnings, reapplication tracking |
| **Predictor List Page** | ✅ 100% | Public leaderboard with filters, verified badges |
| **Predictor Profile** | ✅ 100% | Full profile with signals grid, admin sections |
| **Edit Profile Modal** | ✅ 100% | Full profile editing with uniqueness + reserved name validation |
| **Mobile Responsive** | ✅ 100% | Hamburger menu, proper scaling, copy addresses |
| **Admin Dashboard** | ✅ 100% | Earnings, verifications, reports, disputes, blacklisted tabs |
| **Admin Manual Verify** | ✅ 100% | Verify/unverify any predictor from profile |
| **Admin Earnings View** | ✅ 100% | View predictor's total earnings on their profile |
| **Buyer Report Signal** | ✅ 100% | Report purchased signals with reason dropdown |
| **Admin Blacklist/Unblacklist** | ✅ 100% | Via smart contract MultiSig proposal |
| **Reserved Name Validation** | ✅ 100% | Frontend blocks reserved display names & social handles |
| **Avatar URL Validation** | ✅ 100% | Max 500 chars, blocks excessively long URLs |
| **Verified Predictor Filter** | ✅ 100% | Filter predictors by verified status |
| **Smart Signal Sorting** | ✅ 100% | Quality-first default, respects explicit user selection |
| **News System** | ✅ 100% | AnnouncementBanner + News page with env var control |
| **Verification Reapplication** | ✅ 100% | Progress tracking for rejected predictors |
| **SEO & Meta Tags** | ✅ 100% | useSEO hook, Open Graph, Twitter Cards, page-specific meta |
| **Performance** | ✅ 100% | React.lazy route splitting, useDebounce for search |
| **Security Headers** | ✅ 100% | vercel.json with HTTP security headers for production |

**Overall Progress: ~100%** (All core features complete + production-ready)

---

## 🏗️ Architecture

### Feature-Based Structure
```
src/features/{feature}/
├── api/          # API calls + React Query hooks
├── components/   # Feature-specific components
├── hooks/        # Feature-specific hooks
├── schemas/      # Zod validation schemas
├── store/        # Zustand stores (if needed)
└── types/        # Feature-specific types
```

### Shared Code
```
src/shared/
├── api/          # Axios client
├── components/ui/# Reusable UI components (Button, Input, CopyableAddress, etc.)
├── config/       # Environment, wagmi, contracts
├── hooks/        # Shared hooks (useAuth)
├── schemas/      # Shared Zod schemas
├── types/        # Shared TypeScript types
└── utils/        # Utility functions
```

---

## 🎨 Design System (Logo-Inspired Theme)

### Colors - Extracted from Cute Doggy Logo
- **Background**: `dark-700` (#2D5030) - Muted forest green
- **Header/Footer**: `dark-800` (#1E3A20) - Deeper green
- **Borders**: `dark-600` (#3E6B3F) - Logo circle green
- **Primary Text**: `fur-cream` (#FBE3A8) - Dog's belly cream
- **Secondary Text**: `fur-light` (#F4C56A) - Dog's golden fur
- **Muted Text**: `gray-main` (#A4AAB5) - Goggle gray
- **Accent/CTA**: `brand-200` (#F4C56A) - Golden highlight
- **Success**: `success-500` (#4A7D4B) - Logo green
- **Error**: `error-500` (#C63732) - Cape red

### Logo Color Palette
```javascript
logo: {
  green: '#3E6B3F',      // Circle background
  red: '#C63732',        // Cape/scarf
}
fur: {
  light: '#F4C56A',      // Golden fur
  cream: '#FBE3A8',      // Belly/muzzle
  main: '#E69848',       // Fur shadows
}
accent: {
  pink: '#E46A63',       // Tongue
  peach: '#F2A27E',      // Cheek blush
  brown: '#4A2C1D',      // Nose
}
```

### UI Components Available
- `Button` (primary, secondary, danger, ghost, outline)
- `Input` (with label, error, helper text)
- `Textarea`
- `Select`
- `Card` (with Header, Title, Description, Content, Footer)
- `Modal` (with Footer)
- `Badge` (default, success, warning, error, info)
- `Spinner` / `PageLoader`
- `Avatar`

---

## 🔗 API Integration

### Backend URL
- Development: `http://localhost:3001`
- Production: TBD

### Key Endpoints
- `GET /api/auth/nonce?address=` - Get SIWE nonce
- `POST /api/auth/verify` - Verify SIWE signature
- `GET /api/signals` - List signals
- `GET /api/signals/:contentId/content-identifier` - Get bytes32 for purchase
- `GET /api/receipts/check/:contentId` - Check if user owns signal
- `GET /api/predictors` - List predictors
- `GET /api/categories` - List categories

---

## 💳 Purchase Flow Architecture

### Flow Overview
```
1. User clicks "Purchase Signal"
2. Modal opens with multi-step flow
3. Step 1: Check USDT balance (sufficient?)
4. Step 2: Check USDT allowance → Approve if needed
5. Step 3: Call buySignalNFT on SignalFriendMarket
6. Step 4: Success → Refresh page, unlock content
```

### Self-Purchase Prevention
Predictors cannot purchase their own signals. This is enforced at two levels:
- **Frontend**: `PurchaseCard` checks if `address === signal.predictorAddress` and disables the purchase button
- **Backend**: `getContentIdentifier` endpoint returns 400 error if caller is the signal's predictor

### Hooks Used
| Hook | Purpose |
|------|---------|
| `useCheckPurchase` | Check if user already owns signal |
| `useContentIdentifier` | Get bytes32 for on-chain call |
| `useUSDTBalance` | Read user's USDT balance |
| `useUSDTAllowance` | Check spending allowance |
| `useApproveUSDT` | Approve USDT for market contract |
| `useBuySignal` | Execute buySignalNFT transaction |
| `usePurchaseFlow` | Combined hook for entire flow |

### Contract ABIs (Minimal)
Located in `src/shared/config/abis/index.ts`:
- `SIGNAL_FRIEND_MARKET_ABI` - buySignalNFT, calculateBuyerCost
- `ERC20_ABI` - approve, allowance, balanceOf

### Cost Calculation
- **Signal Price**: Set by predictor (min $5 USDT)
- **Access Fee**: $0.5 USDT flat fee
- **Total Cost**: Signal Price + Access Fee
- **USDT Decimals**: 18 (BNB Chain)

---

## ⏰ Signal Expiration System

### Overview
Signals have a mandatory expiration date (1-30 days from creation) to keep the marketplace fresh.

### Rules
| Scenario | Behavior |
|----------|----------|
| **Creation** | Predictor sets `expiryDays` (1-30), backend calculates `expiresAt` |
| **Marketplace** | Expired signals hidden from listings (`active=true` filter) |
| **Detail Page** | Shows "Expired" badge, purchase button disabled |
| **API Block** | `getContentIdentifier` returns 400 for expired/inactive signals |
| **Buyer Access** | Purchases before expiry retain permanent content access |

### UI Components
- **SignalCard**: Shows compact expiry (e.g., "Expires in 8h", "Expires in 29d") or "Expired" with red styling
- **SignalDetailPage**: Shows expiry date in Signal Details section
- **PurchaseCard**: Disables purchase for expired signals

### Expiry Display Format
The `getExpiryInfo` function returns abbreviated time formats for consistent card layouts:
- Days: `Expires in 29d`
- Hours: `Expires in 8h`
- Minutes: `Expires in 45m`
- Expired: `Expired` (red text)

### Utility Function
```tsx
// In SignalCard.tsx - exported for reuse
export function getExpiryInfo(expiresAt: string): { isExpired: boolean; text: string }
```

---

## 🎫 My Purchased Signals

### Overview
Users can view all signals they've purchased at `/my-signals`. Each purchase receipt includes access to the unlocked signal content.

### Protected Content Flow
Signal content is protected and only revealed to owners. The hooks include multiple guards to prevent 401 errors:

1. **Auth Guards**: All protected hooks check `isConnected`, `hasHydrated`, `isAuthenticated`, and `hasToken` before making API calls
2. **Public Signal Data**: `/api/signals/:contentId` returns metadata only (no `content` field)
3. **Check Ownership**: `useCheckPurchase(contentId)` checks if user has a receipt (only when authenticated)
4. **Fetch Content**: `useSignalContent(contentId, isOwned)` fetches from `/api/signals/:contentId/content` only when `isOwned=true` and authenticated
5. **Display**: `SignalContent` component shows locked/unlocked state

```tsx
// SignalDetailPage.tsx - Protected content flow
const { data: purchaseData } = useCheckPurchase(contentId);
const isOwned = purchaseData?.hasPurchased ?? false;
const { data: contentData } = useSignalContent(contentId, isOwned);

<SignalContent
  isOwned={isOwned}
  fullContent={contentData?.content}  // Only has value when owned
  priceUSDT={signal.priceUsdt}
/>
```

### Route
- **Path**: `/my-signals`
- **Guard**: `ProtectedRoute` (requires wallet + SIWE auth)
- **Component**: `MyPurchasedSignalsPage`

### Features
| Feature | Description |
|---------|-------------|
| Receipt Grid | Displays all purchased signals in responsive grid |
| Sort Options | Newest first, oldest first, highest price, lowest price |
| Empty State | CTA to browse marketplace when no purchases |
| Loading State | Skeleton cards for better UX |
| Error Handling | User-friendly error messages |

### Components
- **MyPurchasedSignalsPage** (`src/features/signals/pages/MyPurchasedSignalsPage.tsx`)
- **PurchasedSignalCard** (`src/features/signals/components/PurchasedSignalCard.tsx`)

### Hooks
| Hook | Purpose |
|------|---------|
| `useMyReceipts` | Fetch user's purchase receipts with pagination/sorting |

### Card Information Displayed
- Signal title and category (format: "MainGroup > Subcategory", e.g., "Crypto > Bitcoin")
- "Owned" badge
- Purchase date
- Price paid
- Token ID (NFT)
- Predictor address (truncated)
- "View Signal" button → Signal detail page (unlocked content)
- "View TX" button → BSCScan transaction

---

## 🏷️ Category System

### Hierarchical Categories
Categories are organized into 3 main groups with subcategories:

| Main Group | Subcategories |
|------------|---------------|
| **Crypto** | Bitcoin, Ethereum, Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, Other |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, Other |
| **Macro / Other** | Economic Data, Geopolitical Events, Sports, Other |

### Display Format
Categories are displayed as `"MainGroup > Subcategory"` throughout the UI:
- Signal cards: "Crypto > Bitcoin"
- Filter panel: Two-step selection (main group first, then subcategory)
- Create signal modal: Two dropdowns for selection

### Data Structure
```typescript
// Category
{
  _id: string;
  name: string;        // Subcategory name (e.g., "Bitcoin")
  mainGroup: string;   // Main group (e.g., "Crypto")
  slug: string;        // URL-friendly (e.g., "crypto-bitcoin")
  icon?: string;
  sortOrder?: number;
}

// Signal includes denormalized mainGroup for efficient filtering
{
  categoryId: string;
  mainGroup: string;   // Denormalized from category
  category?: Category; // Populated when fetched
}
```

---

## 🛒 Purchased Signals Display

### Overview
Purchased signals are displayed with a "Purchased" badge throughout the app. This helps users identify signals they already own, especially on predictor profile pages.

### Key Features
| Feature | Description |
|---------|-------------|
| **"Purchased" Badge** | Gold badge with checkmark displayed on owned signal cards |
| **Show All Signals** | Predictor profiles show ALL signals (not just unpurchased) |
| **Badge Priority** | "Purchased" badge takes priority over "Active" status badge |

### Components
| Component | Change | Purpose |
|-----------|--------|---------|
| `SignalCard` | Added `isPurchased` prop | Display "Purchased" badge |
| `SignalGrid` | Added `purchasedContentIds` prop | Pass purchase status to cards |
| `PredictorProfilePage` | Fetch purchased IDs | Enable badge display |

### API Functions
```typescript
// src/features/signals/api/receipts.api.ts
getMyReceipts(params)         // Fetch user's purchase history
getMyPurchasedContentIds()    // Get all purchased content IDs (paginated)
```

### React Query Hooks
```typescript
// src/features/signals/hooks/useReceipts.ts
useMyPurchasedContentIds(enabled)  // Fetch purchased IDs when authenticated
```

### Integration Flow
1. `PredictorProfilePage` fetches signals WITHOUT `excludeBuyerAddress` filter
2. `useMyPurchasedContentIds` hook fetches user's purchased content IDs
3. `SignalGrid` receives `purchasedContentIds` prop
4. Creates Set for O(1) lookup, passes `isPurchased` to each `SignalCard`
5. `SignalCard` shows "Purchased" badge when `isPurchased === true`

---

## ⭐ Signal Rating System

### Overview
Users can rate purchased signals with a 1-5 star rating. Ratings are **permanent** and cannot be changed or deleted once submitted. This ensures rating integrity and prevents manipulation.

### Key Rules
| Rule | Description |
|------|-------------|
| **One Rating Per Purchase** | Each SignalKeyNFT tokenId can only be rated once |
| **Permanent** | Ratings cannot be updated or deleted after submission |
| **Buyers Only** | Only signal purchasers can rate (not predictors or admins) |
| **Confirmation Required** | Users must confirm before submitting due to permanence |

### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `StarRating` | `src/shared/components/ui/StarRating.tsx` | Interactive/read-only star display |
| `RatingSection` | `src/features/signals/components/RatingSection.tsx` | Rating form for purchased signals |

### API Functions
```typescript
// src/features/signals/api/reviews.api.ts
checkReviewExists(tokenId: number)  // Check if already rated
getReviewByTokenId(tokenId: number) // Get existing review
createReview({ tokenId, score })    // Submit permanent rating
```

### React Query Hooks
```typescript
// src/features/signals/hooks/useReviews.ts
useCheckReview(tokenId)   // Check if review exists
useGetReview(tokenId)     // Get review details
useCreateReview()         // Submit rating mutation
```

### Integration
The `RatingSection` is displayed on `SignalDetailPage` below the signal content, only when:
- User has purchased the signal (`isOwned === true`)
- Purchase receipt has a valid `tokenId`
- User is NOT the predictor viewing their own signal
- User is NOT an admin

---

## ⚠️ Backend Field Mapping (Important!)

### Mongoose Populate vs Frontend Types
The backend uses Mongoose references with `Id` suffix (e.g., `categoryId`, `signalId`, `predictorId`). When populated, Mongoose keeps data in the original field name, but the frontend expects cleaner names.

**Backend transforms these in service layer:**

| Backend Field | Transformed To | Used By |
|---------------|----------------|---------|
| `categoryId` | `category` | Signals |
| `predictorId` | `predictor` | Signals |
| `signalId` | `signal` | Receipts |

### Example Pattern
```typescript
// Backend service transforms after query
const rawSignals = await Signal.find().populate("categoryId").lean();
const signals = rawSignals.map(({ categoryId, predictorId, ...rest }) => ({
  ...rest,
  category: categoryId || null,
  predictor: predictorId || null,
}));
```

### Common Bug
If you see "Untitled Signal", "Uncategorized", or missing data on the frontend, check if the backend is transforming the populated field names correctly.

---

## 🏆 Signal Marketplace Sorting

### Default Sort Order
Signals are always sorted by quality first:
1. `averageRating` (descending) - Best rated first
2. `totalSales` (descending) - Most sales second
3. User's sort preference (tertiary)

This ensures the best signals (highly rated with good sales) appear first without requiring user action.

---

## 🎭 Become a Predictor Flow

### Overview
Users can register as predictors at `/become-predictor`. The page is **publicly accessible** and handles authentication state internally, showing appropriate prompts for unauthenticated users.

### Route Configuration
```tsx
// No ProtectedRoute wrapper - page handles auth internally
<Route path="/become-predictor" element={<BecomePredictorPage />} />
```

### Authentication States
| State | UI Displayed |
|-------|--------------|
| **Not connected** | "Connect Wallet" button via RainbowKit |
| **Connected, not signed in** | "Sign In with Wallet" button |
| **Authenticated, already predictor** | "Already a Predictor" message + dashboard link |
| **Authenticated, not predictor** | Full registration flow |

### Registration Flow Steps
1. **Info Step**: Review benefits, check USDT balance, optional referral
2. **Approve Step** (if needed): Approve USDT spending
3. **Join Step**: Call `joinAsPredictor` on contract
4. **Success Step**: Confirmation + redirect to dashboard

### Key Components
| Component | Purpose |
|-----------|---------|
| `AuthPromptContent` | Shows connect/sign-in prompt |
| `InfoStepContent` | Benefits, balance check, referral toggle |
| `TransactionStepContent` | Approve/join transaction UI |
| `SuccessStepContent` | Success message |
| `StepIndicator` | Visual progress indicator |

### Hooks
| Hook | Purpose |
|------|---------|
| `usePredictorNFTBalance` | Check if user owns PredictorAccessPass NFT |
| `usePlatformParameters` | Read join fee from contract |
| `useUSDTBalanceForPredictor` | Check USDT balance |
| `useUSDTAllowanceForPredictor` | Check USDT allowance |
| `useApproveUSDTForPredictor` | Approve USDT spending |
| `useJoinAsPredictor` | Call joinAsPredictor |
| `useBecomePredictor` | Combined hook for full flow |

### Referral System
- Optional referral toggle in UI
- Supports URL parameter: `/become-predictor?ref=0x...`
- Uses `zeroAddress` when no referrer (required by contract)
- Referrer receives reward from platform parameters

---

## 🔄 Delayed Cache Invalidation Pattern (IMPORTANT!)

### Problem
When blockchain transactions succeed, the backend webhook may not process immediately due to:
- API rate limits
- Network delays
- Webhook queue processing time

This causes the UI to show stale data (e.g., "Purchase" button still showing after successful purchase).

### Solution
Use `useEffect` with multiple delayed `queryClient.invalidateQueries()` calls to retry fetching until webhook processes.

### Implementation Pattern
```typescript
// Used in useBecomePredictor.ts and usePurchase.ts
useEffect(() => {
  if (isTransactionConfirmed) {
    // Immediate invalidation
    queryClient.invalidateQueries({ queryKey: ['predictor'] });
    
    // Delayed invalidations for webhook processing
    const timeouts = [
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['predictor'] });
      }, 2000),
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['predictor'] });
      }, 5000),
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['predictor'] });
      }, 10000),
    ];
    
    // Cleanup to prevent memory leaks
    return () => timeouts.forEach(clearTimeout);
  }
}, [isTransactionConfirmed, queryClient]);
```

### Why This Works
1. **Blockchain confirmation is instant** - wagmi returns immediately after transaction mines
2. **Webhook processing is async** - Backend may take seconds to process blockchain event
3. **Multiple retries** - 2s, 5s, 10s delays ensure we catch the update
4. **React Query deduplication** - Only refetches if query is active and data changed
5. **Cleanup function** - Prevents memory leaks if component unmounts during delays

### When to Use
Use this pattern in any flow where:
- On-chain transaction success must reflect in backend data
- Backend syncs via webhooks (not direct API calls)
- UI needs to show updated state immediately after transaction

### ESLint Note
This pattern triggers `react-hooks/set-state-in-effect` ESLint errors because we're calling `setStep()` in the effect body. Use the inline disable comment:
```typescript
// eslint-disable-next-line react-hooks/set-state-in-effect -- State transition needed for multi-step flow
setStep('success');
```

### Files Using This Pattern
- `src/features/predictors/hooks/useBecomePredictor.ts`
- `src/features/signals/hooks/usePurchase.ts`

---

## ⛓️ Blockchain

### Supported Chains
- **BNB Chain Testnet** (97) - Development
- **BNB Chain Mainnet** (56) - Production

### Contract Addresses (Testnet)
- SignalFriendMarket: `0x5133397a4B9463c5270beBa05b22301e6dD184ca`
- PredictorAccessPass: `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4`
- SignalKeyNFT: `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed`
- MockUSDT: `0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5`

### Wallet Error Handling
Transaction errors are parsed into user-friendly messages using `parseWalletError()` utility.

| Error Type | Title | Color | Is User Action |
|------------|-------|-------|----------------|
| User rejected | "Transaction Cancelled" | Yellow | Yes |
| Insufficient funds | "Insufficient Balance" | Red | No |
| Network error | "Network Error" | Red | No |
| Contract revert | "Transaction Failed" | Red | No |
| Unknown | "Transaction Failed" | Red | No |

```tsx
// Usage in components
import { parseWalletError } from '@/shared/utils';

const { title, message, isUserAction } = parseWalletError(error);
// isUserAction = true means user intentionally cancelled (not an error)
```

---

## 🔍 SEO & Meta Tags (v0.16.0)

### Overview
All pages have proper SEO metadata for search engines and social media sharing.

### useSEO Hook
Custom hook for managing page-specific meta tags dynamically:

```typescript
// Basic usage
useSEO({
  title: 'Trading Signals',
  description: 'Browse premium signals...',
  url: getSEOUrl('/signals'),
});

// Dynamic content
useSEO({
  title: signal ? `${signal.title} - Trading Signal` : 'Signal Details',
  description: signal?.description,
  type: 'article', // 'website' | 'article' | 'profile'
  noIndex: true, // For private pages
});
```

### Features
| Feature | Description |
|---------|-------------|
| Document Title | Sets `<title>` tag with site name suffix |
| Meta Description | For search engine snippets |
| Open Graph | Facebook/LinkedIn preview cards |
| Twitter Cards | Twitter/X preview cards |
| Canonical URL | Prevents duplicate content issues |
| noIndex Option | Excludes private/admin pages from search engines |

### Page-Specific SEO
| Page | Title | Type | Notes |
|------|-------|------|-------|
| HomePage | Default | website | Uses index.html defaults |
| SignalsPage | "Trading Signals Marketplace" | website | Static meta |
| SignalDetailPage | Dynamic (signal title) | article | Generated from signal data |
| PredictorsPage | "Top Predictors Leaderboard" | website | Static meta |
| PredictorProfilePage | Dynamic (predictor name) | profile | Generated from predictor data |
| DashboardPage | "Predictor Dashboard" | website | noIndex=true (private) |
| AdminDashboardPage | "Admin Dashboard" | website | noIndex=true (private) |
| TermsPage | "Terms and Conditions" | website | Legal page |

### Social Media Previews
When users share links on Facebook, LinkedIn, or Twitter:
- Displays SignalFriend logo
- Shows page-specific title and description
- Includes relevant metadata (ratings, stats, etc.)

### Implementation
- Location: `src/shared/hooks/useSEO.ts`
- Uses native DOM manipulation (no external library)
- Works with React 19
- Automatic cleanup on component unmount

---

## 📝 Conventions

### Type Generation
- Use Zod schemas as single source of truth
- Infer types with `z.infer<typeof schema>`
- Avoid duplicate manual type definitions

### File Naming
- Components: PascalCase (`Button.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils: camelCase (`format.ts`)
- Schemas: camelCase with `.schemas` suffix (`auth.schemas.ts`)

### Imports
- Use absolute imports from `@/` when available
- Group imports: React → External → Internal → Types

---

## 🔄 State Management

### Global State (Zustand)
- `useAuthStore` - JWT token, predictor profile, auth status

### Server State (TanStack Query)
- All API data fetched via React Query hooks
- Automatic caching and background refetching

### Local State (React)
- Form state managed by react-hook-form
- UI state (modals, dropdowns) via useState

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `wagmi` | React hooks for Ethereum |
| `viem` | Blockchain interactions |
| `@rainbow-me/rainbowkit` | Wallet connection UI |
| `@tanstack/react-query` | Server state |
| `zustand` | Global state |
| `react-hook-form` | Form management |
| `zod` | Schema validation |
| `axios` | HTTP client |
| `@sentry/react` | Error tracking |
