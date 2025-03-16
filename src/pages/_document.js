import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/coin.png" />
        <script src="/favicon.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 