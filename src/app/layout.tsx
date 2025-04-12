import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { WalletProvider } from '../providers/WalletProvider';
import { UserProvider } from '../providers/UserProvider';
import { LogoStyles } from '../components/LogoStyles';
import { StyledComponentsRegistry } from '../lib/registry';
import { BetHistoryProvider } from '../providers/BetHistoryContext';
import { Metadata } from 'next';
import { tektur, brunoAce } from './fonts';

export const metadata: Metadata = {
  title: 'HyperFlip - Coin Flip Game',
  description: 'Flip a coin and win HYPE tokens!',
  icons: {
    icon: [
      { url: '/favicon.ico'},
      { url: '/images/favicon-blue-32x32.png', sizes: '32x32' },
      { url: '/images/favicon-blue-16x16.png', sizes: '16x16' },
    ],
    apple: { url: '/favicon.ico' }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${tektur.variable} ${brunoAce.variable}`}>
      <head>
        {/* Preload fonts */}
      </head>
      <body className={GeistSans.className}>
        <StyledComponentsRegistry>
          <WalletProvider>
            <UserProvider>
              <BetHistoryProvider>
                <LogoStyles />
                {children}
              </BetHistoryProvider>
            </UserProvider>
          </WalletProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
