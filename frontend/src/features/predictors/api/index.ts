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
  fetchPredictorEarnings,
  updatePredictorProfile,
  applyForVerification,
  type PredictorStats,
  type PredictorEarnings,
} from './predictors.api';

// Signal management
export {
  createSignal,
  updateSignal,
  deactivateSignal,
  reactivateSignal,
} from './signals.api';

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
