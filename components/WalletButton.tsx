import { useState, useEffect } from 'react'

interface WalletButtonProps {
  className?: string
}

export default function WalletButton({ className = '' }: WalletButtonProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setAddress(stored)
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        if (accounts[0]) {
          setIsConnected(true)
          setAddress(accounts[0])
          localStorage.setItem('ctdhub:wallet', accounts[0])
          // Trigger storage event for other components
          window.dispatchEvent(new Event('storage'))
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      alert('Please install MetaMask')
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress('')
    localStorage.removeItem('ctdhub:wallet')
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'))
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className={className}>
      {!isConnected ? (
        <button 
          onClick={connectWallet}
          className="btn-primary"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">
            {formatAddress(address)}
          </span>
        </div>
      )}
    </div>
  )
}