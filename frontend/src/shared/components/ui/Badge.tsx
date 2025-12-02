/**
 * Badge Component
 * 
 * Small status indicators with various color variants.
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-dark-600 text-dark-200',
  success: 'bg-success-500/20 text-success-400',
  warning: 'bg-brand-500/20 text-brand-400',
  error: 'bg-error-500/20 text-error-400',
  info: 'bg-blue-500/20 text-blue-400',
};

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
