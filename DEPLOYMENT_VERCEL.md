# Vercel Frontend Deployment Guide

> **Production Frontend Setup for SignalFriend**  
> Last Updated: December 17, 2025

---

## 🎯 Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository pushed with latest code
- Backend deployed on Render (from DEPLOYMENT_RENDER.md)
- Domain configured in Cloudflare
- WalletConnect Project ID

---

## 📋 Step-by-Step Setup

### 1. Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with **GitHub** (easiest for deployment)
3. Authorize Vercel to access your repositories

### 2. Import Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import"** next to your SignalFriend repository
   - If not listed, click **"Adjust GitHub App Permissions"**
3. Vercel will detect it's a monorepo

### 3. Configure Project Settings

#### Framework Preset
- **Framework**: Vite
- **Root Directory**: `frontend`
  - Click **"Edit"** and enter `frontend`

#### Build Settings

| Field | Value |
|-------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### Node Version

In `frontend/package.json`, ensure engines is set:
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 4. Configure Environment Variables

Click **"Environment Variables"** and add:

```env
# Backend API URL (Your Render backend)
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# WalletConnect Project ID (Get from https://cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Chain Configuration
VITE_CHAIN_ID=56

# Enable/Disable Testnet (false for production)
VITE_ENABLE_TESTNET=false

# Sentry Error Tracking (Optional but recommended)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Social Links
VITE_DISCORD_URL=https://discord.gg/your-invite
VITE_TWITTER_URL=https://x.com/signalfriend1
VITE_CONTACT_EMAIL=contact@yourdomain.com

# Admin Wallet Addresses (BSC Mainnet MultiSig)
VITE_ADMIN_ADDRESSES=0x38f4B0DcA1d681c18D41543f6D78bd4B08578B11,0xa2AD948278cA7018f8c05e1A995575AeF3B02EAB,0x62E3Ba865c11f911A83E01771105E4edbc4Bf148

# Maintenance Mode (Optional - set to true to enable)
# VITE_MAINTENANCE_MODE=false
# VITE_MAINTENANCE_MESSAGE=We're currently upgrading our systems.
# VITE_MAINTENANCE_END_TIME=2025-12-20T12:00:00Z

# News Banner (Optional)
# VITE_NEWS_ENABLED=true
# VITE_NEWS_MESSAGE=🎉 Welcome to SignalFriend!
# VITE_NEWS_LINK=/news
```

#### 🔐 Important Notes

1. **VITE_API_BASE_URL**: 
   - Use your custom domain: `https://api.yourdomain.com/api/v1`
   - Or Render URL: `https://signalfriend-backend.onrender.com/api/v1`
   - Must end with `/api/v1` (include API version)
   - No trailing slash

2. **VITE_WALLETCONNECT_PROJECT_ID**:
   - Get free project ID from https://cloud.walletconnect.com
   - Sign up → Create Project → Copy Project ID

3. **VITE_CHAIN_ID**:
   - `56` for BSC Mainnet (production)
   - `97` for BSC Testnet (development)

4. **VITE_ENABLE_TESTNET**:
   - `false` for production (hides testnet from wallet)
   - `true` for development

5. **VITE_SENTRY_DSN** (Optional but recommended):
   - Sign up at https://sentry.io
   - Create new project → Select React
   - Copy DSN and add here

### 5. Deploy Project

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend (takes 2-3 minutes)
3. Once complete, you'll get a preview URL: `https://signalfriend.vercel.app`

### 6. Verify Deployment

Visit your Vercel URL and check:
- ✅ Landing page loads
- ✅ "Connect Wallet" button works
- ✅ Can connect MetaMask/wallet
- ✅ Can sign in with wallet
- ✅ No console errors
- ✅ Images/logo loads correctly

---

## 🔗 Custom Domain Setup

### Add Domain to Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain:
   - `yourdomain.com` (primary)
   - `www.yourdomain.com` (redirect to primary)
4. Vercel will show DNS configuration needed

### Configure Cloudflare DNS

Since you mentioned Cloudflare is already set up, you have two options:

#### Option 1: CNAME (Recommended if Cloudflare proxy is needed)

1. Go to Cloudflare dashboard
2. Select your domain
3. Go to **DNS** → **Records**
4. Add/Update records:

**For root domain (`yourdomain.com`):**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

**For www subdomain:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

5. Click **Save**

#### Option 2: A Record (Alternative)

If Vercel shows A records instead:

```
Type: A
Name: @
IPv4: 76.76.21.21
Proxy status: Proxied ✅
```

### SSL Configuration in Cloudflare

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode: **Full (strict)** ✅
   - This ensures end-to-end encryption
3. Go to **SSL/TLS** → **Edge Certificates**
4. Enable:
   - ✅ Always Use HTTPS
   - ✅ HTTP Strict Transport Security (HSTS)
   - ✅ Minimum TLS Version: 1.2
   - ✅ Automatic HTTPS Rewrites

### Verify Custom Domain

1. Wait 5-10 minutes for DNS propagation
2. Go back to Vercel → Domains
3. Your domain should show **"Valid Configuration"** ✅
4. SSL certificate will be automatically provisioned
5. Visit `https://yourdomain.com` - should work!

### Redirect www to root (Optional)

In Vercel Domains settings:
1. Set `yourdomain.com` as **Primary Domain**
2. `www.yourdomain.com` will automatically redirect

---

## 🔄 Update Backend CORS

After domain is set up, update your Render backend:

1. Go to Render Dashboard → Your backend service
2. Go to **Environment** → Edit `CORS_ORIGIN`
3. Update to:
   ```env
   CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
   ```
4. Save - Render will automatically redeploy

Test that frontend can communicate with backend:
- Try logging in with wallet
- Try viewing signals
- Check browser console for CORS errors (should be none)

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Landing page loads
- [ ] Logo and images display
- [ ] Navigation works (all pages accessible)
- [ ] Mobile responsive (test on phone or DevTools)

### Web3 Connection
- [ ] "Connect Wallet" button works
- [ ] MetaMask/WalletConnect opens
- [ ] Can connect to BSC Mainnet (Chain ID 56)
- [ ] Wallet address displays correctly
- [ ] Can disconnect wallet

### Authentication (SIWE)
- [ ] "Sign In" button appears after connecting wallet
- [ ] Signing message works
- [ ] After signing, user is authenticated
- [ ] JWT token is stored (check localStorage)
- [ ] Refreshing page keeps user logged in

### Marketplace
- [ ] Signals page loads
- [ ] Can filter by category
- [ ] Search works
- [ ] Sorting works (rating, price, date)
- [ ] Signal cards display correctly
- [ ] Clicking signal opens detail page

### Purchase Flow (If you have test signals)
- [ ] Can view signal detail
- [ ] Purchase button enabled (if USDT balance sufficient)
- [ ] Purchase modal opens
- [ ] USDT approval works
- [ ] Purchase transaction succeeds
- [ ] Receipt appears in "My Purchased Signals"
- [ ] Can view purchased signal content

### Predictor Flow
- [ ] "Become a Predictor" page works
- [ ] Registration modal opens
- [ ] Can register as predictor (if have 20 USDT)
- [ ] Dashboard shows after registration
- [ ] Can create signal
- [ ] Can edit profile

### Admin (If you're an admin)
- [ ] Admin dashboard accessible
- [ ] Can view earnings
- [ ] Can view verification requests
- [ ] Can view reports
- [ ] Can view disputes
- [ ] Can verify/blacklist predictors

---

## 🚀 Deployment Workflow

### Automatic Deploys

Vercel automatically deploys on every push to `main`:

1. Make changes to frontend code
2. Commit and push:
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```
3. Vercel detects push and deploys automatically
4. Check **Deployments** tab in Vercel dashboard
5. Preview URL updates instantly

### Preview Deployments

For feature branches:
- Every branch push creates a **preview deployment**
- Get unique URL: `https://signalfriend-git-feature-branch.vercel.app`
- Test changes before merging to `main`
- Perfect for testing PRs!

### Production Deployment

- `main` branch = Production deployment
- Deploys to your custom domain automatically
- Zero downtime deployments

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)

1. Go to **Analytics** tab in Vercel project
2. View:
   - Page views
   - Top pages
   - Top referrers
   - Real User Monitoring (Core Web Vitals)

### Vercel Speed Insights

Free feature showing performance metrics:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

Enable in Vercel dashboard → Speed Insights

### Sentry Error Tracking

If `VITE_SENTRY_DSN` is configured:
1. Go to https://sentry.io
2. View real-time errors
3. See stack traces
4. Get notified on new issues

---

## 🔐 Security Checklist

- [x] HTTPS enabled (automatic with Vercel + Cloudflare)
- [x] Environment variables not exposed in build
- [x] `VITE_CHAIN_ID=56` for mainnet
- [x] `VITE_ENABLE_TESTNET=false` for production
- [x] Security headers configured (in `vercel.json`)
- [x] CSP (Content Security Policy) configured
- [x] CORS properly configured in backend
- [x] Admin addresses correct for mainnet
- [x] No sensitive data in client-side code

---

## ⚡ Performance Optimization

### Already Implemented
- ✅ Code splitting (React.lazy for routes)
- ✅ Tree shaking (Vite build optimization)
- ✅ Asset optimization (Vite handles images)
- ✅ Gzip compression (Vercel automatic)

### Vercel Automatic Features
- ✅ Edge Network (CDN) - Assets served globally
- ✅ Image optimization (automatic WebP conversion)
- ✅ Brotli compression
- ✅ HTTP/2 & HTTP/3 support

### Cache Configuration

Vercel automatically caches:
- Static assets: 1 year
- HTML: No cache (always fresh)
- API calls: Not cached (good for real-time data)

---

## 🆘 Troubleshooting

### "Build failed" on Vercel

Check build logs:
1. Go to **Deployments** tab
2. Click failed deployment
3. View build logs
4. Common issues:
   - TypeScript errors → Fix in code
   - Missing dependencies → Check package.json
   - Environment variable errors → Check variable names

### "Blank page" after deployment

- Check browser console for errors
- Common issues:
  - `VITE_API_BASE_URL` incorrect
  - `VITE_WALLETCONNECT_PROJECT_ID` missing
  - Backend not responding (check CORS)

### "Cannot connect wallet"

- Check `VITE_WALLETCONNECT_PROJECT_ID` is set
- Verify `VITE_CHAIN_ID=56` for mainnet
- Check WalletConnect project isn't expired/deleted

### "API calls failing" / CORS errors

- Verify backend `CORS_ORIGIN` includes frontend domain
- Check `VITE_API_BASE_URL` is correct
- Test backend health endpoint directly
- Check backend logs on Render

### "Wallet shows wrong network"

- User needs to switch to BSC Mainnet in wallet
- Check `VITE_CHAIN_ID=56`
- App should prompt user to switch network

### "Custom domain not working"

- Wait 10-15 minutes for DNS propagation
- Clear browser cache
- Check DNS records in Cloudflare
- Verify SSL/TLS mode: Full (strict)
- Check Vercel domain status (should be green checkmark)

---

## 🔄 Environment-Specific Deploys

### Production (main branch)
```env
VITE_CHAIN_ID=56
VITE_ENABLE_TESTNET=false
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### Staging (Optional - staging branch)
Create a separate Vercel project for staging:
```env
VITE_CHAIN_ID=97
VITE_ENABLE_TESTNET=true
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api/v1
```

---

## 💰 Vercel Pricing

### Hobby Plan (Free)
- ✅ Perfect for production
- ✅ Unlimited bandwidth
- ✅ Automatic SSL
- ✅ Edge Network (CDN)
- ✅ Serverless Functions (for future API routes)
- ❌ No custom domain limits
- ❌ No password protection

### Pro Plan ($20/month)
- Everything in Hobby
- ✅ Password protection
- ✅ Advanced analytics
- ✅ Team collaboration
- ✅ Priority support

**Recommendation**: Start with **Hobby (Free)** - it's production-ready!

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Custom domain configured and working
- [ ] SSL certificate active (HTTPS working)
- [ ] Can connect wallet
- [ ] Can sign in with wallet (SIWE)
- [ ] Signals load from backend
- [ ] Can create/purchase signals (if applicable)
- [ ] All pages accessible
- [ ] Mobile responsive working
- [ ] No console errors in production
- [ ] Backend CORS updated with frontend domain
- [ ] Environment variables all set correctly
- [ ] Sentry receiving events (if configured)
- [ ] Webhooks working (check Alchemy + Render logs)

---

## 🎉 You're Live!

Your SignalFriend platform is now live on production! 🚀

**Access your platform:**
- Frontend: `https://yourdomain.com`
- Backend API: `https://api.yourdomain.com`
- Admin Dashboard: `https://yourdomain.com/admin`

**Next Steps:**
1. Share with early users
2. Monitor Sentry for errors
3. Monitor Vercel Analytics for traffic
4. Monitor Render Metrics for backend performance
5. Scale MongoDB Atlas when needed (M0 → M10)
6. Upgrade Render plan if needed (Starter → Standard)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Cloudflare SSL Guide](https://developers.cloudflare.com/ssl/)
- [WalletConnect Docs](https://docs.walletconnect.com/)

---

## 🆘 Need Help?

- Vercel Support: https://vercel.com/help
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: File issues in your repo
- Community: Share on Discord/Twitter for help
