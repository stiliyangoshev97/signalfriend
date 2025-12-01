/**
 * @fileoverview Business logic service for Report operations.
 *
 * Provides operations for reports including:
 * - Creating reports (one per purchase, enforced by tokenId)
 * - Listing reports for signals and predictors
 * - Checking if a purchase has been reported
 * - Report statistics for predictors
 *
 * Key constraint: Only buyers who own a SignalKeyNFT can report.
 * One report per tokenId ensures one report per purchase.
 * Separate from ratings - buyer can rate AND report independently.
 *
 * @module features/reports/report.service
 */
import { Report, IReport } from "./report.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { Signal } from "../signals/signal.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type {
  CreateReportInput,
  ListSignalReportsQuery,
  ListPredictorReportsQuery,
} from "./report.schemas.js";

/** Report list response with pagination metadata */
export interface ReportListResponse {
  reports: IReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Report statistics for a predictor */
export interface PredictorReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  reportsByReason: Record<string, number>;
}

/**
 * Service class for Report business logic.
 * All methods are static for stateless operation.
 */
export class ReportService {
  /**
   * Creates a new report for a purchased signal.
   * Validates that the caller owns the receipt (SignalKeyNFT).
   *
   * @param data - Report creation data
   * @param reporterAddress - Address of the reporter (must own tokenId)
   * @returns Promise resolving to the created report
   * @throws {ApiError} 404 if receipt not found
   * @throws {ApiError} 403 if caller doesn't own the receipt
   * @throws {ApiError} 409 if report already exists for this tokenId
   */
  static async create(
    data: CreateReportInput,
    reporterAddress: string
  ): Promise<IReport> {
    const normalizedReporter = reporterAddress.toLowerCase();

    // Find the receipt to verify ownership
    const receipt = await Receipt.findOne({ tokenId: data.tokenId });
    if (!receipt) {
      throw ApiError.notFound(
        `Receipt with tokenId '${data.tokenId}' not found`
      );
    }

    // Verify caller owns the receipt
    if (receipt.buyerAddress !== normalizedReporter) {
      throw ApiError.forbidden(
        "You can only report signals you have purchased"
      );
    }

    // Check if report already exists (should be caught by unique index too)
    const existing = await Report.findOne({ tokenId: data.tokenId });
    if (existing) {
      throw ApiError.conflict(
        "You have already reported this purchase"
      );
    }

    // Get signal info
    const signal = await Signal.findOne({ contentId: receipt.contentId });
    if (!signal) {
      throw ApiError.notFound("Signal associated with this receipt not found");
    }

    // Create report
    const report = new Report({
      tokenId: data.tokenId,
      signalId: signal._id,
      contentId: receipt.contentId,
      reporterAddress: normalizedReporter,
      predictorAddress: receipt.predictorAddress,
      reason: data.reason,
      description: data.description || "",
      status: "pending",
    });

    await report.save();

    return report;
  }

  /**
   * Gets a report by token ID.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @returns Promise resolving to the report or null
   */
  static async getByTokenId(tokenId: number): Promise<IReport | null> {
    return Report.findOne({ tokenId });
  }

  /**
   * Checks if a report exists for a token ID.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @returns Promise resolving to true if report exists
   */
  static async exists(tokenId: number): Promise<boolean> {
    const count = await Report.countDocuments({ tokenId });
    return count > 0;
  }

  /**
   * Gets reports for a specific signal with pagination.
   *
   * @param contentId - The signal's content ID
   * @param query - Query parameters for pagination
   * @returns Promise resolving to reports array with pagination metadata
   */
  static async getSignalReports(
    contentId: string,
    query: ListSignalReportsQuery
  ): Promise<ReportListResponse> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find({ contentId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-adminNotes"), // Hide admin notes from public
      Report.countDocuments({ contentId }),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gets reports for a specific predictor with pagination.
   *
   * @param predictorAddress - The predictor's wallet address
   * @param query - Query parameters for pagination and filtering
   * @returns Promise resolving to reports array with pagination metadata
   */
  static async getPredictorReports(
    predictorAddress: string,
    query: ListPredictorReportsQuery
  ): Promise<ReportListResponse> {
    const { page, limit, status } = query;
    const normalizedAddress = predictorAddress.toLowerCase();
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      predictorAddress: normalizedAddress,
    };

    if (status) {
      filter.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-adminNotes")
        .populate("signalId", "title contentId"),
      Report.countDocuments(filter),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gets the user's reports with pagination.
   *
   * @param reporterAddress - The user's wallet address
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise resolving to reports array with pagination
   */
  static async getMyReports(
    reporterAddress: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ReportListResponse> {
    const normalizedAddress = reporterAddress.toLowerCase();
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find({ reporterAddress: normalizedAddress })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-adminNotes")
        .populate("signalId", "title contentId"),
      Report.countDocuments({ reporterAddress: normalizedAddress }),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gets report statistics for a predictor.
   * Useful for displaying on predictor profiles.
   *
   * @param predictorAddress - The predictor's wallet address
   * @returns Promise resolving to report statistics
   */
  static async getPredictorStats(
    predictorAddress: string
  ): Promise<PredictorReportStats> {
    const normalizedAddress = predictorAddress.toLowerCase();

    const [statusCounts, reasonCounts] = await Promise.all([
      Report.aggregate([
        { $match: { predictorAddress: normalizedAddress } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Report.aggregate([
        { $match: { predictorAddress: normalizedAddress } },
        { $group: { _id: "$reason", count: { $sum: 1 } } },
      ]),
    ]);

    // Build status map
    const statusMap: Record<string, number> = {};
    for (const item of statusCounts) {
      statusMap[item._id] = item.count;
    }

    // Build reason map
    const reasonMap: Record<string, number> = {};
    for (const item of reasonCounts) {
      reasonMap[item._id] = item.count;
    }

    const totalReports =
      (statusMap.pending || 0) +
      (statusMap.reviewed || 0) +
      (statusMap.resolved || 0) +
      (statusMap.dismissed || 0);

    return {
      totalReports,
      pendingReports: statusMap.pending || 0,
      resolvedReports: statusMap.resolved || 0,
      dismissedReports: statusMap.dismissed || 0,
      reportsByReason: reasonMap,
    };
  }

  /**
   * Gets the total report count for a signal.
   * Useful for displaying warning indicators.
   *
   * @param contentId - The signal's content ID
   * @returns Promise resolving to report count
   */
  static async getSignalReportCount(contentId: string): Promise<number> {
    return Report.countDocuments({ contentId });
  }
}
