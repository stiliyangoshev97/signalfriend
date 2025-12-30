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
 * Main category groups (verticals) for prediction markets
 */
export const MAIN_GROUPS = {
  CRYPTO: "Crypto",
  FINANCE: "Finance",
  POLITICS: "Politics",
  SPORTS: "Sports",
  WORLD: "World",
  CULTURE: "Culture",
} as const;

/**
 * Default categories to seed the database.
 * Structure: mainGroup > subcategories
 * Used by the seedCategories script to initialize the platform.
 * 
 * Designed for prediction market signals (Polymarket, Predict.fun, etc.)
 */
export const DEFAULT_CATEGORIES = [
  // Crypto subcategories
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Bitcoin", slug: "crypto-bitcoin", description: "Bitcoin price and adoption predictions", icon: "₿", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Ethereum", slug: "crypto-ethereum", description: "Ethereum price and ecosystem predictions", icon: "Ξ", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Altcoins", slug: "crypto-altcoins", description: "Alternative cryptocurrency predictions", icon: "🪙", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "DeFi", slug: "crypto-defi", description: "DeFi protocol and TVL predictions", icon: "🏦", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "NFTs/Gaming", slug: "crypto-nfts-gaming", description: "NFT and crypto gaming predictions", icon: "🎮", sortOrder: 5 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Meme Coins", slug: "crypto-meme-coins", description: "Meme coin predictions", icon: "🐕", sortOrder: 6 },
  { mainGroup: MAIN_GROUPS.CRYPTO, name: "Other", slug: "crypto-other", description: "Other crypto predictions", icon: "💎", sortOrder: 99 },

  // Finance subcategories
  { mainGroup: MAIN_GROUPS.FINANCE, name: "Stocks", slug: "finance-stocks", description: "Stock market predictions", icon: "📈", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.FINANCE, name: "Forex", slug: "finance-forex", description: "Currency and forex predictions", icon: "💱", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.FINANCE, name: "Commodities", slug: "finance-commodities", description: "Commodity price predictions", icon: "🛢️", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.FINANCE, name: "Earnings", slug: "finance-earnings", description: "Company earnings predictions", icon: "💰", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.FINANCE, name: "Other", slug: "finance-other", description: "Other finance predictions", icon: "💵", sortOrder: 99 },

  // Politics subcategories
  { mainGroup: MAIN_GROUPS.POLITICS, name: "US Elections", slug: "politics-us-elections", description: "US election predictions", icon: "🇺🇸", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.POLITICS, name: "World Politics", slug: "politics-world", description: "International politics predictions", icon: "🌐", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.POLITICS, name: "Policy", slug: "politics-policy", description: "Policy and regulation predictions", icon: "📜", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.POLITICS, name: "Legal", slug: "politics-legal", description: "Court decisions and legal case predictions", icon: "⚖️", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.POLITICS, name: "Other", slug: "politics-other", description: "Other political predictions", icon: "🏛️", sortOrder: 99 },

  // Sports subcategories
  { mainGroup: MAIN_GROUPS.SPORTS, name: "Football", slug: "sports-football", description: "Football/Soccer predictions", icon: "⚽", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.SPORTS, name: "American Football", slug: "sports-american-football", description: "NFL and American football predictions", icon: "🏈", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.SPORTS, name: "Basketball", slug: "sports-basketball", description: "Basketball predictions", icon: "🏀", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.SPORTS, name: "Combat Sports", slug: "sports-combat", description: "MMA, Boxing, UFC predictions", icon: "🥊", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.SPORTS, name: "Horse Racing", slug: "sports-horse-racing", description: "Horse racing predictions", icon: "🏇", sortOrder: 5 },
  { mainGroup: MAIN_GROUPS.SPORTS, name: "Esports", slug: "sports-esports", description: "Esports and gaming tournament predictions", icon: "🎮", sortOrder: 6 },
  { mainGroup: MAIN_GROUPS.SPORTS, name: "Other", slug: "sports-other", description: "Other sports predictions", icon: "🏆", sortOrder: 99 },

  // World subcategories
  { mainGroup: MAIN_GROUPS.WORLD, name: "Geopolitics", slug: "world-geopolitics", description: "Geopolitical event predictions", icon: "🌍", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.WORLD, name: "Economy", slug: "world-economy", description: "Global economic predictions", icon: "📊", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.WORLD, name: "Climate/Weather", slug: "world-climate", description: "Climate and weather predictions", icon: "🌡️", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.WORLD, name: "Science", slug: "world-science", description: "Scientific and tech predictions", icon: "🔬", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.WORLD, name: "Other", slug: "world-other", description: "Other world predictions", icon: "🗺️", sortOrder: 99 },

  // Culture subcategories
  { mainGroup: MAIN_GROUPS.CULTURE, name: "Entertainment", slug: "culture-entertainment", description: "Entertainment and media predictions", icon: "🎬", sortOrder: 1 },
  { mainGroup: MAIN_GROUPS.CULTURE, name: "Awards", slug: "culture-awards", description: "Oscars, Grammys, Emmys predictions", icon: "🏆", sortOrder: 2 },
  { mainGroup: MAIN_GROUPS.CULTURE, name: "Tech/AI", slug: "culture-tech-ai", description: "Technology and AI predictions", icon: "🤖", sortOrder: 3 },
  { mainGroup: MAIN_GROUPS.CULTURE, name: "Social Media", slug: "culture-social-media", description: "Social media predictions", icon: "📱", sortOrder: 4 },
  { mainGroup: MAIN_GROUPS.CULTURE, name: "Other", slug: "culture-other", description: "Other culture predictions", icon: "🎭", sortOrder: 99 },
];
