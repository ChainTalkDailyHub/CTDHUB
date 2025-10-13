import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary favicon - force larger size */}
        <link rel="icon" href="/android-chrome-256x256.png" type="image/png" />
        
        {/* Ethers.js CDN for blockchain functionality */}
        <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
        
        {/* Standard favicons - prioritize larger sizes first */}
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/android-chrome-256x256.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        
        {/* Android Chrome Icons (alternative references) */}
        <link rel="shortcut icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="shortcut icon" type="image/png" sizes="256x256" href="/android-chrome-256x256.png" />
        <link rel="shortcut icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme colors for mobile browsers */}
        <meta name="theme-color" content="#F59E0B" />
        <meta name="msapplication-TileColor" content="#F59E0B" />
        <meta name="msapplication-TileImage" content="/android-chrome-256x256.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}