/**
 * @fileoverview Predictor hooks barrel exports
 * @module features/predictors/hooks
 */

export {
  predictorKeys,
  useMySignals,
  useMyEarnings,
  usePredictorProfile,
  useUpdateProfile,
  useApplyForVerification,
  useCreateSignal,
  useUpdateSignal,
  useDeactivateSignal,
  useReactivateSignal,
  useCheckFieldUniqueness,
} from './usePredictorDashboard';

// Predictor listings
export {
  predictorListKeys,
  usePredictors,
  useTopPredictors,
} from './usePredictors';

// Public predictor profile page
export {
  publicPredictorKeys,
  usePublicPredictorProfile,
  usePublicPredictorSignals,
} from './usePredictorProfilePage';

// Become a predictor flow
export {
  usePredictorNFTBalance,
  usePlatformParameters,
  useUSDTBalanceForPredictor,
  useUSDTAllowanceForPredictor,
  useApproveUSDTForPredictor,
  useJoinAsPredictor,
  useBecomePredictor,
} from './useBecomePredictor';
