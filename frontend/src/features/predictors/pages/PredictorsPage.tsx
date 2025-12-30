/**
 * @fileoverview Predictors Leaderboard Page
 * @module features/predictors/pages/PredictorsPage
 * @description
 * Public leaderboard page for browsing and filtering predictors.
 * Displays predictor rankings, stats, and allows filtering/searching.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePredictors } from '../hooks';
import { PredictorGrid, PredictorFilterPanel } from '../components';
import { Pagination } from '@/features/signals/components';
import { useSEO, getSEOUrl } from '@/shared/hooks';
import type { PredictorFilters } from '../api';

/**
 * Parse URL search params into PredictorFilters
 */
function parseFiltersFromParams(params: URLSearchParams): PredictorFilters {
  const filters: PredictorFilters = {};

  const search = params.get('search');
  const sortBy = params.get('sort');
  const order = params.get('order');
  const page = params.get('page');

  if (search) filters.search = search;
  if (sortBy && ['totalSales', 'averageRating', 'joinedAt', 'totalSignals'].includes(sortBy)) {
    filters.sortBy = sortBy as PredictorFilters['sortBy'];
  }
  if (order && ['asc', 'desc'].includes(order)) {
    filters.sortOrder = order as PredictorFilters['sortOrder'];
  }
  if (page) filters.page = parseInt(page, 10);

  return filters;
}

/**
 * Convert PredictorFilters to URL search params
 */
function filtersToParams(filters: PredictorFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy && filters.sortBy !== 'totalSales') params.set('sort', filters.sortBy);
  if (filters.sortOrder && filters.sortOrder !== 'desc') params.set('order', filters.sortOrder);
  if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

  return params;
}

/**
 * PredictorsPage component - Public Predictor Leaderboard
 * 
 * Features:
 * - Filter panel (sidebar on desktop, collapsible on mobile)
 * - Predictor grid with loading/empty/error states
 * - Pagination for large result sets
 * - URL-synced filters (shareable/bookmarkable)
 * - Rank badges showing leaderboard position
 * 
 * @returns Predictors leaderboard page
 * 
 * @example
 * // In router
 * <Route path="/predictors" element={<PredictorsPage />} />
 */
export function PredictorsPage(): React.ReactElement {
  // SEO for predictors leaderboard page
  useSEO({
    title: 'Top Predictors Leaderboard',
    description:
      'Discover top-rated prediction signal predictors. View rankings, ratings, and track records. Find verified predictors you can trust on SignalFriend.',
    url: getSEOUrl('/predictors'),
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<PredictorFilters>(() => ({
    sortBy: 'totalSales',
    sortOrder: 'desc',
    limit: 12,
    ...parseFiltersFromParams(searchParams),
  }));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch predictors with current filters
  const { data, isLoading, error } = usePredictors(filters);

  // Sync URL params when filters change
  useEffect(() => {
    const newParams = filtersToParams(filters);
    const currentParams = searchParams.toString();
    const newParamsString = newParams.toString();

    if (currentParams !== newParamsString) {
      setSearchParams(newParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  // Handle filter changes
  // When newFilters is passed, it represents the COMPLETE desired filter state
  // (except for limit which we always keep)
  const handleFiltersChange = useCallback((newFilters: PredictorFilters) => {
    setFilters((prev) => {
      // Start with the new filters as the base (not merging with prev)
      // This ensures that if a key is missing from newFilters, it's removed
      const result: PredictorFilters = {
        // Keep the limit from previous state
        limit: prev.limit,
        // Apply all new filters
        ...newFilters,
      };
      
      // Remove keys that are undefined or empty string
      Object.keys(result).forEach((key) => {
        const value = result[key as keyof PredictorFilters];
        if (value === undefined || value === '') {
          delete result[key as keyof PredictorFilters];
        }
      });
      
      return result;
    });
  }, []);

  // Handle page change (scroll is handled by Pagination component)
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // Toggle mobile filters
  const toggleMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen((prev) => !prev);
  }, []);

  // Calculate rank offset for pagination
  const rankOffset = useMemo(() => {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    return (page - 1) * limit;
  }, [filters.page, filters.limit]);

  // Check if default sort (for showing ranks)
  const isDefaultSort = filters.sortBy === 'totalSales' && filters.sortOrder === 'desc';

  // Extract predictors and pagination from response
  const predictors = data?.predictors || [];
  const pagination = data?.pagination
    ? {
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }
    : null;

  return (
    <div className="min-h-screen bg-dark-700">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fur-cream mb-2">
            🏆 Top Predictors
          </h1>
          <p className="text-gray-main">
            Discover the best signal providers ranked by performance
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={toggleMobileFilters}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-fur-cream hover:border-fur-light/50 transition-colors"
          >
            <span>🔧</span>
            <span>Filters</span>
            {filters.search && (
              <span className="bg-fur-light text-dark-900 text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filter Panel */}
          <aside className="lg:w-72 flex-shrink-0">
            {/* Desktop: always visible */}
            <div className="hidden lg:block sticky top-4">
              <PredictorFilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {/* Mobile: collapsible overlay */}
            {isMobileFiltersOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-dark-900/80">
                <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-dark-700 p-4 overflow-y-auto">
                  <PredictorFilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    isOpen={isMobileFiltersOpen}
                    onClose={() => setIsMobileFiltersOpen(false)}
                  />
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Count */}
            {pagination && pagination.total > 0 && (
              <div className="mb-4 text-sm text-gray-main">
                Showing {predictors.length} of {pagination.total} predictors
              </div>
            )}

            {/* Predictor Grid */}
            <PredictorGrid
              predictors={predictors}
              isLoading={isLoading}
              error={error as Error | null}
              showRanks={isDefaultSort && !filters.search}
              rankOffset={rankOffset}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default PredictorsPage;
