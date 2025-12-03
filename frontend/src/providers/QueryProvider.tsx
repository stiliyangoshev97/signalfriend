/**
 * React Query Provider
 *
 * Configures TanStack Query (React Query) for server state management.
 * Handles caching, background refetching, and request deduplication.
 *
 * @module providers/QueryProvider
 *
 * DEFAULT CONFIGURATION:
 * Queries:
 * - refetchOnWindowFocus: false - Prevents excessive API calls
 * - retry: 1 - Retry failed requests once before failing
 * - staleTime: 5 minutes - Data considered fresh for 5 minutes
 * - gcTime: 10 minutes - Unused data cached for 10 minutes
 *
 * Mutations:
 * - retry: 1 - Retry failed mutations once
 *
 * WHY CREATE QUERYCLIENT IN COMPONENT?
 * Creating QueryClient inside the component (with useState) prevents
 * issues with SSR and ensures each request gets a fresh client.
 * This is the pattern recommended by TanStack Query docs.
 *
 * USAGE:
 * ```tsx
 * // In App.tsx - QueryProvider should wrap Web3Provider
 * import { QueryProvider, Web3Provider } from '@/providers';
 *
 * function App() {
 *   return (
 *     <QueryProvider>
 *       <Web3Provider>
 *         <App />
 *       </Web3Provider>
 *     </QueryProvider>
 *   );
 * }
 *
 * // In components - use React Query hooks
 * import { useQuery, useMutation } from '@tanstack/react-query';
 *
 * function SignalList() {
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['signals'],
 *     queryFn: fetchSignals,
 *   });
 *   // ...
 * }
 * ```
 *
 * CONFIGURATION RATIONALE:
 * - refetchOnWindowFocus: false → Web3 apps often have wallet popups
 *   that would trigger unnecessary refetches
 * - staleTime: 5min → Balance between freshness and API calls
 * - gcTime: 10min → Keep data around for quick navigation back
 *
 * @see https://tanstack.com/query/latest/docs/react/overview
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient inside component to avoid SSR issues
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus (reduces API calls)
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Data is fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
