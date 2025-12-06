/**
 * @fileoverview Predictor Profile Page
 * @module features/predictors/pages/PredictorProfilePage
 * @description
 * Public profile page for a predictor showing:
 * - Profile header with avatar, name, stats
 * - Active signals grid with filters (same as marketplace)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Avatar, Badge, Button, CopyableAddress } from '@/shared/components/ui';
import { formatAddress } from '@/shared/utils/format';
import { FilterPanel, SignalGrid, Pagination } from '@/features/signals/components';
import { useCategories, useMyPurchasedContentIds } from '@/features/signals/hooks';
import { useAuthStore } from '@/features/auth';
import {
  usePublicPredictorProfile,
  usePublicPredictorSignals,
} from '../hooks/usePredictorProfilePage';
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
 * Profile header skeleton
 */
function ProfileHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse">
          <div className="w-24 h-24 bg-dark-600 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-dark-600 rounded" />
            <div className="h-4 w-32 bg-dark-600 rounded" />
            <div className="h-4 w-64 bg-dark-600 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-24 bg-dark-600 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile not found component
 */
function ProfileNotFound({ address }: { address: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 text-dark-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-fur-cream mb-2">Predictor Not Found</h1>
        <p className="text-fur-cream/60 mb-6 max-w-md">
          No predictor found with address {formatAddress(address)}
        </p>
        <Link to="/predictors">
          <Button variant="secondary">
            ← Back to Predictors
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-dark-700/50 rounded-lg px-4 py-3 text-center">
      <div className="flex items-center justify-center text-fur-light mb-1">
        {icon}
      </div>
      <div className="text-xl font-bold text-fur-cream">{value}</div>
      <div className="text-xs text-fur-cream/60">{label}</div>
    </div>
  );
}

/**
 * PredictorProfilePage component
 * 
 * Displays a predictor's public profile including:
 * - Profile header with avatar, name, verification badge
 * - Stats (signals, sales, rating)
 * - Bio and social links
 * - Active signals grid with filters
 * 
 * @returns Predictor profile page element
 */
export function PredictorProfilePage(): React.ReactElement {
  const { address } = useParams<{ address: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SignalFilters>(() =>
    parseFiltersFromParams(searchParams)
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Check if user is authenticated (signed in with SIWE)
  // Used to conditionally fetch purchased content IDs
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch predictor profile
  const { data: predictor, isLoading: profileLoading, error: profileError } = usePublicPredictorProfile(address);

  // Build query filters - DON'T exclude purchased signals on profile page
  // We want to show all signals with a "Purchased" badge for owned ones
  const queryFilters = useMemo(() => ({
    ...filters,
    limit: 12,
    // Note: excludeBuyerAddress is intentionally NOT included here
    // On predictor profiles, we show ALL signals (purchased ones get a badge)
  }), [filters]);

  // Fetch predictor's signals
  const { data: signalsData, isLoading: signalsLoading, error: signalsError } = usePublicPredictorSignals(
    address,
    queryFilters
  );

  // Fetch user's purchased content IDs (only when authenticated with SIWE)
  // Note: This requires authentication, not just wallet connection
  const { data: purchasedContentIds } = useMyPurchasedContentIds(isAuthenticated);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  // Error state
  if (profileError || !predictor) {
    return (
      <div className="min-h-screen bg-dark-950">
        <ProfileNotFound address={address || ''} />
      </div>
    );
  }

  const displayName = predictor.displayName || formatAddress(predictor.walletAddress);
  const hasCustomName = predictor.displayNameChanged;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Profile Header */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            to="/predictors"
            className="inline-flex items-center text-fur-cream/60 hover:text-fur-cream mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Predictors
          </Link>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <Avatar
              src={predictor.avatarUrl}
              name={hasCustomName ? predictor.displayName : 'P'}
              address={predictor.walletAddress}
              size="xl"
            />

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-fur-cream truncate">
                  {displayName}
                </h1>
                {predictor.isVerified && (
                  <Badge variant="success" className="flex items-center gap-1 shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </Badge>
                )}
              </div>

              <div className="mb-3">
                <CopyableAddress address={predictor.walletAddress} />
              </div>

              {predictor.bio && (
                <p className="text-fur-cream/70 max-w-2xl mb-4">
                  {predictor.bio}
                </p>
              )}

              {/* Social Links */}
              {predictor.socialLinks?.twitter && (
                <a
                  href={`https://twitter.com/${predictor.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-fur-light hover:text-fur-cream transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  @{predictor.socialLinks.twitter.replace('@', '')}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
              <StatCard
                label="Signals"
                value={predictor.totalSignals || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <StatCard
                label="Sales"
                value={predictor.totalSales || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
              <StatCard
                label="Avg Rating"
                value={predictor.averageRating ? `${predictor.averageRating.toFixed(1)} ⭐` : 'N/A'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              />
              <StatCard
                label="Votes"
                value={predictor.totalReviews || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </header>

      {/* Active Signals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-semibold text-fur-cream mb-6">Active Signals</h2>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-fur-cream"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

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
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-fur-cream/60">
                  {signalsLoading ? (
                    'Loading signals...'
                  ) : signalsData?.pagination ? (
                    <>
                      <span className="font-medium text-fur-cream">
                        {signalsData.pagination.total}
                      </span>{' '}
                      active signals
                    </>
                  ) : (
                    '0 signals found'
                  )}
                </p>
              </div>

              <SignalGrid
                signals={signalsData?.data || []}
                isLoading={signalsLoading}
                error={signalsError?.message}
                purchasedContentIds={purchasedContentIds}
              />

              {signalsData?.pagination && (
                <Pagination
                  pagination={signalsData.pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </main>
          </div>
      </div>
    </div>
  );
}

export default PredictorProfilePage;
