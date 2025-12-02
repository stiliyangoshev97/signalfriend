/**
 * Sentry Error Tracking Provider
 * 
 * Initializes Sentry for error tracking in production.
 * Provides error boundary for React errors.
 */

import { useEffect, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { env } from '../shared/config/env';

// Initialize Sentry (only in production with DSN)
if (env.IS_PROD && env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    
    // Performance monitoring
    tracesSampleRate: 0.1, // Sample 10% of transactions
    
    // Session replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Environment
    environment: env.IS_PROD ? 'production' : 'development',
    
    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors
      'Network request failed',
      'Failed to fetch',
      // User cancelled
      'User rejected',
      'User denied',
    ],
    
    // Don't send PII
    beforeSend(event) {
      // Remove sensitive data from errors
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
      }
      return event;
    },
  });
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Fallback UI when an error occurs
 */
function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-dark-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-dark-400 mb-6">
          We've been notified and are working on a fix.
        </p>
        
        {env.IS_DEV && (
          <pre className="text-left text-xs text-error-400 bg-dark-800 p-4 rounded-lg mb-6 overflow-auto">
            {error.message}
          </pre>
        )}
        
        <button
          onClick={resetError}
          className="px-6 py-3 bg-brand-500 text-dark-900 font-semibold rounded-lg hover:bg-brand-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

interface SentryProviderProps {
  children: ReactNode;
}

/**
 * Error boundary wrapper using Sentry
 */
export function SentryProvider({ children }: SentryProviderProps) {
  // Log initialization in dev
  useEffect(() => {
    if (env.IS_DEV) {
      console.log('🔍 Sentry:', env.SENTRY_DSN ? 'Configured' : 'Not configured (set VITE_SENTRY_DSN)');
    }
  }, []);

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error as Error} resetError={resetError} />
      )}
      onError={(error) => {
        console.error('React Error Boundary caught:', error);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

export default SentryProvider;
