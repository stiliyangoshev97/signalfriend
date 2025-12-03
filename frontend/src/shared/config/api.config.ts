/**
 * API Configuration
 *
 * Centralized configuration for backend API communication.
 * Contains base URL, timeout settings, and all API endpoint definitions.
 *
 * @module shared/config/api.config
 *
 * ENDPOINT NAMING CONVENTION:
 * - Plural nouns for collections: SIGNALS, PREDICTORS, CATEGORIES
 * - _BY_ID suffix for single resource: SIGNAL_BY_ID
 * - Verb prefix for actions: ADMIN_VERIFY, ADMIN_BLACKLIST
 *
 * USAGE EXAMPLES:
 * ```tsx
 * import { API_CONFIG } from '@/shared/config';
 *
 * // GET request
 * const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNALS}`);
 *
 * // Dynamic endpoints
 * const signalUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNAL_BY_ID('123')}`;
 *
 * // With axios (via apiClient)
 * import { apiClient } from '@/shared/api';
 * const { data } = await apiClient.get(API_CONFIG.ENDPOINTS.PREDICTOR_PROFILE);
 * ```
 *
 * ENDPOINT GROUPS:
 * - Auth        - Authentication (nonce, verify)
 * - Signals     - Signal CRUD operations
 * - Predictors  - Predictor profiles
 * - Categories  - Signal categories
 * - Reviews     - Signal reviews/ratings
 * - Admin       - Admin-only operations
 * - Health      - API health check
 *
 * TIMEOUT:
 * Default timeout is 15 seconds. Increase for large uploads.
 */

import { env } from './env';
// ...existing code...

export const API_CONFIG = {
  BASE_URL: env.API_BASE_URL,
  TIMEOUT: 15000, // 15 seconds
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    AUTH_NONCE: '/api/auth/nonce',
    AUTH_VERIFY: '/api/auth/verify',
    
    // Signals
    SIGNALS: '/api/signals',
    SIGNAL_BY_ID: (id: string) => `/api/signals/${id}`,
    SIGNAL_CONTENT: (id: string) => `/api/signals/${id}/content`,
    MY_SIGNALS: '/api/signals/my-signals',
    
    // Predictors
    PREDICTORS: '/api/predictors',
    PREDICTOR_BY_ADDRESS: (address: string) => `/api/predictors/${address}`,
    PREDICTOR_PROFILE: '/api/predictors/me',
    PREDICTOR_SIGNALS: (address: string) => `/api/predictors/${address}/signals`,
    
    // Categories
    CATEGORIES: '/api/categories',
    
    // Reviews
    REVIEWS: '/api/reviews',
    REVIEW_BY_TOKEN: (tokenId: string) => `/api/reviews/${tokenId}`,
    
    // Admin
    ADMIN_PREDICTOR: (address: string) => `/api/admin/predictors/${address}`,
    ADMIN_BLACKLIST: (address: string) => `/api/admin/predictors/${address}/blacklist`,
    ADMIN_SIGNAL_DELETE: (id: string) => `/api/admin/signals/${id}`,
    ADMIN_PENDING_VERIFICATIONS: '/api/admin/verifications/pending',
    ADMIN_VERIFY: (address: string) => `/api/admin/predictors/${address}/verify`,
    
    // Health
    HEALTH: '/health',
  },
} as const;
