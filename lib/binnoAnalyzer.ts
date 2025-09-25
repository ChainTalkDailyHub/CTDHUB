import { ethers } from 'ethers'

interface ContractAnalysisResult {
  isVerified: boolean
  contractName?: string
  compiler?: string
  license?: string
  securityScore: number
  warnings: string[]
  functions: {
    name: string
    type: 'view' | 'pure' | 'payable' | 'nonpayable'
    inputs: { name: string; type: string }[]
    outputs: { name: string; type: string }[]
  }[]
  events: {
    name: string
    inputs: { name: string; type: string; indexed: boolean }[]
  }[]
}

interface TransactionAnalysis {
  hash: string
  status: 'success' | 'failed' | 'pending'
  gasUsed?: number
  gasPrice?: number
  gasLimit?: number
  value: string
  from: string
  to: string
  blockNumber?: number
  timestamp?: number
  decodedInput?: {
    function: string
    parameters: { name: string; value: any; type: string }[]
  }
  events: {
    name: string
    parameters: { name: string; value: any; type: string }[]
  }[]
  riskAnalysis: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
  }
}

interface GasOptimizationSuggestion {
  currentGas: number
  optimizedGas: number
  savings: number
  suggestions: string[]
}

class BinnoAnalyzer {
  private provider: ethers.JsonRpcProvider
  
  constructor() {
    // Use BSC provider from existing config
    this.provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org/')
  }

  // Smart Contract Analysis
  async analyzeContract(contractAddress: string): Promise<ContractAnalysisResult> {
    try {
      const code = await this.provider.getCode(contractAddress)
      
      if (code === '0x') {
        throw new Error('Address is not a contract')
      }

      // Basic analysis without external API
      const result: ContractAnalysisResult = {
        isVerified: false, // Would need BSCScan API for verification status
        securityScore: this.calculateBasicSecurityScore(code),
        warnings: this.analyzeCodeWarnings(code),
        functions: [],
        events: []
      }

      return result
    } catch (error) {
      throw new Error(`Failed to analyze contract: ${error}`)
    }
  }

  private calculateBasicSecurityScore(bytecode: string): number {
    let score = 50 // Base score
    
    // Simple heuristics based on bytecode patterns
    if (bytecode.length > 1000) score += 10 // Reasonable size
    if (bytecode.includes('revert')) score += 15 // Has error handling
    if (bytecode.includes('require')) score += 15 // Has validation
    
    // Potential red flags
    if (bytecode.length < 200) score -= 20 // Too simple
    if (!bytecode.includes('revert') && !bytecode.includes('require')) score -= 25
    
    return Math.max(0, Math.min(100, score))
  }

  private analyzeCodeWarnings(bytecode: string): string[] {
    const warnings: string[] = []
    
    if (bytecode.length < 500) {
      warnings.push('Contract is very simple - verify functionality')
    }
    
    if (!bytecode.includes('revert')) {
      warnings.push('No revert statements found - potential lack of error handling')
    }
    
    return warnings
  }

  // Transaction Analysis
  async analyzeTransaction(txHash: string): Promise<TransactionAnalysis> {
    try {
      const tx = await this.provider.getTransaction(txHash)
      const receipt = await this.provider.getTransactionReceipt(txHash)
      
      if (!tx) {
        throw new Error('Transaction not found')
      }

      const analysis: TransactionAnalysis = {
        hash: txHash,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
        gasUsed: receipt?.gasUsed ? Number(receipt.gasUsed) : undefined,
        gasPrice: tx.gasPrice ? Number(tx.gasPrice) : undefined,
        gasLimit: Number(tx.gasLimit),
        value: ethers.formatEther(tx.value || 0),
        from: tx.from || '',
        to: tx.to || '',
        blockNumber: tx.blockNumber || undefined,
        timestamp: undefined, // Would need block data
        events: [],
        riskAnalysis: this.analyzeTransactionRisk(tx)
      }

      return analysis
    } catch (error) {
      throw new Error(`Failed to analyze transaction: ${error}`)
    }
  }

  private analyzeTransactionRisk(tx: ethers.TransactionResponse): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    const factors: string[] = []
    let riskScore = 0

    // High value transaction
    const valueInEth = Number(ethers.formatEther(tx.value || 0))
    if (valueInEth > 10) {
      factors.push('High value transaction')
      riskScore += 2
    }

    // High gas price (potential front-running)
    if (tx.gasPrice && Number(tx.gasPrice) > 20000000000) { // > 20 gwei
      factors.push('High gas price - potential MEV activity')
      riskScore += 1
    }

    // Contract interaction with data
    if (tx.to && tx.data && tx.data !== '0x') {
      factors.push('Contract interaction with complex data')
      riskScore += 1
    }

    // Determine risk level
    let level: 'low' | 'medium' | 'high' = 'low'
    if (riskScore >= 3) level = 'high'
    else if (riskScore >= 1) level = 'medium'

    return { level, factors }
  }

  // Gas Optimization Analysis
  analyzeGasOptimization(transactionData: any): GasOptimizationSuggestion {
    const suggestions: string[] = []
    let potentialSavings = 0

    // Mock analysis - in real implementation, would analyze actual contract calls
    const currentGas = transactionData.gasUsed || 21000
    
    if (currentGas > 100000) {
      suggestions.push('Consider batching multiple operations')
      potentialSavings += Math.floor(currentGas * 0.1)
    }

    if (currentGas > 50000) {
      suggestions.push('Review storage operations - use memory when possible')
      potentialSavings += Math.floor(currentGas * 0.05)
    }

    suggestions.push('Use view/pure functions when state changes not needed')
    suggestions.push('Consider using events instead of storing non-critical data')

    return {
      currentGas,
      optimizedGas: currentGas - potentialSavings,
      savings: potentialSavings,
      suggestions
    }
  }

  // Token Analysis
  async analyzeToken(tokenAddress: string): Promise<any> {
    try {
      // Basic ERC-20 interface
      const erc20ABI = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)'
      ]

      const contract = new ethers.Contract(tokenAddress, erc20ABI, this.provider)
      
      const [name, symbol, decimals, totalSupply] = await Promise.allSettled([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ])

      return {
        address: tokenAddress,
        name: name.status === 'fulfilled' ? name.value : 'Unknown',
        symbol: symbol.status === 'fulfilled' ? symbol.value : 'UNKNOWN',
        decimals: decimals.status === 'fulfilled' ? Number(decimals.value) : 18,
        totalSupply: totalSupply.status === 'fulfilled' ? 
          ethers.formatUnits(totalSupply.value, decimals.status === 'fulfilled' ? decimals.value : 18) : 'Unknown',
        isContract: true
      }
    } catch (error) {
      throw new Error(`Failed to analyze token: ${error}`)
    }
  }

  // Price Analysis Helper
  async getTokenPrice(tokenSymbol: string): Promise<{ price: number; change24h: number } | null> {
    // Mock implementation - would integrate with price API like CoinGecko
    const mockPrices: Record<string, { price: number; change24h: number }> = {
      'BTC': { price: 43250.00, change24h: 2.5 },
      'ETH': { price: 2650.00, change24h: 1.8 },
      'BNB': { price: 315.00, change24h: -0.5 },
      'CTD': { price: 0.0001, change24h: 15.2 } // Mock CTD price
    }

    return mockPrices[tokenSymbol.toUpperCase()] || null
  }
}

export default BinnoAnalyzer
export type { ContractAnalysisResult, TransactionAnalysis, GasOptimizationSuggestion }