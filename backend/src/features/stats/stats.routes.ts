/**
 * @fileoverview Public statistics routes for SignalFriend.
 *
 * Provides public endpoints for platform statistics.
 * No authentication required.
 *
 * @module features/stats/stats.routes
 *
 * @route GET /api/stats - Get public platform statistics
 */

import { Router } from "express";
import { getPublicStats } from "./stats.controller.js";

const router = Router();

/**
 * @route GET /api/stats
 * @description Get public platform statistics for homepage display
 * @access Public
 */
router.get("/", getPublicStats);

export { router as statsRoutes };
