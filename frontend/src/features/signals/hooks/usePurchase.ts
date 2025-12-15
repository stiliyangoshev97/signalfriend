/**
 * @fileoverview React hooks for signal purchase flow
 * @module features/signals/hooks/usePurchase
 * @description
 * Custom hooks for handling the complete signal purchase flow:
 * 1. Check USDT allowance
 * 2. Approve USDT if needed
 * 3. Execute buySignalNFT contract call
 * 4. Wait for transaction confirmation
 *
 * PURCHASE FLOW:
 * ```
 * User clicks "Purchase" →
 *   Check USDT balance →
 *   Check USDT allowance →
 *   (If needed) Approve USDT →
 *   Wait for approval tx →
 *   Call buySignalNFT →
 *   Wait for purchase tx →
 *   Show success
 * ```
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useEffect, useRef } from 'react';
import { getContractAddresses, SIGNAL_FRIEND_MARKET_ABI, ERC20_ABI, env } from '@/shared/config';
import { checkPurchase, fetchContentIdentifier, fetchMyReceipts, fetchSignalContent } from '../api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { signalKeys } from './useSignals';
import type { CheckPurchaseResponse, Receipt, SignalContentResponse } from '../api/purchase.api';

/** USDT has 18 decimals on BNB Chain */
const USDT_DECIMALS = 18;

/** Query key factory for purchase-related queries */
export const purchaseKeys = {
  all: ['purchase'] as const,
  check: (contentId: string, address?: string) => [...purchaseKeys.all, 'check', contentId, address] as const,
  contentId: (contentId: string) => [...purchaseKeys.all, 'contentIdentifier', contentId] as const,
  content: (contentId: string, address?: string) => [...purchaseKeys.all, 'content', contentId, address] as const,
  myReceipts: (address: string, params?: { page?: number; limit?: number }) => 
    [...purchaseKeys.all, 'myReceipts', address, params] as const,
};

/**
 * Hook to check if the current user has purchased a signal.
 * Only runs when user is authenticated (has JWT token) to prevent
 * 401 errors that would redirect unauthenticated users away from public pages.
 *
 * @param contentId - Signal's content ID
 * @returns Query result with purchase status
 *
 * @example
 * const { data, isLoading } = useCheckPurchase('abc123');
 * if (data?.hasPurchased) {
 *   // User owns this signal
 * }
 */
export function useCheckPurchase(contentId: string) {
  const { address, isConnected } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  // Double-check that authToken exists in localStorage (prevents stale state issues)
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  return useQuery<CheckPurchaseResponse>({
    // Include address in query key to ensure cache invalidation on wallet switch
    queryKey: purchaseKeys.check(contentId, address),
    queryFn: () => checkPurchase(contentId),
    // Only check purchase status when:
    // 1. Wallet is connected
    // 2. Auth store has hydrated (prevents stale state)
    // 3. User is authenticated in store
    // 4. authToken exists in localStorage (belt-and-suspenders check)
    // 5. contentId is provided
    enabled: isConnected && hasHydrated && isAuthenticated && hasToken && !!contentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch the protected content of a purchased signal.
 * Only fetches when user is authenticated and has purchased the signal (isOwned = true),
 * OR when the user is an admin (multisig wallet holder).
 *
 * @param contentId - Signal's content ID
 * @param canAccess - Whether the user can access this content (owned, is creator, or is admin)
 * @returns Query result with protected content
 *
 * @example
 * const { data: purchaseData } = useCheckPurchase(contentId);
 * const { data: contentData } = useSignalContent(contentId, purchaseData?.hasPurchased || isAdmin);
 * if (contentData) {
 *   console.log('Protected content:', contentData.content);
 * }
 */
export function useSignalContent(contentId: string, canAccess: boolean = false) {
  const { address, isConnected } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  // Double-check that authToken exists in localStorage (prevents stale state issues)
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  return useQuery<SignalContentResponse>({
    // Include address in query key to ensure cache invalidation on wallet switch
    queryKey: purchaseKeys.content(contentId, address),
    queryFn: () => fetchSignalContent(contentId),
    // Only fetch protected content when:
    // 1. Wallet is connected
    // 2. Auth store has hydrated
    // 3. User is authenticated in store
    // 4. authToken exists in localStorage
    // 5. contentId is provided
    // 6. User can access the content (owns signal, is creator, or is admin)
    enabled: isConnected && hasHydrated && isAuthenticated && hasToken && !!contentId && canAccess,
    staleTime: 1000 * 60 * 30, // 30 minutes - content doesn't change
  });
}

/**
 * Hook to fetch the current user's purchased signals (receipts)
 *
 * @param params - Optional pagination parameters
 * @returns Query result with array of receipts
 *
 * @example
 * const { data: receipts, isLoading } = useMyReceipts({ page: 1, limit: 10 });
 * receipts?.forEach(receipt => {
 *   console.log(receipt.signal?.title);
 * });
 */
export function useMyReceipts(params?: {
  page?: number;
  limit?: number;
  sortBy?: 'purchasedAt' | 'priceUsdt';
  sortOrder?: 'asc' | 'desc';
}) {
  const { address, isConnected } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  return useQuery<Receipt[]>({
    // Include address in query key to ensure cache invalidation on wallet switch
    queryKey: purchaseKeys.myReceipts(address ?? '', params),
    queryFn: () => fetchMyReceipts(params),
    // Only fetch receipts when user is authenticated
    enabled: isConnected && hasHydrated && isAuthenticated && hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch the bytes32 content identifier for on-chain purchase
 *
 * @param contentId - Signal's UUID content ID
 * @returns Query result with bytes32 content identifier
 */
export function useContentIdentifier(contentId: string) {
  const { isConnected } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: purchaseKeys.contentId(contentId),
    queryFn: () => fetchContentIdentifier(contentId),
    // Only fetch when authenticated (endpoint requires auth)
    enabled: isConnected && hasHydrated && isAuthenticated && hasToken && !!contentId,
    staleTime: Infinity, // Content ID never changes
  });
}

/**
 * Hook to read USDT balance for the connected wallet
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Current USDT balance in wei and formatted
 */
export function useUSDTBalance(chainId: number = env.CHAIN_ID) {
  const { address } = useAccount();
  const addresses = getContractAddresses(chainId);

  const { data: balanceWei, ...rest } = useReadContract({
    address: addresses.USDT,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  const balance = balanceWei ? formatUnits(balanceWei as bigint, USDT_DECIMALS) : '0';

  return {
    ...rest,
    balanceWei: balanceWei as bigint | undefined,
    balance,
    balanceNumber: parseFloat(balance),
  };
}

/**
 * Hook to check USDT allowance for the SignalFriendMarket contract
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Current allowance in wei and formatted
 */
export function useUSDTAllowance(chainId: number = env.CHAIN_ID) {
  const { address } = useAccount();
  const addresses = getContractAddresses(chainId);

  const { data: allowanceWei, ...rest } = useReadContract({
    address: addresses.USDT,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, addresses.SignalFriendMarket] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Check frequently during approval flow
    },
  });

  const allowance = allowanceWei ? formatUnits(allowanceWei as bigint, USDT_DECIMALS) : '0';

  return {
    ...rest,
    allowanceWei: allowanceWei as bigint | undefined,
    allowance,
    allowanceNumber: parseFloat(allowance),
  };
}

/**
 * Hook to approve USDT spending for the SignalFriendMarket contract
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Mutation for approving USDT
 *
 * @example
 * const { approve, isApproving, approvalHash } = useApproveUSDT();
 *
 * // Approve 100 USDT
 * await approve(100);
 */
export function useApproveUSDT(chainId: number = env.CHAIN_ID) {
  const addresses = getContractAddresses(chainId);
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amountUsdt: number) => {
    const amountWei = parseUnits(amountUsdt.toString(), USDT_DECIMALS);

    return writeContractAsync({
      address: addresses.USDT,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [addresses.SignalFriendMarket, amountWei],
    });
  };

  return {
    approve,
    approvalHash: hash,
    isApproving: isPending,
    isConfirmingApproval: isConfirming,
    isApprovalConfirmed: isConfirmed,
    approvalError: error,
  };
}

/**
 * Hook to execute the buySignalNFT contract call
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Mutation for purchasing a signal
 *
 * @example
 * const { purchase, isPurchasing, purchaseHash } = useBuySignal();
 *
 * await purchase({
 *   predictorAddress: '0x...',
 *   priceUsdt: 25,
 *   contentIdentifier: '0x...',
 * });
 */
export function useBuySignal(chainId: number = env.CHAIN_ID) {
  const addresses = getContractAddresses(chainId);
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Execute the buySignalNFT contract call
   *
   * @param params.predictorAddress - Address of the predictor selling the signal
   * @param params.priceUsdt - Signal price in USDT (not including access fee)
   * @param params.contentIdentifier - bytes32 content identifier from backend
   * @param params.maxCommissionRate - Max acceptable commission rate (default 500 = 5%)
   */
  const purchase = async (params: {
    predictorAddress: `0x${string}`;
    priceUsdt: number;
    contentIdentifier: `0x${string}`;
    maxCommissionRate?: number;
    contentId: string; // For cache invalidation
  }) => {
    const priceWei = parseUnits(params.priceUsdt.toString(), USDT_DECIMALS);
    const maxCommission = BigInt(params.maxCommissionRate ?? 500); // 5% default

    const result = await writeContractAsync({
      address: addresses.SignalFriendMarket,
      abi: SIGNAL_FRIEND_MARKET_ABI,
      functionName: 'buySignalNFT',
      args: [params.predictorAddress, priceWei, maxCommission, params.contentIdentifier],
    });

    // Invalidate purchase check cache after successful purchase (include address for proper cache key)
    queryClient.invalidateQueries({ queryKey: purchaseKeys.check(params.contentId, address) });

    return result;
  };

  return {
    purchase,
    purchaseHash: hash,
    isPurchasing: isPending,
    isConfirmingPurchase: isConfirming,
    isPurchaseConfirmed: isConfirmed,
    purchaseError: error,
  };
}

/**
 * Combined hook for the complete purchase flow
 *
 * Provides all the state and actions needed for the purchase modal:
 * - Balance checking
 * - Allowance checking
 * - Approval
 * - Purchase execution
 *
 * @param contentId - Signal's content ID
 * @param priceUsdt - Signal price in USDT
 * @param predictorAddress - Predictor's wallet address
 * @param chainId - Chain ID (default: 97 for testnet)
 *
 * @example
 * const {
 *   step,
 *   canPurchase,
 *   needsApproval,
 *   handleApprove,
 *   handlePurchase,
 *   isProcessing,
 *   error,
 * } = usePurchaseFlow({
 *   contentId: 'abc123',
 *   priceUsdt: 25,
 *   predictorAddress: '0x...',
 * });
 */
export function usePurchaseFlow(params: {
  contentId: string;
  priceUsdt: number;
  predictorAddress: `0x${string}`;
  chainId?: number;
}) {
  const { contentId, priceUsdt, predictorAddress, chainId = env.CHAIN_ID } = params;
  const queryClient = useQueryClient();
  const { address } = useAccount();
  
  // Track if we've already invalidated caches for this purchase
  const hasInvalidatedRef = useRef(false);

  // Access fee is 0.5 USDT
  const ACCESS_FEE = 0.5;
  const totalCost = priceUsdt + ACCESS_FEE;

  // Get content identifier for on-chain call
  const { data: contentIdData, isLoading: isLoadingContentId, error: contentIdError, refetch: refetchContentId } = useContentIdentifier(contentId);

  // Check balance and allowance
  const { balanceNumber, isLoading: isLoadingBalance } = useUSDTBalance(chainId);
  const { allowanceNumber, isLoading: isLoadingAllowance, refetch: refetchAllowance } = useUSDTAllowance(chainId);

  // Approval state
  const {
    approve,
    isApproving,
    isConfirmingApproval,
    isApprovalConfirmed,
    approvalError,
  } = useApproveUSDT(chainId);

  // Purchase state
  const {
    purchase,
    isPurchasing,
    isConfirmingPurchase,
    isPurchaseConfirmed,
    purchaseError,
  } = useBuySignal(chainId);

  // IMPORTANT: Invalidate caches after purchase confirmation
  // This handles the case where the webhook might be delayed or rate-limited
  // We invalidate multiple times with delays to ensure the backend has processed the purchase
  useEffect(() => {
    if (isPurchaseConfirmed && !hasInvalidatedRef.current) {
      hasInvalidatedRef.current = true;
      
      // Helper to invalidate all purchase-related queries
      const invalidatePurchaseQueries = () => {
        // Invalidate purchase check for this signal
        queryClient.invalidateQueries({ 
          queryKey: purchaseKeys.check(contentId, address) 
        });
        // Invalidate signal detail to show updated purchase status
        queryClient.invalidateQueries({ 
          queryKey: signalKeys.detail(contentId) 
        });
        // Invalidate user's receipts list (My Signals page)
        // Uses partial key match: any query starting with ['purchase', 'myReceipts', address]
        if (address) {
          queryClient.invalidateQueries({ 
            queryKey: ['purchase', 'myReceipts', address],
          });
        }
        // Invalidate signal content (now accessible)
        queryClient.invalidateQueries({ 
          queryKey: purchaseKeys.content(contentId, address) 
        });
      };
      
      // Immediate invalidation
      invalidatePurchaseQueries();
      
      // Delayed invalidations to handle webhook processing delays
      // The backend webhook might take a moment to process the blockchain event
      const delays = [2000, 5000, 10000]; // 2s, 5s, 10s
      delays.forEach(delay => {
        setTimeout(() => {
          invalidatePurchaseQueries();
        }, delay);
      });
    }
  }, [isPurchaseConfirmed, contentId, address, queryClient]);

  // Reset invalidation flag when contentId changes (new purchase flow)
  useEffect(() => {
    hasInvalidatedRef.current = false;
  }, [contentId]);

  // Derived state
  const hasEnoughBalance = balanceNumber >= totalCost;
  const needsApproval = allowanceNumber < totalCost;
  const canPurchase = hasEnoughBalance && !needsApproval && !!contentIdData?.contentIdentifier;

  // Determine current step
  type PurchaseStep = 'loading' | 'error' | 'insufficient-balance' | 'approve' | 'approving' | 'ready' | 'purchasing' | 'success';
  let step: PurchaseStep = 'loading';

  if (isLoadingBalance || isLoadingAllowance || isLoadingContentId) {
    step = 'loading';
  } else if (contentIdError) {
    // API error (e.g., rate limit) - show error state
    step = 'error';
  } else if (!hasEnoughBalance) {
    step = 'insufficient-balance';
  } else if (needsApproval) {
    if (isApproving || isConfirmingApproval) {
      step = 'approving';
    } else {
      step = 'approve';
    }
  } else if (isPurchasing || isConfirmingPurchase) {
    step = 'purchasing';
  } else if (isPurchaseConfirmed) {
    step = 'success';
  } else {
    step = 'ready';
  }

  // Action handlers
  const handleApprove = async () => {
    // Approve a bit more than needed to avoid rounding issues
    await approve(totalCost * 1.01);
    // Refetch allowance after approval confirms
    setTimeout(() => refetchAllowance(), 2000);
  };

  const handlePurchase = async () => {
    if (!contentIdData?.contentIdentifier) {
      throw new Error('Content identifier not loaded');
    }

    await purchase({
      predictorAddress,
      priceUsdt,
      contentIdentifier: contentIdData.contentIdentifier,
      contentId,
    });
  };

  return {
    // State
    step,
    totalCost,
    balance: balanceNumber,
    allowance: allowanceNumber,
    hasEnoughBalance,
    needsApproval,
    canPurchase,

    // Approval
    handleApprove,
    isApproving: isApproving || isConfirmingApproval,
    isApprovalConfirmed,
    approvalError,

    // Purchase
    handlePurchase,
    isPurchasing: isPurchasing || isConfirmingPurchase,
    isPurchaseConfirmed,
    purchaseError,

    // Combined
    isProcessing: isApproving || isConfirmingApproval || isPurchasing || isConfirmingPurchase,
    error: contentIdError || approvalError || purchaseError,
    
    // Retry function for API errors
    retry: refetchContentId,
  };
}
