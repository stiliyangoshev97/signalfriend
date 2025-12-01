# 🔗 Alchemy Webhook Setup Guide

> This guide walks you through setting up Alchemy webhooks to index blockchain events for SignalFriend.

---

## 📋 Overview

The backend uses Alchemy webhooks to listen for blockchain events and sync them to MongoDB. When events occur on-chain, Alchemy sends a POST request to our backend webhook endpoint.

### Events We Monitor

| Event | Contract | Purpose |
|-------|----------|---------|
| `PredictorJoined` | SignalFriendMarket | Create new Predictor record in MongoDB |
| `SignalPurchased` | SignalFriendMarket | Create new Receipt record in MongoDB |
| `PredictorBlacklisted` | PredictorAccessPass | Update Predictor's blacklist status |

### Contracts to Monitor

| Contract | Testnet Address (Chain ID 97) |
|----------|-------------------------------|
| SignalFriendMarket | `0x5133397a4B9463c5270beBa05b22301e6dD184ca` |
| PredictorAccessPass | `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` |

> ⚠️ **Note:** We do NOT need to monitor SignalKeyNFT - the `SignalPurchased` event from SignalFriendMarket contains all the data we need.

---

## 🚀 Setup Steps

### Step 1: Create Alchemy Account

1. Go to [https://dashboard.alchemy.com/](https://dashboard.alchemy.com/)
2. Sign up or log in

### Step 2: Create a New App (if you don't have one)

1. Click **"Create new app"**
2. Select:
   - **Chain**: BNB Smart Chain
   - **Network**: BNB Smart Chain Testnet (for testing) or Mainnet (for production)
3. Give it a name (e.g., "SignalFriend")

### Step 3: Create the Webhook

> ⚠️ **IMPORTANT:** You must use a **Custom Webhook (GraphQL)** type, NOT "Address Activity". 
> Address Activity only captures token transfers, not custom contract events like `PredictorJoined`.

1. Navigate to **Webhooks** in the left sidebar
2. Click **"Create Webhook"**
3. Select **"Custom Webhook"** (GraphQL type)
4. Configure:
   - **Chain**: BNB Smart Chain
   - **Network**: BNB Smart Chain Testnet
   - **Webhook URL**: Your backend endpoint (see options below)

### Step 4: Configure GraphQL Query

Use this GraphQL query to capture all event logs from our contracts:

```graphql
{
  block {
    logs(filter: {addresses: ["0x5133397a4B9463c5270beBa05b22301e6dD184ca", "0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4"]}) {
      transaction {
        hash
        from {
          address
        }
        to {
          address
        }
      }
      topics
      data
      account {
        address
      }
    }
  }
}
```

**Contract Addresses to Monitor:**
- `0x5133397a4B9463c5270beBa05b22301e6dD184ca` - SignalFriendMarket
- `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` - PredictorAccessPass

### Step 5: Copy the Signing Key

After creating the webhook:
1. Click on your webhook to view details
2. Find the **"Signing Key"** (also called Auth Token)
3. Copy it

### Step 6: Update Your .env File

Add the signing key to your backend `.env` file:

```bash
ALCHEMY_SIGNING_KEY=your-signing-key-here
```

---

## 🌐 Webhook URL Options

Your webhook endpoint is: `/api/webhooks/alchemy`

### Option A: Local Development with ngrok

1. Install ngrok:
   ```bash
   brew install ngrok
   ```

2. Sign up at [ngrok.com](https://ngrok.com/) and get your auth token

3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

5. In another terminal, expose your localhost:
   ```bash
   ngrok http 3001
   ```

6. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

7. Use this as your webhook URL:
   ```
   https://abc123.ngrok.io/api/webhooks/alchemy
   ```

> ⚠️ **Note**: The ngrok URL changes every time you restart ngrok (unless you have a paid plan). You'll need to update the webhook URL in Alchemy each time.

### Option B: Deployed Backend

If your backend is deployed (e.g., Railway, Render, AWS, Heroku):

```
https://your-backend-domain.com/api/webhooks/alchemy
```

---

## ✅ Testing the Webhook

### Test 1: Health Check

Your webhook has a health endpoint:
```bash
curl https://your-webhook-url/api/webhooks/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-12-01T12:00:00.000Z"
  }
}
```

### Test 2: Trigger a Real Event

1. Go to BscScan testnet: https://testnet.bscscan.com/
2. Connect your wallet
3. Call `joinAsPredictor()` on the SignalFriendMarket contract
4. Check your backend logs - you should see the event being processed

### Test 3: Manual Webhook Test (Simulate)

You can test your webhook locally without Alchemy by sending a mock payload:

```bash
curl -X POST http://localhost:3001/api/webhooks/alchemy \
  -H "Content-Type: application/json" \
  -d '{
    "webhookId": "test-webhook",
    "id": "test-event-1",
    "createdAt": "2024-12-01T12:00:00.000Z",
    "type": "ADDRESS_ACTIVITY",
    "event": {
      "network": "BNB_TESTNET",
      "activity": []
    }
  }'
```

---

## 🔧 Troubleshooting

### Webhook not receiving events?

1. **Check the URL**: Make sure the webhook URL is correct and accessible from the internet
2. **Check Alchemy Dashboard**: Look at the webhook delivery logs for errors
3. **Check your backend logs**: Enable debug logging to see incoming requests
4. **Verify contract addresses**: Make sure you added the correct addresses

### Signature verification failing?

1. Make sure `ALCHEMY_SIGNING_KEY` in `.env` matches the key in Alchemy Dashboard
2. In development, if the key is not set, signature verification is skipped (see `webhook.service.ts`)

### Events not being processed?

1. Check the event topic matches our expected signatures
2. Verify the log data is being decoded correctly
3. Check MongoDB connection is working

---

## 📊 Event Signatures Reference

These are the topic0 hashes we listen for:

| Event | Signature Hash |
|-------|----------------|
| PredictorJoined | `0x2f2789d1da7b490fc20c28c5014f1fdd449737869b924042025cd634b2248cc4` |
| SignalPurchased | `0x906c548d19aa6c7ed9e105a3d02cb6a435b802903a30000aa9ad5e01d93ef647` |
| PredictorBlacklisted | `0xad6b8655f145f95522485d58e7cd8ca2689dbe89691511217c7cc914b1226005` |

---

## 📁 Related Files

- `src/features/webhooks/webhook.service.ts` - Event processing logic
- `src/features/webhooks/webhook.schemas.ts` - Event signatures & payload validation
- `src/features/webhooks/webhook.controller.ts` - Express route handler
- `src/features/webhooks/webhook.routes.ts` - Route definitions

---

## 🔄 Switching Networks

When switching from testnet to mainnet:

1. Update `CHAIN_ID` in `.env`:
   ```bash
   CHAIN_ID=56  # Mainnet
   ```

2. Update `RPC_URL` in `.env`:
   ```bash
   RPC_URL=https://bsc-rpc.publicnode.com
   ```

3. Update contract addresses in `src/contracts/addresses.ts` with your mainnet deployments

4. Create a **new Alchemy webhook** for BNB Mainnet with the mainnet contract addresses

5. Update `ALCHEMY_SIGNING_KEY` with the new webhook's signing key

---

## 📝 Checklist

- [ ] Created Alchemy account
- [ ] Created Alchemy app for BNB Testnet
- [ ] Created webhook with "Address Activity" type
- [ ] Added SignalFriendMarket address: `0x5133397a4B9463c5270beBa05b22301e6dD184ca`
- [ ] Added PredictorAccessPass address: `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4`
- [ ] Set webhook URL (ngrok or deployed)
- [ ] Copied signing key to `.env` as `ALCHEMY_SIGNING_KEY`
- [ ] Tested webhook health endpoint
- [ ] Triggered a real event and verified it was processed

---

## 🆘 Need Help?

If you run into issues:
1. Check the Alchemy webhook delivery logs
2. Check your backend console/logs
3. Verify MongoDB is running and connected
4. Make sure all environment variables are set correctly
