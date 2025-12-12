/**
 * @fileoverview Debounce hook for delaying value updates
 * @module shared/hooks/useDebounce
 * @description
 * Custom hook that debounces a value, delaying updates until
 * a specified time has passed since the last change.
 * Useful for search inputs to avoid excessive API calls.
 */

import { useState, useEffect } from 'react';

/**
 * Debounces a value by delaying updates until the specified delay has passed.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 300);
 * 
 * // debouncedSearch only updates 300ms after user stops typing
 * useEffect(() => {
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
