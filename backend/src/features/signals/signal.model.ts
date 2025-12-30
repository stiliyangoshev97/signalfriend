/**
 * @fileoverview MongoDB model for Signal documents.
 *
 * Signals are the core content sold by predictors. Each signal has:
 * - Public metadata (title, description, price, confidence)
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
  /** Main category group (denormalized from Category for read performance) */
  mainGroup: string;
  /** Price in USDT */
  priceUsdt: number;
  /** When the signal expires and can no longer be purchased (1-90 days from creation) */
  expiresAt: Date;
  /** Predictor's confidence level in this prediction (1-100%) */
  confidenceLevel: number;
  /** Optional URL to the prediction market event (Polymarket, Predict.fun, etc.) */
  eventUrl?: string;
  /** Total number of purchases */
  totalSales: number;
  /** Average rating from reviews (0-5) */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Whether the signal is active (soft delete) */
  isActive: boolean;
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
    mainGroup: {
      type: String,
      required: false, // Optional for backward compatibility with existing signals
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
    confidenceLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      index: true,
    },
    eventUrl: {
      type: String,
      required: false,
      maxlength: 500,
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
signalSchema.index({ isActive: 1, mainGroup: 1 }); // New index for mainGroup filtering
signalSchema.index({ isActive: 1, predictorId: 1 });
signalSchema.index({ isActive: 1, createdAt: -1 });
signalSchema.index({ isActive: 1, expiresAt: 1 }); // For filtering non-expired signals

export const Signal = mongoose.model<ISignal>("Signal", signalSchema);
