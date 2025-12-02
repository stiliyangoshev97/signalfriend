/**
 * Avatar Component
 * 
 * User avatar with fallback to initials or wallet address.
 */

import { cn } from '../../utils/cn';
import { formatAddress } from '../../utils/format';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  address?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, name, address, size = 'md', className }: AvatarProps) {
  // Generate initials from name or address
  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (address) {
      return formatAddress(address, 2).replace('...', '').toUpperCase();
    }
    return '??';
  };

  // Generate a consistent color based on address
  const getBackgroundColor = () => {
    if (!address) return 'bg-dark-600';
    
    const colors = [
      'bg-brand-600',
      'bg-blue-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-indigo-600',
      'bg-cyan-600',
      'bg-teal-600',
      'bg-emerald-600',
    ];
    
    const index = parseInt(address.slice(-2), 16) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover ring-2 ring-dark-700',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-dark-700',
        sizes[size],
        getBackgroundColor(),
        className
      )}
    >
      {getInitials()}
    </div>
  );
}

export default Avatar;
