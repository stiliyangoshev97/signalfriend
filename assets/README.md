# 📦 SignalFriend Assets

Static assets for the SignalFriend platform.

---

## 📁 Folder Structure

```
assets/
├── branding/              # Brand identity files
│   └── logo.png           # Main logo (use for website, socials, etc.)
│
├── nft-metadata/          # NFT metadata for IPFS/Pinata upload
│   ├── predictor-pass/    # PredictorAccessPass NFT
│   │   ├── metadata.json  # NFT metadata (name, description, image URL)
│   │   └── image.png      # NFT artwork
│   │
│   └── signal-key/        # SignalKeyNFT
│       ├── metadata.json  # NFT metadata
│       └── image.png      # NFT artwork
│
└── README.md              # This file
```

---

## 🎨 NFT Metadata Format

Standard ERC-721 metadata format:

```json
{
  "name": "SignalFriend Predictor Pass",
  "description": "Soulbound NFT license for verified predictors on SignalFriend.",
  "image": "ipfs://Qm.../image.png",
  "external_url": "https://signalfriend.com",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Predictor License"
    }
  ]
}
```

---

## 📤 Upload to Pinata (IPFS)

1. **Upload image first** → Get IPFS CID
2. **Update metadata.json** with image IPFS URL
3. **Upload metadata.json** → Get metadata IPFS CID
4. **Use metadata CID** as the `baseURI` in smart contracts

Example baseURI: `ipfs://QmYourMetadataCID/`

---

## ⚠️ Notes

- These are **source files** - keep backups!
- Frontend will have its own copy of assets in `/frontend/public/` or `/frontend/assets/`
- After uploading to Pinata, record the IPFS CIDs somewhere safe
