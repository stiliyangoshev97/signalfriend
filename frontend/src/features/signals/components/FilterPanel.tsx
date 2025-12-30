/**
 * @fileoverview Signal Filter Panel component
 * @module features/signals/components/FilterPanel
 * @description
 * Sidebar filter panel for the signal marketplace.
 * Allows filtering by category (two-step: mainGroup then subcategory) and price range.
 */

import { useState, useEffect, useMemo } from 'react';
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
 * - Price range inputs
 * - Sort by dropdown
 * - Reset filters button
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
  const [selectedMainGroup, setSelectedMainGroup] = useState<string>('');

  // Define main group order for prediction markets
  const MAIN_GROUP_ORDER = ['Crypto', 'Finance', 'Politics', 'Sports', 'World', 'Culture'];

  // Group categories by mainGroup
  const categoryGroups = useMemo(() => {
    const subcategoriesByGroup: Record<string, Category[]> = {};
    const mainGroupsSet = new Set<string>();
    
    for (const cat of categories) {
      const group = cat.mainGroup || 'Other';
      mainGroupsSet.add(group);
      if (!subcategoriesByGroup[group]) {
        subcategoriesByGroup[group] = [];
      }
      subcategoriesByGroup[group].push(cat);
    }
    
    // Sort main groups according to predefined order
    const sortedMainGroups = Array.from(mainGroupsSet).sort((a, b) => {
      const indexA = MAIN_GROUP_ORDER.indexOf(a);
      const indexB = MAIN_GROUP_ORDER.indexOf(b);
      // If not in predefined order, put at end
      const orderA = indexA === -1 ? MAIN_GROUP_ORDER.length : indexA;
      const orderB = indexB === -1 ? MAIN_GROUP_ORDER.length : indexB;
      return orderA - orderB;
    });
    
    return {
      mainGroups: sortedMainGroups,
      subcategoriesByGroup,
    };
  }, [categories]);

  // Get subcategories for selected main group
  const subcategories = selectedMainGroup 
    ? categoryGroups.subcategoriesByGroup[selectedMainGroup] || []
    : [];

  // Sync local filters with props (but NOT selectedMainGroup from category changes)
  useEffect(() => {
    setLocalFilters(filters);
    setMinPrice(filters.minPrice?.toString() || '');
    setMaxPrice(filters.maxPrice?.toString() || '');
  }, [filters]);

  // Only sync mainGroup from category on initial load or external filter changes
  // Don't reset mainGroup when we intentionally clear the category
  useEffect(() => {
    if (filters.category) {
      const selectedCat = categories.find(c => c._id === filters.category);
      if (selectedCat?.mainGroup && selectedCat.mainGroup !== selectedMainGroup) {
        setSelectedMainGroup(selectedCat.mainGroup);
      }
    }
    // Note: We intentionally don't reset selectedMainGroup when category is cleared
    // This allows users to select a mainGroup and then pick a subcategory
  }, [filters.category, categories]);

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
    setSelectedMainGroup(''); // Also reset the main group selection
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters =
    localFilters.category ||
    localFilters.mainGroup ||
    selectedMainGroup ||
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

      {/* Category Filter - Two-step selection */}
      <div className="space-y-3">
        {/* Main Group Selection */}
        <div>
          <label className="block text-sm font-medium text-fur-cream/80 mb-2">
            Category Group
          </label>
          <select
            value={selectedMainGroup}
            onChange={(e) => {
              const newGroup = e.target.value;
              setSelectedMainGroup(newGroup);
              // Clear subcategory when main group changes
              // Set mainGroup filter so backend filters by group
              const newFilters = { ...localFilters, page: 1 };
              delete newFilters.category;
              if (newGroup) {
                newFilters.mainGroup = newGroup;
              } else {
                delete newFilters.mainGroup;
              }
              setLocalFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all appearance-none cursor-pointer"
            disabled={isLoadingCategories}
            style={{ colorScheme: 'dark' }}
          >
            <option value="">All Categories</option>
            {categoryGroups.mainGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Selection (only shown when main group is selected) */}
        {selectedMainGroup && (
          <div>
            <label className="block text-sm font-medium text-fur-cream/80 mb-2">
              Subcategory
            </label>
            <select
              value={localFilters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value || undefined)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all appearance-none cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All in {selectedMainGroup}</option>
              {subcategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
          onChange={(e) => {
            const value = e.target.value as SignalFilters['sortBy'];
            updateFilter('sortBy', value);
          }}
          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-fur-cream text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50 focus:border-fur-light transition-all appearance-none cursor-pointer"
          style={{ colorScheme: 'dark' }}
        >
          <option value="newest">🆕 Newest First</option>
          <option value="quality">⭐ Best Quality</option>
          <option value="popular">🔥 Most Popular</option>
          <option value="price-low">💰 Price: Low to High</option>
          <option value="price-high">💎 Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}

export default FilterPanel;
