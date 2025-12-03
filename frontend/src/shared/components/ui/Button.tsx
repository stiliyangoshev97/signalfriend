/**
 * ===== BUTTON COMPONENT =====
 * 
 * Reusable button component with multiple variants for the dark theme.
 * Designed for the SignalFriend brand with logo-inspired colors.
 * 
 * Used in: AuthButton, forms, modals, CTAs throughout the app
 * 
 * FEATURES:
 * - 5 visual variants (primary, secondary, danger, ghost, outline)
 * - 3 size options (sm, md, lg)
 * - Loading state with spinner
 * - Left/right icon support
 * - Disabled state styling
 * - Uses `cn()` utility for class merging (Tailwind + custom classes)
 * 
 * VARIANTS:
 * - primary: Golden/brand button for main CTAs (Connect Wallet, Sign In)
 * - secondary: Dark gray button for secondary actions
 * - danger: Red button for destructive actions (Sign Out, Delete)
 * - ghost: Transparent button for subtle actions (navbar items)
 * - outline: Bordered button with brand color
 * 
 * SIZES:
 * - sm: Small (px-3 py-1.5) - for inline/compact buttons
 * - md: Medium (px-4 py-2.5) - default, most common
 * - lg: Large (px-6 py-3) - for hero CTAs
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Primary button (default)
 * <Button onClick={handleClick}>Connect Wallet</Button>
 * 
 * // With loading state
 * <Button isLoading={isSubmitting}>
 *   {isSubmitting ? 'Signing...' : 'Sign In'}
 * </Button>
 * 
 * // Danger button for logout
 * <Button variant="danger" onClick={logout}>Sign Out</Button>
 * 
 * // Small ghost button
 * <Button variant="ghost" size="sm">Cancel</Button>
 * 
 * // With icons
 * <Button leftIcon={<WalletIcon />}>Connect</Button>
 * <Button rightIcon={<ArrowRightIcon />}>Continue</Button>
 * 
 * // Large CTA for landing page
 * <Button size="lg" variant="primary">Browse Signals</Button>
 * 
 * // Custom className override
 * <Button className="w-full mt-4">Full Width</Button>
 * ```
 * 
 * WHY USE `cn()` UTILITY?
 * - Merges Tailwind classes intelligently (no conflicts)
 * - Allows className prop to override default styles
 * - Handles conditional classes cleanly
 * 
 * ACCESSIBILITY:
 * - Disabled state reduces opacity + changes cursor
 * - Loading state disables button to prevent double-clicks
 * - All native button attributes supported (aria-*, type, etc)
 * 
 * STYLING APPROACH:
 * - Tailwind CSS with logo-inspired brand colors
 * - Shadow effects on primary/danger for depth
 * - Smooth transitions on hover/active states
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

/** Available button visual styles */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/** Available button sizes */
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant - determines colors and effects */
  variant?: ButtonVariant;
  /** Size of the button - affects padding and font size */
  size?: ButtonSize;
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Icon to display on the left side of text */
  leftIcon?: ReactNode;
  /** Icon to display on the right side of text */
  rightIcon?: ReactNode;
  /** Button content (text, icons, etc) */
  children: ReactNode;
}

/** Variant-specific Tailwind classes */
const variants: Record<ButtonVariant, string> = {
  primary: `bg-brand-500 text-dark-900 hover:bg-brand-400 active:bg-brand-600 
            shadow-lg shadow-brand-500/25 font-semibold`,
  secondary: `bg-dark-700 text-dark-100 hover:bg-dark-600 border border-dark-600`,
  danger: `bg-error-500 text-white hover:bg-error-400 active:bg-error-600 
           shadow-lg shadow-error-500/25`,
  ghost: `bg-transparent text-dark-300 hover:text-dark-100 hover:bg-dark-800`,
  outline: `bg-transparent text-brand-500 border border-brand-500 
            hover:bg-brand-500/10`,
};

/** Size-specific Tailwind classes */
const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

/**
 * Button Component
 * 
 * @param variant - Visual style (primary, secondary, danger, ghost, outline)
 * @param size - Button size (sm, md, lg)
 * @param isLoading - Shows spinner and disables button when true
 * @param leftIcon - ReactNode to render before children
 * @param rightIcon - ReactNode to render after children
 * @param className - Additional CSS classes to merge
 * @param disabled - Disables button interaction
 * @param children - Button content
 * @param props - All other native button attributes (onClick, type, etc)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles - always applied
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant-specific styles
        variants[variant],
        // Size-specific styles
        sizes[size],
        // Custom className override (if provided)
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

/**
 * Loading Spinner (internal component)
 * 
 * SVG spinner shown when button isLoading=true.
 * Inherits text color from parent button.
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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

export default Button;
