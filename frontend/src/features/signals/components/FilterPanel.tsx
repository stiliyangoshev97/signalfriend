/**
 * @fileoverview Signal Filter Panel component
 * @module features/signals/components/FilterPanel
 * @description
 * Sidebar filter panel for the signal marketplace.
 * Allows filtering by category, risk level, potential reward, and price range.
 */

import { useState, useEffect } from 'react';
import type { SignalFilters, Category } from '@/shared/types';

/** Props for FilterPanel component */
interface FilterPanelProps {
  /** Current filter values */
  filters: SignalFilters;
  /** Callback when filters change */
  onFilterChange: (filters: SignalFilters) => void;
  /** Available categories for filtering */
  categories: Category[];
  /** Whether categories are loading */
  isLoadingCategories?: boolean;
}

/**
 * FilterPanel component
 * 
 * Provides filtering options:
 * - Category dropdown (grouped by mainGroup)
 * - Risk level buttons
 * - Potential reward buttons
 * - Price range inputs
 * - Sort by dropdown
 * - Reset filters button
 * 
 * @param props - Component props
 * @returns Filter panel element
 * 
 * @example
 * <FilterPanel
 *   filters={currentFilters}
 *   onFilterChange={setFilters}
 *   categories={categories}
 * />
 */
export function FilterPanel({
  filters,
  onFilterChange,
  categories,
  isLoadingCategories,
}: FilterPanelProps): React.ReactElement {
  const [localFilters, setLocalFilters] = useState<SignalFilters>(filters);
  const [minPrice, setMinPrice] = useState<string>(filters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice?.toString() || '');

  // Group categories by mainGroup
  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.mainGroup || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
    setMinPrice(filters.minPrice?.toString() || '');
    setMaxPrice(filters.maxPrice?.toString() || '');
  }, [filters]);

  const updateFilter = <K extends keyof SignalFilters>(
    key: K,
    value: SignalFilters[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    // Remove empty values
    if (value === '' || value === undefined) {
      delete newFilters[key];
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const applyPriceFilter = () => {
    const newFilters = { ...localFilters, page: 1 };
    if (minPrice) newFilters.minPrice = parseFloat(minPrice);
    else delete newFilters.minPrice;
    if (maxPrice) newFilters.maxPrice = parseFloat(maxPrice);
    else delete newFilters.maxPrice;
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: SignalFilters = {};
    setLocalFilters(emptyFilters);
    setMinPrice('');
    setMaxPrice('');
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters =
    localFilters.category ||
    localFilters.riskLevel ||
    localFilters.potentialReward ||
    localFilters.minPrice !== undefined ||
    localFilters.maxPrice !== undefined;

  return (
    <aside className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fur-cream">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-fur-light hover:text-fur-cream transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Category
        </label>
        <select
          value={localFilters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value || undefined)}
          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all appearance-none cursor-pointer"
          disabled={isLoadingCategories}
          style={{ colorScheme: 'dark' }}
        >
          <option value="">All Categories</option>
          {Object.entries(groupedCategories).map(([group, cats]) => (
            <optgroup key={group} label={group}>
              {cats.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Risk Level Filter */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Risk Level
        </label>
        <div className="flex flex-wrap gap-2">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() =>
                updateFilter(
                  'riskLevel',
                  localFilters.riskLevel === level ? undefined : level
                )
              }
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                localFilters.riskLevel === level
                  ? level === 'low'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : level === 'medium'
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-dark-900 border-dark-600 text-fur-cream/70 hover:border-dark-500 hover:text-fur-cream'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Potential Reward Filter */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Potential Reward
        </label>
        <div className="flex flex-wrap gap-2">
          {(['normal', 'medium', 'high'] as const).map((reward) => (
            <button
              key={reward}
              onClick={() =>
                updateFilter(
                  'potentialReward',
                  localFilters.potentialReward === reward ? undefined : reward
                )
              }
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                localFilters.potentialReward === reward
                  ? reward === 'normal'
                    ? 'bg-fur-cream/10 border-fur-cream/50 text-fur-cream'
                    : reward === 'medium'
                    ? 'bg-fur-light/20 border-fur-light text-fur-light'
                    : 'bg-fur-main/20 border-fur-main text-fur-main'
                  : 'bg-dark-900 border-dark-600 text-fur-cream/70 hover:border-dark-500 hover:text-fur-cream'
              }`}
            >
              {reward.charAt(0).toUpperCase() + reward.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Price Range (USDT)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm placeholder:text-fur-cream/40 focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all"
            min="0"
            style={{ colorScheme: 'dark' }}
          />
          <span className="text-fur-cream/50">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm placeholder:text-fur-cream/40 focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all"
            min="0"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-fur-cream/80 mb-2">
          Sort By
        </label>
        <select
          value={localFilters.sortBy || 'newest'}
          onChange={(e) =>
            updateFilter(
              'sortBy',
              e.target.value as SignalFilters['sortBy']
            )
          }
          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all appearance-none cursor-pointer"
          style={{ colorScheme: 'dark' }}
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </aside>
  );
}

export default FilterPanel;
