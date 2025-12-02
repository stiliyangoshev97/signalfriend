/**
 * useIsAdmin Hook
 * 
 * Checks if the connected wallet is an admin address.
 */

import { useAccount } from 'wagmi';

// Admin addresses (MultiSig wallet holders)
// These should match ADMIN_ADDRESSES in the backend
const ADMIN_ADDRESSES = [
  '0x0000000000000000000000000000000000000001', // Placeholder - replace with real addresses
  '0x0000000000000000000000000000000000000002',
  '0x0000000000000000000000000000000000000003',
].map((addr) => addr.toLowerCase());

export function useIsAdmin(): boolean {
  const { address, isConnected } = useAccount();
  
  if (!isConnected || !address) return false;
  
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

export default useIsAdmin;
