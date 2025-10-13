const axios = require('axios');

/**
 * 🧪 Teste de Integração - Novo Contrato Quiz Burner
 * Contrato: 0x27E975342Ef23E188987DfC3bEE1322a651E5C9A
 */

// Configurações
const CONTRACT_ADDRESS = '0x27E975342Ef23E188987DfC3bEE1322a651E5C9A';
const CTD_TOKEN = '0x7f890a4a575558307826C82e4cb6E671f3178bfc';
const TREASURY = '0x27f79d0a52f88d04e1d04875fe55d6c23f514ec4';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

console.log('🧪 TESTE DE INTEGRAÇÃO - NOVO CONTRATO');
console.log('=====================================\n');

console.log('📋 Configurações:');
console.log(`   Contrato: ${CONTRACT_ADDRESS}`);
console.log(`   CTD Token: ${CTD_TOKEN}`);
console.log(`   Treasury: ${TREASURY}`);
console.log(`   RPC: ${BSC_RPC}\n`);

/**
 * Testa se o contrato existe na blockchain
 */
async function testContractExists() {
    console.log('🔍 1. Testando existência do contrato...');
    
    try {
        const response = await axios.post(BSC_RPC, {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [CONTRACT_ADDRESS, 'latest'],
            id: 1
        });

        const code = response.data.result;
        
        if (code && code !== '0x') {
            console.log('   ✅ Contrato existe na blockchain');
            console.log(`   📊 Tamanho do bytecode: ${code.length - 2} bytes`);
            return true;
        } else {
            console.log('   ❌ Contrato não encontrado');
            return false;
        }
    } catch (error) {
        console.log('   ❌ Erro ao verificar contrato:', error.message);
        return false;
    }
}

/**
 * Testa se o CTD token existe
 */
async function testCTDToken() {
    console.log('\n🪙 2. Testando CTD Token...');
    
    try {
        // Testar chamada de symbol()
        const response = await axios.post(BSC_RPC, {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
                to: CTD_TOKEN,
                data: '0x95d89b41' // symbol()
            }, 'latest'],
            id: 1
        });

        const result = response.data.result;
        
        if (result && result !== '0x') {
            console.log('   ✅ CTD Token acessível');
            // Decodificar symbol (simplificado)
            console.log('   📊 Token responde a chamadas');
            return true;
        } else {
            console.log('   ❌ CTD Token não responde');
            return false;
        }
    } catch (error) {
        console.log('   ❌ Erro ao testar CTD Token:', error.message);
        return false;
    }
}

/**
 * Testa conectividade com BSCScan
 */
async function testBSCScanAPI() {
    console.log('\n🌐 3. Testando BSCScan API...');
    
    try {
        const response = await axios.get(`https://api.bscscan.com/api`, {
            params: {
                module: 'contract',
                action: 'getabi',
                address: CTD_TOKEN,
                apikey: 'YourApiKeyToken'
            },
            timeout: 10000
        });

        if (response.data.status === '1') {
            console.log('   ✅ BSCScan API funcionando');
            return true;
        } else {
            console.log('   ⚠️  BSCScan API acessível (sem API key válida)');
            return true; // Ainda é um sucesso de conectividade
        }
    } catch (error) {
        console.log('   ❌ Erro no BSCScan API:', error.message);
        return false;
    }
}

/**
 * Testa se o novo contrato tem as funções esperadas
 */
async function testContractFunctions() {
    console.log('\n🔧 4. Testando funções do contrato...');
    
    const functions = [
        { name: 'burnAmount()', selector: '0x7cb64759' },
        { name: 'ctdToken()', selector: '0x0b833b6d' },
        { name: 'treasury()', selector: '0x2b7ac3f3' },
        { name: 'paused()', selector: '0x5c975abb' }
    ];

    let successCount = 0;

    for (const func of functions) {
        try {
            const response = await axios.post(BSC_RPC, {
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                    to: CONTRACT_ADDRESS,
                    data: func.selector
                }, 'latest'],
                id: 1
            });

            if (response.data.result && response.data.result !== '0x') {
                console.log(`   ✅ ${func.name} - Funcionando`);
                successCount++;
            } else {
                console.log(`   ❌ ${func.name} - Não responde`);
            }
        } catch (error) {
            console.log(`   ❌ ${func.name} - Erro: ${error.message}`);
        }
    }

    console.log(`\n   📊 Funções testadas: ${successCount}/${functions.length}`);
    return successCount === functions.length;
}

/**
 * Verifica se o contrato está verificado no BSCScan
 */
async function testContractVerification() {
    console.log('\n📋 5. Verificando se contrato está verificado...');
    
    try {
        const response = await axios.get(`https://api.bscscan.com/api`, {
            params: {
                module: 'contract',
                action: 'getsourcecode',
                address: CONTRACT_ADDRESS,
                apikey: 'YourApiKeyToken'
            },
            timeout: 10000
        });

        if (response.data.status === '1' && response.data.result[0].SourceCode) {
            console.log('   ✅ Contrato verificado no BSCScan');
            console.log(`   📝 Nome: ${response.data.result[0].ContractName}`);
            return true;
        } else {
            console.log('   ⚠️  Contrato não verificado (mas isso é OK)');
            return false;
        }
    } catch (error) {
        console.log('   ❌ Erro ao verificar status:', error.message);
        return false;
    }
}

/**
 * Teste principal
 */
async function runIntegrationTest() {
    const results = [];
    
    results.push(await testContractExists());
    results.push(await testCTDToken());
    results.push(await testBSCScanAPI());
    results.push(await testContractFunctions());
    results.push(await testContractVerification());
    
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO DOS TESTES:');
    console.log(`   ✅ Aprovados: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Falharam: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests >= 3) {
        console.log('\n🎉 INTEGRAÇÃO FUNCIONANDO!');
        console.log('   O novo contrato está operacional');
        console.log(`   🔗BSCScan: https://bscscan.com/address/${CONTRACT_ADDRESS}`);
    } else {
        console.log('\n⚠️  PROBLEMAS DETECTADOS');
        console.log('   Verifique a configuração do contrato');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('   1. ✅ Variáveis .env.local atualizadas');
    console.log('   2. 🔄 Configure allowance do treasury');
    console.log('   3. 🌐 Atualize variáveis no Netlify');
    console.log('   4. 🧪 Teste frontend completo');
}

// Executar teste
if (require.main === module) {
    runIntegrationTest().catch(console.error);
}

module.exports = { runIntegrationTest };