// Função de teste para simular conclusão de módulos e testar burn
// Cole este código no console do navegador (F12)

async function testarSistemaBurn() {
  console.log('🧪 INICIANDO TESTE DO SISTEMA DE BURN');
  
  // 1. Simular carteira conectada
  const testAddress = '0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4';
  localStorage.setItem('wallet_address', testAddress);
  console.log('✅ Carteira simulada:', testAddress);
  
  // 2. Simular conclusão de todos os módulos
  const allModules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  localStorage.setItem('completed_modules', JSON.stringify(allModules));
  console.log('✅ Todos os módulos marcados como completos');
  
  // 3. Salvar no servidor
  try {
    for (let i = 1; i <= 10; i++) {
      const response = await fetch('/api/quiz/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: testAddress, moduleId: i })
      });
      const result = await response.json();
      console.log(`📝 Módulo ${i} salvo no servidor:`, result);
    }
    
    console.log('✅ Progresso sincronizado com o servidor');
    
    // 4. Recarregar a página para ver o BurnBadge
    console.log('🔄 Recarregue a página /quiz para ver o botão de burn ativado!');
    console.log('');
    console.log('📋 INSTRUÇÕES:');
    console.log('1. Vá para http://localhost:3000/quiz');
    console.log('2. Você deve ver o progresso 10/10 módulos');
    console.log('3. O botão "Execute Burn" deve estar ativado');
    console.log('4. Clique para queimar 10.000 tokens CTD');
    console.log('5. Após o primeiro burn, tentativas adicionais mostrarão erro');
    
  } catch (error) {
    console.error('❌ Erro ao salvar no servidor:', error);
  }
}

// Para resetar e testar novamente
function resetarTeste() {
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('completed_modules');
  console.log('🗑️ Cache local limpo. Recarregue a página.');
}

console.log('');
console.log('🎯 FUNÇÕES DE TESTE DISPONÍVEIS:');
console.log('- testarSistemaBurn()  // Simula conclusão e testa burn');
console.log('- resetarTeste()       // Limpa dados para novo teste');
console.log('');
console.log('Execute: testarSistemaBurn()');