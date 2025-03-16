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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/coin.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: [
      { url: '/favicon.ico' }
    ],
    apple: [
      { url: '/images/coin.png' }
    ]
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
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" href="/coin.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/images/coin.png?v=2" />
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
