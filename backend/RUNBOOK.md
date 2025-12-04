# 📋 SignalFriend Backend Runbook

> Complete development, testing, and operations guide.  
> Last Updated: December 2024

---

## 🚀 Quick Start

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start the backend
cd /Users/stiliyangoshev/Desktop/Coding/Full\ Projects/SignalFriend/backend
npm run dev

# Terminal 3: Start ngrok (for webhook testing)
ngrok http 3001
```

---

## 🚧 Maintenance Mode

Use maintenance mode when deploying updates or performing server maintenance.

### Enable Maintenance Mode

```bash
# 1. FIRST: Pause smart contracts on-chain via MultiSig
#    Go to BscScan → SignalFriendMarket → Write Contract → pause()

# 2. Edit .env file
MAINTENANCE_MODE=true
MAINTENANCE_END=2024-12-03T12:00:00Z   # Optional: ETA for users

# 3. Restart the server
npm run dev   # or restart your production server
```

### What Happens During Maintenance
- All API endpoints return **503 Service Unavailable**
- Health check (`/health`) still works (for monitoring)
- Response includes optional ETA if `MAINTENANCE_END` is set:
  ```json
  {
    "success": false,
    "error": "Site is under maintenance. Please try again later.",
    "maintenanceEnd": "2024-12-03T12:00:00Z"
  }
  ```

### Disable Maintenance Mode

```bash
# 1. Edit .env file
MAINTENANCE_MODE=false

# 2. Restart the server
npm run dev   # or restart your production server

# 3. LAST: Unpause smart contracts on-chain via MultiSig
#    Go to BscScan → SignalFriendMarket → Write Contract → unpause()
```

---

## 🚀 Development Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- ngrok (for webhook testing)

### First-Time Setup

```bash
# Navigate to backend directory
cd /Users/stiliyangoshev/Desktop/Coding/Full\ Projects/SignalFriend/backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Start MongoDB (if using local instance)
mongod
```

### Daily Development

```bash
# Start the development server (hot reload enabled)
npm run dev

# The server runs on http://localhost:3001
# Health check: http://localhost:3001/health
```

---

## 🔗 ngrok - Webhook Tunnel

### Why We Use ngrok

Alchemy webhooks need a **publicly accessible URL** to send blockchain events to your local development server. ngrok creates a secure tunnel from the internet to your localhost.

**Flow:**
```
Blockchain Event → Alchemy → ngrok URL → localhost:3001 → Your Express Backend
```

### Starting ngrok

```bash
# Start ngrok tunnel to your backend port
ngrok http 3001

# You'll see output like:
# Forwarding: https://abc123.ngrok-free.dev -> http://localhost:3001
```

### Configuring Alchemy Webhook

1. Copy your ngrok URL (e.g., `https://abc123.ngrok-free.dev`)
2. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/) → Webhooks
3. Create/Edit your webhook
4. Set webhook URL to: `https://abc123.ngrok-free.dev/api/webhooks/alchemy`

⚠️ **Note:** Free ngrok URLs change every time you restart ngrok. Update the Alchemy webhook URL accordingly.

### ngrok Web Inspector

ngrok provides a web interface to inspect all incoming requests:

```
http://127.0.0.1:4040
```

This is extremely useful for:
- Viewing incoming webhook payloads
- Debugging failed requests
- Replaying webhook requests for testing

---

## 🌱 Database Seeding

### Seed Categories

```bash
# Run the category seeding script
npm run seed:categories

# Or manually with tsx
npx tsx src/scripts/seedCategories.ts
```

### Seed Test Signal (for webhook testing)

```bash
# Creates a test signal with known contentId for testing purchases
npx tsx src/scripts/seedTestSignal.ts
```

---

## 🔄 Migration Scripts

Migration scripts are used to update database schema or data. All migration scripts support a `--dry-run` flag to preview changes before applying them.

### Category Migration (v0.16.0)

Migrates flat categories to hierarchical mainGroup/subcategory structure.

```bash
# Step 1: Drop old unique index on category name (required before migration)
npx tsx src/scripts/dropOldCategoryIndexes.ts

# Step 2: Preview migration changes (DRY RUN - no changes made)
npx tsx src/scripts/migrateCategories.ts --dry-run

# Step 3: Apply migration (DESTRUCTIVE - backs up nothing, deletes old categories)
npx tsx src/scripts/migrateCategories.ts
```

**What it does:**
- Deletes all existing flat categories (Crypto, Forex, Stocks, etc.)
- Creates 19 new subcategories across 3 main groups (Crypto, Traditional Finance, Macro / Other)
- Updates existing signals to point to appropriate new categories
- Sets `mainGroup` field on all signals

### Sales Count Recalculation

Recalculates `totalSales` for signals and predictors from actual receipt records.

```bash
# Preview changes (DRY RUN)
npx tsx src/scripts/recalculateSalesCounts.ts --dry-run

# Apply changes
npx tsx src/scripts/recalculateSalesCounts.ts
```

**When to use:** If sales counts are stuck at 0 or out of sync with actual receipts.

### Receipt Price Migration

Adds `priceUsdt` field to receipts that are missing it.

```bash
# Preview changes (DRY RUN)
npx tsx src/scripts/migrateReceiptPrices.ts --dry-run

# Apply changes
npx tsx src/scripts/migrateReceiptPrices.ts
```

### Risk/Reward Migration

Adds `riskLevel` and `potentialReward` fields to signals created before these fields existed.

```bash
# Preview changes (DRY RUN)
npx tsx src/scripts/migrateRiskReward.ts --dry-run

# Apply changes
npx tsx src/scripts/migrateRiskReward.ts
```

### Signal Expiry Migration

Adds `expiresAt` field to signals created before expiry feature.

```bash
# Preview changes (DRY RUN)
npx tsx src/scripts/migrateSignalExpiry.ts --dry-run

# Apply changes
npx tsx src/scripts/migrateSignalExpiry.ts
```

### Seed Missing Predictors

Creates predictor records for wallets that have signals but no predictor profile.

```bash
npx tsx src/scripts/seedMissingPredictors.ts
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

---

## 📜 Useful Scripts

### Generate Event Signatures

```bash
# Generate topic0 hashes for blockchain events
npx tsx src/scripts/generateEventSignatures.ts

# Output:
# PredictorJoined: 0x2f2789d1da7b490fc20c28c5014f1fdd449737869b924042025cd634b2248cc4
# SignalPurchased: 0x906c548d19aa6c7ed9e105a3d02cb6a435b802903a30000aa9ad5e01d93ef647
# PredictorBlacklisted: 0xad6b8655f145f95522485d58e7cd8ca2689dbe89691511217c7cc914b1226005
```

### TypeScript Compilation

```bash
# Check for type errors
npm run build

# Build output goes to dist/
```

### Linting

```bash
npm run lint
```

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/signalfriend` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-jwt-key-here` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CHAIN_ID` | BNB Chain ID (97=testnet, 56=mainnet) | `97` |
| `RPC_URL` | Blockchain RPC endpoint | `https://bsc-testnet-rpc.publicnode.com` |
| `ALCHEMY_SIGNING_KEY` | Webhook signature verification | `whsec_xxxxx` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

---

## 📡 API Endpoints Quick Reference

### Health Check
```bash
curl http://localhost:3001/health
```

### Authentication
```bash
# Get nonce for SIWE
curl "http://localhost:3001/api/auth/nonce?address=0x..."

# Verify signature
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"message": "...", "signature": "..."}'
```

### Webhooks (Alchemy)
```bash
# Alchemy sends POST requests here automatically
# POST http://localhost:3001/api/webhooks/alchemy
```

---

## 🔍 Debugging Webhooks

### Check ngrok Traffic

ngrok provides a web interface to inspect all requests:

```
http://127.0.0.1:4040
```

This shows:
- All incoming webhook requests
- Request/response bodies
- Timing information
- Ability to replay requests

### Manual Webhook Test

You can replay webhooks from the ngrok inspector, or use curl:

```bash
# Example: Test with a mock payload
curl -X POST http://localhost:3001/api/webhooks/alchemy \
  -H "Content-Type: application/json" \
  -H "x-alchemy-signature: test" \
  -d '{"webhookId": "test", "event": {...}}'
```

---

## 📊 MongoDB Commands

### Connect to Local MongoDB

```bash
mongosh mongodb://localhost:27017/signalfriend
```

### Useful Queries

```javascript
// Check predictors
db.predictors.find().pretty()

// Check receipts
db.receipts.find().pretty()

// Check signals
db.signals.find().pretty()

// Clear test data
db.predictors.deleteMany({})
db.receipts.deleteMany({})
db.signals.deleteMany({})
```

---

## 🛠️ Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

### "ngrok tunnel not working"
- Restart ngrok: `ngrok http 3001`
- Update Alchemy webhook URL with new ngrok URL

### "Webhook signature verification failed"
- Check `ALCHEMY_SIGNING_KEY` matches Alchemy dashboard
- Ensure you're using the correct webhook type (GraphQL vs Address Activity)

### "Event not decoded properly"
- Check event signatures match contract ABIs
- Run `generateEventSignatures.ts` to verify hashes

---

## 📍 Contract Addresses (BNB Testnet)

| Contract | Address |
|----------|---------|
| SignalFriendMarket | `0x5133397a4B9463c5270beBa05b22301e6dD184ca` |
| PredictorAccessPass | `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` |
| SignalKeyNFT | `0xfb26Df6101e1a52f9477f52F54b91b99fb016aed` |
| MockUSDT | `0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5` |

---

## 📝 Important Notes

- **USDT Decimals:** BNB Chain USDT uses **18 decimals** (not 6 like Ethereum)
- **ContentId Formats:**
  - Backend (MongoDB): UUID format (`00000000-0000-0000-0000-000000000001`)
  - Smart Contract: bytes32 format (`0x0000000000000000000000000000000100000000...`)
- **Ratings:** Entirely off-chain in MongoDB (removed from smart contracts)
