import { useState, useEffect } from 'react'

interface WalletButtonProps {
  className?: string
}

export default function WalletButton({ className = '' }: WalletButtonProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem('wallet_connected')
    const storedAddress = localStorage.getItem('wallet_address')
    if (stored && storedAddress) {
      setIsConnected(true)
      setAddress(storedAddress)
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        if (accounts[0]) {
          setIsConnected(true)
          setAddress(accounts[0])
          localStorage.setItem('wallet_connected', 'true')
          localStorage.setItem('wallet_address', accounts[0])
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
    localStorage.removeItem('wallet_connected')
    localStorage.removeItem('wallet_address')
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
          <button 
            onClick={disconnectWallet}
            className="btn-secondary text-sm px-3 py-2"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}