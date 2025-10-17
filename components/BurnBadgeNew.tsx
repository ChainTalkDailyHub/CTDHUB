'use client'

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Configurações da BSC Mainnet
const BSC_CHAIN_ID = 56
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const BURNER_CONTRACT_ADDRESS = '0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958'
const BSCSCAN_API_KEY = '1A8YXSRK5VIPP3IQN3RYA4K2HVXH81MM4E'

// ABI simplificada do contrato CTDQuizBurner
const BURNER_CONTRACT_ABI = [
  'function burnQuizTokens(string quizId) external',
  'function canBurnTokens(address user) external view returns (bool eligible, string reason)',
  'function getUserInfo(address user) external view returns (bool hasCompleted, uint256 burnedAmount, uint256 burnTimestamp, string quizId)',
  'function hasCompletedQuiz(address user) external view returns (bool)'
]

interface BurnResult {
  success: boolean
  txHash?: string
  error?: string
}

export default function BurnBadgeNew() {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [isEligible, setIsEligible] = useState(false)
  const [eligibilityReason, setEligibilityReason] = useState('')
  const [userAddress, setUserAddress] = useState<string>('')
  const [burnResult, setBurnResult] = useState<BurnResult | null>(null)
  const [previousBurnTxHash, setPreviousBurnTxHash] = useState<string>('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar elegibilidade do usuário
  useEffect(() => {
    if (!isClient) return
    // Não recarregar se já teve sucesso na queima
    if (burnResult?.success) return

    const checkEligibility = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          setIsEligible(false)
          setEligibilityReason('MetaMask not installed')
          setCheckingEligibility(false)
          return
        }

        // Conectar ao provider BSC
        const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
        const contract = new ethers.Contract(
          BURNER_CONTRACT_ADDRESS,
          BURNER_CONTRACT_ABI,
          provider
        )

        // Obter endereço do usuário
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        const address = accounts[0]
        setUserAddress(address)

        console.log('🔍 Verificando elegibilidade para:', address)

        // Verificar informações do usuário
        const userInfo = await contract.getUserInfo(address)
        const [hasCompleted, burnedAmount, burnTimestamp, quizId] = userInfo
        
        console.log('📊 User Info:', {
          hasCompleted,
          burnedAmount: burnedAmount.toString(),
          burnTimestamp: burnTimestamp.toString(),
          quizId
        })

        // Verificar se já completou o burn
        if (hasCompleted) {
          setIsEligible(false)
          setEligibilityReason('Already completed! You can only burn once.')
          
          // Buscar transação de burn no BscScan de forma mais robusta
          let foundTxHash = ''
          try {
            console.log('🔍 Buscando transação de burn no BscScan...')
            
            // Buscar últimas 100 transações
            const bscscanUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`
            const response = await fetch(bscscanUrl)
            const data = await response.json()
            
            console.log('📡 BscScan API Status:', data.status, 'Total transactions:', data.result?.length || 0)
            
            if (data.status === '1' && data.result && Array.isArray(data.result)) {
              // Procurar pela transação de burn
              const burnTx = data.result.find((tx: any) => 
                tx.to && 
                tx.to.toLowerCase() === BURNER_CONTRACT_ADDRESS.toLowerCase() &&
                tx.isError === '0' &&
                tx.functionName && tx.functionName.includes('burnQuizTokens')
              )
              
              if (burnTx) {
                foundTxHash = burnTx.hash
                console.log('✅ Transação de burn encontrada:', foundTxHash)
              } else {
                console.log('⚠️ Transação não encontrada com filtros. Tentando sem filtro de função...')
                // Tentar sem filtro de função
                const anyBurnTx = data.result.find((tx: any) => 
                  tx.to && 
                  tx.to.toLowerCase() === BURNER_CONTRACT_ADDRESS.toLowerCase() &&
                  tx.isError === '0'
                )
                if (anyBurnTx) {
                  foundTxHash = anyBurnTx.hash
                  console.log('✅ Transação encontrada (sem filtro função):', foundTxHash)
                }
              }
            }
          } catch (error) {
            console.error('⚠️ Erro ao buscar transação no BscScan:', error)
          }
          
          // SEMPRE definir um hash (real ou placeholder) para mostrar o botão
          if (foundTxHash) {
            setPreviousBurnTxHash(foundTxHash)
            setBurnResult({
              success: true,
              txHash: foundTxHash
            })
          } else {
            // Se não encontrou, usar timestamp como indicador de que precisa mostrar botão genérico
            console.log('⚠️ Não foi possível encontrar hash. Mostrando link genérico.')
            setPreviousBurnTxHash('search') // Flag para mostrar link de busca
          }
          
          setCheckingEligibility(false)
          return
        }

        // Verificar elegibilidade no contrato (apenas para não-test addresses)
        const [eligible, reason] = await contract.canBurnTokens(address)
        
        console.log('✅ Elegibilidade:', { eligible, reason })

        setIsEligible(eligible)
        setEligibilityReason(reason)
        setCheckingEligibility(false)

      } catch (error: any) {
        console.error('❌ Erro ao verificar elegibilidade:', error)
        setIsEligible(false)
        setEligibilityReason('Error checking eligibility')
        setCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [isClient, burnResult?.success])

  const handleBurn = async () => {
    if (!isClient || !window.ethereum) {
      alert('Please install MetaMask to continue')
      return
    }

    try {
      setIsLoading(true)
      setBurnResult(null)

      console.log('🔥 Iniciando processo de burn via contrato inteligente')

      // 1. Conectar ao provider do MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum)

      // 2. Verificar/Trocar para BSC Mainnet
      try {
        await provider.send('wallet_switchEthereumChain', [
          { chainId: `0x${BSC_CHAIN_ID.toString(16)}` }
        ])
      } catch (switchError: any) {
        // Se a rede não estiver adicionada, adicionar
        if (switchError.code === 4902) {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
              chainName: 'Binance Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: [BSC_RPC_URL],
              blockExplorerUrls: ['https://bscscan.com']
            }
          ])
        } else {
          throw switchError
        }
      }

      console.log('✅ Conectado à BSC Mainnet')

      // 3. Obter signer (quem vai assinar a transação)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      console.log('👤 Endereço do usuário:', address)

      // 4. Criar instância do contrato com signer
      const contract = new ethers.Contract(
        BURNER_CONTRACT_ADDRESS,
        BURNER_CONTRACT_ABI,
        signer
      )

      // 5. Gerar quiz ID único
      const quizId = `quiz_${address}_${Date.now()}`
      console.log('📝 Chamando burnQuizTokens com quizId:', quizId)

      // 6. Executar transação (usuário vai assinar na wallet)
      // IMPORTANTE: SEM OPTIONS! Deixar wallet decidir gas price
      const tx = await contract.burnQuizTokens(quizId)
      console.log('⏳ Transação enviada:', tx.hash)

      // 7. Aguardar confirmação
      const receipt = await tx.wait()
      console.log('✅ Transação confirmada! Block:', receipt?.blockNumber)

      setBurnResult({
        success: true,
        txHash: tx.hash
      })

      // Atualizar estado de elegibilidade
      setIsEligible(false)
      setEligibilityReason('Burn completed successfully!')

    } catch (error: any) {
      console.error('❌ Erro ao fazer burn:', error)
      
      let errorMessage = 'Unknown error occurred'
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user'
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient BNB for gas fee'
      } else if (error.message) {
        errorMessage = error.message
      }

      setBurnResult({
        success: false,
        error: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="ctd-panel p-6 rounded-lg">
        <div className="text-center">
          <p className="ctd-text">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ctd-panel p-6 rounded-lg">
      <h2 className="text-2xl font-bold ctd-text mb-4">
        🔥 Burn Your Badge
      </h2>

      {/* Mostrar resultado da queima com prioridade */}
      {burnResult?.success ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <p className="text-green-400 font-bold text-lg mb-2">🎉 Burn Completed Successfully!</p>
          <p className="text-green-300/70 text-sm mb-4">
            Your transaction has been confirmed on the blockchain
          </p>
          {burnResult.txHash && (
            <a
              href={`https://bscscan.com/tx/${burnResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors shadow-lg"
            >
              📋 View Transaction on BscScan →
            </a>
          )}
          <div className="mt-4 pt-4 border-t border-green-500/20">
            <p className="text-green-300/70 text-xs">
              ✅ 1000 CTD tokens burned permanently<br/>
              ✅ Your achievement is now recorded on-chain
            </p>
          </div>
        </div>
      ) : checkingEligibility ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ctd-yellow mb-2"></div>
          <p className="ctd-text">Checking eligibility...</p>
        </div>
      ) : !isEligible ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-blue-400 font-medium mb-3">🔍 Check Your Quiz Status</p>
          <p className="text-blue-300/70 text-sm mb-4">{eligibilityReason}</p>
          {(burnResult?.txHash || previousBurnTxHash) && (
            <a
              href={
                previousBurnTxHash === 'search' 
                  ? `https://bscscan.com/address/${userAddress}#internaltx`
                  : `https://bscscan.com/tx/${burnResult?.txHash || previousBurnTxHash}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg font-medium"
            >
              {previousBurnTxHash === 'search' 
                ? '🔍 View Your Transactions on BscScan →'
                : '🔥 View Burn Transaction on BscScan →'
              }
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-medium">✅ You are eligible to burn!</p>
            <p className="text-green-300/70 text-sm mt-1">Complete the burn to claim your achievement</p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold ctd-text mb-2">🔥 What will be burned:</h3>
            <ul className="space-y-1 text-sm ctd-text/80">
              <li>• 1000 CTD tokens (from project treasury)</li>
              <li>• Sent to dead address (0x000...dEaD)</li>
              <li>• Permanently removed from circulation</li>
              <li>• You only pay gas fee (~$0.20-0.30)</li>
            </ul>
          </div>

          {burnResult?.error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 font-bold mb-2">❌ Transaction Failed</p>
              <p className="text-red-300/70 text-sm">{burnResult.error}</p>
            </div>
          ) : null}

          <button
            onClick={handleBurn}
            disabled={isLoading || !isEligible || burnResult?.success}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Confirming Transaction...</span>
              </>
            ) : burnResult?.success ? (
              <span>✅ Burn Completed</span>
            ) : (
              <>
                <span>🔥</span>
                <span>Burn 1000 CTD Tokens</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By burning, you agree that this action is irreversible and tokens will be permanently removed from circulation.
          </p>
        </>
      )}
    </div>
  )
}
