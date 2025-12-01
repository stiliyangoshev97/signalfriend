/**
 * @fileoverview MongoDB model for Report documents.
 *
 * Reports allow buyers to flag scam/false signals after purchase.
 * Key constraint: One report per purchase (enforced by unique tokenId).
 * Separate from ratings - a buyer can rate AND report independently.
 *
 * @module features/reports/report.model
 */
import mongoose, { Schema, Document } from "mongoose";

/** Available report reasons */
export const REPORT_REASONS = [
  "false_signal",      // Signal prediction was completely wrong/fabricated
  "misleading_info",   // Description didn't match actual content
  "scam",              // Predictor appears to be running a scam
  "duplicate_content", // Same content sold multiple times under different signals
  "other",             // Other reason (requires description)
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/**
 * Interface representing a Report document in MongoDB.
 * Extends Mongoose Document for type safety.
 */
export interface IReport extends Document {
  /** SignalKeyNFT token ID - ensures one report per purchase */
  tokenId: number;
  /** Reference to the reported Signal */
  signalId: mongoose.Types.ObjectId;
  /** Signal content ID (denormalized for quick queries) */
  contentId: string;
  /** Reporter's wallet address (buyer) */
  reporterAddress: string;
  /** Predictor's wallet address (reported seller) */
  predictorAddress: string;
  /** Reason for the report */
  reason: ReportReason;
  /** Optional description providing more context */
  description: string;
  /** Report status for admin review */
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  /** Admin notes (internal use only) */
  adminNotes: string;
  /** Timestamp when report was created */
  createdAt: Date;
  /** Timestamp when report was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema definition for Report documents.
 * Includes indexes for efficient queries.
 */
const reportSchema = new Schema<IReport>(
  {
    tokenId: {
      type: Number,
      required: true,
      unique: true, // One report per purchase receipt
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
    reporterAddress: {
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
    reason: {
      type: String,
      required: true,
      enum: REPORT_REASONS,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      index: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
reportSchema.index({ predictorAddress: 1, status: 1 });
reportSchema.index({ contentId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>("Report", reportSchema);
