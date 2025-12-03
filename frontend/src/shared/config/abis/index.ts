/**
 * Smart Contract ABIs
 *
 * Minimal ABIs containing only the functions needed by the frontend.
 * Full ABIs are in the contracts/ and backend/ packages.
 *
 * @module shared/config/abis
 *
 * CONTRACTS:
 * - SignalFriendMarket - buySignalNFT, fee calculations
 * - USDT (ERC20) - approve, allowance, balanceOf
 *
 * USAGE:
 * ```tsx
 * import { SIGNAL_FRIEND_MARKET_ABI, ERC20_ABI } from '@/shared/config/abis';
 *
 * const { writeContract } = useWriteContract();
 * await writeContract({
 *   address: contractAddresses.SignalFriendMarket,
 *   abi: SIGNAL_FRIEND_MARKET_ABI,
 *   functionName: 'buySignalNFT',
 *   args: [predictor, price, maxCommission, contentId],
 * });
 * ```
 */

/**
 * SignalFriendMarket ABI
 * 
 * Functions used:
 * - buySignalNFT(address, uint256, uint256, bytes32) - Purchase a signal
 * - calculateBuyerCost(uint256) - Calculate total cost including fees
 * - buyerAccessFee() - Get the flat access fee
 * - commissionRate() - Get current commission rate
 */
export const SIGNAL_FRIEND_MARKET_ABI = [
  {
    type: 'function',
    name: 'buySignalNFT',
    inputs: [
      { name: '_predictor', type: 'address', internalType: 'address' },
      { name: '_priceUSDT', type: 'uint256', internalType: 'uint256' },
      { name: '_maxCommissionRate', type: 'uint256', internalType: 'uint256' },
      { name: '_contentIdentifier', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'calculateBuyerCost',
    inputs: [{ name: '_signalPrice', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'buyerAccessFee',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'commissionRate',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  // Events for transaction confirmation
  {
    type: 'event',
    name: 'SignalPurchased',
    inputs: [
      { name: 'buyer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'predictor', type: 'address', indexed: true, internalType: 'address' },
      { name: 'receiptTokenId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'contentIdentifier', type: 'bytes32', indexed: false, internalType: 'bytes32' },
      { name: 'signalPrice', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'totalCost', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const;

/**
 * ERC20 ABI (for USDT)
 *
 * Functions used:
 * - approve(spender, amount) - Approve contract to spend tokens
 * - allowance(owner, spender) - Check current allowance
 * - balanceOf(account) - Check token balance
 * - decimals() - Get token decimals (18 for BSC USDT)
 */
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  // Approval event for confirmation
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'spender', type: 'address', indexed: true, internalType: 'address' },
      { name: 'value', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const;
