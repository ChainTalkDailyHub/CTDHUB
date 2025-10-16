/**
 * Verificar Status de Usuário Específico - CTDHUB
 * Verifica se um usuário já completou o burn e detalhes
 */

const { ethers } = require('ethers')

// Configurações
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const BURNER_CONTRACT_ADDRESS = '0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958'

// ABI do contrato
const BURNER_ABI = [
  'function hasCompletedQuiz(address user) external view returns (bool)',
  'function canBurnTokens(address user) external view returns (bool eligible, string reason)',
  'function getUserInfo(address user) external view returns (bool hasCompleted, uint256 burnedAmount, uint256 burnTimestamp, string quizId)'
]

async function checkUser(userAddress) {
  console.log('\n🔍 VERIFICANDO USUÁRIO\n')
  console.log('═'.repeat(60))
  console.log(`   Endereço: ${userAddress}`)
  console.log('═'.repeat(60))
  
  try {
    // Validar endereço
    if (!ethers.isAddress(userAddress)) {
      throw new Error('Endereço inválido!')
    }
    
    // Conectar ao provider
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
    console.log('\n✅ Conectado à BSC Mainnet')
    
    // Criar instância do contrato
    const contract = new ethers.Contract(BURNER_CONTRACT_ADDRESS, BURNER_ABI, provider)
    console.log('✅ Contrato inicializado')
    
    // Verificar se já completou
    const hasCompleted = await contract.hasCompletedQuiz(userAddress)
    
    console.log('\n📊 STATUS DO USUÁRIO:\n')
    
    if (hasCompleted) {
      console.log('   🔥 Já completou o burn: SIM')
      
      // Obter detalhes
      const userInfo = await contract.getUserInfo(userAddress)
      const [completed, burnedAmount, burnTimestamp, quizId] = userInfo
      
      console.log('\n   📝 Detalhes do Burn:')
      console.log(`      - Tokens Queimados: ${ethers.formatEther(burnedAmount)} CTD`)
      console.log(`      - Data/Hora: ${new Date(Number(burnTimestamp) * 1000).toLocaleString()}`)
      console.log(`      - Quiz ID: ${quizId}`)
      
      // Verificar elegibilidade (deve ser false)
      const [eligible, reason] = await contract.canBurnTokens(userAddress)
      console.log('\n   ⚠️ Pode fazer novo burn: NÃO')
      console.log(`      Motivo: ${reason}`)
      
    } else {
      console.log('   ✅ Já completou o burn: NÃO')
      console.log('   ✅ É primeira vez')
      
      // Verificar elegibilidade
      const [eligible, reason] = await contract.canBurnTokens(userAddress)
      
      console.log('\n   📋 Elegibilidade:')
      if (eligible) {
        console.log(`      ✅ ELEGÍVEL para fazer burn`)
        console.log(`      Status: ${reason}`)
      } else {
        console.log(`      ❌ NÃO ELEGÍVEL`)
        console.log(`      Motivo: ${reason}`)
      }
    }
    
    console.log('\n' + '═'.repeat(60))
    console.log('✅ Verificação concluída!')
    console.log('═'.repeat(60))
    console.log()
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.error('\nStack:', error.stack)
    process.exit(1)
  }
}

// Obter endereço da linha de comando
const userAddress = process.argv[2]

if (!userAddress) {
  console.log('\n❌ ERRO: Endereço não fornecido\n')
  console.log('Uso:')
  console.log('   node check-user.js <ENDEREÇO_WALLET>\n')
  console.log('Exemplo:')
  console.log('   node check-user.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n')
  process.exit(1)
}

// Executar
checkUser(userAddress).catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
