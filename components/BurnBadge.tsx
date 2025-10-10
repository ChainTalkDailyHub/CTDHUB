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
    amount?: string
    error?: string
    details?: string
    alreadyBurned?: boolean
  } | null>(null)

  const handleBurn = async () => {
    if (!isEnabled || !userAddress) return
    
    setIsLoading(true)
    try {
      console.log('🔥 Iniciando processo de burn para:', userAddress)
      
      const response = await fetch('/.netlify/functions/burn-on-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      })
      
      const result = await response.json()
      console.log('🔥 Resultado do burn:', result)
      
      setBurnResult(result)
      
      if (result.success && result.txHash) {
        localStorage.setItem(`burn_tx_${userAddress}`, result.txHash)
      }
    } catch (error) {
      console.error('❌ Erro no burn:', error)
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
        fetch(`/.netlify/functions/quiz-progress?userAddress=${userAddress}`, {
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
      <div className="bg-ctd-panel border border-ctd-border rounded-2xl p-6 max-w-md mx-auto text-center">
        <h3 className="text-xl font-semibold text-ctd-text mb-4">🔥 Burn Proof</h3>
        <p className="text-ctd-mute mb-4">
          Connect your wallet to unlock the burn mechanism
        </p>
        <button className="px-6 py-3 bg-ctd-border text-ctd-mute rounded-lg opacity-50 cursor-not-allowed">
          Connect Wallet Required
        </button>
      </div>
    )
  }

  return (
    <div className="bg-ctd-panel border border-ctd-border rounded-2xl p-6 max-w-md mx-auto text-center">
      <h3 className="text-xl font-semibold text-ctd-text mb-4">🔥 Burn Proof</h3>
      
      {burnResult?.success ? (
        <div>
          <div className="text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-ctd-mute mb-4">
            ✅ Burn transaction completed successfully!
            {burnResult.amount && (
              <span className="block text-ctd-yellow font-medium mt-2">
                🔥 {burnResult.amount} CTD tokens burned
              </span>
            )}
          </p>
          {burnResult.txHash && (
            <a
              href={`https://bscscan.com/tx/${burnResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium"
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
          {burnResult.details && (
            <p className="text-red-300 mb-4 text-xs opacity-70">
              Debug: {burnResult.details}
            </p>
          )}
          {!burnResult.alreadyBurned ? (
            <button
              onClick={handleBurn}
              className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium"
              disabled={!isEnabled}
            >
              Retry Burn
            </button>
          ) : (
            <div className="text-ctd-mute text-sm">
              <p>⚠️ <strong>Rule:</strong> Only 1 burn per wallet</p>
              {burnResult.txHash && (
                <a
                  href={`https://bscscan.com/tx/${burnResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border/70 transition-colors text-sm mt-2 inline-block"
                >
                  View Previous Transaction
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-ctd-mute mb-4">
            {isEnabled 
              ? "🔥 Execute o burn de tokens CTD reais para provar seu conhecimento!"
              : "📚 Complete todos os 10 módulos do quiz para desbloquear o burn"
            }
          </p>
          <button
            onClick={handleBurn}
            disabled={!isEnabled || isLoading}
            className={`px-6 py-3 bg-ctd-yellow text-black rounded-lg font-medium transition-colors ${
              !isEnabled || isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-ctd-yellow-dark'
            }`}
          >
            {isLoading ? '🔥 Processing...' : '🔥 Execute Burn'}
          </button>
        </div>
      )}
    </div>
  )
}