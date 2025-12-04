/**
 * Axios API Client
 *
 * Centralized HTTP client with interceptors for authentication and error handling.
 * All API calls should go through this client for consistent behavior.
 *
 * @module shared/api/apiClient
 *
 * FEATURES:
 * - Automatic JWT token attachment to requests
 * - Global error handling with status-specific logic
 * - Configurable base URL and timeout
 * - JSON content type by default
 *
 * INTERCEPTORS:
 *
 * Request Interceptor:
 * - Reads JWT from localStorage ('authToken')
 * - Attaches as Bearer token to Authorization header
 * - All authenticated API calls automatically include the token
 *
 * Response Interceptor:
 * - 401 Unauthorized: Clears auth and redirects to home (except for auth endpoints)
 * - 503 Service Unavailable: Shows maintenance message (TODO)
 * - Other errors: Extracts user-friendly message from response
 *
 * USAGE EXAMPLES:
 * ```tsx
 * import { apiClient } from '@/shared/api';
 *
 * // GET request
 * const { data } = await apiClient.get('/api/signals');
 *
 * // POST request with body
 * const { data } = await apiClient.post('/api/signals', {
 *   title: 'New Signal',
 *   description: '...',
 * });
 *
 * // With TypeScript types
 * interface Signal { id: string; title: string; }
 * const { data } = await apiClient.get<ApiResponse<Signal[]>>('/api/signals');
 *
 * // Use with React Query
 * const { data } = useQuery({
 *   queryKey: ['signals'],
 *   queryFn: () => apiClient.get('/api/signals').then(res => res.data),
 * });
 * ```
 *
 * ERROR HANDLING:
 * Errors thrown by apiClient include a message property.
 * Use try/catch or React Query's error handling:
 * ```tsx
 * try {
 *   await apiClient.post('/api/signals', data);
 * } catch (error) {
 *   console.error(error.message); // User-friendly message
 * }
 * ```
 *
 * CONFIGURATION:
 * - Base URL: from API_CONFIG (env.API_BASE_URL)
 * - Timeout: from API_CONFIG (default 15s)
 *
 * @see API_CONFIG for endpoint definitions
 */

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api.config';
import type { ApiErrorResponse } from '../types';

/**
 * Create axios instance with base configuration
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * 
 * Automatically attaches JWT token to all requests.
 * Token is read from localStorage (set during SIWE authentication).
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * 
 * Handles global error responses:
 * - 401: Token expired/invalid → clear auth and redirect
 * - 503: Maintenance mode → show maintenance message
 * - Other errors: Extract user-friendly message
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Extract error message from backend response
    const errorMessage = 
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Handle specific HTTP status codes
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid - clear auth
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/');
      // Public endpoints that shouldn't trigger redirect on 401
      const isPublicEndpoint = 
        requestUrl.includes('/signals') && !requestUrl.includes('/content') ||
        requestUrl.includes('/categories') ||
        requestUrl.includes('/predictors');
      
      if (!isAuthEndpoint && !isPublicEndpoint) {
        // Only auto-logout for protected endpoints
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-storage');
        
        // Redirect to home (wallet connect will be needed again)
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }

    if (status === 503) {
      // Maintenance mode
      const maintenanceEnd = error.response?.data?.maintenanceEnd;
      console.warn('Service is under maintenance', { maintenanceEnd });
    }

    // Return a structured error object
    return Promise.reject({
      message: errorMessage,
      status,
      originalError: error,
    });
  }
);

export default apiClient;
