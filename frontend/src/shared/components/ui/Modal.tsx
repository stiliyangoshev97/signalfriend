/**
 * ===== MODAL COMPONENT =====
 * 
 * Accessible modal/dialog component with dark theme styling.
 * Uses React Portal to render at document root (avoids z-index issues).
 * 
 * Used in: Confirmation dialogs, forms, signal details, purchase flow
 * 
 * FEATURES:
 * - 4 size options (sm, md, lg, xl)
 * - Accessible with proper ARIA attributes
 * - Keyboard support (Escape to close)
 * - Click outside to close (backdrop click)
 * - Body scroll lock when open
 * - Overscroll containment (prevents background scroll on input focus)
 * - Animated entrance (fade + slide)
 * - Optional title and description
 * - ModalFooter sub-component for action buttons
 * 
 * SIZES:
 * - sm: max-w-sm (small dialogs, confirmations)
 * - md: max-w-md (default, most common)
 * - lg: max-w-lg (forms, detailed content)
 * - xl: max-w-xl (large content, complex forms)
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic modal with title
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Purchase"
 * >
 *   <p>Are you sure you want to buy this signal?</p>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button onClick={handlePurchase}>Confirm</Button>
 *   </ModalFooter>
 * </Modal>
 * 
 * // Modal with title and description
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Create Signal"
 *   description="Fill in the details for your trading signal"
 *   size="lg"
 * >
 *   <form>...</form>
 * </Modal>
 * 
 * // Small confirmation dialog
 * <Modal isOpen={showDelete} onClose={cancelDelete} size="sm">
 *   <p>Delete this signal?</p>
 *   <ModalFooter>
 *     <Button variant="danger" onClick={confirmDelete}>Delete</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 * 
 * ACCESSIBILITY:
 * - role="dialog" and aria-modal="true" for screen readers
 * - aria-labelledby links title to dialog
 * - Escape key closes modal
 * - Focus trap (TODO: implement for full accessibility)
 * - Body scroll locked when modal is open
 * 
 * WHY USE PORTAL?
 * - Renders modal at document.body level
 * - Avoids z-index stacking context issues
 * - Modal is always on top regardless of parent positioning
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title (displayed in header) */
  title?: string;
  /** Description text below title */
  description?: string;
  /** Modal width (sm, md, lg, xl, 2xl) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Modal content */
  children: ReactNode;
}

/** Size-specific max-width classes */
const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * Modal Component
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Called when user clicks backdrop, X button, or presses Escape
 * @param title - Optional header title
 * @param description - Optional description below title
 * @param size - Modal width (sm, md, lg, xl)
 * @param children - Modal content
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  // Store scroll position in a ref to persist across renders
  const scrollPositionRef = useRef(0);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      // Save current scroll position and lock body scroll
      // Using position:fixed prevents background scroll when interacting with modal inputs
      scrollPositionRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        // Restore body scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollPositionRef.current);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Render via portal to document.body
  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop - dark overlay, click to close */}
      <div
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container - centered, NO scroll on this container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
        <div
          className={cn(
            'relative w-full bg-dark-800 border border-dark-700 rounded-xl shadow-2xl',
            'animate-slide-up max-h-[90vh] flex flex-col overscroll-contain',
            sizes[size]
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
        >
          {/* Header (optional) */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-4 border-b border-dark-700 flex-shrink-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-dark-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-dark-400">{description}</p>
              )}
            </div>
          )}

          {/* Content - scrollable with overscroll containment to prevent background scroll */}
          <div className="px-6 py-4 overflow-y-auto flex-1 overscroll-contain">{children}</div>

          {/* Close button (X) - top right */}
          <button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 p-2 rounded-lg',
              'text-dark-400 hover:text-dark-100 hover:bg-dark-700',
              'transition-colors duration-200 z-10'
            )}
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * ModalFooter - Container for action buttons
 * 
 * Positioned at the bottom with a top border separator.
 * Buttons are right-aligned with consistent gap spacing.
 * 
 * @example
 * <ModalFooter>
 *   <Button variant="ghost" onClick={onClose}>Cancel</Button>
 *   <Button onClick={onConfirm}>Confirm</Button>
 * </ModalFooter>
 */
export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-700',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Modal;
