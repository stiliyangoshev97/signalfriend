/**
 * @fileoverview Admin Stats Card component
 * @module features/admin/components/AdminStatsCard
 * @description
 * Displays platform earnings breakdown in a visually appealing card.
 */

import { cn } from '@/shared/utils/cn';
import type { PlatformEarnings } from '../types';

interface AdminStatsCardProps {
  earnings: PlatformEarnings;
  isLoading?: boolean;
}

/**
 * Format a number as USD currency
 */
function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Stats row component for displaying a single earning source
 */
function StatsRow({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3',
        highlight && 'border-t border-dark-600 pt-4 mt-2'
      )}
    >
      <div>
        <span className={cn('text-sm', highlight ? 'text-fur-cream font-medium' : 'text-gray-main')}>
          {label}
        </span>
        {subtext && <p className="text-xs text-gray-dim mt-0.5">{subtext}</p>}
      </div>
      <span className={cn('font-mono', highlight ? 'text-lg text-brand-400 font-bold' : 'text-fur-cream')}>
        {value}
      </span>
    </div>
  );
}

/**
 * AdminStatsCard Component
 * 
 * Displays platform earnings breakdown with:
 * - Earnings from predictor joins ($15 per join)
 * - Earnings from buyer access fees ($0.50 per purchase)
 * - Earnings from commissions (5% of signal volume)
 * - Total earnings
 */
export function AdminStatsCard({ earnings, isLoading }: AdminStatsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-fur-cream mb-4">Platform Earnings</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-dark-600 rounded w-32"></div>
              <div className="h-4 bg-dark-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-fur-cream">Platform Earnings</h3>
        <span className="text-xs text-gray-dim bg-dark-700 px-2 py-1 rounded">
          All time
        </span>
      </div>

      <div className="space-y-1">
        <StatsRow
          label="From Predictor Joins"
          value={formatUSD(earnings.fromPredictorJoins)}
          subtext={`${earnings.details.totalPredictors} predictors × $15`}
        />
        
        <StatsRow
          label="From Buyer Access Fees"
          value={formatUSD(earnings.fromBuyerAccessFees)}
          subtext={`${earnings.details.totalPurchases} purchases × $0.50`}
        />
        
        <StatsRow
          label="From Commissions (5%)"
          value={formatUSD(earnings.fromCommissions)}
          subtext={`${formatUSD(earnings.details.totalSignalVolume)} total volume`}
        />
        
        <StatsRow
          label="Total Earnings"
          value={formatUSD(earnings.total)}
          highlight
        />
      </div>
    </div>
  );
}
