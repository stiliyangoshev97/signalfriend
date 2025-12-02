/**
 * API Configuration
 */

import { env } from './env';

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
