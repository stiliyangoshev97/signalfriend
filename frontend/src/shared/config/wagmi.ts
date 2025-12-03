/**
 * Wagmi + RainbowKit Configuration
 *
 * Configures wallet connections for BNB Chain (Mainnet & Testnet).
 * Uses RainbowKit for the wallet connection modal UI.
 *
 * @module shared/config/wagmi
 *
 * SUPPORTED CHAINS:
 * - BNB Chain Mainnet (Chain ID: 56) - Production
 * - BNB Chain Testnet (Chain ID: 97) - Development/Testing
 *
 * WALLETS:
 * RainbowKit's default config includes:
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - Rainbow
 * - And more...
 *
 * EXPORTS:
 * - wagmiConfig  - Main config for WagmiProvider
 * - chains       - Configured chain array
 * - CHAIN_IDS    - Chain ID constants
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // In providers
 * import { wagmiConfig } from '@/shared/config';
 *
 * <WagmiProvider config={wagmiConfig}>
 *   <QueryClientProvider client={queryClient}>
 *     <RainbowKitProvider>
 *       <App />
 *     </RainbowKitProvider>
 *   </QueryClientProvider>
 * </WagmiProvider>
 *
 * // Access chain IDs
 * import { CHAIN_IDS } from '@/shared/config';
 *
 * if (chainId === CHAIN_IDS.BNB_TESTNET) {
 *   console.log('Connected to testnet');
 * }
 * ```
 *
 * CONFIGURATION:
 * - VITE_WALLETCONNECT_PROJECT_ID required for WalletConnect
 * - VITE_ENABLE_TESTNET=true to enable testnet in production
 *
 * RPC ENDPOINTS:
 * - Mainnet: https://bsc-dataseed.binance.org
 * - Testnet: https://bsc-testnet-rpc.publicnode.com
 *
 * @see https://www.rainbowkit.com/docs/installation
 * @see https://wagmi.sh/react/getting-started
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// ...existing code...
import { http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { env } from './env';

/**
 * BNB Chain configuration
 * - Mainnet (56) for production
 * - Testnet (97) for development
 */
const chains = env.ENABLE_TESTNET 
  ? [bscTestnet, bsc] as const
  : [bsc] as const;

/**
 * RainbowKit + Wagmi Configuration
 * 
 * getDefaultConfig() sets up:
 * - Wallet connectors (MetaMask, WalletConnect, Coinbase, etc.)
 * - Chain configuration
 * - Transport (HTTP)
 * - Auto-reconnect on page load
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'SignalFriend',
  projectId: env.WALLETCONNECT_PROJECT_ID,
  chains,
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
    [bscTestnet.id]: http('https://bsc-testnet-rpc.publicnode.com'),
  },
  ssr: false, // We're not using SSR
});

// Export chains for use in components
export { chains };

// Export chain IDs for easy access
export const CHAIN_IDS = {
  BNB_MAINNET: bsc.id,
  BNB_TESTNET: bscTestnet.id,
} as const;
