# 📋 SignalFriend Frontend - Project Context

> Quick reference for AI assistants and developers.  
> Last Updated: 3 December 2025

---

## 📊 Current Status

| Component | Progress | Notes |
|-----------|----------|-------|
| Project Setup | ✅ 100% | Vite + React + TypeScript |
| Logo-Inspired Theme | ✅ 100% | Warm greens + golden tones |
| Web3 Integration | ✅ 100% | wagmi + RainbowKit + BNB Chain |
| Providers Setup | ✅ 100% | Query, Web3, Sentry |
| Base UI Components | ✅ 100% | Button, Input, Card, Modal, etc. |
| Router Setup | ✅ 100% | Routes defined, placeholder pages |
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
| **My Purchased Signals** | ✅ 100% | View/access purchased signals with receipts |
| **Predictor Profile** | ⏳ 0% | Not started |
| **Predictor Dashboard** | ⏳ 0% | Not started |
| **Admin Panel** | ⏳ 0% | Not started |

**Overall Progress: ~75%** (Infrastructure + Auth + Docs + Route Guards + Landing + Marketplace + Signal Detail + Purchase Flow + My Signals complete)

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
├── components/ui/# Reusable UI components
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
- **SignalCard**: Shows "Expires in X days" or "Expired" with red styling
- **SignalDetailPage**: Shows expiry date in Signal Details section
- **PurchaseCard**: Disables purchase for expired signals

### Utility Function
```tsx
// In SignalCard.tsx - exported for reuse
export function getExpiryInfo(expiresAt: string): { isExpired: boolean; text: string }
```

---

## 🎫 My Purchased Signals

### Overview
Users can view all signals they've purchased at `/my-signals`. Each purchase receipt includes access to the unlocked signal content.

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
- Signal title and category
- "Owned" badge
- Purchase date
- Price paid
- Token ID (NFT)
- Predictor address (truncated)
- "View Signal" button → Signal detail page (unlocked content)
- "View TX" button → BSCScan transaction

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
