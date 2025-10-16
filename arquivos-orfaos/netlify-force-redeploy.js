const fs = require('fs');
const path = require('path');

// Força redeploy criando um arquivo temporal e commitando
function forceRedeploy() {
    console.log('🔄 INICIANDO FORÇA REDEPLOY NETLIFY...');
    
    // Criar arquivo temporal com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const forceFile = path.join(__dirname, `force-deploy-${timestamp}.txt`);
    
    try {
        // Criar arquivo temporal
        fs.writeFileSync(forceFile, `Deploy forçado em: ${new Date().toISOString()}\nFormato de resposta corrigido para frontend`);
        console.log(`✅ Arquivo temporal criado: ${forceFile}`);
        
        // Executar comandos git
        const { execSync } = require('child_process');
        
        console.log('📝 Adicionando ao git...');
        execSync('git add .', { stdio: 'inherit' });
        
        console.log('💾 Commitando mudanças...');
        execSync(`git commit -m "force deploy: fix API format compatibility ${timestamp}"`, { stdio: 'inherit' });
        
        console.log('🚀 Fazendo push...');
        execSync('git push', { stdio: 'inherit' });
        
        console.log('🎯 DEPLOY FORÇADO ENVIADO!');
        console.log('⏳ Aguardando propagação (5-10 minutos)...');
        
        // Agendar limpeza do arquivo
        setTimeout(() => {
            try {
                fs.unlinkSync(forceFile);
                console.log('🧹 Arquivo temporal removido');
            } catch (err) {
                console.log('⚠️ Erro ao remover arquivo temporal:', err.message);
            }
        }, 300000); // 5 minutos
        
    } catch (error) {
        console.error('❌ ERRO no force deploy:', error.message);
    }
}

forceRedeploy();