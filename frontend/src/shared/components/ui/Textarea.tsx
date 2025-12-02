/**
 * Textarea Component
 * 
 * Styled textarea for dark theme with label and error support.
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
