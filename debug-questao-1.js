// Teste específico para debug do erro na questão 1
const axios = require('axios');

const BASE_URL = 'https://extraordinary-treacle-1bc553.netlify.app';

async function testQuestion1Generation() {
  console.log('🔍 Testando geração da questão 1...\n');

  try {
    // Simular o que acontece quando usuário responde questão 1
    const requestData = {
      questionNumber: 2, // Próxima questão após responder a 1
      previousAnswers: [
        {
          question_id: 'q1_project_intro',
          question_text: 'Tell me about your Web3 project...',
          user_response: 'Meu projeto é uma exchange descentralizada na BNB Chain...',
          timestamp: Date.now()
        }
      ],
      sessionContext: {
        user_expertise_level: 'intermediate',
        project_focus: 'DeFi exchange project on BNB Chain',
        previous_responses_summary: 'DeFi exchange project'
      }
    };

    console.log('📤 Enviando dados para geração da questão 2...');
    console.log('Request:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(`${BASE_URL}/.netlify/functions/binno-generate-question`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos timeout
    });

    console.log('✅ Geração de questão bem-sucedida!');
    console.log('Status:', response.status);
    console.log('Questão gerada:', response.data.question.question_text.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ Erro na geração da questão:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Timeout/Network Error:', error.message);
    } else {
      console.error('Setup Error:', error.message);
    }
  }
}

async function testBasicHealth() {
  console.log('🏥 Testando saúde básica das funções...\n');
  
  try {
    // Teste da função de health
    const healthResponse = await axios.get(`${BASE_URL}/.netlify/functions/health`);
    console.log('✅ Health check:', healthResponse.status === 200 ? 'OK' : 'FAIL');
    
    // Teste da página principal
    const pageResponse = await axios.get(`${BASE_URL}/questionnaire`);
    console.log('✅ Página questionnaire:', pageResponse.status === 200 ? 'OK' : 'FAIL');
    
  } catch (error) {
    console.error('❌ Erro no teste básico:', error.message);
  }
}

async function runDebugTests() {
  console.log('🐛 DEBUG: Investigando erro na questão 1\n');
  console.log('🌐 URL:', BASE_URL);
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('═'.repeat(50));

  await testBasicHealth();
  console.log('');
  await testQuestion1Generation();

  console.log('\n═'.repeat(50));
  console.log('🔧 POSSÍVEIS CAUSAS DO ERRO:');
  console.log('1. Timeout na função de geração de questões');
  console.log('2. Erro na API do OpenAI');
  console.log('3. Problema na validação de dados');
  console.log('4. Limite de tokens excedido');
  console.log('5. Erro de CORS ou headers');
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('- Verificar logs do Netlify');
  console.log('- Reduzir timeout da função');
  console.log('- Adicionar fallback para questões predefinidas');
  console.log('- Melhorar tratamento de erros no frontend');
}

runDebugTests().catch(console.error);