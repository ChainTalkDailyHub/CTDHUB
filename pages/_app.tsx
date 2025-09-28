import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <div className="theme-neon-circuit neon-grid min-h-screen">
        <Component {...pageProps} />
      </div>
    </ErrorBoundary>
  )
}