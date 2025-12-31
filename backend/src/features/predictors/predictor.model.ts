import mongoose, { Schema, Document } from "mongoose";

/** Verification status for predictor profile verification */
export type VerificationStatus = "none" | "pending" | "rejected";

export interface IPredictor extends Document {
  walletAddress: string;
  tokenId: number;
  displayName: string;
  /** Whether displayName has been changed by user (locked after first change) */
  displayNameChanged: boolean;
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
  /** Total earnings from signal sales (95% of revenue, excluding referral earnings) */
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  isBlacklisted: boolean;
  /** Whether predictor has verified badge */
  isVerified: boolean;
  /** Verification application status */
  verificationStatus: VerificationStatus;
  /** Total sales when last applied for verification (for re-apply after rejection) */
  salesAtLastApplication: number;
  /** Total earnings when last applied for verification (for re-apply after rejection) */
  earningsAtLastApplication: number;
  /** Timestamp when verification was applied for */
  verificationAppliedAt?: Date;
  /** Referrer who referred this predictor (if any) */
  referredBy?: string;
  /** Whether referral bonus was paid to the referrer */
  referralPaid: boolean;
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
    displayNameChanged: {
      type: Boolean,
      default: false,
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
    totalEarnings: {
      type: Number,
      default: 0,
      index: true, // Index for sorting by earnings
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
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "rejected"],
      default: "none",
      index: true,
    },
    salesAtLastApplication: {
      type: Number,
      default: 0,
    },
    earningsAtLastApplication: {
      type: Number,
      default: 0,
    },
    verificationAppliedAt: {
      type: Date,
    },
    joinedAt: {
      type: Date,
      required: true,
    },
    referredBy: {
      type: String,
    },
    referralPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering active predictors by category
predictorSchema.index({ isBlacklisted: 1, categoryIds: 1 });
// Index for unique display names (case-insensitive)
predictorSchema.index(
  { displayName: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
// Index for referral queries
predictorSchema.index({ referredBy: 1, referralPaid: 1 });

export const Predictor = mongoose.model<IPredictor>("Predictor", predictorSchema);
