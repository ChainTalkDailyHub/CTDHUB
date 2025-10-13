import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// CTDQuizBurner ABI (novo contrato)
const QUIZ_BURNER_ABI = [
  "function burnQuizTokens(string memory quizId) external",
  "function canBurnTokens(address user) view returns (bool eligible, string memory reason)",
  "function hasCompletedQuiz(address user) view returns (bool)",
  "function BURN_AMOUNT() view returns (uint256)",
  "function getUserInfo(address user) view returns (bool completed, uint256 burnTimestamp, uint256 burnAmount, string memory quizId)",
  "event QuizCompleted(address indexed user, uint256 amount, string quizId, uint256 timestamp)"
]

// CTD Token ABI (minimal)
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
]

interface BurnResult {
  success: boolean
  txHash?: string
  amount?: string
  error?: string
  explorerUrl?: string
  alreadyClaimed?: boolean
}

interface UseQuizBurnerReturn {
  burnAfterQuiz: (quizId: number) => Promise<BurnResult>
  isLoading: boolean
  burnAmount: string
  hasClaimed: (quizId: number) => Promise<boolean>
}

export function useQuizBurner(): UseQuizBurnerReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [burnAmount, setBurnAmount] = useState('1000')

  // Get contract addresses from environment
  const QUIZ_BURNER_ADDRESS = process.env.NEXT_PUBLIC_QUIZ_BURNER_ADDRESS
  const CTD_ADDRESS = process.env.NEXT_PUBLIC_CTD_TOKEN || process.env.NEXT_PUBLIC_CTD_TOKEN_ADDRESS
  const CHAIN_EXPLORER_BASE = process.env.NEXT_PUBLIC_CHAIN_EXPLORER_BASE || 'https://bscscan.com'

  useEffect(() => {
    initializeBurnAmount()
  }, [])

  const initializeBurnAmount = async () => {
    if (!QUIZ_BURNER_ADDRESS || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(QUIZ_BURNER_ADDRESS, QUIZ_BURNER_ABI, provider)
      
      const amountWei = await contract.BURN_AMOUNT()
      const decimals = 18 // CTD has 18 decimals
      const amount = ethers.formatUnits(amountWei, decimals)
      setBurnAmount(amount)
    } catch (error) {
      console.error('Failed to get burn amount:', error)
    }
  }

  const burnAfterQuiz = async (quizId: number): Promise<BurnResult> => {
    if (!QUIZ_BURNER_ADDRESS || !CTD_ADDRESS) {
      return {
        success: false,
        error: 'Contract addresses not configured. Please set NEXT_PUBLIC_QUIZ_BURNER_ADDRESS and NEXT_PUBLIC_CTD_TOKEN in environment.'
      }
    }

    if (!window.ethereum) {
      return {
        success: false,
        error: 'Web3 wallet not found. Please install MetaMask.'
      }
    }

    setIsLoading(true)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      // Connect to contracts
      const quizBurnerContract = new ethers.Contract(QUIZ_BURNER_ADDRESS, QUIZ_BURNER_ABI, signer)
      const ctdContract = new ethers.Contract(CTD_ADDRESS, ERC20_ABI, provider)

      // Get contract parameters
      const amountWei = await quizBurnerContract.BURN_AMOUNT()
      const decimals = await ctdContract.decimals()
      const amount = ethers.formatUnits(amountWei, decimals)

      // Check if already completed quiz
      const alreadyCompleted = await quizBurnerContract.hasCompletedQuiz(userAddress)
      if (alreadyCompleted) {
        return {
          success: false,
          error: 'You have already completed the quiz and burned tokens.',
          alreadyClaimed: true
        }
      }

      // Check if eligible for burn
      const [eligible, reason] = await quizBurnerContract.canBurnTokens(userAddress)
      if (!eligible) {
        return {
          success: false,
          error: `Cannot burn tokens: ${reason}`
        }
      }

      console.log('🔥 Executing burn with parameters:', {
        quizId: quizId.toString(),
        amount,
        amountWei: amountWei.toString(),
        userAddress
      })

      // Execute burn transaction with new interface
      const tx = await quizBurnerContract.burnQuizTokens(quizId.toString())
      console.log('📤 Burn transaction sent:', tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('✅ Burn confirmed in block:', receipt?.blockNumber)

      // Generate explorer URL
      const explorerUrl = `${CHAIN_EXPLORER_BASE}/tx/${tx.hash}`

      return {
        success: true,
        txHash: tx.hash,
        amount,
        explorerUrl
      }

    } catch (error: any) {
      console.error('❌ Burn failed:', error)
      
      let errorMessage = 'Transaction failed'
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user'
      } else if (error.message?.includes('AlreadyClaimed')) {
        errorMessage = 'You have already claimed the burn for this quiz'
      } else if (error.message?.includes('AmountMismatch')) {
        errorMessage = 'Invalid burn amount'
      } else if (error.message?.includes('InvalidProof')) {
        errorMessage = 'Invalid eligibility proof'
      } else if (error.message?.includes('InsufficientAllowance')) {
        errorMessage = 'Insufficient treasury allowance'
      } else if (error.message?.includes('TransferFailed')) {
        errorMessage = 'Token transfer failed'
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const hasClaimed = async (quizId: number): Promise<boolean> => {
    if (!QUIZ_BURNER_ADDRESS || !window.ethereum) return false

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const contract = new ethers.Contract(QUIZ_BURNER_ADDRESS, QUIZ_BURNER_ABI, provider)
      return await contract.hasCompletedQuiz(userAddress)
    } catch (error) {
      console.error('Failed to check claim status:', error)
      return false
    }
  }

  return {
    burnAfterQuiz,
    isLoading,
    burnAmount,
    hasClaimed
  }
}