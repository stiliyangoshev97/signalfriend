/**
 * @fileoverview Signal Content Display Component
 * @module features/signals/components/SignalContent
 * @description
 * Displays the protected content of a signal (only visible to owners).
 * Shows a locked/teaser state for non-owners.
 */

/** Props for SignalContent component */
interface SignalContentProps {
  /** Whether the user owns this signal */
  isOwned: boolean;
  /** Full content (only available if owned) */
  fullContent?: string;
  /** Reasoning/analysis (only available if owned) */
  reasoning?: string;
  /** Signal price for teaser */
  priceUSDT: number;
}

/**
 * Lock icon component
 */
function LockIcon(): React.ReactElement {
  return (
    <svg
      className="w-16 h-16 text-fur-cream/30 mx-auto"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

/**
 * SignalContent component
 * 
 * Two states:
 * 1. Locked (not owned): Shows teaser with lock icon
 * 2. Unlocked (owned): Shows full content and reasoning
 * 
 * @param props - Component props
 * @returns Signal content element
 * 
 * @example
 * <SignalContent
 *   isOwned={hasReceipt}
 *   fullContent={signal.fullContent}
 *   reasoning={signal.reasoning}
 *   priceUSDT={signal.priceUSDT}
 * />
 */
export function SignalContent({
  isOwned,
  fullContent,
  reasoning,
  priceUSDT,
}: SignalContentProps): React.ReactElement {
  if (!isOwned) {
    // Locked state
    return (
      <div
        id="signal-content"
        className="bg-dark-800 border border-dark-600 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-fur-cream mb-4">
          Signal Content
        </h3>

        <div className="bg-dark-900/50 border border-dark-600 rounded-lg p-8 text-center">
          <LockIcon />
          <h4 className="text-xl font-semibold text-fur-cream mt-4 mb-2">
            Content Locked
          </h4>
          <p className="text-fur-cream/60 mb-4 max-w-md mx-auto">
            Purchase this signal to unlock the full analysis, recommendation,
            and detailed reasoning from the predictor.
          </p>
          <div className="inline-flex items-center gap-2 bg-fur-light/10 px-4 py-2 rounded-full">
            <span className="text-fur-light font-semibold">${priceUSDT} USDT</span>
            <span className="text-fur-cream/50">to unlock</span>
          </div>
        </div>

        {/* Teaser of what's included */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-dark-900/30 rounded-lg">
            <div className="w-8 h-8 bg-fur-light/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-fur-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-fur-cream">Full Strategy</p>
              <p className="text-xs text-fur-cream/50">Complete analysis and recommendation</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-dark-900/30 rounded-lg">
            <div className="w-8 h-8 bg-fur-light/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-fur-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-fur-cream">Entry & Exit Points</p>
              <p className="text-xs text-fur-cream/50">Precise price targets</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-dark-900/30 rounded-lg">
            <div className="w-8 h-8 bg-fur-light/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-fur-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-fur-cream">Analysis & Reasoning</p>
              <p className="text-xs text-fur-cream/50">Detailed market analysis</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-dark-900/30 rounded-lg">
            <div className="w-8 h-8 bg-fur-light/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-fur-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-fur-cream">Timeframe</p>
              <p className="text-xs text-fur-cream/50">Expected duration for the trade</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked state - show full content
  return (
    <div
      id="signal-content"
      className="bg-dark-800 border border-dark-600 rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-success-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-fur-cream">
          Signal Content
        </h3>
        <span className="text-xs bg-success-400/10 text-success-400 px-2 py-0.5 rounded-full">
          Unlocked
        </span>
      </div>

      {/* Full Content */}
      {fullContent && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-fur-cream/60 uppercase tracking-wide mb-2">
            Full Signal
          </h4>
          <div className="bg-dark-900/50 border border-dark-600 rounded-lg p-4">
            <p className="text-fur-cream whitespace-pre-wrap break-words">{fullContent}</p>
          </div>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && (
        <div>
          <h4 className="text-sm font-medium text-fur-cream/60 uppercase tracking-wide mb-2">
            Analysis & Reasoning
          </h4>
          <div className="bg-dark-900/50 border border-dark-600 rounded-lg p-4">
            <p className="text-fur-cream/80 whitespace-pre-wrap break-words">{reasoning}</p>
          </div>
        </div>
      )}

      {/* No content available */}
      {!fullContent && !reasoning && (
        <div className="bg-dark-900/50 border border-dark-600 rounded-lg p-8 text-center">
          <p className="text-fur-cream/60">
            No additional content available for this signal.
          </p>
        </div>
      )}
    </div>
  );
}

export default SignalContent;
