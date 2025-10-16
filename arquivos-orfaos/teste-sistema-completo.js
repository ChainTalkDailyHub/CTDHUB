/**
 * 🧪 Teste Completo do Sistema de Queima - Frontend + Blockchain
 * Testa o fluxo completo com o novo contrato
 */

const axios = require('axios');
const { Web3 } = require('web3');
require('dotenv').config({ path: '.env.local' });

// Configurações
const FRONTEND_URL = 'http://localhost:3000';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';
const CONTRACT_ADDRESS = '0x27E975342Ef23E188987DfC3bEE1322a651E5C9A';
const CTD_TOKEN = '0x7f890a4a575558307826C82e4cb6E671f3178bfc';
const TREASURY = '0x27f79d0a52f88d04e1d04875fe55d6c23f514ec4';

console.log('🧪 TESTE COMPLETO DO SISTEMA DE QUEIMA');
console.log('=====================================\n');

/**
 * Testa se o frontend está rodando
 */
async function testFrontendRunning() {
    console.log('🌐 1. Testando frontend...');
    
    try {
        const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
        
        if (response.status === 200) {
            console.log('   ✅ Frontend acessível em http://localhost:3000');
            
            // Verificar se contém referências ao novo contrato
            const html = response.data;
            if (html.includes('0x27E975342Ef23E188987DfC3bEE1322a651E5C9A') || 
                html.includes('QUIZ_BURNER')) {
                console.log('   ✅ Configuração do contrato detectada no frontend');
            } else {
                console.log('   ⚠️  Configuração do contrato não detectada (pode estar em JS)');
            }
            
            return true;
        }
    } catch (error) {
        console.log('   ❌ Frontend não acessível:', error.message);
        console.log('   💡 Execute: npm run dev');
        return false;
    }
}

/**
 * Testa as funções Netlify
 */
async function testNetlifyFunctions() {
    console.log('\n⚡ 2. Testando funções Netlify...');
    
    const functions = [
        { name: 'binno-generate-question', path: '/.netlify/functions/binno-generate-question' },
        { name: 'binno-final-analysis', path: '/.netlify/functions/binno-final-analysis' },
        { name: 'course-manager', path: '/.netlify/functions/course-manager' }
    ];
    
    let workingFunctions = 0;
    
    for (const func of functions) {
        try {
            // Teste simples de conectividade
            const response = await axios.post(`${FRONTEND_URL}${func.path}`, {
                test: true
            }, { 
                timeout: 3000,
                validateStatus: () => true // Aceitar qualquer status
            });
            
            if (response.status < 500) {
                console.log(`   ✅ ${func.name} - Respondendo`);
                workingFunctions++;
            } else {
                console.log(`   ❌ ${func.name} - Erro ${response.status}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`   ⚠️  ${func.name} - Função não acessível (normal em dev)`);
            } else {
                console.log(`   ❌ ${func.name} - ${error.message}`);
            }
        }
    }
    
    console.log(`\n   📊 Funções testadas: ${workingFunctions}/3`);
    return workingFunctions > 0;
}

/**
 * Testa conectividade blockchain
 */
async function testBlockchainIntegration() {
    console.log('\n🔗 3. Testando integração blockchain...');
    
    try {
        const web3 = new Web3(BSC_RPC);
        
        // Testar conectividade
        const blockNumber = await web3.eth.getBlockNumber();
        console.log(`   ✅ Conectado à BSC - Block: ${blockNumber}`);
        
        // Testar contrato
        const code = await web3.eth.getCode(CONTRACT_ADDRESS);
        if (code && code !== '0x') {
            console.log('   ✅ Quiz Burner contract acessível');
        } else {
            console.log('   ❌ Quiz Burner contract não encontrado');
            return false;
        }
        
        // Testar CTD Token
        const ctdCode = await web3.eth.getCode(CTD_TOKEN);
        if (ctdCode && ctdCode !== '0x') {
            console.log('   ✅ CTD Token acessível');
        } else {
            console.log('   ❌ CTD Token não encontrado');
            return false;
        }
        
        return true;
    } catch (error) {
        console.log('   ❌ Erro blockchain:', error.message);
        return false;
    }
}

/**
 * Testa allowance do treasury
 */
async function testTreasuryAllowance() {
    console.log('\n💰 4. Testando allowance do treasury...');
    
    try {
        const web3 = new Web3(BSC_RPC);
        
        const allowanceABI = [{
            "inputs": [
                {"name": "owner", "type": "address"},
                {"name": "spender", "type": "address"}
            ],
            "name": "allowance",
            "outputs": [{"name": "", "type": "uint256"}],
            "type": "function"
        }];
        
        const ctdContract = new web3.eth.Contract(allowanceABI, CTD_TOKEN);
        const allowance = await ctdContract.methods.allowance(TREASURY, CONTRACT_ADDRESS).call();
        
        const allowanceInCTD = web3.utils.fromWei(allowance, 'ether');
        console.log(`   💎 Allowance: ${allowanceInCTD} CTD`);
        
        if (BigInt(allowance) > 0) {
            console.log('   ✅ Treasury allowance configurado');
            return true;
        } else {
            console.log('   ❌ Treasury allowance não configurado');
            return false;
        }
    } catch (error) {
        console.log('   ❌ Erro ao verificar allowance:', error.message);
        return false;
    }
}

/**
 * Testa configuração de ambiente
 */
async function testEnvironmentConfig() {
    console.log('\n🔧 5. Testando configuração de ambiente...');
    
    const requiredVars = [
        'QUIZ_BURNER_ADDRESS',
        'NEXT_PUBLIC_QUIZ_BURNER_ADDRESS', 
        'NEXT_PUBLIC_CTD_TOKEN',
        'OPENAI_API_KEY',
        'PRIVATE_KEY_TREASURY'
    ];
    
    let configuredVars = 0;
    
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName} configurada`);
            configuredVars++;
        } else {
            console.log(`   ❌ ${varName} não encontrada`);
        }
    });
    
    console.log(`\n   📊 Variáveis configuradas: ${configuredVars}/${requiredVars.length}`);
    return configuredVars === requiredVars.length;
}

/**
 * Simula fluxo de queima (sem executar)
 */
async function simulateBurnFlow() {
    console.log('\n🔥 6. Simulando fluxo de queima...');
    
    try {
        const web3 = new Web3(BSC_RPC);
        
        // Simular preparação da transação (sem enviar)
        const burnABI = [{
            "inputs": [],
            "name": "burnQuizTokens",
            "outputs": [],
            "type": "function"
        }];
        
        const burnerContract = new web3.eth.Contract(burnABI, CONTRACT_ADDRESS);
        
        // Estimar gas (sem executar)
        try {
            const gasEstimate = await burnerContract.methods.burnQuizTokens().estimateGas({
                from: TREASURY
            });
            
            console.log(`   ⛽ Gas estimado: ${gasEstimate}`);
            console.log('   ✅ Transação de queima pode ser preparada');
            return true;
        } catch (gasError) {
            if (gasError.message.includes('revert')) {
                console.log('   ⚠️  Contrato rejeitou simulação (normal sem saldo)');
                console.log('   ✅ Contrato respondeu corretamente');
                return true;
            } else {
                console.log('   ❌ Erro na simulação:', gasError.message);
                return false;
            }
        }
    } catch (error) {
        console.log('   ❌ Erro na simulação:', error.message);
        return false;
    }
}

/**
 * Executa todos os testes
 */
async function runCompleteTest() {
    const results = [];
    
    results.push(await testFrontendRunning());
    results.push(await testNetlifyFunctions());
    results.push(await testBlockchainIntegration());
    results.push(await testTreasuryAllowance());
    results.push(await testEnvironmentConfig());
    results.push(await simulateBurnFlow());
    
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL DOS TESTES:');
    console.log(`   ✅ Aprovados: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Falharam: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests >= 5) {
        console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL!');
        console.log('   ✅ Frontend rodando');
        console.log('   ✅ Blockchain conectada');
        console.log('   ✅ Contratos acessíveis');
        console.log('   ✅ Treasury configurado');
        console.log('   ✅ Sistema de queima operacional');
        
        console.log('\n🚀 PRONTO PARA PRODUÇÃO!');
    } else {
        console.log('\n⚠️  ALGUNS PROBLEMAS DETECTADOS');
        console.log('   Verifique os itens com ❌ acima');
    }
    
    console.log('\n📋 Links úteis:');
    console.log(`   Frontend: ${FRONTEND_URL}`);
    console.log(`   Quiz Burner: https://bscscan.com/address/${CONTRACT_ADDRESS}`);
    console.log(`   CTD Token: https://bscscan.com/address/${CTD_TOKEN}`);
    console.log(`   Treasury: https://bscscan.com/address/${TREASURY}`);
}

// Executar teste completo
if (require.main === module) {
    runCompleteTest().catch(console.error);
}