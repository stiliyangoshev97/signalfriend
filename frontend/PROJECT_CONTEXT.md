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
| **Landing Page** | ⏳ 0% | Not started |
| **Signal Marketplace** | ⏳ 0% | Not started |
| **Predictor Profile** | ⏳ 0% | Not started |
| **Purchase Flow** | ⏳ 0% | Not started |
| **My Signals** | ⏳ 0% | Not started |
| **Predictor Dashboard** | ⏳ 0% | Not started |
| **Admin Panel** | ⏳ 0% | Not started |

**Overall Progress: ~40%** (Infrastructure + Auth + Documentation complete, pages pending)

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
- `GET /api/predictors` - List predictors
- `GET /api/categories` - List categories

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
