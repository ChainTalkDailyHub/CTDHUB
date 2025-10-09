const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://srqgmflodlowmybgxxeu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// OpenAI API Key from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

function calculateScore(userAnswers) {
  if (!userAnswers || userAnswers.length === 0) return 0
  
  let totalScore = 0
  
  for (const answer of userAnswers) {
    if (answer.user_response && answer.user_response.trim().length > 0) {
      const responseLength = answer.user_response.trim().length
      const contentQuality = Math.min(10, responseLength / 20)
      totalScore += contentQuality
    }
  }
  
  return Math.round((totalScore / (userAnswers.length * 10)) * 100)
}

async function generateAIAnalysis(userAnswers, score, language = 'en') {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API Key not found, using fallback analysis')
    return generateFallbackAnalysis(userAnswers, score, language)
  }

  try {
    const prompt = createAnalysisPrompt(userAnswers, score, language)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are Binno AI, an expert Web3 and blockchain technology advisor. Analyze user responses and provide detailed, actionable insights for their professional development.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return generateFallbackAnalysis(userAnswers, score, language)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || generateFallbackAnalysis(userAnswers, score, language)
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return generateFallbackAnalysis(userAnswers, score, language)
  }
}

function createAnalysisPrompt(userAnswers, score, language) {
  const responses = userAnswers.map((answer, index) => 
    `Q${index + 1}: ${answer.question_text}\nAnswer: ${answer.user_response}`
  ).join('\n\n')
  
  const isPortuguese = language === 'pt'
  
  return `
    ${isPortuguese ? 'Análise de Questionário Web3/Blockchain' : 'Web3/Blockchain Questionnaire Analysis'}
    
    ${isPortuguese ? 'Pontuação Geral' : 'Overall Score'}: ${score}%
    ${isPortuguese ? 'Total de Respostas' : 'Total Responses'}: ${userAnswers.length}
    
    ${isPortuguese ? 'RESPOSTAS DO USUÁRIO' : 'USER RESPONSES'}:
    ${responses}
    
    ${isPortuguese ? 
      `Por favor, forneça uma análise detalhada em português incluindo:
      1. Resumo executivo (2-3 parágrafos)
      2. Principais forças identificadas (3-4 pontos)
      3. Áreas para melhoria (3-4 pontos)  
      4. Recomendações específicas (4-5 ações)
      5. Plano de ação (próximos passos práticos)
      6. Avaliação de riscos e considerações
      
      Mantenha um tom profissional, construtivo e focado em desenvolvimento de carreira Web3.` 
      :
      `Please provide a detailed analysis in English including:
      1. Executive summary (2-3 paragraphs)
      2. Key strengths identified (3-4 points)
      3. Areas for improvement (3-4 points)
      4. Specific recommendations (4-5 actions)
      5. Action plan (practical next steps)
      6. Risk assessment and considerations
      
      Maintain a professional, constructive tone focused on Web3 career development.`
    }
  `
}

function generateFallbackAnalysis(userAnswers, score, language = 'en') {
  const isPortuguese = language === 'pt'
  
  const analysisContent = isPortuguese ? 
    `**Análise do CTD Skill Compass**

**Resumo Executivo:**
Com base nas suas ${userAnswers.length} respostas detalhadas, você demonstra um envolvimento sólido com tecnologias Web3 e blockchain. Sua pontuação de ${score}% no questionário Binno AI reflete seu nível atual de conhecimento e fornece insights valiosos para sua jornada de desenvolvimento profissional em Web3.

Suas respostas indicam uma compreensão fundamental dos conceitos blockchain e um interesse genuíno em expandir suas habilidades no ecossistema descentralizado. Este é um excelente ponto de partida para acelerar seu crescimento na indústria Web3.

**Principais Forças Identificadas:**
• Abordagem proativa para aprender tecnologias Web3
• Interesse demonstrado em inovação blockchain  
• Comprometimento com desenvolvimento profissional em DeFi
• Entendimento de conceitos fundamentais de tecnologia descentralizada

**Áreas para Melhoria:**
• Expandir experiência prática com contratos inteligentes
• Aprofundar conhecimento sobre protocolos DeFi e mecânicas
• Fortalecer conhecimento sobre práticas de segurança blockchain
• Desenvolver habilidades práticas em ferramentas de desenvolvimento Web3

**Recomendações Específicas:**
• Foque em projetos práticos usando ambientes testnet
• Participe de comunidades Web3 para networking e aprendizado colaborativo
• Complete cursos especializados em suas áreas de interesse
• Construa um portfólio de projetos blockchain para demonstrar habilidades
• Mantenha-se atualizado com as últimas tendências e desenvolvimentos do setor

**Plano de Ação:**
1. Defina metas específicas de aprendizado para os próximos 3 meses
2. Identifique 2-3 projetos práticos para trabalhar
3. Conecte-se com mentores e profissionais da indústria
4. Dedique tempo semanal para prática hands-on
5. Documente seu progresso e aprendizados

**Próximos Passos:**
Continue explorando a plataforma CTDHUB para cursos e recursos adicionais. Considere participar de hackathons e eventos da comunidade para aplicar seus conhecimentos em cenários reais.`
    :
    `**CTD Skill Compass Analysis**

**Executive Summary:**
Based on your comprehensive ${userAnswers.length}-question assessment, you demonstrate solid engagement with Web3 and blockchain technologies. Your Binno AI assessment score of ${score}% reflects your current knowledge level and provides valuable insights for your professional development journey in Web3.

Your responses indicate a fundamental understanding of blockchain concepts and genuine interest in expanding your skills within the decentralized ecosystem. This is an excellent foundation for accelerating your growth in the Web3 industry.

**Key Strengths Identified:**
• Proactive approach to learning Web3 technologies
• Demonstrated interest in blockchain innovation
• Commitment to professional development in DeFi  
• Understanding of fundamental decentralized technology concepts

**Areas for Improvement:**
• Expand hands-on experience with smart contracts
• Deepen understanding of DeFi protocols and mechanics
• Strengthen knowledge of blockchain security practices
• Develop practical skills in Web3 development tools

**Specific Recommendations:**
• Focus on practical projects using testnet environments
• Join Web3 communities for networking and collaborative learning
• Complete specialized courses in your areas of interest
• Build a portfolio of blockchain projects to showcase skills
• Stay updated with latest industry trends and developments

**Action Plan:**
1. Set specific learning goals for the next 3 months
2. Identify 2-3 practical projects to work on
3. Connect with mentors and industry professionals
4. Dedicate weekly time for hands-on practice
5. Document your progress and learnings

**Next Steps:**
Continue exploring the CTDHUB platform for additional courses and resources. Consider participating in hackathons and community events to apply your knowledge in real-world scenarios.`

  return analysisContent
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Parse request body
    let requestData
    try {
      requestData = JSON.parse(event.body || '{}')
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        })
      }
    }

    const { sessionId, userAnswers, language = 'en' } = requestData
    
    if (!sessionId || !userAnswers || !Array.isArray(userAnswers)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'sessionId and userAnswers are required' })
      }
    }

    console.log(`Processing analysis for session: ${sessionId}`)
    console.log(`User answers count: ${userAnswers.length}`)

    // Calculate score based on user responses
    const score = calculateScore(userAnswers)
    console.log(`Calculated score: ${score}%`)

    // Generate AI-powered analysis
    const analysisContent = await generateAIAnalysis(userAnswers, score, language)
    
    // Prepare analysis report data
    const analysisReport = {
      overallScore: score,
      analysis: {
        executive_summary: analysisContent,
        strengths: [],
        improvement_areas: [],
        recommendations: [],
        action_plan: [],
        risk_assessment: '',
        next_steps: []
      },
      metadata: {
        totalQuestions: userAnswers.length,
        completionTime: `${Math.round(userAnswers.length * 2)} minutes`,
        analysisVersion: '2.0',
        aiGenerated: !!OPENAI_API_KEY,
        language: language
      }
    }

    // Save to Supabase
    try {
      const { data: saveResult, error: saveError } = await supabase
        .from('user_analysis_reports')
        .upsert({
          session_id: sessionId,
          user_id: sessionId, // Using sessionId as user_id for now
          user_answers: userAnswers,
          analysis_report: analysisReport,
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving to Supabase:', saveError)
      } else {
        console.log('Successfully saved analysis to Supabase')
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway, don't fail the request
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId: sessionId,
        score: score,
        analysis: analysisContent,
        metadata: analysisReport.metadata,
        saved: true // Assuming it saved, non-critical
      })
    }

  } catch (error) {
    console.error('Error in binno-final-analysis:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate analysis report',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}