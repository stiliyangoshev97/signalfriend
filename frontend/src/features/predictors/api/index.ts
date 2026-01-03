/**
 * @fileoverview Predictor API barrel exports
 * @module features/predictors/api
 * @description
 * Central export point for all predictor-related API functions.
 */

// Predictor profile and stats
export {
  fetchMyProfile,
  fetchPredictorByAddress,
  fetchPredictorSignals,
  fetchMySignals,
  fetchMySignalsPaginated,
  fetchPredictorEarnings,
  updatePredictorProfile,
  applyForVerification,
  checkFieldUniqueness,
  type PredictorStats,
  type PredictorEarnings,
  type UpdateProfileInput,
  type CheckFieldUniquenessResponse,
  type MySignalsPaginatedResponse,
  type MySignalsParams,
} from './predictors.api';

// Signal management
export {
  createSignal,
  updateSignal,
  deactivateSignal,
  reactivateSignal,
  expireSignal,
} from './signals.api';

// Dispute management (for blacklisted predictors)
export {
  createDispute,
  getMyDispute,
  type DisputeStatus,
  type PredictorDispute,
} from './disputes.api';

// Predictor listings
export {
  fetchPredictors,
  fetchTopPredictors,
  type PredictorFilters,
  type PredictorsListResponse,
} from './predictorsList.api';

// Predictor profile page
export {
  fetchPredictorProfile,
  fetchPredictorSignalsPublic,
} from './predictorProfile.api';
