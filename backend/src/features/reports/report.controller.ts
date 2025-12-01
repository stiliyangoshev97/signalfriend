/**
 * @fileoverview Express controller for Report API endpoints.
 *
 * Handles HTTP requests for reports including:
 * - Creating reports for purchased signals
 * - Listing reports for signals and predictors
 * - Checking report status for a purchase
 * - Getting user's own reports
 *
 * @module features/reports/report.controller
 */
import { Request, Response } from "express";
import { ReportService } from "./report.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type {
  CreateReportInput,
  ListSignalReportsQuery,
  ListPredictorReportsQuery,
  SignalContentIdParams,
  PredictorAddressParams,
  ReportTokenIdParams,
} from "./report.schemas.js";

/**
 * Controller class for Report API endpoints.
 * All methods are static and wrapped with asyncHandler.
 */
export class ReportController {
  /**
   * POST /api/reports
   * Create a new report for a purchased signal.
   */
  static create = asyncHandler(
    async (req: Request, res: Response) => {
      const data = req.body as CreateReportInput;
      const report = await ReportService.create(data, req.user!.address);

      res.status(201).json({
        success: true,
        data: report,
      });
    }
  );

  /**
   * GET /api/reports/check/:tokenId
   * Check if a report exists for a token ID.
   */
  static checkExists = asyncHandler(async (req: Request, res: Response) => {
    const { tokenId } = req.params as unknown as ReportTokenIdParams;
    const exists = await ReportService.exists(tokenId);

    res.json({
      success: true,
      data: { exists },
    });
  });

  /**
   * GET /api/reports/:tokenId
   * Get a report by token ID.
   */
  static getByTokenId = asyncHandler(async (req: Request, res: Response) => {
    const { tokenId } = req.params as unknown as ReportTokenIdParams;
    const report = await ReportService.getByTokenId(tokenId);

    if (!report) {
      res.status(404).json({
        success: false,
        error: `Report with tokenId '${tokenId}' not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  });

  /**
   * GET /api/reports/signal/:contentId
   * Get reports for a specific signal with pagination.
   */
  static getSignalReports = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params as unknown as SignalContentIdParams;
    const query = req.query as unknown as ListSignalReportsQuery;
    const result = await ReportService.getSignalReports(contentId, query);

    res.json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/reports/predictor/:address
   * Get reports for a specific predictor with pagination.
   */
  static getPredictorReports = asyncHandler(
    async (req: Request, res: Response) => {
      const { address } = req.params as unknown as PredictorAddressParams;
      const query = req.query as unknown as ListPredictorReportsQuery;
      const result = await ReportService.getPredictorReports(address, query);

      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination,
      });
    }
  );

  /**
   * GET /api/reports/predictor/:address/stats
   * Get report statistics for a predictor.
   */
  static getPredictorStats = asyncHandler(
    async (req: Request, res: Response) => {
      const { address } = req.params as unknown as PredictorAddressParams;
      const stats = await ReportService.getPredictorStats(address);

      res.json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * GET /api/reports/mine
   * Get the authenticated user's reports with pagination.
   */
  static getMyReports = asyncHandler(
    async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ReportService.getMyReports(
        req.user!.address,
        page,
        limit
      );

      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination,
      });
    }
  );

  /**
   * GET /api/reports/signal/:contentId/count
   * Get the total report count for a signal.
   */
  static getSignalReportCount = asyncHandler(
    async (req: Request, res: Response) => {
      const { contentId } = req.params as unknown as SignalContentIdParams;
      const count = await ReportService.getSignalReportCount(contentId);

      res.json({
        success: true,
        data: { count },
      });
    }
  );
}
