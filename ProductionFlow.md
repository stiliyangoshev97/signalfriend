# Production Flow - SignalFriend

> **Solo Founder Deployment Guide for BSC Mainnet**  
> **Last Updated:** December 12, 2025

## Table of Contents
1. [4-Day Deployment Timeline](#4-day-deployment-timeline)
2. [Environment Variables](#environment-variables)
3. [Post-Launch Workflows](#post-launch-workflows)
4. [Emergency Procedures](#emergency-procedures)

---

## 4-Day Deployment Timeline

### 📅 Day 1: Deploy Contracts to BSC Mainnet

**You already tested on BNB Testnet (Chain ID 97), now deploy to mainnet.**

#### Prepare & Deploy (1-2 hours)

```bash
cd contracts

# Create mainnet .env
cat > .env << 'EOF'
PRIVATE_KEY_1=0x...  # Deployer wallet
BNB_MAINNET_RPC_URL=https://bsc-dataseed.binance.org/
BSCSCAN_API_KEY=YOUR_BSCSCAN_API_KEY

# MultiSig (3 of your wallets for security)
MULTISIG_SIGNER_1=0x...
MULTISIG_SIGNER_2=0x...
MULTISIG_SIGNER_3=0x...

# Treasury (receives platform fees)
PLATFORM_TREASURY=0x...

# Real USDT on BSC (BEP-20)
MOCK_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
EOF

# Deploy to BSC Mainnet
source .env && forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BNB_MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $BSCSCAN_API_KEY

# Save addresses from output
```

**Cost:** ~0.1 BNB (~$60 in gas)

#### Complete MultiSig Setup (30 mins)

**Go to BscScan, connect wallets, and approve:**

1. Call `proposeUpdatePredictorAccessPass(NFT_ADDRESS)` with Signer 1
2. Call `approveAction(actionId)` with Signer 2 & 3
3. Repeat for `proposeUpdateSignalKeyNFT(NFT_ADDRESS)`
4. Verify: `isFullyInitialized()` → should return `true`

**Checklist:**
- [ ] All 3 contracts deployed & verified on BscScan
- [ ] MultiSig initialized
- [ ] Contract addresses saved

---

### 📅 Day 2: Test Locally with BSC Mainnet

**⚠️ CRITICAL: Test with real mainnet contracts BEFORE deploying to hosting!**

#### Setup Local Environment (30 mins)

```bash
# Backend (.env.local)
cd backend
cat > .env.local << 'EOF'
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/signalfriend_test
JWT_SECRET=test-secret-32-chars-min
JWT_EXPIRES_IN=7d

# BSC MAINNET
BLOCKCHAIN_RPC_URL=https://bsc-dataseed.binance.org/
BLOCKCHAIN_WS_URL=wss://bsc-ws-node.nariox.org:443
CHAIN_ID=56

# Your mainnet contracts from Day 1
MARKET_CONTRACT_ADDRESS=0x...
NFT_CONTRACT_ADDRESS=0x...
PREDICTOR_PASS_CONTRACT_ADDRESS=0x...
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
EOF

npm run dev
```

```bash
# Frontend (.env.local)
cd frontend
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_BLOCKCHAIN_RPC_URL=https://bsc-dataseed.binance.org/
VITE_CHAIN_ID=56
VITE_MARKET_CONTRACT_ADDRESS=0x...
VITE_NFT_CONTRACT_ADDRESS=0x...
VITE_PREDICTOR_PASS_CONTRACT_ADDRESS=0x...
VITE_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
EOF

npm run dev
```

#### Test Everything (2-3 hours)

**Use test wallet with:**
- ~0.05 BNB for gas
- ~50 USDT for purchases

**Test Checklist:**
```
http://localhost:5173 + MetaMask (BSC Mainnet)

1. [ ] Connect wallet
2. [ ] Register account  
3. [ ] Join as Predictor ($20 USDT) → Check BscScan TX
4. [ ] Create signal ($5 USDT)
5. [ ] Purchase signal (different wallet) → Verify NFT minted
6. [ ] Access signal content
7. [ ] Leave review
8. [ ] Verify all fees correct on BscScan
```

**Document results. ONLY proceed if 100% success!**

---

### 📅 Day 3: Deploy to Vercel & Render

#### Backend to Render (1 hour)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. New Web Service → Connect GitHub
3. Configure:
   - Name: `signalfriend-backend`
   - Region: Singapore (closest to BSC)
   - Root: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`

4. **Environment Variables:**
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.vercel.app
MONGODB_URI=mongodb+srv://...  # Production MongoDB Atlas
JWT_SECRET=<new secret: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<new secret: openssl rand -base64 32>
REFRESH_TOKEN_EXPIRES_IN=30d

# BSC Mainnet
BLOCKCHAIN_RPC_URL=https://bsc-dataseed.binance.org/
BLOCKCHAIN_WS_URL=wss://bsc-ws-node.nariox.org:443
CHAIN_ID=56

# Contract addresses from Day 1
MARKET_CONTRACT_ADDRESS=0x...
NFT_CONTRACT_ADDRESS=0x...
PREDICTOR_PASS_CONTRACT_ADDRESS=0x...
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

#### Frontend to Vercel (1 hour)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import Project → GitHub
3. Configure:
   - Framework: Vite
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `dist`

4. **Environment Variables:**
```bash
VITE_API_URL=https://signalfriend-backend.onrender.com
VITE_BLOCKCHAIN_RPC_URL=https://bsc-dataseed.binance.org/
VITE_CHAIN_ID=56
VITE_MARKET_CONTRACT_ADDRESS=0x...
VITE_NFT_CONTRACT_ADDRESS=0x...
VITE_PREDICTOR_PASS_CONTRACT_ADDRESS=0x...
VITE_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
VITE_ENVIRONMENT=production
```

#### Production Smoke Test (30 mins)

```
Visit production URLs:
1. [ ] Site loads
2. [ ] Connect wallet (BSC Mainnet)
3. [ ] Register
4. [ ] Test one signal purchase with test wallet
5. [ ] Verify transaction on BscScan
6. [ ] Check logs (Render + Vercel dashboards)
```

**If all works → YOU'RE LIVE! 🚀**

---

### 📅 Day 4: Setup Alchemy Webhooks (Optional)

Makes event tracking instant.

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
2. Create webhook for **BSC Mainnet**
3. URL: `https://signalfriend-backend.onrender.com/api/webhooks/alchemy`
4. Subscribe to contract events
5. Add signing key to Render env vars

---

## Environment Variables

### 🔴 NEVER EXPOSE (Backend only)
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `MONGODB_URI`
- `PRIVATE_KEY_1`
- `ALCHEMY_AUTH_TOKEN`

### 🟢 Safe to Expose (Frontend)
- `VITE_API_URL`
- `VITE_BLOCKCHAIN_RPC_URL`
- `VITE_CHAIN_ID`
- `VITE_*_CONTRACT_ADDRESS`

### Security Checklist
- [ ] All `.env*` in `.gitignore`
- [ ] Different secrets for local vs production
- [ ] Private keys in password manager
- [ ] Never commit secrets to git

---

## Post-Launch Workflows

### Adding New Features

```bash
# 1. Create branch
git checkout -b feature/new-thing

# 2. Make changes in frontend/ or backend/

# 3. Test locally
cd frontend && npm run dev
cd backend && npm run dev

# 4. Run tests & lint
npm run test && npm run lint

# 5. Merge to main (auto-deploys)
git checkout main && git merge feature/new-thing
git push origin main

# Monitor: Vercel (~2 min) + Render (~3-5 min)
```

### Updating Environment Variables

**Render (Backend):**
1. Dashboard → Service → Environment
2. Edit variable → Save (auto-restarts)

**Vercel (Frontend):**
1. Project → Settings → Environment Variables
2. Edit → Redeploy

### Deploying New Contract Version

```bash
cd contracts

# Deploy new version
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BNB_MAINNET_RPC_URL \
  --broadcast \
  --verify

# Update addresses in backend/src/contracts/addresses.ts
# Update addresses in frontend env vars
# Push to main (auto-deploys apps)
```

---

## Emergency Procedures

### Frontend Broken
```bash
# Rollback via Vercel dashboard:
# Deployments → Find last working → "Promote to Production"

# Or git revert:
git revert <bad-commit>
git push origin main
```

### Backend Broken
```bash
# Rollback via Render dashboard:
# Events → Find successful deploy → "Rollback"

# Or git revert:
git revert <bad-commit>
git push origin main
```

### Contract Emergency

**⚠️ Contracts are immutable!**

If critical bug:
1. Use `pause()` via MultiSig (if available)
2. Deploy fixed version ASAP
3. Update addresses everywhere
4. Notify users

### Database Issues

MongoDB Atlas has auto-daily backups:
1. Dashboard → Cluster → Backup
2. Select snapshot → Restore

---

## Monitoring

### Daily
- [ ] Check Render logs for errors
- [ ] Monitor BscScan contract activity
- [ ] Check MongoDB Atlas performance

### Weekly
- [ ] Review gas costs (BNB prices)
- [ ] Update dependencies
- [ ] Backup important data

### Monthly
- [ ] Rotate secrets (JWT, API keys)
- [ ] Review costs (Render, Vercel, MongoDB)
- [ ] Update all dependencies

---

## Quick Reference

### Important URLs
- **Frontend:** https://signalfriend.vercel.app
- **Backend:** https://signalfriend-backend.onrender.com
- **BscScan:** https://bscscan.com
- **Render:** https://dashboard.render.com
- **Vercel:** https://vercel.com/dashboard

### BSC Mainnet Info
- **Chain ID:** 56
- **RPC:** https://bsc-dataseed.binance.org/
- **USDT:** 0x55d398326f99059fF775485246999027B3197955

### Monthly Costs
- Render: $0-25 (free tier available)
- Vercel: $0-20 (free tier available)
- MongoDB: $0-9 (free tier available)
- **Total: $0-54/month** (can start free)

### One-Time Costs
- Contract deployment: ~$50-100 BNB gas
- Testing: ~$20-50 BNB + USDT

---

**Status:** Ready for BSC Mainnet 🚀  
**Maintained by:** Solo Founder
