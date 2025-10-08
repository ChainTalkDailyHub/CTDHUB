import type { Handler } from '@netlify/functions'
import { BSCService } from '../../lib/ethers-bsc'

// Store burn transactions to prevent double burning (1 per wallet)
const burnTransactions = new Map<string, string>()

// Sistema de controle de queima única por carteira
class BurnControlService {
  private static instance: BurnControlService
  private burnedWallets: Set<string> = new Set()
  
  static getInstance(): BurnControlService {
    if (!BurnControlService.instance) {
      BurnControlService.instance = new BurnControlService()
    }
    return BurnControlService.instance
  }
  
  hasAlreadyBurned(userAddress: string): boolean {
    return this.burnedWallets.has(userAddress.toLowerCase())
  }
  
  markAsBurned(userAddress: string, txHash: string): void {
    this.burnedWallets.add(userAddress.toLowerCase())
    burnTransactions.set(userAddress.toLowerCase(), txHash)
  }
  
  getBurnTransaction(userAddress: string): string | undefined {
    return burnTransactions.get(userAddress.toLowerCase())
  }
}

const burnControl = BurnControlService.getInstance()

export const handler: Handler = async (event, context) => {
  console.log('🔥 Burn Function - Start')
  
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
    let requestBody
    try {
      requestBody = JSON.parse(event.body || '{}')
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        })
      }
    }

    const { userAddress } = requestBody

    console.log('🔥 Burn request recebido:', { userAddress, timestamp: new Date().toISOString() })

    if (!userAddress || typeof userAddress !== 'string') {
      console.log('❌ userAddress não fornecido ou inválido')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid userAddress' 
        })
      }
    }

    // Normalizar endereço
    const normalizedAddress = userAddress.toLowerCase()

    // Verificar se já foi queimado
    if (burnControl.hasAlreadyBurned(normalizedAddress)) {
      console.log('⚠️ Usuário já realizou burn:', normalizedAddress)
      const existingTx = burnControl.getBurnTransaction(normalizedAddress)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          alreadyBurned: true,
          txHash: existingTx,
          message: 'Tokens already burned for this address'
        })
      }
    }

    console.log('🔥 Processando queima para:', normalizedAddress)

    try {
      // Inicializar serviço BSC
      const bscService = new BSCService()
      
      // Verificar se o serviço está configurado
      if (!bscService.isConfigured()) {
        console.error('❌ BSC Service não configurado - variáveis de ambiente ausentes')
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Burn service not properly configured'
          })
        }
      }

      // Executar burn real na BSC
      const burnAmount = process.env.BURN_AMOUNT || '1000' // Default 1000 tokens
      console.log('🔥 Executando burn real na BSC:', { amount: burnAmount })
      
      const txHash = await bscService.burnTokens(burnAmount)
      
      // Marcar como queimado
      burnControl.markAsBurned(normalizedAddress, txHash)
      
      console.log('✅ Burn REAL realizado com sucesso:', {
        userAddress: normalizedAddress,
        txHash: txHash,
        amount: burnAmount,
        timestamp: new Date().toISOString()
      })

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          txHash: txHash,
          amount: burnAmount,
          message: 'Real burn transaction executed successfully on BSC'
        })
      }

    } catch (burnError: any) {
      console.error('❌ Erro na queima REAL:', burnError)
      
      // Logs detalhados para debug
      console.error('Burn Error Details:', {
        message: burnError.message,
        code: burnError.code,
        stack: burnError.stack
      })
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Real burn transaction failed: ${burnError.message}`,
          details: burnError.code || 'UNKNOWN_ERROR'
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro geral no burn:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}