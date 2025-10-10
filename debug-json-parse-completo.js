/**
 * Análise Completa de Erro JSON Parse
 * Investigação sistemática de todas as possíveis causas
 */

async function analisarErroJSONParse() {
    console.log('🔍 ANÁLISE COMPLETA - Erro JSON Parse');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    console.log('📋 POSSÍVEIS CAUSAS DO ERRO JSON PARSE:');
    console.log('');
    
    // 1. Teste direto da função health
    console.log('1️⃣ TESTE: Health Check - Response Format');
    console.log('-'.repeat(40));
    
    try {
        const healthResponse = await fetch(`${baseUrl}/.netlify/functions/health`);
        const healthText = await healthResponse.text();
        
        console.log(`Status: ${healthResponse.status}`);
        console.log(`Content-Type: ${healthResponse.headers.get('content-type')}`);
        console.log(`Content-Length: ${healthText.length}`);
        console.log(`First char: "${healthText.charAt(0)}"`);
        console.log(`Last char: "${healthText.charAt(healthText.length - 1)}"`);
        console.log(`Raw response (first 200):`);
        console.log(healthText.substring(0, 200));
        console.log('');
        
        // Tentar parse
        try {
            const parsed = JSON.parse(healthText);
            console.log('✅ Health JSON parse: SUCCESS');
        } catch (e) {
            console.log(`❌ Health JSON parse ERROR: ${e.message}`);
            console.log('🔍 Problema detectado no health check!');
        }
        
    } catch (error) {
        console.log(`❌ Health request failed: ${error.message}`);
    }
    
    console.log('\n2️⃣ TESTE: Frontend API Call');
    console.log('-'.repeat(40));
    
    // Simular exatamente o que o frontend faz
    const testPayload = {
        sessionId: 'debug-frontend-' + Date.now(),
        answers: [
            { questionNumber: 1, answer: "Debug test" },
            { questionNumber: 2, answer: "Frontend simulation" }
        ],
        userProfile: { name: "Debug", email: "debug@test.com" }
    };
    
    try {
        console.log('📤 Simulando chamada exata do frontend...');
        
        const apiResponse = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });
        
        const contentType = apiResponse.headers.get('content-type') || '';
        const rawResponse = await apiResponse.text();
        
        console.log(`Status: ${apiResponse.status}`);
        console.log(`Content-Type: "${contentType}"`);
        console.log(`Response length: ${rawResponse.length}`);
        console.log(`First 10 chars: "${rawResponse.substring(0, 10)}"`);
        console.log(`Last 10 chars: "${rawResponse.substring(rawResponse.length - 10)}"`);
        
        // Verificar se é JSON válido
        try {
            const parsed = JSON.parse(rawResponse);
            console.log('✅ API JSON parse: SUCCESS');
            console.log(`Report ID: ${parsed.report?.reportId || 'N/A'}`);
        } catch (parseError) {
            console.log(`❌ API JSON parse ERROR: ${parseError.message}`);
            console.log('🔍 PROBLEMA DETECTADO NA API!');
            console.log('Full response:');
            console.log(rawResponse);
        }
        
    } catch (error) {
        console.log(`❌ API request failed: ${error.message}`);
    }
    
    console.log('\n3️⃣ ANÁLISE: Possíveis Causas Sistemáticas');
    console.log('-'.repeat(40));
    
    const possiveisCausas = [
        {
            categoria: 'ENCODING ISSUES',
            causas: [
                'BOM (Byte Order Mark) no início do arquivo',
                'Caracteres invisíveis (zero-width spaces)',
                'Encoding UTF-8 com problemas',
                'Line endings (CRLF vs LF) corrompidos'
            ]
        },
        {
            categoria: 'FUNCTION RESPONSE FORMAT',
            causas: [
                'Função retornando HTML em vez de JSON',
                'Erro 500 retornando página de erro HTML',
                'CORS preflight retornando HTML',
                'Timeout retornando página Netlify'
            ]
        },
        {
            categoria: 'TEMPLATE PARSING ISSUES',
            causas: [
                'AI retornando JSON malformado',
                'Template parsing falhando',
                'Caracteres especiais não escapados',
                'String interpolation quebrada'
            ]
        },
        {
            categoria: 'ENVIRONMENT VARIABLES',
            causas: [
                'OPENAI_API_KEY com formato incorreto',
                'Variáveis não propagadas (cache)',
                'Escopo incorreto (branch-specific)',
                'Caracteres especiais na chave'
            ]
        },
        {
            categoria: 'NETLIFY SPECIFIC',
            causas: [
                'Function timeout (10s limit)',
                'Memory limit exceeded',
                'Cold start issues',
                'Build/deploy cache problems'
            ]
        },
        {
            categoria: 'CODE ISSUES',
            causas: [
                'Double JSON.stringify',
                'Async/await mal implementado',
                'Error handling inadequado',
                'Response headers incorretos'
            ]
        }
    ];
    
    possiveisCausas.forEach((grupo, index) => {
        console.log(`\n${index + 1}. ${grupo.categoria}:`);
        grupo.causas.forEach(causa => {
            console.log(`   • ${causa}`);
        });
    });
    
    console.log('\n4️⃣ SOLUÇÕES PARA TESTAR');
    console.log('-'.repeat(40));
    
    const solucoes = [
        'Redeploy manual forçado (clear cache)',
        'Verificar logs das functions em tempo real',
        'Testar com OPENAI_API_KEY diferente',
        'Verificar se variáveis estão em "All deploys"',
        'Testar em browser diferente (limpar cache)',
        'Verificar encoding dos arquivos de função',
        'Adicionar logging detalhado na função',
        'Testar com payload menor',
        'Verificar se há caracteres especiais na chave'
    ];
    
    solucoes.forEach((solucao, index) => {
        console.log(`${index + 1}. ${solucao}`);
    });
    
    console.log('\n5️⃣ DEBUGGING AVANÇADO NECESSÁRIO');
    console.log('-'.repeat(40));
    console.log('• Verificar logs Netlify Functions em tempo real');
    console.log('• Adicionar console.log na função antes do return');
    console.log('• Testar localmente com netlify dev');
    console.log('• Verificar se há middleware interferindo');
    console.log('• Análise byte-by-byte da response');
}

analisarErroJSONParse();