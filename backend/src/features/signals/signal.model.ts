import mongoose, { Schema, Document } from "mongoose";

export interface ISignal extends Document {
  contentId: string; // Unique content identifier (e.g., UUID)
  predictorId: mongoose.Types.ObjectId;
  predictorAddress: string;
  title: string;
  description: string;
  content: string; // The actual signal content (encrypted or protected)
  categoryId: mongoose.Types.ObjectId;
  priceUsdt: number; // Price in USDT (from contract)
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const signalSchema = new Schema<ISignal>(
  {
    contentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    predictorId: {
      type: Schema.Types.ObjectId,
      ref: "Predictor",
      required: true,
      index: true,
    },
    predictorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    content: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    priceUsdt: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
signalSchema.index({ isActive: 1, categoryId: 1 });
signalSchema.index({ isActive: 1, predictorId: 1 });
signalSchema.index({ isActive: 1, createdAt: -1 });

export const Signal = mongoose.model<ISignal>("Signal", signalSchema);
