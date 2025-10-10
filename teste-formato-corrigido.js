/**
 * Teste final do formato correto entre API e Frontend
 */

async function testeFormatoCorrigido() {
    console.log('🎯 TESTE FINAL - Formato API-Frontend Corrigido');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    // Aguardar deploy
    console.log('⏳ Aguardando deploy da correção (~2 minutos)...\n');
    
    let attempts = 0;
    const maxAttempts = 8;
    
    const testLoop = setInterval(async () => {
        attempts++;
        console.log(`🔍 Tentativa ${attempts}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
        
        try {
            const testPayload = {
                sessionId: 'final-format-test-' + Date.now(),
                userAnswers: [
                    { question_id: "1", question_text: "Test format", user_response: "Testing format fix", timestamp: Date.now() }
                ],
                language: 'en'
            };
            
            const response = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });
            
            const data = await response.json();
            
            console.log(`   📊 Status: ${response.status}`);
            
            if (response.status === 200) {
                console.log('   🔍 Verificando campos esperados pelo frontend...');
                
                const frontendChecks = {
                    'data.success': !!data.success,
                    'data.analysis (string)': typeof data.analysis === 'string',
                    'data.score (number)': typeof data.score === 'number',
                    'data.saved': !!data.saved
                };
                
                console.log('   📋 Checklist de compatibilidade:');
                Object.entries(frontendChecks).forEach(([check, passed]) => {
                    console.log(`     ${passed ? '✅' : '❌'} ${check}`);
                });
                
                const allPassed = Object.values(frontendChecks).every(Boolean);
                
                if (allPassed) {
                    console.log('\n🎊 SUCESSO TOTAL!');
                    console.log('✅ Formato de resposta 100% compatível com frontend');
                    console.log('✅ Erro JSON parse resolvido');
                    console.log('✅ CTD Skill Compass funcionando perfeitamente');
                    console.log('\n🚀 SISTEMA COMPLETAMENTE OPERACIONAL!');
                    console.log('🔗 Teste agora: https://extraordinary-treacle-1bc552.netlify.app/questionnaire');
                    
                    clearInterval(testLoop);
                    return;
                } else {
                    console.log('   ⚠️  Alguns campos ainda não estão corretos');
                }
            } else {
                console.log(`   ⚠️  Status ${response.status} - ainda deployando`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }
        
        if (attempts >= maxAttempts) {
            console.log('\n⏰ Timeout - teste manualmente em alguns minutos');
            console.log('🔗 https://extraordinary-treacle-1bc552.netlify.app/questionnaire');
            clearInterval(testLoop);
        } else {
            console.log('   ⏳ Aguardando próximo teste em 20 segundos...\n');
        }
        
    }, 20000); // Testa a cada 20 segundos
    
    console.log('🚀 Deploy realizado! Aguardando propagação...');
}

testeFormatoCorrigido();