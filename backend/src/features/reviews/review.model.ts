import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  tokenId: number; // SignalKeyNFT token ID (ensures one review per purchase)
  signalId: mongoose.Types.ObjectId;
  contentId: string;
  buyerAddress: string;
  predictorAddress: string;
  score: number; // 1-5
  reviewText: string;
  createdAt: Date;
  updatedAt: Date;
}

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
