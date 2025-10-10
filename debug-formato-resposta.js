/**
 * Debug da discrepância entre formato da API e expectativa do Frontend
 */

async function debugFormatoResposta() {
    console.log('🔍 DEBUG: Formato da Resposta API vs Frontend');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    const testPayload = {
        sessionId: 'format-debug-' + Date.now(),
        userAnswers: [  // Note: frontend usa "userAnswers", não "answers"
            { question_id: "1", question_text: "Test", user_response: "Response 1", timestamp: Date.now() },
            { question_id: "2", question_text: "Test 2", user_response: "Response 2", timestamp: Date.now() }
        ],
        language: 'en'
    };
    
    try {
        console.log('📤 Testando com payload no formato do frontend...');
        console.log('Payload:', JSON.stringify(testPayload, null, 2));
        
        const response = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        console.log('\n📊 RESPOSTA DA API:');
        console.log('Status:', response.status);
        console.log('Estrutura real:', Object.keys(data));
        
        if (data.report) {
            console.log('✅ Campo "report" encontrado');
            console.log('Report keys:', Object.keys(data.report));
            console.log('Overall score:', data.report.overallScore);
        }
        
        if (data.analysis) {
            console.log('✅ Campo "analysis" encontrado (nível superior)');
        }
        
        if (data.success) {
            console.log('✅ Campo "success" encontrado:', data.success);
        } else {
            console.log('❌ Campo "success" AUSENTE ou false');
        }
        
        if (data.score) {
            console.log('✅ Campo "score" encontrado:', data.score);
        } else {
            console.log('❌ Campo "score" AUSENTE');
        }
        
        console.log('\n🎯 PROBLEMA IDENTIFICADO:');
        console.log('Frontend espera:');
        console.log('  - data.success = true');
        console.log('  - data.analysis = string');
        console.log('  - data.score = number');
        console.log('');
        console.log('API retorna:');
        console.log('  - data.report.analysis = object');
        console.log('  - data.report.overallScore = number');
        console.log('  - data.success = ???');
        
        console.log('\n💡 SOLUÇÃO:');
        console.log('1. Ajustar API para retornar formato esperado pelo frontend');
        console.log('2. OU ajustar frontend para usar novo formato da API');
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
    }
}

debugFormatoResposta();