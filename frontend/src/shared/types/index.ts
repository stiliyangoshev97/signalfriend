/**
 * Shared TypeScript Types
 *
 * Central type definitions for the SignalFriend frontend.
 * Re-exports types inferred from Zod schemas for runtime + compile-time safety.
 *
 * @module shared/types
 *
 * ARCHITECTURE:
 * Zod schemas in `shared/schemas/` are the single source of truth.
 * TypeScript types are inferred from these schemas using `z.infer<>`.
 * This ensures runtime validation matches compile-time types.
 *
 * TYPE CATEGORIES:
 * - API Types      - Request/response structures, pagination
 * - Auth Types     - Authentication (SIWE, JWT, sessions)
 * - Domain Types   - Business entities (Signal, Predictor, etc.)
 * - Utility Types  - Helpers (Address, AppError)
 *
 * USAGE EXAMPLES:
 * ```tsx
 * import type { Signal, Predictor, ApiResponse } from '@/shared/types';
 *
 * // In components
 * interface Props {
 *   signal: Signal;
 *   predictor: Predictor;
 * }
 *
 * // In API calls
 * const response = await apiClient.get<ApiResponse<Signal[]>>('/api/signals');
 * const signals: Signal[] = response.data.data;
 *
 * // With pagination
 * const response = await apiClient.get<PaginatedResponse<Signal>>('/api/signals');
 * const { data: signals, pagination } = response.data;
 * ```
 *
 * LEGACY TYPES:
 * Some auth types (AuthNonceResponse, AuthVerifyRequest, AuthVerifyResponse)
 * are defined here for backward compatibility. These may be consolidated
 * into the schema system in a future refactor.
 *
 * @see shared/schemas for Zod schema definitions
 */

// ===========================================
// Re-export types from Zod schemas
// ===========================================

// API types
export type { ApiErrorResponse, Pagination } from '../schemas';

// Auth types  
export type {
  AuthRequest,
  AuthResponse,
  RefreshTokenRequest,
  NonceResponse,
  UserProfile,
  UpdateProfileRequest,
} from '../schemas';

// Category types
export type { Category } from '../schemas';

// Predictor types
export type {
  Predictor,
  VerificationStatus,
  UpdateProfileData,
} from '../schemas';

// Signal types
export type {
  Signal,
  SignalStatus,
  SignalFilters,
  CreateSignalData,
} from '../schemas';

// Review types
export type { Review, CreateReviewData } from '../schemas';

// Receipt types
export type {
  Receipt,
  ReceiptWithSignal,
  ReceiptStatus,
  PurchaseSignalRequest,
  ClaimRefundRequest,
  ReceiptListQuery,
} from '../schemas';

// ===========================================
// Generic API Response Types
// ===========================================

/**
 * Standard API success response wrapper
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 /**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================================
// Legacy Auth Types (for backward compatibility)
// ===========================================

import type { Predictor as PredictorType } from '../schemas';

export interface AuthNonceResponse {
  nonce: string;
}

export interface AuthVerifyRequest {
  message: string;
  signature: string;
}

export interface AuthVerifyResponse {
  token: string;
  predictor: PredictorType | null;
}

// ===========================================
// Utility Types
// ===========================================

export type Address = `0x${string}`;

export interface AppError {
  message: string;
  status?: number;
  originalError?: unknown;
}
