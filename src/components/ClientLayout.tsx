'use client';

import { ReactNode } from 'react';
import { WalletProvider } from '../providers/WalletProvider';

export function ClientLayout({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
} 