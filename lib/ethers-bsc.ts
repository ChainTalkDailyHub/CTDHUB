import { ethers } from 'ethers'

const RPC_BSC = process.env.RPC_BSC!
const PRIVATE_KEY_TREASURY = process.env.PRIVATE_KEY_TREASURY!
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!

// ERC-20 ABI (minimal)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)"
]

export class BSCService {
  private provider: ethers.JsonRpcProvider
  private wallet: ethers.Wallet
  private contract: ethers.Contract

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_BSC)
    this.wallet = new ethers.Wallet(PRIVATE_KEY_TREASURY, this.provider)
    this.contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, this.wallet)
  }

  async getDecimals(): Promise<number> {
    return await this.contract.decimals()
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address)
    const decimals = await this.getDecimals()
    return ethers.formatUnits(balance, decimals)
  }

  async burnTokens(amount: string): Promise<string> {
    const decimals = await this.getDecimals()
    const amountWei = ethers.parseUnits(amount, decimals)
    const burnAddress = "0x000000000000000000000000000000000000dEaD"
    
    const tx = await this.contract.transfer(burnAddress, amountWei)
    await tx.wait()
    
    return tx.hash
  }
}