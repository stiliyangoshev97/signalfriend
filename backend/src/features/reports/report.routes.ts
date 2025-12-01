/**
 * @fileoverview Express routes for Report API endpoints.
 *
 * Defines routes for:
 * - POST /api/reports - Create a report (auth required)
 * - GET /api/reports/mine - Get user's reports (auth required)
 * - GET /api/reports/check/:tokenId - Check if report exists
 * - GET /api/reports/signal/:contentId - Get signal reports
 * - GET /api/reports/signal/:contentId/count - Get signal report count
 * - GET /api/reports/predictor/:address - Get predictor reports
 * - GET /api/reports/predictor/:address/stats - Get predictor report stats
 * - GET /api/reports/:tokenId - Get report by token ID
 *
 * @module features/reports/report.routes
 */
import { Router } from "express";
import { ReportController } from "./report.controller.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validation.js";
import {
  createReportSchema,
  listSignalReportsSchema,
  listPredictorReportsSchema,
  signalContentIdSchema,
  predictorAddressSchema,
  reportTokenIdSchema,
} from "./report.schemas.js";

const router = Router();

/**
 * POST /api/reports
 * Create a new report for a purchased signal.
 * Requires authentication.
 */
router.post(
  "/",
  authenticate,
  validate(createReportSchema),
  ReportController.create
);

/**
 * GET /api/reports/mine
 * Get the authenticated user's reports.
 * Requires authentication.
 */
router.get("/mine", authenticate, ReportController.getMyReports);

/**
 * GET /api/reports/check/:tokenId
 * Check if a report exists for a token ID.
 */
router.get(
  "/check/:tokenId",
  validate(reportTokenIdSchema, "params"),
  ReportController.checkExists
);

/**
 * GET /api/reports/signal/:contentId
 * Get reports for a specific signal.
 */
router.get(
  "/signal/:contentId",
  validate(signalContentIdSchema, "params"),
  validate(listSignalReportsSchema, "query"),
  ReportController.getSignalReports
);

/**
 * GET /api/reports/signal/:contentId/count
 * Get the total report count for a signal.
 */
router.get(
  "/signal/:contentId/count",
  validate(signalContentIdSchema, "params"),
  ReportController.getSignalReportCount
);

/**
 * GET /api/reports/predictor/:address
 * Get reports for a specific predictor.
 */
router.get(
  "/predictor/:address",
  validate(predictorAddressSchema, "params"),
  validate(listPredictorReportsSchema, "query"),
  ReportController.getPredictorReports
);

/**
 * GET /api/reports/predictor/:address/stats
 * Get report statistics for a predictor.
 */
router.get(
  "/predictor/:address/stats",
  validate(predictorAddressSchema, "params"),
  ReportController.getPredictorStats
);

/**
 * GET /api/reports/:tokenId
 * Get a specific report by token ID.
 */
router.get(
  "/:tokenId",
  validate(reportTokenIdSchema, "params"),
  ReportController.getByTokenId
);

export default router;
