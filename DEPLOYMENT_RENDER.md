# Render Backend Deployment Guide

> **Production Backend Setup for SignalFriend**  
> Last Updated: December 17, 2025

---

## 🎯 Prerequisites

- Render account (https://render.com)
- GitHub repository pushed with latest code
- MongoDB Atlas connection string (from DEPLOYMENT_MONGODB_ATLAS.md)
- Alchemy webhook signing key (from Alchemy dashboard)

---

## 📋 Step-by-Step Setup

### 1. Create Render Account

1. Go to https://render.com
2. Sign up with **GitHub** (easiest for deployment)
3. Authorize Render to access your repositories

### 2. Create New Web Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your SignalFriend repository
   - If not listed, click **"Configure account"** and grant access
4. Click **"Connect"** next to your SignalFriend repo

### 3. Configure Service Settings

#### Basic Settings

| Field | Value |
|-------|-------|
| **Name** | `signalfriend-backend` |
| **Region** | Choose closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

#### Instance Type

- **Free Tier**: Good for testing, spins down after inactivity (NOT RECOMMENDED for production)
- **Starter ($7/month)**: Recommended minimum for production
  - 512 MB RAM
  - 0.5 CPU
  - Always running
- **Standard ($25/month)**: Better performance
  - 2 GB RAM
  - 1 CPU

**Recommendation**: Start with **Starter** plan, upgrade to **Standard** if needed.

#### Auto-Deploy

- ✅ **Enable Auto-Deploy**: Yes (deploys automatically on `git push`)

### 4. Configure Environment Variables

Click **"Advanced"** → **Environment Variables**

Add all required environment variables:

```env
# Node Environment
NODE_ENV=production

# Server
PORT=10000

# MongoDB Atlas (from previous step)
MONGODB_URI=mongodb+srv://signalfriend-backend:YOUR_PASSWORD@signalfriend-production.xxxxx.mongodb.net/signalfriend?retryWrites=true&w=majority&appName=signalfriend-production

# JWT Secret (Generate new 32+ character secret)
JWT_SECRET=your-super-secret-production-jwt-key-min-32-chars-CHANGE-THIS

# Blockchain
CHAIN_ID=56
RPC_URL=https://bsc-dataseed.binance.org/

# Alchemy Webhook (Get from Alchemy dashboard)
ALCHEMY_SIGNING_KEY=whsec_your_actual_signing_key_here

# CORS (Your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Admin Wallet Addresses (Comma-separated, BSC Mainnet admins)
ADMIN_ADDRESSES=0x38f4B0DcA1d681c18D41543f6D78bd4B08578B11,0xa2AD948278cA7018f8c05e1A995575AeF3B02EAB,0x62E3Ba865c11f911A83E01771105E4edbc4Bf148

# Rate Limiting (Optional - defaults are good)
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100

# Sentry (Optional - for error tracking)
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### 🔐 How to Generate JWT_SECRET

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

#### 📝 Important Notes on Environment Variables

1. **MONGODB_URI**: Use your Atlas connection string from previous step
2. **JWT_SECRET**: Generate a NEW secret for production (never reuse dev secret)
3. **CORS_ORIGIN**: Your actual domain (e.g., `https://signalfriend.com`)
   - If using Cloudflare: Use your domain, not Cloudflare proxy URL
   - For multiple origins: `https://signalfriend.com,https://www.signalfriend.com`
4. **ALCHEMY_SIGNING_KEY**: Get from Alchemy dashboard (see Webhook Setup section below)
5. **ADMIN_ADDRESSES**: Use BSC Mainnet MultiSig addresses (already correct in example)

### 5. Create Service

1. Click **"Create Web Service"**
2. Render will start building your backend
3. Wait 3-5 minutes for initial deployment
4. Check **Logs** tab to verify successful startup

#### Expected Log Output

```
✅ MongoDB connected successfully
Server listening on port 10000
```

### 6. Get Your Backend URL

Once deployed, your backend will be available at:
```
https://signalfriend-backend.onrender.com
```

Or if you set a custom domain:
```
https://api.yourdomain.com
```

---

## 🔗 Custom Domain Setup (Optional but Recommended)

### Add Custom Domain to Render

1. In your Render service, go to **Settings**
2. Scroll to **Custom Domain**
3. Click **"Add Custom Domain"**
4. Enter your domain: `api.yourdomain.com`
5. Render will show DNS records to add

### Configure Cloudflare DNS

1. Go to your Cloudflare dashboard
2. Select your domain
3. Go to **DNS** → **Records**
4. Add CNAME record:
   ```
   Type: CNAME
   Name: api
   Target: signalfriend-backend.onrender.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```
5. Click **Save**

### Verify Custom Domain

1. Wait 5-10 minutes for DNS propagation
2. Go back to Render → Custom Domain
3. Click **"Verify"**
4. Once verified, Render will automatically provision SSL certificate
5. Your backend is now accessible at `https://api.yourdomain.com`

### Update CORS_ORIGIN

If using custom domain, update environment variable:
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🪝 Alchemy Webhook Setup

### Get Signing Key

1. Go to Alchemy dashboard: https://dashboard.alchemy.com
2. Select your app/project for **BSC Mainnet**
3. Go to **Webhooks** (or **Notify** section)
4. Find your webhook for SignalFriend events
5. Click **"Webhook Settings"** or **"Edit"**
6. Copy the **Signing Key** (starts with `whsec_...`)
7. Add to Render environment variables as `ALCHEMY_SIGNING_KEY`

### Update Webhook URL

1. In Alchemy webhook settings
2. Update **Webhook URL** to your Render backend:
   ```
   https://signalfriend-backend.onrender.com/api/v1/webhooks/alchemy
   ```
   Or with custom domain:
   ```
   https://api.yourdomain.com/api/v1/webhooks/alchemy
   ```
3. Click **"Test Webhook"** to verify it's working
4. Check Render logs for incoming webhook requests

### Required Webhook Events

Ensure your Alchemy webhook is configured to listen for these events on BSC Mainnet:

| Event | Contract | Address |
|-------|----------|---------|
| `PredictorJoined` | SignalFriendMarket | `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` |
| `PredictorNFTMinted` | PredictorAccessPass | `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` |
| `SignalPurchased` | SignalFriendMarket | `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` |
| `PredictorBlacklisted` | PredictorAccessPass | `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` |

Refer to `backend/SetupWebhooks.md` for exact GraphQL query to use.

---

## 🧪 Test Your Deployed Backend

### Health Check

```bash
curl https://signalfriend-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-17T12:00:00.000Z",
  "uptime": 123.456,
  "mongodb": "connected"
}
```

### API Endpoints

Test a public endpoint:
```bash
curl https://signalfriend-backend.onrender.com/api/v1/categories
```

Should return list of categories (or empty array if DB is empty).

### Check Logs

1. Go to Render Dashboard
2. Select your service
3. Go to **Logs** tab
4. Monitor for any errors
5. Verify MongoDB connection is successful

---

## 🔄 Seed Production Database (Optional)

If starting fresh, you may want to seed categories:

### Option 1: Using Render Shell

1. In Render dashboard, go to **Shell** tab
2. Run:
   ```bash
   npm run seed:categories
   ```

### Option 2: Temporarily Allow Local Access

1. Get your local IP: `curl ifconfig.me`
2. Add your IP to MongoDB Atlas Network Access
3. Update local `.env` with production MongoDB URI
4. Run locally:
   ```bash
   cd backend
   npm run seed:categories
   npm run seed:signals:100  # Optional
   ```
5. Remove your IP from Atlas Network Access

---

## 📊 Monitoring & Maintenance

### Render Monitoring

1. **Metrics** tab: CPU, Memory, Response times
2. **Logs** tab: Real-time application logs
3. **Events** tab: Deployment history

### Set Up Alerts (Optional)

1. Go to **Settings** → **Notifications**
2. Add email or Slack webhook
3. Get notified on:
   - Deploy failures
   - Service crashes
   - High memory usage

### Log Retention

- Free tier: Last 7 days
- Starter/Standard: Last 30 days
- Consider Sentry for long-term error tracking

---

## 🔐 Security Checklist

- [x] `NODE_ENV=production` is set
- [x] Strong JWT secret (32+ characters, unique for production)
- [x] MongoDB URI never committed to git
- [x] Alchemy signing key configured (required in production)
- [x] CORS restricted to your frontend domain(s)
- [x] Admin addresses are correct BSC Mainnet addresses
- [x] Rate limiting enabled (default settings)
- [x] HTTPS enabled (automatic with Render)
- [x] Environment variables stored securely in Render

---

## 🚀 Deployment Workflow

### Automatic Deploys

Once set up, deploying new changes is automatic:

1. Make changes to backend code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```
3. Render automatically detects push and deploys
4. Check **Logs** tab to verify successful deployment

### Manual Deploys

If auto-deploy is disabled:

1. Go to Render Dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Rollback

If a deployment breaks production:

1. Go to **Events** tab
2. Find previous successful deployment
3. Click **"Rollback to this version"**

---

## 🆘 Troubleshooting

### "MongoDB connection failed"

- Check `MONGODB_URI` environment variable
- Verify Network Access in Atlas includes `0.0.0.0/0`
- Test connection locally first

### "ALCHEMY_SIGNING_KEY is required in production"

- Backend won't start without this in production mode
- Get key from Alchemy dashboard
- Add to Render environment variables

### "CORS error" from frontend

- Check `CORS_ORIGIN` includes your frontend domain
- Format: `https://yourdomain.com` (no trailing slash)
- For multiple: `https://yourdomain.com,https://www.yourdomain.com`

### "Service keeps restarting"

- Check **Logs** tab for error messages
- Common issues:
  - MongoDB connection timeout
  - Missing required environment variables
  - Port conflicts (Render uses PORT env var automatically)

### "Webhook not receiving events"

- Verify webhook URL in Alchemy dashboard
- Check Alchemy signing key is correct
- Test webhook from Alchemy dashboard
- Check Render logs for webhook requests

### "Out of memory"

- Upgrade to larger instance (Standard plan)
- Check for memory leaks in logs
- Monitor **Metrics** tab

---

## 💰 Cost Estimation

### Render Pricing

| Plan | Price/Month | RAM | CPU | Best For |
|------|-------------|-----|-----|----------|
| Free | $0 | 512 MB | Shared | Testing only |
| Starter | $7 | 512 MB | 0.5 | Small production |
| Standard | $25 | 2 GB | 1 | Production |
| Pro | $85 | 4 GB | 2 | High traffic |

### Recommended Setup

- **Launch**: Starter ($7/month) + Atlas M0 (free) = **$7/month**
- **Growth**: Standard ($25/month) + Atlas M10 ($57/month) = **$82/month**
- **Scale**: Pro ($85/month) + Atlas M20 ($145/month) = **$230/month**

---

## ✅ Next Steps

Once Render backend is deployed:
1. ✅ Verify health endpoint works
2. ✅ Test API endpoints
3. ✅ Verify webhooks are receiving events
4. ✅ Seed categories if needed
5. → Proceed to **DEPLOYMENT_VERCEL.md** for frontend deployment
