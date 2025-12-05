/**
 * @fileoverview Interactive Star Rating Component
 * @module shared/components/ui/StarRating
 * @description
 * A reusable star rating component that supports:
 * - Interactive mode (clickable stars for selection)
 * - Read-only mode (display current rating)
 * - Hover effects for better UX
 * - Customizable size and colors
 * 
 * @example
 * // Interactive rating selection
 * <StarRating value={3} onChange={(rating) => console.log(rating)} />
 * 
 * // Read-only display
 * <StarRating value={4.5} readOnly />
 */

import { useState } from 'react';
import { cn } from '@/shared/utils/cn';

/** Props for the StarRating component */
interface StarRatingProps {
  /** Current rating value (1-5) */
  value: number;
  /** Callback when rating changes (only in interactive mode) */
  onChange?: (rating: number) => void;
  /** Whether the rating is read-only */
  readOnly?: boolean;
  /** Size of the stars */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show the numeric value next to stars */
  showValue?: boolean;
  /** Disable interaction (grayed out) */
  disabled?: boolean;
}

/** Star icon component */
function StarIcon({ 
  filled, 
  size,
  className 
}: { 
  filled: boolean; 
  size: 'sm' | 'md' | 'lg';
  className?: string;
}): React.ReactElement {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={cn(
        sizeClasses[size],
        filled ? 'text-yellow-400' : 'text-dark-600',
        'transition-colors duration-150',
        className
      )}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/**
 * StarRating component
 * 
 * Interactive or read-only star rating display.
 * 
 * @param props - Component props
 * @returns Star rating element
 */
export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
  showValue = false,
  disabled = false,
}: StarRatingProps): React.ReactElement {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isInteractive = !readOnly && !disabled && onChange;
  const displayValue = hoverValue ?? value;

  const handleClick = (rating: number) => {
    if (isInteractive) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (isInteractive) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverValue(null);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className={cn(
          'flex items-center',
          isInteractive ? 'cursor-pointer' : 'cursor-default',
          disabled && 'opacity-50'
        )}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'p-0.5 focus:outline-none',
              isInteractive && 'hover:scale-110 transition-transform duration-150'
            )}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <StarIcon
              filled={star <= displayValue}
              size={size}
              className={cn(
                isInteractive && hoverValue !== null && star <= hoverValue && 'text-yellow-300'
              )}
            />
          </button>
        ))}
      </div>

      {showValue && value > 0 && (
        <span className={cn(
          'ml-1 font-medium',
          size === 'sm' && 'text-xs text-fur-cream/60',
          size === 'md' && 'text-sm text-fur-cream/70',
          size === 'lg' && 'text-base text-fur-cream'
        )}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;
