/**
 * @fileoverview Business logic service for Signal operations.
 *
 * Provides operations for signals including:
 * - Listing with filtering, pagination, and sorting
 * - Signal retrieval (public metadata vs protected content)
 * - Signal creation (predictor only)
 * - Signal updates and deactivation
 * - Statistics updates (sales, ratings)
 *
 * @module features/signals/signal.service
 */
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { Signal, ISignal } from "./signal.model.js";
import { Category } from "../categories/category.model.js";
import { Predictor } from "../predictors/predictor.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type {
  ListSignalsQuery,
  CreateSignalInput,
  UpdateSignalInput,
} from "./signal.schemas.js";

/** Signal list response with pagination metadata */
export interface SignalListResponse {
  signals: Partial<ISignal>[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Public signal data (without protected content) */
export interface PublicSignal {
  _id: mongoose.Types.ObjectId;
  contentId: string;
  predictorId: mongoose.Types.ObjectId;
  predictorAddress: string;
  title: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  priceUsdt: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service class for Signal business logic.
 * All methods are static for stateless operation.
 */
export class SignalService {
  /**
   * Fields to exclude when returning public signal data.
   * Protected content is only revealed to purchasers.
   */
  private static readonly PUBLIC_FIELDS = "-content";

  /**
   * Retrieves signals with filtering, pagination, and sorting.
   * Returns public signal data only (no protected content).
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Promise resolving to signals array with pagination metadata
   */
  static async getAll(query: ListSignalsQuery): Promise<SignalListResponse> {
    const {
      categoryId,
      predictorAddress,
      active,
      sortBy,
      sortOrder,
      page,
      limit,
      search,
      minPrice,
      maxPrice,
    } = query;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Filter active signals
    if (active) {
      filter.isActive = true;
    }

    // Filter by category
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Filter by predictor address
    if (predictorAddress) {
      filter.predictorAddress = predictorAddress.toLowerCase();
    }

    // Search by title (case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.priceUsdt = {};
      if (minPrice !== undefined) {
        (filter.priceUsdt as Record<string, number>).$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (filter.priceUsdt as Record<string, number>).$lte = maxPrice;
      }
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination (exclude protected content)
    const [signals, total] = await Promise.all([
      Signal.find(filter)
        .select(SignalService.PUBLIC_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name slug icon")
        .populate("predictorId", "displayName avatarUrl averageRating"),
      Signal.countDocuments(filter),
    ]);

    return {
      signals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single signal's public metadata by contentId.
   * Does NOT include protected content.
   *
   * @param contentId - The signal's unique content ID
   * @returns Promise resolving to public signal data
   * @throws {ApiError} 404 if signal not found
   */
  static async getByContentId(contentId: string): Promise<PublicSignal> {
    const signal = await Signal.findOne({ contentId })
      .select(SignalService.PUBLIC_FIELDS)
      .populate("categoryId", "name slug icon")
      .populate("predictorId", "displayName avatarUrl averageRating walletAddress");

    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    return signal as unknown as PublicSignal;
  }

  /**
   * Retrieves the protected content of a signal.
   * Only accessible to users who have purchased the signal (own a receipt).
   *
   * @param contentId - The signal's unique content ID
   * @param buyerAddress - Address of the user requesting content
   * @returns Promise resolving to the protected content
   * @throws {ApiError} 404 if signal not found
   * @throws {ApiError} 403 if user has not purchased the signal
   */
  static async getProtectedContent(
    contentId: string,
    buyerAddress: string
  ): Promise<{ content: string }> {
    const normalizedBuyer = buyerAddress.toLowerCase();

    // Check if signal exists
    const signal = await Signal.findOne({ contentId });
    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    // Check if the user is the predictor (creator)
    if (signal.predictorAddress === normalizedBuyer) {
      return { content: signal.content };
    }

    // Check if user has purchased this signal
    const receipt = await Receipt.findOne({
      contentId,
      buyerAddress: normalizedBuyer,
    });

    if (!receipt) {
      throw ApiError.forbidden(
        "You must purchase this signal to view its content"
      );
    }

    return { content: signal.content };
  }

  /**
   * Creates a new signal for sale.
   * Only active, non-blacklisted predictors can create signals.
   *
   * @param data - Signal creation data
   * @param predictorAddress - Address of the predictor creating the signal
   * @returns Promise resolving to the created signal (public fields only)
   * @throws {ApiError} 403 if caller is not an active predictor
   * @throws {ApiError} 400 if category is invalid
   */
  static async create(
    data: CreateSignalInput,
    predictorAddress: string
  ): Promise<PublicSignal> {
    const normalizedAddress = predictorAddress.toLowerCase();

    // Verify caller is an active predictor
    const predictor = await Predictor.findOne({
      walletAddress: normalizedAddress,
      isBlacklisted: false,
    });

    if (!predictor) {
      throw ApiError.forbidden(
        "Only active predictors can create signals. You must hold a PredictorAccessPass NFT."
      );
    }

    // Validate category exists and is active
    const category = await Category.findOne({
      _id: data.categoryId,
      isActive: true,
    });

    if (!category) {
      throw ApiError.badRequest("Invalid or inactive category");
    }

    // Generate unique contentId
    const contentId = randomUUID();

    // Create signal
    const signal = new Signal({
      contentId,
      predictorId: predictor._id,
      predictorAddress: normalizedAddress,
      title: data.title,
      description: data.description,
      content: data.content,
      categoryId: data.categoryId,
      priceUsdt: data.priceUsdt,
      totalSales: 0,
      averageRating: 0,
      totalReviews: 0,
      isActive: true,
    });

    await signal.save();

    // Increment predictor's signal count
    await Predictor.updateOne(
      { _id: predictor._id },
      { $inc: { totalSignals: 1 } }
    );

    // Return without protected content
    const { content: _content, ...publicSignal } = signal.toObject();

    return publicSignal as PublicSignal;
  }

  /**
   * Updates a signal's metadata.
   * Only the signal's creator can update it.
   * Note: Some fields may have restrictions once sales occur.
   *
   * @param contentId - The signal's unique content ID
   * @param data - Fields to update
   * @param callerAddress - Address of the caller (must be creator)
   * @returns Promise resolving to the updated signal (public fields)
   * @throws {ApiError} 404 if signal not found
   * @throws {ApiError} 403 if caller is not the creator
   */
  static async update(
    contentId: string,
    data: UpdateSignalInput,
    callerAddress: string
  ): Promise<PublicSignal> {
    const normalizedCaller = callerAddress.toLowerCase();

    const signal = await Signal.findOne({ contentId });
    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    // Verify caller is the creator
    if (signal.predictorAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only update your own signals");
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await Category.findOne({
        _id: data.categoryId,
        isActive: true,
      });
      if (!category) {
        throw ApiError.badRequest("Invalid or inactive category");
      }
      signal.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    }

    // Update allowed fields
    if (data.title !== undefined) signal.title = data.title;
    if (data.description !== undefined) signal.description = data.description;
    if (data.content !== undefined) signal.content = data.content;
    if (data.isActive !== undefined) signal.isActive = data.isActive;

    await signal.save();

    // Return without protected content
    const { content: _content, ...publicSignal } = signal.toObject();

    return publicSignal as PublicSignal;
  }

  /**
   * Deactivates a signal (soft delete).
   * Only the signal's creator can deactivate it.
   *
   * @param contentId - The signal's unique content ID
   * @param callerAddress - Address of the caller (must be creator)
   * @returns Promise resolving when signal is deactivated
   * @throws {ApiError} 404 if signal not found
   * @throws {ApiError} 403 if caller is not the creator
   */
  static async deactivate(
    contentId: string,
    callerAddress: string
  ): Promise<void> {
    const normalizedCaller = callerAddress.toLowerCase();

    const signal = await Signal.findOne({ contentId });
    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    if (signal.predictorAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only deactivate your own signals");
    }

    signal.isActive = false;
    await signal.save();
  }

  /**
   * Increments a signal's sales count.
   * Called by webhook service when SignalPurchased event is received.
   *
   * @param contentId - The signal's unique content ID
   */
  static async incrementSalesCount(contentId: string): Promise<void> {
    await Signal.updateOne({ contentId }, { $inc: { totalSales: 1 } });
  }

  /**
   * Updates a signal's rating statistics.
   * Called when a new review is submitted.
   *
   * @param contentId - The signal's unique content ID
   * @param newRating - The new rating score (1-5)
   */
  static async updateRatingStats(
    contentId: string,
    newRating: number
  ): Promise<void> {
    const signal = await Signal.findOne({ contentId });
    if (!signal) return;

    // Calculate new average
    const totalReviews = signal.totalReviews + 1;
    const currentSum = signal.averageRating * signal.totalReviews;
    const newAverage = (currentSum + newRating) / totalReviews;

    await Signal.updateOne(
      { contentId },
      {
        averageRating: Math.round(newAverage * 10) / 10, // Round to 1 decimal
        totalReviews,
      }
    );
  }

  /**
   * Gets signals created by a specific predictor.
   *
   * @param predictorAddress - The predictor's wallet address
   * @param includeInactive - Whether to include inactive signals
   * @returns Promise resolving to array of signals (public fields)
   */
  static async getByPredictor(
    predictorAddress: string,
    includeInactive: boolean = false
  ): Promise<PublicSignal[]> {
    const normalizedAddress = predictorAddress.toLowerCase();
    const filter: Record<string, unknown> = {
      predictorAddress: normalizedAddress,
    };

    if (!includeInactive) {
      filter.isActive = true;
    }

    const signals = await Signal.find(filter)
      .select(SignalService.PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .populate("categoryId", "name slug icon");

    return signals as unknown as PublicSignal[];
  }

  /**
   * Checks if a signal exists by contentId.
   *
   * @param contentId - The signal's unique content ID
   * @returns Promise resolving to true if signal exists
   */
  static async exists(contentId: string): Promise<boolean> {
    const count = await Signal.countDocuments({ contentId });
    return count > 0;
  }

  /**
   * Gets the predictor address for a signal.
   * Useful for verifying ownership without fetching full signal.
   *
   * @param contentId - The signal's unique content ID
   * @returns Promise resolving to predictor address or null
   */
  static async getPredictorAddress(contentId: string): Promise<string | null> {
    const signal = await Signal.findOne({ contentId }).select("predictorAddress");
    return signal?.predictorAddress ?? null;
  }
}
