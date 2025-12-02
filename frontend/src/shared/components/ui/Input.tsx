/**
 * Input Component
 * 
 * Styled input field for dark theme with label, error, and helper text support.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-200 mb-1.5"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 bg-dark-800 border rounded-lg',
            'text-dark-100 placeholder-dark-500',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'transition-all duration-200',
            error
              ? 'border-error-500 focus:ring-error-500/50'
              : 'border-dark-600 focus:ring-brand-500/50',
            props.disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-1.5 text-sm text-error-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-dark-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
