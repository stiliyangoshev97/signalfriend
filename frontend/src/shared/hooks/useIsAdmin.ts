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
 * Read from VITE_ADMIN_ADDRESSES environment variable.
 * These must match ADMIN_ADDRESSES in the backend .env
 * 
 * Admin privileges (off-chain only):
 * - Handle reports and disputes
 * - View private predictor contact info
 * - Access admin dashboard
 * 
 * Note: On-chain operations (blacklisting) require MultiSig wallet signatures
 * on the smart contract - these admin addresses alone cannot blacklist.
 * 
 * SECURITY NOTE:
 * Exposing admin addresses in the frontend is NOT a security risk because:
 * 1. This hook is purely for UX (showing/hiding admin UI elements)
 * 2. All actual admin operations are validated server-side
 * 3. These addresses are already public on-chain as MultiSig signers
 * 4. On-chain operations require cryptographic signatures
 */
const ADMIN_ADDRESSES = (import.meta.env.VITE_ADMIN_ADDRESSES || '')
  .split(',')
  .map((addr: string) => addr.trim().toLowerCase())
  .filter((addr: string) => addr.length > 0);

export function useIsAdmin(): boolean {
  const { address, isConnected } = useAccount();
  
  if (!isConnected || !address) return false;
  
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}

export default useIsAdmin;
