/**
 * Web3 Provider
 *
 * Wraps the application with Wagmi and RainbowKit providers for Web3 functionality.
 * Configures wallet connection for BNB Chain with a custom dark theme.
 *
 * @module providers/Web3Provider
 *
 * PROVIDER HIERARCHY:
 * ```
 * Web3Provider
 * └── WagmiProvider (wagmi)
 *     └── RainbowKitProvider (rainbow-me/rainbowkit)
 *         └── children
 * ```
 *
 * IMPORTANT:
 * - Must be wrapped by QueryProvider (React Query) for RainbowKit to work
 * - Configuration is loaded from @/shared/config/wagmi
 *
 * THEME CUSTOMIZATION:
 * RainbowKit is configured with a custom dark theme that matches
 * the SignalFriend design system:
 * - Accent color: brand-500 (#f59e0b - amber)
 * - Background: dark theme
 * - Border radius: medium
 * - Font: system font stack
 *
 * USAGE:
 * ```tsx
 * // In App.tsx or main.tsx
 * import { Web3Provider, QueryProvider } from '@/providers';
 *
 * function App() {
 *   return (
 *     <QueryProvider>
 *       <Web3Provider>
 *         <RouterProvider router={router} />
 *       </Web3Provider>
 *     </QueryProvider>
 *   );
 * }
 * ```
 *
 * APP INFO:
 * RainbowKit's modal displays app information configured here.
 * - appName: Shown in wallet connection prompts
 * - learnMoreUrl: Link in the modal's "Learn More" section
 *
 * @see https://www.rainbowkit.com/docs/custom-theme
 * @see https://wagmi.sh/react/WagmiProvider
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
