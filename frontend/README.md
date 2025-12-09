# 📱 SignalFriend Frontend

> React + TypeScript + Vite frontend for the SignalFriend Web3 Signal Marketplace.  
> **Version:** 0.12.0 | **Last Updated:** December 2025

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

This section helps reviewers understand the frontend architecture and where to start.

### Entry Point

The application starts at **`src/main.tsx`**:
1. Renders `<App />` with React 19 root
2. App.tsx wraps everything in providers (see below)
3. React Router handles navigation

### Provider Hierarchy

**`src/App.tsx`** sets up providers in this order:
```tsx
<QueryClientProvider>      {/* React Query for server state */}
  <WagmiProvider>          {/* Blockchain wallet state */}
    <RainbowKitProvider>   {/* Wallet connection UI */}
      <AuthProvider>       {/* SIWE auth state (Zustand) */}
        <RouterProvider /> {/* React Router v7 */}
      </AuthProvider>
    </RainbowKitProvider>
  </WagmiProvider>
</QueryClientProvider>
```

### Core Architecture

```
src/
├── main.tsx                    # 👈 START HERE - React entry
├── App.tsx                     # Provider setup
├── index.css                   # Tailwind imports + global styles
├── features/                   # Domain modules (review in order)
│   ├── auth/                   # 1️⃣ SIWE authentication
│   ├── signals/                # 2️⃣ Signal marketplace
│   ├── predictors/             # 3️⃣ Predictor profiles & dashboard
│   └── admin/                  # 4️⃣ Admin panel
├── shared/                     # Shared code
│   ├── api/                    # Axios client + interceptors
│   ├── components/ui/          # Reusable UI components
│   ├── config/                 # API config, contract addresses
│   ├── hooks/                  # useAuth, useContract hooks
│   ├── schemas/                # Zod validation schemas
│   └── types/                  # TypeScript type definitions
├── providers/                  # Context providers setup
│   ├── Web3Provider.tsx        # Wagmi + RainbowKit config
│   └── AuthProvider.tsx        # SIWE auth context
└── router/                     # React Router configuration
    └── index.tsx               # Route definitions
```

### Feature Module Structure

Each feature follows a consistent pattern:
```
features/signals/
├── components/           # UI components
│   ├── SignalCard.tsx
│   ├── FilterPanel.tsx
│   └── ...
├── hooks/                # React Query hooks
│   ├── useSignals.ts
│   └── usePurchase.ts
├── pages/                # Route pages
│   ├── SignalsPage.tsx
│   └── SignalDetailPage.tsx
├── api/                  # API functions
│   └── signals.api.ts
└── index.ts              # Barrel export
```

### Recommended Review Order

1. **`src/providers/Web3Provider.tsx`** - Wallet setup
2. **`src/features/auth/`** - SIWE authentication flow
3. **`src/shared/api/client.ts`** - Axios client with JWT
4. **`src/features/signals/hooks/useSignals.ts`** - React Query pattern
5. **`src/features/signals/pages/SignalsPage.tsx`** - Main marketplace
6. **`src/features/predictors/`** - Dashboard for predictors

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| SignalCard | `features/signals/components/` | Signal preview in marketplace |
| MySignalCard | `features/predictors/components/` | Predictor's own signal view |
| FilterPanel | `features/signals/components/` | Two-step category filtering |
| CreateSignalModal | `features/predictors/components/` | Signal creation form |
| PurchaseButton | `features/signals/components/` | USDT approval + purchase flow |

### State Management

| Type | Tool | Usage |
|------|------|-------|
| Server state | React Query | API data fetching & caching |
| Auth state | Zustand | JWT token, user info |
| Wallet state | Wagmi | Connected address, chain |
| Form state | React Hook Form | Form inputs, validation |
| UI state | useState | Component-local state |

### Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `features/auth/hooks/` | Auth state & SIWE flow |
| `useSignals` | `features/signals/hooks/` | Fetch signal list |
| `useBuySignal` | `features/signals/hooks/` | Purchase flow |
| `useMySignals` | `features/predictors/hooks/` | Predictor's signals |
| `useCategories` | `features/signals/hooks/` | Category list |

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
