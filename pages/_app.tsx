import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <div className="grid-bg min-h-screen bg-ctd-bg text-ctd-text">
        <Component {...pageProps} />
      </div>
    </ErrorBoundary>
  )
}