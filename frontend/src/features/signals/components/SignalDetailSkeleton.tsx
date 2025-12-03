/**
 * @fileoverview Loading skeleton for Signal Detail Page
 * @module features/signals/components/SignalDetailSkeleton
 * @description
 * Displays a placeholder skeleton while the signal detail data is loading.
 * Matches the layout of the actual SignalDetailPage for a smooth transition.
 */

/**
 * SignalDetailSkeleton component
 * 
 * Shows animated placeholder elements matching the signal detail layout.
 * 
 * @returns Skeleton loading element
 * 
 * @example
 * if (isLoading) return <SignalDetailSkeleton />;
 */
export function SignalDetailSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-dark-700 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and badges */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 w-20 bg-dark-700 rounded-full" />
              <div className="h-6 w-24 bg-dark-700 rounded-full" />
            </div>
            <div className="h-8 w-3/4 bg-dark-700 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-dark-700 rounded" />
              <div className="h-4 w-5/6 bg-dark-700 rounded" />
              <div className="h-4 w-4/6 bg-dark-700 rounded" />
            </div>
          </div>

          {/* Signal details */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="h-6 w-32 bg-dark-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-dark-700 rounded" />
                  <div className="h-6 w-28 bg-dark-700 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Content placeholder */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="h-6 w-40 bg-dark-700 rounded mb-4" />
            <div className="h-32 w-full bg-dark-700 rounded" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Price card */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="h-10 w-32 bg-dark-700 rounded mb-4" />
            <div className="h-12 w-full bg-dark-700 rounded mb-4" />
            <div className="h-4 w-full bg-dark-700 rounded" />
          </div>

          {/* Predictor card */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="h-5 w-24 bg-dark-700 rounded mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-dark-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-5 w-28 bg-dark-700 rounded" />
                <div className="h-4 w-24 bg-dark-700 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-6 w-full bg-dark-700 rounded mb-1" />
                  <div className="h-3 w-full bg-dark-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignalDetailSkeleton;
