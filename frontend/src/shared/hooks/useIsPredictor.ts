/**
 * Predictor Status Hooks
 *
 * Hooks for checking predictor registration and verification status.
 * Used to gate access to predictor features (signal creation, dashboard, etc.)
 *
 * @module shared/hooks/useIsPredictor
 *
 * EXPORTS:
 * - `useIsPredictor` - Checks if user is a registered predictor
 * - `useIsVerifiedPredictor` - Checks if user is a VERIFIED predictor
 *
 * PREDICTOR STATUS FLOW:
 * 1. User connects wallet → Not a predictor
 * 2. User registers (mints PredictorAccessPass) → Is predictor, not verified
 * 3. Admin verifies predictor → Is verified predictor
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Check if user can access predictor dashboard
 * function PredictorDashboard() {
 *   const isPredictor = useIsPredictor();
 *   
 *   if (!isPredictor) {
 *     return <BecomePredictor />;
 *   }
 *   
 *   return <Dashboard />;
 * }
 *
 * // Check for verified badge display
 * function PredictorProfile() {
 *   const isVerified = useIsVerifiedPredictor();
 *   
 *   return (
 *     <div>
 *       <h1>My Profile</h1>
 *       {isVerified && <Badge color="success">Verified</Badge>}
 *     </div>
 *   );
 * }
 *
 * // Combined usage
 * function CreateSignalButton() {
 *   const isPredictor = useIsPredictor();
 *   const isVerified = useIsVerifiedPredictor();
 *   
 *   if (!isPredictor) return null;
 *   
 *   return (
 *     <Button disabled={!isVerified}>
 *       {isVerified ? 'Create Signal' : 'Verification Required'}
 *     </Button>
 *   );
 * }
 * ```
 *
 * DATA SOURCE:
 * Reads from the auth store, which is populated after SIWE authentication.
 * The predictor object comes from the backend during auth verification.
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
