import mongoose, { Schema, Document } from "mongoose";

export interface IReceipt extends Document {
  tokenId: number; // SignalKeyNFT token ID (unique receipt)
  contentId: string; // Links to Signal.contentId
  buyerAddress: string;
  predictorAddress: string;
  signalId: mongoose.Types.ObjectId;
  priceUsdt: number;
  purchasedAt: Date;
  transactionHash: string;
  createdAt: Date;
  updatedAt: Date;
}

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
