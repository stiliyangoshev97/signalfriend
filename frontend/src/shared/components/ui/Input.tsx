/**
 * ===== INPUT COMPONENT =====
 * 
 * Styled input field for dark theme with label, error, and helper text support.
 * Uses forwardRef for compatibility with React Hook Form.
 * 
 * Used in: Forms throughout the app (login, create signal, profile edit, etc.)
 * 
 * FEATURES:
 * - Dark theme styling (dark-800 background, dark-100 text)
 * - Automatic label + input ID association for accessibility
 * - Error state with red border and error message
 * - Helper text for additional context
 * - Focus ring animation (brand color or error color)
 * - Disabled state styling
 * - Uses `cn()` for class merging
 * 
 * REACT HOOK FORM INTEGRATION:
 * Uses forwardRef to work with React Hook Form's `register()`:
 * ```tsx
 * const { register, formState: { errors } } = useForm();
 * 
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email?.message}
 *   {...register('email')}  // Spreads: name, onChange, onBlur, ref
 * />
 * ```
 * 
 * WHY forwardRef?
 * - React Hook Form needs a ref to the input element
 * - Without forwardRef, ref would be lost in the wrapper
 * - register() passes ref which is forwarded to <input>
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic input with label
 * <Input label="Username" placeholder="Enter username" />
 * 
 * // Input with error (from form validation)
 * <Input
 *   label="Email"
 *   error="Email is required"
 *   placeholder="your@email.com"
 * />
 * 
 * // Input with helper text
 * <Input
 *   label="Password"
 *   type="password"
 *   helperText="Must be at least 8 characters"
 * />
 * 
 * // Disabled input
 * <Input label="Wallet" value="0x1234...5678" disabled />
 * 
 * // With custom className
 * <Input label="Price" type="number" className="text-right" />
 * ```
 * 
 * ACCESSIBILITY:
 * - Label automatically linked to input via htmlFor/id
 * - Focus ring for keyboard navigation
 * - Error messages visually distinct (red text)
 * - Disabled state has reduced opacity + cursor change
 * 
 * STYLING:
 * - Normal: dark-600 border, brand-500 focus ring
 * - Error: error-500 border, error-500/50 focus ring
 * - Disabled: 50% opacity, not-allowed cursor
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message from validation (shows below input in red) */
  error?: string;
  /** Helper text for additional context (shows below input, hidden if error exists) */
  helperText?: string;
}

/**
 * Input Component
 * 
 * @param label - Text displayed above the input
 * @param error - Error message from validation
 * @param helperText - Helper text (hidden when error is present)
 * @param className - Additional CSS classes to merge
 * @param id - Custom ID (auto-generated from label if not provided)
 * @param props - All other native input attributes (type, placeholder, etc)
 * @param ref - Forwarded ref for React Hook Form integration
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    // Generate ID from label if not provided (for label association)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {/* Label - linked to input via htmlFor */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-200 mb-1.5"
          >
            {label}
          </label>
        )}
        
        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            'w-full px-4 py-3 bg-dark-800 border rounded-lg',
            'text-dark-100 placeholder-dark-500',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'transition-all duration-200',
            // Conditional: error vs normal border/ring
            error
              ? 'border-error-500 focus:ring-error-500/50'
              : 'border-dark-600 focus:ring-brand-500/50',
            // Disabled state
            props.disabled && 'opacity-50 cursor-not-allowed',
            // Custom className override
            className
          )}
          {...props}
        />
        
        {/* Error message (red text below input) */}
        {error && (
          <p className="mt-1.5 text-sm text-error-400">{error}</p>
        )}
        
        {/* Helper text (gray text below input, hidden if error exists) */}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-dark-500">{helperText}</p>
        )}
      </div>
    );
  }
);

// Display name for React DevTools debugging
Input.displayName = 'Input';

export default Input;
