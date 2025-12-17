# 🚀 Alchemy Webhook - Production Setup (Quick Reference)

> **Date Created:** December 18, 2025  
> **Status:** Production Ready  
> **Environment:** BSC Mainnet (Chain ID 56)

---

## ✅ Production Webhook Configuration

### 1. Webhook URL
```
https://api.signalfriend.com/api/webhooks/alchemy
```

### 2. Webhook Type
**Custom Webhook (GraphQL)** - NOT "Address Activity"

### 3. Network
- **Chain:** BNB Smart Chain
- **Network:** BNB Smart Chain Mainnet
- **Chain ID:** 56

### 4. GraphQL Query (Copy-Paste Ready)

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

### 5. Contract Addresses (Mainnet)

| Contract | Address |
|----------|---------|
| SignalFriendMarket | `0xaebec2cd5c2db4c0875de215515b3060a7a652fb` |
| PredictorAccessPass | `0x198cd0549a0dba09aa3ab88e0b51ceb8dd335d07` |

### 6. Events Monitored

| Event | Contract | Purpose |
|-------|----------|---------|
| `PredictorJoined` | SignalFriendMarket | Create new Predictor record |
| `PredictorNFTMinted` | PredictorAccessPass | Create Predictor record (owner mint) |
| `SignalPurchased` | SignalFriendMarket | Create Receipt record |
| `PredictorBlacklisted` | PredictorAccessPass | Update blacklist status |

---

## 🔑 Environment Variables

Make sure these are set in your Render backend:

```bash
ALCHEMY_SIGNING_KEY=whsec_your_production_signing_key_here
CHAIN_ID=56
RPC_URL=https://bsc-dataseed.binance.org/
```

---

## 📋 Setup Checklist

- [ ] Create Custom Webhook in Alchemy Dashboard
- [ ] Set webhook URL to `https://api.signalfriend.com/api/webhooks/alchemy`
- [ ] Select BNB Smart Chain Mainnet
- [ ] Paste the GraphQL query with mainnet contract addresses
- [ ] Copy the signing key (starts with `whsec_`)
- [ ] Add `ALCHEMY_SIGNING_KEY` to Render environment variables
- [ ] Restart backend service on Render
- [ ] Test by joining as predictor or buying a signal
- [ ] Check backend logs on Render for webhook events
- [ ] Verify database records are created in MongoDB Atlas

---

## 🧪 Testing the Webhook

### Method 1: Real Transaction
1. Join as a predictor on https://signalfriend.com
2. Check Render logs for: `[Webhook] PredictorJoined event processed`
3. Verify predictor record exists in MongoDB

### Method 2: Check Webhook Activity
1. Go to Alchemy Dashboard → Webhooks
2. Click on your webhook
3. View "Recent Activity" to see triggered events
4. Check response status (should be 200)

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook returns 401 | Check `ALCHEMY_SIGNING_KEY` is correct in Render |
| No events received | Verify contract addresses match mainnet deployment |
| Events received but not processed | Check backend logs on Render for errors |
| Webhook shows 500 errors | Check Render logs for backend crashes |

---

## 📚 Related Documentation

- Full Setup Guide: [`/backend/SetupWebhooks.md`](backend/SetupWebhooks.md)
- Backend Deployment: [`/DEPLOYMENT_RENDER.md`](DEPLOYMENT_RENDER.md)
- Contract Addresses: [`/contracts/deployment-addresses.txt`](contracts/deployment-addresses.txt)
