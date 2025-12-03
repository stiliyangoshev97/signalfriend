/**
 * ===== CARD COMPONENT =====
 * 
 * Flexible container component with multiple variants for dark theme.
 * Includes sub-components for structured content layout.
 * 
 * Used in: Signal cards, predictor profiles, dashboard widgets, forms
 * 
 * FEATURES:
 * - 3 visual variants (default, hover, outlined)
 * - 4 padding options (none, sm, md, lg)
 * - Hover effects for interactive cards
 * - Sub-components for structured content (Header, Title, Description, Content, Footer)
 * - Uses `cn()` for class merging
 * 
 * VARIANTS:
 * - default: Solid dark background with border and shadow
 * - hover: Same as default but with hover lift effect (for clickable cards)
 * - outlined: Transparent background with visible border only
 * 
 * PADDING:
 * - none: No padding (for custom layouts)
 * - sm: p-4 (compact cards)
 * - md: p-6 (default, most common)
 * - lg: p-8 (spacious cards, forms)
 * 
 * SUB-COMPONENTS:
 * - CardHeader: Container for title + description (adds margin-bottom)
 * - CardTitle: Styled h3 heading
 * - CardDescription: Muted text below title
 * - CardContent: Main content area (no special styling)
 * - CardFooter: Bottom section with top border
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Simple card
 * <Card>
 *   <p>Card content here</p>
 * </Card>
 * 
 * // Card with structured content
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Signal Title</CardTitle>
 *     <CardDescription>Brief description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Main content here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Buy Signal</Button>
 *   </CardFooter>
 * </Card>
 * 
 * // Hover card (clickable)
 * <Card variant="hover" onClick={handleClick}>
 *   <CardTitle>Click me</CardTitle>
 * </Card>
 * 
 * // Outlined card with large padding
 * <Card variant="outlined" padding="lg">
 *   <form>...</form>
 * </Card>
 * 
 * // Card with no padding (custom layout)
 * <Card padding="none">
 *   <img src="..." className="rounded-t-xl" />
 *   <div className="p-4">Content below image</div>
 * </Card>
 * ```
 * 
 * STYLING:
 * - Dark theme colors (dark-800 background, dark-700 border)
 * - Rounded corners (rounded-xl)
 * - Shadow for depth on default/hover variants
 * - Smooth transitions on hover variant
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: 'default' | 'hover' | 'outlined';
  /** Internal padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Card content */
  children: ReactNode;
}

/** Variant-specific Tailwind classes */
const variants = {
  default: 'bg-dark-800 border border-dark-700 shadow-lg',
  hover: `bg-dark-800 border border-dark-700 shadow-lg
          transition-all duration-200 hover:border-dark-600 
          hover:shadow-xl hover:-translate-y-0.5 cursor-pointer`,
  outlined: 'bg-transparent border border-dark-600',
};

/** Padding-specific Tailwind classes */
const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card Component
 * 
 * @param variant - Visual style (default, hover, outlined)
 * @param padding - Internal padding (none, sm, md, lg)
 * @param className - Additional CSS classes to merge
 * @param children - Card content
 * @param props - All other native div attributes (onClick, etc)
 */
export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader - Container for title and description
 * 
 * @example
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 * </CardHeader>
 */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardTitle - Styled heading for card
 * 
 * @example <CardTitle>Signal Name</CardTitle>
 */
export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-dark-100', className)} {...props}>
      {children}
    </h3>
  );
}

/**
 * CardDescription - Muted text below title
 * 
 * @example <CardDescription>Brief signal description</CardDescription>
 */
export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-dark-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

/**
 * CardContent - Main content area
 * 
 * @example
 * <CardContent>
 *   <p>Main content goes here</p>
 * </CardContent>
 */
export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardFooter - Bottom section with top border
 * 
 * @example
 * <CardFooter>
 *   <Button>Action</Button>
 * </CardFooter>
 */
export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-dark-700', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
