/**
 * @fileoverview Business logic service for Dispute operations.
 *
 * Disputes allow blacklisted predictors to appeal their status.
 * Design:
 * - Predictor must be blacklisted to create a dispute
 * - Only one dispute per predictor (prevents spam)
 * - No explanation field - admin contacts via preferred method
 * - Admin manages status: pending → contacted → resolved/rejected
 *
 * Flow:
 * 1. Admin blacklists predictor
 * 2. Admin contacts predictor via Telegram/Discord to explain
 * 3. Predictor clicks "Dispute" button on dashboard
 * 4. Admin sees dispute notification
 * 5. Admin contacts predictor if not obvious scam
 * 6. Admin resolves (unblacklist) or rejects dispute
 *
 * @module features/disputes/dispute.service
 */
import { Dispute, IDispute } from "./dispute.model.js";
import { Predictor } from "../predictors/predictor.model.js";
import { PredictorService } from "../predictors/predictor.service.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type { ListDisputesQuery } from "./dispute.schemas.js";

/** Dispute with populated predictor info for admin view */
export interface DisputeWithPredictor {
  _id: string;
  predictorAddress: string;
  status: "pending" | "contacted" | "resolved" | "rejected";
  adminNotes: string;
  createdAt: Date;
  resolvedAt?: Date;
  predictor?: {
    displayName: string;
    walletAddress: string;
    preferredContact: string;
    socialLinks: {
      telegram?: string;
      discord?: string;
    };
    totalSales: number;
    totalSignals: number;
  };
}

/** Disputes list response with pagination */
export interface DisputesListResponse {
  disputes: DisputeWithPredictor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service class for Dispute business logic.
 * All methods are static for stateless operation.
 */
export class DisputeService {
  /**
   * Creates a dispute for a blacklisted predictor.
   * Simple action - just creates a flag, no explanation needed.
   *
   * @param predictorAddress - Wallet address of the predictor
   * @returns Promise resolving to the created dispute
   * @throws {ApiError} 404 if predictor not found
   * @throws {ApiError} 400 if predictor is not blacklisted
   * @throws {ApiError} 409 if dispute already exists
   */
  static async create(predictorAddress: string): Promise<IDispute> {
    const normalizedAddress = predictorAddress.toLowerCase();

    // Check predictor exists and is blacklisted
    const predictor = await Predictor.findOne({
      walletAddress: normalizedAddress,
    });

    if (!predictor) {
      throw ApiError.notFound("Predictor not found");
    }

    if (!predictor.isBlacklisted) {
      throw ApiError.badRequest(
        "Only blacklisted predictors can submit a dispute"
      );
    }

    // Check if dispute already exists
    const existing = await Dispute.findOne({
      predictorAddress: normalizedAddress,
    });

    if (existing) {
      throw ApiError.conflict(
        "You have already submitted a dispute. Wait for admin response."
      );
    }

    // Create dispute
    const dispute = new Dispute({
      predictorAddress: normalizedAddress,
      status: "pending",
    });

    await dispute.save();

    return dispute;
  }

  /**
   * Gets a dispute by predictor address.
   *
   * @param predictorAddress - Wallet address of the predictor
   * @returns Promise resolving to the dispute or null
   */
  static async getByPredictor(
    predictorAddress: string
  ): Promise<IDispute | null> {
    return Dispute.findOne({
      predictorAddress: predictorAddress.toLowerCase(),
    });
  }

  /**
   * Checks if a predictor has a pending or contacted dispute.
   *
   * @param predictorAddress - Wallet address of the predictor
   * @returns Promise resolving to true if active dispute exists
   */
  static async hasActiveDispute(predictorAddress: string): Promise<boolean> {
    const count = await Dispute.countDocuments({
      predictorAddress: predictorAddress.toLowerCase(),
      status: { $in: ["pending", "contacted"] },
    });
    return count > 0;
  }

  /**
   * Lists all disputes for admin review with predictor info.
   *
   * @param query - Query options (pagination, status filter)
   * @returns Promise resolving to disputes array with pagination
   */
  static async listForAdmin(
    query: ListDisputesQuery
  ): Promise<DisputesListResponse> {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    // Get disputes
    const [disputes, total] = await Promise.all([
      Dispute.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Dispute.countDocuments(filter),
    ]);

    // Get predictor info for each dispute
    const predictorAddresses = disputes.map((d) => d.predictorAddress);
    const predictors = await Predictor.find({
      walletAddress: { $in: predictorAddresses },
    })
      .select(
        "displayName walletAddress preferredContact socialLinks totalSales totalSignals"
      )
      .lean();

    const predictorMap = new Map(
      predictors.map((p) => [p.walletAddress, p])
    );

    // Transform disputes to include predictor info
    const disputesWithPredictor: DisputeWithPredictor[] = disputes.map(
      (dispute) => {
        const predictor = predictorMap.get(dispute.predictorAddress);
        return {
          _id: dispute._id.toString(),
          predictorAddress: dispute.predictorAddress,
          status: dispute.status,
          adminNotes: dispute.adminNotes,
          createdAt: dispute.createdAt,
          resolvedAt: dispute.resolvedAt,
          predictor: predictor
            ? {
                displayName: predictor.displayName,
                walletAddress: predictor.walletAddress,
                preferredContact: predictor.preferredContact,
                socialLinks: {
                  telegram: predictor.socialLinks?.telegram,
                  discord: predictor.socialLinks?.discord,
                },
                totalSales: predictor.totalSales,
                totalSignals: predictor.totalSignals,
              }
            : undefined,
        };
      }
    );

    return {
      disputes: disputesWithPredictor,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates a dispute's status.
   * Admin can mark as contacted, resolved, or rejected.
   *
   * @param disputeId - MongoDB document ID
   * @param status - New status
   * @param adminNotes - Optional admin notes
   * @returns Promise resolving to updated dispute
   * @throws {ApiError} 404 if dispute not found
   */
  static async updateStatus(
    disputeId: string,
    status: "pending" | "contacted" | "resolved" | "rejected",
    adminNotes?: string
  ): Promise<IDispute> {
    const update: Record<string, unknown> = { status };

    if (adminNotes !== undefined) {
      update.adminNotes = adminNotes;
    }

    // Set resolvedAt for terminal states
    if (status === "resolved" || status === "rejected") {
      update.resolvedAt = new Date();
    }

    const dispute = await Dispute.findByIdAndUpdate(disputeId, update, {
      new: true,
    });

    if (!dispute) {
      throw ApiError.notFound(`Dispute with ID '${disputeId}' not found`);
    }

    return dispute;
  }

  /**
   * Resolves a dispute by unblacklisting the predictor.
   * Sets dispute status to "resolved" and unblacklists in DB.
   *
   * @param disputeId - MongoDB document ID
   * @param adminNotes - Optional admin notes
   * @returns Promise resolving to updated dispute
   * @throws {ApiError} 404 if dispute not found
   */
  static async resolve(
    disputeId: string,
    adminNotes?: string
  ): Promise<IDispute> {
    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      throw ApiError.notFound(`Dispute with ID '${disputeId}' not found`);
    }

    // Unblacklist the predictor
    await PredictorService.adminUnblacklist(dispute.predictorAddress);

    // Update dispute status
    dispute.status = "resolved";
    dispute.resolvedAt = new Date();
    if (adminNotes) {
      dispute.adminNotes = adminNotes;
    }

    await dispute.save();

    return dispute;
  }

  /**
   * Gets counts of disputes by status for dashboard.
   *
   * @returns Promise resolving to counts object
   */
  static async getCounts(): Promise<Record<string, number>> {
    const [pending, contacted, resolved, rejected] = await Promise.all([
      Dispute.countDocuments({ status: "pending" }),
      Dispute.countDocuments({ status: "contacted" }),
      Dispute.countDocuments({ status: "resolved" }),
      Dispute.countDocuments({ status: "rejected" }),
    ]);

    return {
      pending,
      contacted,
      resolved,
      rejected,
      total: pending + contacted + resolved + rejected,
    };
  }
}
