/**
 * @fileoverview Mongoose model definition for the Category collection.
 *
 * Categories are used to classify trading signals (e.g., Crypto, Forex, Stocks).
 * Each category has a unique name and URL-friendly slug.
 *
 * @module features/categories/category.model
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/categories/category.model.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * Category document interface extending Mongoose Document.
 * Represents a signal category in the database.
 */
export interface ICategory extends Document {
  /** Display name of the category (subcategory) */
  name: string;
  /** URL-friendly identifier (lowercase, hyphens allowed) */
  slug: string;
  /** Main category group (e.g., "Crypto", "Traditional Finance", "Macro / Other") */
  mainGroup: string;
  /** Brief description of what signals belong in this category */
  description: string;
  /** Emoji or icon character for visual representation */
  icon: string;
  /** Whether the category is available for use */
  isActive: boolean;
  /** Display order priority (lower numbers appear first) */
  sortOrder: number;
  /** Timestamp when the category was created */
  createdAt: Date;
  /** Timestamp when the category was last updated */
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    mainGroup: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },
    icon: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: name must be unique within each mainGroup
categorySchema.index({ mainGroup: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", categorySchema);

/**
 * Main category groups (verticals)
 */
export const MAIN_GROUPS = {
  CRYPTO: "Crypto",
  TRADITIONAL_FINANCE: "Traditional Finance",
  MACRO_OTHER: "Macro / Other",
} as const;

/**
 * Default categories to seed the database.
 * Structure: mainGroup > subcategories
 * Used by the seedCategories script to initialize the platform.
 */
export const DEFAULT_CATEGORIES = [
  // Crypto subcategories
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Bitcoin", slug: "crypto-bitcoin", description: "Bitcoin (BTC) trading signals", icon: "₿", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Ethereum", slug: "crypto-ethereum", description: "Ethereum (ETH) trading signals", icon: "Ξ", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Altcoins", slug: "crypto-altcoins", description: "Alternative cryptocurrency signals", icon: "🪙", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "DeFi", slug: "crypto-defi", description: "Decentralized finance signals", icon: "🏦", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "NFTs", slug: "crypto-nfts", description: "NFT market signals", icon: "🖼️", sortOrder: 5 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Layer 1/2", slug: "crypto-layer-1-2", description: "Layer 1 and Layer 2 blockchain signals", icon: "⛓️", sortOrder: 6 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Meme Coins", slug: "crypto-meme-coins", description: "Meme coin trading signals", icon: "🐕", sortOrder: 7 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Futures/Perpetuals", slug: "crypto-futures", description: "Crypto futures and perpetual signals", icon: "📊", sortOrder: 8 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Other", slug: "crypto-other", description: "Other crypto signals", icon: "💎", sortOrder: 99 },

  // Traditional Finance subcategories
  { mainGroup: MAIN_GROUPS.TRADITIONAL_FINANCE, name: "US Stocks - Tech", slug: "tradfi-stocks-tech", description: "US technology stock signals", icon: "💻", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.TRADITIONAL_FINANCE, name: "US Stocks - General", slug: "tradfi-stocks-general", description: "General US stock signals", icon: "📈", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.TRADITIONAL_FINANCE, name: "Forex - Majors", slug: "tradfi-forex-majors", description: "Major forex pair signals", icon: "💱", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.TRADITIONAL_FINANCE, name: "Commodities - Metals", slug: "tradfi-commodities-metals", description: "Precious metals signals", icon: "🥇", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.TRADITIONAL_FINANCE, name: "Commodities - Energy", slug: "tradfi-commodities-energy", description: "Energy commodity signals", icon: "🛢️", sortOrder: 5 },
  { mainGroup: MAIN_GROUPS.TRADITIONAL_FINANCE, name: "Other", slug: "tradfi-other", description: "Other traditional finance signals", icon: "💵", sortOrder: 99 },

  // Macro / Other subcategories
  { mainGroup: MAIN_GROUPS.MACRO_OTHER, name: "Economic Data", slug: "macro-economic-data", description: "Economic data predictions", icon: "📉", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.MACRO_OTHER, name: "Geopolitical Events", slug: "macro-geopolitical", description: "Geopolitical event predictions", icon: "🌍", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.MACRO_OTHER, name: "Sports", slug: "macro-sports", description: "Sports predictions", icon: "⚽", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.MACRO_OTHER, name: "Other", slug: "macro-other", description: "Other predictions and signals", icon: "📊", sortOrder: 99 },
];
