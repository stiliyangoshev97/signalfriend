/**
 * @fileoverview MongoDB model for Review documents.
 *
 * Reviews allow buyers to rate and provide feedback on purchased signals.
 * Key constraint: One review per purchase (enforced by unique tokenId).
 * Ratings are stored entirely off-chain in MongoDB.
 *
 * @module features/reviews/review.model
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a Review document in MongoDB.
 * Extends Mongoose Document for type safety.
 */
export interface IReview extends Document {
  /** SignalKeyNFT token ID - ensures one review per purchase */
  tokenId: number;
  /** Reference to the reviewed Signal */
  signalId: mongoose.Types.ObjectId;
  /** Signal content ID (denormalized for quick queries) */
  contentId: string;
  /** Buyer's wallet address */
  buyerAddress: string;
  /** Predictor's wallet address (denormalized) */
  predictorAddress: string;
  /** Rating score (1-5 stars) */
  score: number;
  /** Optional review text */
  reviewText: string;
  /** Timestamp when review was created */
  createdAt: Date;
  /** Timestamp when review was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema definition for Review documents.
 * Includes indexes for efficient queries.
 */
const reviewSchema = new Schema<IReview>(
  {
    tokenId: {
      type: Number,
      required: true,
      unique: true, // One review per purchase receipt
      index: true,
    },
    signalId: {
      type: Schema.Types.ObjectId,
      ref: "Signal",
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
      index: true,
    },
    buyerAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    predictorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
reviewSchema.index({ signalId: 1, createdAt: -1 });
reviewSchema.index({ predictorAddress: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
