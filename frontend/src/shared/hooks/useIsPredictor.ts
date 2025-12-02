/**
 * useIsPredictor Hook
 * 
 * Checks if the connected wallet is a registered predictor.
 */

import { useAuthStore } from '../../features/auth/store';

export function useIsPredictor(): boolean {
  const predictor = useAuthStore((state) => state.predictor);
  return predictor !== null;
}

export function useIsVerifiedPredictor(): boolean {
  const predictor = useAuthStore((state) => state.predictor);
  return predictor?.isVerified ?? false;
}

export default useIsPredictor;
