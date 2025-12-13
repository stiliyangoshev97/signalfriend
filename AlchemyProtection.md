# 🛡️ SignalFriend Security Implementation Guide

> **Last Updated:** December 13, 2025  
> **Version:** 0.28.1  
> **Security Status:** ✅ Production-Ready

This document outlines the comprehensive security measures implemented to protect the SignalFriend platform from API abuse, webhook spoofing, and unauthorized access.

---

## 📋 Security Overview

SignalFriend implements a **defense-in-depth** strategy with multiple layers of protection:

1. **Frontend Isolation** - No sensitive API keys exposed to users
2. **Backend API Key Protection** - IP whitelisting + key segregation
3. **Webhook Security** - HMAC signature verification + IP whitelisting
4. **Smart Contract Security** - 3-of-3 MultiSig governance
5. **Environment-Based Enforcement** - Production security requirements

---

## ✅ I. Frontend Security (Public RPC)

### Implementation Status: ✅ **VERIFIED & SECURE**

**What We Did:**
- Frontend uses **only public RPC endpoints** (Binance, PublicNode)
- **Zero Alchemy API keys** in frontend code
- All blockchain reads use public infrastructure

**Configuration:**
```typescript
// frontend/src/shared/config/wagmi.ts
export const config = createConfig({
  chains: [bscTestnet, bsc],
  transports: {
    [bscTestnet.id]: http("https://bsc-testnet-rpc.publicnode.com"),
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
  },
});
```

**Why This Matters:**
- ❌ No risk of API key exposure in frontend bundle
- ❌ No potential for $60k billing attacks via leaked keys
- ✅ Users connect with their own wallets (MetaMask, WalletConnect)
- ✅ Public RPC providers handle rate limiting

**Verification Steps:**
```bash
# Search frontend code for Alchemy references
grep -r "alchemy" frontend/src/
# Result: No matches (✓ Verified)

# Check wagmi config
cat frontend/src/shared/config/wagmi.ts
# Result: Only public RPCs (✓ Verified)
```

---

## 🔐 II. Backend RPC Protection

### Implementation Status: ✅ **FULLY IMPLEMENTED & SECURED**

**Current Setup:**
- Backend uses **private Alchemy RPC** for blockchain reads
- **IP Whitelisting:** Configured on Alchemy Dashboard
- **Key Segregation:** Separate RPC key from webhook signing key

**Configuration:**
```bash
# backend/.env
# Development: Private Alchemy RPC (Testnet)
RPC_URL=https://bnb-testnet.g.alchemy.com/v2/<YOUR_API_KEY>

# Production: Private Alchemy RPC (Mainnet)
# RPC_URL=https://bnb-mainnet.g.alchemy.com/v2/<YOUR_API_KEY>
```

**Security Controls:**

| Security Control | Status | Implementation |
|-----------------|--------|----------------|
| **IP Whitelisting** | ✅ Configured | Local dev IP `212.39.89.180` whitelisted on Alchemy Dashboard |
| **Key Segregation** | ✅ Implemented | Separate RPC key from webhook signing key |
| **Environment Variables** | ✅ Implemented | Keys stored in `.env`, never committed to git |
| **Backend-Only Usage** | ✅ Verified | RPC key never exposed to frontend |

**How to Update IP Whitelisting (When Your IP Changes):**

1. **Get Your Current IP:**
   ```bash
   curl -4 ifconfig.me 2>/dev/null && echo "" && curl -6 ifconfig.me 2>/dev/null
   # Example output:
   # 212.39.89.180 (IPv4)
   # 2a01:5a8:767:f5c2:b199:ec03:ee31:55da (IPv6)
   ```

2. **Update Alchemy Dashboard:**
   - Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
   - Navigate to: **Apps** → **Your App** → **Settings**
   - Under **Allowlists** → **IP Addresses**, update your IP
   - Save settings

3. **For Production (Render):**
   - Get static outbound IP from: Render Dashboard → Your Service → **Settings** → **Outbound IPs**
   - Add Render's static IP to Alchemy's allowlist

**⚠️ Important Notes:**
- Local development: IP changes require updating Alchemy allowlist
- Production (Render): Use static outbound IP (doesn't change)
- Monitor Alchemy CU (Compute Units) usage regularly

---

## 🔔 III. Webhook Security (Alchemy Notify)

### Implementation Status: ✅ **FULLY IMPLEMENTED & VERIFIED**

SignalFriend's webhook system includes **4 layers of defense** against attacks:

### 1. HMAC-SHA256 Signature Verification ✅

**Status:** ✅ **Production-Ready**

**What We Implemented:**
```typescript
// backend/src/features/webhooks/webhook.service.ts
static verifySignature(body: string, signature: string): boolean {
  if (!env.ALCHEMY_SIGNING_KEY) {
    if (env.SKIP_WEBHOOK_SIGNATURE && env.NODE_ENV === "development") {
      logger.warn("⚠️  SKIP_WEBHOOK_SIGNATURE=true - webhook verification DISABLED (DEV ONLY)");
      return true;
    }
    logger.warn("⚠️  ALCHEMY_SIGNING_KEY not set - skipping signature verification (DEV ONLY)");
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.ALCHEMY_SIGNING_KEY)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Security Features:**
- ✅ HMAC-SHA256 signature validation using secret key
- ✅ Timing-safe comparison (prevents timing attacks)
- ✅ Required in production (server refuses to start without key)
- ✅ Development bypass available for local testing

### 2. Production Environment Check ✅

**Status:** ✅ **Implemented in v0.28.1**

**What We Implemented:**
```typescript
// backend/src/shared/config/env.ts
if (parsed.data.NODE_ENV === "production" && !parsed.data.ALCHEMY_SIGNING_KEY) {
  console.error("❌ SECURITY ERROR: ALCHEMY_SIGNING_KEY is required in production!");
  console.error("   Webhook signature verification cannot be skipped in production.");
  console.error("   Get your signing key from: Alchemy Dashboard → Webhooks → Your Webhook → Signing Key");
  process.exit(1);
}
```

**Why This Matters:**
- ❌ Production server **cannot start** without signing key
- ❌ No way to accidentally deploy without webhook security
- ✅ Forces proper security configuration before launch

### 3. Development Bypass Flag ✅

**Status:** ✅ **Implemented in v0.28.1**

**Configuration:**
```bash
# backend/.env
SKIP_WEBHOOK_SIGNATURE=false  # Default: Enforces verification
# SKIP_WEBHOOK_SIGNATURE=true  # Only works in development mode

# In production, this flag is IGNORED (always enforces verification)
```

**Security Features:**
- ✅ Default is `false` (maximum security)
- ✅ Only works in `NODE_ENV=development`
- ✅ Ignored in production (defense-in-depth)
- ✅ Provides flexibility for local testing without ngrok

### 4. IP Whitelisting ✅

**Status:** ✅ **CONFIGURED & VERIFIED**

**What We Configured:**
- **Local Development IP:** `212.39.89.180` (IPv4)
- **Alchemy Dashboard:** IP allowlist configured for webhook endpoint

**How We Did It:**

1. **Detected Public IP:**
   ```bash
   curl -4 ifconfig.me 2>/dev/null && echo "" && curl -6 ifconfig.me 2>/dev/null
   # Output:
   # 212.39.89.180 (IPv4)
   # 2a01:5a8:767:f5c2:b199:ec03:ee31:55da (IPv6)
   ```

2. **Configured Alchemy:**
   - Dashboard → Webhooks → Your Webhook → Settings
   - Added IPv4 to **IP Allowlist**: `212.39.89.180`
   - Saved configuration

3. **Testing:**
   - Triggered test webhook via Alchemy Dashboard
   - Verified webhook received successfully
   - Confirmed signature verification passed

**⚠️ Maintenance Required:**
- **Local Dev:** IP changes periodically - must update Alchemy when webhooks stop working
- **Check Current IP:** `curl -4 ifconfig.me`
- **Production (Render):** Use static outbound IP from Render Dashboard → Service → Settings → Outbound IPs

**Troubleshooting:**
```bash
# 1. Check if your IP changed
curl -4 ifconfig.me

# 2. View Alchemy webhook logs
# Alchemy Dashboard → Webhooks → Your Webhook → Logs

# 3. Check recent webhook activity
mongosh mongodb://localhost:27017/signalfriend --eval "db.processedwebhookevents.find().sort({processedAt: -1}).limit(5).pretty()"
```

### Additional Webhook Protections

**Timestamp Validation:**
- Maximum age: 5 minutes
- Clock skew tolerance: 1 minute into future
- Prevents replay attacks

**Idempotency Protection:**
- Each event tracked in `ProcessedWebhookEvent` collection
- Event key: `{transactionHash}-{topic0}`
- TTL: 30 days auto-deletion
- Prevents duplicate processing from Alchemy retries

---

## 💰 IV. Smart Contract Security

### Implementation Status: ✅ **VERIFIED & SECURE**

**3-of-3 MultiSig Protection:**
- All owner functions require 3 signatures
- Functions protected: `updatePlatformTreasury`, `updateCommissionRate`, `blacklistPredictor`, `pause`, `unpause`
- **No single key** can drain user funds or modify critical parameters

**Access Control:**
```solidity
// contracts/src/SignalFriendMarket.sol
address public owner;          // MultiSig wallet (3-of-3)
mapping(address => bool) public blacklistedPredictors;

modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

**Why This Is Critical:**
- ✅ Even if 1-2 MultiSig keys are compromised, funds remain safe
- ✅ Requires coordination of all 3 signers for any changes
- ✅ Protects against single point of failure

---

## 📊 V. Environment Configuration Summary

### Production Environment (signalfriend.com)

| Component | Configuration | Security Method | Status |
|-----------|--------------|-----------------|--------|
| **Frontend** | Public RPC | None (public endpoints) | ✅ Verified |
| **Backend RPC** | Private Alchemy RPC | IP Whitelisting | ✅ Configured |
| **Webhooks** | Alchemy Notify | HMAC + IP Allowlist + Required Key | ✅ Fully Implemented |
| **Smart Contracts** | BNB Chain | 3-of-3 MultiSig | ✅ Verified |
| **Database** | MongoDB Atlas | Connection string in env vars | ✅ Secure |

### Development Environment (Local)

| Component | Configuration | Security Method | Status |
|-----------|--------------|-----------------|--------|
| **Frontend** | Public RPC | None (public endpoints) | ✅ Verified |
| **Backend RPC** | Private Alchemy RPC | IP Whitelisting (dynamic IP) | ✅ Configured (`212.39.89.180`) |
| **Webhooks** | ngrok + Alchemy | HMAC + Dynamic IP | ✅ Implemented |
| **Smart Contracts** | BNB Testnet | 3-of-3 MultiSig | ✅ Verified |
| **Database** | Local MongoDB | localhost only | ✅ Secure |

---

## 🔧 VI. Environment Variables Reference

### Required for Production

```bash
# Webhook Security (REQUIRED in production)
ALCHEMY_SIGNING_KEY=whsec_xxxxx  # Get from Alchemy Dashboard → Webhooks → Signing Key

# Optional: Development bypass (IGNORED in production)
SKIP_WEBHOOK_SIGNATURE=false  # Default: false (recommended)

# Backend RPC (if using private Alchemy RPC)
RPC_URL=https://bnb-mainnet.g.alchemy.com/v2/<YOUR_API_KEY>
```

### Security Best Practices

1. **Never commit `.env` files** with real secrets
2. **Use different keys** for testnet vs mainnet
3. **Rotate keys** if compromised
4. **Monitor Alchemy CU usage** regularly
5. **Update IP allowlist** when server IP changes

---

## 🚀 VII. Pre-Production Checklist

Before deploying to production, verify:

- [ ] **Frontend:** Confirm no Alchemy keys in code (`grep -r "alchemy" frontend/src/`)
- [ ] **Backend:** `ALCHEMY_SIGNING_KEY` set in production environment
- [ ] **Webhooks:** IP allowlist configured with Render's static outbound IP
- [ ] **Webhooks:** Webhook URL updated to production domain (not ngrok)
- [ ] **Database:** MongoDB Atlas connection string configured
- [ ] **Smart Contracts:** MultiSig addresses verified on BscScan
- [ ] **Testing:** Test webhook delivery with Alchemy's "Send Test" feature
- [ ] **Monitoring:** Set up alerts for failed webhook deliveries

---

## 📚 VIII. Related Documentation

- **Backend RUNBOOK.md** - IP whitelisting commands and troubleshooting
- **Backend .env.example** - Commented environment variable examples
- **Backend CHANGELOG.md** - v0.28.1 security enhancements
- **Alchemy Dashboard** - [https://dashboard.alchemy.com/](https://dashboard.alchemy.com/)

---

## 🎯 Summary: What Makes This Secure?

| Attack Vector | Defense Mechanism | Status |
|--------------|-------------------|--------|
| **Frontend API Key Theft** | No keys in frontend (uses public RPCs) | ✅ Verified |
| **Backend RPC Abuse** | Private Alchemy RPC + IP whitelisting | ✅ Configured |
| **Webhook Spoofing** | HMAC-SHA256 signature verification | ✅ Implemented |
| **Webhook IP Spoofing** | Alchemy IP allowlist | ✅ Configured |
| **Production Misconfiguration** | Required signing key + startup check | ✅ Implemented |
| **Contract Owner Compromise** | 3-of-3 MultiSig governance | ✅ Verified |
| **Replay Attacks** | Timestamp validation + idempotency | ✅ Implemented |

**Overall Security Posture:** ✅ **Production-Ready**

---

*Last security audit: December 13, 2025*  
*Next review: Before mainnet deployment*