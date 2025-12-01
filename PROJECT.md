# SignalFriend

## Overview

Signa| **Product**          | Predictors sell individual trading signals/reports packaged as an **Non-Fungible Token (NFT)**. The NFT acts as a secure, one-time-use **key** to unlock the signal's private content stored off-chain. |
| **Target Chain**     | **BNB Chain** (BEP-20/BEP-721).                                                                                                                                                                         |
| **Payment Currency** | **USDT (BEP-20, 18 decimals)** for all fees and signal purchases.                                                                                                                                       |
| **Legal Strategy**   | Platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising.                             |end is a **Web3 Transparent Signal Marketplace** that connects verified prediction makers (Predictors) with traders via a transparent, on-chain NFT mechanism. By structuring the core transaction around an **NFT as a data ticket** within a **gated room**, the platform is legally positioned as a **Digital Information Marketplace** rather than a gambling or betting platform.

---

## Legal Framework: Addressing the Gambling Risk

The key to avoiding the "gambling" classification is the **NFT as the purchased item**.

| Your NFT-Based Model                                                                                                        | Why It's **NOT** Gambling                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The Purchase:** A trader pays $X USDC for an NFT (the "ticket").                                                          | This is a **purchase of a digital asset** (the NFT) that contains a piece of data (the signal). The value is exchanged immediately for the data itself, not for a contingent future payout. |
| **The Signal/Prediction:** The prediction is stored in the NFT's metadata (e.g., Target Price, Timeframe).                  | The prediction is the **content** of the purchased NFT, making the NFT a *content delivery mechanism*, similar to buying a digital research report or a streaming ticket.                   |
| **No Payout:** When the prediction is correct, the platform/predictor does **not** send any additional funds to the trader. | This breaks the "Prize" element of gambling. The success of the prediction only improves the predictor's **reputation** (rank) and future sales, not their payout for that specific signal. |

**Conclusion:** This model legally looks like an NFT marketplace (like OpenSea or Magic Eden) where the NFTs are for a **Utility** (data access) rather than art. This is a much safer legal classification.

---

## 📝 Project Summary for Future Reference

# ⭐️ SignalFriend: Master Project Summary (Final V4)

---

## I. Core Project Overview

| Category             | Detail                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project**          | **SignalFriend** (Web3 Transparent Signal Marketplace)                                                                                                                                                  |
| **Objective**        | Connect verified prediction makers (Predictors) with traders (Traders) via a transparent, on-chain NFT mechanism that eliminates trust issues.                                                          |
| **Product**          | Predictors sell individual trading signals/reports packaged as an **Non-Fungible Token (NFT)**. The NFT acts as a secure, one-time-use **key** to unlock the signal's private content stored off-chain. |
| **Target Chain**     | **BNB Chain** (BEP-20/BEP-721).                                                                                                                                                                         |
| **Payment Currency** | **USDT (BEP-20)** for all fees and signal purchases.                                                                                                                                                    |
| **Legal Strategy**   | Platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising.                             |

---

## II. Business Model & Financial Logic (Smart Contract Rules)

| Revenue Stream                | Detail                                                                                                                                  | Smart Contract Execution                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Predictor Join Fee**        | **$20 USDT** (One-time, non-refundable fee).                                                                                            | Handled by `joinAsPredictor`.                                                                     |
| **Predictor Referral Payout** | **$5 USDT** (25% of the join fee) is paid instantly to the existing Predictor if they hold a Predictor Access Pass NFT.                 | Enforced by `joinAsPredictor` logic.                                                              |
| **Trader Access Fee (Flat)**  | **$0.5 USDT** flat fee added to **every** signal purchase.                                                                              | Mitigates Sybil Attacks; routed directly to the platform Treasury.                                |
| **Minimum Signal Price**      | Signal price **cannot be less than $5 USDT**.                                                                                           | Enforced by `buySignalNFT` logic.                                                                 |
| **Signal Price Fee**          | Price set by Predictor (min. $5 USDT).                                                                                                  | The primary portion of the sale, subject to the commission split.                                 |
| **Commission**                | **5%** commission (adjustable via MultiSig) on the Signal Price Fee. The remaining 95% goes to the Predictor.                           | Enforced by `buySignalNFT` logic.                                                                 |
| **Treasury Management**       | All platform fees are routed directly to an Externally Owned Account (EOA) (Ledger-backed), which is rotated periodically for security. | The Logic Contract contains a MultiSig-guarded function to update the `platformTreasury` address. |

---

## III. Contract Architecture & Security

The platform uses **three tightly integrated Smart Contracts**, all governed by a **3-of-3 MultiSignature (MultiSig) team** (`approveChanges` mechanism) for security on all owner functions.

| Contract Name                  | Role & Function                                                                                                              | Key Security Mechanism                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.** SignalFriend **Market** | **Logic/Controller:** Orchestrates all financial transfers and business rules (fees, referral, commission).                  | **Mint Gating:** Only this contract is permitted to call the minting functions on the two NFT contracts.                                          |
| **2. PredictorAccessPass**     | **ERC-721 Seller License (Non-Transferable/Soulbound):** Proof of registration.                                              | **Exclusive Mint:** `mintForLogicContract()` is callable **only** by the `SignalFriendMarket` address. **Blacklisting** implemented via MultiSig. |
| **3. SignalKeyNFT**            | **ERC-721 Trader Receipt (Transferable Key):** Proof of signal purchase. Stores the non-unique `ContentIdentifier` on-chain. | **Exclusive Mint:** `mintForLogicContract()` is callable **only** by the `SignalFriendMarket` address.                                            |

---

## IV. Data Flow & Unlock Mechanism (Hybrid Security)

| Feature              | Description                                                                                                             | Implementation Details                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NFT-as-Key Logic** | The NFT is the unique purchase receipt (TokenID). It grants access to the non-unique signal content (ContentID).        | The `SignalKeyNFT` stores the non-unique `ContentIdentifier` upon minting.                                                                                                                     |
| **Unlock Flow**      | The unique NFT ID is used to verify ownership on-chain, and then unlock the off-chain content via the database mapping. | The Express backend performs a **Two-Part Check** (via Viem): 1. Verify user **owns** the unique **TokenID**. 2. Retrieve the linked **ContentIdentifier** from the MongoDB **Receipt** Model. |
| **Rating System**    | Rating submissions are handled off-chain for speed and flexibility.                                                     | The Smart Contract provides a **single-use marker** (`markSignalRated`function) to enforce **one rating per purchase receipt (Token ID)**, preventing double-rating.                           |

---

## V. 💾 MongoDB Data Architecture

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the searchable off-chain profile for sellers and stores calculated metrics.

| Field                         | Purpose                                                         | Visibility                                    | Example Content   |
| ----------------------------- | --------------------------------------------------------------- | --------------------------------------------- | ----------------- |
| `walletAddress` (Primary Key) | On-chain address holding the P.A.P. NFT.                        | **High** (Public profile ID)                  | `0x5d4A...b5f2`   |
| `isBlacklisted`               | Status synced from the **P.A.P. Contract** (via event).         | **Internal** (Used for filtering out sellers) | `true` or `false` |
| `totalSalesCount`             | Calculated count of signals sold (synced from `Receipt` model). | **High** (Leaderboards/Profile)               | `145`             |
| `averageRating`               | Calculated from the **`Review` Model**.                         | **High** (Leaderboards/Profile)               | `4.6`             |

### 2. 📢 Signal Model (Content & Metadata)

This model stores all necessary content, metadata, and security fields for a signal.

| Field                    | Purpose                                                             | Visibility                                | Example Content                                                               |
| ------------------------ | ------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| `contentId`(Primary Key) | The non-unique ID linking all receipts to this content.             | **Internal** (Used by `Receipt` model)    | `661a5b...1f09`                                                               |
| **`name`**               | **The Headline/Title.** Primary, concise identifier for the signal. | **High** (Listings/Cards)                 | "BTC: Short-Term Breakout to $68k"                                            |
| `description`            | Teaser hook for the signal, visible before purchase.                | **Medium** (Signal Detail Page)           | "Anticipating a swift move past key resistance at $65k based on volume data." |
| `category`               | Platform-defined category (e.g., Crypto - DeFi).                    | **High**(Filters/Browsing)                | `"Ethereum (ETH)"`                                                            |
| `riskLevel`              | Predictor-defined risk level (Low, Medium, High).                   | **High**(Filters/Browsing)                | `"Medium"`                                                                    |
| `potentialReward`        | Predictor-defined reward potential (Normal, Medium, High).          | **High**(Filters/Browsing)                | `"High"`                                                                      |
| `expiryDateTime`         | Time-to-live index for signal removal.                              | **High** (Displaying countdown)           | `2025-12-10T15:00:00Z`                                                        |
| `reasoning`              | Predictor's detailed justification for the trade.                   | **Low (Hidden)**(Unlocked after purchase) | "The 4-hour RSI shows a bullish divergence from the daily chart..."           |
| `fullContent`            | The *exact* trade parameters (entry, exit, stop-loss, duration).    | **Low (Hidden)**(Unlocked after purchase) | "Entry: $63,500. TP: $68,100. SL: $62,900."                                   |

### 3. 🧾 Receipt Model (The Unique Link)

This model links the user's unique NFT receipt to the shared signal content.

| Field                   | Purpose                                                          | Visibility                                    | Example Content        |
| ----------------------- | ---------------------------------------------------------------- | --------------------------------------------- | ---------------------- |
| `tokenId` (Primary Key) | The unique ERC-721 ID of the buyer's **Signal Key NFT** receipt. | **Internal/Low** (Used for unlock check)      | `42`                   |
| `buyerWallet`           | The address that bought and currently holds the NFT.             | **Internal** (Used for user purchase history) | `0x1f56...c3a9`        |
| `contentId`             | The non-unique ID of the signal that this receipt unlocks.       | **Internal** (Used to join to `Signal`model)  | `661a5b...1f09`        |
| `purchaseTimestamp`     | The time the event was indexed.                                  | **Internal**                                  | `2025-11-29T13:00:00Z` |

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |
| `reason`                | Report reason enum.                                                     | **Internal** (Used for categorization)           | `false_signal`      |
| `description`           | Optional details (required if reason is "other").                       | **Internal** (Used for review)                   | `"Signal was..."`   |
| `status`                | Report status: `pending`, `reviewed`, `resolved`, `dismissed`.          | **Internal** (Used for workflow)                 | `pending`           |

**Report Reasons:** `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`

### VI. Category Structure

All categories are **active** at launch to maximize Predictor supply, with the **Trader's default view filtered to "Crypto"**for optimal UX.

| Category Vertical       | Sub-Categories (Fully Active)                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Crypto**              | Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, **Other**                                   |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, **Other** |
| **Macro / Other**       | Economic Data, Geopolitical Events, Sports Betting Models, **Other**                                         |

**Legal Strategy:** The platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising. The platform takes a commission on the sale of a digital asset (data), not a share of trading profits.

---

## Stack used

That is a very solid, modern, and high-quality tech stack for a project of this nature. **Yes, this stack is definitely sufficient** to build and launch your NFT-as-a-ticket signal marketplace.

Here is a breakdown of how each tool fits into your project and one important missing piece you might want to consider:

| Tool                        | Component          | Role in Your App                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                          |
| **Foundry**                 | Smart Contract Dev | The best-in-class toolset for **writing, testing, and deploying** your Solidity contracts efficiently and securely.                                                                                                                                                                                                                                                                                          |
| **React, Tailwind CSS**     | Frontend/UI        | **React** handles the entire user interface and state. **Tailwind** provides the modern, responsive, and highly customizable styling for a great user experience.                                                                                                                                                                                                                                            |
| **wagmi, viem, RainbowKit** | Web3 Frontend Libs | This is your Web3 powerhouse. **`viem`** is the low-level, type-safe interface for reading/writing to the blockchain. **`wagmi`** builds on `viem` to provide powerful **React Hooks** for connecting wallets, reading balances, calling smart contract functions (minting the signal NFT, paying fees), and sending transactions. **`RainbowKit`** handles the beautiful, multi-wallet connection modal UI. |
| **Express, MongoDB**        | Backend/Database   | This is your **off-chain data layer**. MongoDB is perfect for storing the *non-critical, high-volume* data: user profiles, Predictor "Room" details, detailed history of posts, and **caching** of on-chain data to speed up the website (like the list of predictions and their current rank). Express handles the API endpoints for serving this data to your React frontend.                              |

---

## **Referral System**

Sellers can invite other sellers and receive 5 USDT from the total payout of 20 USDT as referral. The new seller must enter their wallet as referral. Logic is made with Solidity

---

## 🔑 Signal Unlock Flow: Receipt ID vs. Content ID

The flow involves three distinct components: the **Predictor** (sets the content), the **Smart Contract** (mints the receipt), and the **Express/MongoDB Backend** (unlocks the content).

### 1. 📝 Signal Listing (Content ID Creation)

- **Predictor Action:** The Predictor posts the signal data and price to your web app.
- **Express Backend Action:** The backend saves the full signal content into **MongoDB** and assigns a non-unique **`ContentID`** (e.g., `SIG-A`). This ID is non-unique because every buyer of this signal will use it to access the same content.
- **Data Passed to Frontend:** The frontend receives the `ContentID` (`SIG-A`) and the set `Price` for use in the purchase transaction.

### 2. 💰 Purchase & Receipt (Token ID Creation)

- **Trader Action:** The Trader initiates the purchase by calling the `buySignalNFT` function on the **SignalFriend Market Logic Contract**. They pass the non-unique **`ContentID`** (`SIG-A`) and the `Price`.
- **Smart Contract Action (Logic):**
    1. The contract verifies payment and splits the fees (95% to Predictor, 5% to Treasury).
    2. The contract calls the **Signal Key NFT contract** to mint a new NFT.
    3. The NFT contract mints the NFT and automatically assigns the next **unique, auto-incremented Receipt ID** (e.g., `TokenID 124`).
- **Smart Contract Action (Event):** The Logic Contract emits the crucial `SignalPurchased` event, containing three critical pieces of data:
    
    SignalPurchased(Buyer’s Address,TokenID 124,ContentID SIG-A)
    

### 3. 💾 Indexing & Mapping (The Secure Link)

- **Express Indexer Action:** Your background indexing service (Viem listener inside Express) catches the `SignalPurchased` event.
- **MongoDB Action:** The Express Indexer writes a permanent, secure record to your MongoDB:
    
    MappingRecord:{tokenID: 124, contentID: ’SIG-A’, owner: ’TraderX’}
    
    *The unique receipt is now permanently linked to the non-unique content.*
    

### 4. 🔓 Content Unlock (Verification)

- **Trader Action:** The Trader navigates to their "My Signals" page and clicks to view the signal linked to **TokenID 124**.
- **Express API Action (Verification):**
    1. The API receives the unique **`TokenID 124`**.
    2. The API uses **Viem** to check the blockchain: **"Does the calling wallet currently own TokenID 124?"**(Verification: Yes).
- **Express API Action (Lookup):**
    1. The API queries MongoDB for the record linked to `TokenID 124`.
    2. The API retrieves the associated **`ContentID`** (`SIG-A`).
- **Fulfillment:** The Express API retrieves the content for `SIG-A` from the MongoDB content store and sends it to the Trader's frontend.

The **unique `TokenID`** is the **receipt** that proves purchase, and the **Express/MongoDB indexer** is the translator that links that receipt to the **content**.

## 🔒 Security Mechanism: Unique Receipt Controls Non-Unique Content

The security is based on the **Express Backend** always enforcing a two-part validation check for **each signal unlock attempt**:

### 1. The Secure Mapping in MongoDB

When a user buys Signal A and receives **TokenID 124**, your Express Indexer creates a permanent, secure link in your database:

| Unique Receipt (TokenID) | Non-Unique Content (ContentID) | Owner    |
| ------------------------ | ------------------------------ | -------- |
| **124**                  | **'SIG-A'**                    | Trader X |
| **125**                  | **'SIG-B'**                    | Trader X |
| **126**                  | **'SIG-A'**                    | Trader Y |

### 2. The Verification Flow

When **Trader X** tries to unlock their content:

| Step                            | Trader X Action                                                 | Security Check                                                                                                                                                                                                  | Result                                                                                                              |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Unlock Signal A**             | Presents **TokenID 124**.                                       | **Express verifies:** Does Trader X own TokenID 124 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 124 → finds **'SIG-A'** → sends **Signal A content.**                |
| **Unlock Signal B**             | Presents **TokenID 125**.                                       | **Express verifies:** Does Trader X own TokenID 125 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 125 → finds **'SIG-B'** → sends **Signal B content.**                |
| **Attacker Tries to Use SIG-A** | Presents **TokenID 124** to try and unlock **Signal B**content. | **Express rejects:** The unlock process **never starts with the Content ID.** It always starts with the **unique Receipt ID (TokenID 124)**, which the database mapping confirms is only linked to **'SIG-A'**. | **Attack Fails:** The backend correctly provides only Signal A content, preventing unauthorized access to Signal B. |

### The Key Takeaway

The user's ownership is always tied to the **unique TokenID** (the receipt). This unique receipt is the **only path** to retrieve the linked **ContentID**.

You cannot input a non-unique Content ID ('SIG-A') and ask the system to unlock it; you must input a unique purchase receipt (Token ID 124, 125, etc.) and prove ownership of that receipt first.

---

## Order of building

Smart Contracts→Backend Indexing/API→Frontend UI

## 📝 Recommended Workflow Summary

| Phase       | Stack Focus                            | Main Deliverable                                                                            |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1** | **Solidity & Foundry**                 | Final, tested, gas-optimized contracts deployed to BNB Testnet.                             |
| **Phase 2** | **Express, Viem, MongoDB**             | Secure API for fast data rendering (leaderboards) and the functional **Signal Gate** logic. |
| **Phase 3** | **React, Wagmi, RainbowKit, Tailwind** | The User Interface, connecting all the logic together.                                      |

---

## 💾 Final MongoDB Schema for SignalFriend

This architecture is designed for **sonic-speed performance** by serving structured data directly from the database and using on-chain data only for verification and indexing.

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the single source of truth for a seller's profile and reputation.

| Field             | Type           | Uniqueness/Index         | Description                                                                 |
| ----------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| `walletAddress`   | `String`       | **Unique** (PRIMARY KEY) | The on-chain address holding the **Predictor Access Pass NFT**.             |
| `nickname`        | `String`       | **Unique** (Index)       | Public display name.                                                        |
| `isBlacklisted`   | `Boolean`      | Indexed                  | Status synced from the Smart Contract (Logic Contract's blacklist mapping). |
| `isVerified`      | `Boolean`      | Indexed                  | Status for verified badge (after 100 sales or manual onboarding).           |
| `bio`             | `String`       |                          | Predictor biography.                                                        |
| `socialLinks`     | `Array/Object` |                          | Telegram, Discord, Twitter (optional).                                      |
| `totalSalesCount` | `Number`       | Indexed                  | Critical for leaderboards. Calculated by indexing `SignalPurchased`events.  |
| `averageRating`   | `Number` (1-5) | Indexed                  | Current aggregated rating. Calculated from the `ReviewsModel`.              |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field             | Type     | Uniqueness/Index         | Description                                                        |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------ |
| `contentId`       | `String` | **Unique** (PRIMARY KEY) | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`). |
| `predictorWallet` | `String` | Indexed                  | Reference to Predictor Model (seller address).                     |
| **`name`**        | `String` |                          | **Signal title/headline (Public).**                                |
| **`description`** | `String` |                          | **Short summary, visible before purchase (Public).**               |
| `priceUSDT`       | `Number` | Indexed                  | Price set by the Predictor.                                        |
| `category`        | `String` | Indexed                  | Platform-defined category (e.g., Crypto - DeFi, Forex - Majors).   |
| `riskLevel`       | `String` | Indexed                  | Predictor-defined risk level (`Low`, `Medium`, `High`).            |
| `potentialReward` | `String` | Indexed                  | Predictor-defined reward potential (`Normal`, `Medium`, `High`).   |
| `expiryDate`      | `Date`   | **TTL Index**            | Signal expires and is removed from active listings.                |
| `fullContent`     | `String` |                          | The core signal data (entry/exit points) - **Private (Unlocked)**. |
| `reasoning`       | `String` |                          | The Predictor's detailed justification - **Private (Unlocked)**.   |
| `totalBuyers`     | `Number` | Indexed                  | Count of unique buyers (useful for popularity metrics).            |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field          | Type     | Uniqueness/Index         | Description                                                                              |
| -------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `tokenId`      | `Number` | **Unique** (PRIMARY KEY) | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| `buyerWallet`  | `String` | Indexed                  | The address that bought the NFT.                                                         |
| `contentId`    | `String` | Indexed                  | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| `purchaseDate` | `Date`   |                          | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |
| `reason`                | Report reason enum.                                                     | **Internal** (Used for categorization)           | `false_signal`      |
| `description`           | Optional details (required if reason is "other").                       | **Internal** (Used for review)                   | `"Signal was..."`   |
| `status`                | Report status: `pending`, `reviewed`, `resolved`, `dismissed`.          | **Internal** (Used for workflow)                 | `pending`           |

**Report Reasons:** `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`

### VI. Category Structure

All categories are **active** at launch to maximize Predictor supply, with the **Trader's default view filtered to "Crypto"**for optimal UX.

| Category Vertical       | Sub-Categories (Fully Active)                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Crypto**              | Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, **Other**                                   |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, **Other** |
| **Macro / Other**       | Economic Data, Geopolitical Events, Sports Betting Models, **Other**                                         |

**Legal Strategy:** The platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising. The platform takes a commission on the sale of a digital asset (data), not a share of trading profits.

---

## Stack used

That is a very solid, modern, and high-quality tech stack for a project of this nature. **Yes, this stack is definitely sufficient** to build and launch your NFT-as-a-ticket signal marketplace.

Here is a breakdown of how each tool fits into your project and one important missing piece you might want to consider:

| Tool                        | Component          | Role in Your App                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                          |
| **Foundry**                 | Smart Contract Dev | The best-in-class toolset for **writing, testing, and deploying** your Solidity contracts efficiently and securely.                                                                                                                                                                                                                                                                                          |
| **React, Tailwind CSS**     | Frontend/UI        | **React** handles the entire user interface and state. **Tailwind** provides the modern, responsive, and highly customizable styling for a great user experience.                                                                                                                                                                                                                                            |
| **wagmi, viem, RainbowKit** | Web3 Frontend Libs | This is your Web3 powerhouse. **`viem`** is the low-level, type-safe interface for reading/writing to the blockchain. **`wagmi`** builds on `viem` to provide powerful **React Hooks** for connecting wallets, reading balances, calling smart contract functions (minting the signal NFT, paying fees), and sending transactions. **`RainbowKit`** handles the beautiful, multi-wallet connection modal UI. |
| **Express, MongoDB**        | Backend/Database   | This is your **off-chain data layer**. MongoDB is perfect for storing the *non-critical, high-volume* data: user profiles, Predictor "Room" details, detailed history of posts, and **caching** of on-chain data to speed up the website (like the list of predictions and their current rank). Express handles the API endpoints for serving this data to your React frontend.                              |

---

## **Referral System**

Sellers can invite other sellers and receive 5 USDT from the total payout of 20 USDT as referral. The new seller must enter their wallet as referral. Logic is made with Solidity

---

## 🔑 Signal Unlock Flow: Receipt ID vs. Content ID

The flow involves three distinct components: the **Predictor** (sets the content), the **Smart Contract** (mints the receipt), and the **Express/MongoDB Backend** (unlocks the content).

### 1. 📝 Signal Listing (Content ID Creation)

- **Predictor Action:** The Predictor posts the signal data and price to your web app.
- **Express Backend Action:** The backend saves the full signal content into **MongoDB** and assigns a non-unique **`ContentID`** (e.g., `SIG-A`). This ID is non-unique because every buyer of this signal will use it to access the same content.
- **Data Passed to Frontend:** The frontend receives the `ContentID` (`SIG-A`) and the set `Price` for use in the purchase transaction.

### 2. 💰 Purchase & Receipt (Token ID Creation)

- **Trader Action:** The Trader initiates the purchase by calling the `buySignalNFT` function on the **SignalFriend Market Logic Contract**. They pass the non-unique **`ContentID`** (`SIG-A`) and the `Price`.
- **Smart Contract Action (Logic):**
    1. The contract verifies payment and splits the fees (95% to Predictor, 5% to Treasury).
    2. The contract calls the **Signal Key NFT contract** to mint a new NFT.
    3. The NFT contract mints the NFT and automatically assigns the next **unique, auto-incremented Receipt ID** (e.g., `TokenID 124`).
- **Smart Contract Action (Event):** The Logic Contract emits the crucial `SignalPurchased` event, containing three critical pieces of data:
    
    SignalPurchased(Buyer’s Address,TokenID 124,ContentID SIG-A)
    

### 3. 💾 Indexing & Mapping (The Secure Link)

- **Express Indexer Action:** Your background indexing service (Viem listener inside Express) catches the `SignalPurchased` event.
- **MongoDB Action:** The Express Indexer writes a permanent, secure record to your MongoDB:
    
    MappingRecord:{tokenID: 124, contentID: ’SIG-A’, owner: ’TraderX’}
    
    *The unique receipt is now permanently linked to the non-unique content.*
    

### 4. 🔓 Content Unlock (Verification)

- **Trader Action:** The Trader navigates to their "My Signals" page and clicks to view the signal linked to **TokenID 124**.
- **Express API Action (Verification):**
    1. The API receives the unique **`TokenID 124`**.
    2. The API uses **Viem** to check the blockchain: **"Does the calling wallet currently own TokenID 124?"**(Verification: Yes).
- **Express API Action (Lookup):**
    1. The API queries MongoDB for the record linked to `TokenID 124`.
    2. The API retrieves the associated **`ContentID`** (`SIG-A`).
- **Fulfillment:** The Express API retrieves the content for `SIG-A` from the MongoDB content store and sends it to the Trader's frontend.

The **unique `TokenID`** is the **receipt** that proves purchase, and the **Express/MongoDB indexer** is the translator that links that receipt to the **content**.

## 🔒 Security Mechanism: Unique Receipt Controls Non-Unique Content

The security is based on the **Express Backend** always enforcing a two-part validation check for **each signal unlock attempt**:

### 1. The Secure Mapping in MongoDB

When a user buys Signal A and receives **TokenID 124**, your Express Indexer creates a permanent, secure link in your database:

| Unique Receipt (TokenID) | Non-Unique Content (ContentID) | Owner    |
| ------------------------ | ------------------------------ | -------- |
| **124**                  | **'SIG-A'**                    | Trader X |
| **125**                  | **'SIG-B'**                    | Trader X |
| **126**                  | **'SIG-A'**                    | Trader Y |

### 2. The Verification Flow

When **Trader X** tries to unlock their content:

| Step                            | Trader X Action                                                 | Security Check                                                                                                                                                                                                  | Result                                                                                                              |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Unlock Signal A**             | Presents **TokenID 124**.                                       | **Express verifies:** Does Trader X own TokenID 124 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 124 → finds **'SIG-A'** → sends **Signal A content.**                |
| **Unlock Signal B**             | Presents **TokenID 125**.                                       | **Express verifies:** Does Trader X own TokenID 125 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 125 → finds **'SIG-B'** → sends **Signal B content.**                |
| **Attacker Tries to Use SIG-A** | Presents **TokenID 124** to try and unlock **Signal B**content. | **Express rejects:** The unlock process **never starts with the Content ID.** It always starts with the **unique Receipt ID (TokenID 124)**, which the database mapping confirms is only linked to **'SIG-A'**. | **Attack Fails:** The backend correctly provides only Signal A content, preventing unauthorized access to Signal B. |

### The Key Takeaway

The user's ownership is always tied to the **unique TokenID** (the receipt). This unique receipt is the **only path** to retrieve the linked **ContentID**.

You cannot input a non-unique Content ID ('SIG-A') and ask the system to unlock it; you must input a unique purchase receipt (Token ID 124, 125, etc.) and prove ownership of that receipt first.

---

## Order of building

Smart Contracts→Backend Indexing/API→Frontend UI

## 📝 Recommended Workflow Summary

| Phase       | Stack Focus                            | Main Deliverable                                                                            |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1** | **Solidity & Foundry**                 | Final, tested, gas-optimized contracts deployed to BNB Testnet.                             |
| **Phase 2** | **Express, Viem, MongoDB**             | Secure API for fast data rendering (leaderboards) and the functional **Signal Gate** logic. |
| **Phase 3** | **React, Wagmi, RainbowKit, Tailwind** | The User Interface, connecting all the logic together.                                      |

---

## 💾 Final MongoDB Schema for SignalFriend

This architecture is designed for **sonic-speed performance** by serving structured data directly from the database and using on-chain data only for verification and indexing.

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the single source of truth for a seller's profile and reputation.

| Field             | Type           | Uniqueness/Index         | Description                                                                 |
| ----------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| `walletAddress`   | `String`       | **Unique** (PRIMARY KEY) | The on-chain address holding the **Predictor Access Pass NFT**.             |
| `nickname`        | `String`       | **Unique** (Index)       | Public display name.                                                        |
| `isBlacklisted`   | `Boolean`      | Indexed                  | Status synced from the Smart Contract (Logic Contract's blacklist mapping). |
| `isVerified`      | `Boolean`      | Indexed                  | Status for verified badge (after 100 sales or manual onboarding).           |
| `bio`             | `String`       |                          | Predictor biography.                                                        |
| `socialLinks`     | `Array/Object` |                          | Telegram, Discord, Twitter (optional).                                      |
| `totalSalesCount` | `Number`       | Indexed                  | Critical for leaderboards. Calculated by indexing `SignalPurchased`events.  |
| `averageRating`   | `Number` (1-5) | Indexed                  | Current aggregated rating. Calculated from the `ReviewsModel`.              |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field             | Type     | Uniqueness/Index         | Description                                                        |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------ |
| `contentId`       | `String` | **Unique** (PRIMARY KEY) | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`). |
| `predictorWallet` | `String` | Indexed                  | Reference to Predictor Model (seller address).                     |
| **`name`**        | `String` |                          | **Signal title/headline (Public).**                                |
| **`description`** | `String` |                          | **Short summary, visible before purchase (Public).**               |
| `priceUSDT`       | `Number` | Indexed                  | Price set by the Predictor.                                        |
| `category`        | `String` | Indexed                  | Platform-defined category (e.g., Crypto - DeFi, Forex - Majors).   |
| `riskLevel`       | `String` | Indexed                  | Predictor-defined risk level (`Low`, `Medium`, `High`).            |
| `potentialReward` | `String` | Indexed                  | Predictor-defined reward potential (`Normal`, `Medium`, `High`).   |
| `expiryDate`      | `Date`   | **TTL Index**            | Signal expires and is removed from active listings.                |
| `fullContent`     | `String` |                          | The core signal data (entry/exit points) - **Private (Unlocked)**. |
| `reasoning`       | `String` |                          | The Predictor's detailed justification - **Private (Unlocked)**.   |
| `totalBuyers`     | `Number` | Indexed                  | Count of unique buyers (useful for popularity metrics).            |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field          | Type     | Uniqueness/Index         | Description                                                                              |
| -------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `tokenId`      | `Number` | **Unique** (PRIMARY KEY) | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| `buyerWallet`  | `String` | Indexed                  | The address that bought the NFT.                                                         |
| `contentId`    | `String` | Indexed                  | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| `purchaseDate` | `Date`   |                          | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |
| `reason`                | Report reason enum.                                                     | **Internal** (Used for categorization)           | `false_signal`      |
| `description`           | Optional details (required if reason is "other").                       | **Internal** (Used for review)                   | `"Signal was..."`   |
| `status`                | Report status: `pending`, `reviewed`, `resolved`, `dismissed`.          | **Internal** (Used for workflow)                 | `pending`           |

**Report Reasons:** `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`

### VI. Category Structure

All categories are **active** at launch to maximize Predictor supply, with the **Trader's default view filtered to "Crypto"**for optimal UX.

| Category Vertical       | Sub-Categories (Fully Active)                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Crypto**              | Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, **Other**                                   |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, **Other** |
| **Macro / Other**       | Economic Data, Geopolitical Events, Sports Betting Models, **Other**                                         |

**Legal Strategy:** The platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising. The platform takes a commission on the sale of a digital asset (data), not a share of trading profits.

---

## Stack used

That is a very solid, modern, and high-quality tech stack for a project of this nature. **Yes, this stack is definitely sufficient** to build and launch your NFT-as-a-ticket signal marketplace.

Here is a breakdown of how each tool fits into your project and one important missing piece you might want to consider:

| Tool                        | Component          | Role in Your App                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                          |
| **Foundry**                 | Smart Contract Dev | The best-in-class toolset for **writing, testing, and deploying** your Solidity contracts efficiently and securely.                                                                                                                                                                                                                                                                                          |
| **React, Tailwind CSS**     | Frontend/UI        | **React** handles the entire user interface and state. **Tailwind** provides the modern, responsive, and highly customizable styling for a great user experience.                                                                                                                                                                                                                                            |
| **wagmi, viem, RainbowKit** | Web3 Frontend Libs | This is your Web3 powerhouse. **`viem`** is the low-level, type-safe interface for reading/writing to the blockchain. **`wagmi`** builds on `viem` to provide powerful **React Hooks** for connecting wallets, reading balances, calling smart contract functions (minting the signal NFT, paying fees), and sending transactions. **`RainbowKit`** handles the beautiful, multi-wallet connection modal UI. |
| **Express, MongoDB**        | Backend/Database   | This is your **off-chain data layer**. MongoDB is perfect for storing the *non-critical, high-volume* data: user profiles, Predictor "Room" details, detailed history of posts, and **caching** of on-chain data to speed up the website (like the list of predictions and their current rank). Express handles the API endpoints for serving this data to your React frontend.                              |

---

## **Referral System**

Sellers can invite other sellers and receive 5 USDT from the total payout of 20 USDT as referral. The new seller must enter their wallet as referral. Logic is made with Solidity

---

## 🔑 Signal Unlock Flow: Receipt ID vs. Content ID

The flow involves three distinct components: the **Predictor** (sets the content), the **Smart Contract** (mints the receipt), and the **Express/MongoDB Backend** (unlocks the content).

### 1. 📝 Signal Listing (Content ID Creation)

- **Predictor Action:** The Predictor posts the signal data and price to your web app.
- **Express Backend Action:** The backend saves the full signal content into **MongoDB** and assigns a non-unique **`ContentID`** (e.g., `SIG-A`). This ID is non-unique because every buyer of this signal will use it to access the same content.
- **Data Passed to Frontend:** The frontend receives the `ContentID` (`SIG-A`) and the set `Price` for use in the purchase transaction.

### 2. 💰 Purchase & Receipt (Token ID Creation)

- **Trader Action:** The Trader initiates the purchase by calling the `buySignalNFT` function on the **SignalFriend Market Logic Contract**. They pass the non-unique **`ContentID`** (`SIG-A`) and the `Price`.
- **Smart Contract Action (Logic):**
    1. The contract verifies payment and splits the fees (95% to Predictor, 5% to Treasury).
    2. The contract calls the **Signal Key NFT contract** to mint a new NFT.
    3. The NFT contract mints the NFT and automatically assigns the next **unique, auto-incremented Receipt ID** (e.g., `TokenID 124`).
- **Smart Contract Action (Event):** The Logic Contract emits the crucial `SignalPurchased` event, containing three critical pieces of data:
    
    SignalPurchased(Buyer’s Address,TokenID 124,ContentID SIG-A)
    

### 3. 💾 Indexing & Mapping (The Secure Link)

- **Express Indexer Action:** Your background indexing service (Viem listener inside Express) catches the `SignalPurchased` event.
- **MongoDB Action:** The Express Indexer writes a permanent, secure record to your MongoDB:
    
    MappingRecord:{tokenID: 124, contentID: ’SIG-A’, owner: ’TraderX’}
    
    *The unique receipt is now permanently linked to the non-unique content.*
    

### 4. 🔓 Content Unlock (Verification)

- **Trader Action:** The Trader navigates to their "My Signals" page and clicks to view the signal linked to **TokenID 124**.
- **Express API Action (Verification):**
    1. The API receives the unique **`TokenID 124`**.
    2. The API uses **Viem** to check the blockchain: **"Does the calling wallet currently own TokenID 124?"**(Verification: Yes).
- **Express API Action (Lookup):**
    1. The API queries MongoDB for the record linked to `TokenID 124`.
    2. The API retrieves the associated **`ContentID`** (`SIG-A`).
- **Fulfillment:** The Express API retrieves the content for `SIG-A` from the MongoDB content store and sends it to the Trader's frontend.

The **unique `TokenID`** is the **receipt** that proves purchase, and the **Express/MongoDB indexer** is the translator that links that receipt to the **content**.

## 🔒 Security Mechanism: Unique Receipt Controls Non-Unique Content

The security is based on the **Express Backend** always enforcing a two-part validation check for **each signal unlock attempt**:

### 1. The Secure Mapping in MongoDB

When a user buys Signal A and receives **TokenID 124**, your Express Indexer creates a permanent, secure link in your database:

| Unique Receipt (TokenID) | Non-Unique Content (ContentID) | Owner    |
| ------------------------ | ------------------------------ | -------- |
| **124**                  | **'SIG-A'**                    | Trader X |
| **125**                  | **'SIG-B'**                    | Trader X |
| **126**                  | **'SIG-A'**                    | Trader Y |

### 2. The Verification Flow

When **Trader X** tries to unlock their content:

| Step                            | Trader X Action                                                 | Security Check                                                                                                                                                                                                  | Result                                                                                                              |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Unlock Signal A**             | Presents **TokenID 124**.                                       | **Express verifies:** Does Trader X own TokenID 124 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 124 → finds **'SIG-A'** → sends **Signal A content.**                |
| **Unlock Signal B**             | Presents **TokenID 125**.                                       | **Express verifies:** Does Trader X own TokenID 125 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 125 → finds **'SIG-B'** → sends **Signal B content.**                |
| **Attacker Tries to Use SIG-A** | Presents **TokenID 124** to try and unlock **Signal B**content. | **Express rejects:** The unlock process **never starts with the Content ID.** It always starts with the **unique Receipt ID (TokenID 124)**, which the database mapping confirms is only linked to **'SIG-A'**. | **Attack Fails:** The backend correctly provides only Signal A content, preventing unauthorized access to Signal B. |

### The Key Takeaway

The user's ownership is always tied to the **unique TokenID** (the receipt). This unique receipt is the **only path** to retrieve the linked **ContentID**.

You cannot input a non-unique Content ID ('SIG-A') and ask the system to unlock it; you must input a unique purchase receipt (Token ID 124, 125, etc.) and prove ownership of that receipt first.

---

## Order of building

Smart Contracts→Backend Indexing/API→Frontend UI

## 📝 Recommended Workflow Summary

| Phase       | Stack Focus                            | Main Deliverable                                                                            |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1** | **Solidity & Foundry**                 | Final, tested, gas-optimized contracts deployed to BNB Testnet.                             |
| **Phase 2** | **Express, Viem, MongoDB**             | Secure API for fast data rendering (leaderboards) and the functional **Signal Gate** logic. |
| **Phase 3** | **React, Wagmi, RainbowKit, Tailwind** | The User Interface, connecting all the logic together.                                      |

---

## 💾 Final MongoDB Schema for SignalFriend

This architecture is designed for **sonic-speed performance** by serving structured data directly from the database and using on-chain data only for verification and indexing.

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the single source of truth for a seller's profile and reputation.

| Field             | Type           | Uniqueness/Index         | Description                                                                 |
| ----------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| `walletAddress`   | `String`       | **Unique** (PRIMARY KEY) | The on-chain address holding the **Predictor Access Pass NFT**.             |
| `nickname`        | `String`       | **Unique** (Index)       | Public display name.                                                        |
| `isBlacklisted`   | `Boolean`      | Indexed                  | Status synced from the Smart Contract (Logic Contract's blacklist mapping). |
| `isVerified`      | `Boolean`      | Indexed                  | Status for verified badge (after 100 sales or manual onboarding).           |
| `bio`             | `String`       |                          | Predictor biography.                                                        |
| `socialLinks`     | `Array/Object` |                          | Telegram, Discord, Twitter (optional).                                      |
| `totalSalesCount` | `Number`       | Indexed                  | Critical for leaderboards. Calculated by indexing `SignalPurchased`events.  |
| `averageRating`   | `Number` (1-5) | Indexed                  | Current aggregated rating. Calculated from the `ReviewsModel`.              |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field             | Type     | Uniqueness/Index         | Description                                                        |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------ |
| `contentId`       | `String` | **Unique** (PRIMARY KEY) | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`). |
| `predictorWallet` | `String` | Indexed                  | Reference to Predictor Model (seller address).                     |
| **`name`**        | `String` |                          | **Signal title/headline (Public).**                                |
| **`description`** | `String` |                          | **Short summary, visible before purchase (Public).**               |
| `priceUSDT`       | `Number` | Indexed                  | Price set by the Predictor.                                        |
| `category`        | `String` | Indexed                  | Platform-defined category (e.g., Crypto - DeFi, Forex - Majors).   |
| `riskLevel`       | `String` | Indexed                  | Predictor-defined risk level (`Low`, `Medium`, `High`).            |
| `potentialReward` | `String` | Indexed                  | Predictor-defined reward potential (`Normal`, `Medium`, `High`).   |
| `expiryDate`      | `Date`   | **TTL Index**            | Signal expires and is removed from active listings.                |
| `fullContent`     | `String` |                          | The core signal data (entry/exit points) - **Private (Unlocked)**. |
| `reasoning`       | `String` |                          | The Predictor's detailed justification - **Private (Unlocked)**.   |
| `totalBuyers`     | `Number` | Indexed                  | Count of unique buyers (useful for popularity metrics).            |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field          | Type     | Uniqueness/Index         | Description                                                                              |
| -------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `tokenId`      | `Number` | **Unique** (PRIMARY KEY) | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| `buyerWallet`  | `String` | Indexed                  | The address that bought the NFT.                                                         |
| `contentId`    | `String` | Indexed                  | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| `purchaseDate` | `Date`   |                          | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |
| `reason`                | Report reason enum.                                                     | **Internal** (Used for categorization)           | `false_signal`      |
| `description`           | Optional details (required if reason is "other").                       | **Internal** (Used for review)                   | `"Signal was..."`   |
| `status`                | Report status: `pending`, `reviewed`, `resolved`, `dismissed`.          | **Internal** (Used for workflow)                 | `pending`           |

**Report Reasons:** `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`

### VI. Category Structure

All categories are **active** at launch to maximize Predictor supply, with the **Trader's default view filtered to "Crypto"**for optimal UX.

| Category Vertical       | Sub-Categories (Fully Active)                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Crypto**              | Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, **Other**                                   |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, **Other** |
| **Macro / Other**       | Economic Data, Geopolitical Events, Sports Betting Models, **Other**                                         |

**Legal Strategy:** The platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising. The platform takes a commission on the sale of a digital asset (data), not a share of trading profits.

---

## Stack used

That is a very solid, modern, and high-quality tech stack for a project of this nature. **Yes, this stack is definitely sufficient** to build and launch your NFT-as-a-ticket signal marketplace.

Here is a breakdown of how each tool fits into your project and one important missing piece you might want to consider:

| Tool                        | Component          | Role in Your App                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                          |
| **Foundry**                 | Smart Contract Dev | The best-in-class toolset for **writing, testing, and deploying** your Solidity contracts efficiently and securely.                                                                                                                                                                                                                                                                                          |
| **React, Tailwind CSS**     | Frontend/UI        | **React** handles the entire user interface and state. **Tailwind** provides the modern, responsive, and highly customizable styling for a great user experience.                                                                                                                                                                                                                                            |
| **wagmi, viem, RainbowKit** | Web3 Frontend Libs | This is your Web3 powerhouse. **`viem`** is the low-level, type-safe interface for reading/writing to the blockchain. **`wagmi`** builds on `viem` to provide powerful **React Hooks** for connecting wallets, reading balances, calling smart contract functions (minting the signal NFT, paying fees), and sending transactions. **`RainbowKit`** handles the beautiful, multi-wallet connection modal UI. |
| **Express, MongoDB**        | Backend/Database   | This is your **off-chain data layer**. MongoDB is perfect for storing the *non-critical, high-volume* data: user profiles, Predictor "Room" details, detailed history of posts, and **caching** of on-chain data to speed up the website (like the list of predictions and their current rank). Express handles the API endpoints for serving this data to your React frontend.                              |

---

## **Referral System**

Sellers can invite other sellers and receive 5 USDT from the total payout of 20 USDT as referral. The new seller must enter their wallet as referral. Logic is made with Solidity

---

## 🔑 Signal Unlock Flow: Receipt ID vs. Content ID

The flow involves three distinct components: the **Predictor** (sets the content), the **Smart Contract** (mints the receipt), and the **Express/MongoDB Backend** (unlocks the content).

### 1. 📝 Signal Listing (Content ID Creation)

- **Predictor Action:** The Predictor posts the signal data and price to your web app.
- **Express Backend Action:** The backend saves the full signal content into **MongoDB** and assigns a non-unique **`ContentID`** (e.g., `SIG-A`). This ID is non-unique because every buyer of this signal will use it to access the same content.
- **Data Passed to Frontend:** The frontend receives the `ContentID` (`SIG-A`) and the set `Price` for use in the purchase transaction.

### 2. 💰 Purchase & Receipt (Token ID Creation)

- **Trader Action:** The Trader initiates the purchase by calling the `buySignalNFT` function on the **SignalFriend Market Logic Contract**. They pass the non-unique **`ContentID`** (`SIG-A`) and the `Price`.
- **Smart Contract Action (Logic):**
    1. The contract verifies payment and splits the fees (95% to Predictor, 5% to Treasury).
    2. The contract calls the **Signal Key NFT contract** to mint a new NFT.
    3. The NFT contract mints the NFT and automatically assigns the next **unique, auto-incremented Receipt ID** (e.g., `TokenID 124`).
- **Smart Contract Action (Event):** The Logic Contract emits the crucial `SignalPurchased` event, containing three critical pieces of data:
    
    SignalPurchased(Buyer’s Address,TokenID 124,ContentID SIG-A)
    

### 3. 💾 Indexing & Mapping (The Secure Link)

- **Express Indexer Action:** Your background indexing service (Viem listener inside Express) catches the `SignalPurchased` event.
- **MongoDB Action:** The Express Indexer writes a permanent, secure record to your MongoDB:
    
    MappingRecord:{tokenID: 124, contentID: ’SIG-A’, owner: ’TraderX’}
    
    *The unique receipt is now permanently linked to the non-unique content.*
    

### 4. 🔓 Content Unlock (Verification)

- **Trader Action:** The Trader navigates to their "My Signals" page and clicks to view the signal linked to **TokenID 124**.
- **Express API Action (Verification):**
    1. The API receives the unique **`TokenID 124`**.
    2. The API uses **Viem** to check the blockchain: **"Does the calling wallet currently own TokenID 124?"**(Verification: Yes).
- **Express API Action (Lookup):**
    1. The API queries MongoDB for the record linked to `TokenID 124`.
    2. The API retrieves the associated **`ContentID`** (`SIG-A`).
- **Fulfillment:** The Express API retrieves the content for `SIG-A` from the MongoDB content store and sends it to the Trader's frontend.

The **unique `TokenID`** is the **receipt** that proves purchase, and the **Express/MongoDB indexer** is the translator that links that receipt to the **content**.

## 🔒 Security Mechanism: Unique Receipt Controls Non-Unique Content

The security is based on the **Express Backend** always enforcing a two-part validation check for **each signal unlock attempt**:

### 1. The Secure Mapping in MongoDB

When a user buys Signal A and receives **TokenID 124**, your Express Indexer creates a permanent, secure link in your database:

| Unique Receipt (TokenID) | Non-Unique Content (ContentID) | Owner    |
| ------------------------ | ------------------------------ | -------- |
| **124**                  | **'SIG-A'**                    | Trader X |
| **125**                  | **'SIG-B'**                    | Trader X |
| **126**                  | **'SIG-A'**                    | Trader Y |

### 2. The Verification Flow

When **Trader X** tries to unlock their content:

| Step                            | Trader X Action                                                 | Security Check                                                                                                                                                                                                  | Result                                                                                                              |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Unlock Signal A**             | Presents **TokenID 124**.                                       | **Express verifies:** Does Trader X own TokenID 124 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 124 → finds **'SIG-A'** → sends **Signal A content.**                |
| **Unlock Signal B**             | Presents **TokenID 125**.                                       | **Express verifies:** Does Trader X own TokenID 125 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 125 → finds **'SIG-B'** → sends **Signal B content.**                |
| **Attacker Tries to Use SIG-A** | Presents **TokenID 124** to try and unlock **Signal B**content. | **Express rejects:** The unlock process **never starts with the Content ID.** It always starts with the **unique Receipt ID (TokenID 124)**, which the database mapping confirms is only linked to **'SIG-A'**. | **Attack Fails:** The backend correctly provides only Signal A content, preventing unauthorized access to Signal B. |

### The Key Takeaway

The user's ownership is always tied to the **unique TokenID** (the receipt). This unique receipt is the **only path** to retrieve the linked **ContentID**.

You cannot input a non-unique Content ID ('SIG-A') and ask the system to unlock it; you must input a unique purchase receipt (Token ID 124, 125, etc.) and prove ownership of that receipt first.

---

## Order of building

Smart Contracts→Backend Indexing/API→Frontend UI

## 📝 Recommended Workflow Summary

| Phase       | Stack Focus                            | Main Deliverable                                                                            |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1** | **Solidity & Foundry**                 | Final, tested, gas-optimized contracts deployed to BNB Testnet.                             |
| **Phase 2** | **Express, Viem, MongoDB**             | Secure API for fast data rendering (leaderboards) and the functional **Signal Gate** logic. |
| **Phase 3** | **React, Wagmi, RainbowKit, Tailwind** | The User Interface, connecting all the logic together.                                      |

---

## 💾 Final MongoDB Schema for SignalFriend

This architecture is designed for **sonic-speed performance** by serving structured data directly from the database and using on-chain data only for verification and indexing.

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the single source of truth for a seller's profile and reputation.

| Field             | Type           | Uniqueness/Index         | Description                                                                 |
| ----------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| `walletAddress`   | `String`       | **Unique** (PRIMARY KEY) | The on-chain address holding the **Predictor Access Pass NFT**.             |
| `nickname`        | `String`       | **Unique** (Index)       | Public display name.                                                        |
| `isBlacklisted`   | `Boolean`      | Indexed                  | Status synced from the Smart Contract (Logic Contract's blacklist mapping). |
| `isVerified`      | `Boolean`      | Indexed                  | Status for verified badge (after 100 sales or manual onboarding).           |
| `bio`             | `String`       |                          | Predictor biography.                                                        |
| `socialLinks`     | `Array/Object` |                          | Telegram, Discord, Twitter (optional).                                      |
| `totalSalesCount` | `Number`       | Indexed                  | Critical for leaderboards. Calculated by indexing `SignalPurchased`events.  |
| `averageRating`   | `Number` (1-5) | Indexed                  | Current aggregated rating. Calculated from the `ReviewsModel`.              |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field             | Type     | Uniqueness/Index         | Description                                                        |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------ |
| `contentId`       | `String` | **Unique** (PRIMARY KEY) | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`). |
| `predictorWallet` | `String` | Indexed                  | Reference to Predictor Model (seller address).                     |
| **`name`**        | `String` |                          | **Signal title/headline (Public).**                                |
| **`description`** | `String` |                          | **Short summary, visible before purchase (Public).**               |
| `priceUSDT`       | `Number` | Indexed                  | Price set by the Predictor.                                        |
| `category`        | `String` | Indexed                  | Platform-defined category (e.g., Crypto - DeFi, Forex - Majors).   |
| `riskLevel`       | `String` | Indexed                  | Predictor-defined risk level (`Low`, `Medium`, `High`).            |
| `potentialReward` | `String` | Indexed                  | Predictor-defined reward potential (`Normal`, `Medium`, `High`).   |
| `expiryDate`      | `Date`   | **TTL Index**            | Signal expires and is removed from active listings.                |
| `fullContent`     | `String` |                          | The core signal data (entry/exit points) - **Private (Unlocked)**. |
| `reasoning`       | `String` |                          | The Predictor's detailed justification - **Private (Unlocked)**.   |
| `totalBuyers`     | `Number` | Indexed                  | Count of unique buyers (useful for popularity metrics).            |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field          | Type     | Uniqueness/Index         | Description                                                                              |
| -------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `tokenId`      | `Number` | **Unique** (PRIMARY KEY) | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| `buyerWallet`  | `String` | Indexed                  | The address that bought the NFT.                                                         |
| `contentId`    | `String` | Indexed                  | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| `purchaseDate` | `Date`   |                          | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |
| `reason`                | Report reason enum.                                                     | **Internal** (Used for categorization)           | `false_signal`      |
| `description`           | Optional details (required if reason is "other").                       | **Internal** (Used for review)                   | `"Signal was..."`   |
| `status`                | Report status: `pending`, `reviewed`, `resolved`, `dismissed`.          | **Internal** (Used for workflow)                 | `pending`           |

**Report Reasons:** `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`

### VI. Category Structure

All categories are **active** at launch to maximize Predictor supply, with the **Trader's default view filtered to "Crypto"**for optimal UX.

| Category Vertical       | Sub-Categories (Fully Active)                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Crypto**              | Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, **Other**                                   |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, **Other** |
| **Macro / Other**       | Economic Data, Geopolitical Events, Sports Betting Models, **Other**                                         |

**Legal Strategy:** The platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising. The platform takes a commission on the sale of a digital asset (data), not a share of trading profits.

---

## Stack used

That is a very solid, modern, and high-quality tech stack for a project of this nature. **Yes, this stack is definitely sufficient** to build and launch your NFT-as-a-ticket signal marketplace.

Here is a breakdown of how each tool fits into your project and one important missing piece you might want to consider:

| Tool                        | Component          | Role in Your App                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                          |
| **Foundry**                 | Smart Contract Dev | The best-in-class toolset for **writing, testing, and deploying** your Solidity contracts efficiently and securely.                                                                                                                                                                                                                                                                                          |
| **React, Tailwind CSS**     | Frontend/UI        | **React** handles the entire user interface and state. **Tailwind** provides the modern, responsive, and highly customizable styling for a great user experience.                                                                                                                                                                                                                                            |
| **wagmi, viem, RainbowKit** | Web3 Frontend Libs | This is your Web3 powerhouse. **`viem`** is the low-level, type-safe interface for reading/writing to the blockchain. **`wagmi`** builds on `viem` to provide powerful **React Hooks** for connecting wallets, reading balances, calling smart contract functions (minting the signal NFT, paying fees), and sending transactions. **`RainbowKit`** handles the beautiful, multi-wallet connection modal UI. |
| **Express, MongoDB**        | Backend/Database   | This is your **off-chain data layer**. MongoDB is perfect for storing the *non-critical, high-volume* data: user profiles, Predictor "Room" details, detailed history of posts, and **caching** of on-chain data to speed up the website (like the list of predictions and their current rank). Express handles the API endpoints for serving this data to your React frontend.                              |

---

## **Referral System**

Sellers can invite other sellers and receive 5 USDT from the total payout of 20 USDT as referral. The new seller must enter their wallet as referral. Logic is made with Solidity

---

## 🔑 Signal Unlock Flow: Receipt ID vs. Content ID

The flow involves three distinct components: the **Predictor** (sets the content), the **Smart Contract** (mints the receipt), and the **Express/MongoDB Backend** (unlocks the content).

### 1. 📝 Signal Listing (Content ID Creation)

- **Predictor Action:** The Predictor posts the signal data and price to your web app.
- **Express Backend Action:** The backend saves the full signal content into **MongoDB** and assigns a non-unique **`ContentID`** (e.g., `SIG-A`). This ID is non-unique because every buyer of this signal will use it to access the same content.
- **Data Passed to Frontend:** The frontend receives the `ContentID` (`SIG-A`) and the set `Price` for use in the purchase transaction.

### 2. 💰 Purchase & Receipt (Token ID Creation)

- **Trader Action:** The Trader initiates the purchase by calling the `buySignalNFT` function on the **SignalFriend Market Logic Contract**. They pass the non-unique **`ContentID`** (`SIG-A`) and the `Price`.
- **Smart Contract Action (Logic):**
    1. The contract verifies payment and splits the fees (95% to Predictor, 5% to Treasury).
    2. The contract calls the **Signal Key NFT contract** to mint a new NFT.
    3. The NFT contract mints the NFT and automatically assigns the next **unique, auto-incremented Receipt ID** (e.g., `TokenID 124`).
- **Smart Contract Action (Event):** The Logic Contract emits the crucial `SignalPurchased` event, containing three critical pieces of data:
    
    SignalPurchased(Buyer’s Address,TokenID 124,ContentID SIG-A)
    

### 3. 💾 Indexing & Mapping (The Secure Link)

- **Express Indexer Action:** Your background indexing service (Viem listener inside Express) catches the `SignalPurchased` event.
- **MongoDB Action:** The Express Indexer writes a permanent, secure record to your MongoDB:
    
    MappingRecord:{tokenID: 124, contentID: ’SIG-A’, owner: ’TraderX’}
    
    *The unique receipt is now permanently linked to the non-unique content.*
    

### 4. 🔓 Content Unlock (Verification)

- **Trader Action:** The Trader navigates to their "My Signals" page and clicks to view the signal linked to **TokenID 124**.
- **Express API Action (Verification):**
    1. The API receives the unique **`TokenID 124`**.
    2. The API uses **Viem** to check the blockchain: **"Does the calling wallet currently own TokenID 124?"**(Verification: Yes).
- **Express API Action (Lookup):**
    1. The API queries MongoDB for the record linked to `TokenID 124`.
    2. The API retrieves the associated **`ContentID`** (`SIG-A`).
- **Fulfillment:** The Express API retrieves the content for `SIG-A` from the MongoDB content store and sends it to the Trader's frontend.

The **unique `TokenID`** is the **receipt** that proves purchase, and the **Express/MongoDB indexer** is the translator that links that receipt to the **content**.

## 🔒 Security Mechanism: Unique Receipt Controls Non-Unique Content

The security is based on the **Express Backend** always enforcing a two-part validation check for **each signal unlock attempt**:

### 1. The Secure Mapping in MongoDB

When a user buys Signal A and receives **TokenID 124**, your Express Indexer creates a permanent, secure link in your database:

| Unique Receipt (TokenID) | Non-Unique Content (ContentID) | Owner    |
| ------------------------ | ------------------------------ | -------- |
| **124**                  | **'SIG-A'**                    | Trader X |
| **125**                  | **'SIG-B'**                    | Trader X |
| **126**                  | **'SIG-A'**                    | Trader Y |

### 2. The Verification Flow

When **Trader X** tries to unlock their content:

| Step                            | Trader X Action                                                 | Security Check                                                                                                                                                                                                  | Result                                                                                                              |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Unlock Signal A**             | Presents **TokenID 124**.                                       | **Express verifies:** Does Trader X own TokenID 124 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 124 → finds **'SIG-A'** → sends **Signal A content.**                |
| **Unlock Signal B**             | Presents **TokenID 125**.                                       | **Express verifies:** Does Trader X own TokenID 125 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 125 → finds **'SIG-B'** → sends **Signal B content.**                |
| **Attacker Tries to Use SIG-A** | Presents **TokenID 124** to try and unlock **Signal B**content. | **Express rejects:** The unlock process **never starts with the Content ID.** It always starts with the **unique Receipt ID (TokenID 124)**, which the database mapping confirms is only linked to **'SIG-A'**. | **Attack Fails:** The backend correctly provides only Signal A content, preventing unauthorized access to Signal B. |

### The Key Takeaway

The user's ownership is always tied to the **unique TokenID** (the receipt). This unique receipt is the **only path** to retrieve the linked **ContentID**.

You cannot input a non-unique Content ID ('SIG-A') and ask the system to unlock it; you must input a unique purchase receipt (Token ID 124, 125, etc.) and prove ownership of that receipt first.

---

## Order of building

Smart Contracts→Backend Indexing/API→Frontend UI

## 📝 Recommended Workflow Summary

| Phase       | Stack Focus                            | Main Deliverable                                                                            |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1** | **Solidity & Foundry**                 | Final, tested, gas-optimized contracts deployed to BNB Testnet.                             |
| **Phase 2** | **Express, Viem, MongoDB**             | Secure API for fast data rendering (leaderboards) and the functional **Signal Gate** logic. |
| **Phase 3** | **React, Wagmi, RainbowKit, Tailwind** | The User Interface, connecting all the logic together.                                      |

---

## 💾 Final MongoDB Schema for SignalFriend

This architecture is designed for **sonic-speed performance** by serving structured data directly from the database and using on-chain data only for verification and indexing.

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the single source of truth for a seller's profile and reputation.

| Field             | Type           | Uniqueness/Index         | Description                                                                 |
| ----------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| `walletAddress`   | `String`       | **Unique** (PRIMARY KEY) | The on-chain address holding the **Predictor Access Pass NFT**.             |
| `nickname`        | `String`       | **Unique** (Index)       | Public display name.                                                        |
| `isBlacklisted`   | `Boolean`      | Indexed                  | Status synced from the Smart Contract (Logic Contract's blacklist mapping). |
| `isVerified`      | `Boolean`      | Indexed                  | Status for verified badge (after 100 sales or manual onboarding).           |
| `bio`             | `String`       |                          | Predictor biography.                                                        |
| `socialLinks`     | `Array/Object` |                          | Telegram, Discord, Twitter (optional).                                      |
| `totalSalesCount` | `Number`       | Indexed                  | Critical for leaderboards. Calculated by indexing `SignalPurchased`events.  |
| `averageRating`   | `Number` (1-5) | Indexed                  | Current aggregated rating. Calculated from the `ReviewsModel`.              |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field             | Type     | Uniqueness/Index         | Description                                                        |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------ |
| `contentId`       | `String` | **Unique** (PRIMARY KEY) | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`). |
| `predictorWallet` | `String` | Indexed                  | Reference to Predictor Model (seller address).                     |
| **`name`**        | `String` |                          | **Signal title/headline (Public).**                                |
| **`description`** | `String` |                          | **Short summary, visible before purchase (Public).**               |
| `priceUSDT`       | `Number` | Indexed                  | Price set by the Predictor.                                        |
| `category`        | `String` | Indexed                  | Platform-defined category (e.g., Crypto - DeFi, Forex - Majors).   |
| `riskLevel`       | `String` | Indexed                  | Predictor-defined risk level (`Low`, `Medium`, `High`).            |
| `potentialReward` | `String` | Indexed                  | Predictor-defined reward potential (`Normal`, `Medium`, `High`).   |
| `expiryDate`      | `Date`   | **TTL Index**            | Signal expires and is removed from active listings.                |
| `fullContent`     | `String` |                          | The core signal data (entry/exit points) - **Private (Unlocked)**. |
| `reasoning`       | `String` |                          | The Predictor's detailed justification - **Private (Unlocked)**.   |
| `totalBuyers`     | `Number` | Indexed                  | Count of unique buyers (useful for popularity metrics).            |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field          | Type     | Uniqueness/Index         | Description                                                                              |
| -------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `tokenId`      | `Number` | **Unique** (PRIMARY KEY) | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| `buyerWallet`  | `String` | Indexed                  | The address that bought the NFT.                                                         |
| `contentId`    | `String` | Indexed                  | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| `purchaseDate` | `Date`   |                          | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |
| `reason`                | Report reason enum.                                                     | **Internal** (Used for categorization)           | `false_signal`      |
| `description`           | Optional details (required if reason is "other").                       | **Internal** (Used for review)                   | `"Signal was..."`   |
| `status`                | Report status: `pending`, `reviewed`, `resolved`, `dismissed`.          | **Internal** (Used for workflow)                 | `pending`           |

**Report Reasons:** `false_signal`, `misleading_info`, `scam`, `duplicate_content`, `other`

### VI. Category Structure

All categories are **active** at launch to maximize Predictor supply, with the **Trader's default view filtered to "Crypto"**for optimal UX.

| Category Vertical       | Sub-Categories (Fully Active)                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Crypto**              | Altcoins, DeFi, NFTs, Layer 1/2, Meme Coins, Futures/Perpetuals, **Other**                                   |
| **Traditional Finance** | US Stocks - Tech, US Stocks - General, Forex - Majors, Commodities - Metals, Commodities - Energy, **Other** |
| **Macro / Other**       | Economic Data, Geopolitical Events, Sports Betting Models, **Other**                                         |

**Legal Strategy:** The platform is legally structured as an **NFT-based digital information marketplace** to mitigate risks associated with gambling, betting, or unregistered financial advising. The platform takes a commission on the sale of a digital asset (data), not a share of trading profits.

---

## Stack used

That is a very solid, modern, and high-quality tech stack for a project of this nature. **Yes, this stack is definitely sufficient** to build and launch your NFT-as-a-ticket signal marketplace.

Here is a breakdown of how each tool fits into your project and one important missing piece you might want to consider:

| Tool                        | Component          | Role in Your App                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                          |
| **Foundry**                 | Smart Contract Dev | The best-in-class toolset for **writing, testing, and deploying** your Solidity contracts efficiently and securely.                                                                                                                                                                                                                                                                                          |
| **React, Tailwind CSS**     | Frontend/UI        | **React** handles the entire user interface and state. **Tailwind** provides the modern, responsive, and highly customizable styling for a great user experience.                                                                                                                                                                                                                                            |
| **wagmi, viem, RainbowKit** | Web3 Frontend Libs | This is your Web3 powerhouse. **`viem`** is the low-level, type-safe interface for reading/writing to the blockchain. **`wagmi`** builds on `viem` to provide powerful **React Hooks** for connecting wallets, reading balances, calling smart contract functions (minting the signal NFT, paying fees), and sending transactions. **`RainbowKit`** handles the beautiful, multi-wallet connection modal UI. |
| **Express, MongoDB**        | Backend/Database   | This is your **off-chain data layer**. MongoDB is perfect for storing the *non-critical, high-volume* data: user profiles, Predictor "Room" details, detailed history of posts, and **caching** of on-chain data to speed up the website (like the list of predictions and their current rank). Express handles the API endpoints for serving this data to your React frontend.                              |

---

## **Referral System**

Sellers can invite other sellers and receive 5 USDT from the total payout of 20 USDT as referral. The new seller must enter their wallet as referral. Logic is made with Solidity

---

## 🔑 Signal Unlock Flow: Receipt ID vs. Content ID

The flow involves three distinct components: the **Predictor** (sets the content), the **Smart Contract** (mints the receipt), and the **Express/MongoDB Backend** (unlocks the content).

### 1. 📝 Signal Listing (Content ID Creation)

- **Predictor Action:** The Predictor posts the signal data and price to your web app.
- **Express Backend Action:** The backend saves the full signal content into **MongoDB** and assigns a non-unique **`ContentID`** (e.g., `SIG-A`). This ID is non-unique because every buyer of this signal will use it to access the same content.
- **Data Passed to Frontend:** The frontend receives the `ContentID` (`SIG-A`) and the set `Price` for use in the purchase transaction.

### 2. 💰 Purchase & Receipt (Token ID Creation)

- **Trader Action:** The Trader initiates the purchase by calling the `buySignalNFT` function on the **SignalFriend Market Logic Contract**. They pass the non-unique **`ContentID`** (`SIG-A`) and the `Price`.
- **Smart Contract Action (Logic):**
    1. The contract verifies payment and splits the fees (95% to Predictor, 5% to Treasury).
    2. The contract calls the **Signal Key NFT contract** to mint a new NFT.
    3. The NFT contract mints the NFT and automatically assigns the next **unique, auto-incremented Receipt ID** (e.g., `TokenID 124`).
- **Smart Contract Action (Event):** The Logic Contract emits the crucial `SignalPurchased` event, containing three critical pieces of data:
    
    SignalPurchased(Buyer’s Address,TokenID 124,ContentID SIG-A)
    

### 3. 💾 Indexing & Mapping (The Secure Link)

- **Express Indexer Action:** Your background indexing service (Viem listener inside Express) catches the `SignalPurchased` event.
- **MongoDB Action:** The Express Indexer writes a permanent, secure record to your MongoDB:
    
    MappingRecord:{tokenID: 124, contentID: ’SIG-A’, owner: ’TraderX’}
    
    *The unique receipt is now permanently linked to the non-unique content.*
    

### 4. 🔓 Content Unlock (Verification)

- **Trader Action:** The Trader navigates to their "My Signals" page and clicks to view the signal linked to **TokenID 124**.
- **Express API Action (Verification):**
    1. The API receives the unique **`TokenID 124`**.
    2. The API uses **Viem** to check the blockchain: **"Does the calling wallet currently own TokenID 124?"**(Verification: Yes).
- **Express API Action (Lookup):**
    1. The API queries MongoDB for the record linked to `TokenID 124`.
    2. The API retrieves the associated **`ContentID`** (`SIG-A`).
- **Fulfillment:** The Express API retrieves the content for `SIG-A` from the MongoDB content store and sends it to the Trader's frontend.

The **unique `TokenID`** is the **receipt** that proves purchase, and the **Express/MongoDB indexer** is the translator that links that receipt to the **content**.

## 🔒 Security Mechanism: Unique Receipt Controls Non-Unique Content

The security is based on the **Express Backend** always enforcing a two-part validation check for **each signal unlock attempt**:

### 1. The Secure Mapping in MongoDB

When a user buys Signal A and receives **TokenID 124**, your Express Indexer creates a permanent, secure link in your database:

| Unique Receipt (TokenID) | Non-Unique Content (ContentID) | Owner    |
| ------------------------ | ------------------------------ | -------- |
| **124**                  | **'SIG-A'**                    | Trader X |
| **125**                  | **'SIG-B'**                    | Trader X |
| **126**                  | **'SIG-A'**                    | Trader Y |

### 2. The Verification Flow

When **Trader X** tries to unlock their content:

| Step                            | Trader X Action                                                 | Security Check                                                                                                                                                                                                  | Result                                                                                                              |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Unlock Signal A**             | Presents **TokenID 124**.                                       | **Express verifies:** Does Trader X own TokenID 124 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 124 → finds **'SIG-A'** → sends **Signal A content.**                |
| **Unlock Signal B**             | Presents **TokenID 125**.                                       | **Express verifies:** Does Trader X own TokenID 125 on the blockchain? (Yes).                                                                                                                                   | **Content Unlocked:** MongoDB looks up TokenID 125 → finds **'SIG-B'** → sends **Signal B content.**                |
| **Attacker Tries to Use SIG-A** | Presents **TokenID 124** to try and unlock **Signal B**content. | **Express rejects:** The unlock process **never starts with the Content ID.** It always starts with the **unique Receipt ID (TokenID 124)**, which the database mapping confirms is only linked to **'SIG-A'**. | **Attack Fails:** The backend correctly provides only Signal A content, preventing unauthorized access to Signal B. |

### The Key Takeaway

The user's ownership is always tied to the **unique TokenID** (the receipt). This unique receipt is the **only path** to retrieve the linked **ContentID**.

You cannot input a non-unique Content ID ('SIG-A') and ask the system to unlock it; you must input a unique purchase receipt (Token ID 124, 125, etc.) and prove ownership of that receipt first.

---

## Order of building

Smart Contracts→Backend Indexing/API→Frontend UI

## 📝 Recommended Workflow Summary

| Phase       | Stack Focus                            | Main Deliverable                                                                            |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1** | **Solidity & Foundry**                 | Final, tested, gas-optimized contracts deployed to BNB Testnet.                             |
| **Phase 2** | **Express, Viem, MongoDB**             | Secure API for fast data rendering (leaderboards) and the functional **Signal Gate** logic. |
| **Phase 3** | **React, Wagmi, RainbowKit, Tailwind** | The User Interface, connecting all the logic together.                                      |

---

## 💾 Final MongoDB Schema for SignalFriend

This architecture is designed for **sonic-speed performance** by serving structured data directly from the database and using on-chain data only for verification and indexing.

### 1. 🧑‍💻 Predictor Model (Sellers)

This model serves as the single source of truth for a seller's profile and reputation.

| Field             | Type           | Uniqueness/Index         | Description                                                                 |
| ----------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| `walletAddress`   | `String`       | **Unique** (PRIMARY KEY) | The on-chain address holding the **Predictor Access Pass NFT**.             |
| `nickname`        | `String`       | **Unique** (Index)       | Public display name.                                                        |
| `isBlacklisted`   | `Boolean`      | Indexed                  | Status synced from the Smart Contract (Logic Contract's blacklist mapping). |
| `isVerified`      | `Boolean`      | Indexed                  | Status for verified badge (after 100 sales or manual onboarding).           |
| `bio`             | `String`       |                          | Predictor biography.                                                        |
| `socialLinks`     | `Array/Object` |                          | Telegram, Discord, Twitter (optional).                                      |
| `totalSalesCount` | `Number`       | Indexed                  | Critical for leaderboards. Calculated by indexing `SignalPurchased`events.  |
| `averageRating`   | `Number` (1-5) | Indexed                  | Current aggregated rating. Calculated from the `ReviewsModel`.              |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field             | Type     | Uniqueness/Index         | Description                                                        |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------ |
| `contentId`       | `String` | **Unique** (PRIMARY KEY) | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`). |
| `predictorWallet` | `String` | Indexed                  | Reference to Predictor Model (seller address).                     |
| **`name`**        | `String` |                          | **Signal title/headline (Public).**                                |
| **`description`** | `String` |                          | **Short summary, visible before purchase (Public).**               |
| `priceUSDT`       | `Number` | Indexed                  | Price set by the Predictor.                                        |
| `category`        | `String` | Indexed                  | Platform-defined category (e.g., Crypto - DeFi, Forex - Majors).   |
| `riskLevel`       | `String` | Indexed                  | Predictor-defined risk level (`Low`, `Medium`, `High`).            |
| `potentialReward` | `String` | Indexed                  | Predictor-defined reward potential (`Normal`, `Medium`, `High`).   |
| `expiryDate`      | `Date`   | **TTL Index**            | Signal expires and is removed from active listings.                |
| `fullContent`     | `String` |                          | The core signal data (entry/exit points) - **Private (Unlocked)**. |
| `reasoning`       | `String` |                          | The Predictor's detailed justification - **Private (Unlocked)**.   |
| `totalBuyers`     | `Number` | Indexed                  | Count of unique buyers (useful for popularity metrics).            |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field          | Type     | Uniqueness/Index         | Description                                                                              |
| -------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `tokenId`      | `Number` | **Unique** (PRIMARY KEY) | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| `buyerWallet`  | `String` | Indexed                  | The address that bought the NFT.                                                         |
| `contentId`    | `String` | Indexed                  | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| `purchaseDate` | `Date`   |                          | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (Rating Only - Off-Chain)

This model tracks ratings (1-5 stars), enforced one-per-purchase by the `tokenId`. **Ratings are purely off-chain** - there is no on-chain `markSignalRated` function.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase.                | **Internal** (Used for lookup)                   | `42`            |
| `signalId`              | Reference to the Signal being rated.                                    | **Internal** (Used for aggregation)              | `ObjectId`      |
| `contentId`             | The signal's content identifier for lookups.                            | **Internal** (Used for queries)                  | `uuid-string`   |
| `buyerAddress`          | The wallet address of the buyer submitting the rating.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9` |
| `predictorAddress`      | Reference to the seller being rated.                                    | **Internal** (Used for aggregation)              | `0x5d4A...b5f2` |
| `score` (1-5)           | The rating score (1-5 stars).                                           | **Internal** (Used to calculate `averageRating`) | `5`             |

### 5. 🚨 Report Model (Scam/False Signal Flagging)

This model allows buyers to report signals for moderation. Separate from ratings - users can rate AND report.

| Field                   | Purpose                                                                 | Visibility                                       | Example Content     |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one report per purchase.                | **Internal** (Used for lookup)                   | `42`                |
| `signalId`              | Reference to the Signal being reported.                                 | **Internal** (Used for queries)                  | `ObjectId`          |
| `contentId`             | The signal's content identifier.                                        | **Internal** (Used for queries)                  | `uuid-string`       |
| `buyerAddress`          | The wallet address of the buyer submitting the report.                  | **Internal** (Used for ownership)                | `0x1f56...c3a9`     |
| `predictorAddress`      | The predictor who created the reported signal.                          | **Internal** (Used for aggregation)              | `0x5d4A...b5f2`     |