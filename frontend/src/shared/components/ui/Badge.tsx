/**
 * ===== BADGE COMPONENT =====
 * 
 * Small status indicator labels with color-coded variants.
 * Used to show status, categories, risk levels, and other metadata.
 * 
 * Used in: Signal cards (risk level), predictor profiles (verified badge),
 *          status indicators, category tags
 * 
 * FEATURES:
 * - 5 color variants (default, success, warning, error, info)
 * - Pill-shaped design (rounded-full)
 * - Semi-transparent backgrounds with colored text
 * - Compact sizing (text-xs, small padding)
 * 
 * VARIANTS:
 * - default: Gray for neutral/inactive states
 * - success: Green for positive states (verified, completed, profit)
 * - warning: Golden/brand color for caution (pending, medium risk)
 * - error: Red for negative states (failed, high risk, loss)
 * - info: Blue for informational (new, featured)
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Default badge
 * <Badge>Draft</Badge>
 * 
 * // Success badge for verified status
 * <Badge variant="success">Verified</Badge>
 * 
 * // Warning badge for risk level
 * <Badge variant="warning">Medium Risk</Badge>
 * 
 * // Error badge for high risk
 * <Badge variant="error">High Risk</Badge>
 * 
 * // Info badge for new items
 * <Badge variant="info">New</Badge>
 * 
 * // With custom className
 * <Badge variant="success" className="ml-2">Active</Badge>
 * ```
 * 
 * STYLING:
 * - Semi-transparent backgrounds (20% opacity)
 * - Colored text matching the background hue
 * - Pill shape with rounded-full
 * - Small text (text-xs) with medium font weight
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

/** Available badge color variants */
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color variant determining background and text color */
  variant?: BadgeVariant;
  /** Badge content (text, icons, etc) */
  children: ReactNode;
}

/** Variant-specific Tailwind classes */
const variants: Record<BadgeVariant, string> = {
  default: 'bg-dark-600 text-dark-200',
  success: 'bg-success-500/20 text-success-400',
  warning: 'bg-brand-500/20 text-brand-400',
  error: 'bg-error-500/20 text-error-400',
  info: 'bg-blue-500/20 text-blue-400',
};

/**
 * Badge Component
 * 
 * @param variant - Color variant (default, success, warning, error, info)
 * @param className - Additional CSS classes to merge
 * @param children - Badge content
 * @param props - All other native span attributes
 */
export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles - pill shape, compact sizing
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-medium',
        // Variant-specific colors
        variants[variant],
        // Custom className override
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
