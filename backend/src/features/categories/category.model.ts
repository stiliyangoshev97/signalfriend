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
  /** Display name of the category */
  name: string;
  /** URL-friendly identifier (lowercase, hyphens allowed) */
  slug: string;
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
      unique: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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

export const Category = mongoose.model<ICategory>("Category", categorySchema);

/**
 * Default categories to seed the database.
 * Used by the seedCategories script to initialize the platform.
 */
export const DEFAULT_CATEGORIES = [
  { name: "Crypto", slug: "crypto", description: "Cryptocurrency trading signals", icon: "₿", sortOrder: 1 },
  { name: "Forex", slug: "forex", description: "Foreign exchange trading signals", icon: "💱", sortOrder: 2 },
  { name: "Stocks", slug: "stocks", description: "Stock market trading signals", icon: "📈", sortOrder: 3 },
  { name: "Commodities", slug: "commodities", description: "Commodity trading signals", icon: "🛢️", sortOrder: 4 },
  { name: "Sports", slug: "sports", description: "Sports betting predictions", icon: "⚽", sortOrder: 5 },
  { name: "Esports", slug: "esports", description: "Esports betting predictions", icon: "🎮", sortOrder: 6 },
  { name: "Other", slug: "other", description: "Other predictions and signals", icon: "📊", sortOrder: 99 },
];
