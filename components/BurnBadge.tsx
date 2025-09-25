import { useState, useEffect } from 'react'

interface BurnBadgeProps {
  isEnabled: boolean
  userAddress: string
}

export default function BurnBadge({ isEnabled, userAddress }: BurnBadgeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [burnResult, setBurnResult] = useState<{
    success: boolean
    txHash?: string
    error?: string
    alreadyBurned?: boolean
  } | null>(null)

  const handleBurn = async () => {
    if (!isEnabled || !userAddress) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/burn-on-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      })
      
      const result = await response.json()
      setBurnResult(result)
      
      if (result.success && result.txHash) {
        localStorage.setItem(`burn_tx_${userAddress}`, result.txHash)
      }
    } catch (error) {
      setBurnResult({
        success: false,
        error: 'Failed to process burn transaction'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if already burned
    const existingTx = localStorage.getItem(`burn_tx_${userAddress}`)
    if (existingTx) {
      setBurnResult({ success: true, txHash: existingTx })
    }
    
    // Se habilitado, verificar no servidor se já queimou
    if (isEnabled && userAddress) {
      // Pequeno delay para não fazer muitas requisições
      const timeoutId = setTimeout(() => {
        fetch('/api/quiz/progress', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(data => {
          if (data.allCompleted) {
            console.log('✅ Todos os módulos completados, burn habilitado!')
          }
        })
        .catch(err => console.warn('Failed to check progress:', err))
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [userAddress, isEnabled])

  if (!userAddress) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <h3 className="text-xl font-semibold text-primary mb-4">Burn Proof</h3>
        <p className="text-gray-300 mb-4">
          Connect your wallet to unlock the burn mechanism
        </p>
        <button className="btn-secondary opacity-50 cursor-not-allowed">
          Connect Wallet Required
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <h3 className="text-xl font-semibold text-primary mb-4">Burn Proof</h3>
      
      {burnResult?.success ? (
        <div>
          <div className="text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-300 mb-4">
            Burn transaction completed successfully!
          </p>
          {burnResult.txHash && (
            <a
              href={`https://bscscan.com/tx/${burnResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              View on BSCScan
            </a>
          )}
        </div>
      ) : burnResult?.error ? (
        <div>
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-400 mb-4 text-sm">{burnResult.error}</p>
          {!burnResult.alreadyBurned ? (
            <button
              onClick={handleBurn}
              className="btn-primary"
              disabled={!isEnabled}
            >
              Retry Burn
            </button>
          ) : (
            <div className="text-gray-400 text-sm">
              <p>⚠️ <strong>Regra:</strong> Apenas 1 queima por carteira</p>
              {burnResult.txHash && (
                <a
                  href={`https://bscscan.com/tx/${burnResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm mt-2 inline-block"
                >
                  Ver Transação Anterior
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-300 mb-4">
            {isEnabled 
              ? "Complete the burn mechanism to prove your knowledge!"
              : "Complete all 10 quiz modules to unlock burn"
            }
          </p>
          <button
            onClick={handleBurn}
            disabled={!isEnabled || isLoading}
            className={`btn-primary ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : 'Execute Burn'}
          </button>
        </div>
      )}
    </div>
  )
}