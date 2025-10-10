import { useState, useEffect } from 'react'

interface BurnBadgeProps {
  isEnabled: boolean
  userAddress: string // Obrigatório para identificar usuário único
}

export default function BurnBadge({ isEnabled, userAddress }: BurnBadgeProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [burnResult, setBurnResult] = useState<{
    success: boolean
    txHash?: string
    amount?: string
    error?: string
    details?: string
    alreadyBurned?: boolean
  } | null>(null)

  // Garantir que componente só renderiza no cliente após hidratação
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar se já foi feito burn para este usuário
  useEffect(() => {
    if (!isClient || !userAddress) return
    
    const burnKey = `quiz_burn_completed_${userAddress}`
    const savedBurn = localStorage.getItem(burnKey)
    
    if (savedBurn) {
      try {
        const burnData = JSON.parse(savedBurn)
        setBurnResult(burnData)
      } catch (error) {
        console.warn('Error parsing saved burn data:', error)
      }
    }
  }, [isClient, userAddress])

  const handleBurn = async () => {
    // Só permite burn se quiz estiver completo
    if (!isEnabled || !isClient || !userAddress) {
      setBurnResult({ success: false, error: 'Você precisa completar o quiz para queimar os tokens.' })
      console.warn('⚠️ Burn disabled:', { isEnabled, isClient, userAddress })
      return
    }
    
    // Validar endereço da carteira
    if (!userAddress.startsWith('0x') || userAddress.length !== 42) {
      setBurnResult({
        success: false,
        error: 'Invalid wallet address format'
      })
      return
    }
    
    setIsLoading(true)
    try {
      console.log('🔥 Iniciando burn automático para carteira:', userAddress)
      
      // Sempre envia 1000 tokens
      const response = await fetch('/.netlify/functions/burn-on-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userAddress: userAddress,
          amount: '1000'
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('🔥 Resultado do burn:', result)
      
      setBurnResult(result)
      
      // Salvar resultado para evitar duplo burn
      if (result.success && typeof window !== 'undefined') {
        const burnKey = `quiz_burn_completed_${userAddress}`
        localStorage.setItem(burnKey, JSON.stringify(result))
      }
    } catch (error) {
      console.error('❌ Erro no burn:', error)
      setBurnResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process burn transaction'
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
  }, [isEnabled, userAddress])

  if (!isClient) {
    return (
      <div className="bg-ctd-panel border border-ctd-border rounded-2xl p-6 max-w-md mx-auto text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-ctd-border rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-ctd-border rounded w-1/2 mx-auto"></div>
        </div>
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
          <div className="text-ctd-yellow mb-4">
            <span className="text-4xl">🔥</span>
          </div>
          <h4 className="text-lg font-semibold text-ctd-text mb-2">
            Ready to Burn CTD Tokens
          </h4>
          <p className="text-ctd-mute mb-4 text-sm">
            🎯 <strong>Quiz Complete!</strong> Click below to automatically burn 1000 CTD tokens from the project treasury to the burn address.
          </p>
          <p className="text-ctd-mute text-xs mb-6">
            🔥 Tokens will be sent to: <code className="bg-ctd-bg px-2 py-1 rounded text-ctd-yellow">0x...dead</code>
          </p>
          <button
            onClick={handleBurn}
            disabled={!isEnabled || isLoading}
            className={`px-8 py-3 bg-ctd-yellow text-black rounded-lg font-medium transition-all transform hover:scale-105 ${
              !isEnabled || isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-ctd-yellow-dark shadow-glow'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                🔥 Burning Tokens...
              </span>
            ) : (
              '🔥 Burn 1000 CTD Tokens'
            )}
          </button>
        </div>
      )}
    </div>
  )
}