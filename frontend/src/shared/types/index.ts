/**
 * Shared TypeScript Types
 * 
 * Re-exports types from Zod schemas for type safety.
 * Using Zod schemas as single source of truth.
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
  RiskLevel,
  PotentialReward,
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
