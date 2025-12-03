/**
 * API Module Barrel Export
 *
 * Central export point for API-related utilities.
 *
 * @module shared/api
 *
 * USAGE:
 * ```tsx
 * import { apiClient } from '@/shared/api';
 *
 * const response = await apiClient.get('/api/signals');
 * ```
 *
 * EXPORTS:
 * - apiClient - Pre-configured Axios instance with auth interceptors
 */

export { apiClient } from './apiClient';
