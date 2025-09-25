import type { NextApiRequest, NextApiResponse } from 'next'
import { BSCService } from '@/lib/ethers-bsc'
import { storage } from '@/lib/storage'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { userAddress } = req.body

  console.log('🔥 Burn request recebido:', { userAddress, timestamp: new Date().toISOString() })

  if (!userAddress) {
    console.log('❌ userAddress não fornecido')
    return res.status(400).json({ 
      success: false, 
      error: 'Missing userAddress' 
    })
  }

  try {
    console.log(`🔥 Iniciando processo de burn para carteira: ${userAddress}`)
    
    // Verificar se já queimou antes (REGRA: 1 queima por carteira)
    if (burnControl.hasAlreadyBurned(userAddress)) {
      const existingTx = burnControl.getBurnTransaction(userAddress)
      console.log(`⚠️ Carteira ${userAddress} já realizou burn anteriormente: ${existingTx}`)
      
      return res.status(400).json({
        success: false,
        error: 'This wallet has already performed a burn transaction. Only one burn per wallet is allowed.',
        txHash: existingTx,
        alreadyBurned: true
      })
    }
    
    // Check if user has completed all modules
    const allCompleted = storage.isAllModulesCompleted(userAddress)
    console.log(`📊 Status dos módulos para ${userAddress}: ${allCompleted ? '✅ Todos completos' : '❌ Incompleto'}`)
    
    if (!allCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Must complete all 10 modules before burning'
      })
    }

    // Check if already burned (compatibilidade)
    const existingTx = burnTransactions.get(userAddress.toLowerCase())
    if (existingTx) {
      console.log('✅ Burn já realizado anteriormente:', existingTx)
      return res.status(200).json({
        success: true,
        txHash: existingTx,
        message: 'Already burned'
      })
    }

    // Initialize BSC service and perform burn
    console.log('🔥 Executando queima de tokens...')
    const bscService = new BSCService()
    const burnAmount = process.env.BURN_AMOUNT || '10000'
    
    console.log(`💰 Queimando ${burnAmount} tokens CTD da carteira treasury`)
    const txHash = await bscService.burnTokens(burnAmount)
    
    // Marcar carteira como já tendo feito burn (PERMANENTE)
    burnControl.markAsBurned(userAddress, txHash)
    console.log(`✅ Burn concluído! TX: ${txHash}`)
    console.log(`🔒 Carteira ${userAddress} marcada como já queimou (não poderá queimar novamente)`)
    
    return res.status(200).json({
      success: true,
      txHash,
      burnAmount,
      message: 'Burn completed successfully'
    })

  } catch (error) {
    console.error('❌ Erro no burn:', error)
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('Tipo do erro:', error.constructor.name)
      console.error('Mensagem:', error.message)
      console.error('Stack:', error.stack)
    }
    
    let errorMessage = 'Failed to process burn transaction'
    
    // Tratamento específico de erros
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network connection error'
      } else if (error.message.includes('revert')) {
        errorMessage = 'Transaction reverted by contract'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Transaction timeout'
      }
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}