import mongoose, { Schema, Document } from "mongoose";

export interface IPredictor extends Document {
  walletAddress: string;
  tokenId: number;
  displayName: string;
  bio: string;
  avatarUrl: string;
  socialLinks: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  /** Preferred contact method for admin communication */
  preferredContact: "telegram" | "discord";
  categoryIds: mongoose.Types.ObjectId[];
  totalSignals: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  isBlacklisted: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const predictorSchema = new Schema<IPredictor>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    tokenId: {
      type: Number,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    socialLinks: {
      twitter: String,
      telegram: String,
      discord: String,
    },
    preferredContact: {
      type: String,
      enum: ["telegram", "discord"],
      default: "telegram",
    },
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    totalSignals: {
      type: Number,
      default: 0,
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
    isBlacklisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    joinedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering active predictors by category
predictorSchema.index({ isBlacklisted: 1, categoryIds: 1 });

export const Predictor = mongoose.model<IPredictor>("Predictor", predictorSchema);
