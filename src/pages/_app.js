import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>HyperFlip - Coin Flip Game</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 
