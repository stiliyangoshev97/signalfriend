/**
 * Region Disclaimer Modal (EU/EEA Exclusion)
 *
 * A blocking modal that requires users to confirm they are not from EU/EEA
 * before accessing the platform. This is required for MiCA compliance.
 *
 * Similar to Uniswap's legal disclaimer approach:
 * - Shows on first visit
 * - Stores acknowledgment in localStorage
 * - Blocks all interaction until acknowledged
 *
 * CONFIGURATION:
 * Set VITE_REGION_DISCLAIMER_ENABLED=true in .env to enable the modal.
 * If not set or set to false, the modal will not be displayed.
 *
 * @module shared/components/RegionDisclaimerModal
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'signalfriend-region-disclaimer-acknowledged';

/**
 * Check if the region disclaimer is enabled via environment variable.
 * Only "true" (case-insensitive) enables the disclaimer.
 */
const isRegionDisclaimerEnabled =
  import.meta.env.VITE_REGION_DISCLAIMER_ENABLED?.toLowerCase() === 'true';

/**
 * Check if user has already acknowledged the disclaimer
 */
function hasAcknowledged(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // localStorage not available (private browsing, etc.)
    return false;
  }
}

/**
 * Save acknowledgment to localStorage
 */
function saveAcknowledgment(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Fail silently - user will need to acknowledge again next session
  }
}

export function RegionDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Check on mount if disclaimer needs to be shown
  useEffect(() => {
    // Only show if enabled via env variable AND user hasn't acknowledged
    if (isRegionDisclaimerEnabled && !hasAcknowledged()) {
      setIsOpen(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleConfirm = () => {
    if (!isChecked) return;
    saveAcknowledgment();
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  // Don't render if disabled via env or already acknowledged
  if (!isRegionDisclaimerEnabled || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="region-disclaimer-title"
    >
      {/* Backdrop - solid dark to block content */}
      <div className="absolute inset-0 bg-dark-950/98 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-dark-600">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-gold/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-accent-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2
              id="region-disclaimer-title"
              className="text-xl font-bold text-fur-cream"
            >
              Important Notice
            </h2>
          </div>
          <p className="text-sm text-gray-main">
            Please read and acknowledge before continuing
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-dark-900/50 border border-dark-600 rounded-lg p-4">
            <h3 className="font-semibold text-fur-cream mb-2">
              Jurisdictional Restrictions
            </h3>
            <p className="text-sm text-gray-main leading-relaxed">
              SignalFriend is <strong className="text-fur-cream">not offered to, directed at, or intended for use</strong> by 
              any person or entity who is located in, resident in, or acting on behalf of a person or entity located in 
              the <strong className="text-fur-cream">European Union (EU)</strong> or{' '}
              <strong className="text-fur-cream">European Economic Area (EEA)</strong>.
            </p>
          </div>

          <p className="text-sm text-gray-main">
            By proceeding, you acknowledge that you have read and understood our{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-gold hover:underline"
            >
              Terms and Conditions
            </a>
            , including the jurisdictional restrictions.
          </p>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-dark-500 rounded bg-dark-900 peer-checked:bg-accent-gold peer-checked:border-accent-gold transition-colors">
                {isChecked && (
                  <svg
                    className="w-full h-full text-dark-900 p-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-fur-cream leading-tight">
              I confirm that I am <strong>not</strong> a resident of, located in, or acting on behalf of 
              a person in the European Union or European Economic Area.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={handleConfirm}
            disabled={!isChecked}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200
              ${
                isChecked
                  ? 'bg-accent-gold text-dark-900 hover:bg-accent-gold/90 cursor-pointer'
                  : 'bg-dark-600 text-gray-main cursor-not-allowed'
              }
            `}
          >
            {isChecked ? 'Continue to SignalFriend' : 'Please confirm above to continue'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RegionDisclaimerModal;
