import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/coin.png" />
        <title>HyperFlip - Coin Flip Game</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 