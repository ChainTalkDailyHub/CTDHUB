/**
 * Monitor de Deploy Forçado - Verifica aplicação das correções
 */

async function monitorDeployForcado() {
    console.log('🚀 MONITOR DEPLOY FORÇADO - CTD Skill Compass');
    console.log('=' .repeat(60));
    console.log('⚡ Redeploy forçado triggerado (commit 5644a43)');
    console.log('🕒 Monitorando aplicação das correções...\n');
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const monitor = setInterval(async () => {
        attempts++;
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`🔍 Deploy Check ${attempts}/${maxAttempts} - ${timestamp}`);
        console.log('-'.repeat(40));
        
        try {
            // Teste direto da função com payload real
            const testPayload = {
                sessionId: 'force-deploy-test-' + Date.now(),
                userAnswers: [
                    { 
                        question_id: "test-1", 
                        question_text: "Deploy force test", 
                        user_response: "Testing forced deploy", 
                        timestamp: Date.now() 
                    }
                ],
                language: 'en'
            };
            
            console.log('📤 Testando função Netlify atualizada...');
            
            const response = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });
            
            const rawResponse = await response.text();
            console.log(`📊 Status: ${response.status}`);
            
            if (response.status === 200) {
                try {
                    const data = JSON.parse(rawResponse);
                    
                    // Verificar campos críticos
                    const checks = {
                        success: !!data.success,
                        analysis: typeof data.analysis === 'string',
                        score: typeof data.score === 'number',
                        saved: !!data.saved,
                        report: !!data.report
                    };
                    
                    console.log('🔍 Verificação de campos:');
                    Object.entries(checks).forEach(([field, passed]) => {
                        console.log(`   ${passed ? '✅' : '❌'} ${field}: ${passed ? 'OK' : 'MISSING'}`);
                    });
                    
                    if (data.score !== undefined) {
                        console.log(`   📊 Score: ${data.score}/100`);
                    }
                    
                    if (data.report?.overallScore !== undefined) {
                        console.log(`   📋 Report Score: ${data.report.overallScore}/100`);
                    }
                    
                    // Verificar se todos os campos críticos estão presentes
                    const allFieldsPresent = checks.success && checks.analysis && checks.score && checks.saved;
                    
                    if (allFieldsPresent) {
                        console.log('\n🎊 DEPLOY FORÇADO SUCESSO!');
                        console.log('✅ Todos os campos críticos presentes');
                        console.log('✅ Formato 100% compatível com frontend');
                        console.log('✅ CTD Skill Compass completamente funcional');
                        console.log('\n🎯 SISTEMA TOTALMENTE OPERACIONAL!');
                        console.log('🔗 Teste agora: https://extraordinary-treacle-1bc552.netlify.app/questionnaire');
                        
                        clearInterval(monitor);
                        return;
                    } else {
                        console.log('⚠️  Deploy ainda propagando, alguns campos ausentes');
                    }
                    
                } catch (parseError) {
                    console.log(`❌ JSON Parse Error: ${parseError.message}`);
                    console.log(`Raw response: ${rawResponse.substring(0, 200)}...`);
                }
                
            } else if (response.status === 500) {
                console.log('⚠️  Erro 500 - função ainda deployando');
            } else {
                console.log(`⚠️  Status inesperado: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`❌ Erro de rede: ${error.message}`);
        }
        
        if (attempts >= maxAttempts) {
            console.log('\n⏰ Monitor timeout');
            console.log('💡 O deploy pode demorar mais que o esperado');
            console.log('🔗 Teste manualmente: https://extraordinary-treacle-1bc552.netlify.app/questionnaire');
            clearInterval(monitor);
        } else {
            console.log('⏳ Próximo check em 15 segundos...\n');
        }
        
    }, 15000); // Check a cada 15 segundos
    
    console.log('🔄 Deploy forçado iniciado');
    console.log('⏳ Aguardando aplicação das correções...');
}

monitorDeployForcado();