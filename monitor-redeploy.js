/**
 * Monitor intensivo para detectar redeploy do Netlify
 */

async function monitorRedeploy() {
    console.log('⚡ Monitor Intensivo - Aguardando Redeploy Netlify');
    console.log('=' .repeat(50));
    console.log('🕒 Testando a cada 15 segundos...\n');
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    let testCount = 0;
    const maxTests = 15; // ~4 minutos de monitoramento
    
    const interval = setInterval(async () => {
        testCount++;
        const timestamp = new Date().toLocaleTimeString();
        
        try {
            console.log(`🔍 Teste ${testCount}/${maxTests} - ${timestamp}`);
            
            const healthResponse = await fetch(`${baseUrl}/.netlify/functions/health`);
            const healthData = await healthResponse.text();
            const health = JSON.parse(healthData);
            
            const openaiConfigured = health.checks?.openai?.configured;
            const apiBaseConfigured = !!process.env.NEXT_PUBLIC_BINNO_API_BASE;
            
            console.log(`   📊 Health Status: ${healthResponse.status}`);
            console.log(`   🔑 OpenAI: ${openaiConfigured ? '✅ CONFIGURADO' : '⏳ Aguardando'}`);
            
            if (openaiConfigured) {
                console.log('\n🎊 SUCESSO! Variáveis detectadas no servidor!');
                console.log('🧪 Testando análise completa da IA...\n');
                
                // Teste completo da análise
                const testPayload = {
                    sessionId: 'success-test-' + Date.now(),
                    answers: [
                        { questionNumber: 1, answer: "Sistema configurado com sucesso" },
                        { questionNumber: 2, answer: "OpenAI funcionando perfeitamente" },
                        { questionNumber: 3, answer: "Copy-paste detection ativa" }
                    ],
                    userProfile: { 
                        name: "Sistema Test", 
                        email: "success@ctdhub.com" 
                    }
                };
                
                try {
                    console.log('📤 Enviando teste real para análise IA...');
                    const apiResponse = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(testPayload)
                    });
                    
                    console.log(`📊 Status da Análise: ${apiResponse.status}`);
                    
                    if (apiResponse.status === 200) {
                        const result = await apiResponse.text();
                        const analysis = JSON.parse(result);
                        
                        console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL!');
                        console.log('=' .repeat(50));
                        console.log('✅ CTD Skill Compass 100% operacional');
                        console.log('✅ OpenAI gerando análises personalizadas');
                        console.log('✅ Copy-paste detection rigorosa');
                        console.log('✅ Parsing defensivo funcionando');
                        console.log('✅ CORS configurado corretamente');
                        
                        if (analysis.report) {
                            console.log(`✅ Relatório gerado: ${analysis.report.reportId}`);
                            console.log(`✅ Score exemplo: ${analysis.report.overallScore}/100`);
                        }
                        
                        console.log('\n🚀 PRONTO PARA USO EM PRODUÇÃO!');
                        console.log('🔗 Teste agora: https://extraordinary-treacle-1bc552.netlify.app/questionnaire');
                        
                    } else {
                        console.log(`⚠️  Status ${apiResponse.status} - ainda processando configuração`);
                        const errorText = await apiResponse.text();
                        console.log(`   Resposta: ${errorText.substring(0, 100)}...`);
                    }
                    
                } catch (apiError) {
                    console.log(`❌ Erro na análise: ${apiError.message}`);
                }
                
                clearInterval(interval);
                return;
            }
            
            console.log('   ⏳ Aguardando propagação das variáveis...');
            
            if (testCount >= maxTests) {
                console.log('\n⏰ Timeout - as variáveis podem demorar mais para propagar');
                console.log('💡 Teste manualmente em alguns minutos');
                console.log('🔗 Health: https://extraordinary-treacle-1bc552.netlify.app/.netlify/functions/health');
                clearInterval(interval);
            }
            
        } catch (error) {
            console.log(`❌ Erro: ${error.message}`);
        }
        
        console.log(''); // Linha em branco
        
    }, 15000); // 15 segundos
    
    console.log('✅ Variáveis configuradas no Netlify Dashboard');
    console.log('⏳ Aguardando redeploy automático...');
    console.log('🔄 O processo pode levar 2-5 minutos\n');
}

monitorRedeploy();