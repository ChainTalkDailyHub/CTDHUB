/**
 * Teste direto do funcionamento atual do sistema
 * Mesmo sem OpenAI configurada, podemos testar se o routing está funcionando
 */

async function testeDiretoSistema() {
    console.log('🔍 Teste Direto do Sistema - CTD Skill Compass');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    console.log('📊 1. Testando Health Check...');
    try {
        const healthResponse = await fetch(`${baseUrl}/.netlify/functions/health`);
        const healthData = await healthResponse.text();
        
        console.log(`   Status: ${healthResponse.status}`);
        console.log(`   Raw response: ${healthData.substring(0, 200)}...`);
        
        if (healthResponse.ok) {
            const health = JSON.parse(healthData);
            console.log(`   ✅ Sistema respondendo`);
            console.log(`   🔑 OpenAI configurado: ${health.checks?.openai?.configured || false}`);
            console.log(`   🔑 OpenAI key length: ${health.checks?.openai?.keyLength || 0}`);
        }
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }
    
    console.log('\n🧪 2. Testando API de Análise (sem OpenAI)...');
    try {
        const testPayload = {
            sessionId: 'diagnostic-test-' + Date.now(),
            answers: [
                { questionNumber: 1, answer: "Teste diagnóstico" },
                { questionNumber: 2, answer: "Verificação de funcionamento" }
            ],
            userProfile: { name: "Diagnostic", email: "test@test.com" }
        };
        
        console.log('📤 Enviando payload para análise...');
        const apiResponse = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        console.log(`   Status: ${apiResponse.status}`);
        const responseText = await apiResponse.text();
        console.log(`   Response length: ${responseText.length} chars`);
        console.log(`   First 300 chars: ${responseText.substring(0, 300)}...`);
        
        if (apiResponse.status === 500 && responseText.includes('OpenAI')) {
            console.log('   ✅ Erro esperado: OpenAI não configurada');
            console.log('   ✅ Mas a função está acessível e funcionando!');
        } else if (apiResponse.status === 200) {
            console.log('   🎉 Funcionando perfeitamente!');
        } else {
            console.log('   ⚠️  Status inesperado');
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }
    
    console.log('\n📋 3. Diagnóstico de Possíveis Problemas...');
    
    // Verificar se o redeploy realmente aconteceu
    console.log('🔄 Possíveis causas do atraso:');
    console.log('   • Netlify pode demorar 5-10 minutos para propagar variáveis');
    console.log('   • Cache de CDN pode estar em cache');
    console.log('   • Redeploy pode não ter triggerado automaticamente');
    
    console.log('\n💡 Soluções para tentar:');
    console.log('   1. Aguardar mais 5 minutos');
    console.log('   2. Fazer redeploy manual no Netlify Dashboard');
    console.log('   3. Verificar se as variáveis estão no escopo "All deploys"');
    console.log('   4. Testar diretamente o questionário real');
    
    console.log('\n🔗 Links para verificação manual:');
    console.log(`   Health: ${baseUrl}/.netlify/functions/health`);
    console.log(`   Questionnaire: ${baseUrl}/questionnaire`);
    console.log('   Netlify Deploys: https://app.netlify.com/sites/extraordinary-treacle-1bc552/deploys');
    console.log('   Netlify Env: https://app.netlify.com/sites/extraordinary-treacle-1bc552/settings/env');
    
    console.log('\n⏰ Status: Aguardando propagação das variáveis...');
}

testeDiretoSistema();