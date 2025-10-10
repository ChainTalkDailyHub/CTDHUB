// Teste para capturar resposta completa sem truncamento
const testData = {
    userAnswers: [
        {
            question: "Teste simples",
            user_response: "Resposta teste"
        }
    ],
    sessionContext: {
        session_id: "test-debug-" + Date.now()
    },
    userAddress: "test-user"
};

async function debugResponseComplete() {
    console.log('🔍 DEBUG: CAPTURANDO RESPOSTA COMPLETA');
    console.log('====================================');
    
    const url = 'https://extraordinary-treacle-1bc552.netlify.app/.netlify/functions/binno-final-analysis';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 Status:', response.status);
        
        const text = await response.text();
        console.log('\n📄 RESPOSTA COMPLETA:');
        console.log('Length:', text.length, 'chars');
        console.log('---START---');
        console.log(text);
        console.log('---END---');
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log('\n🔍 CAMPOS NO ROOT:');
                console.log('Keys:', Object.keys(data));
                
                console.log('\n📋 VALORES DOS CAMPOS:');
                console.log('success:', data.success);
                console.log('ok:', data.ok);
                console.log('analysis:', data.analysis ? 'Present' : 'Missing');
                console.log('score:', data.score);
                console.log('saved:', data.saved);
                console.log('sessionId:', data.sessionId);
                console.log('redirectUrl:', data.redirectUrl);
                
                if (data.report) {
                    console.log('\n🗂️ CAMPOS NO REPORT:');
                    console.log('report.overallScore:', data.report.overallScore);
                    console.log('report.analysis:', data.report.analysis ? 'Present' : 'Missing');
                }
                
            } catch (parseError) {
                console.log('\n❌ ERRO DE PARSE:', parseError.message);
                console.log('Tentando encontrar problema na string...');
                
                // Tenta encontrar onde está o problema
                const lines = text.split('\n');
                console.log('Linhas encontradas:', lines.length);
                lines.forEach((line, i) => {
                    if (line.includes('score') || line.includes('saved')) {
                        console.log(`Linha ${i}:`, line);
                    }
                });
            }
        }
        
    } catch (error) {
        console.log('\n💥 ERRO:', error.message);
    }
}

debugResponseComplete();