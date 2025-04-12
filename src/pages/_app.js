import Head from 'next/head'
import { WalletProvider } from '../providers/WalletProvider';
import { UserProvider } from '../providers/UserProvider';
import { BetHistoryProvider } from '../providers/BetHistoryContext';
import { GameStateProvider } from '../providers/GameStateProvider';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>HyperFlip - Coin Flip Game</title>
      </Head>
      <WalletProvider>
        <UserProvider>
          <BetHistoryProvider>
            <GameStateProvider>
              <Component {...pageProps} />
            </GameStateProvider>
          </BetHistoryProvider>
        </UserProvider>
      </WalletProvider>
    </>
  )
}

export default MyApp 
