/**
 * @fileoverview Admin feature TypeScript types
 * @module features/admin/types
 * @description
 * Types for admin dashboard, reports, disputes, and earnings.
 */

// ============================================
// Platform Earnings Types
// ============================================

export interface PlatformEarnings {
  /** Earnings from predictor join fees (after referral bonuses) */
  fromPredictorJoins: number;
  /** Earnings from buyer access fees ($0.50 per purchase) */
  fromBuyerAccessFees: number;
  /** Earnings from commissions (5% of signal prices) */
  fromCommissions: number;
  /** Total platform earnings */
  total: number;
  /** Breakdown details */
  details: {
    totalPredictors: number;
    totalPurchases: number;
    totalSignalVolume: number;
  };
}

// ============================================
// Report Types
// ============================================

export const REPORT_REASONS = [
  'false_signal',
  'misleading_info',
  'scam',
  'duplicate_content',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface AdminReport {
  _id: string;
  tokenId: number;
  contentId: string;
  reporterAddress: string;
  predictorAddress: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  signal?: {
    title: string;
    contentId: string;
    priceUsdt: number;
  };
  predictor?: {
    displayName: string;
    walletAddress: string;
    preferredContact: string;
    socialLinks: {
      telegram?: string;
      discord?: string;
    };
  };
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  predictorAddress?: string;
}

export interface UpdateReportRequest {
  status: ReportStatus;
  adminNotes?: string;
}

// ============================================
// Dispute Types
// ============================================

export type DisputeStatus = 'pending' | 'contacted' | 'resolved' | 'rejected';

export interface AdminDispute {
  _id: string;
  predictorAddress: string;
  status: DisputeStatus;
  adminNotes: string;
  createdAt: string;
  resolvedAt?: string;
  predictor?: {
    displayName: string;
    walletAddress: string;
    preferredContact: string;
    socialLinks: {
      telegram?: string;
      discord?: string;
    };
    totalSales: number;
    totalSignals: number;
  };
}

export interface AdminDisputesResponse {
  disputes: AdminDispute[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DisputeCounts {
  pending: number;
  contacted: number;
  resolved: number;
  rejected: number;
  total: number;
}

export interface ListDisputesQuery {
  page?: number;
  limit?: number;
  status?: DisputeStatus;
}

export interface UpdateDisputeRequest {
  status: DisputeStatus;
  adminNotes?: string;
}

// ============================================
// Predictor Dispute (for non-admin use)
// ============================================

export interface PredictorDispute {
  _id: string;
  predictorAddress: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
}

// ============================================
// Verification Types
// ============================================

export interface PendingVerification {
  walletAddress: string;
  displayName: string;
  bio: string;
  preferredContact: string;
  socialLinks: {
    telegram?: string;
    discord?: string;
    twitter?: string;
    website?: string;
  };
  verificationStatus: 'pending';
  verificationRequestedAt: string;
  joinedAt: string;
  totalSales: number;
  totalSignals: number;
  totalEarnings: number;
}

// ============================================
// Admin Predictor Profile Types (with contact info)
// ============================================

export interface AdminPredictorProfile {
  _id: string;
  walletAddress: string;
  tokenId: number;
  displayName: string;
  displayNameChanged: boolean;
  bio: string;
  avatarUrl: string;
  socialLinks: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  preferredContact?: 'telegram' | 'discord';
  categoryIds: Array<{ _id: string; name: string; slug: string; icon: string }>;
  totalSignals: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  isBlacklisted: boolean;
  isVerified: boolean;
  verificationStatus?: 'none' | 'pending' | 'rejected';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Earnings data (admin only) */
  earnings?: {
    totalSalesRevenue: number;
    predictorEarnings: number;
    platformCommission: number;
    totalSalesCount: number;
    totalReferrals: number;
    paidReferrals: number;
    referralEarnings: number;
    totalEarnings: number;
  };
}

// ============================================
// Blacklisted Predictor Types
// ============================================

export interface BlacklistedPredictor {
  _id: string;
  walletAddress: string;
  displayName: string;
  totalSignals: number;
  totalSales: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}
