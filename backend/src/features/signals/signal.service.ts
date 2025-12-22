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
import { uuidToBytes32 } from "../../shared/utils/contentId.js";
import { containsUrl } from "../../shared/utils/textValidation.js";
import { isAdmin } from "../../shared/middleware/admin.js";
import type {
  ListSignalsQuery,
  CreateSignalInput,
  UpdateSignalInput,
} from "./signal.schemas.js";

/** Transformed signal for API response (with category/predictor instead of categoryId/predictorId) */
export interface TransformedSignal {
  _id: mongoose.Types.ObjectId;
  contentId: string;
  predictorAddress: string;
  title: string;
  description: string;
  priceUsdt: number;
  expiresAt: Date;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string; slug: string; icon?: string; mainGroup?: string } | null;
  predictor: { displayName?: string; avatarUrl?: string; averageRating?: number; walletAddress?: string } | null;
}

/** Signal list response with pagination metadata */
export interface SignalListResponse {
  signals: TransformedSignal[];
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
  expiresAt: Date;
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
      mainGroup,
      predictorAddress,
      excludeBuyerAddress,
      active,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
      search,
      minPrice,
      maxPrice,
      riskLevel,
      potentialReward,
    } = query;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Filter by signal status (new 'status' param takes precedence over deprecated 'active')
    // 'active' = isActive: true AND not expired
    // 'inactive' = isActive: false OR expired
    // 'all' = no status filter
    if (status === "active" || (status === undefined && active)) {
      filter.isActive = true;
      filter.expiresAt = { $gt: new Date() }; // Only non-expired signals
    } else if (status === "inactive") {
      // Inactive means: deactivated OR expired
      filter.$or = [
        { isActive: false },
        { expiresAt: { $lte: new Date() } },
      ];
    }
    // status === "all" means no filter on isActive or expiresAt

    // Handle predictor filtering with blacklist check
    if (predictorAddress) {
      // If requesting a specific predictor's signals, check if they're blacklisted
      const predictor = await Predictor.findOne({ 
        walletAddress: predictorAddress.toLowerCase() 
      }).lean();
      
      if (predictor?.isBlacklisted) {
        // Blacklisted predictor - return empty results
        return {
          signals: [],
          pagination: {
            total: 0,
            page: page || 1,
            limit: limit || 12,
            totalPages: 0,
          },
        };
      }
      filter.predictorAddress = predictorAddress.toLowerCase();
    } else {
      // General listing - exclude all blacklisted predictors
      const blacklistedPredictors = await Predictor.find(
        { isBlacklisted: true },
        { walletAddress: 1 }
      ).lean();
      if (blacklistedPredictors.length > 0) {
        const blacklistedAddresses = blacklistedPredictors.map((p) => p.walletAddress);
        filter.predictorAddress = { $nin: blacklistedAddresses };
      }
    }

    // Filter by category
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Filter by main category group (when no specific subcategory is selected)
    if (mainGroup && !categoryId) {
      filter.mainGroup = mainGroup;
    }

    // Exclude signals already purchased by this buyer
    if (excludeBuyerAddress) {
      const normalizedBuyer = excludeBuyerAddress.toLowerCase();
      // Get all contentIds this buyer has purchased
      const purchasedContentIds = await Receipt.distinct("contentId", {
        buyerAddress: normalizedBuyer,
      });
      if (purchasedContentIds.length > 0) {
        filter.contentId = { $nin: purchasedContentIds };
      }
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

    // Filter by risk level
    if (riskLevel) {
      filter.riskLevel = riskLevel;
    }

    // Filter by potential reward
    if (potentialReward) {
      filter.potentialReward = potentialReward;
    }

    // Build sort based on whether user explicitly selected a sort option
    const sort: Record<string, 1 | -1> = {};
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    if (sortBy === undefined) {
      // No explicit sort selected - use quality-first default
      // This ensures the best signals appear first on initial page load
      sort.averageRating = -1;  // Best rated first
      sort.totalSales = -1;     // Most sales second
      sort.totalReviews = -1;   // More reviews = more credible
      sort.createdAt = -1;      // Newest as final tiebreaker
    } else {
      // User explicitly selected a sort - respect their choice as primary
      // Add intelligent tiebreakers when primary values are equal
      sort[sortBy] = sortDirection;

      switch (sortBy) {
        case "averageRating":
          sort.totalReviews = -1;  // More reviews = more credible rating
          sort.totalSales = -1;
          sort.createdAt = -1;
          break;
        case "totalSales":
          sort.averageRating = -1;
          sort.totalReviews = -1;
          sort.createdAt = -1;
          break;
        case "priceUsdt":
          // Same price? Show better rated first
          sort.averageRating = -1;
          sort.totalSales = -1;
          sort.createdAt = -1;
          break;
        case "createdAt":
          // Same date? Show better rated first
          sort.averageRating = -1;
          sort.totalSales = -1;
          break;
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination (exclude protected content)
    const [rawSignals, total] = await Promise.all([
      Signal.find(filter)
        .select(SignalService.PUBLIC_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name slug icon mainGroup")
        .populate("predictorId", "displayName avatarUrl averageRating isBlacklisted isVerified")
        .lean(),
      Signal.countDocuments(filter),
    ]);

    // Transform field names for frontend compatibility
    // Backend uses categoryId/predictorId, frontend expects category/predictor
    const signals = rawSignals.map((signal) => {
      const { categoryId, predictorId, ...rest } = signal as Record<string, unknown>;
      return {
        ...rest,
        category: categoryId || null,
        predictor: predictorId || null,
      } as TransformedSignal;
    });

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
  static async getByContentId(contentId: string): Promise<Record<string, unknown>> {
    const rawSignal = await Signal.findOne({ contentId })
      .select(SignalService.PUBLIC_FIELDS)
      .populate("categoryId", "name slug icon mainGroup")
      .populate("predictorId", "displayName avatarUrl averageRating totalSales totalReviews bio isVerified verificationStatus walletAddress isBlacklisted")
      .lean();

    if (!rawSignal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    // Transform field names for frontend compatibility
    const { categoryId, predictorId, ...rest } = rawSignal as Record<string, unknown>;
    return {
      ...rest,
      category: categoryId || null,
      predictor: predictorId || null,
    };
  }

  /**
   * Retrieves the protected content of a signal.
   * Accessible to:
   * - The predictor (creator) of the signal
   * - Users who have purchased the signal (own a receipt)
   * - Admin wallets (MultiSig signers)
   *
   * @param contentId - The signal's unique content ID
   * @param buyerAddress - Address of the user requesting content
   * @returns Promise resolving to the protected content
   * @throws {ApiError} 404 if signal not found
   * @throws {ApiError} 403 if user has not purchased the signal and is not admin
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

    // Check if the user is an admin (MultiSig signer)
    if (isAdmin(normalizedBuyer)) {
      return { content: signal.content };
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
   * Gets the bytes32 contentIdentifier for use in on-chain purchases.
   * The frontend needs this value to call buySignalNFT on the smart contract.
   *
   * Only returns contentIdentifier for active, non-expired signals.
   * Blocks predictors from purchasing their own signals.
   *
   * @param contentId - The signal's UUID contentId
   * @param callerAddress - The address of the user requesting the content identifier (optional, for self-purchase check)
   * @returns Promise resolving to the bytes32 hex string
   * @throws {ApiError} 404 if signal not found
   * @throws {ApiError} 400 if signal is inactive, expired, or caller is the predictor
   *
   * @example
   * // UUID: "550e8400-e29b-41d4-a716-446655440000"
   * // Returns: "0x550e8400e29b41d4a7164466554400000000000000000000000000000000"
   */
  static async getContentIdentifier(
    contentId: string,
    callerAddress?: string
  ): Promise<{ contentIdentifier: string }> {
    // Verify signal exists
    const signal = await Signal.findOne({ contentId });
    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    // Block purchase of inactive signals
    if (!signal.isActive) {
      throw ApiError.badRequest("This signal has been deactivated and cannot be purchased");
    }

    // Block purchase of expired signals
    if (signal.expiresAt && signal.expiresAt < new Date()) {
      throw ApiError.badRequest("This signal has expired and cannot be purchased");
    }

    // Block predictors from purchasing their own signals
    if (callerAddress && signal.predictorAddress.toLowerCase() === callerAddress.toLowerCase()) {
      throw ApiError.badRequest("You cannot purchase your own signal");
    }

    // Block purchase from blacklisted predictors
    const predictor = await Predictor.findOne({ walletAddress: signal.predictorAddress });
    if (predictor?.isBlacklisted) {
      throw ApiError.badRequest("This signal cannot be purchased because the predictor has been blacklisted");
    }

    // Convert UUID to bytes32 for on-chain use
    const contentIdentifier = uuidToBytes32(contentId);

    return { contentIdentifier };
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

    // First check if predictor exists
    const predictor = await Predictor.findOne({
      walletAddress: normalizedAddress,
    });

    if (!predictor) {
      throw ApiError.forbidden(
        "Only active predictors can create signals. You must hold a PredictorAccessPass NFT."
      );
    }

    // Check blacklist status separately for better error message
    if (predictor.isBlacklisted) {
      throw ApiError.forbidden(
        "Your account has been blacklisted. You cannot create new signals. If you believe this is an error, please submit a dispute from your dashboard."
      );
    }

    // Validate no URLs in signal content (security measure)
    if (containsUrl(data.title)) {
      throw ApiError.badRequest("Signal title cannot contain links or URLs");
    }
    if (containsUrl(data.description)) {
      throw ApiError.badRequest("Signal description cannot contain links or URLs");
    }
    if (containsUrl(data.content)) {
      throw ApiError.badRequest("Signal content cannot contain links or URLs");
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

    // Calculate expiry date from expiryDays
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiryDays);

    // Create signal with denormalized mainGroup for efficient filtering
    const signal = new Signal({
      contentId,
      predictorId: predictor._id,
      predictorAddress: normalizedAddress,
      title: data.title,
      description: data.description,
      content: data.content,
      categoryId: data.categoryId,
      mainGroup: category.mainGroup, // Denormalized for read performance
      priceUsdt: data.priceUsdt,
      expiresAt,
      riskLevel: data.riskLevel,
      potentialReward: data.potentialReward,
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
   * @param sortBy - Field to sort by (default: createdAt)
   * @param sortOrder - Sort direction (default: desc)
   * @returns Promise resolving to array of signals (public fields)
   */
  static async getByPredictor(
    predictorAddress: string,
    includeInactive: boolean = false,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<TransformedSignal[]> {
    const normalizedAddress = predictorAddress.toLowerCase();
    const filter: Record<string, unknown> = {
      predictorAddress: normalizedAddress,
    };

    if (!includeInactive) {
      filter.isActive = true;
    }

    // Build sort object
    const allowedSortFields = ["createdAt", "priceUsdt", "totalSales", "averageRating"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const rawSignals = await Signal.find(filter)
      .select(SignalService.PUBLIC_FIELDS)
      .sort({ [sortField]: sortDirection })
      .populate("categoryId", "name slug icon mainGroup")
      .populate("predictorId", "displayName avatarUrl averageRating isVerified")
      .lean();

    // Transform field names for frontend compatibility
    // Backend uses categoryId/predictorId, frontend expects category/predictor
    const signals = rawSignals.map((signal) => {
      const { categoryId, predictorId, ...rest } = signal as Record<string, unknown>;
      return {
        ...rest,
        category: categoryId || null,
        predictor: predictorId || null,
      } as TransformedSignal;
    });

    return signals;
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

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  /**
   * Deactivates a signal (admin action).
   * Sets isActive to false, hiding it from listings.
   * Admin should contact the predictor via their preferred contact method.
   *
   * @param contentId - The signal's unique content ID
   * @returns Promise resolving to the deactivated signal
   * @throws {ApiError} 404 if signal not found
   */
  static async adminDeactivate(contentId: string): Promise<PublicSignal> {
    const signal = await Signal.findOneAndUpdate(
      { contentId },
      { isActive: false },
      { new: true }
    )
      .select(SignalService.PUBLIC_FIELDS)
      .populate("categoryId", "name slug icon mainGroup");

    if (!signal) {
      throw ApiError.notFound(`Signal with contentId '${contentId}' not found`);
    }

    return signal as unknown as PublicSignal;
  }
}
