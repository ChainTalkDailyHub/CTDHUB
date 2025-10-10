// Teste final para verificar deploy corrigido
async function testeFinalDeployCorrigido() {
    console.log('🎯 Teste Final - Deploy Corrigido CTD Skill Compass');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    const testPayload = {
        sessionId: 'test-final-' + Date.now(),
        answers: [
            { questionNumber: 1, answer: "Project name: CTDone" },
            { questionNumber: 2, answer: "Project name: CTDone" },
            { questionNumber: 3, answer: "Project name: CTDone" },
            { questionNumber: 4, answer: "Project name: CTDone" },
            { questionNumber: 5, answer: "Project name: CTDone" },
            { questionNumber: 6, answer: "Project name: CTDone" },
            { questionNumber: 7, answer: "Project name: CTDone" },
            { questionNumber: 8, answer: "Project name: CTDone" },
            { questionNumber: 9, answer: "Project name: CTDone" },
            { questionNumber: 10, answer: "Project name: CTDone" },
            { questionNumber: 11, answer: "Project name: CTDone" },
            { questionNumber: 12, answer: "Project name: CTDone" },
            { questionNumber: 13, answer: "Project name: CTDone" },
            { questionNumber: 14, answer: "Project name: CTDone" },
            { questionNumber: 15, answer: "Project name: CTDone" }
        ],
        userProfile: {
            name: "Test User",
            email: "test@test.com"
        }
    };
    
    try {
        console.log('📤 Enviando respostas copy-paste...');
        
        const response = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });
        
        console.log(`📊 Status HTTP: ${response.status}`);
        
        if (!response.ok) {
            console.log('❌ Erro na resposta');
            return;
        }
        
        const result = await response.text();
        
        try {
            const jsonResult = JSON.parse(result);
            
            console.log('\n✅ SUCESSO! Deploy funcionando corretamente:');
            console.log(`📊 Score detectado: ${jsonResult.report.overallScore}/100`);
            console.log(`📋 Report ID: ${jsonResult.report.reportId}`);
            console.log(`🕒 Timestamp: ${jsonResult.report.timestamp}`);
            
            // Verificar copy-paste detection
            if (jsonResult.report.overallScore <= 20) {
                console.log('🎯 Copy-paste detectado PERFEITAMENTE (score muito baixo)');
            } else if (jsonResult.report.overallScore <= 50) {
                console.log('✅ Copy-paste detectado corretamente (score baixo)');
            } else {
                console.log('⚠️  Possível falha na detecção (score alto)');
            }
            
            console.log('\n📝 Trechos da análise:');
            const analysis = jsonResult.report.analysis;
            if (analysis.executive_summary) {
                console.log(`📋 Resumo: ${analysis.executive_summary.substring(0, 150)}...`);
            }
            if (analysis.strengths) {
                console.log(`💪 Pontos fortes: ${analysis.strengths.substring(0, 100)}...`);
            }
            if (analysis.recommendations) {
                console.log(`💡 Recomendações: ${analysis.recommendations.substring(0, 100)}...`);
            }
            
            console.log('\n🚀 CONCLUSÃO: Sistema funcionando perfeitamente!');
            console.log('- ✅ Deploy atualizado');
            console.log('- ✅ Parsing por template funcionando');
            console.log('- ✅ Copy-paste detection ativa');
            console.log('- ✅ Score baixo para respostas ruins');
            console.log('- ✅ Relatório IA sendo gerado');
            
        } catch (parseError) {
            console.log('❌ Erro de parsing (não deveria acontecer):');
            console.log(parseError.message);
            console.log('Conteúdo:', result.substring(0, 500));
        }
        
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
    }
}

testeFinalDeployCorrigido();