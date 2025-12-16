# MongoDB Atlas Setup Guide

> **Production Database Setup for SignalFriend**  
> Last Updated: December 17, 2025

---

## 🎯 Prerequisites

- MongoDB Atlas account (free tier works for starting)
- Access to your local MongoDB data (if migrating from local)

---

## 📋 Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up or log in
3. Choose **FREE** shared tier (M0) to start (or M10+ for production scale)

### 2. Create a New Cluster

1. Click **"Build a Database"**
2. Choose **Shared** (Free tier) or **Dedicated** (Production)
3. Select **Cloud Provider**: AWS, Google Cloud, or Azure
4. Select **Region**: Choose closest to your Render backend region
   - Recommended: Same region as Render (e.g., `us-east-1` or `eu-west-1`)
5. **Cluster Name**: `signalfriend-production`
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 3. Configure Database Access

#### Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `signalfriend-backend`
5. **Password**: Generate a strong password (SAVE THIS!)
   - Example tool: `openssl rand -base64 32`
6. **Database User Privileges**: Select **"Read and write to any database"**
7. Click **"Add User"**

#### Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development testing: Add your current IP
4. For Render production: **Add `0.0.0.0/0`** (allows access from anywhere)
   - ⚠️ This is safe because authentication is still required via username/password
   - Render's IP addresses are dynamic, so this is the recommended approach
5. Click **"Confirm"**

### 4. Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.5 or later
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://signalfriend-backend:<password>@signalfriend-production.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=signalfriend-production
   ```
7. **Replace `<password>`** with your actual database user password
8. **Add database name** after `.net/`: Change to:
   ```
   mongodb+srv://signalfriend-backend:YOUR_PASSWORD@signalfriend-production.xxxxx.mongodb.net/signalfriend?retryWrites=true&w=majority&appName=signalfriend-production
   ```

### 5. Configure Connection String for Production

Your final MongoDB URI should look like:
```
mongodb+srv://signalfriend-backend:YOUR_STRONG_PASSWORD@signalfriend-production.xxxxx.mongodb.net/signalfriend?retryWrites=true&w=majority&appName=signalfriend-production
```

**Important Notes:**
- Database name is `signalfriend` (after `.net/`)
- Password must be URL-encoded if it contains special characters
- Keep this URI **SECRET** - never commit to git

---

## 🔄 Data Migration (Optional - If you have local data)

If you have data in your local MongoDB that you want to migrate:

### Option 1: Using MongoDB Compass (GUI)

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to your **local MongoDB**:
   ```
   mongodb://localhost:27017/signalfriend
   ```
3. Export collections:
   - Select collection → Collection → Export Collection → JSON
   - Export: `predictors`, `signals`, `receipts`, `reviews`, `categories`, `reports`, `disputes`
4. Connect to **MongoDB Atlas** (using your Atlas connection string)
5. Import collections:
   - Select database `signalfriend` → Add Data → Import JSON

### Option 2: Using mongodump/mongorestore (CLI)

```bash
# 1. Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/signalfriend" --out=./mongodb-backup

# 2. Restore to MongoDB Atlas
mongorestore --uri="mongodb+srv://signalfriend-backend:YOUR_PASSWORD@signalfriend-production.xxxxx.mongodb.net/signalfriend" ./mongodb-backup/signalfriend
```

### Option 3: Start Fresh

If you don't have critical data:
1. Deploy backend with Atlas connection
2. Run seeding scripts:
   ```bash
   npm run seed:categories
   npm run seed:signals:100  # or seed:signals:500
   ```

---

## 🧪 Test Connection

### Test Locally First

1. Update your local `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://signalfriend-backend:YOUR_PASSWORD@signalfriend-production.xxxxx.mongodb.net/signalfriend?retryWrites=true&w=majority&appName=signalfriend-production
   ```

2. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Check logs for:
   ```
   ✅ MongoDB connected successfully
   ```

4. If successful, your Atlas setup is correct!

---

## 📊 MongoDB Atlas Tips

### Free Tier Limits (M0)
- **Storage**: 512 MB
- **RAM**: Shared
- **Connections**: 500 max
- **Suitable for**: Development, small production (< 1000 users)

### Recommended for Production (M10+)
- **Storage**: 10 GB - 4 TB
- **RAM**: Dedicated 2 GB - 256 GB
- **Connections**: Thousands
- **Backups**: Automated daily snapshots
- **Price**: Starts at ~$57/month (M10)

### Monitoring

1. Go to **Metrics** tab in Atlas dashboard
2. Monitor:
   - Connections
   - Operations per second
   - Network traffic
   - Storage usage

### Upgrade Path

Start with M0 (free), monitor usage, upgrade when needed:
- **M0** → **M10** when you hit storage/connection limits
- **M10** → **M20** when you need more performance

---

## 🔐 Security Checklist

- [x] Strong database user password (32+ characters)
- [x] Network access restricted (or `0.0.0.0/0` with auth)
- [x] Connection string stored in environment variables only
- [x] Never commit connection string to git
- [x] Enable MongoDB Atlas IP whitelisting if possible
- [x] Regularly rotate database passwords

---

## 📝 Environment Variable for Render

When setting up Render (next step), add this environment variable:

```
MONGODB_URI=mongodb+srv://signalfriend-backend:YOUR_PASSWORD@signalfriend-production.xxxxx.mongodb.net/signalfriend?retryWrites=true&w=majority&appName=signalfriend-production
```

---

## 🆘 Troubleshooting

### "Authentication failed"
- Check username/password are correct
- Ensure password is URL-encoded (special chars: `@`, `#`, `:`, `/` need encoding)

### "Connection timeout"
- Check Network Access whitelist includes your IP or `0.0.0.0/0`
- Check firewall isn't blocking port 27017

### "Database not found"
- Ensure database name is in connection string: `.net/signalfriend?...`

### "Too many connections"
- Free tier (M0) has max 500 connections
- Ensure backend properly closes connections
- Consider upgrading to M10+

---

## ✅ Next Steps

Once MongoDB Atlas is configured:
1. ✅ Test connection locally
2. → Proceed to **DEPLOYMENT_RENDER.md** for backend deployment
3. → Then **DEPLOYMENT_VERCEL.md** for frontend deployment
