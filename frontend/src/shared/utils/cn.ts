/**
 * Class Name Utility (cn)
 *
 * Utility function for conditionally joining CSS class names.
 * A lightweight alternative to libraries like `clsx` or `classnames`.
 *
 * @module shared/utils/cn
 *
 * FEATURES:
 * - Filters out falsy values (false, null, undefined, 0, '')
 * - Flattens nested arrays
 * - Converts all values to strings
 * - Joins with spaces
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic conditional classes
 * cn('btn', isActive && 'btn-active')
 * // Result: 'btn btn-active' or 'btn'
 *
 * // Multiple conditions
 * cn(
 *   'base-class',
 *   isLarge && 'text-lg',
 *   isDisabled && 'opacity-50 cursor-not-allowed',
 *   variant === 'primary' && 'bg-brand-500'
 * )
 *
 * // With arrays
 * cn(['flex', 'items-center'], isHorizontal && 'flex-row')
 *
 * // Common component pattern
 * <button
 *   className={cn(
 *     'px-4 py-2 rounded-lg font-medium',
 *     variants[variant],
 *     sizes[size],
 *     disabled && 'opacity-50',
 *     className // Allow prop override
 *   )}
 * >
 *   {children}
 * </button>
 * ```
 *
 * WHY NOT USE CLSX/CLASSNAMES?
 * - Zero dependencies
 * - Smaller bundle size
 * - Covers 99% of use cases
 * - Easy to understand and maintain
 *
 * NOTE:
 * This utility does NOT merge Tailwind classes intelligently.
 * For Tailwind class merging (e.g., "p-2 p-4" → "p-4"), use `tailwind-merge`.
 *
 * @param classes - Class values (strings, booleans, arrays)
 * @returns Joined class name string
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Conditionally join class names together
 * @example cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')
 */
export function cn(...classes: ClassValue[]): string {
// ...existing code...
  return classes
    .flat()
    .filter((c): c is string | number => Boolean(c) && typeof c !== 'boolean')
    .map(String)
    .join(' ');
}
