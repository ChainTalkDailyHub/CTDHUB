#!/usr/bin/env node

// Script para configurar variáveis de ambiente no Netlify
console.log('🚀 CONFIGURAÇÃO DE DEPLOY NETLIFY - CTDHUB');
console.log('=' .repeat(80));

console.log('\n🔐 VARIÁVEIS DE AMBIENTE NECESSÁRIAS:');
console.log('\n1. OPENAI_API_KEY (Obrigatória para BINNO AI):');
console.log('   Descrição: Chave da API OpenAI para análises de IA');
console.log('   Valor: sk-proj-... (sua chave OpenAI)');
console.log('   Segurança: CRÍTICA - mantém análises funcionando');

console.log('\n2. BURN_AMOUNT (Sistema de Queima):');
console.log('   Descrição: Quantidade de tokens a queimar por usuário');
console.log('   Valor: 1000');
console.log('   Segurança: IMPORTANTE - controla quantidade queimada');

console.log('\n3. BSC_RPC_URL (Blockchain BSC):');
console.log('   Descrição: URL do nó RPC da Binance Smart Chain');
console.log('   Valor: https://bsc-dataseed1.binance.org/');
console.log('   Segurança: MÉDIA - acesso à blockchain');

console.log('\n4. TREASURY_PRIVATE_KEY (Carteira Treasury):');
console.log('   Descrição: Chave privada da carteira que executa burns');
console.log('   Valor: 0x... (chave privada da carteira treasury)');
console.log('   Segurança: CRÍTICA - controla fundos');

console.log('\n5. CTD_TOKEN_ADDRESS (Contrato CTD):');
console.log('   Descrição: Endereço do contrato do token CTD na BSC');
console.log('   Valor: 0x... (endereço do contrato)');
console.log('   Segurança: IMPORTANTE - define qual token queimar');

console.log('\n📋 PASSO A PASSO PARA CONFIGURAR NO NETLIFY:');
console.log('\n1. Acesse https://app.netlify.com/');
console.log('2. Vá para seu site CTDHUB');
console.log('3. Site settings → Environment variables');
console.log('4. Add variable para cada uma acima');
console.log('5. Deploy triggers → Clear cache and deploy site');

console.log('\n🛡️  CONFIGURAÇÕES DE SEGURANÇA RECOMENDADAS:');

const securityConfig = {
  OPENAI_API_KEY: {
    required: true,
    secret: true,
    description: 'Chave OpenAI para BINNO AI - sem ela o sistema falha',
    example: 'sk-proj-...',
    risk: 'ALTO - sem esta chave, análises de IA não funcionam'
  },
  BURN_AMOUNT: {
    required: true,
    secret: false,
    description: 'Quantidade de tokens CTD a queimar por usuário',
    example: '1000',
    risk: 'MÉDIO - controla economia do token'
  },
  BSC_RPC_URL: {
    required: true,
    secret: false,
    description: 'URL do nó BSC para transações',
    example: 'https://bsc-dataseed1.binance.org/',
    risk: 'BAIXO - URL pública'
  },
  TREASURY_PRIVATE_KEY: {
    required: true,
    secret: true,
    description: 'Chave privada da carteira treasury para burns',
    example: '0x...',
    risk: 'CRÍTICO - acesso total aos fundos'
  },
  CTD_TOKEN_ADDRESS: {
    required: true,
    secret: false,
    description: 'Endereço do contrato CTD Token',
    example: '0x...',
    risk: 'BAIXO - endereço público'
  }
};

console.log('\n📊 DETALHES DAS VARIÁVEIS:');
Object.entries(securityConfig).forEach(([key, config]) => {
  console.log(`\n${key}:`);
  console.log(`   Obrigatória: ${config.required ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`   Secreta: ${config.secret ? '🔒 SIM' : '🔓 NÃO'}`);
  console.log(`   Descrição: ${config.description}`);
  console.log(`   Exemplo: ${config.example}`);
  console.log(`   Risco: ${config.risk}`);
});

console.log('\n⚠️  AVISOS DE SEGURANÇA:');
console.log('\n🔴 TREASURY_PRIVATE_KEY:');
console.log('   - NUNCA compartilhe esta chave');
console.log('   - Use carteira dedicada apenas para burns');
console.log('   - Mantenha saldo mínimo necessário');
console.log('   - Monitore transações regularmente');

console.log('\n🟡 OPENAI_API_KEY:');
console.log('   - Configure limites de uso na OpenAI');
console.log('   - Monitore custos regularmente');
console.log('   - Use apenas para CTDHUB');

console.log('\n🟢 CONFIGURAÇÃO MÍNIMA PARA TESTE:');
console.log('   Para testar o sistema, você precisa pelo menos:');
console.log('   - OPENAI_API_KEY (para análises funcionarem)');
console.log('   - BURN_AMOUNT=1000 (para quantidade correta)');

console.log('\n🎯 COMANDO PARA DEPLOY MANUAL:');
console.log('   git add . && git commit -m "deploy: ready for production" && git push');
console.log('   O Netlify detectará automaticamente e fará o deploy');

console.log('\n🔍 VERIFICAÇÃO PÓS-DEPLOY:');
console.log('   1. Teste o BINNO AI: https://seu-site.netlify.app/binno-ai');
console.log('   2. Teste análise: https://seu-site.netlify.app/questionnaire');
console.log('   3. Teste quiz: https://seu-site.netlify.app/quiz');
console.log('   4. Teste burn: Complete todos os módulos');

console.log('\n📱 URLs DE TESTE:');
console.log('   - Skill Compass: /.netlify/functions/binno-generate-question');
console.log('   - Análise Final: /.netlify/functions/binno-final-analysis');
console.log('   - Quiz Progress: /.netlify/functions/quiz-progress');
console.log('   - Burn System: /.netlify/functions/burn-on-completion');

console.log('\n' + '='.repeat(80));
console.log('✅ CONFIGURAÇÃO COMPLETA PARA DEPLOY SEGURO');
console.log('🔗 Configure as variáveis no Netlify e faça o deploy!');
console.log('=' .repeat(80));