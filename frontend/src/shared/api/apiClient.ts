/**
 * Axios API Client
 * 
 * Centralized HTTP client with interceptors for:
 * - Adding JWT auth tokens to requests
 * - Handling response errors
 * - Global error handling
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
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        // Only auto-logout for non-auth endpoints
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
