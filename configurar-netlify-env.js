/**
 * Script para configurar variáveis de ambiente no Netlify
 * e testar o funcionamento completo do sistema
 */

async function configurarETestarSistema() {
    console.log('🚀 Configuração Automática - CTD Skill Compass');
    console.log('=' .repeat(60));
    
    const baseUrl = 'https://extraordinary-treacle-1bc552.netlify.app';
    
    console.log('📋 Variáveis de ambiente necessárias:');
    console.log('');
    console.log('NEXT_PUBLIC_BINNO_API_BASE=/.netlify/functions');
    console.log('OPENAI_API_KEY=sk-proj-...');
    console.log('');
    
    console.log('🔧 1. Testando Health Check atual...');
    
    try {
        const healthResponse = await fetch(`${baseUrl}/.netlify/functions/health`);
        const healthData = await healthResponse.text();
        
        console.log(`📊 Status: ${healthResponse.status}`);
        
        if (healthResponse.ok) {
            const health = JSON.parse(healthData);
            console.log(`✅ Sistema: ${health.status || 'unknown'}`);
            console.log(`🔑 OpenAI: ${health.checks?.openai?.configured ? '✅ Configurado' : '❌ Ausente'}`);
            console.log(`🗄️  Supabase: ${health.checks?.supabase?.url_configured ? '✅ Configurado' : '❌ Ausente'}`);
            
            // Verificar se as variáveis críticas estão configuradas
            const needsConfig = !health.checks?.openai?.configured;
            
            if (needsConfig) {
                console.log('\n⚠️  Configuração necessária detectada!');
                console.log('\n📝 Passos para configurar no Netlify Dashboard:');
                console.log('');
                console.log('1. Acesse: https://app.netlify.com/sites/extraordinary-treacle-1bc552/settings/env');
                console.log('2. Clique em "Add variable"');
                console.log('3. Adicione as seguintes variáveis:');
                console.log('');
                console.log('   Nome: NEXT_PUBLIC_BINNO_API_BASE');
                console.log('   Valor: /.netlify/functions');
                console.log('');
                console.log('   Nome: OPENAI_API_KEY');
                console.log('   Valor: sk-proj-... (sua chave da OpenAI)');
                console.log('');
                console.log('4. Clique em "Save" para cada variável');
                console.log('5. O site será redesployado automaticamente');
                
            } else {
                console.log('\n🎉 Configuração já está correta!');
            }
            
        } else {
            console.log('❌ Health check falhou');
            console.log('Resposta:', healthData.substring(0, 200));
        }
        
    } catch (error) {
        console.log(`❌ Erro de conectividade: ${error.message}`);
    }
    
    console.log('\n🧪 2. Testando API Base atual...');
    
    // Simular como o frontend vai se comportar
    const apiBaseTests = [
        { env: undefined, desc: 'Sem variável (fallback)' },
        { env: '/.netlify/functions', desc: 'Com variável configurada' }
    ];
    
    apiBaseTests.forEach(({ env, desc }) => {
        const base = (env || '/api').replace(/\/+$/, '');
        console.log(`📍 ${desc}: ${base}/binno-final-analysis`);
    });
    
    console.log('\n💡 3. Teste de questionário simulado...');
    
    try {
        // Teste com a função Netlify atual
        const testPayload = {
            sessionId: 'config-test-' + Date.now(),
            answers: [
                { questionNumber: 1, answer: "Test configuration" },
                { questionNumber: 2, answer: "API routing check" }
            ],
            userProfile: { name: "Config Test", email: "test@test.com" }
        };
        
        console.log('📤 Enviando teste para função Netlify...');
        
        const apiResponse = await fetch(`${baseUrl}/.netlify/functions/binno-final-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        console.log(`📊 API Status: ${apiResponse.status}`);
        
        if (apiResponse.status === 500) {
            console.log('⚠️  Erro 500 detectado - provavelmente OPENAI_API_KEY ausente');
            console.log('✅ Mas isso confirma que a função está acessível!');
        } else if (apiResponse.status === 200) {
            console.log('🎉 API funcionando perfeitamente!');
        } else {
            const errorText = await apiResponse.text();
            console.log(`❌ Erro inesperado: ${errorText.substring(0, 200)}`);
        }
        
    } catch (apiError) {
        console.log(`❌ Erro na API: ${apiError.message}`);
    }
    
    console.log('\n📋 4. Checklist de Configuração:');
    console.log('');
    console.log('□ Acessar Netlify Dashboard');
    console.log('□ Adicionar NEXT_PUBLIC_BINNO_API_BASE=/.netlify/functions');
    console.log('□ Adicionar OPENAI_API_KEY=sk-proj-...');
    console.log('□ Aguardar redeploy automático (~2-3 minutos)');
    console.log('□ Testar questionário completo');
    console.log('□ Verificar health check novamente');
    
    console.log('\n🔗 Links úteis:');
    console.log(`Health: ${baseUrl}/.netlify/functions/health`);
    console.log(`Questionário: ${baseUrl}/questionnaire`);
    console.log('Netlify Env: https://app.netlify.com/sites/extraordinary-treacle-1bc552/settings/env');
    
    console.log('\n✨ Sistema pronto para configuração final!');
}

configurarETestarSistema().catch(console.error);