import { useState, useEffect } from 'react'
import { useQuizBurner } from '../lib/useQuizBurner'

interface BurnBadgeProps {
  isEnabled: boolean
  userAddress: string
  quizId?: number // Default to 1 if not provided
}

export default function BurnBadge({ isEnabled, userAddress, quizId = 1 }: BurnBadgeProps) {
  const [isClient, setIsClient] = useState(false)
  const { burnAfterQuiz, isLoading, burnAmount, hasClaimed } = useQuizBurner()
  const [burnResult, setBurnResult] = useState<{
    success: boolean
    txHash?: string
    amount?: string
    error?: string
    explorerUrl?: string
    alreadyBurned?: boolean
  } | null>(null)
  const [claimed, setClaimed] = useState(false)

  // Garantir que componente só renderiza no cliente após hidratação
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar se já foi feito burn para este usuário
  useEffect(() => {
    if (!isClient || !userAddress) return
    
    // Check both localStorage (legacy) and blockchain
    const burnKey = `quiz_burn_completed_${userAddress}`
    const savedBurn = localStorage.getItem(burnKey)
    
    if (savedBurn) {
      try {
        const burnData = JSON.parse(savedBurn)
        setBurnResult(burnData)
        setClaimed(true)
      } catch (error) {
        console.warn('Error parsing saved burn data:', error)
      }
    }

    // Also check blockchain state
    checkClaimedStatus()
  }, [isClient, userAddress, quizId])

  const checkClaimedStatus = async () => {
    try {
      const hasClaimedOnChain = await hasClaimed(quizId)
      setClaimed(hasClaimedOnChain)
    } catch (error) {
      console.warn('Error checking claimed status:', error)
    }
  }

  const handleBurn = async () => {
    // Só permite burn se quiz estiver completo
    if (!isEnabled || !isClient || !userAddress) {
      setBurnResult({ 
        success: false, 
        error: 'You need to complete the quiz to burn tokens.' 
      })
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

    try {
      console.log('🔥 Initiating on-chain burn for wallet:', userAddress)
      
      const result = await burnAfterQuiz(quizId)
      setBurnResult(result)

      if (result.success && result.txHash) {
        // Save to localStorage for UI persistence
        const burnKey = `quiz_burn_completed_${userAddress}`
        const burnData = {
          success: true,
          txHash: result.txHash,
          amount: result.amount,
          explorerUrl: result.explorerUrl,
          timestamp: new Date().toISOString(),
          quizId
        }
        localStorage.setItem(burnKey, JSON.stringify(burnData))
        setClaimed(true)
        
        console.log('✅ On-chain burn completed:', result)
      }
    } catch (error: any) {
      console.error('❌ Burn failed:', error)
      setBurnResult({
        success: false,
        error: error.message || 'Burn transaction failed'
      })
    }
  }

  // Não renderizar no servidor (SSR)
  if (!isClient) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="bg-ctd-panel border border-ctd-border rounded-xl p-6 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ctd-text">🔥 Burn CTD Tokens</h3>
        <div className="text-sm text-ctd-mute">
          Quiz #{quizId}
        </div>
      </div>

      {/* Status Display */}
      {burnResult?.success ? (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-green-600 dark:text-green-400 font-medium">✅ Burn Completed Successfully!</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount Burned:</span>
              <span className="font-mono font-bold text-green-600 dark:text-green-400">
                {burnResult.amount || burnAmount} CTD
              </span>
            </div>
            
            {burnResult.txHash && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transaction:</span>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
                  {burnResult.txHash.slice(0, 10)}...{burnResult.txHash.slice(-8)}
                </span>
              </div>
            )}
            
            {burnResult.explorerUrl && (
              <div className="mt-3">
                <a 
                  href={burnResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                >
                  🔍 View on Block Explorer
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Burn Information */}
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">💰 Burn Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount to Burn:</span>
                <span className="font-mono font-bold text-yellow-600 dark:text-yellow-400">
                  {burnAmount} CTD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">From:</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Treasury (Gas only)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">To:</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">0x...dEaD</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            {!isEnabled ? (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  🔒 Complete all quiz modules to unlock burn
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Finish the quiz to earn your burn reward!
                </div>
              </div>
            ) : claimed ? (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  ✅ You have already claimed your burn for this quiz
                </p>
              </div>
            ) : (
              <button
                onClick={handleBurn}
                disabled={isLoading || !isEnabled}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
                  isLoading || !isEnabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:scale-105 shadow-lg hover:shadow-xl'
                } ${isLoading ? 'animate-pulse' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Burn...</span>
                  </div>
                ) : (
                  `🔥 Burn ${burnAmount} CTD`
                )}
              </button>
            )}
          </div>
        </>
      )}

      {/* Error Display */}
      {burnResult?.error && !burnResult.success && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 flex-shrink-0">❌</span>
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium mb-1">Burn Failed</div>
              <div>{burnResult.error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Information Footer */}
      <div className="mt-4 pt-4 border-t border-ctd-border">
        <p className="text-ctd-mute text-xs leading-relaxed">
          ℹ️ This creates a public proof on the blockchain. Tokens are burned from the treasury to dead address with your transaction as verification.
        </p>
      </div>
    </div>
  )
}