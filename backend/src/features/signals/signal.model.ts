/**
 * @fileoverview MongoDB model for Signal documents.
 *
 * Signals are the core content sold by predictors. Each signal has:
 * - Public metadata (title, description, price, ratings)
 * - Protected content (revealed only after purchase)
 * - Statistics (sales count, average rating)
 *
 * @module features/signals/signal.model
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a Signal document in MongoDB.
 * Extends Mongoose Document for type safety.
 */
export interface ISignal extends Document {
  /** Unique content identifier (UUID v4) */
  contentId: string;
  /** Reference to the predictor who created this signal */
  predictorId: mongoose.Types.ObjectId;
  /** Predictor's wallet address (denormalized for quick queries) */
  predictorAddress: string;
  /** Signal title (public) */
  title: string;
  /** Public description shown before purchase */
  description: string;
  /** Protected signal content (revealed after purchase) */
  content: string;
  /** Reference to the signal's category */
  categoryId: mongoose.Types.ObjectId;
  /** Price in USDT */
  priceUsdt: number;
  /** When the signal expires and can no longer be purchased */
  expiresAt: Date;
  /** Total number of purchases */
  totalSales: number;
  /** Average rating from reviews (0-5) */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Whether the signal is active (soft delete) */
  isActive: boolean;
  /** Risk level assessment by predictor */
  riskLevel: "low" | "medium" | "high";
  /** Potential reward assessment by predictor */
  potentialReward: "normal" | "medium" | "high";
  /** Timestamp when signal was created */
  createdAt: Date;
  /** Timestamp when signal was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema definition for Signal documents.
 * Includes indexes for efficient queries.
 */
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
    expiresAt: {
      type: Date,
      required: true,
      index: true,
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
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      index: true,
    },
    potentialReward: {
      type: String,
      enum: ["normal", "medium", "high"],
      required: true,
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
signalSchema.index({ isActive: 1, expiresAt: 1 }); // For filtering non-expired signals

export const Signal = mongoose.model<ISignal>("Signal", signalSchema);
