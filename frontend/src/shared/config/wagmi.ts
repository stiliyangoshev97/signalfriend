/**
 * Wagmi + RainbowKit Configuration
 * 
 * Configures wallet connections for BNB Chain (Mainnet & Testnet).
 * Uses RainbowKit for the wallet connection modal UI.
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
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
