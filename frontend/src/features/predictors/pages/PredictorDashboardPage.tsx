/**
 * @fileoverview Predictor Dashboard Page
 * @module features/predictors/pages/PredictorDashboardPage
 * @description
 * Main dashboard page for predictors to:
 * - View their stats (signals, sales, earnings, rating)
 * - Manage their signals (view, deactivate, reactivate)
 * - Create new signals
 * 
 * Protected by PredictorRoute guard.
 */

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, Button, Badge, Modal } from '@/shared/components/ui';
import { useAuthStore } from '@/features/auth/store';
import { useIsVerifiedPredictor } from '@/shared/hooks';
import { 
  useMySignals, 
  useMyEarnings,
  useDeactivateSignal,
  useReactivateSignal,
} from '../hooks';
import { DashboardStats, MySignalCard, CreateSignalModal } from '../components';

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
          Start sharing your trading insights with the community. Create your first signal to begin earning.
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
  const { address: _address } = useAccount();
  const predictor = useAuthStore((state) => state.predictor);
  const isVerified = useIsVerifiedPredictor();
  
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [signalFilter, setSignalFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [signalToDeactivate, setSignalToDeactivate] = useState<{ contentId: string; title: string } | null>(null);
  
  // Data fetching
  const { 
    data: signalsResponse, 
    isLoading: signalsLoading,
    refetch: refetchSignals,
  } = useMySignals({ 
    includeInactive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const { 
    data: earnings, 
    isLoading: earningsLoading,
  } = useMyEarnings();
  
  // Mutations
  const { mutate: deactivateSignal, isPending: isDeactivating } = useDeactivateSignal();
  const { mutate: reactivateSignal, isPending: isReactivating } = useReactivateSignal();
  
  const isActionPending = isDeactivating || isReactivating;
  
  // Process signals data - signalsResponse is now directly an array
  const signals = signalsResponse || [];
  const activeSignals = signals.filter(s => s.isActive && new Date(s.expiresAt) > new Date());
  const inactiveSignals = signals.filter(s => !s.isActive || new Date(s.expiresAt) <= new Date());
  
  // Filter signals based on selection
  const filteredSignals = signalFilter === 'all' 
    ? signals 
    : signalFilter === 'active' 
      ? activeSignals 
      : inactiveSignals;
  
  // Calculate stats
  const totalSignals = signals.length;
  const totalSales = signals.reduce((sum, s) => sum + s.totalSales, 0);
  const totalEarnings = earnings?.totalEarnings || signals.reduce((sum, s) => sum + (s.priceUsdt * 0.95 * s.totalSales), 0);
  const averageRating = predictor?.averageRating || 0;
  const totalReviews = predictor?.totalReviews || signals.reduce((sum, s) => sum + s.totalReviews, 0);
  
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
    refetchSignals();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-fur-cream">
              Predictor Dashboard
            </h1>
            {isVerified ? (
              <Badge variant="success" className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </Badge>
            ) : predictor?.verificationStatus === 'pending' ? (
              <Badge variant="warning">Verification Pending</Badge>
            ) : null}
          </div>
          <p className="text-fur-cream/60">
            Welcome back{predictor?.displayName ? `, ${predictor.displayName}` : ''}! Manage your signals and track your performance.
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Signal
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <DashboardStats
          totalSignals={totalSignals}
          activeSignals={activeSignals.length}
          totalSales={totalSales}
          totalEarnings={totalEarnings}
          averageRating={averageRating}
          totalReviews={totalReviews}
          isLoading={signalsLoading || earningsLoading}
        />
      </div>

      {/* Published Signals Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-fur-cream">Published Signals</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSignalFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                signalFilter === 'all'
                  ? 'bg-fur-light text-dark-900'
                  : 'bg-dark-700 text-fur-cream/60 hover:text-fur-cream'
              }`}
            >
              All ({signals.length})
            </button>
            <button
              onClick={() => setSignalFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                signalFilter === 'active'
                  ? 'bg-success-500 text-white'
                  : 'bg-dark-700 text-fur-cream/60 hover:text-fur-cream'
              }`}
            >
              Active ({activeSignals.length})
            </button>
            <button
              onClick={() => setSignalFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                signalFilter === 'inactive'
                  ? 'bg-gray-500 text-white'
                  : 'bg-dark-700 text-fur-cream/60 hover:text-fur-cream'
              }`}
            >
              Inactive ({inactiveSignals.length})
            </button>
          </div>
        </div>

        {/* Signals Content */}
        {signalsLoading ? (
          <SignalsLoadingSkeleton />
        ) : signals.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : filteredSignals.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-fur-cream/60">
              No {signalFilter} signals found.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSignals.map((signal) => (
              <MySignalCard
                key={signal.contentId}
                signal={signal}
                onDeactivate={handleDeactivate}
                onReactivate={handleReactivate}
                isActionPending={isActionPending}
              />
            ))}
          </div>
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
    </div>
  );
}
