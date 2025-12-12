# 📋 SignalFriend Backend Runbook

> Complete development, testing, and operations guide.  
> Last Updated: December 2025

---

## 🚀 Quick Start

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start the backend
cd backend
npm run dev

# Terminal 3: Start ngrok (for webhook testing)
ngrok http 3001
```

---

## 🔧 Environment Variables

Key environment variables in `.env`:

```bash
# Server
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/signalfriend

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Blockchain
CHAIN_ID=97
RPC_URL=https://bsc-testnet-rpc.publicnode.com

# Alchemy Webhooks
ALCHEMY_SIGNING_KEY=whsec_xxx

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration (comma-separated wallet addresses)
ADMIN_ADDRESSES=0x...,0x...,0x...
```

---

## 🛡️ Rate Limiting

### Tiered Rate Limits

The API uses production-ready tiered rate limiting to balance security with user experience:

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| Auth Nonce | 60 req | 15 min | `GET /auth/nonce` - supports wallet switching |
| Auth Verify | 20 req | 15 min | `POST /auth/verify` - prevents brute force |
| Read | 200 req | 1 min | All GET endpoints (browsing, listing) |
| Write | 60 req | 15 min | POST/PUT/DELETE (data modification) |
| Critical | 500 req | 15 min | Receipt/purchase endpoints (never block revenue) |
| General | Config | Config | Fallback safety net |

### Testing Rate Limits

#### Comprehensive Test Script

The rate limit test script is located at `/scripts/test-rate-limits.sh` (project root, not backend folder).

**Prerequisites:**
- Backend server must be running (`cd backend && npm run dev`)
- Script must be executable

```bash
# Step 1: Navigate to PROJECT ROOT (not backend folder!)
cd /path/to/SignalFriend

# Step 2: Make script executable (first time only)
chmod +x scripts/test-rate-limits.sh

# Step 3: Ensure backend is running (in another terminal)
# cd backend && npm run dev

# Step 4: Run tests
./scripts/test-rate-limits.sh              # Test ALL tiers
./scripts/test-rate-limits.sh headers      # Quick check - just verify headers
./scripts/test-rate-limits.sh read         # Test read tier (200 req/min)
./scripts/test-rate-limits.sh auth-nonce   # Test auth nonce (60 req/15min)
./scripts/test-rate-limits.sh auth-verify  # Test auth verify (20 req/15min)
./scripts/test-rate-limits.sh write        # Test write tier (60 req/15min)
./scripts/test-rate-limits.sh critical     # Test critical tier (500 req/15min)
```

**Available Tiers:**
| Tier | Command | Limit | Notes |
|------|---------|-------|-------|
| `headers` | `./scripts/test-rate-limits.sh headers` | N/A | Quick check for rate limit headers |
| `auth-nonce` | `./scripts/test-rate-limits.sh auth-nonce` | 60/15min | Tests `/api/auth/nonce` |
| `auth-verify` | `./scripts/test-rate-limits.sh auth-verify` | 20/15min | Tests `/api/auth/verify` |
| `read` | `./scripts/test-rate-limits.sh read` | 200/1min | Tests `/api/signals` (GET) |
| `write` | `./scripts/test-rate-limits.sh write` | 60/15min | Tests `/api/signals` (POST) |
| `critical` | `./scripts/test-rate-limits.sh critical` | 500/15min | Tests `/api/receipts/verify` |
| `all` | `./scripts/test-rate-limits.sh` | All | Runs all tests sequentially |

**Test with custom backend URL (production/staging):**
```bash
API_URL=https://api.signalfriend.com ./scripts/test-rate-limits.sh read
```

**⚠️ Important Notes:**
- Tests will exhaust your rate limit - wait 15 minutes or restart backend to reset
- Run `headers` test first as a quick sanity check
- The `read` test sends 220 requests and takes ~10 seconds

#### Manual Testing (Alternative to Script)

If you prefer manual testing without the script:

```bash
# Quick check: View rate limit headers
curl -I http://localhost:3001/api/signals 2>&1 | grep -i ratelimit

# Test read rate limit (200/min) - sends 210 requests
for i in {1..210}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/signals
done | sort | uniq -c
# Expected: ~200 responses with "200", ~10 with "429"

# Test auth nonce rate limit (60/15min) - sends 70 requests
for i in {1..70}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    "http://localhost:3001/api/auth/nonce?address=0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2"
done | sort | uniq -c
# Expected: ~60 responses with "200", ~10 with "429"
```

**Expected response when rate limited (HTTP 429):**
```json
{
  "success": false,
  "error": "Too many read requests, please try again later."
}
```

### Rate Limit Response Headers

All responses include standard rate limit headers:
```
RateLimit-Limit: 200
RateLimit-Remaining: 195
RateLimit-Reset: 1702234567
```

### Adjusting Rate Limits

For development/testing, you can increase limits in `.env`:
```bash
RATE_LIMIT_WINDOW_MS=60000      # 1 minute window
RATE_LIMIT_MAX_REQUESTS=1000    # 1000 requests (general fallback)
```

**Note:** Tier-specific limits are configured in `src/shared/middleware/rateLimiter.ts`.

### Resetting Rate Limits

```bash
# Option 1: Restart the backend (immediate reset)
npm run dev

# Option 2: Wait for window to expire
# - Read tier: 1 minute
# - All other tiers: 15 minutes
```

---

## 👨‍💼 Admin Configuration

Admins are wallet addresses with elevated privileges (view reports, approve verifications, etc.).

To add new admins, update `ADMIN_ADDRESSES` in `.env`:

```bash
ADMIN_ADDRESSES=0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2,0xNewAdminAddress
```

**Note:** Admin privileges are off-chain only. For on-chain actions (blacklisting), MultiSig is required.

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

## 🔐 Webhook Security

The webhook system includes multiple layers of protection against attacks and duplicate processing.

### Signature Verification

All incoming webhooks are verified using HMAC-SHA256 signature validation:

```typescript
// Alchemy includes x-alchemy-signature header
// We verify: HMAC-SHA256(body, ALCHEMY_SIGNING_KEY) === signature
```

If signature verification fails, the webhook is rejected with 401 Unauthorized.

### Timestamp Validation

Webhooks are validated to prevent replay attacks:

- **Maximum Age:** 5 minutes
- **Clock Skew Tolerance:** 1 minute into the future
- Stale webhooks are logged and rejected

This prevents attackers from capturing and replaying old webhook payloads.

### Idempotency Protection

Each blockchain event is tracked in the `ProcessedWebhookEvent` collection:

- **Event Key:** `{transactionHash}-{topic0}` (unique per event)
- **TTL:** Records auto-delete after 30 days
- Duplicate events are skipped (safe for webhook retries)

This ensures:
1. Alchemy's automatic retries don't cause duplicate processing
2. Manual webhook replays (e.g., from ngrok inspector) are safe
3. Database operations remain consistent

### No Blockchain Polling

The backend does **NOT** poll the blockchain. All blockchain data comes via Alchemy webhooks.

This design:
- Reduces RPC costs
- Eliminates polling-related bugs
- Ensures consistent event ordering
- Handles chain reorgs automatically (Alchemy's responsibility)

### Monitoring Webhook Health

```bash
# Check webhook endpoint health
curl http://localhost:3001/api/webhooks/health

# View processed events in MongoDB
mongosh mongodb://localhost:27017/signalfriend --eval "db.processedwebhookevents.find().sort({processedAt: -1}).limit(10)"

# Count events by type
mongosh mongodb://localhost:27017/signalfriend --eval "db.processedwebhookevents.aggregate([{\\$group: {_id: '\\$eventType', count: {\\$sum: 1}}}])"
```

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

### Seed Test Signals (Bulk)

Create multiple test signals for development and load testing:

```bash
# Preview what would be created (dry run)
npm run seed:signals -- --dry-run

# Create 100 test signals (default)
npm run seed:signals

# Create 100 test signals explicitly
npm run seed:signals:100

# Create 500 test signals
npm run seed:signals:500

# Create custom count
npx tsx src/scripts/seedTestSignals.ts --count=250

# Clear existing test signals before creating new ones
npx tsx src/scripts/seedTestSignals.ts --clear --count=100
```

**What it creates:**
- Realistic signal titles based on category (crypto, tradfi, macro)
- Varied prices ($1-$50 USDT)
- Random risk/reward levels
- Simulated sales counts and ratings
- Creation dates spread over 90 days
- Proper expiry dates (30-180 days after creation)

**Requirements:**
- At least one predictor must exist (join via blockchain or run `seedMissingPredictors`)
- Categories must be seeded first (`npm run seed:categories`)

### Modify Predictor Stats (Verification Testing)

Modify predictor sales and earnings to test the verification application flow without making real purchases.

**Verification Requirements:**
- Minimum 100 sales (`totalSales >= 100`)
- Minimum $1000 USDT in total revenue (aggregated from receipts)

```bash
# List all predictors with their current stats
npm run predictor:stats:list

# Set predictor to meet verification requirements (100 sales, $1000 revenue)
npm run predictor:verify-ready -- --address=0x123...

# Set custom sales and revenue values
npm run predictor:stats -- --address=0x123... --sales=150 --revenue=1500

# Preview changes without applying (dry run)
npm run predictor:stats -- --address=0x123... --sales=100 --revenue=1000 --dry-run

# Reset predictor stats (removes mock receipts, keeps real ones)
npm run predictor:stats -- --address=0x123... --reset
```

**What it does:**
- Updates `totalSales` on the predictor document
- Creates mock receipts with `priceUsdt` to reach target revenue
- Mock receipts use a special transaction hash prefix (`0xMOCK_VERIFICATION_TEST_`)
- Reset removes only mock receipts, preserving real purchase data

**Example workflow:**
```bash
# 1. List predictors to find your test address
npm run predictor:stats:list

# 2. Set stats to meet verification requirements
npm run predictor:stats -- --address=0x4cca77ba15b0d85d7b733e0838a429e7bef42dd2 --sales=100 --revenue=1000

# 3. Apply for verification in the frontend dashboard

# 4. Test admin approval/rejection flow

# 5. Clean up when done testing
npm run predictor:stats -- --address=0x4cca77ba15b0d85d7b733e0838a429e7bef42dd2 --reset
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

## 🗃️ Database Fork/Clone for Testing

When testing migrations, schema changes, or debugging production issues, you'll want to work with a copy of production data without risking the original database. Here are three approaches:

### Option 1: MongoDB Atlas Fork (Recommended for Cloud)

If using MongoDB Atlas, you can create a database fork directly from the Atlas UI:

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Select your cluster → **Actions** → **Clone to New Cluster** (or use Point-in-Time restore)
3. Choose the point-in-time to clone from
4. Select a new cluster tier (M0 free tier works for testing)
5. Wait for the clone to complete (~5-10 minutes)
6. Update your `.env` with the new cluster connection string:
   ```bash
   MONGODB_URI=mongodb+srv://user:pass@your-clone-cluster.mongodb.net/signalfriend
   ```

**Pros:** Zero downtime, automatic, includes all indexes  
**Cons:** May incur additional Atlas charges, slower for large datasets

### Option 2: mongodump/mongorestore (Recommended for Local Testing)

Export production data and import it into a local MongoDB instance:

```bash
# Step 1: Export from production (replace connection string)
mongodump --uri="mongodb+srv://user:pass@production-cluster.mongodb.net/signalfriend" \
  --out=./backup-$(date +%Y%m%d)

# Step 2: Start local MongoDB (if not running)
mongod

# Step 3: Restore to local database (use a different name to avoid confusion)
mongorestore --uri="mongodb://localhost:27017" \
  --db=signalfriend_test \
  ./backup-$(date +%Y%m%d)/signalfriend

# Step 4: Update .env to use local test database
MONGODB_URI=mongodb://localhost:27017/signalfriend_test
```

**Selective Export (specific collections only):**
```bash
# Export only signals and predictors (skip receipts for privacy)
mongodump --uri="mongodb+srv://..." \
  --db=signalfriend \
  --collection=signals \
  --out=./backup-partial

mongodump --uri="mongodb+srv://..." \
  --db=signalfriend \
  --collection=predictors \
  --out=./backup-partial

mongodump --uri="mongodb+srv://..." \
  --db=signalfriend \
  --collection=categories \
  --out=./backup-partial
```

**Pros:** Fast, free, works offline, can be selective  
**Cons:** Manual process, may need to recreate indexes

### Option 3: Fresh Local Database with Seed Data

For a clean testing environment without production data:

```bash
# Step 1: Ensure local MongoDB is running
mongod

# Step 2: Update .env to use a fresh local database
MONGODB_URI=mongodb://localhost:27017/signalfriend_dev

# Step 3: Seed categories
npm run seed:categories

# Step 4: Seed test signal (optional, for webhook testing)
npx tsx src/scripts/seedTestSignal.ts

# Step 5: Create any additional test data as needed
```

**Pros:** Clean slate, no production data risks, fast  
**Cons:** No real data for realistic testing

### Best Practices for Testing Migrations

1. **Always test migrations on a fork/copy first:**
   ```bash
   # 1. Create a database copy (use any method above)
   # 2. Point .env to the copy
   # 3. Run migration with --dry-run first
   npx tsx src/scripts/migrateCategories.ts --dry-run
   # 4. If dry run looks good, run actual migration
   npx tsx src/scripts/migrateCategories.ts
   # 5. Verify results in MongoDB
   mongosh mongodb://localhost:27017/signalfriend_test
   # 6. If successful, repeat on production
   ```

2. **Document the database you're connected to:**
   ```bash
   # Add to your terminal prompt or check before migrations
   echo "Current DB: $MONGODB_URI"
   ```

3. **Keep backups before destructive operations:**
   ```bash
   # Quick backup before migration
   mongodump --uri="$MONGODB_URI" --out=./pre-migration-backup-$(date +%Y%m%d-%H%M)
   ```

4. **Use different database names for different purposes:**
   | Database | Purpose |
   |----------|---------|
   | `signalfriend` | Production |
   | `signalfriend_staging` | Staging/QA |
   | `signalfriend_test` | Migration testing |
   | `signalfriend_dev` | Local development |

### Environment-Specific Configurations

Store different connection strings for different environments:

```bash
# Development (.env.development)
MONGODB_URI=mongodb://localhost:27017/signalfriend_dev

# Testing (.env.test)  
MONGODB_URI=mongodb://localhost:27017/signalfriend_test

# Staging (.env.staging)
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/signalfriend_staging

# Production (.env.production)
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/signalfriend
```

**⚠️ Never commit `.env` files with real credentials to git!**

### Cleanup After Testing

```bash
# Drop test database when done
mongosh mongodb://localhost:27017/signalfriend_test --eval "db.dropDatabase()"

# Or delete backup files
rm -rf ./backup-* ./pre-migration-backup-*
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

``http://127.0.0.1:4040
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

## 🧪 Rate Limit Testing

### Trigger Rate Limit Script

Use this script to test frontend retry logic when API rate limiting kicks in.

```bash
# From project root
cd /Users/stiliyangoshev/Desktop/Coding/Full\ Projects/SignalFriend

# Run the rate limit trigger script
./scripts/trigger-rate-limit.sh
```

**What it does:**
- Sends 110 rapid requests to `/api/signals`
- Rate limit kicks in after ~75 requests (limit is 100 per 15 min window)
- Remaining requests return 429 (Too Many Requests)

**Testing procedure:**
1. Open the frontend signal purchase page
2. Run the script
3. Try to purchase a signal
4. The blockchain transaction should succeed, but API calls will fail
5. The frontend retry logic should recover after rate limit resets

**Reset rate limit:**
- Wait 15 minutes (automatic reset)
- Or restart the backend server

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
