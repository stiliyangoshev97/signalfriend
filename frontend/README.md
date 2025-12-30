# 📱 SignalFriend Frontend

> React + TypeScript + Vite frontend for the SignalFriend **Web3 Prediction Signals Marketplace**.  
> **Version:** 0.31.0 | **Last Updated:** December 2025

## 🌐 Production

| Service | URL |
|---------|-----|
| **Live Site** | https://signalfriend.com |
| **WWW (Redirect)** | https://www.signalfriend.com |
| **Vercel Preview** | https://signalfriend.vercel.app |

**Infrastructure:**
- **Hosting:** Vercel (Pro Trial, then $20/month)
- **CDN:** Vercel Edge Network
- **DNS/SSL:** Cloudflare

**Deployment:**
- Auto-deploys from `main` branch on push
- Build: `npm run build`
- Output: `dist` directory

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **WalletConnect Project ID** (get one at https://cloud.walletconnect.com)
- **MetaMask** or any Web3 wallet (for testing)

### Installation

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Edit .env.local with your configuration
# Required: VITE_WALLETCONNECT_PROJECT_ID
# Required: VITE_API_BASE_URL (your backend URL)

# 5. Start development server
npm run dev

# 6. Open http://localhost:5173 in your browser
```

### Verification

After starting the dev server, you should see:
- ✅ Dark themed landing page
- ✅ Navigation header with logo
- ✅ "Connect Wallet" button (RainbowKit)
- ✅ No console errors related to WalletConnect

---

## 🔧 Environment Variables

Create `.env.local` from `.env.example`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | ✅ Yes | `http://localhost:3001/api/v1` | Backend API URL |
| `VITE_WALLETCONNECT_PROJECT_ID` | ✅ Yes | - | WalletConnect Cloud project ID |
| `VITE_CHAIN_ID` | No | `97` | Default chain (97=testnet, 56=mainnet) |
| `VITE_SENTRY_DSN` | No | - | Sentry error tracking DSN |
| `VITE_ENABLE_TESTNET` | No | `true` | Enable BNB Testnet chain |

**Example `.env.local`:**
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_CHAIN_ID=97
VITE_ENABLE_TESTNET=true
```

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| wagmi | 2.x | React Hooks for Ethereum |
| viem | 2.x | Blockchain Interactions |
| RainbowKit | 2.x | Wallet Connection UI |
| TanStack Query | 5.x | Server State Management |
| React Router | 7.x | Routing |
| Zustand | 5.x | Global State Management |
| React Hook Form | 7.x | Form Management |
| Zod | 4.x | Schema Validation |
| Axios | 1.x | HTTP Client |
| Sentry | latest | Error Tracking |

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication (SIWE)
│   │   ├── signals/        # Signal marketplace
│   │   ├── predictors/     # Predictor profiles
│   │   └── admin/          # Admin panel
│   │
│   ├── shared/             # Shared code
│   │   ├── api/            # Axios client
│   │   ├── components/ui/  # Reusable UI components
│   │   ├── config/         # App configuration
│   │   ├── hooks/          # Shared hooks
│   │   ├── schemas/        # Shared Zod schemas
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   │
│   ├── providers/          # React Context providers
│   ├── router/             # React Router setup
│   ├── App.tsx             # App root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
│
├── .env.example            # Environment template
├── .env.local              # Local environment (git-ignored)
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

---

## 🔧 Environment Variables

Create `.env.local` from `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL |
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Cloud project ID |
| `VITE_CHAIN_ID` | No | Default chain (97=testnet, 56=mainnet) |
| `VITE_SENTRY_DSN` | No | Sentry error tracking DSN |
| `VITE_ENABLE_TESTNET` | No | Enable testnet chain |

Get your WalletConnect Project ID at: https://cloud.walletconnect.com

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Type check (without emitting)
npx tsc --noEmit
```

### Development Workflow

1. Start the backend server first: `cd ../backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Open http://localhost:5173
4. Connect your wallet (MetaMask recommended)
5. Make sure your wallet is on BNB Testnet (Chain ID: 97)

### Adding New Features

Follow the feature-based structure:
```bash
src/features/
├── your-feature/
│   ├── components/     # Feature-specific components
│   ├── hooks/          # Feature-specific hooks
│   ├── store/          # Zustand stores (if needed)
│   ├── api.ts          # API functions
│   └── index.ts        # Barrel export
```

---

## 🚀 Deployment

### Vercel Deployment

The frontend is deployed on **Vercel** with the following configuration:

**Build Settings:**
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`
- Node.js Version: 20.x

**Important: SPA Routing Configuration**

The `vercel.json` file contains crucial configuration for Single Page Application (SPA) routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Why this is needed:**
- Without rewrites, refreshing pages like `/signals` or `/predictors` returns 404
- Vercel needs to serve `index.html` for all routes so React Router can handle routing client-side
- This configuration ensures all routes work on direct navigation and page refresh

**Environment Variables:**

Set these in your Vercel project settings:
- `VITE_API_BASE_URL` - Your production backend URL (e.g., https://api.signalfriend.com)
- `VITE_WALLETCONNECT_PROJECT_ID` - From WalletConnect Cloud
- `VITE_CHAIN_ID` - `56` for BSC Mainnet, `97` for testnet
- `VITE_SENTRY_DSN` - (Optional) Sentry error tracking
- `VITE_ENABLE_TESTNET` - `false` for production
- `VITE_DISCORD_URL`, `VITE_TWITTER_URL`, `VITE_CONTACT_EMAIL` - Social links
- Admin addresses and other configuration variables

**Custom Domain:**
1. Add custom domain in Vercel dashboard
2. Configure DNS records (A record or CNAME)
3. SSL certificate auto-generated by Vercel

---

## 🎨 Styling

We use Tailwind CSS with a logo-inspired warm green theme.

### Logo-Inspired Color Palette

The color scheme is extracted from our cute doggy mascot logo:

| Color | Hex | Usage |
|-------|-----|-------|
| `dark-700` | #2D5030 | Main background (forest green) |
| `dark-800` | #1E3A20 | Header/footer (deeper green) |
| `dark-600` | #3E6B3F | Borders (logo circle green) |
| `fur-cream` | #FBE3A8 | Primary text (dog's belly) |
| `fur-light` | #F4C56A | Secondary text (golden fur) |
| `gray-main` | #A4AAB5 | Muted text (goggle gray) |
| `brand-200` | #F4C56A | CTAs/highlights (golden) |
| `success-500` | #4A7D4B | Success states (logo green) |
| `error-500` | #C63732 | Error states (cape red) |

### Additional Logo Colors
- `accent-pink`: #E46A63 (tongue)
- `accent-peach`: #F2A27E (cheek blush)
- `accent-brown`: #4A2C1D (nose)

---

## 🏗️ Building from Scratch - Code Review Guide

This section provides a **step-by-step file creation order** for understanding dependencies or rebuilding the frontend from scratch.

---

### 📋 File Creation Order & Dependencies

> **Legend:** Files are listed in the order they should be created. Dependencies are shown for each file.

---

#### **Phase 1: Configuration & Core Setup (No Dependencies)**

These files have no internal dependencies and must be created first:

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 1 | `src/shared/config/env.ts` | Environment variable access | None |
| 2 | `src/shared/config/contracts.ts` | Contract addresses by chainId | None |
| 3 | `src/shared/types/index.ts` | TypeScript type definitions | None |
| 4 | `src/shared/utils/format.ts` | Formatters (address, price, date) | None |
| 5 | `src/shared/utils/constants.ts` | App-wide constants | None |
| 6 | `src/index.css` | Tailwind imports + global styles | None |

---

#### **Phase 2: API & Schema Layer**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 7 | `src/shared/schemas/common.schemas.ts` | Shared Zod schemas | None |
| 8 | `src/shared/api/client.ts` | Axios instance + interceptors | `env.ts` |
| 9 | `src/shared/api/index.ts` | Barrel export | `client.ts` |

---

#### **Phase 3: Provider Setup (Critical Order)**

Providers must be created and nested in this specific order:

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 10 | `src/providers/QueryProvider.tsx` | React Query client setup | None |
| 11 | `src/providers/Web3Provider.tsx` | Wagmi + RainbowKit config | `env.ts`, `contracts.ts` |
| 12 | `src/providers/SentryProvider.tsx` | Error tracking (optional) | `env.ts` |
| 13 | `src/providers/index.ts` | Barrel export | All above |

**Provider nesting order in `App.tsx`:**
```tsx
<QueryProvider>           {/* 1. React Query - outermost */}
  <Web3Provider>          {/* 2. Wagmi + RainbowKit */}
    <RouterProvider />    {/* 3. React Router - innermost */}
  </Web3Provider>
</QueryProvider>
```

---

#### **Phase 4: Shared UI Components**

Create reusable components before feature-specific ones:

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 14 | `src/shared/components/ui/LoadingSpinner.tsx` | Loading state | None |
| 15 | `src/shared/components/ui/ErrorMessage.tsx` | Error display | None |
| 16 | `src/shared/components/ui/EmptyState.tsx` | Empty list state | None |
| 17 | `src/shared/components/ui/Badge.tsx` | Status badges | None |
| 18 | `src/shared/components/ui/Button.tsx` | Button variants | None |
| 19 | `src/shared/components/ui/Modal.tsx` | Modal wrapper | None |
| 20 | `src/shared/components/ui/Pagination.tsx` | Page navigation | None |
| 21 | `src/shared/components/ui/index.ts` | Barrel export | All above |

---

#### **Phase 5: Shared Hooks**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 22 | `src/shared/hooks/useDebounce.ts` | Debounce input values | None |
| 23 | `src/shared/hooks/usePagination.ts` | Pagination state | None |
| 24 | `src/shared/hooks/useContract.ts` | Contract interaction helpers | `contracts.ts` |
| 25 | `src/shared/hooks/index.ts` | Barrel export | All above |

---

#### **Phase 6: Feature Modules (Create in This Order)**

Each feature has internal files that must be created in order. **Within each feature, always create files in this order:** Types → Schemas → API → Store (if needed) → Hooks → Components → Pages → Index

##### **6.1 Auth Feature (Foundation - Create First)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 26 | `features/auth/types/index.ts` | Auth types (User, etc.) | None |
| 27 | `features/auth/api/auth.api.ts` | API functions (nonce, verify) | `client.ts` |
| 28 | `features/auth/store/authStore.ts` | Zustand auth state | None |
| 29 | `features/auth/hooks/useAuth.ts` | SIWE flow hook | `api`, `store`, wagmi |
| 30 | `features/auth/hooks/useUser.ts` | Current user hook | `store` |
| 31 | `features/auth/components/ConnectButton.tsx` | RainbowKit wrapper | `useAuth` |
| 32 | `features/auth/components/AuthGuard.tsx` | Protected route wrapper | `useAuth` |
| 33 | `features/auth/index.ts` | Barrel export | All above |

##### **6.2 Home Feature (Landing Page)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 34 | `features/home/pages/HomePage.tsx` | Landing page | UI components |
| 35 | `features/home/components/Hero.tsx` | Hero section | None |
| 36 | `features/home/components/Features.tsx` | Feature showcase | None |
| 37 | `features/home/components/Stats.tsx` | Platform stats | Stats API |
| 38 | `features/home/index.ts` | Barrel export | All above |

##### **6.3 Signals Feature (Core Marketplace)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 39 | `features/signals/types/index.ts` | Signal, Category types | None |
| 40 | `features/signals/api/signals.api.ts` | Signal CRUD functions | `client.ts` |
| 41 | `features/signals/api/categories.api.ts` | Categories fetch | `client.ts` |
| 42 | `features/signals/hooks/useSignals.ts` | Signal list query | `api`, React Query |
| 43 | `features/signals/hooks/useSignal.ts` | Single signal query | `api`, React Query |
| 44 | `features/signals/hooks/useCategories.ts` | Categories query | `api`, React Query |
| 45 | `features/signals/hooks/usePurchase.ts` | Purchase flow | `contracts.ts`, wagmi |
| 46 | `features/signals/components/SignalCard.tsx` | Signal preview card | types, utils |
| 47 | `features/signals/components/FilterPanel.tsx` | Category filters | `useCategories` |
| 48 | `features/signals/components/PurchaseButton.tsx` | USDT approve + buy | `usePurchase` |
| 49 | `features/signals/components/SignalContent.tsx` | Protected content | `useAuth` |
| 50 | `features/signals/pages/SignalsPage.tsx` | Marketplace list | All hooks + components |
| 51 | `features/signals/pages/SignalDetailPage.tsx` | Signal detail view | All hooks + components |
| 52 | `features/signals/index.ts` | Barrel export | All above |

##### **6.4 Predictors Feature (Predictor Dashboard)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 53 | `features/predictors/types/index.ts` | Predictor types | None |
| 54 | `features/predictors/api/predictors.api.ts` | Predictor CRUD | `client.ts` |
| 55 | `features/predictors/api/receipts.api.ts` | Sales receipts | `client.ts` |
| 56 | `features/predictors/hooks/usePredictors.ts` | Predictor list query | `api`, React Query |
| 57 | `features/predictors/hooks/usePredictor.ts` | Single predictor | `api`, React Query |
| 58 | `features/predictors/hooks/useMySignals.ts` | Own signals query | `api`, React Query |
| 59 | `features/predictors/hooks/useCreateSignal.ts` | Signal creation | `api`, React Query |
| 60 | `features/predictors/components/PredictorCard.tsx` | Predictor preview | types, utils |
| 61 | `features/predictors/components/MySignalCard.tsx` | Own signal view | types, utils |
| 62 | `features/predictors/components/CreateSignalModal.tsx` | Signal form | `useCreateSignal` |
| 63 | `features/predictors/components/ProfileEditor.tsx` | Edit profile | `usePredictor` |
| 64 | `features/predictors/pages/PredictorsPage.tsx` | Leaderboard | All hooks + components |
| 65 | `features/predictors/pages/PredictorProfilePage.tsx` | Profile view | All hooks + components |
| 66 | `features/predictors/pages/DashboardPage.tsx` | Predictor dashboard | All hooks + components |
| 67 | `features/predictors/index.ts` | Barrel export | All above |

##### **6.5 Admin Feature (Admin Panel)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 68 | `features/admin/api/admin.api.ts` | Admin endpoints | `client.ts` |
| 69 | `features/admin/hooks/useAdmin.ts` | Admin queries | `api`, `useAuth` |
| 70 | `features/admin/components/AdminGuard.tsx` | Admin route protection | `useAuth` |
| 71 | `features/admin/pages/AdminDashboard.tsx` | Admin panel | All hooks |
| 72 | `features/admin/index.ts` | Barrel export | All above |

##### **6.6 Static Pages (No Complex Dependencies)**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 73 | `features/about/pages/AboutPage.tsx` | About page | UI components |
| 74 | `features/faq/pages/FAQPage.tsx` | FAQ page | UI components |
| 75 | `features/legal/pages/*.tsx` | Terms, Privacy pages | UI components |
| 76 | `features/news/pages/NewsPage.tsx` | News/updates page | UI components |
| 77 | `features/maintenance/pages/*.tsx` | Maintenance mode | UI components |

---

#### **Phase 7: Router Configuration**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 78 | `src/router/routes.tsx` | Route definitions | ALL page components |
| 79 | `src/router/index.tsx` | Router setup | `routes.tsx` |

---

#### **Phase 8: Application Entry**

| Order | File | Purpose | Dependencies |
|-------|------|---------|--------------|
| 80 | `src/App.tsx` | Root component + providers | ALL providers, router |
| 81 | `src/main.tsx` | React entry point | `App.tsx` |

---

### 🔗 Dependency Diagram

```
                    ┌─────────────────┐
                    │    main.tsx     │
                    │  (Entry Point)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     App.tsx     │
                    │   (Providers)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌──────────┐       ┌──────────┐        ┌──────────┐
   │providers/│       │  router/ │        │ features/│
   │Query,Web3│       │  routes  │        │ modules  │
   └──────────┘       └──────────┘        └────┬─────┘
                                               │
                                               ▼
                                        ┌──────────┐
                                        │ shared/  │
                                        │api,hooks,│
                                        │components│
                                        └──────────┘

Feature Dependency Chain:

┌────────────┐
│   shared/  │ ◄── Create first (api, components, hooks)
│  config,   │
│    api     │
└────────────┘
      │
      ▼
┌────────────┐
│    Auth    │ ◄── Foundation for protected features
│ store,hook │
└────────────┘
      │
      ├──────────────┬───────────────┐
      ▼              ▼               ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│   Signals  │ │ Predictors │ │   Admin    │
│ (uses Auth)│ │ (uses Auth)│ │(uses Auth) │
└────────────┘ └────────────┘ └────────────┘
      │              │
      └──────┬───────┘
             ▼
┌────────────────────┐
│  Pages (compose    │
│  all components)   │
└────────────────────┘
```

---

### 📂 Feature Module Pattern

Every feature follows this consistent structure:

```
features/[feature]/
├── types/                # 1️⃣ TypeScript types (create first)
│   └── index.ts
├── api/                  # 2️⃣ API functions
│   └── [feature].api.ts
├── store/                # 3️⃣ Zustand store (if needed)
│   └── [feature]Store.ts
├── hooks/                # 4️⃣ React Query + custom hooks
│   └── use[Feature].ts
├── components/           # 5️⃣ Feature-specific components
│   └── [Component].tsx
├── pages/                # 6️⃣ Route page components
│   └── [Feature]Page.tsx
└── index.ts              # 7️⃣ Barrel export
```

**Within each feature, always create files in this order:** Types → API → Store → Hooks → Components → Pages → Index

---

### 🎯 Quick Start for Reviewers

**If reviewing the codebase:**
1. Start with `src/shared/api/client.ts` → understand API setup
2. Read `src/providers/Web3Provider.tsx` → understand wallet integration
3. Study `src/features/auth/` → SIWE authentication flow
4. Study `src/features/signals/hooks/` → React Query patterns
5. Review `src/features/signals/pages/SignalsPage.tsx` → main marketplace
6. Check `src/features/predictors/` → predictor dashboard

**If rebuilding from scratch:**
1. Follow the Phase 1-8 order above
2. Test each phase before moving to the next
3. Start with a minimal router (home + signals) before adding all routes

---

### 📊 Key Patterns Quick Reference

| Pattern | Location | Description |
|---------|----------|-------------|
| API client | `shared/api/client.ts` | Axios with JWT interceptor |
| Auth state | `features/auth/store/authStore.ts` | Zustand for JWT + user |
| Data fetching | `features/*/hooks/` | React Query hooks |
| Wallet state | `providers/Web3Provider.tsx` | Wagmi + RainbowKit |
| Form handling | Feature components | React Hook Form + Zod |
| Protected routes | `features/auth/components/AuthGuard.tsx` | Redirect if unauthenticated |

### 📊 Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| SignalCard | `features/signals/components/` | Signal preview in marketplace |
| MySignalCard | `features/predictors/components/` | Predictor's own signal view |
| FilterPanel | `features/signals/components/` | Two-step category filtering |
| CreateSignalModal | `features/predictors/components/` | Signal creation form |
| PurchaseButton | `features/signals/components/` | USDT approval + purchase flow |
| ConnectButton | `features/auth/components/` | RainbowKit wallet connect |

### 🔄 State Management

| Type | Tool | Usage |
|------|------|-------|
| Server state | React Query | API data fetching & caching |
| Auth state | Zustand | JWT token, user info |
| Wallet state | Wagmi | Connected address, chain |
| Form state | React Hook Form | Form inputs, validation |
| UI state | useState | Component-local state |

---

## 🔐 Authentication

SignalFriend uses **Sign-In with Ethereum (SIWE)** for authentication:

1. User connects wallet via RainbowKit
2. Frontend requests nonce from backend
3. User signs SIWE message with wallet
4. Backend verifies signature and returns JWT
5. JWT stored in localStorage and Zustand

---

## 📚 Related Documentation

- [Backend README](../backend/README.md)
- [Smart Contracts README](../contracts/README.md)
- [Project Overview](../PROJECT.md)
