/**
 * ===== SELECT COMPONENT =====
 * 
 * Styled dropdown select for dark theme with custom arrow icon.
 * Uses forwardRef for compatibility with React Hook Form.
 * 
 * Used in: Forms (category selection, risk level, filters, etc.)
 * 
 * FEATURES:
 * - Dark theme styling matching Input component
 * - Custom dropdown arrow (hidden native arrow via appearance-none)
 * - Automatic label + select ID association
 * - Error state with red border and error message
 * - Placeholder option support
 * - Uses `cn()` for class merging
 * 
 * REACT HOOK FORM INTEGRATION:
 * Uses forwardRef to work with React Hook Form's `register()`:
 * ```tsx
 * const { register, formState: { errors } } = useForm();
 * 
 * <Select
 *   label="Category"
 *   options={categories}
 *   error={errors.category?.message}
 *   {...register('category')}
 * />
 * ```
 * 
 * OPTIONS FORMAT:
 * Options must be an array of { value, label } objects:
 * ```tsx
 * const options = [
 *   { value: 'crypto', label: 'Cryptocurrency' },
 *   { value: 'forex', label: 'Forex' },
 *   { value: 'stocks', label: 'Stocks' },
 * ];
 * ```
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic select with label
 * <Select
 *   label="Risk Level"
 *   options={[
 *     { value: 'low', label: 'Low' },
 *     { value: 'medium', label: 'Medium' },
 *     { value: 'high', label: 'High' },
 *   ]}
 * />
 * 
 * // With placeholder
 * <Select
 *   label="Category"
 *   placeholder="Select a category..."
 *   options={categories}
 * />
 * 
 * // With error
 * <Select
 *   label="Category"
 *   options={categories}
 *   error="Please select a category"
 * />
 * 
 * // Disabled select
 * <Select
 *   label="Chain"
 *   options={[{ value: '97', label: 'BNB Testnet' }]}
 *   disabled
 * />
 * ```
 * 
 * ACCESSIBILITY:
 * - Label automatically linked to select via htmlFor/id
 * - Focus ring for keyboard navigation
 * - Error messages visually distinct (red text)
 * - Native select element (screen reader friendly)
 * 
 * STYLING:
 * - appearance-none to hide native browser arrow
 * - Custom SVG arrow icon positioned absolutely
 * - Matches Input component styling for consistency
 */

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message from validation (shows below select in red) */
  error?: string;
  /** Array of options with value and label */
  options: Array<{ value: string; label: string }>;
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
}

/**
 * Select Component
 * 
 * @param label - Text displayed above the select
 * @param error - Error message from validation
 * @param options - Array of { value, label } options
 * @param placeholder - Placeholder option text
 * @param className - Additional CSS classes to merge
 * @param id - Custom ID (auto-generated from label if not provided)
 * @param props - All other native select attributes
 * @param ref - Forwarded ref for React Hook Form integration
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    // Generate ID from label if not provided
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {/* Label - linked to select via htmlFor */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-dark-200 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Select wrapper for custom arrow positioning */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Base styles (matches Input component)
              'w-full px-4 py-3 bg-dark-800 border rounded-lg',
              'text-dark-100 appearance-none cursor-pointer',
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
          >
            {/* Placeholder option (disabled, shown initially) */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {/* Render options from array */}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow (replaces native arrow hidden by appearance-none) */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-dark-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Error message (red text below select) */}
        {error && <p className="mt-1.5 text-sm text-error-400">{error}</p>}
      </div>
    );
  }
);

// Display name for React DevTools debugging
Select.displayName = 'Select';

export default Select;
