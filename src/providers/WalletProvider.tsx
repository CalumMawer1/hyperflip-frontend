'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';
import { createConfig, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { hyperEVM } from '../config/chains';

import { Theme } from '@rainbow-me/rainbowkit';



export const customDarkTheme: Theme = {
  blurs: {
    modalOverlay: 'blur(8px)',
  },
  colors: {
    accentColor: 'rgba(0, 0, 0, 0.3)',
    accentColorForeground: 'rgba(4, 230, 224, .9)',
    actionButtonBorder: 'rgba(4, 230, 224, 0.3)',
    actionButtonBorderMobile: 'rgba(4, 230, 224, 0.2)',
    actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.05)',
    closeButton: '#04e6e0',
    closeButtonBackground: 'rgba(4, 230, 224, 0.1)',
    connectButtonBackground: 'rgba(0, 0, 0, 0.3)', 
    connectButtonBackgroundError: '#EF4444', 
    connectButtonInnerBackground: 'rgba(0, 0, 0, 0.1)',
    connectButtonText: '#FEFCE1',
    connectButtonTextError: '#FCA5A5',
    connectionIndicator: '#10B981',
    downloadBottomCardBackground: '#0a0a0a',
    downloadTopCardBackground: '#1a1a1a',
    error: '#EF4444',
    generalBorder: 'rgba(4, 230, 224, 0.3)',
    generalBorderDim: 'rgba(255, 255, 255, 0.05)',
    menuItemBackground: 'rgba(255, 255, 255, 0.03)',
    modalBackdrop: 'rgba(0, 0, 0, 0.6)',
    modalBackground: 'rgba(0, 0, 0, 0.6)', 
    modalBorder: 'rgba(4, 230, 224, 0.1)', 
    modalText: '#FEFCE1',
    modalTextDim: 'rgba(255, 255, 255, 0.5)',
    modalTextSecondary: 'rgba(4, 230, 222, 0.8)', 
    profileAction: 'rgba(4, 230, 224, 0.08)',
    profileActionHover: 'rgba(4, 230, 222, 0.68)',
    profileForeground: '#0a0a0a',
    selectedOptionBorder: '#04e6e0',
    standby: '#EAB308', 
  },
  fonts: {
    body: 'system-ui, sans-serif',
  },
  radii: {
    actionButton: '0.5rem',
    connectButton: '0.5rem',
    menuButton: '0.5rem',
    modal: '1rem',
    modalMobile: '1rem',
  },
  shadows: {
    connectButton: '0 0 10px rgba(4, 230, 224, 0.25)',
    dialog: '0 0 40px rgba(4, 230, 224, 0.2)',
    profileDetailsAction: '0 0 8px rgba(4, 230, 224, 0.15)',
    selectedOption: '0 0 10px rgba(4, 230, 224, 0.25)',
    selectedWallet: '0 0 10px rgba(4, 230, 224, 0.15)',
    walletLogo: '0 0 4px rgba(255, 255, 255, 0.1)',
  },
};



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
        <RainbowKitProvider modalSize="compact" theme={customDarkTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { WalletProviderComponent as WalletProvider }; 