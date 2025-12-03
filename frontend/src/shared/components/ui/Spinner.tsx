/**
 * Spinner Component
 *
 * Animated loading spinner with multiple size variants.
 * Uses SVG-based animation for smooth, performant loading indicators.
 *
 * @module shared/components/ui/Spinner
 *
 * FEATURES:
 * - Three size variants: sm, md, lg
 * - SVG-based for crisp rendering at any resolution
 * - CSS animation (animate-spin) for smooth rotation
 * - Brand-colored by default (brand-500)
 * - Customizable via className prop
 *
 * EXPORTS:
 * - `Spinner` - Individual spinner component
 * - `PageLoader` - Full-page loading overlay with spinner
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic spinner (medium size)
 * <Spinner />
 *
 * // Different sizes
 * <Spinner size="sm" />  // 16x16px - for buttons, inline
 * <Spinner size="md" />  // 24x24px - default
 * <Spinner size="lg" />  // 32x32px - for larger areas
 *
 * // Custom color
 * <Spinner className="text-white" />
 *
 * // Inside a button
 * <Button disabled>
 *   <Spinner size="sm" className="mr-2" />
 *   Loading...
 * </Button>
 *
 * // Full page loader (for route transitions, initial load)
 * <PageLoader />
 * ```
 *
 * SIZE REFERENCE:
 * - sm: 16x16px (h-4 w-4) - Button loading states
 * - md: 24x24px (h-6 w-6) - General loading states
 * - lg: 32x32px (h-8 w-8) - Page/section loading
 *
 * ACCESSIBILITY:
 * - Consider adding aria-label="Loading" to containers
 * - PageLoader covers the entire viewport
 *
 * STYLING:
 * - Uses Tailwind's animate-spin utility
 * - Inherits text color via currentColor
 * - Two-tone design (25% opacity track, 75% opacity indicator)
 */

import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-brand-500', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Full page loading spinner
 */
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-dark-900">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-dark-400">Loading...</p>
      </div>
    </div>
  );
}

export default Spinner;
