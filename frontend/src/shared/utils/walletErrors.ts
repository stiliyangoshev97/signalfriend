/**
 * Wallet Error Utilities
 *
 * Helper functions for parsing and formatting wallet/transaction errors
 * into user-friendly messages.
 *
 * @module shared/utils/walletErrors
 *
 * EXPORTS:
 * - `parseWalletError`      - Parse error into user-friendly message
 * - `isUserRejectionError`  - Check if error was user rejection
 *
 * USAGE EXAMPLES:
 * ```tsx
 * try {
 *   await sendTransaction();
 * } catch (error) {
 *   const { title, message, isUserAction } = parseWalletError(error);
 *   // title: "Transaction Cancelled"
 *   // message: "You declined the transaction in your wallet."
 *   // isUserAction: true
 * }
 * ```
 *
 * SUPPORTED ERROR TYPES:
 * - User rejection (MetaMask, WalletConnect, etc.)
 * - Insufficient funds
 * - Network errors
 * - Contract reverts
 * - Generic errors
 */

/** Parsed wallet error with user-friendly content */
export interface ParsedWalletError {
  /** Short error title */
  title: string;
  /** Detailed user-friendly message */
  message: string;
  /** Whether this was a deliberate user action (not an error) */
  isUserAction: boolean;
  /** Original error for debugging */
  originalError?: unknown;
}

/**
 * Error patterns to match against error messages
 */
const ERROR_PATTERNS = {
  // User rejection patterns (different wallets use different messages)
  userRejection: [
    'user rejected',
    'user denied',
    'user cancelled',
    'user canceled',
    'rejected the request',
    'denied transaction signature',
    'transaction was rejected',
    'request rejected',
    'user refused',
    'cancelled by user',
    'canceled by user',
    'action_rejected',
    'ACTION_REJECTED',
  ],

  // Insufficient funds patterns
  insufficientFunds: [
    'insufficient funds',
    'insufficient balance',
    'not enough balance',
    'exceeds balance',
    'underpriced',
    'gas required exceeds allowance',
  ],

  // Network/connection errors
  networkError: [
    'network error',
    'failed to fetch',
    'connection refused',
    'timeout',
    'disconnected',
    'chain mismatch',
    'wrong network',
  ],

  // Contract revert patterns
  contractRevert: [
    'execution reverted',
    'revert',
    'require failed',
    'assert failed',
    'out of gas',
  ],
} as const;

/**
 * Check if error message matches any pattern in the list
 */
function matchesPattern(errorMessage: string, patterns: readonly string[]): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return patterns.some(pattern => lowerMessage.includes(pattern.toLowerCase()));
}

/**
 * Extract error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    // Check for nested error messages (common in viem/wagmi)
    const anyError = error as unknown as Record<string, unknown>;
    
    // Check shortMessage first (viem pattern)
    if (typeof anyError.shortMessage === 'string') {
      return anyError.shortMessage;
    }
    
    // Check details (viem pattern)
    if (typeof anyError.details === 'string') {
      return anyError.details;
    }
    
    // Check cause
    if (anyError.cause && typeof anyError.cause === 'object') {
      const cause = anyError.cause as Record<string, unknown>;
      if (typeof cause.message === 'string') {
        return cause.message;
      }
      if (typeof cause.shortMessage === 'string') {
        return cause.shortMessage;
      }
    }
    
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.reason === 'string') return obj.reason;
  }
  
  return 'Unknown error';
}

/**
 * Check if the error was caused by user rejecting the transaction
 */
export function isUserRejectionError(error: unknown): boolean {
  const message = extractErrorMessage(error);
  return matchesPattern(message, ERROR_PATTERNS.userRejection);
}

/**
 * Parse a wallet/transaction error into a user-friendly format
 *
 * @param error - The error from wallet interaction
 * @returns Parsed error with title, message, and isUserAction flag
 *
 * @example
 * const { title, message, isUserAction } = parseWalletError(error);
 * if (isUserAction) {
 *   // Don't show as error, just inform user
 * }
 */
export function parseWalletError(error: unknown): ParsedWalletError {
  const rawMessage = extractErrorMessage(error);

  // User rejection - not really an error, user intentionally cancelled
  if (matchesPattern(rawMessage, ERROR_PATTERNS.userRejection)) {
    return {
      title: 'Request Cancelled',
      message: 'You declined the request in your wallet.',
      isUserAction: true,
      originalError: error,
    };
  }

  // Insufficient funds
  if (matchesPattern(rawMessage, ERROR_PATTERNS.insufficientFunds)) {
    return {
      title: 'Insufficient Balance',
      message: 'You don\'t have enough funds to complete this transaction. Please add more funds to your wallet.',
      isUserAction: false,
      originalError: error,
    };
  }

  // Network errors
  if (matchesPattern(rawMessage, ERROR_PATTERNS.networkError)) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the blockchain network. Please check your internet connection and try again.',
      isUserAction: false,
      originalError: error,
    };
  }

  // Contract reverts - try to extract useful info
  if (matchesPattern(rawMessage, ERROR_PATTERNS.contractRevert)) {
    // Try to extract a more specific message from the revert
    const revertMatch = rawMessage.match(/revert(?:ed)?:?\s*(.+?)(?:\.|$)/i);
    const revertReason = revertMatch?.[1]?.trim();

    return {
      title: 'Transaction Failed',
      message: revertReason || 'The transaction was rejected by the smart contract. Please try again.',
      isUserAction: false,
      originalError: error,
    };
  }

  // Generic fallback
  return {
    title: 'Transaction Failed',
    message: 'Something went wrong. Please try again.',
    isUserAction: false,
    originalError: error,
  };
}

export default parseWalletError;
