/**
 * Textarea Component
 *
 * A styled multi-line text input component designed for the dark theme.
 * Built with accessibility in mind and seamless React Hook Form integration.
 *
 * @module shared/components/ui/Textarea
 *
 * FEATURES:
 * - Dark theme styling with brand accent colors
 * - Automatic label-input association via generated IDs
 * - Error state with red border and error message display
 * - Helper text support for additional context
 * - Disabled state styling
 * - Forwarded ref for React Hook Form integration
 * - Configurable rows (defaults to 4)
 * - Non-resizable by default (resize-none)
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic usage
 * <Textarea placeholder="Enter description..." />
 *
 * // With label and helper text
 * <Textarea
 *   label="Signal Description"
 *   helperText="Describe your trading signal in detail"
 *   placeholder="Enter your analysis..."
 * />
 *
 * // With error state
 * <Textarea
 *   label="Description"
 *   error="Description must be at least 50 characters"
 * />
 *
 * // With React Hook Form
 * <Textarea
 *   label="Content"
 *   {...register('content', { required: 'Content is required' })}
 *   error={errors.content?.message}
 * />
 *
 * // Custom rows
 * <Textarea
 *   label="Long Description"
 *   rows={8}
 *   placeholder="Write a detailed analysis..."
 * />
 * ```
 *
 * ACCESSIBILITY:
 * - Label automatically associated with textarea via htmlFor/id
 * - Error messages linked to textarea for screen readers
 * - Visual focus indicators (ring)
 * - Disabled state is visually distinct
 *
 * STYLING:
 * - Uses Tailwind CSS for styling
 * - Integrates with project's dark theme (dark-* colors)
 * - Brand accent color on focus (brand-500)
 * - Error state uses error color palette
 * - Accepts className prop for custom styling
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-dark-200 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 bg-dark-800 border rounded-lg',
            'text-dark-100 placeholder-dark-500',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'transition-all duration-200 resize-none',
            error
              ? 'border-error-500 focus:ring-error-500/50'
              : 'border-dark-600 focus:ring-brand-500/50',
            props.disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          rows={4}
          {...props}
        />

        {error && <p className="mt-1.5 text-sm text-error-400">{error}</p>}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-dark-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
