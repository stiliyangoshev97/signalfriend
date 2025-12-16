# 🚀 SignalFriend Production Deployment Checklist

> **Complete deployment workflow for SignalFriend to production**  
> Last Updated: December 17, 2025

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] All tests passing (290 backend tests, 125 contract tests)
- [x] No console.log() statements in production code
- [x] No TODO/FIXME comments left unaddressed
- [x] All TypeScript errors resolved
- [x] ESLint warnings addressed

### Documentation
- [x] README files up to date
- [x] PROJECT_CONTEXT.md updated
- [x] CHANGELOG.md updated
- [x] Environment variable examples documented

### Security
- [x] Security audit completed (93/100 score)
- [x] All secrets removed from code
- [x] .gitignore includes all sensitive files
- [x] Rate limiting implemented
- [x] Input validation on all endpoints
- [x] CORS properly configured

---

## 🎯 Deployment Steps (In Order)

Follow these steps in sequence for a smooth deployment:

### Step 1: MongoDB Atlas Setup ⏱️ 15-20 minutes

📄 **Guide**: `DEPLOYMENT_MONGODB_ATLAS.md`

- [ ] 1.1. Create MongoDB Atlas account
- [ ] 1.2. Create cluster (M0 free tier or M10 production)
- [ ] 1.3. Create database user with strong password
- [ ] 1.4. Configure network access (0.0.0.0/0)
- [ ] 1.5. Get connection string
- [ ] 1.6. Test connection locally
- [ ] 1.7. (Optional) Migrate existing data
- [ ] 1.8. (Optional) Seed categories

**Output**: MongoDB connection URI (save for Render setup)

---

### Step 2: Render Backend Setup ⏱️ 20-30 minutes

📄 **Guide**: `DEPLOYMENT_RENDER.md`

- [ ] 2.1. Create Render account
- [ ] 2.2. Create new Web Service
- [ ] 2.3. Connect GitHub repository
- [ ] 2.4. Configure service settings:
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`
  - [ ] Instance Type: Starter ($7/month minimum)
- [ ] 2.5. Add all environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `MONGODB_URI=<from Step 1>`
  - [ ] `JWT_SECRET=<generate new 32+ chars>`
  - [ ] `CHAIN_ID=56`
  - [ ] `RPC_URL=https://bsc-dataseed.binance.org/`
  - [ ] `ALCHEMY_SIGNING_KEY=<from Alchemy>`
  - [ ] `CORS_ORIGIN=https://yourdomain.com` (temporary, update after frontend)
  - [ ] `ADMIN_ADDRESSES=0x38f4B0DcA1d681c18D41543f6D78bd4B08578B11,0xa2AD948278cA7018f8c05e1A995575AeF3B02EAB,0x62E3Ba865c11f911A83E01771105E4edbc4Bf148`
- [ ] 2.6. Deploy service
- [ ] 2.7. (Optional) Set up custom domain: `api.yourdomain.com`
- [ ] 2.8. Configure Cloudflare DNS (CNAME to Render)
- [ ] 2.9. Update Alchemy webhook URL
- [ ] 2.10. Test health endpoint: `curl https://api.yourdomain.com/health`
- [ ] 2.11. Test categories endpoint: `curl https://api.yourdomain.com/api/v1/categories`

**Output**: Backend API URL (save for Vercel setup)

---

### Step 3: WalletConnect Project Setup ⏱️ 5 minutes

- [ ] 3.1. Go to https://cloud.walletconnect.com
- [ ] 3.2. Sign up or log in
- [ ] 3.3. Create new project: "SignalFriend Production"
- [ ] 3.4. Copy Project ID

**Output**: WalletConnect Project ID (save for Vercel setup)

---

### Step 4: Vercel Frontend Setup ⏱️ 20-30 minutes

📄 **Guide**: `DEPLOYMENT_VERCEL.md`

- [ ] 4.1. Create Vercel account
- [ ] 4.2. Import project from GitHub
- [ ] 4.3. Configure project settings:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] 4.4. Add all environment variables:
  - [ ] `VITE_API_BASE_URL=https://api.yourdomain.com/api/v1`
  - [ ] `VITE_WALLETCONNECT_PROJECT_ID=<from Step 3>`
  - [ ] `VITE_CHAIN_ID=56`
  - [ ] `VITE_ENABLE_TESTNET=false`
  - [ ] `VITE_ADMIN_ADDRESSES=0x38f4B0DcA1d681c18D41543f6D78bd4B08578B11,0xa2AD948278cA7018f8c05e1A995575AeF3B02EAB,0x62E3Ba865c11f911A83E01771105E4edbc4Bf148`
  - [ ] `VITE_DISCORD_URL=<your discord invite>`
  - [ ] `VITE_TWITTER_URL=https://x.com/signalfriend1`
  - [ ] `VITE_CONTACT_EMAIL=contact@yourdomain.com`
  - [ ] (Optional) `VITE_SENTRY_DSN=<from Sentry dashboard>`
- [ ] 4.5. Deploy project
- [ ] 4.6. Set up custom domain: `yourdomain.com` and `www.yourdomain.com`
- [ ] 4.7. Configure Cloudflare DNS (CNAME to Vercel)
- [ ] 4.8. Verify SSL certificate active
- [ ] 4.9. Test frontend loads: `https://yourdomain.com`

**Output**: Live frontend at your domain

---

### Step 5: Update Backend CORS ⏱️ 2 minutes

- [ ] 5.1. Go back to Render Dashboard
- [ ] 5.2. Update `CORS_ORIGIN` environment variable:
  ```
  CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
  ```
- [ ] 5.3. Save (Render will auto-redeploy)
- [ ] 5.4. Wait 2-3 minutes for redeploy

---

### Step 6: Alchemy Webhook Configuration ⏱️ 10 minutes

- [ ] 6.1. Go to Alchemy dashboard: https://dashboard.alchemy.com
- [ ] 6.2. Select BSC Mainnet app/project
- [ ] 6.3. Create new Custom GraphQL webhook (if not exists)
- [ ] 6.4. Set webhook URL: `https://api.yourdomain.com/api/v1/webhooks/alchemy`
- [ ] 6.5. Configure GraphQL query (see `backend/SetupWebhooks.md`)
- [ ] 6.6. Add all 4 event types:
  - [ ] `PredictorJoined` (SignalFriendMarket)
  - [ ] `PredictorNFTMinted` (PredictorAccessPass)
  - [ ] `SignalPurchased` (SignalFriendMarket)
  - [ ] `PredictorBlacklisted` (PredictorAccessPass)
- [ ] 6.7. Copy signing key → Update in Render: `ALCHEMY_SIGNING_KEY`
- [ ] 6.8. Test webhook from Alchemy dashboard
- [ ] 6.9. Check Render logs for webhook receipt

---

### Step 7: Cloudflare SSL Configuration ⏱️ 5 minutes

- [ ] 7.1. Go to Cloudflare dashboard
- [ ] 7.2. Select your domain
- [ ] 7.3. Go to **SSL/TLS** → **Overview**
- [ ] 7.4. Set encryption mode: **Full (strict)**
- [ ] 7.5. Go to **SSL/TLS** → **Edge Certificates**
- [ ] 7.6. Enable:
  - [ ] Always Use HTTPS
  - [ ] HTTP Strict Transport Security (HSTS)
  - [ ] Minimum TLS Version: 1.2
  - [ ] Automatic HTTPS Rewrites
- [ ] 7.7. Test: Visit `http://yourdomain.com` → should redirect to HTTPS

---

### Step 8: Sentry Setup (Optional but Recommended) ⏱️ 10 minutes

- [ ] 8.1. Go to https://sentry.io
- [ ] 8.2. Create account or log in
- [ ] 8.3. Create new project: "SignalFriend Frontend" (React)
- [ ] 8.4. Copy DSN
- [ ] 8.5. Add to Vercel environment variables: `VITE_SENTRY_DSN`
- [ ] 8.6. Redeploy frontend (Vercel will auto-deploy on env change)
- [ ] 8.7. Test: Trigger an error, check Sentry dashboard

---

## 🧪 Post-Deployment Testing

### Backend Testing

- [ ] Health endpoint responds: `curl https://api.yourdomain.com/health`
- [ ] Categories endpoint: `curl https://api.yourdomain.com/api/v1/categories`
- [ ] MongoDB connection successful (check Render logs)
- [ ] Webhooks receiving events (create test transaction)
- [ ] Rate limiting active (test with script)

### Frontend Testing

- [ ] Landing page loads correctly
- [ ] Logo and images display
- [ ] Navigation works (all pages)
- [ ] Mobile responsive (test on phone)
- [ ] Connect wallet button works
- [ ] Can connect MetaMask to BSC Mainnet
- [ ] SIWE sign-in works
- [ ] JWT stored in localStorage
- [ ] Refreshing page keeps user logged in
- [ ] Signals page loads
- [ ] Filters and search work
- [ ] Signal detail page works
- [ ] "Become a Predictor" page works
- [ ] (Optional) Test purchase flow with real USDT

### Integration Testing

- [ ] Frontend can communicate with backend (no CORS errors)
- [ ] Predictor registration creates database record
- [ ] Signal creation works
- [ ] Purchase creates receipt in database
- [ ] Webhooks create/update records correctly
- [ ] Admin dashboard accessible (for admin wallets)

### Security Testing

- [ ] HTTPS enforced on both frontend and backend
- [ ] No mixed content warnings
- [ ] CORS only allows your domain
- [ ] Rate limiting blocks excessive requests
- [ ] JWT expiration works (after 7 days)
- [ ] Admin endpoints require admin wallet
- [ ] Webhook signature validation active

---

## 📊 Monitoring Setup

### Render Monitoring

- [ ] Set up email notifications for deploy failures
- [ ] Monitor CPU/Memory usage in Metrics tab
- [ ] Set up log alerts for errors

### Vercel Monitoring

- [ ] Enable Vercel Analytics
- [ ] Enable Speed Insights
- [ ] Monitor Core Web Vitals

### MongoDB Atlas Monitoring

- [ ] Set up email alerts for:
  - [ ] High connection count (approaching limit)
  - [ ] High storage usage (approaching limit)
  - [ ] Connection failures
- [ ] Monitor cluster metrics daily

### Sentry Monitoring (if configured)

- [ ] Set up email notifications for new errors
- [ ] Configure error grouping
- [ ] Set up release tracking

---

## 💰 Cost Summary

### Initial Setup (Month 1)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 (Free) or M10 | $0 or $57/month |
| Render Backend | Starter | $7/month |
| Vercel Frontend | Hobby (Free) | $0/month |
| WalletConnect | Free | $0/month |
| Sentry | Free (10k events/month) | $0/month |
| **Total (Free DB)** | | **$7/month** |
| **Total (M10 DB)** | | **$64/month** |

### Scaling Up (As you grow)

| Service | Upgrade To | Cost |
|---------|------------|------|
| MongoDB Atlas | M20 | $145/month |
| Render Backend | Standard | $25/month |
| Vercel Frontend | Pro | $20/month |
| Sentry | Team | $26/month |
| **Total** | | **$216/month** |

---

## 🎉 Deployment Complete!

### Your Live URLs

- **Frontend**: https://yourdomain.com
- **Backend API**: https://api.yourdomain.com
- **Health Check**: https://api.yourdomain.com/health
- **Admin Dashboard**: https://yourdomain.com/admin

### Credentials to Save

Store these securely (password manager recommended):

1. **MongoDB Atlas**:
   - Connection URI (with password)
   - Database username and password
   - Cluster name

2. **Render**:
   - Account email
   - Service name
   - JWT secret (generated)

3. **Vercel**:
   - Account email
   - Project name

4. **WalletConnect**:
   - Project ID

5. **Alchemy**:
   - Webhook signing key

6. **Cloudflare**:
   - Domain credentials
   - API keys (if any)

---

## 🔄 Ongoing Maintenance

### Daily
- [ ] Check Sentry for new errors
- [ ] Monitor Render logs for issues

### Weekly
- [ ] Review Vercel Analytics (traffic patterns)
- [ ] Check MongoDB Atlas metrics (storage, connections)
- [ ] Review Render Metrics (CPU, memory)

### Monthly
- [ ] Review costs (MongoDB, Render, Vercel)
- [ ] Update dependencies (security patches)
- [ ] Review rate limiting effectiveness
- [ ] Backup MongoDB data

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Consider scaling up services

---

## 🆘 Emergency Contacts & Resources

### If Site Goes Down

1. Check status pages:
   - Render: https://status.render.com
   - Vercel: https://www.vercel-status.com
   - MongoDB Atlas: https://status.mongodb.com
   - Cloudflare: https://www.cloudflarestatus.com

2. Check logs:
   - Render: Dashboard → Logs tab
   - Vercel: Dashboard → Deployments → View Function Logs
   - MongoDB: Atlas Dashboard → Metrics

3. Rollback if needed:
   - Render: Events tab → Rollback
   - Vercel: Deployments tab → Rollback

### Support Resources

- **Render**: https://render.com/help
- **Vercel**: https://vercel.com/help
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/support
- **Alchemy**: https://docs.alchemy.com/docs/support
- **WalletConnect**: https://docs.walletconnect.com/

---

## 📚 Documentation References

- `DEPLOYMENT_MONGODB_ATLAS.md` - MongoDB setup guide
- `DEPLOYMENT_RENDER.md` - Backend deployment guide
- `DEPLOYMENT_VERCEL.md` - Frontend deployment guide
- `backend/RUNBOOK.md` - Backend operations guide
- `backend/SetupWebhooks.md` - Alchemy webhook setup
- `frontend/RUNBOOK.md` - Frontend operations guide
- `contracts/RUNBOOK.md` - Smart contract operations

---

## ✅ Final Checklist

Before announcing launch:

- [ ] All deployment steps completed
- [ ] All testing passed
- [ ] Monitoring configured
- [ ] Credentials backed up securely
- [ ] Emergency rollback plan tested
- [ ] Team trained on monitoring tools
- [ ] Social media accounts ready
- [ ] Discord/support channels ready
- [ ] Terms & Conditions page live
- [ ] Contact information correct

---

## 🚀 Ready to Launch!

Your SignalFriend platform is now fully deployed and ready for production use!

**Next steps:**
1. Announce launch on social media
2. Share with early adopters
3. Monitor closely for first 48 hours
4. Gather user feedback
5. Iterate and improve

**Congratulations! 🎉**
