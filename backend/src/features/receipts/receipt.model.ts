/**
 * @fileoverview MongoDB model for Receipt documents.
 *
 * Receipts represent signal purchases and are created when
 * SignalPurchased events are detected via Alchemy webhooks.
 * Each receipt corresponds to a SignalKeyNFT token.
 *
 * @module features/receipts/receipt.model
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a Receipt document in MongoDB.
 * Extends Mongoose Document for type safety.
 */
export interface IReceipt extends Document {
  /** SignalKeyNFT token ID (unique receipt identifier) */
  tokenId: number;
  /** Signal content ID (links to Signal.contentId) */
  contentId: string;
  /** Buyer's wallet address */
  buyerAddress: string;
  /** Predictor's wallet address */
  predictorAddress: string;
  /** Reference to the purchased Signal */
  signalId: mongoose.Types.ObjectId;
  /** Price paid in USDT */
  priceUsdt: number;
  /** Timestamp when purchase occurred */
  purchasedAt: Date;
  /** Blockchain transaction hash */
  transactionHash: string;
  /** Timestamp when record was created */
  createdAt: Date;
  /** Timestamp when record was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema definition for Receipt documents.
 * Includes indexes for efficient queries.
 */
const receiptSchema = new Schema<IReceipt>(
  {
    tokenId: {
      type: Number,
      required: true,
      unique: true,
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
    signalId: {
      type: Schema.Types.ObjectId,
      ref: "Signal",
      required: true,
    },
    priceUsdt: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasedAt: {
      type: Date,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
receiptSchema.index({ buyerAddress: 1, contentId: 1 });
receiptSchema.index({ buyerAddress: 1, signalId: 1 });

export const Receipt = mongoose.model<IReceipt>("Receipt", receiptSchema);
