/**
 * useIsAdmin Hook
 *
 * Checks if the currently connected wallet address is in the admin whitelist.
 * Used to gate access to admin-only features and routes.
 *
 * @module shared/hooks/useIsAdmin
 *
 * IMPORTANT:
 * The admin addresses list must be kept in sync with:
 * - Backend: ADMIN_ADDRESSES in environment config
 * - Smart Contracts: DEFAULT_ADMIN_ROLE holders
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Conditional rendering
 * function AdminPanel() {
 *   const isAdmin = useIsAdmin();
 *   
 *   if (!isAdmin) {
 *     return <Navigate to="/" />;
 *   }
 *   
 *   return <AdminDashboard />;
 * }
 *
 * // In navigation
 * function Navigation() {
 *   const isAdmin = useIsAdmin();
 *   
 *   return (
 *     <nav>
 *       <Link to="/">Home</Link>
 *       {isAdmin && <Link to="/admin">Admin</Link>}
 *     </nav>
 *   );
 * }
 * ```
 *
 * SECURITY NOTE:
 * This is client-side only and should NOT be relied upon for security.
 * All admin operations must be verified on the backend/smart contract level.
 * This hook is purely for UX (hiding/showing admin UI elements).
 *
 * @returns {boolean} True if connected wallet is an admin, false otherwise
 */

import { useAccount } from 'wagmi';

/**
 * Admin addresses for off-chain operations.
 * These must match ADMIN_ADDRESSES in the backend .env
 * 
 * Admin privileges (off-chain only):
 * - Handle reports and disputes
 * - View private predictor contact info
 * - Access admin dashboard
 * 
 * Note: On-chain operations (blacklisting) require MultiSig wallet signatures
 * on the smart contract - these admin addresses alone cannot blacklist.
 */
const ADMIN_ADDRESSES = [
  '0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2', // Admin 1 (MultiSig Signer)
  '0xC119B9152afcC5f40C019aABd78A312d37C63926', // Admin 2 (MultiSig Signer)
  '0x6499fe8016cE2C2d3a21d08c3016345Edf3467F1', // Admin 3 (MultiSig Signer)
  // Add new admins below (they can handle reports/disputes but NOT blacklist)
].map((addr) => addr.toLowerCase());

export function useIsAdmin(): boolean {
  const { address, isConnected } = useAccount();
  
  if (!isConnected || !address) return false;
  
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

export default useIsAdmin;
