const { OpenAI } = require('openai');

// Configuração do OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { answers, projectType, userLevel } = JSON.parse(event.body);

    if (!answers || !Array.isArray(answers)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid answers array' })
      };
    }

    console.log(`🔍 Analyzing ${answers.length} individual responses...`);

    // Determinar tipo de projeto baseado na primeira resposta
    const firstAnswer = answers[0]?.user_response || '';
    const detectedProjectType = detectProjectType(firstAnswer);
    const finalProjectType = projectType || detectedProjectType;

    // Analisar cada resposta individualmente
    const individualAnalyses = [];
    
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      console.log(`📝 Analyzing question ${i + 1}...`);
      
      try {
        const analysis = await analyzeIndividualResponse(answer, i + 1, finalProjectType, userLevel);
        individualAnalyses.push({
          questionNumber: i + 1,
          question: answer.question_text,
          userResponse: answer.user_response,
          analysis: analysis,
          score: extractScore(analysis),
          feedback: extractFeedback(analysis)
        });
      } catch (error) {
        console.error(`Error analyzing question ${i + 1}:`, error);
        // Fallback analysis
        individualAnalyses.push({
          questionNumber: i + 1,
          question: answer.question_text,
          userResponse: answer.user_response,
          analysis: generateFallbackAnalysis(answer, finalProjectType),
          score: 70, // Neutral score
          feedback: "Resposta adequada. Continue desenvolvendo este aspecto do seu projeto."
        });
      }
    }

    // Gerar sugestões de estudo baseadas no projeto
    const studySuggestions = await generateStudySuggestions(finalProjectType, individualAnalyses);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        individualAnalyses,
        studySuggestions,
        projectType: finalProjectType,
        overallInsights: generateOverallInsights(individualAnalyses)
      })
    };

  } catch (error) {
    console.error('❌ Error in individual analysis:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to analyze individual responses',
        details: error.message 
      })
    };
  }
};

async function analyzeIndividualResponse(answer, questionNumber, projectType, userLevel) {
  const prompt = `Como expert em Web3 e ${projectType}, analise esta resposta individual do usuário:

PERGUNTA ${questionNumber}: ${answer.question_text}

RESPOSTA DO USUÁRIO: ${answer.user_response}

CONTEXTO:
- Tipo de projeto: ${projectType}
- Nível do usuário: ${userLevel || 'intermediate'}
- Questão número: ${questionNumber}

ANALISE E FORNEÇA:

1. QUALIDADE DA RESPOSTA (0-100):
Avalie a profundidade, conhecimento técnico demonstrado e relevância.

2. PONTOS FORTES:
- Identifique aspectos específicos bem demonstrados
- Cite trechos da resposta que mostram conhecimento
- Explique por que estes pontos são valiosos

3. ÁREAS DE MELHORIA:
- Identifique lacunas específicas ou conceitos não mencionados
- Sugira conhecimentos que poderiam ser adicionados
- Explique a importância destes aspectos

4. FEEDBACK PERSONALIZADO:
${answer.user_response.length > 100 ? 
  "Dê um feedback detalhado, reconhecendo o esforço e orientando melhorias específicas." :
  "A resposta foi breve. Oriente sobre como expandir e aprofundar o conhecimento."}

5. SUGESTÃO DE AÇÃO:
Uma ação concreta que o usuário pode tomar para melhorar neste aspecto.

Seja encorajador mas honesto. Forneça feedback que realmente ajude o usuário a crescer.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

async function generateStudySuggestions(projectType, analyses) {
  // Identificar áreas que mais precisam de melhoria
  const weakAreas = analyses
    .filter(a => a.score < 70)
    .map(a => a.questionNumber);

  const prompt = `Baseado em uma análise de projeto ${projectType}, gere sugestões de estudo personalizadas:

ÁREAS QUE PRECISAM DE ATENÇÃO: Questões ${weakAreas.join(', ')}
TIPO DE PROJETO: ${projectType}

Gere 5-7 sugestões de estudo específicas para este tipo de projeto, incluindo:

1. RECURSOS TÉCNICOS:
- Documentações oficiais relevantes
- Tutoriais específicos para ${projectType}
- Ferramentas essenciais

2. CURSOS E CERTIFICAÇÕES:
- Cursos online recomendados
- Certificações que agregam valor
- Bootcamps especializados

3. PRÁTICA HANDS-ON:
- Projetos para construir
- Challenges e hackathons
- Repositórios para estudar

4. COMUNIDADE E NETWORKING:
- Comunidades específicas de ${projectType}
- Eventos e conferências
- Fóruns de discussão

5. READING LIST:
- Livros essenciais
- Whitepapers importantes
- Blogs e newsletters

Seja específico para ${projectType} e prático na aplicação.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating study suggestions:', error);
    return generateFallbackStudySuggestions(projectType);
  }
}

function detectProjectType(firstAnswer) {
  const answer = firstAnswer.toLowerCase();
  
  if (answer.includes('defi') || answer.includes('liquidity') || answer.includes('yield') || answer.includes('lending')) {
    return 'DeFi';
  } else if (answer.includes('game') || answer.includes('nft') || answer.includes('metaverse') || answer.includes('gaming')) {
    return 'GameFi/NFT';
  } else if (answer.includes('dapp') || answer.includes('application')) {
    return 'dApp';
  } else if (answer.includes('dao') || answer.includes('governance')) {
    return 'DAO';
  } else {
    return 'Web3 General';
  }
}

function extractScore(analysis) {
  // Extrair score da análise (0-100)
  const scoreMatch = analysis.match(/(?:QUALIDADE|SCORE|PONTUAÇÃO).*?(\d{1,3})/i);
  if (scoreMatch) {
    return Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
  }
  return 75; // Score padrão
}

function extractFeedback(analysis) {
  // Extrair feedback personalizado
  const feedbackMatch = analysis.match(/(?:FEEDBACK PERSONALIZADO|FEEDBACK):(.*?)(?:\n\d+\.|$)/is);
  if (feedbackMatch) {
    return feedbackMatch[1].trim();
  }
  return "Continue desenvolvendo seus conhecimentos nesta área.";
}

function generateFallbackAnalysis(answer, projectType) {
  return `QUALIDADE DA RESPOSTA: 70

PONTOS FORTES:
Demonstra interesse e engajamento com o tema de ${projectType}. A resposta mostra compreensão básica dos conceitos.

ÁREAS DE MELHORIA:
Recomendo aprofundar conhecimentos técnicos específicos de ${projectType} e explorar cases de sucesso na área.

FEEDBACK PERSONALIZADO:
Sua resposta demonstra potencial. Para evoluir, sugiro estudar mais sobre as nuances técnicas e práticas de ${projectType}.

SUGESTÃO DE AÇÃO:
Dedique 30 minutos diários para ler documentação oficial e acompanhar projetos de referência em ${projectType}.`;
}

function generateFallbackStudySuggestions(projectType) {
  const suggestions = {
    'DeFi': `
RECURSOS TÉCNICOS:
- Uniswap Documentation e Compound Protocol
- OpenZeppelin Smart Contract Library
- DeFiPulse para acompanhar protocolos

CURSOS:
- DeFi Developer Roadmap (GitHub)
- Consensys Academy DeFi Course
- Chainlink Developer Bootcamp

PRÁTICA:
- Construir um AMM simples
- Participar de hackathons DeFi
- Estudar código do Aave e Compound`,

    'GameFi/NFT': `
RECURSOS TÉCNICOS:
- OpenSea API Documentation
- Unity Web3 Integration
- Moralis NFT API

CURSOS:
- NFT Development Course (Moralis)
- Blockchain Game Development
- Smart Contract for Games

PRÁTICA:
- Criar uma coleção NFT
- Desenvolver jogo Web3 simples
- Estudar Axie Infinity e The Sandbox`,

    'dApp': `
RECURSOS TÉCNICOS:
- Web3.js e Ethers.js Documentation
- MetaMask Developer Docs
- IPFS Documentation

CURSOS:
- Full Stack Web3 Development
- React + Blockchain Integration
- Smart Contract + Frontend

PRÁTICA:
- Construir dApp completo
- Integrar carteiras Web3
- Deploy em testnet`,
  };

  return suggestions[projectType] || suggestions['dApp'];
}

function generateOverallInsights(analyses) {
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
  const strongAreas = analyses.filter(a => a.score >= 80).length;
  const weakAreas = analyses.filter(a => a.score < 60).length;

  return {
    averageScore: Math.round(avgScore),
    strongAreasCount: strongAreas,
    weakAreasCount: weakAreas,
    totalQuestions: analyses.length,
    performance: avgScore >= 80 ? 'Excelente' : avgScore >= 70 ? 'Bom' : avgScore >= 60 ? 'Satisfatório' : 'Precisa Melhorar'
  };
}