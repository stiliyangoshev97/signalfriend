/**
 * @fileoverview Hook for proposing blacklist via smart contract
 * @module features/admin/hooks/useProposeBlacklist
 * @description
 * Custom hook for calling the proposeBlacklist function on the PredictorAccessPass
 * smart contract. This creates a MultiSig proposal that requires 2 additional
 * approvals from other signers before the blacklist status is changed.
 * 
 * IMPORTANT: This is the correct way to blacklist/unblacklist predictors.
 * The database-only blacklist does NOT block referral earnings.
 */

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { decodeEventLog } from 'viem';
import { getContractAddresses } from '@/shared/config/contracts';
import { PREDICTOR_ACCESS_PASS_ABI } from '@/shared/config/abis';
import { env } from '@/shared/config/env';
import { parseWalletError, isUserRejectionError } from '@/shared/utils/walletErrors';

/**
 * Result returned from the proposeBlacklist transaction
 */
export interface ProposeBlacklistResult {
  /** The actionId of the created proposal (bytes32) */
  actionId: string;
  /** Transaction hash */
  transactionHash: string;
  /** Whether this is a blacklist (true) or unblacklist (false) action */
  isBlacklist: boolean;
}

/**
 * Hook state
 */
export interface UseProposeBlacklistState {
  /** Whether a transaction is pending */
  isPending: boolean;
  /** Whether a transaction is being confirmed */
  isConfirming: boolean;
  /** Whether the transaction was successful */
  isSuccess: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether the error was a user rejection */
  isUserRejection: boolean;
  /** Result from successful transaction */
  result: ProposeBlacklistResult | null;
}

/**
 * Hook to propose blacklist/unblacklist via smart contract
 * 
 * This calls the `proposeBlacklist` function on the PredictorAccessPass contract,
 * which creates a MultiSig proposal. The caller (admin) automatically approves
 * as the first signer. Two more signers must approve on BscScan for execution.
 * 
 * @param chainId - Chain ID to use (defaults to 97 for testnet)
 * @returns Hook functions and state
 * 
 * @example
 * ```tsx
 * const { proposeBlacklist, proposeUnblacklist, state, reset } = useProposeBlacklist();
 * 
 * // Blacklist a predictor
 * const result = await proposeBlacklist('0x123...');
 * console.log(`Proposal created: ${result.actionId}`);
 * 
 * // Unblacklist a predictor
 * await proposeUnblacklist('0x456...');
 * ```
 */
export function useProposeBlacklist(chainId: number = env.CHAIN_ID) {
  const { address } = useAccount();
  const contracts = getContractAddresses(chainId);
  
  const [state, setState] = useState<UseProposeBlacklistState>({
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
    isUserRejection: false,
    result: null,
  });

  // wagmi write contract hook
  const { 
    writeContractAsync, 
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { 
    isLoading: isWaiting,
    isSuccess: txSuccess,
    data: txReceipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      isUserRejection: false,
      result: null,
    });
    resetWrite();
  }, [resetWrite]);

  /**
   * Extract actionId from transaction logs
   */
  const extractActionId = useCallback((logs: readonly { topics: readonly `0x${string}`[]; data: `0x${string}` }[] | undefined): string | null => {
    if (!logs) return null;
    
    for (const log of logs) {
      try {
        const decoded = decodeEventLog({
          abi: PREDICTOR_ACCESS_PASS_ABI,
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        });
        
        if (decoded.eventName === 'ActionProposed') {
          // actionId is the first indexed topic
          return log.topics[1] || null;
        }
      } catch {
        // Not our event, continue
      }
    }
    return null;
  }, []);

  /**
   * Propose to blacklist a predictor
   */
  const proposeBlacklist = useCallback(async (predictorAddress: string): Promise<ProposeBlacklistResult> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({
      ...prev,
      isPending: true,
      isConfirming: false,
      isSuccess: false,
      error: null,
      isUserRejection: false,
      result: null,
    }));

    try {
      // Call the smart contract
      const hash = await writeContractAsync({
        address: contracts.PredictorAccessPass,
        abi: PREDICTOR_ACCESS_PASS_ABI,
        functionName: 'proposeBlacklist',
        args: [predictorAddress as `0x${string}`, true],
      });

      setState(prev => ({
        ...prev,
        isPending: false,
        isConfirming: true,
      }));

      // Wait for confirmation (handled by the useWaitForTransactionReceipt hook)
      // For now, return a partial result - the UI should show "confirming" state
      // The full result with actionId will be available after confirmation
      
      return {
        actionId: '', // Will be extracted from logs after confirmation
        transactionHash: hash,
        isBlacklist: true,
      };
    } catch (error) {
      const parsedError = parseWalletError(error);
      const isRejection = isUserRejectionError(error);
      
      setState(prev => ({
        ...prev,
        isPending: false,
        isConfirming: false,
        error: parsedError.message,
        isUserRejection: isRejection,
      }));
      
      throw new Error(parsedError.message);
    }
  }, [address, contracts.PredictorAccessPass, writeContractAsync]);

  /**
   * Propose to unblacklist a predictor
   */
  const proposeUnblacklist = useCallback(async (predictorAddress: string): Promise<ProposeBlacklistResult> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({
      ...prev,
      isPending: true,
      isConfirming: false,
      isSuccess: false,
      error: null,
      isUserRejection: false,
      result: null,
    }));

    try {
      // Call the smart contract
      const hash = await writeContractAsync({
        address: contracts.PredictorAccessPass,
        abi: PREDICTOR_ACCESS_PASS_ABI,
        functionName: 'proposeBlacklist',
        args: [predictorAddress as `0x${string}`, false],
      });

      setState(prev => ({
        ...prev,
        isPending: false,
        isConfirming: true,
      }));

      return {
        actionId: '',
        transactionHash: hash,
        isBlacklist: false,
      };
    } catch (error) {
      const parsedError = parseWalletError(error);
      const isRejection = isUserRejectionError(error);
      
      setState(prev => ({
        ...prev,
        isPending: false,
        isConfirming: false,
        error: parsedError.message,
        isUserRejection: isRejection,
      }));
      
      throw new Error(parsedError.message);
    }
  }, [address, contracts.PredictorAccessPass, writeContractAsync]);

  // Update state when transaction is confirmed
  if (txSuccess && txReceipt && state.isConfirming) {
    const actionId = extractActionId(txReceipt.logs);
    setState(prev => ({
      ...prev,
      isConfirming: false,
      isSuccess: true,
      result: {
        actionId: actionId || '',
        transactionHash: txReceipt.transactionHash,
        isBlacklist: prev.result?.isBlacklist ?? true,
      },
    }));
  }

  return {
    proposeBlacklist,
    proposeUnblacklist,
    state: {
      ...state,
      isConfirming: isWaiting,
    },
    reset,
    /** Transaction hash (if any) */
    txHash,
    /** Transaction receipt (if confirmed) */
    txReceipt,
  };
}
