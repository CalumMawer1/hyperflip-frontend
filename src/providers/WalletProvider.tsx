'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';
import { createConfig, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { hyperEVM } from '../config/chains';

const projectId = 'b3d91b48975c12426338546b963ad334';

const { wallets } = getDefaultWallets({
  appName: 'HyperFlip',
  projectId,
});

const connectors = connectorsForWallets(wallets, {
  appName: 'HyperFlip',
  projectId,
});

const config = createConfig({
  chains: [hyperEVM],
  transports: {
    [hyperEVM.id]: http(),
  },
  connectors,
});

const queryClient = new QueryClient();

function WalletProviderComponent({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { WalletProviderComponent as WalletProvider }; 