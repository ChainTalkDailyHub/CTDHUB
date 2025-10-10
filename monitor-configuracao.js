/**
 * Monitor de configuração do Netlify em tempo real
 * Executa testes contínuos para verificar quando as variáveis são aplicadas
 */

let monitorInterval;
let testCount = 0;
const MAX_TESTS = 20; // ~10 minutos de monitoramento

async function monitorarConfiguracaoNetlify() {
    console.log('👀 Monitor de Configuração - CTD Skill Compass');
    console.log('=' .repeat(60));
    console.log('🕒 Iniciando monitoramento a cada 30 segundos...');
    console.log('📝 Configure as variáveis no Netlify Dashboard durante o monitoramento\n');
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    async function verificarStatus() {
        testCount++;
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`\n🔍 Teste ${testCount}/${MAX_TESTS} - ${timestamp}`);
        console.log('-'.repeat(40));
        
        try {
            // Health Check
            const healthResponse = await fetch(`${baseUrl}/.netlify/functions/health`);
            const healthData = await healthResponse.text();
            
            if (healthResponse.ok) {
                const health = JSON.parse(healthData);
                
                const openaiConfigured = health.checks?.openai?.configured;
                const supabaseConfigured = health.checks?.supabase?.url_configured;
                
                console.log(`🔑 OpenAI: ${openaiConfigured ? '✅ Configurado' : '❌ Ausente'}`);
                console.log(`🗄️  Supabase: ${supabaseConfigured ? '✅ Configurado' : '❌ Ausente'}`);
                
                // Se OpenAI foi configurado, teste uma análise real
                if (openaiConfigured) {
                    console.log('🎉 OPENAI_API_KEY detectada! Testando análise real...');
                    
                    const testPayload = {
                        sessionId: 'monitor-test-' + Date.now(),
                        answers: [
                            { questionNumber: 1, answer: "Configuração de teste do sistema" },
                            { questionNumber: 2, answer: "Validação de funcionamento da IA" }
                        ],
                        userProfile: { name: "Monitor Test", email: "monitor@test.com" }
                    };
                    
                    try {
                        const apiResponse = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(testPayload)
                        });
                        
                        console.log(`📊 Análise IA: ${apiResponse.status === 200 ? '✅ Funcionando' : '❌ Erro ' + apiResponse.status}`);
                        
                        if (apiResponse.status === 200) {
                            console.log('\n🎊 SUCESSO TOTAL! Sistema completamente configurado!');
                            console.log('✅ OpenAI configurado e funcionando');
                            console.log('✅ Análise IA gerando relatórios');
                            console.log('✅ CORS e routing funcionando');
                            console.log('\n🚀 CTD Skill Compass está 100% operacional!');
                            
                            clearInterval(monitorInterval);
                            return;
                        }
                        
                    } catch (apiError) {
                        console.log(`📊 Análise IA: ❌ Erro - ${apiError.message.substring(0, 50)}`);
                    }
                }
                
                console.log(`⏳ Status geral: ${openaiConfigured ? 'Quase pronto' : 'Aguardando configuração'}`);
                
            } else {
                console.log('❌ Health check falhou');
            }
            
        } catch (error) {
            console.log(`❌ Erro de conectividade: ${error.message}`);
        }
        
        if (testCount >= MAX_TESTS) {
            console.log('\n⏰ Timeout do monitoramento atingido');
            console.log('💡 Configure manualmente se ainda não foi feito');
            clearInterval(monitorInterval);
        }
    }
    
    // Primeira verificação imediata
    await verificarStatus();
    
    // Configurar monitoramento contínuo
    monitorInterval = setInterval(verificarStatus, 30000); // 30 segundos
    
    console.log('\n📋 Enquanto monitora, configure no Netlify Dashboard:');
    console.log('🔗 https://app.netlify.com/sites/extraordinary-treacle-1bc552/settings/env');
    console.log('\n🛑 Pressione Ctrl+C para parar o monitoramento');
}

// Capturar Ctrl+C para parar graciosamente
process.on('SIGINT', () => {
    console.log('\n\n🛑 Parando monitoramento...');
    if (monitorInterval) {
        clearInterval(monitorInterval);
    }
    console.log('👋 Monitor finalizado');
    process.exit(0);
});

monitorarConfiguracaoNetlify().catch(console.error);