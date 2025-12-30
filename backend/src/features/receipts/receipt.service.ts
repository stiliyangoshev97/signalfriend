/**
 * @fileoverview Business logic service for Receipt operations.
 *
 * Provides operations for receipts including:
 * - Listing user's purchase history
 * - Listing signal's sales history (for predictors)
 * - Receipt verification and lookup
 * - Internal creation from blockchain events
 *
 * Note: Receipts are created via webhooks when SignalPurchased
 * events are detected, not through direct API calls.
 *
 * @module features/receipts/receipt.service
 */
import { Receipt, IReceipt } from "./receipt.model.js";
import { Signal } from "../signals/signal.model.js";
import { Predictor } from "../predictors/predictor.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { bytes32ToUuid, isValidBytes32 } from "../../shared/utils/contentId.js";
import type {
  ListMyReceiptsQuery,
  ListSignalReceiptsQuery,
  CreateReceiptFromEventInput,
} from "./receipt.schemas.js";

/** Receipt list response with pagination metadata */
export interface ReceiptListResponse {
  receipts: IReceipt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service class for Receipt business logic.
 * All methods are static for stateless operation.
 */
export class ReceiptService {
  /**
   * Retrieves a user's purchase history with pagination.
   *
   * @param buyerAddress - The buyer's wallet address
   * @param query - Query parameters for pagination and sorting
   * @returns Promise resolving to receipts array with pagination metadata
   */
  static async getMyReceipts(
    buyerAddress: string,
    query: ListMyReceiptsQuery
  ): Promise<ReceiptListResponse> {
    const { sortBy, sortOrder, page, limit } = query;
    const normalizedAddress = buyerAddress.toLowerCase();

    // Build sort
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [receipts, total] = await Promise.all([
      Receipt.find({ buyerAddress: normalizedAddress })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: "signalId",
          select: "title description categoryId predictorAddress eventUrl",
          populate: {
            path: "categoryId",
            select: "name slug icon",
          },
        })
        .lean(),
      Receipt.countDocuments({ buyerAddress: normalizedAddress }),
    ]);

    // Transform receipts to rename signalId -> signal and categoryId -> category
    const transformedReceipts = receipts.map((receipt) => {
      const { signalId, ...rest } = receipt;
      const signalData = signalId as {
        title?: string;
        description?: string;
        categoryId?: { name?: string; slug?: string; icon?: string };
        predictorAddress?: string;
        eventUrl?: string;
      } | null;

      return {
        ...rest,
        signal: signalData
          ? {
              title: signalData.title,
              description: signalData.description,
              eventUrl: signalData.eventUrl,
              category: signalData.categoryId
                ? {
                    name: signalData.categoryId.name,
                    slug: signalData.categoryId.slug,
                    icon: signalData.categoryId.icon,
                  }
                : undefined,
            }
          : undefined,
      };
    });

    return {
      receipts: transformedReceipts as unknown as IReceipt[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves sales history for a specific signal.
   * Only accessible to the signal's creator (predictor).
   *
   * @param contentId - The signal's content ID
   * @param callerAddress - Address of the caller (must be predictor)
   * @param query - Query parameters for pagination
   * @returns Promise resolving to receipts array with pagination metadata
   * @throws {ApiError} 404 if signal not found
   * @throws {ApiError} 403 if caller is not the predictor
   */
  static async getSignalReceipts(
    contentId: string,
    callerAddress: string,
    query: ListSignalReceiptsQuery
  ): Promise<ReceiptListResponse> {
    const { page, limit } = query;
    const normalizedCaller = callerAddress.toLowerCase();

    // Find signal and verify ownership
    const signal = await Signal.findOne({ contentId });
    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    if (signal.predictorAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only view sales for your own signals");
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [receipts, total] = await Promise.all([
      Receipt.find({ contentId })
        .sort({ purchasedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-signalId"), // Don't need to populate signal since we already have it
      Receipt.countDocuments({ contentId }),
    ]);

    return {
      receipts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single receipt by token ID.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @returns Promise resolving to the receipt document
   * @throws {ApiError} 404 if receipt not found
   */
  static async getByTokenId(tokenId: number): Promise<IReceipt> {
    const receipt = await Receipt.findOne({ tokenId }).populate({
      path: "signalId",
      select: "title description categoryId",
      populate: {
        path: "categoryId",
        select: "name slug icon",
      },
    });

    if (!receipt) {
      throw ApiError.notFound(`Receipt with tokenId '${tokenId}' not found`);
    }

    return receipt;
  }

  /**
   * Checks if a user has purchased a specific signal.
   *
   * @param contentId - The signal's content ID
   * @param buyerAddress - The buyer's wallet address
   * @returns Promise resolving to true if user has purchased
   */
  static async hasPurchased(
    contentId: string,
    buyerAddress: string
  ): Promise<boolean> {
    const normalizedAddress = buyerAddress.toLowerCase();
    const count = await Receipt.countDocuments({
      contentId,
      buyerAddress: normalizedAddress,
    });
    return count > 0;
  }

  /**
   * Gets the receipt for a specific purchase.
   *
   * @param contentId - The signal's content ID
   * @param buyerAddress - The buyer's wallet address
   * @returns Promise resolving to receipt or null
   */
  static async getReceipt(
    contentId: string,
    buyerAddress: string
  ): Promise<IReceipt | null> {
    const normalizedAddress = buyerAddress.toLowerCase();
    return Receipt.findOne({
      contentId,
      buyerAddress: normalizedAddress,
    });
  }

  /**
   * Creates a new receipt from a SignalPurchased blockchain event.
   * Called by the webhook service when indexing events.
   *
   * Handles contentId conversion:
   * - On-chain: bytes32 hex (e.g., "0x550e8400e29b41d4a716446655440000...")
   * - Backend: UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
   *
   * @param data - Event data for the new receipt
   * @returns Promise resolving to the created receipt document
   * @throws {ApiError} 409 if receipt already exists (duplicate event)
   * @throws {ApiError} 404 if signal not found
   */
  static async createFromEvent(
    data: CreateReceiptFromEventInput
  ): Promise<IReceipt> {
    const normalizedBuyer = data.buyerAddress.toLowerCase();
    const normalizedPredictor = data.predictorAddress.toLowerCase();

    // Check if receipt already exists (idempotency)
    const existing = await Receipt.findOne({ tokenId: data.tokenId });
    if (existing) {
      // Return existing receipt (idempotent behavior)
      return existing;
    }

    // Convert bytes32 contentId from blockchain to UUID format for lookup
    let lookupContentId = data.contentId;
    if (isValidBytes32(data.contentId)) {
      lookupContentId = bytes32ToUuid(data.contentId);
    }

    // Find the signal using converted contentId
    const signal = await Signal.findOne({ contentId: lookupContentId });
    if (!signal) {
      throw ApiError.notFound(
        `Signal with contentId '${lookupContentId}' not found (original: ${data.contentId})`
      );
    }

    // Create receipt with UUID contentId (matching the signal)
    const receipt = new Receipt({
      tokenId: data.tokenId,
      contentId: lookupContentId,
      buyerAddress: normalizedBuyer,
      predictorAddress: normalizedPredictor,
      signalId: signal._id,
      priceUsdt: data.priceUsdt,
      purchasedAt: data.purchasedAt,
      transactionHash: data.transactionHash,
    });

    await receipt.save();

    // Update signal sales count (use lookupContentId which is the UUID format)
    await Signal.updateOne(
      { contentId: lookupContentId },
      { $inc: { totalSales: 1 } }
    );

    // Update predictor sales count
    await Predictor.updateOne(
      { walletAddress: normalizedPredictor },
      { $inc: { totalSales: 1 } }
    );

    return receipt;
  }

  /**
   * Gets total sales statistics for a predictor.
   *
   * @param predictorAddress - The predictor's wallet address
   * @returns Promise resolving to sales statistics
   */
  static async getPredictorStats(predictorAddress: string): Promise<{
    totalSales: number;
    totalRevenue: number;
  }> {
    const normalizedAddress = predictorAddress.toLowerCase();

    const result = await Receipt.aggregate([
      { $match: { predictorAddress: normalizedAddress } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$priceUsdt" },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalSales: 0, totalRevenue: 0 };
    }

    return {
      totalSales: result[0].totalSales,
      totalRevenue: result[0].totalRevenue,
    };
  }

  /**
   * Gets the count of unique buyers for a signal.
   *
   * @param contentId - The signal's content ID
   * @returns Promise resolving to the count of unique buyers
   */
  static async getUniqueBuyersCount(contentId: string): Promise<number> {
    const result = await Receipt.distinct("buyerAddress", { contentId });
    return result.length;
  }
}
