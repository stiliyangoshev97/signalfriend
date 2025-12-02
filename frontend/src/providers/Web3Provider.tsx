/**
 * Web3 Provider
 * 
 * Wraps the application with Wagmi and RainbowKit providers.
 * Configures wallet connection for BNB Chain.
 */

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '../shared/config/wagmi';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProviderProps {
  children: React.ReactNode;
}

/**
 * Custom dark theme for RainbowKit to match our design
 */
const customTheme = darkTheme({
  accentColor: '#f59e0b', // brand-500
  accentColorForeground: '#0f172a', // dark-900
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        theme={customTheme}
        modalSize="compact"
        appInfo={{
          appName: 'SignalFriend',
          learnMoreUrl: 'https://signalfriend.com/about',
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
