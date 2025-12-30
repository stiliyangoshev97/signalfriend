/**
 * @fileoverview Business logic service for Admin operations.
 *
 * Provides operations for admin-only features including:
 * - Platform earnings statistics (from joins, buyer fees, commissions)
 * - Reports management (list all, update status)
 *
 * Earnings calculation:
 * - Predictor joins: $20 per join (or $15 if referral, $5 to referrer)
 *   For simplicity, we calculate total predictors × $20 (platform received at least $15 each)
 * - Buyer access fees: $0.50 per purchase
 * - Commissions: 5% of each signal price
 *
 * @module features/admin/admin.service
 */
import { Predictor } from "../predictors/predictor.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { Report, IReport } from "../reports/report.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";

/** Platform fee constants (must match smart contract) */
const PLATFORM_FEES = {
  /** Predictor join fee in USDT */
  PREDICTOR_JOIN_FEE: 20,
  /** Referral bonus (paid from join fee to referrer) */
  REFERRAL_BONUS: 5,
  /** Buyer access fee per purchase in USDT */
  BUYER_ACCESS_FEE: 0.5,
  /** Platform commission rate (5% = 0.05) */
  COMMISSION_RATE: 0.05,
};

/** Platform earnings breakdown */
export interface PlatformEarnings {
  /** Earnings from predictor join fees (after referral bonuses) */
  fromPredictorJoins: number;
  /** Earnings from buyer access fees ($0.50 per purchase) */
  fromBuyerAccessFees: number;
  /** Earnings from commissions (5% of signal prices) */
  fromCommissions: number;
  /** Total platform earnings */
  total: number;
  /** Breakdown details */
  details: {
    totalPredictors: number;
    /** Predictors who joined WITH a paid referral (platform got $15) */
    predictorsWithReferral: number;
    /** Predictors who joined WITHOUT a referral (platform got $20) */
    predictorsWithoutReferral: number;
    totalPurchases: number;
    totalSignalVolume: number;
  };
}

/** Report with populated signal and predictor info */
export interface AdminReport {
  _id: string;
  tokenId: number;
  contentId: string;
  reporterAddress: string;
  predictorAddress: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  adminNotes: string;
  createdAt: Date;
  updatedAt: Date;
  signal?: {
    title: string;
    contentId: string;
    priceUsdt: number;
  };
  predictor?: {
    displayName: string;
    walletAddress: string;
    preferredContact: string;
    socialLinks: {
      telegram?: string;
      discord?: string;
    };
  };
}

/** Admin reports list response with pagination */
export interface AdminReportsResponse {
  reports: AdminReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Query options for listing reports */
export interface ListReportsQuery {
  page?: number;
  limit?: number;
  status?: "pending" | "reviewed" | "resolved" | "dismissed";
  predictorAddress?: string;
}

/**
 * Service class for Admin business logic.
 * All methods are static for stateless operation.
 */
export class AdminService {
  /**
   * Calculates platform earnings breakdown.
   *
   * Revenue sources:
   * 1. Predictor Joins: $20 fee, but $5 goes to referrer if valid referral
   *    - Predictors with referralPaid=true: platform got $15
   *    - Predictors without referral: platform got $20
   * 2. Buyer Access Fees: $0.50 flat fee per purchase
   * 3. Commissions: 5% of signal price
   *
   * @returns Promise resolving to platform earnings breakdown
   */
  static async getPlatformEarnings(): Promise<PlatformEarnings> {
    // Get predictor counts - split by referral status
    const [totalPredictors, predictorsWithReferral] = await Promise.all([
      Predictor.countDocuments(),
      Predictor.countDocuments({ referralPaid: true }),
    ]);
    const predictorsWithoutReferral = totalPredictors - predictorsWithReferral;

    // Get all receipts for calculating fees
    const receipts = await Receipt.find({}, { priceUsdt: 1 }).lean();
    const totalPurchases = receipts.length;

    // Calculate total signal volume (sum of all signal prices)
    const totalSignalVolume = receipts.reduce(
      (sum, receipt) => sum + receipt.priceUsdt,
      0
    );

    // Calculate earnings from predictor joins (accurate based on actual referral data)
    // - Predictors WITH paid referral: platform got $15 each ($20 - $5 referral bonus)
    // - Predictors WITHOUT referral: platform got full $20 each
    const fromPredictorJoins =
      (predictorsWithReferral * (PLATFORM_FEES.PREDICTOR_JOIN_FEE - PLATFORM_FEES.REFERRAL_BONUS)) +
      (predictorsWithoutReferral * PLATFORM_FEES.PREDICTOR_JOIN_FEE);

    const fromBuyerAccessFees =
      totalPurchases * PLATFORM_FEES.BUYER_ACCESS_FEE;

    const fromCommissions =
      totalSignalVolume * PLATFORM_FEES.COMMISSION_RATE;

    const total = fromPredictorJoins + fromBuyerAccessFees + fromCommissions;

    return {
      fromPredictorJoins: Math.round(fromPredictorJoins * 100) / 100,
      fromBuyerAccessFees: Math.round(fromBuyerAccessFees * 100) / 100,
      fromCommissions: Math.round(fromCommissions * 100) / 100,
      total: Math.round(total * 100) / 100,
      details: {
        totalPredictors,
        predictorsWithReferral,
        predictorsWithoutReferral,
        totalPurchases,
        totalSignalVolume: Math.round(totalSignalVolume * 100) / 100,
      },
    };
  }

  /**
   * Lists all reports for admin review with pagination.
   * Includes full signal and predictor details for context.
   *
   * @param query - Query options (pagination, status filter)
   * @returns Promise resolving to reports array with pagination
   */
  static async listReports(
    query: ListReportsQuery
  ): Promise<AdminReportsResponse> {
    const { page = 1, limit = 20, status, predictorAddress } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }
    if (predictorAddress) {
      filter.predictorAddress = predictorAddress.toLowerCase();
    }

    // Get reports with populated signal info
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate({
          path: "signalId",
          select: "title contentId priceUsdt",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    // Get predictor info for each report
    const predictorAddresses = [
      ...new Set(reports.map((r) => r.predictorAddress)),
    ];
    const predictors = await Predictor.find({
      walletAddress: { $in: predictorAddresses },
    })
      .select("displayName walletAddress preferredContact socialLinks")
      .lean();

    const predictorMap = new Map(
      predictors.map((p) => [p.walletAddress, p])
    );

    // Transform reports to include full details
    const adminReports: AdminReport[] = reports.map((report) => {
      const predictor = predictorMap.get(report.predictorAddress);
      const signal = report.signalId as unknown as {
        title: string;
        contentId: string;
        priceUsdt: number;
      } | null;

      return {
        _id: report._id.toString(),
        tokenId: report.tokenId,
        contentId: report.contentId,
        reporterAddress: report.reporterAddress,
        predictorAddress: report.predictorAddress,
        reason: report.reason,
        description: report.description,
        status: report.status,
        adminNotes: report.adminNotes,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        signal: signal
          ? {
              title: signal.title,
              contentId: signal.contentId,
              priceUsdt: signal.priceUsdt,
            }
          : undefined,
        predictor: predictor
          ? {
              displayName: predictor.displayName,
              walletAddress: predictor.walletAddress,
              preferredContact: predictor.preferredContact,
              socialLinks: {
                telegram: predictor.socialLinks?.telegram,
                discord: predictor.socialLinks?.discord,
              },
            }
          : undefined,
      };
    });

    return {
      reports: adminReports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates a report's status.
   * Admin can mark reports as reviewed, resolved, or dismissed.
   *
   * @param reportId - MongoDB document ID of the report
   * @param status - New status to set
   * @param adminNotes - Optional admin notes
   * @returns Promise resolving to updated report
   * @throws {ApiError} 404 if report not found
   */
  static async updateReportStatus(
    reportId: string,
    status: "pending" | "reviewed" | "resolved" | "dismissed",
    adminNotes?: string
  ): Promise<IReport> {
    const update: Record<string, unknown> = { status };
    if (adminNotes !== undefined) {
      update.adminNotes = adminNotes;
    }

    const report = await Report.findByIdAndUpdate(reportId, update, {
      new: true,
    });

    if (!report) {
      throw ApiError.notFound(`Report with ID '${reportId}' not found`);
    }

    return report;
  }

  /**
   * Gets a single report by ID with full details.
   *
   * @param reportId - MongoDB document ID
   * @returns Promise resolving to report with signal/predictor details
   * @throws {ApiError} 404 if report not found
   */
  static async getReportById(reportId: string): Promise<AdminReport> {
    const report = await Report.findById(reportId)
      .populate({
        path: "signalId",
        select: "title contentId priceUsdt description",
      })
      .lean();

    if (!report) {
      throw ApiError.notFound(`Report with ID '${reportId}' not found`);
    }

    // Get predictor info
    const predictor = await Predictor.findOne({
      walletAddress: report.predictorAddress,
    })
      .select("displayName walletAddress preferredContact socialLinks")
      .lean();

    const signal = report.signalId as unknown as {
      title: string;
      contentId: string;
      priceUsdt: number;
    } | null;

    return {
      _id: report._id.toString(),
      tokenId: report.tokenId,
      contentId: report.contentId,
      reporterAddress: report.reporterAddress,
      predictorAddress: report.predictorAddress,
      reason: report.reason,
      description: report.description,
      status: report.status,
      adminNotes: report.adminNotes,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      signal: signal
        ? {
            title: signal.title,
            contentId: signal.contentId,
            priceUsdt: signal.priceUsdt,
          }
        : undefined,
      predictor: predictor
        ? {
            displayName: predictor.displayName,
            walletAddress: predictor.walletAddress,
            preferredContact: predictor.preferredContact,
            socialLinks: {
              telegram: predictor.socialLinks?.telegram,
              discord: predictor.socialLinks?.discord,
            },
          }
        : undefined,
    };
  }
}
