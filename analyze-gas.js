/**
 * Análise de Gas Price - BSC Mainnet
 * Verifica se gas price baixo pode estar causando alerta no MetaMask
 */

const { ethers } = require('ethers')

const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'
const BSCSCAN_API_KEY = '1A8YXSRK5VIPP3IQN3RYA4K2HVXH81MM4E'

async function analyzeGas() {
  console.log('\n🔍 ANÁLISE DE GAS - BSC MAINNET\n')
  console.log('═'.repeat(60))
  
  try {
    // 1. Conectar ao provider BSC
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
    console.log('✅ Conectado à BSC Mainnet')
    
    // 2. Obter gas price atual
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice
    const gasPriceGwei = Number(gasPrice) / 1e9
    
    console.log('\n📊 GAS PRICE ATUAL:')
    console.log(`   Wei: ${gasPrice.toString()}`)
    console.log(`   Gwei: ${gasPriceGwei.toFixed(4)}`)
    
    // 3. Calcular custo para transação de burn
    const gasLimit = 100000 // Gas limit estimado para burn
    const gasCostWei = gasPrice * BigInt(gasLimit)
    const gasCostBNB = Number(gasCostWei) / 1e18
    
    console.log('\n💰 CUSTO ESTIMADO DE BURN:')
    console.log(`   Gas Limit: ${gasLimit}`)
    console.log(`   Custo em BNB: ${gasCostBNB.toFixed(6)} BNB`)
    
    // 4. Obter preço do BNB em USD
    const bnbPriceRes = await fetch(
      `https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${BSCSCAN_API_KEY}`
    )
    const bnbData = await bnbPriceRes.json()
    
    if (bnbData.status === '1') {
      const bnbPriceUSD = parseFloat(bnbData.result.ethusd)
      const gasCostUSD = gasCostBNB * bnbPriceUSD
      
      console.log(`   Preço BNB: $${bnbPriceUSD.toFixed(2)} USD`)
      console.log(`   Custo em USD: $${gasCostUSD.toFixed(4)} USD`)
    }
    
    console.log('\n═'.repeat(60))
    
    // 5. Análise de gas price
    console.log('\n🔍 ANÁLISE:\n')
    
    if (gasPriceGwei < 1) {
      console.log('⚠️ ALERTA CRÍTICO: Gas price EXTREMAMENTE BAIXO!')
      console.log('\nIsso PODE causar:')
      console.log('  ❌ Transação ficar pendente indefinidamente')
      console.log('  ❌ MetaMask marcar transação como suspeita')
      console.log('  ❌ Falha na confirmação da transação')
      console.log('  ❌ Miners ignorarem a transação')
      console.log('\n✅ SOLUÇÃO:')
      console.log('  • Aumentar gas price manualmente no MetaMask')
      console.log('  • Usar "Fast" ou "Aggressive" gas settings')
      console.log('  • Mínimo recomendado: 3 Gwei')
      
    } else if (gasPriceGwei < 3) {
      console.log('⚠️ ATENÇÃO: Gas price BAIXO')
      console.log('\nIsso pode causar:')
      console.log('  ⏳ Atrasos na confirmação (5-10 minutos)')
      console.log('  ⚠️ MetaMask pode mostrar avisos')
      console.log('\n✅ RECOMENDAÇÃO:')
      console.log('  • Considerar aumentar para 3-5 Gwei')
      console.log('  • Usar gas price padrão do MetaMask')
      
    } else if (gasPriceGwei < 5) {
      console.log('✅ Gas price NORMAL para BSC')
      console.log('\nEsperado:')
      console.log('  ✅ Confirmação em ~3 segundos')
      console.log('  ✅ Sem alertas do MetaMask')
      console.log('  ✅ Custo equilibrado')
      
    } else {
      console.log('✅ Gas price ALTO (rede congestionada)')
      console.log('\nBenefícios:')
      console.log('  ⚡ Confirmação muito rápida')
      console.log('  ✅ Prioridade alta')
      console.log('\nCusto:')
      console.log('  💸 Mais caro que o normal')
    }
    
    // 6. Comparação com Ethereum
    console.log('\n📊 CONTEXTO (BSC vs Ethereum):')
    console.log('\n   BSC:')
    console.log(`     • Atual: ${gasPriceGwei.toFixed(2)} Gwei`)
    console.log('     • Normal: 3-5 Gwei')
    console.log('     • Alto: 10-20 Gwei')
    console.log('\n   Ethereum (para comparação):')
    console.log('     • Normal: 20-50 Gwei')
    console.log('     • Alto: 100-300 Gwei')
    
    // 7. Recomendação específica para o burn
    console.log('\n═'.repeat(60))
    console.log('\n💡 RECOMENDAÇÃO PARA O BURN CTDHUB:\n')
    
    if (gasPriceGwei < 3) {
      console.log('⚠️ AUMENTAR GAS PRICE!')
      console.log('\nNo MetaMask, ao assinar a transação:')
      console.log('  1. Clique em "Edit" ou "Market"')
      console.log('  2. Selecione "Aggressive" ou "Custom"')
      console.log('  3. Defina Gas Price: 5 Gwei (recomendado)')
      console.log('  4. Gas Limit: 100000 (automático)')
      console.log(`  5. Custo final: ~$${(0.0005 * parseFloat(bnbData.result?.ethusd || 600)).toFixed(4)} USD`)
    } else {
      console.log('✅ Gas price está adequado!')
      console.log('\nPode usar o valor padrão sugerido pelo MetaMask.')
      console.log('Confirmação esperada em ~3 segundos.')
    }
    
    console.log('\n═'.repeat(60))
    console.log()
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    process.exit(1)
  }
}

// Executar
analyzeGas().catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
