/**
 * @fileoverview Barrel export for Disputes feature module.
 *
 * @module features/disputes
 */
export { Dispute, type IDispute } from "./dispute.model.js";
export { DisputeService } from "./dispute.service.js";
export { disputeRoutes, adminDisputeRoutes } from "./dispute.routes.js";
