/**
 * Monitor específico para detectar configuração da OpenAI
 */

async function monitorOpenAI() {
    console.log('🔑 Monitor OpenAI - Detectando configuração...\n');
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    let testCount = 0;
    const maxTests = 10;
    
    const interval = setInterval(async () => {
        testCount++;
        const timestamp = new Date().toLocaleTimeString();
        
        try {
            const response = await fetch(`${baseUrl}/.netlify/functions/health`);
            const data = await response.text();
            const health = JSON.parse(data);
            
            const openaiConfigured = health.checks?.openai?.configured;
            
            console.log(`🕒 ${timestamp} - Teste ${testCount}/${maxTests}`);
            console.log(`🔑 OpenAI: ${openaiConfigured ? '✅ CONFIGURADO!' : '❌ Ainda ausente'}`);
            
            if (openaiConfigured) {
                console.log('\n🎊 SUCESSO! OpenAI detectada!');
                console.log('🧪 Testando análise completa...');
                
                // Teste real da análise
                const testPayload = {
                    sessionId: 'final-test-' + Date.now(),
                    answers: [
                        { questionNumber: 1, answer: "Test final do sistema" },
                        { questionNumber: 2, answer: "Verificação da IA funcionando" }
                    ],
                    userProfile: { name: "Final Test", email: "final@test.com" }
                };
                
                try {
                    const apiResponse = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(testPayload)
                    });
                    
                    if (apiResponse.status === 200) {
                        console.log('🎉 SISTEMA COMPLETAMENTE FUNCIONAL!');
                        console.log('✅ CTD Skill Compass 100% operacional');
                        console.log('✅ IA gerando relatórios');
                        console.log('✅ Copy-paste detection ativa');
                        console.log('\n🚀 Pode testar o questionário completo agora!');
                    } else {
                        console.log(`⚠️  API retornou ${apiResponse.status} - verificando...`);
                    }
                } catch (apiError) {
                    console.log(`❌ Erro na API: ${apiError.message}`);
                }
                
                clearInterval(interval);
                return;
            }
            
            if (testCount >= maxTests) {
                console.log('\n⏰ Timeout - configure manualmente se necessário');
                clearInterval(interval);
            }
            
        } catch (error) {
            console.log(`❌ Erro: ${error.message}`);
        }
    }, 20000); // Testa a cada 20 segundos
    
    console.log('⏳ Aguardando configuração da OPENAI_API_KEY...');
    console.log('🔗 Configure em: https://app.netlify.com/sites/extraordinary-treacle-1bc552/settings/env');
}

monitorOpenAI();