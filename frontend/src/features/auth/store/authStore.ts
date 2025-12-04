/**
 * Auth Store
 *
 * Global state management for authentication using Zustand.
 * Handles JWT token storage, predictor profile, and auth state.
 *
 * @module features/auth/store/authStore
 *
 * PERSISTENCE:
 * State is persisted to localStorage via zustand/middleware/persist.
 * Key: 'signal-friend-auth'
 *
 * Additionally, the JWT token is stored separately at 'authToken'
 * for easy access by the axios interceptor.
 *
 * STATE SHAPE:
 * ```ts
 * {
 *   token: string | null,          // JWT token
 *   predictor: Predictor | null,   // User's predictor profile (if registered)
 *   isAuthenticated: boolean,      // True after successful SIWE verification
 * }
 * ```
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Reading state
 * import { useAuthStore } from '@/features/auth/store';
 *
 * function Profile() {
 *   const predictor = useAuthStore((state) => state.predictor);
 *   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
 *
 *   if (!isAuthenticated) return <LoginPrompt />;
 *   return <div>{predictor?.displayName}</div>;
 * }
 *
 * // Updating state (typically done via useAuth hook)
 * const { setAuth, logout } = useAuthStore.getState();
 *
 * // After SIWE verification
 * setAuth(jwtToken, predictorData);
 *
 * // On logout
 * logout();
 *
 * // Partial predictor updates
 * const { updatePredictor } = useAuthStore.getState();
 * updatePredictor({ displayName: 'New Name' });
 * ```
 *
 * SELECTORS:
 * For performance, select only what you need:
 * ```tsx
 * // Good - only re-renders when isAuthenticated changes
 * const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
 *
 * // Avoid - re-renders on any state change
 * const state = useAuthStore();
 * ```
 *
 * ACTIONS:
 * - setAuth(token, predictor)    - Set auth after SIWE verification
 * - setPredictor(predictor)      - Replace predictor data entirely
 * - updatePredictor(updates)     - Partially update predictor data
 * - logout()                     - Clear all auth data
 */

import { create } from 'zustand';
// ...existing code...
import { persist } from 'zustand/middleware';
import type { Predictor } from '../../../shared/types';

interface AuthState {
  // State
  token: string | null;
  predictor: Predictor | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  
  // Actions
  setAuth: (token: string, predictor: Predictor | null) => void;
  setPredictor: (predictor: Predictor | null) => void;
  updatePredictor: (updates: Partial<Predictor>) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      predictor: null,
      isAuthenticated: false,
      _hasHydrated: false,

      /**
       * Set authentication after SIWE verification
       */
      setAuth: (token, predictor) => {
        // Also store token separately for axios interceptor
        localStorage.setItem('authToken', token);
        
        set({
          token,
          predictor,
          isAuthenticated: true,
        });
      },

      /**
       * Update predictor data
       */
      setPredictor: (predictor) => {
        set({ predictor });
      },

      /**
       * Partially update predictor data
       */
      updatePredictor: (updates) => {
        set((state) => ({
          predictor: state.predictor
            ? { ...state.predictor, ...updates }
            : null,
        }));
      },

      /**
       * Clear all auth data
       */
      logout: () => {
        localStorage.removeItem('authToken');
        
        set({
          token: null,
          predictor: null,
          isAuthenticated: false,
        });
      },
      
      /**
       * Set hydration status
       */
      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist token and predictor, derive isAuthenticated
      partialize: (state) => ({
        token: state.token,
        predictor: state.predictor,
      }),
      // onRehydrateStorage is called BEFORE rehydration starts
      // It returns a function that's called AFTER rehydration finishes
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[Auth Store] Rehydration error:', error);
          }
          if (state) {
            // Derive isAuthenticated from token
            state.isAuthenticated = !!state.token;
            // Set hydration flag directly on state
            state._hasHydrated = true;
          }
        };
      },
    }
  )
);

// Set hydration flag after store is created (handles case where no data was stored)
// This runs synchronously after the store is created
setTimeout(() => {
  const state = useAuthStore.getState();
  if (!state._hasHydrated) {
    useAuthStore.setState({ _hasHydrated: true });
  }
}, 0);

export default useAuthStore;
