/**
 * Monitor de Eventos de Burn - CTDHUB
 * Monitora eventos QuizCompleted do contrato CTDQuizBurner em tempo real
 */

const { ethers } = require('ethers')

// Configurações
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const BURNER_CONTRACT_ADDRESS = '0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958'
const CTD_TOKEN_ADDRESS = '0x7f890a4a575558307826C82e4cb6E671f3178bfc'

// ABI do contrato
const BURNER_ABI = [
  'event QuizCompleted(address indexed user, string quizId, uint256 amountBurned, uint256 timestamp)',
  'function totalBurned() external view returns (uint256)',
  'function burnCount() external view returns (uint256)',
  'function getUserInfo(address user) external view returns (bool hasCompleted, uint256 burnedAmount, uint256 burnTimestamp, string quizId)'
]

const TOKEN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)'
]

const TREASURY_ADDRESS = '0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4'
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'

async function main() {
  console.log('\n🔍 CTDHUB Burn Monitor - Iniciando...\n')
  console.log('═'.repeat(60))
  
  try {
    // Conectar ao provider
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
    console.log('✅ Conectado à BSC Mainnet')
    
    // Criar instâncias dos contratos
    const burnerContract = new ethers.Contract(BURNER_CONTRACT_ADDRESS, BURNER_ABI, provider)
    const tokenContract = new ethers.Contract(CTD_TOKEN_ADDRESS, TOKEN_ABI, provider)
    
    console.log('✅ Contratos inicializados')
    console.log('═'.repeat(60))
    
    // Status inicial
    console.log('\n📊 STATUS INICIAL:\n')
    
    const totalBurned = await burnerContract.totalBurned()
    const burnCount = await burnerContract.burnCount()
    const treasuryBalance = await tokenContract.balanceOf(TREASURY_ADDRESS)
    const deadBalance = await tokenContract.balanceOf(DEAD_ADDRESS)
    const allowance = await tokenContract.allowance(TREASURY_ADDRESS, BURNER_CONTRACT_ADDRESS)
    
    console.log(`   Total Burned: ${ethers.formatEther(totalBurned)} CTD`)
    console.log(`   Burn Count: ${burnCount.toString()} completions`)
    console.log(`   Treasury Balance: ${ethers.formatEther(treasuryBalance)} CTD`)
    console.log(`   Dead Address Balance: ${ethers.formatEther(deadBalance)} CTD`)
    console.log(`   Allowance: ${ethers.formatEther(allowance)} CTD`)
    
    console.log('\n═'.repeat(60))
    console.log('🎧 Monitorando eventos em tempo real...')
    console.log('   (Pressione Ctrl+C para parar)')
    console.log('═'.repeat(60))
    console.log()
    
    // Escutar eventos QuizCompleted
    burnerContract.on('QuizCompleted', async (user, quizId, amountBurned, timestamp, event) => {
      console.log('\n🔥 NOVO BURN DETECTADO!')
      console.log('─'.repeat(60))
      console.log(`   👤 Usuário: ${user}`)
      console.log(`   🆔 Quiz ID: ${quizId}`)
      console.log(`   💰 Tokens Queimados: ${ethers.formatEther(amountBurned)} CTD`)
      console.log(`   ⏰ Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}`)
      console.log(`   🔗 TX Hash: ${event.log.transactionHash}`)
      console.log(`   📊 Block: ${event.log.blockNumber}`)
      console.log(`   🔍 BscScan: https://bscscan.com/tx/${event.log.transactionHash}`)
      console.log('─'.repeat(60))
      
      // Obter informações atualizadas do usuário
      try {
        const userInfo = await burnerContract.getUserInfo(user)
        console.log('\n   📝 Info do Usuário:')
        console.log(`      - Completed: ${userInfo[0]}`)
        console.log(`      - Total Burned: ${ethers.formatEther(userInfo[1])} CTD`)
        console.log(`      - Burn Time: ${new Date(Number(userInfo[2]) * 1000).toLocaleString()}`)
        console.log(`      - Quiz ID: ${userInfo[3]}`)
      } catch (err) {
        console.log('   ⚠️ Não foi possível obter info do usuário:', err.message)
      }
      
      // Status atualizado
      try {
        const newTotalBurned = await burnerContract.totalBurned()
        const newBurnCount = await burnerContract.burnCount()
        const newTreasuryBalance = await tokenContract.balanceOf(TREASURY_ADDRESS)
        const newDeadBalance = await tokenContract.balanceOf(DEAD_ADDRESS)
        
        console.log('\n   📊 Status Atualizado:')
        console.log(`      - Total Burned: ${ethers.formatEther(newTotalBurned)} CTD`)
        console.log(`      - Burn Count: ${newBurnCount.toString()}`)
        console.log(`      - Treasury: ${ethers.formatEther(newTreasuryBalance)} CTD`)
        console.log(`      - Dead Address: ${ethers.formatEther(newDeadBalance)} CTD`)
      } catch (err) {
        console.log('   ⚠️ Não foi possível atualizar status:', err.message)
      }
      
      console.log('\n' + '═'.repeat(60))
      console.log('🎧 Continuando monitoramento...')
      console.log('═'.repeat(60))
      console.log()
    })
    
    // Manter o script rodando
    await new Promise(() => {})
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.error('\nStack:', error.stack)
    process.exit(1)
  }
}

// Tratar Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Monitoramento interrompido pelo usuário')
  console.log('═'.repeat(60))
  console.log('👋 Até logo!')
  process.exit(0)
})

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
