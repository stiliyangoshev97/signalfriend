/**
 * Auth Store
 * 
 * Global state management for authentication using Zustand.
 * Handles JWT token, predictor profile, and auth state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Predictor } from '../../../shared/types';

interface AuthState {
  // State
  token: string | null;
  predictor: Predictor | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (token: string, predictor: Predictor | null) => void;
  setPredictor: (predictor: Predictor | null) => void;
  updatePredictor: (updates: Partial<Predictor>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      predictor: null,
      isAuthenticated: false,

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
    }),
    {
      name: 'auth-storage',
      // Only persist token and predictor, derive isAuthenticated
      partialize: (state) => ({
        token: state.token,
        predictor: state.predictor,
      }),
      // Rehydrate isAuthenticated from token
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    }
  )
);

export default useAuthStore;
