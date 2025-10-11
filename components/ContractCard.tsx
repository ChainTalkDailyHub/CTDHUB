import { useState } from 'react'
import Image from 'next/image'

interface ContractCardProps {
  title?: string
  address: string
  network?: string
  className?: string
}

export default function ContractCard({ 
  title = "CTD Token Contract", 
  address, 
  network = "BSC",
  className = ""
}: ContractCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = address
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const openInExplorer = () => {
    const explorerUrl = network === 'BSC' 
      ? `https://bscscan.com/token/${address}`
      : `https://etherscan.io/token/${address}`
    window.open(explorerUrl, '_blank')
  }

  return (
    <div className={`bg-ctd-panel border border-ctd-border rounded-2xl p-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-ctd-text flex items-center">
          <div className="mr-3 w-8 h-8 relative">
            <Image
              src="/images/tokenctd.png"
              alt="CTD Token"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          {title}
        </h3>
        <span className="px-3 py-1 bg-ctd-yellow/20 text-ctd-yellow text-sm font-medium rounded-lg">
          {network}
        </span>
      </div>

      <div className="space-y-6">
        {/* Contract Address */}
        <div>
          <label className="block text-sm font-medium text-ctd-mute mb-3">
            Contract Address
          </label>
          <div className="flex items-center space-x-3 p-4 bg-ctd-bg border border-ctd-border rounded-lg">
            <code className="text-ctd-text font-mono text-sm flex-1 break-all">
              <span className="hidden sm:inline">{address}</span>
              <span className="sm:hidden">{formatAddress(address)}</span>
            </code>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-ctd-yellow text-black text-sm font-medium rounded-lg hover:bg-ctd-yellow-dark transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v6a2 2 0 002 2V7a3 3 0 013-3h4a2 2 0 00-2-2H6z" />
                    <path d="M11 5a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={openInExplorer}
            className="flex items-center space-x-2 px-6 py-3 bg-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border/70 transition-colors flex-1 justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
            <span>View on {network}Scan</span>
          </button>
        </div>

        {/* Info */}
        <div className="pt-4 border-t border-ctd-border">
          <p className="text-ctd-mute text-sm leading-relaxed">
            ℹ️ This is the official CTD token contract address. Always verify before making transactions.
          </p>
        </div>
      </div>
    </div>
  )
}

// Pre-configured CTD Token Card
export function CTDTokenCard({ className }: { className?: string }) {
  return (
    <ContractCard 
      title="CTD Token Contract"
      address="0x7f890a4a575558307826C82e4cb6E671f3178bfc"
      network="BSC"
      className={className}
    />
  )
}