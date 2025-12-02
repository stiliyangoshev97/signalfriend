/**
 * Class Name Utility
 * 
 * Utility function for conditionally joining class names.
 * Similar to the `clsx` or `classnames` libraries.
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Conditionally join class names together
 * @example cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((c): c is string | number => Boolean(c) && typeof c !== 'boolean')
    .map(String)
    .join(' ');
}
