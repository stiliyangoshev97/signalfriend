/**
 * @fileoverview Predictor Dashboard Page
 * @module features/predictors/pages/PredictorDashboardPage
 * @description
 * Main dashboard page for predictors to:
 * - View their stats (signals, sales, earnings, rating)
 * - Manage their signals (view, deactivate, reactivate)
 * - Create new signals
 * - Edit their profile
 * 
 * Protected by PredictorRoute guard.
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Card, Button, Badge, Modal } from '@/shared/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useIsVerifiedPredictor } from '@/shared/hooks';
import { useSEO, getSEOUrl } from '@/shared/hooks';
import { 
  useMySignalsPaginated, 
  useMyEarnings,
  useDeactivateSignal,
  useReactivateSignal,
  useApplyForVerification,
} from '../hooks';
import { fetchPredictorByAddress } from '../api';
import { DashboardStats, MySignalCard, CreateSignalModal, EditProfileModal, BlacklistBanner } from '../components';
import { Pagination } from '@/features/signals/components/Pagination';

/**
 * Empty state component for no signals
 */
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card padding="lg" className="text-center">
      <div className="flex flex-col items-center py-8">
        <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-fur-cream/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-fur-cream mb-2">
          No signals yet
        </h3>
        <p className="text-fur-cream/60 mb-6 max-w-md">
          Start sharing your prediction insights with the community. Create your first signal to begin earning.
        </p>
        <Button onClick={onCreateClick} size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Signal
        </Button>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for signals grid
 */
function SignalsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} padding="none" className="animate-pulse">
          <div className="h-1 bg-dark-600" />
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-dark-700 rounded-full" />
              <div className="h-5 w-14 bg-dark-700 rounded-full" />
            </div>
            <div className="h-6 bg-dark-700 rounded w-3/4" />
            <div className="h-4 bg-dark-700 rounded w-full" />
            <div className="h-4 bg-dark-700 rounded w-2/3" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-dark-700 rounded-lg" />
              <div className="h-16 bg-dark-700 rounded-lg" />
              <div className="h-16 bg-dark-700 rounded-lg" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * PredictorDashboardPage component
 * 
 * Main dashboard for predictor users showing:
 * - Welcome header with verification status
 * - Stats overview (signals, sales, earnings, rating)
 * - My Signals section with management capabilities
 * - Create Signal modal
 * 
 * @returns Dashboard page element
 */
export function PredictorDashboardPage(): React.ReactElement {
  // SEO for dashboard - noIndex since it's a private page
  useSEO({
    title: 'Predictor Dashboard',
    description: 'Manage your prediction signals, view earnings, and track your performance as a SignalFriend predictor.',
    url: getSEOUrl('/dashboard'),
    noIndex: true, // Don't index private dashboard pages
  });

  const { address: _address } = useAccount();
  const predictor = useAuthStore((state) => state.predictor);
  const setPredictor = useAuthStore((state) => state.setPredictor);
  const isVerified = useIsVerifiedPredictor();
  
  // Refresh predictor data from backend on mount to ensure auth store has latest verification status
  useEffect(() => {
    const refreshPredictorData = async () => {
      if (predictor?.walletAddress) {
        try {
          const freshData = await fetchPredictorByAddress(predictor.walletAddress);
          setPredictor(freshData);
        } catch (error) {
          console.error('Failed to refresh predictor data:', error);
        }
      }
    };
    refreshPredictorData();
  }, []); // Only run once on mount
  
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [signalFilter, setSignalFilter] = useState<'active' | 'expired' | 'deactivated'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [signalToDeactivate, setSignalToDeactivate] = useState<{ contentId: string; title: string } | null>(null);
  
  // Ref for scrolling to signals section after creation
  const signalsSectionRef = useRef<HTMLDivElement>(null);
  
  const SIGNALS_PER_PAGE = 12;
  
  // Data fetching - use paginated API for current tab
  const { 
    data: signalsResponse, 
    isLoading: signalsLoading,
    refetch: refetchSignals,
  } = useMySignalsPaginated({ 
    status: signalFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: currentPage,
    limit: SIGNALS_PER_PAGE,
  });
  
  // Fetch counts for all tabs (lightweight queries just for counts)
  const { data: activeCountData } = useMySignalsPaginated({ status: 'active', page: 1, limit: 1 });
  const { data: expiredCountData } = useMySignalsPaginated({ status: 'expired', page: 1, limit: 1 });
  const { data: deactivatedCountData } = useMySignalsPaginated({ status: 'deactivated', page: 1, limit: 1 });
  
  const { 
    data: earnings, 
    isLoading: earningsLoading,
  } = useMyEarnings();
  
  // Mutations
  const { mutate: deactivateSignal, isPending: isDeactivating } = useDeactivateSignal();
  const { mutate: reactivateSignal, isPending: isReactivating } = useReactivateSignal();
  const { mutate: applyForVerification, isPending: isApplyingForVerification } = useApplyForVerification();
  
  const isActionPending = isDeactivating || isReactivating;
  
  // Process signals data - signalsResponse is now paginated
  const signals = signalsResponse?.data || [];
  const pagination = signalsResponse?.pagination;
  
  // Get counts from tab queries
  const activeCount = activeCountData?.pagination?.total ?? 0;
  const expiredCount = expiredCountData?.pagination?.total ?? 0;
  const deactivatedCount = deactivatedCountData?.pagination?.total ?? 0;
  
  // Calculate stats
  const totalSignals = activeCount + expiredCount + deactivatedCount;
  
  // Use earnings API as primary source (fetched fresh on this page)
  // Fall back to predictor.totalSales (from auth store, may be stale)
  const totalSales = earnings?.totalSalesCount 
    ?? predictor?.totalSales 
    ?? 0;
  
  // Use earnings API for total earnings (most accurate, fetched fresh)
  // Only fall back to calculation if earnings hasn't loaded yet
  // Using explicit undefined check to allow 0 as a valid value
  const totalEarnings = earnings?.totalEarnings !== undefined 
    ? earnings.totalEarnings 
    : 0;
  
  const averageRating = predictor?.averageRating || 0;
  const totalReviews = predictor?.totalReviews || 0;
  
  // Referral earnings
  const referralEarnings = earnings?.referralEarnings || 0;
  const paidReferrals = earnings?.paidReferrals || 0;
  const hasReferralEarnings = paidReferrals > 0;
  
  // Verification requirements
  const MIN_SALES_FOR_VERIFICATION = 100;
  const MIN_EARNINGS_FOR_VERIFICATION = 1000;
  
  // Calculate verification progress
  const isRejected = predictor?.verificationStatus === 'rejected';
  
  // For rejected predictors, calculate progress since rejection
  const salesSinceRejection = isRejected 
    ? totalSales - (predictor?.salesAtLastApplication || 0)
    : totalSales;
  const earningsSinceRejection = isRejected 
    ? totalEarnings - (predictor?.earningsAtLastApplication || 0)
    : totalEarnings;
  
  // Use appropriate values for progress bars
  const displaySales = isRejected ? salesSinceRejection : totalSales;
  const displayEarnings = isRejected ? earningsSinceRejection : totalEarnings;
  
  // Calculate progress percentages (ensure minimum visibility when there's progress)
  // Use 5% minimum so small progress is visible
  const salesProgress = displaySales > 0 
    ? Math.max(5, Math.min((displaySales / MIN_SALES_FOR_VERIFICATION) * 100, 100))
    : 0;
  const earningsProgress = displayEarnings > 0 
    ? Math.max(5, Math.min((displayEarnings / MIN_EARNINGS_FOR_VERIFICATION) * 100, 100))
    : 0;
  
  const canApplyForVerification = displaySales >= MIN_SALES_FOR_VERIFICATION && displayEarnings >= MIN_EARNINGS_FOR_VERIFICATION;
  const showVerificationButton = !isVerified && predictor?.verificationStatus !== 'pending' && predictor?.verificationStatus !== 'rejected' && !predictor?.isBlacklisted;
  
  // Handlers
  const handleDeactivate = (contentId: string, title?: string) => {
    setSignalToDeactivate({ contentId, title: title || 'this signal' });
    setDeactivateModalOpen(true);
  };
  
  const confirmDeactivate = () => {
    if (signalToDeactivate) {
      deactivateSignal(signalToDeactivate.contentId);
      setDeactivateModalOpen(false);
      setSignalToDeactivate(null);
    }
  };
  
  const handleReactivate = (contentId: string) => {
    reactivateSignal(contentId);
  };
  
  const handleCreateSuccess = () => {
    // Ensure we're on the Active tab to see the new signal
    setSignalFilter('active');
    setCurrentPage(1);
    refetchSignals();
    
    // Scroll to the signals section after a short delay
    // to allow the modal to close and data to refetch
    setTimeout(() => {
      signalsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 400);
  };

  useEffect(() => {
    const refreshPredictorData = async () => {
      if (_address) {
        const updatedPredictor = await fetchPredictorByAddress(_address);
        useAuthStore.setState({ predictor: updatedPredictor });
      }
    };

    refreshPredictorData();
  }, [_address]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-fur-cream">
              Predictor Dashboard
            </h1>
            {/* Desktop only: Show badge next to title */}
            {isVerified ? (
              <Badge variant="success" className="hidden sm:flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </Badge>
            ) : predictor?.verificationStatus === 'pending' ? (
              <Badge variant="warning" className="hidden sm:inline-flex">Verification Pending</Badge>
            ) : null}
          </div>
          <p className="text-fur-cream/60">
            Welcome back{predictor?.displayName ? `, ${predictor.displayName}` : ''}! Manage your signals and track your performance.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to={`/predictors/${predictor?.walletAddress}`}>
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Profile
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowEditProfileModal(true)}
            disabled={predictor?.isBlacklisted}
            title={predictor?.isBlacklisted ? 'Cannot edit profile while blacklisted' : undefined}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profile
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)} 
            size="sm"
            disabled={predictor?.isBlacklisted}
            title={predictor?.isBlacklisted ? 'Cannot create signals while blacklisted' : undefined}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Signal
          </Button>
          {/* Mobile only: Show Verified/Pending badge in button row (after Create Signal) */}
          {isVerified && (
            <Badge variant="success" className="sm:hidden flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </Badge>
          )}
          {!isVerified && predictor?.verificationStatus === 'pending' && (
            <Badge variant="warning" className="sm:hidden">Verification Pending</Badge>
          )}
          {/* Get Verified button - only show when applicable */}
          {showVerificationButton && !isVerified && predictor?.verificationStatus !== 'pending' && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => applyForVerification()}
              disabled={!canApplyForVerification || isApplyingForVerification}
              title={!canApplyForVerification 
                ? `Requires ${MIN_SALES_FOR_VERIFICATION} sales (you have ${totalSales}) and $${MIN_EARNINGS_FOR_VERIFICATION} earnings (you have $${totalEarnings.toFixed(2)})`
                : 'Apply for verification badge'
              }
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {isApplyingForVerification ? 'Applying...' : 'Get Verified'}
            </Button>
          )}
        </div>
      </div>

      {/* Blacklist Banner */}
      {predictor?.isBlacklisted && (
        <BlacklistBanner preferredContact={predictor.preferredContact} />
      )}

      {/* Profile Incomplete Banner */}
      {predictor && (
        !predictor.displayName || 
        !predictor.bio || 
        !predictor.avatarUrl || 
        !predictor.socialLinks?.twitter ||
        !predictor.socialLinks?.telegram || 
        !predictor.socialLinks?.discord
      ) && (
        <div className="mb-6 p-4 bg-gradient-to-r from-brand-200/10 to-golden-500/10 border border-brand-200/30 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-200/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-fur-cream">Complete Your Profile</h3>
              <p className="mt-0.5 text-sm text-fur-cream/60">
                Fill in all profile fields (name, bio, avatar, X/Twitter, Telegram, Discord) to build trust with buyers.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowEditProfileModal(true)}
              className="flex-shrink-0"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Complete Profile
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8">
        <DashboardStats
          totalSignals={totalSignals}
          activeSignals={activeCount}
          totalSales={totalSales}
          totalEarnings={totalEarnings}
          averageRating={averageRating}
          totalReviews={totalReviews}
          isLoading={signalsLoading || earningsLoading}
        />
      </div>

      {/* Referral Earnings Card - Always show */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-brand-200/10 to-success-500/10 border-brand-200/30">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-200/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-fur-cream">Referral Earnings</h3>
                <p className="text-sm text-fur-cream/60">Your earnings from inviting new predictors</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-brand-200">{paidReferrals}</p>
                <p className="text-sm text-fur-cream/60">Successful Referrals</p>
              </div>
              <div className="bg-dark-900/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-success-500">${referralEarnings.toFixed(2)}</p>
                <p className="text-sm text-fur-cream/60">Referral Earnings</p>
              </div>
            </div>
            
            {hasReferralEarnings ? (
              <p className="mt-3 text-xs text-fur-cream/50">
                Earn $5 for each new predictor who joins using your address as referrer.
              </p>
            ) : (
              <div className="mt-3 p-3 bg-dark-900/30 rounded-lg">
                <p className="text-sm text-fur-cream/70">
                  <span className="font-medium text-brand-200">💡 Earn $5 per referral!</span> Share your wallet address with friends who want to become predictors. 
                  When they register as a new predictor using your address as their referrer, you'll earn $5 per successful referral.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Verification Progress Card - Show if not verified and not pending */}
      {showVerificationButton && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-dark-800 to-dark-700 border-dark-600">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-gold/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-fur-cream">Verification Progress</h3>
                  <p className="text-sm text-fur-cream/60">Complete these requirements to get verified</p>
                </div>
                {earningsLoading && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sales Progress */}
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-fur-cream/70">Total Sales</span>
                    <span className={`text-sm font-medium ${displaySales >= MIN_SALES_FOR_VERIFICATION ? 'text-success-500' : 'text-fur-cream'}`}>
                      {earningsLoading ? '...' : displaySales} / {MIN_SALES_FOR_VERIFICATION}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${displaySales >= MIN_SALES_FOR_VERIFICATION ? 'bg-success-500' : 'bg-accent-gold'}`}
                      style={{ width: `${earningsLoading ? 0 : salesProgress}%` }}
                    />
                  </div>
                  {!earningsLoading && displaySales >= MIN_SALES_FOR_VERIFICATION && (
                    <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Requirement met!
                    </p>
                  )}
                </div>

                {/* Earnings Progress */}
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-fur-cream/70">Total Earnings</span>
                    <span className={`text-sm font-medium ${displayEarnings >= MIN_EARNINGS_FOR_VERIFICATION ? 'text-success-500' : 'text-fur-cream'}`}>
                      {earningsLoading ? '...' : `$${displayEarnings.toFixed(2)}`} / ${MIN_EARNINGS_FOR_VERIFICATION}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${displayEarnings >= MIN_EARNINGS_FOR_VERIFICATION ? 'bg-success-500' : 'bg-accent-gold'}`}
                      style={{ width: `${earningsLoading ? 0 : earningsProgress}%` }}
                    />
                  </div>
                  {!earningsLoading && displayEarnings >= MIN_EARNINGS_FOR_VERIFICATION && (
                    <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Requirement met!
                    </p>
                  )}
                </div>
              </div>

              {canApplyForVerification && (
                <div className="mt-4 pt-4 border-t border-dark-600">
                  <p className="text-sm text-success-500 mb-3">
                    🎉 Congratulations! You've met all requirements. Apply for verification now!
                  </p>
                  <Button 
                    onClick={() => applyForVerification()}
                    disabled={isApplyingForVerification}
                    className="w-full sm:w-auto"
                  >
                    {isApplyingForVerification ? 'Applying...' : 'Apply for Verification'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Rejected Verification - Reapplication Progress Card */}
      {isRejected && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-red-900/20 to-dark-800 border-red-500/30">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Verification Rejected</h3>
                  <p className="text-sm text-fur-cream/60">Make 100 more sales and earn $1000 more to reapply</p>
                </div>
                {earningsLoading && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Additional Sales Needed */}
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-fur-cream/70">Additional Sales</span>
                    <span className={`text-sm font-medium ${salesSinceRejection >= MIN_SALES_FOR_VERIFICATION ? 'text-success-500' : 'text-fur-cream'}`}>
                      {earningsLoading ? '...' : salesSinceRejection} / {MIN_SALES_FOR_VERIFICATION}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${salesSinceRejection >= MIN_SALES_FOR_VERIFICATION ? 'bg-success-500' : 'bg-red-500'}`}
                      style={{ width: `${earningsLoading ? 0 : salesProgress}%` }}
                    />
                  </div>
                  {!earningsLoading && salesSinceRejection >= MIN_SALES_FOR_VERIFICATION && (
                    <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Requirement met!
                    </p>
                  )}
                </div>

                {/* Additional Earnings Needed */}
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-fur-cream/70">Additional Earnings</span>
                    <span className={`text-sm font-medium ${earningsSinceRejection >= MIN_EARNINGS_FOR_VERIFICATION ? 'text-success-500' : 'text-fur-cream'}`}>
                      {earningsLoading ? '...' : `$${earningsSinceRejection.toFixed(2)}`} / ${MIN_EARNINGS_FOR_VERIFICATION}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${earningsSinceRejection >= MIN_EARNINGS_FOR_VERIFICATION ? 'bg-success-500' : 'bg-red-500'}`}
                      style={{ width: `${earningsLoading ? 0 : earningsProgress}%` }}
                    />
                  </div>
                  {!earningsLoading && earningsSinceRejection >= MIN_EARNINGS_FOR_VERIFICATION && (
                    <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Requirement met!
                    </p>
                  )}
                </div>
              </div>

              {canApplyForVerification && (
                <div className="mt-4 pt-4 border-t border-red-500/30">
                  <p className="text-sm text-success-500 mb-3">
                    🎉 Great job! You've earned enough to reapply for verification!
                  </p>
                  <Button 
                    onClick={() => applyForVerification()}
                    disabled={isApplyingForVerification}
                    className="w-full sm:w-auto"
                  >
                    {isApplyingForVerification ? 'Applying...' : 'Reapply for Verification'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Published Signals Section */}
      <div ref={signalsSectionRef}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-fur-cream">Published Signals</h2>
          
          {/* Filter Tabs - Active/Expired/Deactivated */}
          <div className="flex gap-2">
            <button
              onClick={() => { setSignalFilter('active'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                signalFilter === 'active'
                  ? 'bg-success-500 text-white'
                  : 'bg-dark-700 text-fur-cream/60 hover:text-fur-cream'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => { setSignalFilter('expired'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                signalFilter === 'expired'
                  ? 'bg-amber-500 text-white'
                  : 'bg-dark-700 text-fur-cream/60 hover:text-fur-cream'
              }`}
            >
              Expired ({expiredCount})
            </button>
            <button
              onClick={() => { setSignalFilter('deactivated'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                signalFilter === 'deactivated'
                  ? 'bg-gray-500 text-white'
                  : 'bg-dark-700 text-fur-cream/60 hover:text-fur-cream'
              }`}
            >
              Deactivated ({deactivatedCount})
            </button>
          </div>
        </div>

        {/* Signals Content */}
        {signalsLoading ? (
          <SignalsLoadingSkeleton />
        ) : totalSignals === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : signals.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-fur-cream/60">
              No {signalFilter} signals found.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((signal) => (
                <MySignalCard
                  key={signal.contentId}
                  signal={signal}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                  isActionPending={isActionPending}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  pagination={pagination}
                  onPageChange={setCurrentPage}
                  itemLabel="signals"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Signal Modal */}
      <CreateSignalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => {
          setDeactivateModalOpen(false);
          setSignalToDeactivate(null);
        }}
        title="Deactivate Signal"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-accent-red/10 rounded-full">
            <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-fur-cream mb-2">
              Are you sure you want to deactivate{' '}
              <span className="font-semibold text-fur-light">
                "{signalToDeactivate?.title}"
              </span>
              ?
            </p>
            <p className="text-sm text-fur-cream/60">
              This signal will be hidden from the marketplace. Existing buyers will still have access to the content.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setDeactivateModalOpen(false);
                setSignalToDeactivate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={confirmDeactivate}
              disabled={isDeactivating}
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        predictor={predictor}
      />
    </div>
  );
}

export default PredictorDashboardPage;
