import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { WalletProvider } from '../providers/WalletProvider';
import { LogoStyles } from '../components/LogoStyles';
import { StyledComponentsRegistry } from '../lib/registry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <StyledComponentsRegistry>
          <WalletProvider>{children}</WalletProvider>
          <LogoStyles />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
