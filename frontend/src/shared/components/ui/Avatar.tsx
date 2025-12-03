/**
 * Avatar Component
 *
 * User avatar display with intelligent fallback system.
 * Shows image if available, otherwise generates initials from name or wallet address.
 *
 * @module shared/components/ui/Avatar
 *
 * FEATURES:
 * - Image display with automatic fallback to initials
 * - Generates initials from user's name (first letters of words)
 * - Falls back to wallet address prefix if no name
 * - Deterministic background colors based on wallet address
 * - Four size variants: sm, md, lg, xl
 * - Ring border for visual consistency
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // With image
 * <Avatar
 *   src="https://example.com/avatar.jpg"
 *   name="John Doe"
 *   size="md"
 * />
 *
 * // Name-based initials (shows "JD")
 * <Avatar name="John Doe" />
 *
 * // Address-based fallback (shows "0x12" style)
 * <Avatar address="0x1234567890abcdef..." />
 *
 * // With both name and address (name takes priority for initials)
 * <Avatar
 *   name="CryptoTrader"
 *   address="0x1234..."
 * />
 *
 * // Different sizes
 * <Avatar name="User" size="sm" />  // 32x32px
 * <Avatar name="User" size="md" />  // 40x40px (default)
 * <Avatar name="User" size="lg" />  // 48x48px
 * <Avatar name="User" size="xl" />  // 64x64px
 * ```
 *
 * SIZE REFERENCE:
 * - sm: 32x32px (h-8 w-8)   - Lists, compact views
 * - md: 40x40px (h-10 w-10) - Default, cards
 * - lg: 48x48px (h-12 w-12) - Profile headers
 * - xl: 64x64px (h-16 w-16) - Profile pages
 *
 * COLOR GENERATION:
 * When no image is provided, the background color is deterministically
 * generated from the wallet address. This ensures the same address
 * always gets the same color across the application.
 *
 * Available colors:
 * - brand-600, blue-600, purple-600, pink-600
 * - indigo-600, cyan-600, teal-600, emerald-600
 *
 * ACCESSIBILITY:
 * - Images include alt text (name or "Avatar")
 * - Color contrast meets WCAG standards (white text on colored bg)
 * - Consistent ring border for focus visibility
 *
 * STYLING:
 * - Rounded-full for circular avatars
 * - Ring-2 ring-dark-700 for subtle border
 * - Object-cover for proper image scaling
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
