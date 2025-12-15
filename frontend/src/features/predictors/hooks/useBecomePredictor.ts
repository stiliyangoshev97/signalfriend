// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/frontend/src/features/predictors/hooks/useBecomPredictor.ts
/**
 * @fileoverview React hooks for the "Become a Predictor" registration flow
 * @module features/predictors/hooks/useBecomePredictor
 * @description
 * Custom hooks for handling predictor registration:
 * 1. Check if user already has a PredictorAccessPass NFT
 * 2. Read platform parameters (join fee)
 * 3. Check USDT allowance
 * 4. Approve USDT if needed
 * 5. Call joinAsPredictor on SignalFriendMarket
 * 6. Wait for transaction confirmation
 *
 * REGISTRATION FLOW:
 * ```
 * User clicks "Become a Predictor" →
 *   Check NFT balance (already predictor?) →
 *   Get join fee from contract →
 *   Check USDT balance →
 *   Check USDT allowance →
 *   (If needed) Approve USDT →
 *   Wait for approval tx →
 *   Call joinAsPredictor →
 *   Wait for tx confirmation →
 *   Redirect to dashboard
 * ```
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, zeroAddress } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  getContractAddresses,
  SIGNAL_FRIEND_MARKET_ABI,
  PREDICTOR_ACCESS_PASS_ABI,
  ERC20_ABI,
  env,
} from '@/shared/config';
import { predictorKeys } from './usePredictorDashboard';
import { predictorListKeys } from './usePredictors';
import { useAuthStore } from '@/features/auth/store';
import { fetchPredictorByAddress } from '../api/predictors.api';

/** USDT has 18 decimals on BNB Chain */
const USDT_DECIMALS = 18;

/**
 * Hook to check if the connected wallet already owns a PredictorAccessPass NFT
 *
 * @param chainId - Chain ID to use for contract addresses (default: 97 testnet)
 * @returns NFT balance (0 = not a predictor, >0 = already predictor)
 *
 * @example
 * const { isPredictor, isLoading } = usePredictorNFTBalance();
 * if (isPredictor) {
 *   // User is already a predictor
 * }
 */
export function usePredictorNFTBalance(chainId: number = env.CHAIN_ID) {
  const { address } = useAccount();
  const addresses = getContractAddresses(chainId);

  const { data: balance, ...rest } = useReadContract({
    address: addresses.PredictorAccessPass,
    abi: PREDICTOR_ACCESS_PASS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Check every 10 seconds
    },
  });

  return {
    ...rest,
    balance: balance as bigint | undefined,
    isPredictor: balance ? (balance as bigint) > 0n : false,
  };
}

/**
 * Hook to read platform parameters including predictor join fee
 *
 * @param chainId - Chain ID to use for contract addresses (default: 97 testnet)
 * @returns Platform parameters including join fee
 *
 * @example
 * const { joinFee, joinFeeFormatted } = usePlatformParameters();
 * console.log(`Join fee: ${joinFeeFormatted} USDT`);
 */
export function usePlatformParameters(chainId: number = env.CHAIN_ID) {
  const addresses = getContractAddresses(chainId);

  const { data, ...rest } = useReadContract({
    address: addresses.SignalFriendMarket,
    abi: SIGNAL_FRIEND_MARKET_ABI,
    functionName: 'getPlatformParameters',
    query: {
      staleTime: 60000, // Cache for 1 minute
    },
  });

  // Destructure the tuple result
  const [minSignalPrice, predictorJoinFee, referralPayout, buyerAccessFee, commissionRate] =
    (data as [bigint, bigint, bigint, bigint, bigint] | undefined) ?? [];

  return {
    ...rest,
    minSignalPrice,
    joinFee: predictorJoinFee,
    joinFeeFormatted: predictorJoinFee
      ? formatUnits(predictorJoinFee, USDT_DECIMALS)
      : undefined,
    joinFeeNumber: predictorJoinFee
      ? parseFloat(formatUnits(predictorJoinFee, USDT_DECIMALS))
      : undefined,
    referralPayout,
    referralPayoutFormatted: referralPayout
      ? formatUnits(referralPayout, USDT_DECIMALS)
      : undefined,
    buyerAccessFee,
    commissionRate,
  };
}

/**
 * Hook to read USDT balance for the connected wallet
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Current USDT balance in wei and formatted
 */
export function useUSDTBalanceForPredictor(chainId: number = env.CHAIN_ID) {
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
export function useUSDTAllowanceForPredictor(chainId: number = env.CHAIN_ID) {
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
 * const { approve, isApproving, approvalHash } = useApproveUSDTForPredictor();
 * await approve(20); // Approve 20 USDT for join fee
 */
export function useApproveUSDTForPredictor(chainId: number = env.CHAIN_ID) {
  const addresses = getContractAddresses(chainId);
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();

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
    resetApproval: reset,
  };
}

/**
 * Hook to call joinAsPredictor on SignalFriendMarket contract
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Mutation for joining as predictor
 *
 * @example
 * const { join, isJoining, joinHash } = useJoinAsPredictor();
 * await join(); // No referrer
 * await join('0x...'); // With referrer
 */
export function useJoinAsPredictor(chainId: number = env.CHAIN_ID) {
  const addresses = getContractAddresses(chainId);
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Join as a predictor
   * @param referrer - Optional referrer address (must be active predictor)
   */
  const join = async (referrer?: `0x${string}`) => {
    const result = await writeContractAsync({
      address: addresses.SignalFriendMarket,
      abi: SIGNAL_FRIEND_MARKET_ABI,
      functionName: 'joinAsPredictor',
      args: [referrer ?? zeroAddress],
    });

    // Invalidate predictor-related queries after successful join
    queryClient.invalidateQueries({ queryKey: predictorKeys.all });

    return result;
  };

  return {
    join,
    joinHash: hash,
    isJoining: isPending,
    isConfirmingJoin: isConfirming,
    isJoinConfirmed: isConfirmed,
    joinError: error,
    resetJoin: reset,
  };
}

/**
 * Combined hook for the complete "Become a Predictor" flow
 *
 * Provides all the state and actions needed for the registration page:
 * - NFT ownership check (already predictor?)
 * - Join fee from contract
 * - Balance checking
 * - Allowance checking
 * - Approval
 * - Join transaction
 *
 * @param chainId - Chain ID to use for contract addresses
 * @returns Complete state for become-predictor flow
 */
export function useBecomePredictor(chainId: number = env.CHAIN_ID) {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  
  // Track if we've already invalidated caches for this join
  const hasInvalidatedRef = useRef(false);

  // Check if already a predictor
  const {
    isPredictor,
    isLoading: isCheckingNFT,
    refetch: refetchNFT,
  } = usePredictorNFTBalance(chainId);

  // Get platform parameters (join fee)
  const {
    joinFee,
    joinFeeFormatted,
    joinFeeNumber,
    referralPayoutFormatted,
    isLoading: isLoadingParams,
  } = usePlatformParameters(chainId);

  // Check USDT balance
  const {
    balanceNumber: usdtBalance,
    isLoading: isLoadingBalance,
  } = useUSDTBalanceForPredictor(chainId);

  // Check USDT allowance
  const {
    allowanceNumber: usdtAllowance,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useUSDTAllowanceForPredictor(chainId);

  // Approval mutation
  const {
    approve,
    isApproving,
    isConfirmingApproval,
    isApprovalConfirmed,
    approvalError,
    resetApproval,
  } = useApproveUSDTForPredictor(chainId);

  // Join mutation
  const {
    join,
    joinHash,
    isJoining,
    isConfirmingJoin,
    isJoinConfirmed,
    joinError,
    resetJoin,
  } = useJoinAsPredictor(chainId);

  // Get auth store setPredictor function
  const setPredictor = useAuthStore((state) => state.setPredictor);

  // Derived state
  const hasEnoughBalance = joinFeeNumber !== undefined && usdtBalance >= joinFeeNumber;
  const hasEnoughAllowance = joinFeeNumber !== undefined && usdtAllowance >= joinFeeNumber;
  const needsApproval = !hasEnoughAllowance;

  const isLoading = isCheckingNFT || isLoadingParams || isLoadingBalance || isLoadingAllowance;
  const isProcessing = isApproving || isConfirmingApproval || isJoining || isConfirmingJoin;

  // IMPORTANT: After join confirmation, fetch predictor data and update auth store
  // This eliminates the need for re-authentication after becoming a predictor
  useEffect(() => {
    if (isJoinConfirmed && !hasInvalidatedRef.current && address) {
      hasInvalidatedRef.current = true;
      
      // Helper to invalidate all predictor-related queries
      const invalidatePredictorQueries = () => {
        // Invalidate NFT balance check (to show user is now a predictor)
        refetchNFT();
        // Invalidate predictor dashboard data
        queryClient.invalidateQueries({ queryKey: predictorKeys.all });
        // Invalidate predictors list
        queryClient.invalidateQueries({ queryKey: predictorListKeys.all });
      };
      
      // Function to fetch predictor profile and update auth store
            const fetchAndUpdatePredictor = async () => {
        try {
          const predictor = await fetchPredictorByAddress(address);
          if (predictor) {
            // Update auth store with predictor data - no re-auth needed!
            setPredictor(predictor);
            console.log('[BecomePredictor] Updated auth store with predictor data');
          }
        } catch {
          console.log('[BecomePredictor] Predictor not found yet, will retry...');
        }
      };
      
      // Immediate invalidation
      invalidatePredictorQueries();
      
      // Try to fetch predictor data with delays to handle webhook processing
      // The backend webhook might take a moment to process the blockchain event
      const delays = [1000, 3000, 6000, 10000]; // 1s, 3s, 6s, 10s
      delays.forEach(delay => {
        setTimeout(() => {
          invalidatePredictorQueries();
          fetchAndUpdatePredictor();
        }, delay);
      });
    }
  }, [isJoinConfirmed, queryClient, refetchNFT, address, setPredictor]);

  // Reset invalidation flag when address changes (new user)
  useEffect(() => {
    hasInvalidatedRef.current = false;
  }, [address]);

  // Reset all state
  const reset = () => {
    resetApproval();
    resetJoin();
  };

  return {
    // Connection state
    address,
    isConnected,

    // NFT state
    isPredictor,
    isCheckingNFT,
    refetchNFT,

    // Fee info
    joinFee,
    joinFeeFormatted,
    joinFeeNumber,
    referralPayoutFormatted,

    // Balance/allowance state
    usdtBalance,
    usdtAllowance,
    hasEnoughBalance,
    hasEnoughAllowance,
    needsApproval,
    refetchAllowance,

    // Loading states
    isLoading,
    isProcessing,

    // Approval state
    approve,
    isApproving,
    isConfirmingApproval,
    isApprovalConfirmed,
    approvalError,

    // Join state
    join,
    joinHash,
    isJoining,
    isConfirmingJoin,
    isJoinConfirmed,
    joinError,

    // Actions
    reset,
  };
}
