/**
 * Route Guards Barrel Export
 *
 * Central export point for all route protection components.
 *
 * @module router/guards
 *
 * AVAILABLE GUARDS:
 * - ProtectedRoute  - Requires wallet connection + SIWE authentication
 * - AdminRoute      - Requires admin wallet address
 * - PredictorRoute  - Requires predictor registration (+ optional verification)
 *
 * USAGE:
 * ```tsx
 * import { ProtectedRoute, AdminRoute, PredictorRoute } from '@/router/guards';
 *
 * // In router config
 * {
 *   path: 'my-signals',
 *   element: <ProtectedRoute><MySignalsPage /></ProtectedRoute>,
 * }
 * ```
 *
 * GUARD HIERARCHY:
 * ```
 * Public (no guard)
 *     │
 *     └── ProtectedRoute (authenticated)
 *             │
 *             ├── PredictorRoute (predictor)
 *             │       │
 *             │       └── PredictorRoute requireVerified (verified predictor)
 *             │
 *             └── AdminRoute (admin)
 * ```
 */

export { ProtectedRoute } from './ProtectedRoute';
export { AdminRoute } from './AdminRoute';
export { PredictorRoute } from './PredictorRoute';
