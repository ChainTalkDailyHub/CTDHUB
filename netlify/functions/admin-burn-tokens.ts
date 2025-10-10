import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

// ABI mínimo para transferir tokens ERC20
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

// Endereço de queima padrão
const BURN_ADDRESS = '0x000000000000000000000000000000000000dead'

// Store para evitar duplo burn por endereço de carteira (persistente durante a sessão da função)
const burnedUsers = new Map<string, { txHash: string, timestamp: number }>()

export const handler: Handler = async (event, context) => {
  console.log('🔥 Admin Burn Function - Start')
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}')
    const { userAddress, amount = '1000' } = body

    if (!userAddress || !userAddress.startsWith('0x') || userAddress.length !== 42) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid wallet address is required (0x format)' })
      }
    }

    // Verificar se já foi feito burn para este endereço de carteira
    const userKey = userAddress.toLowerCase()
    const existingBurn = burnedUsers.get(userKey)
    
    if (existingBurn) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Burn already completed for this wallet address',
          alreadyBurned: true,
          txHash: existingBurn.txHash,
          timestamp: existingBurn.timestamp
        })
      }
    }

    // Verificar variáveis de ambiente
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY
    const rpcUrl = process.env.RPC_URL || process.env.BSC_RPC_URL
    const contractAddress = process.env.CTD_CONTRACT_ADDRESS || process.env.CTD_TOKEN_ADDRESS

    if (!adminPrivateKey) {
      throw new Error('ADMIN_PRIVATE_KEY not configured')
    }
    if (!rpcUrl) {
      throw new Error('RPC_URL not configured')
    }
    if (!contractAddress) {
      throw new Error('CTD_CONTRACT_ADDRESS not configured')
    }

    console.log('🔧 Environment check passed')
    console.log('📡 RPC URL:', rpcUrl.substring(0, 30) + '...')
    console.log('💎 Contract:', contractAddress)
    console.log('🔥 Burn Address:', BURN_ADDRESS)
    console.log('💰 Amount to burn:', amount, 'tokens')

    // Conectar ao BSC
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider)
    
    console.log('👤 Admin wallet:', adminWallet.address)

    // Conectar ao contrato CTD
    const ctdContract = new ethers.Contract(contractAddress, ERC20_ABI, adminWallet)

    // Verificar saldo da carteira admin
    const balance = await ctdContract.balanceOf(adminWallet.address)
    const decimals = await ctdContract.decimals()
    
    console.log('💰 Admin balance:', ethers.formatUnits(balance, decimals), 'CTD')

    // Converter amount para wei (considerando decimais do token)
    const amountToburn = ethers.parseUnits(amount, decimals)
    
    if (balance < amountToburn) {
      throw new Error(`Insufficient balance. Need ${amount} CTD, have ${ethers.formatUnits(balance, decimals)} CTD`)
    }

    // Executar a transferência para o endereço de queima
    console.log('🔥 Executing burn transaction...')
    const tx = await ctdContract.transfer(BURN_ADDRESS, amountToburn)
    
    console.log('📝 Transaction sent:', tx.hash)
    console.log('⏳ Waiting for confirmation...')
    
    // Aguardar confirmação
    const receipt = await tx.wait()
    
    console.log('✅ Transaction confirmed:', receipt.hash)
    console.log('⛽ Gas used:', receipt.gasUsed.toString())

    // Marcar usuário como já tendo feito burn
    burnedUsers.set(userKey, {
      txHash: receipt.hash,
      timestamp: Date.now()
    })

    const result = {
      success: true,
      txHash: receipt.hash,
      amount: amount,
      burnAddress: BURN_ADDRESS,
      gasUsed: receipt.gasUsed.toString(),
      message: `Successfully burned ${amount} CTD tokens to burn address`
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }

  } catch (error) {
    console.error('❌ Burn error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      })
    }
  }
}