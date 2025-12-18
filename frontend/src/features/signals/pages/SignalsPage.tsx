/**
 * @fileoverview Signal Marketplace Page
 * @module features/signals/pages/SignalsPage
 * @description
 * Main marketplace page for browsing and filtering trading signals.
 * Combines filter panel, signal grid, and pagination.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useSignals, useCategories } from '../hooks';
import { FilterPanel, SignalGrid, Pagination } from '../components';
import { useSEO, getSEOUrl } from '@/shared/hooks';
import type { SignalFilters } from '@/shared/types';

/**
 * Parse URL search params into SignalFilters
 */
function parseFiltersFromParams(params: URLSearchParams): SignalFilters {
  const filters: SignalFilters = {};

  const category = params.get('category');
  const riskLevel = params.get('risk');
  const potentialReward = params.get('reward');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const sortBy = params.get('sort');
  const page = params.get('page');

  if (category) filters.category = category;
  if (riskLevel && ['low', 'medium', 'high'].includes(riskLevel)) {
    filters.riskLevel = riskLevel as SignalFilters['riskLevel'];
  }
  if (potentialReward && ['normal', 'medium', 'high'].includes(potentialReward)) {
    filters.potentialReward = potentialReward as SignalFilters['potentialReward'];
  }
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  if (sortBy && ['newest', 'price-low', 'price-high', 'popular'].includes(sortBy)) {
    filters.sortBy = sortBy as SignalFilters['sortBy'];
  }
  if (page) filters.page = parseInt(page, 10);

  return filters;
}

/**
 * Convert SignalFilters to URL search params
 */
function filtersToParams(filters: SignalFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (filters.riskLevel) params.set('risk', filters.riskLevel);
  if (filters.potentialReward) params.set('reward', filters.potentialReward);
  if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.sortBy) params.set('sort', filters.sortBy);
  if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

  return params;
}

/**
 * SignalsPage component - Signal Marketplace
 * 
 * Features:
 * - Filter panel (sidebar on desktop, collapsible on mobile)
 * - Signal grid with loading/empty/error states
 * - Pagination for large result sets
 * - URL-synced filters (shareable/bookmarkable)
 * 
 * @returns Signal marketplace page
 * 
 * @example
 * // In router
 * <Route path="/signals" element={<SignalsPage />} />
 */
export function SignalsPage(): React.ReactElement {
  // SEO for signals marketplace page
  useSEO({
    title: 'Trading Signals Marketplace',
    description:
      'Browse premium trading signals from verified predictors. Filter by category, risk level, and price. All signals are secured on the blockchain.',
    url: getSEOUrl('/signals'),
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SignalFilters>(() =>
    parseFiltersFromParams(searchParams)
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Get connected wallet address to exclude already purchased signals
  const { address } = useAccount();

  // Build query filters including excludeBuyerAddress when user is connected
  const queryFilters = useMemo(() => ({
    ...filters,
    limit: 12, // Show 12 per page
    ...(address && { excludeBuyerAddress: address }),
  }), [filters, address]);

  // Fetch signals with current filters
  const { data, isLoading, error } = useSignals(queryFilters);

  // Fetch categories for filter dropdown
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  // Sync URL with filters
  useEffect(() => {
    const newParams = filtersToParams(filters);
    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: SignalFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page Header */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-fur-cream mb-2">
            Signal Marketplace
          </h1>
          <p className="text-fur-cream/60 max-w-2xl">
            Browse trading signals sorted by rating and sales. 
            All purchases are secured by smart contracts on BNB Chain.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-fur-cream"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isMobileFiltersOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Mobile Filters Panel */}
            {isMobileFiltersOpen && (
              <div className="mt-4">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  isLoadingCategories={isLoadingCategories}
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
              />
            </div>
          </aside>

          {/* Signal Grid */}
          <main className="lg:col-span-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-fur-cream/60">
                {isLoading ? (
                  'Loading signals...'
                ) : data?.pagination ? (
                  <>
                    <span className="font-medium text-fur-cream">
                      {data.pagination.total}
                    </span>{' '}
                    signals found
                  </>
                ) : (
                  '0 signals found'
                )}
              </p>
            </div>

            {/* Grid */}
            <SignalGrid
              signals={data?.data || []}
              isLoading={isLoading}
              error={error?.message}
            />

            {/* Pagination */}
            {data?.pagination && (
              <Pagination
                pagination={data.pagination}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SignalsPage;
