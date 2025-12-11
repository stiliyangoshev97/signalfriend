/**
 * @fileoverview MongoDB model for tracking processed webhook events.
 *
 * Stores transaction hashes and event log indexes to prevent duplicate
 * processing of blockchain events. This provides idempotency protection
 * against webhook retries and replay attacks.
 *
 * Events are automatically cleaned up after 30 days via TTL index.
 *
 * @module features/webhooks/processedEvent.model
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a ProcessedWebhookEvent document in MongoDB.
 * Extends Mongoose Document for type safety.
 */
export interface IProcessedWebhookEvent extends Document {
  /** Unique event identifier: txHash-logIndex or txHash-topic0 for uniqueness */
  eventKey: string;
  /** Blockchain transaction hash */
  transactionHash: string;
  /** Event type (e.g., "PredictorJoined", "SignalPurchased") */
  eventType: string;
  /** Webhook ID from Alchemy */
  webhookId: string;
  /** Timestamp when the webhook was created (from Alchemy payload) */
  webhookCreatedAt: Date;
  /** Timestamp when we processed it */
  processedAt: Date;
}

/**
 * Mongoose schema definition for ProcessedWebhookEvent documents.
 * Includes TTL index to auto-delete old records.
 */
const processedWebhookEventSchema = new Schema<IProcessedWebhookEvent>(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    transactionHash: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    webhookId: {
      type: String,
      required: true,
    },
    webhookCreatedAt: {
      type: Date,
      required: true,
    },
    processedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use processedAt instead
  }
);

// TTL index: automatically delete records after 30 days
// This keeps the collection small while still preventing replays
processedWebhookEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ProcessedWebhookEvent = mongoose.model<IProcessedWebhookEvent>(
  "ProcessedWebhookEvent",
  processedWebhookEventSchema
);
