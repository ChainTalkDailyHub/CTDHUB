import { ethers } from 'ethers'
import { getEnvVar } from './env'

const RPC_BSC = getEnvVar('BSC_RPC_URL')
const PRIVATE_KEY_TREASURY = getEnvVar('PRIVATE_KEY_TREASURY', '')
const TOKEN_ADDRESS = getEnvVar('TOKEN_ADDRESS', '')

// ERC-20 ABI (minimal)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)"
]

export class BSCService {
  private provider: ethers.JsonRpcProvider
  private wallet?: ethers.Wallet
  private contract?: ethers.Contract

  constructor() {
    if (!RPC_BSC) {
      throw new Error('BSC_RPC_URL is required')
    }
    
    this.provider = new ethers.JsonRpcProvider(RPC_BSC)
    
    if (PRIVATE_KEY_TREASURY && TOKEN_ADDRESS) {
      this.wallet = new ethers.Wallet(PRIVATE_KEY_TREASURY, this.provider)
      this.contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, this.wallet)
    }
  }

  private ensureContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Check PRIVATE_KEY_TREASURY and TOKEN_ADDRESS environment variables.')
    }
    return this.contract
  }

  async getDecimals(): Promise<number> {
    const contract = this.ensureContract()
    return await contract.decimals()
  }

  async getBalance(address: string): Promise<string> {
    const contract = this.ensureContract()
    const balance = await contract.balanceOf(address)
    const decimals = await this.getDecimals()
    return ethers.formatUnits(balance, decimals)
  }

  async burnTokens(amount: string): Promise<string> {
    const contract = this.ensureContract()
    const decimals = await this.getDecimals()
    const amountWei = ethers.parseUnits(amount, decimals)
    const burnAddress = "0x000000000000000000000000000000000000dEaD"
    
    const tx = await contract.transfer(burnAddress, amountWei)
    await tx.wait()
    
    return tx.hash
  }

  isConfigured(): boolean {
    return !!this.contract && !!this.wallet
  }
}