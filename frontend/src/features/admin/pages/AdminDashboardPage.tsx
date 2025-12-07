/**
 * @fileoverview Admin Dashboard Page
 * @module features/admin/pages/AdminDashboardPage
 * @description
 * Main admin dashboard with tabs for earnings, verifications, reports, and disputes.
 * Only accessible to admin wallet addresses.
 */

import { useState, useCallback } from 'react';
import { Spinner } from '@/shared/components/ui';
import {
  usePlatformEarnings,
  usePendingVerifications,
  useReports,
  useDisputes,
  useDisputeCounts,
  useBlacklistedPredictors,
  useUpdateReport,
  useUpdateDispute,
  useResolveDispute,
  useUpdateVerification,
  useUnblacklistPredictor,
} from '../hooks';
import {
  AdminStatsCard,
  VerificationRequestCard,
  ReportCard,
  DisputeCard,
  BlacklistedPredictorCard,
} from '../components';
import type { ReportStatus, DisputeStatus, ListReportsQuery, ListDisputesQuery } from '../types';

/**
 * Tab definition for admin dashboard
 */
type TabId = 'earnings' | 'verifications' | 'reports' | 'disputes' | 'blacklisted';

interface Tab {
  id: TabId;
  label: string;
  count?: number;
}

/**
 * AdminDashboardPage Component
 * 
 * Features:
 * - Platform earnings overview
 * - Pending verification requests
 * - Reports management with filtering
 * - Disputes management with status tracking
 */
export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('earnings');
  const [reportQuery, setReportQuery] = useState<ListReportsQuery>({ page: 1, limit: 10 });
  const [disputeQuery, setDisputeQuery] = useState<ListDisputesQuery>({ page: 1, limit: 10 });
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [expandedDisputeId, setExpandedDisputeId] = useState<string | null>(null);

  // Data fetching hooks
  const { data: earnings, isLoading: earningsLoading } = usePlatformEarnings();
  const { data: verifications, isLoading: verificationsLoading } = usePendingVerifications();
  const { data: reportsData, isLoading: reportsLoading } = useReports(reportQuery);
  const { data: disputesData, isLoading: disputesLoading } = useDisputes(disputeQuery);
  const { data: disputeCounts } = useDisputeCounts();
  const { data: blacklistedPredictors, isLoading: blacklistedLoading } = useBlacklistedPredictors();

  // Mutation hooks
  const updateReport = useUpdateReport();
  const updateDispute = useUpdateDispute();
  const resolveDispute = useResolveDispute();
  const updateVerification = useUpdateVerification();
  const unblacklistPredictor = useUnblacklistPredictor();

  // Tab configuration with counts
  const tabs: Tab[] = [
    { id: 'earnings', label: 'Earnings' },
    { id: 'verifications', label: 'Verifications', count: verifications?.length },
    { id: 'reports', label: 'Reports', count: reportsData?.pagination?.total },
    { id: 'disputes', label: 'Disputes', count: disputeCounts?.pending },
    { id: 'blacklisted', label: 'Blacklisted', count: blacklistedPredictors?.length },
  ];

  // Handlers
  const handleReportStatusUpdate = useCallback(
    async (reportId: string, status: ReportStatus, adminNotes?: string) => {
      await updateReport.mutateAsync({ reportId, data: { status, adminNotes } });
    },
    [updateReport]
  );

  const handleDisputeStatusUpdate = useCallback(
    async (disputeId: string, status: DisputeStatus, adminNotes?: string) => {
      await updateDispute.mutateAsync({ disputeId, data: { status, adminNotes } });
    },
    [updateDispute]
  );

  const handleDisputeResolve = useCallback(
    async (disputeId: string, adminNotes?: string) => {
      await resolveDispute.mutateAsync({ disputeId, adminNotes });
    },
    [resolveDispute]
  );

  const handleApproveVerification = useCallback(
    async (address: string) => {
      await updateVerification.mutateAsync({ address, approved: true });
    },
    [updateVerification]
  );

  const handleRejectVerification = useCallback(
    async (address: string) => {
      await updateVerification.mutateAsync({ address, approved: false });
    },
    [updateVerification]
  );

  const handleUnblacklist = useCallback(
    async (address: string) => {
      await unblacklistPredictor.mutateAsync(address);
    },
    [unblacklistPredictor]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fur-cream mb-2">Admin Dashboard</h1>
        <p className="text-gray-main">
          Manage platform earnings, verifications, reports, and disputes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-brand-400 border-b-2 border-brand-400 -mb-px'
                : 'text-gray-main hover:text-fur-cream'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-dark-700 text-gray-main'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="grid md:grid-cols-2 gap-6">
            <AdminStatsCard
              earnings={earnings || {
                fromPredictorJoins: 0,
                fromBuyerAccessFees: 0,
                fromCommissions: 0,
                total: 0,
                details: { totalPredictors: 0, totalPurchases: 0, totalSignalVolume: 0 },
              }}
              isLoading={earningsLoading}
            />
            
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-fur-cream mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-main">Pending Verifications</span>
                  <span className="text-fur-cream font-mono">{verifications?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-main">Pending Disputes</span>
                  <span className="text-fur-cream font-mono">{disputeCounts?.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-main">Contacted Disputes</span>
                  <span className="text-fur-cream font-mono">{disputeCounts?.contacted || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            {verificationsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !verifications?.length ? (
              <div className="text-center py-12">
                <p className="text-gray-main">No pending verification requests.</p>
              </div>
            ) : (
              verifications.map((verification) => (
                <VerificationRequestCard
                  key={verification.walletAddress}
                  verification={verification}
                  onApprove={handleApproveVerification}
                  onReject={handleRejectVerification}
                  isProcessing={updateVerification.isPending}
                />
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <select
                value={reportQuery.status || ''}
                onChange={(e) =>
                  setReportQuery({
                    ...reportQuery,
                    status: e.target.value as ReportStatus || undefined,
                    page: 1,
                  })
                }
                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-fur-cream focus:outline-none focus:border-brand-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Reports List */}
            {reportsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !reportsData?.reports?.length ? (
              <div className="text-center py-12">
                <p className="text-gray-main">No reports found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportsData.reports.map((report) => (
                  <ReportCard
                    key={report._id}
                    report={report}
                    onUpdateStatus={handleReportStatusUpdate}
                    isExpanded={expandedReportId === report._id}
                    onToggleExpand={() =>
                      setExpandedReportId(
                        expandedReportId === report._id ? null : report._id
                      )
                    }
                  />
                ))}

                {/* Pagination */}
                {reportsData?.pagination && reportsData.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() =>
                        setReportQuery({ ...reportQuery, page: (reportQuery.page || 1) - 1 })
                      }
                      disabled={(reportQuery.page || 1) <= 1}
                      className="px-3 py-1 text-sm bg-dark-700 text-fur-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-main">
                      Page {reportQuery.page || 1} of {reportsData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setReportQuery({ ...reportQuery, page: (reportQuery.page || 1) + 1 })
                      }
                      disabled={(reportQuery.page || 1) >= reportsData.pagination.totalPages}
                      className="px-3 py-1 text-sm bg-dark-700 text-fur-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <select
                value={disputeQuery.status || ''}
                onChange={(e) =>
                  setDisputeQuery({
                    ...disputeQuery,
                    status: e.target.value as DisputeStatus || undefined,
                    page: 1,
                  })
                }
                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-fur-cream focus:outline-none focus:border-brand-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Disputes List */}
            {disputesLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !disputesData?.disputes?.length ? (
              <div className="text-center py-12">
                <p className="text-gray-main">No disputes found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputesData.disputes.map((dispute) => (
                  <DisputeCard
                    key={dispute._id}
                    dispute={dispute}
                    onUpdateStatus={handleDisputeStatusUpdate}
                    onResolve={handleDisputeResolve}
                    isExpanded={expandedDisputeId === dispute._id}
                    onToggleExpand={() =>
                      setExpandedDisputeId(
                        expandedDisputeId === dispute._id ? null : dispute._id
                      )
                    }
                  />
                ))}

                {/* Pagination */}
                {disputesData?.pagination && disputesData.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() =>
                        setDisputeQuery({ ...disputeQuery, page: (disputeQuery.page || 1) - 1 })
                      }
                      disabled={(disputeQuery.page || 1) <= 1}
                      className="px-3 py-1 text-sm bg-dark-700 text-fur-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-main">
                      Page {disputeQuery.page || 1} of {disputesData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setDisputeQuery({ ...disputeQuery, page: (disputeQuery.page || 1) + 1 })
                      }
                      disabled={(disputeQuery.page || 1) >= disputesData.pagination.totalPages}
                      className="px-3 py-1 text-sm bg-dark-700 text-fur-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Blacklisted Tab */}
        {activeTab === 'blacklisted' && (
          <div className="space-y-4">
            {blacklistedLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !blacklistedPredictors?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-green-500/50">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-main">No blacklisted predictors.</p>
                <p className="text-sm text-gray-main/70 mt-1">All predictors are in good standing.</p>
              </div>
            ) : (
              blacklistedPredictors.map((predictor) => (
                <BlacklistedPredictorCard
                  key={predictor._id}
                  predictor={predictor}
                  onUnblacklist={handleUnblacklist}
                  isProcessing={unblacklistPredictor.isPending}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
