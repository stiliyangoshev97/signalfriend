/**
 * @fileoverview Dashboard statistics component
 * @module features/predictors/components/DashboardStats
 * @description
 * Displays key statistics for the predictor dashboard:
 * - Total signals created
 * - Active vs inactive signals
 * - Total sales
 * - Total earnings
 * - Average rating
 */

import { Card } from '@/shared/components/ui';

/** Props for DashboardStats component */
interface DashboardStatsProps {
  /** Total number of signals created */
  totalSignals: number;
  /** Number of currently active signals */
  activeSignals: number;
  /** Total number of sales across all signals */
  totalSales: number;
  /** Total earnings in USDT */
  totalEarnings: number;
  /** Average rating (1-5) */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Individual stat card component
 */
function StatCard({
  label,
  value,
  subValue,
  icon,
  colorClass = 'text-fur-cream',
  isLoading,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  colorClass?: string;
  isLoading?: boolean;
}) {
  return (
    <Card padding="md" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5 [&>svg]:w-full [&>svg]:h-full">
        {icon}
      </div>
      
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-dark-700 ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-fur-cream/60 mb-1">{label}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-dark-700 rounded animate-pulse" />
          ) : (
            <>
              <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
              {subValue && (
                <p className="text-xs text-fur-cream/50 mt-1">{subValue}</p>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Star rating display
 */
function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-fur-light'
              : i === fullStars && hasHalfStar
              ? 'text-fur-light/50'
              : 'text-dark-600'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-fur-cream/60 ml-1">
        ({reviews} {reviews === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}

/**
 * DashboardStats component
 * 
 * Displays a grid of statistics cards for the predictor dashboard.
 * 
 * @param props - Component props
 * @returns Stats grid element
 * 
 * @example
 * <DashboardStats
 *   totalSignals={10}
 *   activeSignals={8}
 *   totalSales={156}
 *   totalEarnings={3890.50}
 *   averageRating={4.5}
 *   totalReviews={42}
 * />
 */
export function DashboardStats({
  totalSignals,
  activeSignals,
  totalSales,
  totalEarnings,
  averageRating,
  totalReviews,
  isLoading,
}: DashboardStatsProps): React.ReactElement {
  const inactiveSignals = totalSignals - activeSignals;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Signals Count */}
      <StatCard
        label="Total Signals"
        value={totalSignals}
        subValue={`${activeSignals} active, ${inactiveSignals} inactive`}
        colorClass="text-fur-light"
        isLoading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />

      {/* Total Sales */}
      <StatCard
        label="Total Sales"
        value={totalSales}
        subValue="Signals purchased"
        colorClass="text-success-400"
        isLoading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />

      {/* Earnings */}
      <StatCard
        label="Total Earnings"
        value={`$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subValue="USDT"
        colorClass="text-brand-400"
        isLoading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Rating */}
      <Card padding="md" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-dark-700 text-fur-light">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-fur-cream/60 mb-1">Average Rating</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-dark-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-fur-light mb-1">
                  {averageRating.toFixed(1)}
                </p>
                <StarRating rating={averageRating} reviews={totalReviews} />
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
