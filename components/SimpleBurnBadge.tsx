import { useState } from 'react'

interface SimpleBurnBadgeProps {
  sessionId: string
  isEnabled?: boolean
}

export default function SimpleBurnBadge({ sessionId, isEnabled = true }: SimpleBurnBadgeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [burnResult, setBurnResult] = useState<{
    success: boolean
    txHash?: string
    amount?: string
    error?: string
    alreadyBurned?: boolean
  } | null>(null)

  const handleBurn = async () => {
    if (!isEnabled || !sessionId) return
    
    // Check if already burned for this session
    const burnKey = `burn_completed_${sessionId}`
    const alreadyBurned = localStorage.getItem(burnKey)
    
    if (alreadyBurned) {
      setBurnResult({
        success: false,
        error: 'Burn already completed for this assessment',
        alreadyBurned: true,
        txHash: alreadyBurned
      })
      return
    }
    
    setIsLoading(true)
    try {
      console.log('🔥 Starting burn process for session:', sessionId)
      
      const response = await fetch('/.netlify/functions/burn-on-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userAddress: sessionId,
          sessionId: sessionId 
        }),
      })
      
      const result = await response.json()
      console.log('🔥 Burn result:', result)
      
      setBurnResult(result)
      
      if (result.success && result.txHash) {
        localStorage.setItem(burnKey, result.txHash)
      }
    } catch (error) {
      console.error('❌ Burn error:', error)
      setBurnResult({
        success: false,
        error: 'Failed to process burn transaction'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-ctd-bg/50 rounded-lg p-6 border border-ctd-yellow/20 text-center">
      {isLoading ? (
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctd-yellow mx-auto mb-4"></div>
          <p className="text-ctd-yellow">🔥 Processing burn transaction...</p>
          <p className="text-ctd-mute text-sm mt-2">Please wait while we burn 1000 CTD tokens</p>
        </div>
      ) : burnResult?.success ? (
        <div>
          <div className="text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-green-400 font-semibold mb-2">
            ✅ Burn Completed Successfully!
          </p>
          <p className="text-ctd-yellow font-medium mb-4">
            🔥 1000 CTD tokens burned
          </p>
          <p className="text-ctd-mute text-sm mb-4">
            Your assessment completion has been recorded on the BSC blockchain
          </p>
          {burnResult.txHash && (
            <a
              href={`https://bscscan.com/tx/${burnResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium text-sm"
            >
              View on BSCScan →
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
              className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium"
              disabled={!isEnabled}
            >
              🔄 Retry Burn
            </button>
          ) : (
            <div className="text-ctd-mute text-sm">
              <p>⚠️ <strong>Rule:</strong> Only 1 burn per assessment session</p>
              {burnResult.txHash && (
                <a
                  href={`https://bscscan.com/tx/${burnResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border/70 transition-colors text-sm mt-2 inline-block"
                >
                  View Transaction →
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
            🎯 <strong>Assessment Complete!</strong> Burn 1000 CTD tokens to permanently record your achievement on the BSC blockchain.
          </p>
          <p className="text-ctd-mute text-xs mb-6">
            ⚡ This action burns tokens and cannot be undone. Each assessment can only be burned once.
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
            {isLoading ? '🔥 Processing...' : '🔥 Burn 1000 CTD Tokens'}
          </button>
        </div>
      )}
    </div>
  )
}