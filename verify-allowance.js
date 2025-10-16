/**
 * Script para verificar o allowance do contrato CTDQuizBurner
 * 
 * IMPORTANTE: Este script verifica se a Treasury aprovou o contrato
 * para fazer transferFrom() de tokens CTD
 */

const { ethers } = require('ethers')

// Configurações
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const CTD_TOKEN_ADDRESS = '0x7f890a4a575558307826C82e4cb6E671f3178bfc'
const TREASURY_ADDRESS = '0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4'
const BURNER_CONTRACT_ADDRESS = '0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958'

// ABI mínima do token ERC-20
const ERC20_ABI = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)'
]

async function verifyAllowance() {
  try {
    console.log('🔍 Verificando Allowance do Contrato CTDQuizBurner\n')
    console.log('=' .repeat(60))

    // Conectar ao provider BSC
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
    console.log('✅ Conectado à BSC Mainnet')

    // Criar instância do contrato CTD Token
    const ctdToken = new ethers.Contract(
      CTD_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    )

    // Obter informações do token
    const [name, symbol, decimals] = await Promise.all([
      ctdToken.name(),
      ctdToken.symbol(),
      ctdToken.decimals()
    ])

    console.log(`📋 Token: ${name} (${symbol})`)
    console.log(`📍 Endereço: ${CTD_TOKEN_ADDRESS}\n`)

    // Verificar saldo da Treasury
    console.log('💰 Verificando saldo da Treasury...')
    const treasuryBalance = await ctdToken.balanceOf(TREASURY_ADDRESS)
    const treasuryBalanceFormatted = ethers.formatUnits(treasuryBalance, decimals)
    
    console.log(`   Treasury: ${TREASURY_ADDRESS}`)
    console.log(`   Saldo: ${parseFloat(treasuryBalanceFormatted).toLocaleString('pt-BR')} ${symbol}`)
    
    if (treasuryBalance === 0n) {
      console.log('   ⚠️  ALERTA: Treasury sem saldo!')
    } else {
      console.log('   ✅ Treasury tem saldo suficiente')
    }

    // Verificar allowance
    console.log('\n🔐 Verificando Allowance...')
    const allowance = await ctdToken.allowance(
      TREASURY_ADDRESS,
      BURNER_CONTRACT_ADDRESS
    )
    const allowanceFormatted = ethers.formatUnits(allowance, decimals)

    console.log(`   Owner: ${TREASURY_ADDRESS}`)
    console.log(`   Spender: ${BURNER_CONTRACT_ADDRESS}`)
    console.log(`   Allowance: ${parseFloat(allowanceFormatted).toLocaleString('pt-BR')} ${symbol}`)

    console.log('\n' + '=' .repeat(60))

    // Análise
    if (allowance === 0n) {
      console.log('\n❌ PROBLEMA CRÍTICO: Allowance é ZERO!')
      console.log('\n📝 O contrato burner NÃO pode fazer transferFrom()')
      console.log('   Quando usuário tentar queimar, a transação falhará.')
      console.log('\n🔧 SOLUÇÃO: Execute o comando abaixo com a wallet Treasury:\n')
      console.log(`   const tx = await ctdToken.approve(`)
      console.log(`     "${BURNER_CONTRACT_ADDRESS}",`)
      console.log(`     ethers.parseEther("1000000") // 1 milhão de tokens`)
      console.log(`   )`)
      console.log(`   await tx.wait()`)
      console.log('\n   Ou use este script: setup-allowance.js')
      
      return false
    } else {
      const allowanceNumber = parseFloat(allowanceFormatted)
      const minRequired = 1000 // Mínimo para 1 queima
      const recommendedMin = 100000 // Recomendado para 100 queimas

      console.log('\n✅ Allowance configurado!')
      
      if (allowanceNumber < minRequired) {
        console.log(`\n⚠️  ALERTA: Allowance muito baixo (< ${minRequired.toLocaleString('pt-BR')} ${symbol})`)
        console.log('   Recomenda-se aumentar para pelo menos 100,000 CTD')
      } else if (allowanceNumber < recommendedMin) {
        console.log(`\n⚠️  Allowance funcional mas baixo (< ${recommendedMin.toLocaleString('pt-BR')} ${symbol})`)
        console.log(`   Permite apenas ${Math.floor(allowanceNumber / 1000)} queimas`)
        console.log('   Recomenda-se aumentar para 1,000,000 CTD')
      } else {
        console.log(`\n🎉 Allowance EXCELENTE!`)
        console.log(`   Permite ${Math.floor(allowanceNumber / 1000).toLocaleString('pt-BR')} queimas de 1000 CTD`)
      }

      return true
    }

  } catch (error) {
    console.error('\n❌ Erro ao verificar allowance:', error.message)
    
    if (error.message.includes('could not detect network')) {
      console.error('\n🔧 Problema de conexão com BSC RPC')
      console.error('   Tente novamente ou use outro RPC endpoint')
    }
    
    return false
  }
}

// Executar verificação
console.log('\n🚀 Iniciando verificação...\n')
verifyAllowance()
  .then(success => {
    console.log('\n' + '='.repeat(60))
    if (success) {
      console.log('✅ Verificação concluída com sucesso!')
      console.log('\n📝 Próximos passos:')
      console.log('   1. Testar burn em produção: https://chaintalkdailyhub.com/quiz')
      console.log('   2. Monitorar transações: https://bscscan.com/address/' + BURNER_CONTRACT_ADDRESS)
    } else {
      console.log('⚠️  Verificação concluída com alertas')
      console.log('\n📝 AÇÃO NECESSÁRIA: Configure o allowance antes de testar')
    }
    console.log('='.repeat(60) + '\n')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error)
    process.exit(1)
  })
