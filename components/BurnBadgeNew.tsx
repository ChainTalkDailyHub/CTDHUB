'use client'

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Configurações da BSC Mainnet
const BSC_CHAIN_ID = 56
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const BURNER_CONTRACT_ADDRESS = '0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958'
const BSCSCAN_API_KEY = '1A8YXSRK5VIPP3IQN3RYA4K2HVXH81MM4E'

// Gas price mínimo seguro para BSC (5 Gwei em Wei)
// Previne alerta "suspeito" do MetaMask causado por gas muito baixo
// BSC não suporta EIP-1559, então usamos gas price tradicional mais alto
const MIN_SAFE_GAS_PRICE = BigInt(5) * BigInt(1e9) // 5 Gwei

// ABI simplificada do contrato CTDQuizBurner
const BURNER_CONTRACT_ABI = [
  'function burnQuizTokens(string quizId) external',
  'function canBurnTokens(address user) external view returns (bool eligible, string reason)',
  'function getUserInfo(address user) external view returns (bool hasCompleted, uint256 burnedAmount, uint256 burnTimestamp, string quizId)',
  'function hasCompletedQuiz(address user) external view returns (bool)'
]

interface EstimatedGas {
  gasPrice: bigint
  gasLimit: bigint
  gasCostBNB: number
  gasCostUSD: number
}

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
  const [estimatedGas, setEstimatedGas] = useState<EstimatedGas | null>(null)
  const [burnResult, setBurnResult] = useState<BurnResult | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar elegibilidade do usuário
  useEffect(() => {
    if (!isClient) return

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

        if (hasCompleted) {
          setIsEligible(false)
          setEligibilityReason('Already completed! You can only burn once.')
          setCheckingEligibility(false)
          return
        }

        // Verificar elegibilidade no contrato
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
  }, [isClient])

  // Estimar custo de gas
  useEffect(() => {
    if (!isClient || !isEligible) return

    const estimateGasCost = async () => {
      try {
        console.log('⛽ Estimando custo de gas...')

        // 1. Obter gasPrice atual da rede BSC via BscScan API
        const gasPriceResponse = await fetch(
          `https://api.bscscan.com/api?module=proxy&action=eth_gasPrice&apikey=${BSCSCAN_API_KEY}`
        )
        const gasPriceData = await gasPriceResponse.json()
        
        if (gasPriceData.status !== '1') {
          console.error('❌ Erro ao obter gas price:', gasPriceData)
          return
        }

        const gasPrice = BigInt(gasPriceData.result) // Wei
        console.log('💨 Gas Price da rede:', gasPrice.toString(), 'Wei')

        // CORREÇÃO: Garantir gas price mínimo seguro (5 Gwei)
        // Gas muito baixo causa alerta "suspeito" no MetaMask
        // BSC não suporta EIP-1559, então usamos gas price tradicional mais alto
        const safeGasPrice = gasPrice > MIN_SAFE_GAS_PRICE ? gasPrice : MIN_SAFE_GAS_PRICE
        
        if (gasPrice < MIN_SAFE_GAS_PRICE) {
          console.warn('⚠️ Gas price da rede muito baixo!')
          console.log(`   Rede: ${Number(gasPrice) / 1e9} Gwei`)
          console.log(`   Usando mínimo seguro: ${Number(MIN_SAFE_GAS_PRICE) / 1e9} Gwei`)
          console.log('   ℹ️  Isso previne alerta "suspicious" do MetaMask')
        }

        // 2. Estimar gasLimit (baseado em testes: ~80k, usamos 100k para segurança)
        const estimatedGasLimit = BigInt(100000)

        // 3. Calcular custo em Wei (usando gas price seguro)
        const gasCostWei = safeGasPrice * estimatedGasLimit

        // 4. Converter para BNB
        const gasCostBNB = Number(gasCostWei) / 1e18

        // 5. Obter preço do BNB em USD via BscScan API
        const bnbPriceResponse = await fetch(
          `https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${BSCSCAN_API_KEY}`
        )
        const bnbPriceData = await bnbPriceResponse.json()
        
        if (bnbPriceData.status !== '1') {
          console.error('❌ Erro ao obter preço BNB:', bnbPriceData)
          return
        }

        const bnbPriceUSD = parseFloat(bnbPriceData.result.ethusd)
        console.log('💵 Preço BNB:', bnbPriceUSD, 'USD')

        // 6. Calcular custo em USD
        const gasCostUSD = gasCostBNB * bnbPriceUSD

        console.log('📊 Estimativa de Gas:', {
          gasPriceNetwork: gasPrice.toString(),
          gasPriceUsed: safeGasPrice.toString(),
          gasLimit: estimatedGasLimit.toString(),
          gasCostBNB,
          gasCostUSD
        })

        setEstimatedGas({
          gasPrice: safeGasPrice, // Usar gas price seguro
          gasLimit: estimatedGasLimit,
          gasCostBNB,
          gasCostUSD
        })

      } catch (error) {
        console.error('❌ Erro ao estimar gas:', error)
      }
    }

    estimateGasCost()
    
    // Atualizar estimativa a cada 30 segundos
    const interval = setInterval(estimateGasCost, 30000)
    return () => clearInterval(interval)
  }, [isClient, isEligible])

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

      // 6. Obter gas price seguro (mínimo 5 Gwei)
      // IMPORTANTE: Usar gas price mais alto para evitar alerta do MetaMask
      const feeData = await provider.getFeeData()
      const networkGasPrice = feeData.gasPrice || BigInt(0)
      const safeGasPrice = networkGasPrice > MIN_SAFE_GAS_PRICE 
        ? networkGasPrice 
        : MIN_SAFE_GAS_PRICE

      console.log('⛽ Gas Price:')
      console.log(`   Rede: ${Number(networkGasPrice) / 1e9} Gwei`)
      console.log(`   Usando: ${Number(safeGasPrice) / 1e9} Gwei (mínimo seguro)`)

      // 7. Executar transação com gas price personalizado
      // Removido type: 0 para compatibilidade com Trust Wallet
      const tx = await contract.burnQuizTokens(quizId, {
        gasLimit: 100000, // Gas limit fixo
        gasPrice: safeGasPrice // Gas price seguro (mínimo 5 Gwei)
      })
      console.log('⏳ Transação enviada:', tx.hash)

      // 8. Aguardar confirmação
      const receipt = await tx.wait()
      console.log('✅ Transação confirmada! Block:', receipt.blockNumber)

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

      {checkingEligibility ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ctd-yellow mb-2"></div>
          <p className="ctd-text">Checking eligibility...</p>
        </div>
      ) : !isEligible ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 font-medium">❌ Not Eligible</p>
          <p className="text-red-300/70 text-sm mt-1">{eligibilityReason}</p>
        </div>
      ) : (
        <>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-medium">✅ You are eligible to burn!</p>
            <p className="text-green-300/70 text-sm mt-1">Complete the burn to claim your achievement</p>
          </div>

          {estimatedGas ? (
            <div className="ctd-bg rounded-lg p-4 mb-4 space-y-2">
              <h3 className="font-semibold ctd-text mb-3">💰 Transaction Cost</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">⛽ Gas Price</p>
                  <p className="ctd-text font-mono">
                    {(Number(estimatedGas.gasPrice) / 1e9).toFixed(2)} Gwei
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">📊 Gas Limit</p>
                  <p className="ctd-text font-mono">
                    {estimatedGas.gasLimit.toString()}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Your Cost (gas only):</p>
                <p className="ctd-yellow text-xl font-bold">
                  {estimatedGas.gasCostBNB.toFixed(6)} BNB
                </p>
                <p className="text-gray-400 text-sm">
                  ≈ ${estimatedGas.gasCostUSD.toFixed(2)} USD
                </p>
              </div>
            </div>
          ) : (
            <div className="ctd-bg rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm">⏳ Calculating gas cost...</p>
            </div>
          )}

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold ctd-text mb-2">🔥 What will be burned:</h3>
            <ul className="space-y-1 text-sm ctd-text/80">
              <li>• 1000 CTD tokens (from project treasury)</li>
              <li>• Sent to dead address (0x000...dEaD)</li>
              <li>• Permanently removed from circulation</li>
              <li>• You only pay gas fee (~$0.20-0.30)</li>
            </ul>
          </div>

          {burnResult?.success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
              <p className="text-green-400 font-bold mb-2">✅ Burn Successful!</p>
              <p className="text-green-300/70 text-sm mb-3">
                Your transaction has been confirmed on the blockchain
              </p>
              {burnResult.txHash && (
                <a
                  href={`https://bscscan.com/tx/${burnResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View on BscScan →
                </a>
              )}
            </div>
          ) : burnResult?.error ? (
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
