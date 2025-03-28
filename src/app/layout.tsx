import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { WalletProvider } from '../providers/WalletProvider';
import { UserProvider } from '../providers/UserProvider';
import { LogoStyles } from '../components/LogoStyles';
import { StyledComponentsRegistry } from '../lib/registry';
import { Metadata } from 'next';
import LoadingBar from '@/components/utils/LoadingBar';

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
    <html lang="en">
      <body className={GeistSans.className}>
        <StyledComponentsRegistry>
          <WalletProvider>
            <UserProvider>
              <LogoStyles />
              {children}
            </UserProvider>
          </WalletProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
