# SignalFriend Backend

Express + MongoDB + Viem backend API for the SignalFriend platform.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Blockchain**: Viem for BNB Chain interaction
- **Auth**: SIWE (Sign-In with Ethereum) + JWT
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- pnpm/npm/yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/signalfriend
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### Running

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Database Seeding

```bash
# Seed categories
npm run seed:categories
```

## Project Structure

```
src/
├── index.ts                 # App entry point
├── contracts/               # Viem clients & ABIs
│   ├── addresses.ts
│   ├── clients.ts
│   └── abis/
├── features/                # Feature-based modules
│   ├── auth/                # SIWE + JWT authentication
│   ├── predictors/          # Predictor profiles
│   ├── signals/             # Trading signals
│   ├── receipts/            # Purchase receipts (NFTs)
│   ├── reviews/             # Ratings & reviews
│   ├── categories/          # Signal categories
│   └── webhooks/            # Alchemy event indexing
├── scripts/                 # Utility scripts
│   └── seedCategories.ts
└── shared/                  # Shared utilities
    ├── config/              # Environment, DB, logger
    ├── middleware/          # Auth, validation, errors
    ├── types/               # TypeScript types
    └── utils/               # Helpers (ApiError, asyncHandler)
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/nonce?address=0x...` | Get SIWE nonce |
| POST | `/api/auth/verify` | Verify signature, get JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/alchemy` | Alchemy event webhook |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Authentication Flow

1. **Frontend** calls `GET /api/auth/nonce?address=0x...`
2. **Backend** returns a nonce (valid 5 minutes)
3. **Frontend** constructs SIWE message and signs with wallet
4. **Frontend** calls `POST /api/auth/verify` with message + signature
5. **Backend** verifies signature, returns JWT
6. **Frontend** includes JWT in `Authorization: Bearer <token>` header

## Alchemy Webhook Setup

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/) → Webhooks
2. Create Webhook → Custom Webhook → Specific events
3. Add SignalFriendMarket contract address
4. Select events: `PredictorJoined`, `SignalPurchased`, `PredictorBlacklisted`
5. Set webhook URL: `https://your-backend.com/api/webhooks/alchemy`
6. Copy signing key to `ALCHEMY_SIGNING_KEY` env var

## Contract Addresses (BNB Testnet - Chain 97)

| Contract | Address |
|----------|---------|
| SignalFriendMarket | `0x5133397a4B9463c5270beBa05b22301e6dD184ca` |
| PredictorAccessPass | `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` |
| SignalKeyNFT | `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed` |
| MockUSDT | `0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5` |

## Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run test         # Run tests
npm run seed:categories  # Seed default categories
```

## Notes

- **Ratings are entirely off-chain** in MongoDB (removed from smart contracts in v0.6.1)
- One review per purchase receipt (enforced by unique `tokenId` in Review model)
- Blacklisted predictors are hidden from API responses
