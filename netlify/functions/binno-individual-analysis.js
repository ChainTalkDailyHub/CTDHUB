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
          feedback: "Adequate response. Continue developing this aspect of your project."
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
  const prompt = `As a Web3 and ${projectType} expert, analyze this individual user response:

QUESTION ${questionNumber}: ${answer.question_text}

USER RESPONSE: ${answer.user_response}

CONTEXT:
- Project type: ${projectType}
- User level: ${userLevel || 'intermediate'}
- Question number: ${questionNumber}

ANALYZE AND PROVIDE IN ENGLISH ONLY:

1. RESPONSE QUALITY (0-100):
Evaluate depth, demonstrated technical knowledge, and relevance.

2. STRENGTHS:
- Identify specific well-demonstrated aspects
- Quote excerpts from the response that show knowledge
- Explain why these points are valuable

3. AREAS FOR IMPROVEMENT:
- Identify specific gaps or concepts not mentioned
- Suggest knowledge that could be added
- Explain the importance of these aspects

4. PERSONALIZED FEEDBACK:
${answer.user_response.length > 100 ? 
  "Provide detailed feedback, acknowledging the effort and guiding specific improvements." :
  "The response was brief. Guide on how to expand and deepen the knowledge."}

5. ACTION SUGGESTION:
One concrete action the user can take to improve in this aspect.

Be encouraging but honest. Provide feedback that truly helps the user grow.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

async function generateStudySuggestions(projectType, analyses) {
  // Identify areas that need most improvement
  const weakAreas = analyses
    .filter(a => a.score < 70)
    .map(a => a.questionNumber);

  const prompt = `Based on a ${projectType} project analysis, generate personalized study suggestions:

AREAS NEEDING ATTENTION: Questions ${weakAreas.join(', ')}
PROJECT TYPE: ${projectType}

Generate 5-7 specific study suggestions for this project type, including:

1. TECHNICAL RESOURCES:
- Relevant official documentation
- Specific tutorials for ${projectType}
- Essential tools

2. COURSES AND CERTIFICATIONS:
- Recommended online courses
- Value-adding certifications
- Specialized bootcamps

3. HANDS-ON PRACTICE:
- Projects to build
- Challenges and hackathons
- Repositories to study

4. COMMUNITY AND NETWORKING:
- Specific ${projectType} communities
- Events and conferences
- Discussion forums

5. READING LIST:
- Essential books
- Important whitepapers
- Blogs and newsletters

Be specific to ${projectType} and practical in application. RESPOND IN ENGLISH ONLY.`;

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
  // Extract score from analysis (0-100)
  const scoreMatch = analysis.match(/(?:QUALITY|SCORE|RATING).*?(\d{1,3})/i);
  if (scoreMatch) {
    return Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
  }
  return 75; // Default score
}

function extractFeedback(analysis) {
  // Extract personalized feedback
  const feedbackMatch = analysis.match(/(?:PERSONALIZED FEEDBACK|FEEDBACK):(.*?)(?:\n\d+\.|$)/is);
  if (feedbackMatch) {
    return feedbackMatch[1].trim();
  }
  return "Continue developing your knowledge in this area.";
}

function generateFallbackAnalysis(answer, projectType) {
  return `RESPONSE QUALITY: 70

STRENGTHS:
Shows interest and engagement with ${projectType} topics. The response demonstrates basic understanding of the concepts.

AREAS FOR IMPROVEMENT:
Recommend deepening specific technical knowledge of ${projectType} and exploring success cases in the area.

PERSONALIZED FEEDBACK:
Your response shows potential. To evolve, I suggest studying more about the technical nuances and practices of ${projectType}.

ACTION SUGGESTION:
Dedicate 30 minutes daily to reading official documentation and following reference projects in ${projectType}.`;
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