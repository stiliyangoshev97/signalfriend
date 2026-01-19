# 🐕 SignalFriend

> **Web3 Prediction Signals Marketplace** — Connect verified predictors with buyers seeking expert analysis for prediction market events (Polymarket, Predict.fun, etc.) via secure, on-chain NFT receipts on BNB Chain.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![BNB Chain](https://img.shields.io/badge/Chain-BNB-F0B90B)](https://www.bnbchain.org/)
[![Production](https://img.shields.io/badge/Status-LIVE-brightgreen)](https://signalfriend.com)
[![Frontend](https://img.shields.io/badge/Frontend-v0.32.0-blue)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-v0.35.0-blue)](backend/)

---

## 🌐 Production URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://signalfriend.com | ✅ Live |
| **Backend API** | https://api.signalfriend.com | ✅ Live |
| **Health Check** | https://api.signalfriend.com/health | ✅ Online |

**BSC Mainnet Smart Contracts:**
| Contract | Address |
|----------|---------|
| SignalFriendMarket | `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` |
| PredictorAccessPass | `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` |
| SignalKeyNFT | `0x2a5f920133e584773ef4ac16260c2f954824491f` |

---

## 📖 Project Explanation

**SignalFriend** is a **Web3 Prediction Signals Marketplace** where expert analysts (Predictors) sell prediction signals to buyers seeking insights for prediction market events across Crypto, Politics, Sports, Finance, World Events, and Culture.

### How It Works

1. **Predictors Register** — Pay a one-time $20 USDT fee to become a verified seller and receive a non-transferable NFT pass
2. **Create Signals** — Predictors post prediction analyses with confidence levels, reasoning, and event links (hidden until purchased)
3. **Buyers Purchase** — Browse signals by category, rating, and confidence level, then purchase using USDT
4. **NFT Receipt** — Each purchase mints a unique NFT receipt that unlocks the full signal content
5. **Rate & Review** — Buyers can rate signals (1-5 stars, one rating per purchase) to build predictor reputation

### Key Features

- **🔒 Trustless Purchases** — Smart contracts handle all payments and fee splits automatically
- **📊 Transparent Ratings** — All ratings are permanent and tied to verified purchases
- **🏆 Reputation System** — Predictors ranked by sales, ratings, and verified status
- **💰 Fair Fees** — 5% platform commission, 95% goes to predictor
- **🛡️ Dispute System** — Blacklist malicious predictors via MultiSig governance
- **✅ Verification Badges** — Top predictors (100+ sales, $1000+ earnings) can apply for verification
- **🔮 Multi-Category** — Crypto, Politics, Sports, Finance, World Events, Culture

### Legal Structure

SignalFriend is legally structured as an **NFT-based digital information marketplace**. The NFT is the purchased product (a data ticket), not a bet or wager. There are no payouts based on prediction outcomes — only reputation improvements.

---

## 🏗️ Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS | User interface |
| **Backend** | Node.js, Express, MongoDB, Mongoose | API & data layer |
| **Blockchain** | Solidity, Foundry, BNB Chain | Smart contracts |
| **Web3** | wagmi, viem, RainbowKit | Wallet integration |
| **Auth** | SIWE (Sign-In with Ethereum) + JWT | Secure authentication |

### Smart Contracts

| Contract | Purpose |
|----------|---------|
| **SignalFriendMarket** | Main orchestrator — handles payments, fees, referrals |
| **PredictorAccessPass** | Soulbound NFT for registered predictors |
| **SignalKeyNFT** | Transferable NFT receipt for signal purchases |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- MetaMask or Web3 wallet
- WalletConnect Project ID ([get one here](https://cloud.walletconnect.com))

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/SignalFriend.git
cd SignalFriend

# Install all dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. Environment Setup

```bash
# Frontend
cp frontend/.env.example frontend/.env.local
# Edit: VITE_WALLETCONNECT_PROJECT_ID, VITE_API_BASE_URL

# Backend
cp backend/.env.example backend/.env
# Edit: MONGODB_URI, JWT_SECRET, etc.
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 4. Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health

---

## 📁 Project Structure

```
SignalFriend/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── features/  # Feature modules (auth, signals, predictors, admin)
│   │   ├── shared/    # Shared components, hooks, utils
│   │   └── providers/ # React providers (Web3, Query)
│   └── ...
├── backend/           # Express.js API
│   ├── src/
│   │   ├── features/  # Feature modules (auth, webhooks, signals, etc.)
│   │   ├── contracts/ # ABI files and addresses
│   │   └── shared/    # Middleware, services, utils
│   └── ...
├── contracts/         # Solidity smart contracts (Foundry)
│   ├── src/           # Contract source files
│   ├── test/          # Contract tests
│   └── script/        # Deployment scripts
└── assets/            # Branding, NFT metadata
```

---

## 💰 Business Model

| Fee | Amount | Description |
|-----|--------|-------------|
| **Predictor Join Fee** | $20 USDT | One-time registration fee |
| **Referral Bonus** | $5 USDT | Paid to referrer (existing predictor) |
| **Platform Access Fee** | $0.50 USDT | Added to every signal purchase |
| **Platform Commission** | 5% | Taken from signal price |
| **Predictor Earnings** | 95% | Of signal price goes to predictor |
| **Minimum Signal Price** | $1 USDT | Floor price for signals |

---

## 🎯 Technical Deep Dive 

This section provides a comprehensive technical overview for Web3 engineering interviews.

### Architecture Decisions

**Why BNB Chain?**
- Low transaction fees (~$0.05 per tx) make microtransactions viable
- EVM-compatible, allowing use of battle-tested Solidity patterns
- Fast block times (3 seconds) for good UX

**Why Hybrid Architecture (On-chain + Off-chain)?**
- **On-chain:** Payments, ownership (NFTs), blacklisting, referral tracking — immutable and trustless
- **Off-chain:** Signal content, ratings, profiles — for privacy, editability, and cost efficiency
- **Sync mechanism:** Alchemy webhooks listen for on-chain events and update MongoDB in real-time

**Why SIWE (Sign-In with Ethereum)?**
- Passwordless auth using wallet signatures
- No centralized credentials to steal
- User proves wallet ownership without exposing private keys
- JWT tokens (7-day expiry) for stateless API authentication

### Security Measures

| Layer | Implementation |
|-------|----------------|
| **Smart Contracts** | OpenZeppelin standards, ReentrancyGuard, 2/3 MultiSig for admin actions |
| **API** | Tiered rate limiting (auth: 20/15min, write: 60/15min, read: 200/min) |
| **Authentication** | SIWE + JWT with RS256-equivalent security via 32+ char secrets |
| **Input Validation** | Zod schemas on frontend + backend, URL blocking in user content |
| **Webhooks** | HMAC signature verification, timestamp validation, idempotency keys |
| **CORS** | Strict origin whitelist, credentials required |

### Smart Contract Design

```
SignalFriendMarket (Orchestrator)
├── Handles all USDT payments
├── Splits fees: 95% predictor, 5% platform
├── Tracks referral relationships
└── Calls child contracts

PredictorAccessPass (Soulbound NFT)
├── Non-transferable (ERC721 with transfer disabled)
├── One per wallet address
├── Stores on-chain blacklist status
└── MultiSig-controlled blacklisting (2/3 signatures)

SignalKeyNFT (Receipt NFT)
├── Transferable (can sell/gift access)
├── Minted on purchase
├── Proves ownership for content access
└── ContentId links to off-chain signal data
```

### Event-Driven Architecture

```
User Action → Smart Contract → Blockchain Event
                                    ↓
                            Alchemy Webhook
                                    ↓
                            Backend API → MongoDB
                                    ↓
                            Frontend (TanStack Query invalidation)
```

**Events Handled:**
- `PredictorJoined` → Create predictor profile
- `SignalPurchased` → Create receipt, increment sales
- `PredictorBlacklisted` → Update blacklist status, resolve disputes

### Tech Stack Rationale

| Choice | Why |
|--------|-----|
| **React + Vite** | Fast HMR, modern tooling, excellent TS support |
| **wagmi + viem** | Type-safe Web3 hooks, better than ethers.js for React |
| **RainbowKit** | Best-in-class wallet connection UX |
| **Express + MongoDB** | Flexible schema for evolving product, fast iteration |
| **Foundry** | Fastest Solidity testing, native fuzzing support |
| **TanStack Query** | Automatic caching, background refetching, optimistic updates |
| **Zustand** | Minimal boilerplate state management |
| **Tailwind CSS** | Rapid UI development, consistent design system |

### Testing Strategy

- **Smart Contracts:** Foundry unit tests + fuzz tests (100+ test cases)
- **Backend:** Vitest with 290 unit/integration tests
- **Frontend:** TypeScript strict mode, Zod runtime validation
- **CI/CD:** GitHub Actions runs all tests before merge

### Performance Optimizations

- Lazy-loaded routes (React.lazy + Suspense)
- MongoDB compound indexes for common queries
- TanStack Query caching with stale-while-revalidate
- Optimistic UI updates for better perceived performance

### Audit Results

Full security audit completed with **93/100 score** — see [AUDIT.md](./AUDIT.md) for details.

---

## 🔗 Links

- **Website:** [signalfriend.com](https://signalfriend.com)
- **Discord:** [discord.gg/jSRspBYK](https://discord.gg/jSRspBYK)
- **Twitter/X:** [@signalfriend1](https://x.com/signalfriend1)
- **Contact:** contact@signalfriend.com

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Frontend README](./frontend/README.md) | Frontend setup & development |
| [Backend README](./backend/README.md) | Backend setup & API reference |
| [Contracts README](./contracts/README.md) | Smart contract details |
| [RUNBOOK.md](./RUNBOOK.md) | Common operations & maintenance |
| [PROJECT.md](./PROJECT.md) | Full technical specification |

---

## 🛠️ Development

### Common Commands

```bash
# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm start            # Run production

# Contracts
cd contracts
forge build          # Compile contracts
forge test           # Run tests
```

### Environment Files

| File | Purpose |
|------|---------|
| `frontend/.env.local` | Frontend environment (git ignored) |
| `backend/.env` | Backend environment (git ignored) |
| `*.env.example` | Templates for environment files |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with love using:
- [Vite](https://vitejs.dev/) & [React](https://react.dev/)
- [wagmi](https://wagmi.sh/) & [RainbowKit](https://www.rainbowkit.com/)
- [Foundry](https://book.getfoundry.sh/)
- [BNB Chain](https://www.bnbchain.org/)

---

*Made with 🐕 by the SignalFriend team*
