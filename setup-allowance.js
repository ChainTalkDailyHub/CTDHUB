/**
 * Script para configurar o allowance do contrato CTDQuizBurner
 * 
 * ⚠️  IMPORTANTE: Este script requer a PRIVATE KEY da Treasury
 * Execute apenas se você tem acesso à wallet Treasury
 */

const { ethers } = require('ethers')
const readline = require('readline')

// Configurações
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const CTD_TOKEN_ADDRESS = '0x7f890a4a575558307826C82e4cb6E671f3178bfc'
const TREASURY_ADDRESS = '0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4'
const BURNER_CONTRACT_ADDRESS = '0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958'

// ABI do token ERC-20
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)'
]

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function setupAllowance() {
  try {
    console.log('\n🔧 Setup de Allowance - CTDQuizBurner\n')
    console.log('=' .repeat(60))
    console.log('⚠️  Este script irá configurar o allowance para o contrato')
    console.log('   poder queimar tokens da Treasury')
    console.log('=' .repeat(60) + '\n')

    // Solicitar private key
    console.log('🔑 Digite a PRIVATE KEY da Treasury:')
    console.log('   (Endereço esperado: ' + TREASURY_ADDRESS + ')')
    const privateKey = await question('   Private Key: ')

    if (!privateKey || privateKey.length < 64) {
      throw new Error('Private key inválida')
    }

    // Conectar ao provider
    console.log('\n📡 Conectando à BSC Mainnet...')
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
    
    // Criar wallet
    const wallet = new ethers.Wallet(privateKey, provider)
    const walletAddress = await wallet.getAddress()

    console.log(`✅ Wallet conectada: ${walletAddress}`)

    // Verificar se é a Treasury
    if (walletAddress.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      throw new Error(`❌ Wallet incorreta! Esperado: ${TREASURY_ADDRESS}, Recebido: ${walletAddress}`)
    }

    // Criar instância do contrato
    const ctdToken = new ethers.Contract(
      CTD_TOKEN_ADDRESS,
      ERC20_ABI,
      wallet
    )

    // Verificar saldo
    console.log('\n💰 Verificando saldo da Treasury...')
    const balance = await ctdToken.balanceOf(walletAddress)
    const decimals = await ctdToken.decimals()
    const symbol = await ctdToken.symbol()
    const balanceFormatted = ethers.formatUnits(balance, decimals)

    console.log(`   Saldo: ${parseFloat(balanceFormatted).toLocaleString('pt-BR')} ${symbol}`)

    if (balance === 0n) {
      throw new Error('❌ Treasury sem saldo de tokens!')
    }

    // Verificar allowance atual
    console.log('\n🔍 Verificando allowance atual...')
    const currentAllowance = await ctdToken.allowance(walletAddress, BURNER_CONTRACT_ADDRESS)
    const currentAllowanceFormatted = ethers.formatUnits(currentAllowance, decimals)

    console.log(`   Allowance atual: ${parseFloat(currentAllowanceFormatted).toLocaleString('pt-BR')} ${symbol}`)

    // Solicitar quantidade
    console.log('\n📊 Quanto deseja aprovar?')
    console.log('   1. 100,000 CTD (100 queimas)')
    console.log('   2. 1,000,000 CTD (1000 queimas) - RECOMENDADO')
    console.log('   3. Valor customizado')
    console.log('   4. Aprovar tudo (unlimited)')
    
    const choice = await question('\n   Escolha (1-4): ')

    let amountToApprove
    let amountLabel

    switch(choice.trim()) {
      case '1':
        amountToApprove = ethers.parseUnits('100000', decimals)
        amountLabel = '100,000 CTD'
        break
      case '2':
        amountToApprove = ethers.parseUnits('1000000', decimals)
        amountLabel = '1,000,000 CTD'
        break
      case '3':
        const customAmount = await question('   Digite a quantidade: ')
        amountToApprove = ethers.parseUnits(customAmount, decimals)
        amountLabel = `${parseFloat(customAmount).toLocaleString('pt-BR')} CTD`
        break
      case '4':
        amountToApprove = ethers.MaxUint256
        amountLabel = 'UNLIMITED (máximo possível)'
        break
      default:
        throw new Error('Opção inválida')
    }

    // Confirmação
    console.log('\n⚠️  CONFIRMAÇÃO:')
    console.log(`   Owner: ${walletAddress}`)
    console.log(`   Spender: ${BURNER_CONTRACT_ADDRESS}`)
    console.log(`   Amount: ${amountLabel}`)
    
    const confirm = await question('\n   Confirma a operação? (sim/não): ')

    if (confirm.toLowerCase() !== 'sim') {
      console.log('\n❌ Operação cancelada pelo usuário')
      rl.close()
      return
    }

    // Executar approve
    console.log('\n🚀 Enviando transação de approve...')
    const tx = await ctdToken.approve(BURNER_CONTRACT_ADDRESS, amountToApprove)
    
    console.log(`⏳ Transação enviada: ${tx.hash}`)
    console.log('   Aguardando confirmação...')

    const receipt = await tx.wait()
    
    console.log(`✅ Transação confirmada! Block: ${receipt.blockNumber}`)

    // Verificar novo allowance
    console.log('\n🔍 Verificando novo allowance...')
    const newAllowance = await ctdToken.allowance(walletAddress, BURNER_CONTRACT_ADDRESS)
    const newAllowanceFormatted = ethers.formatUnits(newAllowance, decimals)

    console.log(`   Novo allowance: ${parseFloat(newAllowanceFormatted).toLocaleString('pt-BR')} ${symbol}`)

    console.log('\n' + '='.repeat(60))
    console.log('🎉 ALLOWANCE CONFIGURADO COM SUCESSO!')
    console.log('=' .repeat(60))
    console.log('\n✅ O contrato CTDQuizBurner agora pode:')
    console.log(`   • Fazer transferFrom() da Treasury`)
    console.log(`   • Queimar até ${parseFloat(newAllowanceFormatted).toLocaleString('pt-BR')} ${symbol}`)
    console.log(`   • Permitir ${Math.floor(parseFloat(newAllowanceFormatted) / 1000).toLocaleString('pt-BR')} burns de usuários`)
    
    console.log('\n📝 Próximos passos:')
    console.log('   1. Teste em produção: https://chaintalkdailyhub.com/quiz')
    console.log('   2. Verifique no BscScan: https://bscscan.com/tx/' + tx.hash)
    console.log('   3. Monitore burns: https://bscscan.com/address/' + BURNER_CONTRACT_ADDRESS)
    
    console.log('\n')

  } catch (error) {
    console.error('\n❌ Erro ao configurar allowance:', error.message)
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('\n💰 Saldo insuficiente de BNB para pagar gas')
      console.error('   Envie pelo menos 0.005 BNB para a Treasury')
    } else if (error.code === 'ACTION_REJECTED') {
      console.error('\n❌ Transação rejeitada')
    }
  } finally {
    rl.close()
  }
}

// Executar
setupAllowance()
