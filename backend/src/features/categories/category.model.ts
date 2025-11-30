import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
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

// Default categories to seed
export const DEFAULT_CATEGORIES = [
  { name: "Crypto", slug: "crypto", description: "Cryptocurrency trading signals", icon: "₿", sortOrder: 1 },
  { name: "Forex", slug: "forex", description: "Foreign exchange trading signals", icon: "💱", sortOrder: 2 },
  { name: "Stocks", slug: "stocks", description: "Stock market trading signals", icon: "📈", sortOrder: 3 },
  { name: "Commodities", slug: "commodities", description: "Commodity trading signals", icon: "🛢️", sortOrder: 4 },
  { name: "Sports", slug: "sports", description: "Sports betting predictions", icon: "⚽", sortOrder: 5 },
  { name: "Esports", slug: "esports", description: "Esports betting predictions", icon: "🎮", sortOrder: 6 },
  { name: "Other", slug: "other", description: "Other predictions and signals", icon: "📊", sortOrder: 99 },
];
