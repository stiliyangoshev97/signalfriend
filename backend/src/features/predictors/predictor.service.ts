/**
 * @fileoverview Business logic service for Predictor operations.
 *
 * Provides operations for predictors including:
 * - Listing with filtering, pagination, and sorting
 * - Profile retrieval and updates
 * - Internal creation from blockchain events
 * - Blacklist status updates
 * - Statistics recalculation
 *
 * @module features/predictors/predictor.service
 */
import mongoose from "mongoose";
import { Predictor, IPredictor } from "./predictor.model.js";
import { Category } from "../categories/category.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type {
  ListPredictorsQuery,
  UpdatePredictorProfileInput,
  CreatePredictorFromEventInput,
} from "./predictor.schemas.js";

/** Predictor list response with pagination metadata */
export interface PredictorListResponse {
  predictors: Partial<IPredictor>[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Public predictor data (without sensitive contact info) */
export interface PublicPredictor {
  _id: mongoose.Types.ObjectId;
  walletAddress: string;
  tokenId: number;
  displayName: string;
  bio: string;
  avatarUrl: string;
  socialLinks: {
    twitter?: string;
    // telegram and discord are hidden from public
  };
  // preferredContact is hidden from public
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

/**
 * Service class for Predictor business logic.
 * All methods are static for stateless operation.
 */
export class PredictorService {
  /**
   * Fields to exclude from public predictor responses.
   * Hides sensitive contact information.
   */
  private static readonly HIDDEN_FIELDS = "-socialLinks.telegram -socialLinks.discord -preferredContact";

  /**
   * Sanitizes a predictor document for public consumption.
   * Removes sensitive contact information.
   *
   * @param predictor - The predictor document to sanitize
   * @returns Sanitized predictor object
   */
  private static sanitizeForPublic(predictor: IPredictor): Partial<IPredictor> {
    const obj = predictor.toObject();
    
    // Only keep twitter in socialLinks
    if (obj.socialLinks) {
      obj.socialLinks = {
        twitter: obj.socialLinks.twitter,
      };
    }
    
    // Remove preferredContact
    delete obj.preferredContact;
    
    return obj;
  }

  /**
   * Retrieves predictors with filtering, pagination, and sorting.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Promise resolving to predictors array with pagination metadata
   */
  static async getAll(query: ListPredictorsQuery): Promise<PredictorListResponse> {
    const {
      categoryId,
      active,
      sortBy,
      sortOrder,
      page,
      limit,
      search,
    } = query;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Filter out blacklisted predictors if active=true
    if (active) {
      filter.isBlacklisted = false;
    }

    // Filter by category
    if (categoryId) {
      filter.categoryIds = categoryId;
    }

    // Search by display name (case-insensitive)
    if (search) {
      filter.displayName = { $regex: search, $options: "i" };
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination (exclude sensitive contact info)
    const [predictors, total] = await Promise.all([
      Predictor.find(filter)
        .select(PredictorService.HIDDEN_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("categoryIds", "name slug icon"),
      Predictor.countDocuments(filter),
    ]);

    return {
      predictors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single predictor by wallet address.
   * Returns sanitized data without sensitive contact info.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to the predictor document (sanitized)
   * @throws {ApiError} 404 if predictor not found
   */
  static async getByAddress(address: string): Promise<Partial<IPredictor>> {
    const normalizedAddress = address.toLowerCase();
    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress })
      .select(PredictorService.HIDDEN_FIELDS)
      .populate("categoryIds", "name slug icon");

    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    return predictor;
  }

  /**
   * Retrieves a single predictor by their PredictorAccessPass token ID.
   *
   * @param tokenId - The NFT token ID
   * @returns Promise resolving to the predictor document
   * @throws {ApiError} 404 if predictor not found
   */
  static async getByTokenId(tokenId: number): Promise<IPredictor> {
    const predictor = await Predictor.findOne({ tokenId })
      .populate("categoryIds", "name slug icon");

    if (!predictor) {
      throw ApiError.notFound(`Predictor with tokenId '${tokenId}' not found`);
    }

    return predictor;
  }

  /**
   * Updates a predictor's profile.
   * Only allows updating non-critical fields (display info, social links).
   * 
   * Rules:
   * - displayName can only be changed ONCE (then locked forever)
   * - avatarUrl can be set by any predictor (abuse = blacklist)
   *
   * @param address - The predictor's wallet address
   * @param data - Fields to update
   * @param callerAddress - Address of the caller (must match predictor)
   * @returns Promise resolving to the updated predictor document
   * @throws {ApiError} 404 if predictor not found
   * @throws {ApiError} 403 if caller is not the predictor
   * @throws {ApiError} 403 if trying to change locked displayName
   * @throws {ApiError} 409 if displayName is already taken
   */
  static async updateProfile(
    address: string,
    data: UpdatePredictorProfileInput,
    callerAddress: string
  ): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();
    const normalizedCaller = callerAddress.toLowerCase();

    // Verify caller is the predictor
    if (normalizedAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only update your own profile");
    }

    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    // Check if predictor is blacklisted
    if (predictor.isBlacklisted) {
      throw ApiError.forbidden("Blacklisted predictors cannot update their profile");
    }

    // Validate category IDs if provided
    if (data.categoryIds && data.categoryIds.length > 0) {
      const validCategories = await Category.countDocuments({
        _id: { $in: data.categoryIds },
        isActive: true,
      });
      if (validCategories !== data.categoryIds.length) {
        throw ApiError.badRequest("One or more category IDs are invalid");
      }
    }

    // Handle displayName update (can only change once)
    if (data.displayName !== undefined) {
      if (predictor.displayNameChanged) {
        throw ApiError.forbidden("Display name can only be changed once and is now locked");
      }
      
      // Check if new displayName is different from current
      if (data.displayName !== predictor.displayName) {
        // Check uniqueness (case-insensitive)
        const existing = await Predictor.findOne({
          displayName: { $regex: new RegExp(`^${data.displayName}$`, "i") },
          _id: { $ne: predictor._id },
        });
        if (existing) {
          throw ApiError.conflict(`Display name '${data.displayName}' is already taken`);
        }
        predictor.displayName = data.displayName;
        predictor.displayNameChanged = true;
      }
    }

    // Handle avatarUrl update (all predictors can set avatar)
    if (data.avatarUrl !== undefined && data.avatarUrl !== "") {
      predictor.avatarUrl = data.avatarUrl;
    } else if (data.avatarUrl === "") {
      // Allow clearing avatar
      predictor.avatarUrl = "";
    }

    // Update other allowed fields
    if (data.bio !== undefined) predictor.bio = data.bio;
    if (data.socialLinks !== undefined) {
      predictor.socialLinks = {
        ...predictor.socialLinks,
        ...data.socialLinks,
      };
    }
    if (data.preferredContact !== undefined) {
      predictor.preferredContact = data.preferredContact;
    }
    if (data.categoryIds !== undefined) {
      predictor.categoryIds = data.categoryIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    await predictor.save();
    return predictor.populate("categoryIds", "name slug icon");
  }

  /**
   * Creates a new predictor from a PredictorJoined blockchain event.
   * Called by the webhook service when indexing events.
   *
   * @param data - Event data for the new predictor
   * @returns Promise resolving to the created predictor document
   * @throws {ApiError} 409 if predictor already exists
   */
  static async createFromEvent(data: CreatePredictorFromEventInput): Promise<IPredictor> {
    const normalizedAddress = data.walletAddress.toLowerCase();

    // Check if already exists
    const existing = await Predictor.findOne({
      $or: [
        { walletAddress: normalizedAddress },
        { tokenId: data.tokenId },
      ],
    });

    if (existing) {
      throw ApiError.conflict(`Predictor already exists for address '${data.walletAddress}'`);
    }

    // Create with default values
    const predictor = new Predictor({
      walletAddress: normalizedAddress,
      tokenId: data.tokenId,
      displayName: `Predictor #${data.tokenId}`,
      bio: "",
      avatarUrl: "",
      socialLinks: {},
      categoryIds: [],
      totalSignals: 0,
      totalSales: 0,
      averageRating: 0,
      totalReviews: 0,
      isBlacklisted: false,
      joinedAt: data.joinedAt,
    });

    await predictor.save();
    return predictor;
  }

  /**
   * Updates a predictor's blacklist status.
   * Called by the webhook service when PredictorBlacklisted event is received.
   *
   * @param address - The predictor's wallet address
   * @param isBlacklisted - New blacklist status
   * @returns Promise resolving to the updated predictor document
   * @throws {ApiError} 404 if predictor not found
   */
  static async updateBlacklistStatus(
    address: string,
    isBlacklisted: boolean
  ): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { isBlacklisted },
      { new: true }
    );

    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    return predictor;
  }

  /**
   * Increments a predictor's signal count.
   * Called when a new signal is created.
   *
   * @param address - The predictor's wallet address
   */
  static async incrementSignalCount(address: string): Promise<void> {
    const normalizedAddress = address.toLowerCase();
    await Predictor.updateOne(
      { walletAddress: normalizedAddress },
      { $inc: { totalSignals: 1 } }
    );
  }

  /**
   * Increments a predictor's sales count.
   * Called when a signal is purchased.
   *
   * @param address - The predictor's wallet address
   */
  static async incrementSalesCount(address: string): Promise<void> {
    const normalizedAddress = address.toLowerCase();
    await Predictor.updateOne(
      { walletAddress: normalizedAddress },
      { $inc: { totalSales: 1 } }
    );
  }

  /**
   * Updates a predictor's rating statistics.
   * Called when a new review is submitted.
   *
   * @param address - The predictor's wallet address
   * @param newRating - The new rating score (1-5)
   */
  static async updateRatingStats(address: string, newRating: number): Promise<void> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) return;

    // Calculate new average
    const totalReviews = predictor.totalReviews + 1;
    const currentSum = predictor.averageRating * predictor.totalReviews;
    const newAverage = (currentSum + newRating) / totalReviews;

    await Predictor.updateOne(
      { walletAddress: normalizedAddress },
      {
        averageRating: Math.round(newAverage * 10) / 10, // Round to 1 decimal
        totalReviews,
      }
    );
  }

  /**
   * Checks if an address is a registered predictor.
   *
   * @param address - The wallet address to check
   * @returns Promise resolving to true if predictor exists and is not blacklisted
   */
  static async isActivePredictor(address: string): Promise<boolean> {
    const normalizedAddress = address.toLowerCase();
    const count = await Predictor.countDocuments({
      walletAddress: normalizedAddress,
      isBlacklisted: false,
    });
    return count > 0;
  }

  /**
   * Gets the top predictors by a specific metric.
   * Returns sanitized data without sensitive contact info.
   *
   * @param metric - The metric to sort by
   * @param limit - Number of predictors to return
   * @returns Promise resolving to array of top predictors
   */
  static async getTopPredictors(
    metric: "totalSales" | "averageRating" | "totalSignals" = "totalSales",
    limit: number = 10
  ): Promise<Partial<IPredictor>[]> {
    return Predictor.find({ isBlacklisted: false })
      .select(PredictorService.HIDDEN_FIELDS)
      .sort({ [metric]: -1 })
      .limit(limit)
      .populate("categoryIds", "name slug icon");
  }

  /**
   * Calculates the total earnings for a predictor from signal sales.
   * Earnings = 95% of total signal sales (5% platform commission).
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to earnings summary
   */
  static async getEarnings(address: string): Promise<{
    totalSalesRevenue: number;
    predictorEarnings: number;
    platformCommission: number;
    totalSalesCount: number;
  }> {
    const normalizedAddress = address.toLowerCase();

    // Verify predictor exists
    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    // Aggregate all receipts for this predictor
    const result = await Receipt.aggregate([
      { $match: { predictorAddress: normalizedAddress } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$priceUsdt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSalesRevenue = result[0]?.totalRevenue || 0;
    const totalSalesCount = result[0]?.count || 0;

    // Calculate predictor earnings (95% of sales, 5% platform commission)
    const platformCommission = totalSalesRevenue * 0.05;
    const predictorEarnings = totalSalesRevenue * 0.95;

    return {
      totalSalesRevenue: Math.round(totalSalesRevenue * 100) / 100,
      predictorEarnings: Math.round(predictorEarnings * 100) / 100,
      platformCommission: Math.round(platformCommission * 100) / 100,
      totalSalesCount,
    };
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  /**
   * Retrieves a predictor's full profile including sensitive contact info.
   * Admin-only method.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to full predictor document
   * @throws {ApiError} 404 if predictor not found
   */
  static async getByAddressAdmin(address: string): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();
    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress })
      .populate("categoryIds", "name slug icon");

    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    return predictor;
  }

  /**
   * Blacklists a predictor in the database.
   * Admin-only method. Note: This is a backend-only blacklist.
   * For full effect, also blacklist on-chain via MultiSig.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to the updated predictor
   * @throws {ApiError} 404 if predictor not found
   */
  static async adminBlacklist(address: string): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { isBlacklisted: true },
      { new: true }
    );

    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    return predictor;
  }

  /**
   * Removes blacklist status from a predictor in the database.
   * Admin-only method. Note: This is a backend-only unblacklist.
   * For full effect, also unblacklist on-chain via MultiSig.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to the updated predictor
   * @throws {ApiError} 404 if predictor not found
   */
  static async adminUnblacklist(address: string): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { isBlacklisted: false },
      { new: true }
    );

    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    return predictor;
  }

  // ============================================================================
  // VERIFICATION METHODS
  // ============================================================================

  /** Minimum sales required to apply for verification */
  private static readonly MIN_SALES_FOR_VERIFICATION = 100;

  /**
   * Applies for profile verification.
   * Requirements:
   * - At least 100 sales
   * - Not currently pending
   * - If rejected, must have 100 more sales since last application
   *
   * @param address - The predictor's wallet address
   * @param callerAddress - Address of the caller (must match predictor)
   * @returns Promise resolving to the updated predictor
   * @throws {ApiError} 404 if predictor not found
   * @throws {ApiError} 403 if caller is not the predictor
   * @throws {ApiError} 400 if requirements not met
   */
  static async applyForVerification(
    address: string,
    callerAddress: string
  ): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();
    const normalizedCaller = callerAddress.toLowerCase();

    // Verify caller is the predictor
    if (normalizedAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only apply for verification for your own profile");
    }

    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    // Check if already verified
    if (predictor.isVerified) {
      throw ApiError.badRequest("Profile is already verified");
    }

    // Check if already pending
    if (predictor.verificationStatus === "pending") {
      throw ApiError.badRequest("Verification application is already pending");
    }

    // Check minimum sales requirement
    if (predictor.totalSales < PredictorService.MIN_SALES_FOR_VERIFICATION) {
      throw ApiError.badRequest(
        `You need at least ${PredictorService.MIN_SALES_FOR_VERIFICATION} sales to apply for verification. Current: ${predictor.totalSales}`
      );
    }

    // If previously rejected, check if enough new sales since last application
    if (predictor.verificationStatus === "rejected") {
      const salesSinceLastApplication = predictor.totalSales - predictor.salesAtLastApplication;
      if (salesSinceLastApplication < PredictorService.MIN_SALES_FOR_VERIFICATION) {
        const salesNeeded = PredictorService.MIN_SALES_FOR_VERIFICATION - salesSinceLastApplication;
        throw ApiError.badRequest(
          `You need ${salesNeeded} more sales to re-apply after rejection. Sales since last application: ${salesSinceLastApplication}`
        );
      }
    }

    // Apply for verification
    predictor.verificationStatus = "pending";
    predictor.salesAtLastApplication = predictor.totalSales;
    predictor.verificationAppliedAt = new Date();

    await predictor.save();
    return predictor;
  }

  /**
   * Gets all pending verification requests.
   * Admin-only method.
   *
   * @returns Promise resolving to array of predictors with pending verification
   */
  static async getPendingVerifications(): Promise<IPredictor[]> {
    return Predictor.find({ verificationStatus: "pending" })
      .sort({ verificationAppliedAt: 1 }) // Oldest first
      .populate("categoryIds", "name slug icon");
  }

  /**
   * Approves a predictor's verification request.
   * Admin-only method.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to the updated predictor
   * @throws {ApiError} 404 if predictor not found
   * @throws {ApiError} 400 if no pending application
   */
  static async adminVerify(address: string): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    if (predictor.verificationStatus !== "pending") {
      throw ApiError.badRequest("No pending verification application for this predictor");
    }

    predictor.isVerified = true;
    predictor.verificationStatus = "none"; // Reset status
    
    await predictor.save();
    return predictor;
  }

  /**
   * Rejects a predictor's verification request.
   * Admin-only method.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to the updated predictor
   * @throws {ApiError} 404 if predictor not found
   * @throws {ApiError} 400 if no pending application
   */
  static async adminRejectVerification(address: string): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    if (predictor.verificationStatus !== "pending") {
      throw ApiError.badRequest("No pending verification application for this predictor");
    }

    predictor.verificationStatus = "rejected";
    predictor.salesAtLastApplication = predictor.totalSales; // Record sales at rejection
    
    await predictor.save();
    return predictor;
  }

  /**
   * Removes verification status from a predictor.
   * Admin-only method.
   *
   * @param address - The predictor's wallet address
   * @returns Promise resolving to the updated predictor
   * @throws {ApiError} 404 if predictor not found
   * @throws {ApiError} 400 if predictor is not verified
   */
  static async adminUnverify(address: string): Promise<IPredictor> {
    const normalizedAddress = address.toLowerCase();

    const predictor = await Predictor.findOne({ walletAddress: normalizedAddress });
    if (!predictor) {
      throw ApiError.notFound(`Predictor with address '${address}' not found`);
    }

    if (!predictor.isVerified) {
      throw ApiError.badRequest("Predictor is not verified");
    }

    predictor.isVerified = false;
    predictor.verificationStatus = "none"; // Reset status
    // Note: Avatar is NOT removed - all predictors can have avatars now
    
    await predictor.save();
    return predictor;
  }
}
