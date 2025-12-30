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
import { useQueryClient } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { Avatar, Badge, Button, CopyableAddress, Modal } from '@/shared/components/ui';
import { formatAddress, getExplorerTxUrl } from '@/shared/utils';
import { FilterPanel, SignalGrid, Pagination } from '@/features/signals/components';
import { useCategories, useMyPurchasedContentIds } from '@/features/signals/hooks';
import { useAuthStore } from '@/features/auth';
import { useIsAdmin } from '@/shared/hooks/useIsAdmin';
import { useSEO, getSEOUrl } from '@/shared/hooks';
import { useAdminPredictorProfile, useManualVerifyPredictor, useUnverifyPredictor, adminKeys, useProposeBlacklist } from '@/features/admin/hooks';
import {
  usePublicPredictorProfile,
  usePublicPredictorSignals,
  publicPredictorKeys,
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
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SignalFilters>(() =>
    parseFiltersFromParams(searchParams)
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);
  const [blacklistProposalSuccess, setBlacklistProposalSuccess] = useState<{
    actionId: string;
    txHash: string;
    isBlacklist: boolean;
  } | null>(null);

  // Check if user is authenticated (signed in with SIWE)
  // Used to conditionally fetch purchased content IDs
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Get chain ID for smart contract calls
  const chainId = useChainId();

  // Admin check
  const isAdmin = useIsAdmin();
  
  // Smart contract blacklist hook (MultiSig proposal)
  const { proposeBlacklist, proposeUnblacklist, state: blacklistState, reset: resetBlacklist } = useProposeBlacklist(chainId);
  
  // API mutations for verify/unverify (blacklist now uses smart contract)
  const manualVerifyMutation = useManualVerifyPredictor();
  const unverifyMutation = useUnverifyPredictor();
  
  const isBlacklistLoading = blacklistState.isPending || blacklistState.isConfirming;
  const isVerifyLoading = manualVerifyMutation.isPending || unverifyMutation.isPending;

  // Fetch predictor profile - use admin endpoint for admins (includes contact info)
  const { data: publicPredictor, isLoading: publicProfileLoading, error: publicProfileError } = usePublicPredictorProfile(address);
  const { data: adminPredictor, isLoading: adminProfileLoading, error: adminProfileError } = useAdminPredictorProfile(address, isAdmin && isAuthenticated);
  
  // Use admin profile if admin, otherwise public profile
  const predictor = isAdmin && adminPredictor ? adminPredictor : publicPredictor;
  const profileLoading = isAdmin && isAuthenticated ? adminProfileLoading : publicProfileLoading;
  const profileError = isAdmin && isAuthenticated ? adminProfileError : publicProfileError;

  // Dynamic SEO based on predictor data
  useSEO({
    title: predictor
      ? `${predictor.displayName || formatAddress(predictor.walletAddress)} - Predictor Profile`
      : 'Predictor Profile',
    description: predictor
      ? `${predictor.bio?.slice(0, 120) || 'Prediction signal predictor'} - ${predictor.totalSignals || 0} signals, ${predictor.totalSales || 0} sales, ${predictor.averageRating?.toFixed(1) || 'N/A'} rating.`
      : 'View predictor profile, prediction signals, and performance stats on SignalFriend.',
    url: address ? getSEOUrl(`/predictors/${address}`) : undefined,
    type: 'profile',
  });

  // Open confirmation modal for blacklist action
  const handleBlacklistClick = useCallback(() => {
    setBlacklistModalOpen(true);
    setBlacklistProposalSuccess(null);
    resetBlacklist();
  }, [resetBlacklist]);

  // Admin blacklist/unblacklist handler - NOW USES SMART CONTRACT
  const handleToggleBlacklist = useCallback(async () => {
    if (!address || !predictor) return;
    
    try {
      let result;
      if (predictor.isBlacklisted) {
        result = await proposeUnblacklist(address);
      } else {
        result = await proposeBlacklist(address);
      }
      
      // Show success with transaction details
      setBlacklistProposalSuccess({
        actionId: result.actionId,
        txHash: result.transactionHash,
        isBlacklist: result.isBlacklist,
      });
      
      // Note: The actual blacklist status update happens after MultiSig approval
      // The webhook will sync the database when the action is executed on-chain
      // For now, we just show success message about the proposal
      
    } catch (error) {
      console.error('Failed to propose blacklist action:', error);
      // Error is already in blacklistState.error
    }
  }, [address, predictor, proposeBlacklist, proposeUnblacklist]);

  // Close modal and reset state
  const handleCloseBlacklistModal = useCallback(() => {
    setBlacklistModalOpen(false);
    // If proposal was successful, invalidate queries to check for updates
    if (blacklistProposalSuccess) {
      queryClient.invalidateQueries({ queryKey: publicPredictorKeys.profile(address!) });
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: adminKeys.predictorProfile(address!) });
      }
      queryClient.invalidateQueries({ queryKey: publicPredictorKeys.signals(address!) });
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    }
  }, [blacklistProposalSuccess, address, queryClient, isAdmin]);

  // Admin verify/unverify handler
  const handleToggleVerify = useCallback(async () => {
    if (!address || !predictor) return;
    
    try {
      if (predictor.isVerified) {
        await unverifyMutation.mutateAsync(address);
      } else {
        await manualVerifyMutation.mutateAsync(address);
      }
      // Invalidate predictor profile queries
      queryClient.invalidateQueries({ queryKey: publicPredictorKeys.profile(address) });
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: adminKeys.predictorProfile(address) });
      }
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  }, [address, predictor, manualVerifyMutation, unverifyMutation, queryClient, isAdmin]);

  // Build query filters - DON'T exclude purchased signals on profile page
  // We want to show all signals with a "Purchased" badge for owned ones
  const queryFilters = useMemo(() => ({
    ...filters,
    limit: 12,
    status: activeTab, // 'active' or 'inactive' based on selected tab
    // Note: excludeBuyerAddress is intentionally NOT included here
    // On predictor profiles, we show ALL signals (purchased ones get a badge)
  }), [filters, activeTab]);

  // Fetch predictor's signals (active or inactive based on tab)
  const { data: signalsData, isLoading: signalsLoading, error: signalsError } = usePublicPredictorSignals(
    address,
    queryFilters
  );

  // Also fetch count for the other tab to show in tab badge
  const otherTabStatus = activeTab === 'active' ? 'inactive' : 'active';
  const { data: otherTabData } = usePublicPredictorSignals(
    address,
    { limit: 1, status: otherTabStatus }
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

  // Handle tab change (reset page when switching tabs)
  const handleTabChange = useCallback((tab: 'active' | 'inactive') => {
    setActiveTab(tab);
    setFilters((prev) => ({ ...prev, page: 1 }));
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
      {/* Blacklisted Predictor Warning Banner */}
      {predictor.isBlacklisted && (
        <div className="bg-red-500/10 border-b border-red-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-400">Predictor Blacklisted</h3>
                <p className="text-sm text-red-300/80">
                  This predictor has been blacklisted. Their signals cannot be purchased.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-fur-cream/70 max-w-2xl mb-4 break-words whitespace-pre-wrap overflow-hidden">
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

              {/* Admin-only Contact Info */}
              {isAdmin && (predictor.socialLinks?.telegram || predictor.socialLinks?.discord || predictor.preferredContact) && (
                <div className="mt-4 p-3 bg-brand-200/10 border border-brand-200/30 rounded-lg">
                  <p className="text-xs text-brand-200 font-medium mb-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Admin Only - Contact Info
                  </p>
                  <div className="space-y-1 text-sm">
                    {predictor.socialLinks?.telegram && (
                      <div className="flex items-center gap-2 text-fur-cream/80">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        <span className="font-medium">Telegram:</span>
                        <span>@{predictor.socialLinks.telegram.replace('@', '')}</span>
                        {predictor.preferredContact === 'telegram' && (
                          <Badge variant="success" className="text-xs">Preferred</Badge>
                        )}
                      </div>
                    )}
                    {predictor.socialLinks?.discord && (
                      <div className="flex items-center gap-2 text-fur-cream/80">
                        <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
                        </svg>
                        <span className="font-medium">Discord:</span>
                        <span>{predictor.socialLinks.discord}</span>
                        {predictor.preferredContact === 'discord' && (
                          <Badge variant="success" className="text-xs">Preferred</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin-only Earnings Info */}
              {isAdmin && adminPredictor?.earnings && (
                <div className="mt-4 p-3 bg-brand-200/10 border border-brand-200/30 rounded-lg">
                  <p className="text-xs text-brand-200 font-medium mb-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Admin Only - Earnings
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-dark-900/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-success-500">${adminPredictor.earnings.totalEarnings.toFixed(2)}</p>
                      <p className="text-xs text-fur-cream/60">Total Earnings</p>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-fur-cream">${adminPredictor.earnings.predictorEarnings.toFixed(2)}</p>
                      <p className="text-xs text-fur-cream/60">From Sales</p>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-brand-200">${adminPredictor.earnings.referralEarnings.toFixed(2)}</p>
                      <p className="text-xs text-fur-cream/60">From Referrals ({adminPredictor.earnings.paidReferrals})</p>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-accent-gold">${adminPredictor.earnings.platformCommission.toFixed(2)}</p>
                      <p className="text-xs text-fur-cream/60">Platform Fee (5%)</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-fur-cream/50">
                    Total sales revenue: ${adminPredictor.earnings.totalSalesRevenue.toFixed(2)} from {adminPredictor.earnings.totalSalesCount} sales
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <div className="mt-4 p-3 bg-dark-700/50 border border-dark-600 rounded-lg">
                  <p className="text-xs text-fur-cream/70 font-medium mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Actions
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {/* Verify/Unverify Button */}
                    <Button
                      variant={predictor.isVerified ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={handleToggleVerify}
                      isLoading={isVerifyLoading}
                      disabled={isVerifyLoading}
                    >
                      {predictor.isVerified ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Remove Verification
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verify Predictor
                        </>
                      )}
                    </Button>
                    
                    {/* Blacklist/Unblacklist Button */}
                    <Button
                      variant={predictor.isBlacklisted ? 'secondary' : 'danger'}
                      size="sm"
                      onClick={handleBlacklistClick}
                      isLoading={isBlacklistLoading}
                      disabled={isBlacklistLoading}
                    >
                      {predictor.isBlacklisted ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Unblacklist Predictor
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Blacklist Predictor
                        </>
                      )}
                    </Button>
                  </div>
                  {predictor.isBlacklisted && (
                    <p className="text-xs text-yellow-500 mt-2">
                      ⚠️ This predictor is currently blacklisted
                    </p>
                  )}
                </div>
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

      {/* Signals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs for Active/Inactive Signals */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
          <button
            onClick={() => handleTabChange('active')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'active'
                ? 'bg-dark-600 text-fur-cream'
                : 'bg-dark-800 text-fur-cream/70 hover:text-fur-cream hover:bg-dark-700'
            }`}
          >
            <span className="whitespace-nowrap">Active</span>
            {activeTab === 'active' && signalsData?.pagination && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-dark-950/30 rounded-full text-xs">
                {signalsData.pagination.total}
              </span>
            )}
            {activeTab === 'inactive' && otherTabData?.pagination && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-dark-700 rounded-full text-xs">
                {otherTabData.pagination.total}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('inactive')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'inactive'
                ? 'bg-dark-600 text-fur-cream'
                : 'bg-dark-800 text-fur-cream/70 hover:text-fur-cream hover:bg-dark-700'
            }`}
          >
            <span className="whitespace-nowrap">Expired / Inactive</span>
            {activeTab === 'inactive' && signalsData?.pagination && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-dark-950/30 rounded-full text-xs">
                {signalsData.pagination.total}
              </span>
            )}
            {activeTab === 'active' && otherTabData?.pagination && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-dark-700 rounded-full text-xs">
                {otherTabData.pagination.total}
              </span>
            )}
          </button>
        </div>
        
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
                      {activeTab === 'active' ? 'active signals' : 'expired/deactivated signals'}
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

      {/* Blacklist Confirmation Modal */}
      <Modal
        isOpen={blacklistModalOpen}
        onClose={handleCloseBlacklistModal}
        title={predictor?.isBlacklisted ? '🔓 Propose Unblacklist' : '🚫 Propose Blacklist'}
      >
        <div className="space-y-4">
          {/* Not yet submitted */}
          {!blacklistProposalSuccess && !blacklistState.error && (
            <>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <strong>⚠️ MultiSig Required</strong>
                </p>
                <p className="text-yellow-300/80 text-sm mt-1">
                  This will create a proposal on the smart contract. Two additional signers must approve on BscScan for the action to execute.
                </p>
              </div>
              
              <p className="text-fur-cream/80">
                {predictor?.isBlacklisted ? (
                  <>
                    Are you sure you want to propose <strong className="text-success-500">unblacklisting</strong> this predictor?
                    <br />
                    <span className="text-sm text-fur-cream/60 mt-1 block">
                      This will allow them to receive referral earnings again.
                    </span>
                  </>
                ) : (
                  <>
                    Are you sure you want to propose <strong className="text-red-400">blacklisting</strong> this predictor?
                    <br />
                    <span className="text-sm text-fur-cream/60 mt-1 block">
                      This will block referral earnings and sync to the database via webhook.
                    </span>
                  </>
                )}
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleCloseBlacklistModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant={predictor?.isBlacklisted ? 'primary' : 'danger'}
                  onClick={handleToggleBlacklist}
                  isLoading={isBlacklistLoading}
                  disabled={isBlacklistLoading}
                  className="flex-1"
                >
                  {isBlacklistLoading 
                    ? (blacklistState.isConfirming ? 'Confirming...' : 'Signing...') 
                    : (predictor?.isBlacklisted ? 'Propose Unblacklist' : 'Propose Blacklist')
                  }
                </Button>
              </div>
            </>
          )}

          {/* Error state */}
          {blacklistState.error && !blacklistProposalSuccess && (
            <>
              <div className={`rounded-lg p-4 ${blacklistState.isUserRejection ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className={`font-medium ${blacklistState.isUserRejection ? 'text-yellow-400' : 'text-red-400'}`}>
                  {blacklistState.isUserRejection ? '⚠️ Transaction Cancelled' : '❌ Transaction Failed'}
                </p>
                <p className={`text-sm mt-1 ${blacklistState.isUserRejection ? 'text-yellow-300/80' : 'text-red-300/80'}`}>
                  {blacklistState.error}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={handleCloseBlacklistModal} className="flex-1">
                  Close
                </Button>
                <Button variant="primary" onClick={resetBlacklist} className="flex-1">
                  Try Again
                </Button>
              </div>
            </>
          )}

          {/* Success state */}
          {blacklistProposalSuccess && (
            <>
              <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
                <p className="text-success-400 font-medium">
                  ✅ Proposal Created Successfully!
                </p>
                <p className="text-success-300/80 text-sm mt-2">
                  {blacklistProposalSuccess.isBlacklist 
                    ? 'Blacklist proposal has been submitted.'
                    : 'Unblacklist proposal has been submitted.'
                  }
                </p>
              </div>

              <div className="bg-dark-700 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-fur-cream/50 mb-1">Transaction Hash</p>
                  <a
                    href={getExplorerTxUrl(blacklistProposalSuccess.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-200 hover:underline break-all"
                  >
                    {blacklistProposalSuccess.txHash}
                  </a>
                </div>
                {blacklistProposalSuccess.actionId && (
                  <div>
                    <p className="text-xs text-fur-cream/50 mb-1">Action ID (for approvals)</p>
                    <p className="text-sm text-fur-cream/80 break-all font-mono">
                      {blacklistProposalSuccess.actionId}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Next Steps:</strong>
                </p>
                <ol className="text-blue-300/80 text-sm mt-2 list-decimal list-inside space-y-1">
                  <li>Go to PredictorAccessPass on BscScan</li>
                  <li>Connect as Signer 2 or 3</li>
                  <li>Call <code className="bg-dark-800 px-1 rounded">approveAction(actionId)</code></li>
                  <li>Repeat with the 3rd signer to execute</li>
                </ol>
              </div>

              <Button variant="secondary" onClick={handleCloseBlacklistModal} className="w-full">
                Close
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default PredictorProfilePage;
