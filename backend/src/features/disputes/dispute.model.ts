/**
 * @fileoverview MongoDB model for Dispute documents.
 *
 * Disputes allow blacklisted predictors to appeal their blacklist status.
 * Key design decisions:
 * - One dispute per predictor (unique walletAddress)
 * - No explanation required - admin will contact via preferred method
 * - Simple status workflow: pending → contacted → resolved/rejected
 *
 * @module features/disputes/dispute.model
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a Dispute document in MongoDB.
 * Extends Mongoose Document for type safety.
 */
export interface IDispute extends Document {
  /** Predictor's wallet address (unique - one dispute per predictor) */
  predictorAddress: string;
  /** Dispute status for admin tracking */
  status: "pending" | "contacted" | "resolved" | "rejected";
  /** Admin-only internal notes (e.g., "Contacted on TG 12/6, waiting reply") */
  adminNotes: string;
  /** Timestamp when dispute was created */
  createdAt: Date;
  /** Timestamp when dispute was resolved or rejected */
  resolvedAt?: Date;
  /** Timestamp when record was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema definition for Dispute documents.
 * Includes unique index on predictorAddress to enforce one dispute per predictor.
 */
const disputeSchema = new Schema<IDispute>(
  {
    predictorAddress: {
      type: String,
      required: true,
      unique: true, // One dispute per predictor
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "contacted", "resolved", "rejected"],
      index: true,
    },
    adminNotes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/** Dispute mongoose model */
export const Dispute = mongoose.model<IDispute>("Dispute", disputeSchema);
