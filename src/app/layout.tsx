import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { WalletProvider } from '../providers/WalletProvider';
import { LogoStyles } from '../components/LogoStyles';
import { StyledComponentsRegistry } from '../lib/registry';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HyperFlip - Coin Flip Game',
  description: 'Flip a coin and win HYPE tokens!',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/coin.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/images/coin.png" />
      </head>
      <body className={GeistSans.className}>
        <StyledComponentsRegistry>
          <WalletProvider>
            <LogoStyles />
            {children}
          </WalletProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
