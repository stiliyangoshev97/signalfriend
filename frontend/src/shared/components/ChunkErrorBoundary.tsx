/**
 * ===== CHUNK ERROR BOUNDARY =====
 *
 * Handles chunk loading failures that occur after deployments.
 * When users have stale cached pages and try to navigate, the old
 * chunk references no longer exist on the server, causing errors like:
 * - "Failed to fetch dynamically imported module"
 * - "Loading chunk X failed"
 *
 * This component catches these errors and shows a friendly UI
 * prompting the user to refresh for the latest version.
 *
 * USAGE:
 * Add as errorElement on your router configuration:
 * ```tsx
 * createBrowserRouter([
 *   {
 *     path: '/',
 *     element: <RootLayout />,
 *     errorElement: <ChunkErrorBoundary />,
 *     children: [...]
 *   }
 * ])
 * ```
 *
 * @module shared/components/ChunkErrorBoundary
 */

import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

/**
 * Refresh icon SVG component
 */
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

/**
 * Alert circle icon SVG component
 */
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Checks if the error is related to chunk/module loading failures.
 * These errors typically occur after deployments when cached pages
 * reference old chunk files that no longer exist.
 */
function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('loading chunk') ||
      message.includes('loading css chunk') ||
      message.includes("dynamically imported module") ||
      message.includes('failed to load')
    );
  }
  return false;
}

/**
 * Handles the page refresh action.
 * Uses location.reload(true) to force a cache-busting refresh.
 */
function handleRefresh(): void {
  window.location.reload();
}

/**
 * ChunkErrorBoundary Component
 *
 * Displays a friendly "Update Available" UI when chunk loading fails,
 * or a generic error message for other route errors.
 */
export function ChunkErrorBoundary() {
  const error = useRouteError();

  // Check if this is a chunk loading error
  const isChunkError = isChunkLoadError(error);

  // For chunk errors, show the update available UI
  if (isChunkError) {
    return (
      <div className="min-h-screen bg-dark-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-800 border border-dark-600 rounded-xl p-8 shadow-xl text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-500/20 flex items-center justify-center">
            <RefreshIcon className="w-8 h-8 text-brand-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-fur-cream mb-3">
            Update Available
          </h1>

          {/* Description */}
          <p className="text-gray-main mb-6 leading-relaxed">
            A new version of SignalFriend is available. Please refresh the page
            to get the latest updates and continue using the app.
          </p>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
                       bg-brand-500 text-dark-900 font-semibold rounded-lg
                       hover:bg-brand-400 active:bg-brand-600 
                       shadow-lg shadow-brand-500/25
                       transition-all duration-200"
          >
            <RefreshIcon className="w-5 h-5" />
            Refresh Page
          </button>

          {/* Subtle note */}
          <p className="mt-6 text-sm text-dark-400">
            This usually happens after we deploy updates.
          </p>
        </div>
      </div>
    );
  }

  // For other errors, show a generic error UI
  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} - ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

  return (
    <div className="min-h-screen bg-dark-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-800 border border-dark-600 rounded-xl p-8 shadow-xl text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error-500/20 flex items-center justify-center">
          <AlertIcon className="w-8 h-8 text-error-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-fur-cream mb-3">
          Something Went Wrong
        </h1>

        {/* Error message */}
        <p className="text-gray-main mb-6 leading-relaxed">
          {errorMessage}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
                       bg-dark-700 text-dark-100 font-medium rounded-lg
                       border border-dark-600
                       hover:bg-dark-600 
                       transition-all duration-200"
          >
            <RefreshIcon className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
                       bg-brand-500 text-dark-900 font-medium rounded-lg
                       hover:bg-brand-400 
                       shadow-lg shadow-brand-500/25
                       transition-all duration-200"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default ChunkErrorBoundary;
