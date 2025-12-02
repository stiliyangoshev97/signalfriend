/**
 * Application Entry Point
 * 
 * Sets up React root and wraps the app with global providers.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SentryProvider, QueryProvider, Web3Provider } from './providers';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryProvider>
      <QueryProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </QueryProvider>
    </SentryProvider>
  </StrictMode>
);
