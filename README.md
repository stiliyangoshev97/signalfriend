# 🐕 SignalFriend

> **Web3 Transparent Signal Marketplace** — Connect verified prediction makers with traders via secure, on-chain NFT receipts on BNB Chain.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![BNB Chain](https://img.shields.io/badge/Chain-BNB-F0B90B)](https://www.bnbchain.org/)

---

## 📖 Project Explanation

**SignalFriend** is a Web3 marketplace where expert traders (Predictors) sell trading signals to buyers (Traders) using blockchain technology for transparency and trust.

### How It Works

1. **Predictors Register** — Pay a one-time $20 USDT fee to become a verified seller and receive a non-transferable NFT pass
2. **Create Signals** — Predictors post trading predictions with entry/exit points, stop-loss, and timeframes (hidden until purchased)
3. **Buyers Purchase** — Traders browse signals by category, rating, and sales count, then purchase using USDT
4. **NFT Receipt** — Each purchase mints a unique NFT receipt that unlocks the full signal content
5. **Rate & Review** — Buyers can rate signals (1-5 stars, one rating per purchase) to build predictor reputation

### Key Features

- **🔒 Trustless Purchases** — Smart contracts handle all payments and fee splits automatically
- **📊 Transparent Ratings** — All ratings are permanent and tied to verified purchases
- **🏆 Reputation System** — Predictors ranked by sales, ratings, and verified status
- **💰 Fair Fees** — 5% platform commission, 95% goes to predictor
- **🛡️ Dispute System** — Blacklist malicious predictors via MultiSig governance
- **✅ Verification Badges** — Top predictors (100+ sales, $1000+ earnings) can apply for verification

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
