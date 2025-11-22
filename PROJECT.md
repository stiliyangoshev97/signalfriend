## SignalFriend

That is an **excellent refine| **Minimum Signal Price**      | Signal price **cannot be less than $5 USDT**.             | **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($5/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                         |                                                                            | Enforced by `buySignalNFT` logic.                                                                 |ent** of the business model. By structuring the core transaction around an **NFT as a data ticket** within a **gated room**, you significantly strengthen the argument that your platf- **Minimum Signal Price:** A signal cannot be less than **5 USDT** (to prevent people from buying their own signals cheaply for rating manipulation).rm is a **Digital Information Marketplace** and not a gambling or betting platform.

Here is a breakdown of how this refined model addresses the regulatory risks and creates new opportunities:

## 1. ✅ **Addressing the Gambling Risk (The Strength of the NFT)**

The key to avoiding the "gambling" classification is the **NFT as the purchased item**.

| Your NFT-Based Model                                                                                                        | Why It's **NOT** Gambling                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The Purchase:** A trader pays $X USDC for an NFT (the "ticket").                                                          | This is a **purchase of a digital asset** (the NFT) that contains a piece of data (the signal). The value is exchanged immediately for the data itself, not for a contingent future payout. |
| **The Signal/Prediction:** The prediction is stored in the NFT's metadata (e.g., Target Price, Timeframe).                  | The prediction is the **content** of the purchased NFT, making the NFT a *content delivery mechanism*, similar to buying a digital research report or a streaming ticket.                   |
| **No Payout:** When the prediction is correct, the platform/predictor does **not** send any additional funds to the trader. | This breaks the "Prize" element of gambling. The success of the prediction only improves the predictor's **reputation** (rank) and future sales, not their payout for that specific signal. |

**Conclusion:** This model legally looks like an NFT marketplace (like OpenSea or Magic Eden) where the NFTs are for a **Utility** (data access) rather than art. This is a much safer legal classification.

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
| **Minimum Signal Price**      | Signal price **cannot be less than $10 USDT**.                                                                                          | Enforced by `buySignalNFT` logic.                                                                 |
| **Signal Price Fee**          | Price set by Predictor (min. $5 USDT).                                                                                                 | The primary portion of the sale, subject to the commission split.                                 |
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

## V. MongoDB Data Architecture (4 Core Models)

The data models reflect the new fields for filtering (`riskLevel`, `potentialReward`) and the detailed content structure (`reasoning`).

### 1. 🧑‍💻 Predictor Model (Sellers)

| Field                         | Purpose                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `walletAddress` (Primary Key) | On-chain address holding the Predictor Access Pass NFT. |
| `isBlacklisted`               | Status synced from the Smart Contract.                  |
| `totalSalesCount`             | Calculated count of signals sold.                       |
| `averageRating`               | Calculated from the **Review** Model.                   |

### 2. 📢 Signal Model (Content & Metadata)

| Field                     | Purpose                                                                         |
| ------------------------- | ------------------------------------------------------------------------------- |
| `contentId` (Primary Key) | The non-unique ID linking the NFT receipt to the content.                       |
| **`category`**            | **NEW:** Platform-defined category (e.g., `Crypto - DeFi`).                     |
| **`riskLevel`**           | **NEW:** `Low`, `Medium`, `High`. Used for filtering.                           |
| **`potentialReward`**     | **NEW:** `Normal`, `Medium`, `High`. Used for filtering.                        |
| `expiryDate`              | Time-to-live index for signal removal.                                          |
| `fullContent`             | Private data unlocked after purchase.                                           |
| **`reasoning`**           | **NEW:** Predictor's detailed justification (private, unlocked after purchase). |

### 3. 🧾 Receipt Model (The Unique Link)

| Field                   | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `tokenId` (Primary Key) | The unique ERC-721 ID of the buyer's NFT receipt.           |
| `buyerWallet`           | The address that bought the NFT.                            |
| `contentId`             | The non-unique content ID that this unique receipt unlocks. |

### 4. ⭐ Review Model (The Immutable Score Source)

| Field                   | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `tokenId` (Primary Key) | Unique NFT receipt ID. Enforces one rating per purchase. |
| `score` (1-5)           | The final rating score.                                  |
| `isRatedOnChain`        | Status synced from the `markSignalRated` event.          |

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
| **Solidity**                | Smart Contracts    | Defines the logic for the **NFT** (the signal ticket), the **access fee contracts** ($10/$20), the **commission fee structure** (5%), and the **immutable on-chain rating storage**.                                                                                                                                                                                                                         |
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

Export to Sheets

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

| Field                 | Type         | Uniqueness/Index                | Description                                                                 |
| --------------------- | ------------ | ------------------------------- | --------------------------------------------------------------------------- |
| **`walletAddress`**   | String       | **Unique (Index, PRIMARY KEY)** | The on-chain address holding the `Predictor Access Pass NFT`.               |
| **`nickname`**        | String       | **Unique (Index)**              | Public display name.                                                        |
| **`isBlacklisted`**   | Boolean      | Indexed                         | Synced from the Smart Contract (Logic Contract's blacklist mapping).        |
| **`isVerified`**      | Boolean      | Indexed                         | Status for verified badge (after 100 sales or manual onboarding).           |
| **`bio`**             | String       |                                 | Predictor biography.                                                        |
| **`socialLinks`**     | Array/Object |                                 | Telegram, Discord, Twitter (optional).                                      |
| **`totalSalesCount`** | Number       | Indexed                         | Critical for leaderboards. Calculated by indexing `SignalPurchased` events. |
| **`averageRating`**   | Number (1-5) | Indexed                         | Current aggregated rating. Calculated from the **Reviews**Model.            |

---

### 2. 📢 Signal Model (Content & Metadata)

This model holds the signal's public and private content, ready to be unlocked.

| Field                 | Type   | Uniqueness/Index                | Visibility             | Description                                                                   |
| --------------------- | ------ | ------------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| **`contentId`**       | String | **Unique (Index, PRIMARY KEY)** | Hidden                 | The non-unique ID passed to the NFT upon purchase (e.g., `SIG-A`).            |
| **`predictorWallet`** | String | Indexed                         | Public                 | Reference to Predictor Model (seller address).                                |
| **`name`**            | String |                                 | Public                 | Signal title.                                                                 |
| **`description`**     | String |                                 | Public                 | Short summary, visible **before** purchase.                                   |
| **`priceUSDT`**       | Number | Indexed                         | Public                 | Price set by the Predictor.                                                   |
| **`category`**        | String | Indexed                         | Public                 | Platform-defined category (e.g., `Crypto - DeFi`, `Forex - Majors`).          |
| **`riskLevel`**       | String | Indexed                         | Public                 | **NEW:** `Low`, `Medium`, `High`. Used for filtering.                         |
| **`potentialReward`** | String | Indexed                         | Public                 | **NEW:** `Normal`, `Medium`, `High`. Used for filtering.                      |
| **`expiryDate`**      | Date   | **TTL Index**                   | Public                 | Signal expires and is removed from active listings.                           |
| **`fullContent`**     | String |                                 | **Private (Unlocked)** | The core signal data (entry/exit points).                                     |
| **`reasoning`**       | String |                                 | **Private (Unlocked)** | **NEW:** The Predictor's detailed justification, visible only after purchase. |
| **`totalBuyers`**     | Number | Indexed                         | Public                 | Count of unique buyers (useful for popularity metrics).                       |

---

### 3. 🧾 Receipt Model (The Unique Link)

This is the **CRITICAL** mapping model, created by the Express Indexer listening to the `SignalPurchased` event.

| Field              | Type   | Uniqueness/Index                | Description                                                                              |
| ------------------ | ------ | ------------------------------- | ---------------------------------------------------------------------------------------- |
| **`tokenId`**      | Number | **Unique (Index, PRIMARY KEY)** | The unique ERC-721 ID of the buyer's NFT receipt.                                        |
| **`buyerWallet`**  | String | Indexed                         | The address that bought the NFT.                                                         |
| **`contentId`**    | String | Indexed                         | Reference to the Signal Model. The non-unique signal content ID that this token unlocks. |
| **`purchaseDate`** | Date   |                                 | Timestamp of the purchase event.                                                         |

---

### 4. ⭐ Review Model (The Immutable Score Source)

Tracks all user ratings, enforced by the unique purchase receipt.

| Field                 | Type         | Uniqueness/Index                | Description                                                                                      |
| --------------------- | ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| **`tokenId`**         | Number       | **Unique (Index, PRIMARY KEY)** | The unique NFT receipt ID. Used to enforce **one rating per purchase** (on-chain marker).        |
| **`predictorWallet`** | String       | Indexed                         | Reference to the seller being reviewed.                                                          |
| **`score`**           | Number (1-5) |                                 | The final rating score.                                                                          |
| **`reviewText`**      | String       |                                 | The optional text review.                                                                        |
| **`isRatedOnChain`**  | Boolean      |                                 | Status synced from the `markSignalRated` event (used by the Smart Contract for one-time rating). |

---

### 5. 🏷️ Category Model (Platform Control)

This model ensures a consistent, platform-defined list of categories for Predictors to select and Traders to filter.

| Field             | Type    | Uniqueness/Index                | Description                                                                              |
| ----------------- | ------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| **`name`**        | String  | **Unique (Index, PRIMARY KEY)** | The full category name (e.g., `Crypto - DeFi`).                                          |
| **`mainGroup`**   | String  | Indexed                         | The high-level grouping (`Crypto`, `Traditional Finance`, `Macro / Other`).              |
| **`description`** | String  |                                 | A short explanation of the category's focus.                                             |
| **`isActive`**    | Boolean | Indexed                         | Flag to easily enable/disable categories on the frontend (for future expansion control). |

## 🧭 Other Models and Architectural Decisions

### A. Buyer Model

The **Buyer Model** is largely redundant and can be simplified or eliminated. All necessary data (`walletAddress`, `signalsPurchased`) can be derived directly from the **`Receipt Model`** and the **`Reviews Model`** (by querying the `buyerWallet` field). This avoids unnecessary data duplication.

### B. Buyer Can Become A Seller After Paying The 20 USDT Fee

---

## 📋 Final SignalFriend Category Structure

This structure uses three main verticals, with each sub-category list including the mandatory **"Other"** option for maximum flexibility.

### 1. 🪙 Crypto (Focus Market)

This section targets the primary Web3 trading audience, including perpetuals and complex DeFi strategies.

| Category Vertical | Sub-Categories (Predictor Selection)                                    |
| ----------------- | ----------------------------------------------------------------------- |
| **Crypto**        | **Altcoins** (e.g., general large/mid-cap moves)                        |
|                   | **DeFi** (e.g., yield farming, token unlocks, protocol exploits)        |
|                   | **NFTs** (e.g., floor price trends, project mints)                      |
|                   | **Layer 1 / Layer 2** (e.g., blockchain ecosystem growth)               |
|                   | **Meme Coins** (e.g., high-risk, community-driven trends)               |
|                   | **Futures / Perpetuals** (e.g., specific leverage/funding rate signals) |
|                   | **Crypto - Other**                                                      |

Export to Sheets

### 2. 📈 Traditional Finance (Expansion Market)

This section attracts professional traders who often seek alpha in multiple markets, including those who use USDT as their base trading pair.

| Category Vertical       | Sub-Categories (Predictor Selection)                            |
| ----------------------- | --------------------------------------------------------------- |
| **Traditional Finance** | **US Stocks - Tech** (e.g., NASDAQ, major technology companies) |
|                         | **US Stocks - General** (e.g., S&P 500, broad market)           |
|                         | **Forex - Majors** (e.g., EUR/USD, USD/JPY)                     |
|                         | **Commodities - Metals** (e.g., Gold, Silver)                   |
|                         | **Commodities - Energy** (e.g., Oil, Gas)                       |
|                         | **Traditional Finance - Other**                                 |

Export to Sheets

### 3. 🌐 Macro / Other (Unique & Gated Content)

This section is for high-level macro predictions often seen in prediction markets, providing a unique edge and data diversity.

| Category Vertical | Sub-Categories (Predictor Selection)                       |
| ----------------- | ---------------------------------------------------------- |
| **Macro / Other** | **Economic Data** (e.g., CPI, Interest Rate Changes)       |
|                   | **Geopolitical Events** (e.g., elections, conflicts)       |
|                   | **Sports Betting Models** (e.g., high-level odds analysis) |
|                   | **Macro / Other - Other**                                  |

Export to Sheets

---

This final category list provides structure for the **Trader's filtering** and maximum flexibility for the **Predictor's content submission.**

---

## Use custom RPCs

### ⭐ Recommendation on RPCs

- **Start with a Generous Free Tier:** Use a reputable provider like **Alchemy, QuickNode, or Ankr**'s free or low-cost tier. These tiers offer a dedicated API key with much higher rate limits (often 3600-5 million requests per day) and better uptime than truly public, anonymous endpoints.
- **Scale to a Paid Tier:** Once you start earning money from Predictor fees and commissions (which you projected will be over $79,500 in Year 1), you **must** upgrade to a paid, dedicated RPC endpoint (like the ones from Dwellir or QuickNode, as seen in the search results). The cost of $100-$300/month is negligible compared to the lost revenue and reputation damage from a slow or broken site.

---

## Indexing

You **must implement an indexing process** in your Express backend.

1. **Phase 1 (Setup):** Use **Viem** in your Express backend to set up **event listeners** on your smart contract.
2. **Phase 2 (Indexing):** When a crucial event happens (like `PredictorJoined` or `SignalPurchased`), your Express backend catches the event **once** and writes the clean, structured data into **MongoDB**.
3. **Phase 3 (Display):** Your React frontend fetches the Leaderboard and signal lists directly from the fast **MongoDB**.

---

## The 3 Smart Contracts Needed

### 1. 🔑 PredictorAccessPass (Seller License NFT)

This grants access to sellers

---

### 2. 🎟️ SignalKeyNFT (Trader Receipt NFT)

This is the NFT that unlocks signals and it has the same unique ID as the signal itself.

---

### 3. 🧠 SignalFriendMarket (The Logic/Controller Contract)

This contract is the **"brain"** of the application. It contains all the complex business rules, financial logic, and orchestrates the calls to the two NFT contracts.

---

# Verification Rules

Here’s the **optimal formula**:

### **Requirements to Apply:**

- minimum 100 sales
- minimum 20 unique buyers (can check ip if its the same)
- average rating ≥ 4.0
- account age > 30 days
- valid social profile
- no suspicious activity in last 60 days

### **If they cheat:**

- verification temporarily denied
- can re-apply in 60 days
- repeated abuse → longer cooldown

### **If they get verified:**

- verified badge can be revoked
    
    but never *permanently* revoked
    
    (that destroys long-term growth)
    

---

## Colors to use for the frontend

Based on the image generated for the SignalFriend logo, the main colors used in the **background and accents** are:

- **Main Background:** A gradient transitioning from a **light, bright sky-blue/teal** at the top to a **light, clean lime-green** or **mint green** at the bottom.
- **Border/Frame:** A **deep gold** or **bronze** color, often with a slight metallic texture.
- **Circuitry Overlay:** **Dark teal** or **deep turquoise** lines layered over the gradient.
- **Central Glow:** A vibrant, glowing **cyan** or **electric blue-green** ring.

To help you translate these into Tailwind CSS, here are the approximate hex codes for the key colors:

| Element               | Approximate Color         | Hex Code                                                                                           |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| **Top Background**    | Light Sky Blue/Teal       | $#B3E5FC$ (closest to `sky-200` / `sky-300`)                                                       |
| **Bottom Background** | Light Lime/Mint Green     | $#C8E6C9$ (closest to `green-200` / `lime-200`)                                                    |
| **Central Glow**      | Bright Cyan/Electric Blue | $#00FFFF$ (closest to `cyan-400` / `teal-400`)                                                     |
| **Border Accent**     | Deep Gold/Bronze          | $#C98816$ (You'd likely define a custom gold or use a darker `amber` or `yellow`shade for utility) |

---

## 🏗️ SignalFriend Project Requirements

### Smart Contract Architecture & Security

- We have **3 Smart Contracts**: 2 NFTs (Predictor Access Pass and Signal Key NFT) and 1 Logic/Controller contract (`SignalFriendMarket`) for payments and orchestration.
- **MultiSignature Security:** Owner functions (like minting, blacklisting, updating commissions/treasury) on all contracts require **3-of-3 MultiSignature** approval (via the `approveChanges` function).
- **Predictor Access Pass NFT (Seller License):**
    - **Non-Transferable** to block malicious sellers and prevent license trading.
    - **One-per-Wallet Generation** to ensure one paid license per seller.
    - The platform owner has a separate **MultiSig-governed minting functionality** to issue free licenses to invite premium signallers.
    - The owner can **blacklist a seller's wallet**, preventing them from uploading new signals.
- **Signal Key NFT (Buyer Receipt):**
    - Has a **unique ID (auto-incremented)** plus the **non-unique `ContentIdentifier`**.
    - It is **minted for free** by the main Logic Contract *after* the purchase payment is transferred.
- **Logic/Controller Contract:** Handles payments, referrals, and calls the minting functions on the two NFT contracts.

---

### 💰 Financial & Business Rules

- **Minimum Signal Price:** A signal cannot be less than **10 USDT** (to prevent people from buying their own signals cheaply for rating manipulation).
- **Buyer Access Fee:** **0.5 USDT** flat commission added to every signal purchase.
- **Commission Split:** The Logic Contract handles the fee split: 5% of the signal price goes to the platform Treasury, and the remaining 95% goes to the Predictor.
- **Treasury Management:** Use a **Ledger-backed Externally Owned Account (EOA)** as the platform treasury, which should be rotated periodically for security.
- **Predictor Registration:** A **seller can also be a buyer** using the same wallet (after paying the Predictor join fee).

---

### 💾 Data & Backend Logic (Express/MongoDB)

- **Hybrid Security:** Sensitive signal content and high-volume data (profiles, reviews) are stored **off-chain in MongoDB**.
- **Signal Unlock Flow:** The unique NFT ID is the key. The backend must: 1) Check the blockchain (via Viem) to confirm the user **owns** the unique **Token ID**. 2) Look up the `Token ID` in the MongoDB **Receipt** model to retrieve the linked, non-unique **`ContentIdentifier`** which unlocks the signal content.
- **Data Indexing:** Use **Viem/event listening** in the Express backend for **indexing critical data** (e.g., `predictorJoined`, `signalPurchased`) and writing it to MongoDB for fast retrieval.
- **Malicious Seller Control:** If a seller wallet is blacklisted on-chain, **MongoDB should not display their profile**or active signals.
- **Rating Enforcement:** The rating system is off-chain, but the Smart Contract provides a **single-use marker**(`markSignalRated` function) to enforce **one rating per purchase receipt (Token ID)**.
- **App Infrastructure:** Use **custom RPCs** for reliable blockchain communication. **Back up the database and the whole app** regularly.

---

### 🌐 User Experience (UX) & Content

- **Rating System:** Users can **rate (1 to 5 stars) and review** sellers after purchase (once per purchase receipt). The seller's rank is derived from these user ratings.
- **Predictor Profile:** Seller profiles list their signals, which have descriptions and can be **sorted/filtered based on platform-defined categories**.
- **Public Metrics:** A buyer can view a seller's **total sales and total active signals**.
- **Seller Verification:** Sellers receive a **verified badge upon request after 100 sales**. Onboarded "premium" sellers will be verified from the beginning.
- **Predictor Info:** Sellers can include **social media links** (optional).
- **User Nicknames:** Users can have **unique nicknames**.
- **Signal Visibility:** Signals have an **expiration date**; once expired, they are **no longer visible** or available for purchase.
- **Buyer Access:** A seller, acting as a buyer, must have the **"My Signals" tab** to access their purchased reports.

---

### 💬 Support & Community

- **Predictor Support:** A **private Discord group** for predictors to open tickets for issues.
- **Buyer Support:** A **separate Discord group** for buyers to open tickets.