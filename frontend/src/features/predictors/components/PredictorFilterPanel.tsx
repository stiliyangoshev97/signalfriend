/**
 * @fileoverview Predictor Filter Panel component
 * @module features/predictors/components/PredictorFilterPanel
 * @description
 * Sidebar filter panel for the predictors leaderboard page.
 * Matches the style of the signals FilterPanel.
 */

import { useState, useEffect, useRef } from 'react';
import type { PredictorFilters } from '../api';

/** Props for PredictorFilterPanel component */
interface PredictorFilterPanelProps {
  /** Current filter values */
  filters: PredictorFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: PredictorFilters) => void;
  /** Whether panel is open (mobile) */
  isOpen?: boolean;
  /** Callback to close panel (mobile) */
  onClose?: () => void;
}

/**
 * PredictorFilterPanel component
 * 
 * Provides filtering options:
 * - Search by name
 * - Sort by dropdown
 * - Quick filter buttons
 * - Reset filters button
 * 
 * @param props - Component props
 * @returns Filter panel element
 */
export function PredictorFilterPanel({
  filters,
  onFiltersChange,
  isOpen = true,
  onClose,
}: PredictorFilterPanelProps): React.ReactElement | null {
  const [localFilters, setLocalFilters] = useState<PredictorFilters>(filters);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  // Use a ref to track user-initiated changes without triggering re-renders
  // This prevents the useEffect from overwriting user's cleared input
  const isUserEditingRef = useRef(false);

  // Sync local filters with props when external filters change (e.g., URL navigation)
  // Skip syncing if user is actively editing
  useEffect(() => {
    // Only sync if this is an external change (not from user editing)
    if (!isUserEditingRef.current) {
      setLocalFilters(filters);
      setSearchInput(filters.search || '');
    }
  }, [filters]);

  // Update filter helper
  const updateFilter = <K extends keyof PredictorFilters>(
    key: K,
    value: PredictorFilters[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    // Remove empty values
    if (value === '' || value === undefined) {
      delete newFilters[key];
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Reset the editing flag after a delay to allow all updates to complete
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 300);
  };

  // Handle search submit (on Enter or blur)
  const handleSearchSubmit = () => {
    isUserEditingRef.current = true;
    // Always update the filter with current input value
    // The updateFilter function will handle empty strings by removing the key
    updateFilter('search', searchInput || undefined);
  };
  
  // Handle clearing the search
  const handleClearSearch = () => {
    isUserEditingRef.current = true;
    setSearchInput('');
    // Create new filters without search
    const newFilters = { ...localFilters, page: 1 };
    delete newFilters.search;
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Reset the editing flag after a delay
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 300);
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters: PredictorFilters = {
      sortBy: 'totalSales',
      sortOrder: 'desc',
    };
    isUserEditingRef.current = true;
    setLocalFilters(defaultFilters);
    setSearchInput('');
    onFiltersChange(defaultFilters);
    
    // Reset the editing flag after a delay
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 300);
  };

  // Check if any filters are active (beyond default sort)
  const hasActiveFilters =
    localFilters.search ||
    (localFilters.sortBy !== 'totalSales' && localFilters.sortBy !== undefined) ||
    (localFilters.sortOrder !== 'desc' && localFilters.sortOrder !== undefined);

  // Mobile: return null if not open
  if (!isOpen) return null;

  return (
    <aside className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fur-cream">Filters</h2>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-fur-light hover:text-fur-cream transition-colors"
            >
              Reset
            </button>
          )}
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-main hover:text-fur-cream transition-colors text-xl"
              aria-label="Close filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Search by Name
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search predictors..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            onBlur={handleSearchSubmit}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 pr-8 text-fur-cream text-sm placeholder:text-fur-cream/40 focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all"
            style={{ colorScheme: 'dark' }}
          />
          {/* Clear button */}
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-fur-cream/40 hover:text-fur-cream transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              isUserEditingRef.current = true;
              const newFilters: PredictorFilters = {
                ...localFilters,
                sortBy: 'totalSales',
                sortOrder: 'desc',
                page: 1,
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
              setTimeout(() => { isUserEditingRef.current = false; }, 300);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
              (localFilters.sortBy === 'totalSales' || !localFilters.sortBy) && localFilters.sortOrder === 'desc'
                ? 'bg-fur-light/20 border-fur-light text-fur-light'
                : 'bg-dark-900 border-dark-600 text-fur-cream/70 hover:border-dark-500 hover:text-fur-cream'
            }`}
          >
            🏆 Top Sellers
          </button>
          <button
            onClick={() => {
              isUserEditingRef.current = true;
              const newFilters: PredictorFilters = {
                ...localFilters,
                sortBy: 'averageRating',
                sortOrder: 'desc',
                page: 1,
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
              setTimeout(() => { isUserEditingRef.current = false; }, 300);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
              localFilters.sortBy === 'averageRating' && localFilters.sortOrder === 'desc'
                ? 'bg-fur-light/20 border-fur-light text-fur-light'
                : 'bg-dark-900 border-dark-600 text-fur-cream/70 hover:border-dark-500 hover:text-fur-cream'
            }`}
          >
            ⭐ Best Rated
          </button>
          <button
            onClick={() => {
              isUserEditingRef.current = true;
              const newFilters: PredictorFilters = {
                ...localFilters,
                sortBy: 'joinedAt',
                sortOrder: 'desc',
                page: 1,
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
              setTimeout(() => { isUserEditingRef.current = false; }, 300);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
              localFilters.sortBy === 'joinedAt' && localFilters.sortOrder === 'desc'
                ? 'bg-fur-light/20 border-fur-light text-fur-light'
                : 'bg-dark-900 border-dark-600 text-fur-cream/70 hover:border-dark-500 hover:text-fur-cream'
            }`}
          >
            🆕 New Predictors
          </button>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Sort By
        </label>
        <select
          value={`${localFilters.sortBy || 'totalSales'}-${localFilters.sortOrder || 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [
              PredictorFilters['sortBy'],
              PredictorFilters['sortOrder']
            ];
            const newFilters = { ...localFilters, sortBy, sortOrder, page: 1 };
            setLocalFilters(newFilters);
            onFiltersChange(newFilters);
          }}
          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all appearance-none cursor-pointer"
          style={{ colorScheme: 'dark' }}
        >
          <option value="totalSales-desc">🏆 Most Sales</option>
          <option value="totalSales-asc">📉 Least Sales</option>
          <option value="averageRating-desc">⭐ Highest Rated</option>
          <option value="averageRating-asc">⭐ Lowest Rated</option>
          <option value="totalSignals-desc">📊 Most Signals</option>
          <option value="totalSignals-asc">📊 Least Signals</option>
          <option value="joinedAt-desc">🆕 Newest</option>
          <option value="joinedAt-asc">📅 Oldest</option>
        </select>
      </div>
    </aside>
  );
}
