# 🔗 Alchemy Webhook Setup Guide

> This guide walks you through setting up Alchemy Custom (GraphQL) webhooks to index blockchain events for SignalFriend.

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

| Environment | Contract | Address |
|-------------|----------|---------|
| **Mainnet (Chain ID 56)** | SignalFriendMarket | `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` |
| **Mainnet (Chain ID 56)** | PredictorAccessPass | `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` |
| **Testnet (Chain ID 97)** | SignalFriendMarket | `0x5133397a4B9463c5270beBa05b22301e6dD184ca` |
| **Testnet (Chain ID 97)** | PredictorAccessPass | `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` |

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

### Step 3: Create the Custom Webhook

> ⚠️ **IMPORTANT:** You MUST use a **Custom Webhook** type, NOT "Address Activity". 
> Address Activity only captures token transfers, not custom contract events like `PredictorJoined`.

1. Navigate to **Webhooks** in the left sidebar
2. Click **"Create Webhook"**
3. Select **"Custom Webhook"** (this uses GraphQL)
4. Configure:
   - **Chain**: BNB Smart Chain
   - **Network**: BNB Smart Chain Mainnet (for production) or Testnet (for testing)
   - **Webhook URL**: 
     - **Production**: `https://api.signalfriend.com/api/webhooks/alchemy`
     - **Development**: Your ngrok URL (e.g., `https://your-ngrok-url.ngrok-free.dev/api/webhooks/alchemy`)

### Step 4: Configure GraphQL Query

**For BSC Mainnet (Production) - Use these contract addresses:**

```graphql
{
  block {
    hash,
    number,
    timestamp,
    logs(filter: {addresses: ["0xaebec2cd5c2db4c0875de215515b3060a7a652fb", "0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07"]}) { 
      data,
      topics,
      index,
      account {
        address
      },
      transaction {
        hash,
        nonce,
        index,
        from {
          address
        },
        to {
          address
        },
        value,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gas,
        status,
        gasUsed,
        cumulativeGasUsed,
        effectiveGasPrice,
        createdContract {
          address
        }
      }
    }
  }
}
```

**For BSC Testnet (Development) - Use these contract addresses:**

```graphql
{
  block {
    hash,
    number,
    timestamp,
    logs(filter: {addresses: ["0x5133397a4B9463c5270beBa05b22301e6dD184ca", "0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4"]}) { 
      data,
      topics,
      index,
      account {
        address
      },
      transaction {
        hash,
        nonce,
        index,
        from {
          address
        },
        to {
          address
        },
        value,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gas,
        status,
        gasUsed,
        cumulativeGasUsed,
        effectiveGasPrice,
        createdContract {
          address
        }
      }
    }
  }
}
```

**What this query captures:**

| Field | Purpose |
|-------|---------|
| `block.hash` | Block identifier |
| `block.number` | Block height |
| `block.timestamp` | When the event occurred |
| `logs.topics` | Event signature (topic0) + indexed params |
| `logs.data` | Non-indexed event parameters (ABI-encoded) |
| `logs.account.address` | Contract that emitted the event |
| `transaction.hash` | Transaction reference |
| `transaction.from.address` | Who initiated the transaction |
| `transaction.status` | Success/failure status |

**Contract Addresses:**

**BSC Mainnet (Production - Chain ID 56):**
- `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` - SignalFriendMarket (PredictorJoined, SignalPurchased)
- `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` - PredictorAccessPass (PredictorBlacklisted)

**BSC Testnet (Development - Chain ID 97):**
- `0x5133397a4B9463c5270beBa05b22301e6dD184ca` - SignalFriendMarket (PredictorJoined, SignalPurchased)
- `0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4` - PredictorAccessPass (PredictorBlacklisted)

> ⚠️ **Important:** Use the correct addresses for your environment (mainnet vs testnet).

### Step 5: Copy the Signing Key

After creating the webhook:
1. Click on your webhook to view details
2. Find the **"Signing Key"** (starts with `whsec_`)
3. Copy it

### Step 6: Update Your .env File

Add the signing key to your backend `.env` file:

```bash
ALCHEMY_SIGNING_KEY=whsec_your-signing-key-here
```

---

## 📦 GraphQL Webhook Payload Structure

When an event occurs, Alchemy sends this payload structure:

```json
{
  "webhookId": "wh_abc123",
  "id": "evt_xyz789",
  "createdAt": "2024-12-01T12:00:00.000Z",
  "type": "GRAPHQL",
  "event": {
    "data": {
      "block": {
        "hash": "0xabc123...",
        "number": 12345678,
        "timestamp": 1701432000,
        "logs": [
          {
            "data": "0x...",
            "topics": [
              "0x2f2789d1da7b490fc20c28c5014f1fdd449737869b924042025cd634b2248cc4",
              "0x000000000000000000000000predictor-address..."
            ],
            "index": 0,
            "account": {
              "address": "0x5133397a4b9463c5270beba05b22301e6dd184ca"
            },
            "transaction": {
              "hash": "0x1234...",
              "nonce": 42,
              "index": 0,
              "from": { "address": "0xbuyer..." },
              "to": { "address": "0xcontract..." },
              "value": "0",
              "gasPrice": "3000000000",
              "gas": 200000,
              "status": 1,
              "gasUsed": 150000,
              "effectiveGasPrice": "3000000000"
            }
          }
        ]
      }
    },
    "sequenceNumber": "12345"
  }
}
```

Our backend handles this structure in `webhook.service.ts` → `processGraphqlWebhook()`.

---

## 🌐 Webhook URL Options

Your webhook endpoint is: `/api/webhooks/alchemy`

### Option A: Production (Recommended)

**Use this URL for your production Alchemy webhook:**
```
https://api.signalfriend.com/api/webhooks/alchemy
```

✅ This points to your Render backend with custom domain.

### Option B: Local Development with ngrok (For Testing)

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

6. Copy the ngrok URL (e.g., `https://preinaugural-subconvex-belen.ngrok-free.dev`)

7. Use this as your webhook URL in Alchemy:
   ```
   https://preinaugural-subconvex-belen.ngrok-free.dev/api/webhooks/alchemy
   ```

> 💡 **Tip**: With a free ngrok account, your URL changes each restart. Update the webhook URL in Alchemy accordingly.

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
- [ ] Created **Custom Webhook** (NOT Address Activity)
- [ ] Pasted the GraphQL query with both contract addresses
- [ ] Set webhook URL (ngrok or deployed)
- [ ] Copied signing key (starts with `whsec_`) to `.env` as `ALCHEMY_SIGNING_KEY`
- [ ] Started backend with `npm run dev`
- [ ] Tested webhook by triggering a real blockchain event
- [ ] Verified event was processed (check backend logs & MongoDB)

---

## 🆘 Need Help?

If you run into issues:
1. Check the Alchemy webhook delivery logs
2. Check your backend console/logs
3. Verify MongoDB is running and connected
4. Make sure all environment variables are set correctly
