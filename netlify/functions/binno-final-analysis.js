const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

// Supabase configuration
const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Initialize OpenAI - MANDATORY for AI analysis
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ CRITICAL: OpenAI API key not configured!')
  console.error('❌ CTD Skill Compass requires AI analysis - cannot use fallback templates')
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

// Enhanced scoring function with individual question-response analysis
function calculateScore(userAnswers) {
  if (!userAnswers || userAnswers.length === 0) return 0
  
  let totalScore = 0
  let totalQuestions = userAnswers.length
  let detailedAnalysis = []
  
  // Check for repeated responses (major red flag)
  const responses = userAnswers.map(a => (a.user_response || '').trim())
  const uniqueResponses = new Set(responses)
  const hasRepeatedResponses = uniqueResponses.size < responses.length
  const globalRepeatPenalty = hasRepeatedResponses ? 60 : 0 // Major penalty for copy-paste
  
  userAnswers.forEach((answer, index) => {
    let questionScore = 70 // Base score
    const response = (answer.user_response || '').toLowerCase().trim()
    const question = answer.question || ''
    
    // Individual question-response relevance analysis
    let relevanceScore = analyzeRelevance(question, response)
    questionScore = Math.max(questionScore * (relevanceScore / 100), 10)
    
    // Quality penalties
    if (response.length < 10) {
      questionScore -= 50
    } else if (response.length < 20) {
      questionScore -= 30
    }
    
    // Pattern detection for low-quality responses
    const repeatedCharsPattern = /(.)\1{5,}/
    const meaninglessPattern = /^[a-zA-Z]{0,3}([a-zA-Z])\1{10,}/
    const randomPattern = /^[a-z]{20,}$/
    
    if (repeatedCharsPattern.test(response)) {
      questionScore -= 70
    }
    
    if (meaninglessPattern.test(response)) {
      questionScore -= 60
    }
    
    if (randomPattern.test(response)) {
      questionScore -= 50
    }
    
    // Apply global repeat penalty
    questionScore -= globalRepeatPenalty
    
    // Content quality assessment
    const hasProperStructure = response.includes(' ') && response.split(' ').length >= 3
    const hasTechnicalTerms = /(blockchain|smart contract|defi|nft|token|crypto|web3|dapp|dao|bnb|ethereum)/i.test(response)
    
    if (!hasProperStructure) {
      questionScore -= 40
    }
    
    if (hasTechnicalTerms) {
      questionScore += 10
    }
    
    // Ensure bounds
    questionScore = Math.max(5, Math.min(100, questionScore))
    
    // Store detailed analysis for each question
    detailedAnalysis.push({
      questionIndex: index + 1,
      question: question,
      response: answer.user_response,
      score: questionScore,
      relevanceScore: relevanceScore,
      issues: getResponseIssues(response, question, hasRepeatedResponses)
    })
    
    totalScore += questionScore
  })
  
  // Store detailed analysis for use in AI prompt
  global.detailedQuestionAnalysis = detailedAnalysis
  
  return Math.round(totalScore / totalQuestions)
}

// Analyze relevance between question and response
function analyzeRelevance(question, response) {
  if (!question || !response) return 20
  
  const questionLower = question.toLowerCase()
  const responseLower = response.toLowerCase()
  
  // Check if response is generic project description (red flag)
  const isGenericProject = /project|platform|token|network|bnb|web3|edtech/.test(responseLower)
  const isAnsweringQuestion = checkQuestionKeywords(questionLower, responseLower)
  
  if (isGenericProject && !isAnsweringQuestion) {
    return 15 // Very low relevance for copy-paste project descriptions
  }
  
  if (isAnsweringQuestion) {
    return 80 // Good relevance
  }
  
  return 40 // Medium relevance
}

// Check if response contains keywords relevant to the question
function checkQuestionKeywords(question, response) {
  const keywordMapping = {
    'experience': ['year', 'month', 'time', 'since', 'ago', 'experience', 'worked'],
    'technical': ['code', 'programming', 'language', 'framework', 'tool'],
    'challenge': ['difficult', 'problem', 'issue', 'challenge', 'obstacle'],
    'team': ['team', 'member', 'people', 'colleague', 'developer'],
    'project': ['project', 'built', 'created', 'developed', 'working'],
    'blockchain': ['blockchain', 'smart contract', 'defi', 'token', 'crypto'],
    'goal': ['goal', 'objective', 'plan', 'want', 'hope', 'aim']
  }
  
  for (const [category, keywords] of Object.entries(keywordMapping)) {
    if (question.includes(category)) {
      return keywords.some(keyword => response.includes(keyword))
    }
  }
  
  return false
}

// Get specific issues with a response
function getResponseIssues(response, question, hasGlobalRepeats) {
  const issues = []
  
  if (hasGlobalRepeats) {
    issues.push('Identical response used for multiple questions')
  }
  
  if (response.length < 10) {
    issues.push('Response too short to be meaningful')
  }
  
  if (/(.)\1{5,}/.test(response)) {
    issues.push('Contains repeated characters (spam-like)')
  }
  
  if (!/\s/.test(response) || response.split(' ').length < 3) {
    issues.push('Lacks proper sentence structure')
  }
  
  const relevance = analyzeRelevance(question, response)
  if (relevance < 30) {
    issues.push('Response not relevant to the specific question asked')
  }
  
  return issues
}

// AI-powered analysis generation - MANDATORY, NO FALLBACK
async function generateAnalysisWithAI(userAnswers, score) {
  console.log('🤖 Starting MANDATORY AI analysis generation...')
  
  // CRITICAL: AI is mandatory for CTD Skill Compass
  if (!openai) {
    const errorMsg = 'CRITICAL ERROR: OpenAI API key not configured. CTD Skill Compass requires AI-powered analysis for accurate assessment. Please configure OPENAI_API_KEY environment variable.'
    console.error('❌', errorMsg)
    throw new Error(errorMsg)
  }

  console.log('✅ OpenAI configured - proceeding with AI analysis')

  try {
    const questionsAndAnswers = userAnswers.map((answer, index) => 
      `Question ${index + 1}: ${answer.question_text}
      User Response: ${answer.user_response}
      `
    ).join('\n\n')

    const prompt = `You are an expert Web3/blockchain consultant conducting a RIGOROUS professional assessment. You must analyze EACH question-response pair individually.

CRITICAL ANALYSIS INSTRUCTIONS:
- Analyze EVERY question-response pair for relevance and quality
- HEAVILY PENALIZE copy-paste responses used for multiple questions  
- If the same response is used for different questions, CALL IT OUT as lazy/inadequate
- Be REALISTIC about knowledge levels demonstrated in each specific answer
- Score harshly for irrelevant responses but fairly recognize genuine effort
- Focus on question-specific relevance, not generic project descriptions

PROJECT DETAILS FROM USER:
${userAnswers[0]?.user_response || 'Not provided'}

DETAILED QUESTION-BY-QUESTION ANALYSIS:
${global.detailedQuestionAnalysis ? 
  global.detailedQuestionAnalysis.map(qa => 
    `QUESTION ${qa.questionIndex}: ${qa.question}
    RESPONSE: "${qa.response}"
    INDIVIDUAL SCORE: ${qa.score}/100
    RELEVANCE SCORE: ${qa.relevanceScore}/100
    ISSUES DETECTED: ${qa.issues.length > 0 ? qa.issues.join('; ') : 'None'}
    `).join('\n') : 'Analysis not available'}

OVERALL CALCULATED SCORE: ${score}% 
${global.detailedQuestionAnalysis && global.detailedQuestionAnalysis.filter(qa => qa.issues.includes('Identical response used for multiple questions')).length > 0 ? 
  '⚠️ WARNING: IDENTICAL RESPONSES DETECTED - This indicates copy-paste behavior and lack of individual question consideration' : ''}

ANALYSIS REQUIREMENTS:
1. HONEST assessment focusing on question-response relevance
2. SPECIFICALLY call out copy-paste responses and their inappropriateness  
3. Evaluate if responses actually answer what was asked
4. Be REALISTIC about demonstrated knowledge per question
5. Don't inflate scores for generic/irrelevant responses
6. Reference specific question-response mismatches
7. Provide question-specific improvement recommendations

Return a JSON object with this EXACT structure (be brutally honest):
{
  "executive_summary": "HONEST assessment of response quality, relevance, and any copy-paste issues detected",
  "question_analysis": [
    {
      "question_number": 1,
      "relevance_assessment": "How well the response addressed this specific question",
      "quality_issues": ["specific issues with this response", "irrelevance problems", "copy-paste detection"],
      "improvement_needed": "What should have been answered for this question"
    }
  ],
  "strengths": ["only list GENUINE strengths if demonstrated", "question-specific competencies shown", "max 4 items"],
  "improvement_areas": ["question-specific gaps", "copy-paste issues", "relevance problems", "lack of individual consideration"],
  "recommendations": ["how to properly answer different question types", "avoid generic responses", "demonstrate specific knowledge"],
  "action_plan": ["learn to read questions carefully", "provide question-specific answers", "avoid copy-paste responses"],
  "risk_assessment": "HONEST paragraph about readiness based on question-answering ability and response quality",
  "next_steps": ["improve question comprehension", "develop specific technical knowledge", "practice targeted responses"]
}

CRITICAL: If responses were copied across questions or irrelevant to specific questions asked, DOCUMENT THIS CLEARLY. Professional assessments require question-specific answers.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Web3/blockchain consultant providing comprehensive project assessments. Generate detailed, personalized analysis reports based on user questionnaire responses. Always return valid JSON with specific evidence from user responses. This is a professional assessment tool - provide enterprise-grade insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI - OpenAI returned empty response')
    }

    console.log('✅ AI analysis generated successfully')
    console.log('📄 AI Response length:', aiResponse.length, 'characters')
    
    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(aiResponse)
      console.log('✅ AI response parsed successfully as JSON')
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError)
      console.error('🔍 AI Response content:', aiResponse.substring(0, 500) + '...')
      throw new Error(`AI returned invalid JSON: ${parseError.message}`)
    }

    // Validate that AI response has all required fields
    const requiredFields = ['executive_summary', 'strengths', 'improvement_areas', 'recommendations', 'action_plan', 'risk_assessment', 'next_steps']
    const missingFields = requiredFields.filter(field => !aiAnalysis[field])
    
    if (missingFields.length > 0) {
      console.error('❌ AI response missing required fields:', missingFields)
      throw new Error(`AI response incomplete - missing fields: ${missingFields.join(', ')}`)
    }

    console.log('✅ AI analysis validated - all required fields present')

    // Build the complete report structure
    const analysisData = {
      reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userAddress: '',
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      overallScore: score,
      analysis: aiAnalysis,
      metadata: {
        totalQuestions: userAnswers.length,
        completionTime: 'Assessment completed',
        analysisVersion: 'Binno AI v3.0 - GPT-4 Powered (Mandatory AI)',
        generatedBy: 'AI',
        aiModel: 'gpt-4',
        validationPassed: true
      }
    }
    
    return analysisData

  } catch (error) {
    console.error('❌ CRITICAL: AI analysis failed completely:', error)
    console.error('� Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // NO FALLBACK - AI is mandatory for CTD Skill Compass
    throw new Error(`MANDATORY AI ANALYSIS FAILED: ${error.message}. CTD Skill Compass requires AI-powered analysis. Please ensure OpenAI API key is configured and valid.`)
  }
}

// NO FALLBACK FUNCTION - AI IS MANDATORY FOR CTD SKILL COMPASS
// All analysis must be generated by OpenAI GPT-4 for accurate assessment

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    console.log('🚀 Binno AI Final Analysis - Starting...')
    console.log('🔑 OpenAI API Key configured:', !!process.env.OPENAI_API_KEY)
    
    // CRITICAL: Validate AI is available before processing
    if (!openai) {
      console.error('❌ CRITICAL ERROR: OpenAI not configured!')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'AI analysis service unavailable',
          details: 'CTD Skill Compass requires OpenAI API configuration for analysis. Please contact administrator.',
          errorCode: 'AI_NOT_CONFIGURED'
        })
      }
    }
    
    console.log('✅ AI service validated - proceeding with analysis')
    console.log('Event body:', event.body)
    
    let requestData
    try {
      requestData = JSON.parse(event.body || '{}')
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      }
    }
    
    // Handle different possible data structures
    let userAnswers = requestData.userAnswers || requestData.answers || requestData.user_answers
    const sessionContext = requestData.sessionContext || requestData.session_context || {}
    const userAddress = requestData.userAddress || requestData.user_address || 'anonymous'

    console.log('Parsed data:', { 
      userAnswersCount: userAnswers ? userAnswers.length : 0, 
      sessionContext, 
      userAddress 
    })

    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'No valid user answers provided',
          received: Object.keys(requestData)
        })
      }
    }

    console.log(`📊 Processing ${userAnswers.length} answers...`)
    console.log('Sample answer:', userAnswers[0])

    // Calculate score
    const score = calculateScore(userAnswers)
    console.log(`📈 Calculated score: ${score}%`)

    // Generate comprehensive analysis using AI
    const reportData = await generateAnalysisWithAI(userAnswers, score)
    
    // Use provided sessionId or generate new one
    const sessionId = sessionContext?.session_id || reportData.sessionId
    reportData.sessionId = sessionId
    reportData.userAddress = userAddress || 'anonymous'

    console.log(`💾 Saving report to database...`)

    // Save to Supabase
    try {
      const { error: dbError } = await supabase
        .from('user_analysis_reports')
        .insert([{
          session_id: sessionId,
          user_address: userAddress || 'anonymous',
          report_data: reportData,
          score: score,
          created_at: new Date().toISOString()
        }])

      if (dbError) {
        console.error('Database save error:', dbError)
        // Continue anyway - don't fail the request
      } else {
        console.log('✅ Report saved to database successfully')
      }
    } catch (saveError) {
      console.error('Error saving to database:', saveError)
      // Continue anyway - don't fail the request
    }

    console.log('🎉 Analysis completed successfully!')

    // Return response in format expected by frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        report: reportData,
        sessionId: sessionId,
        analysis: reportData.analysis.executive_summary,
        success: true,
        redirectUrl: `/report?id=${sessionId}`
      })
    }

  } catch (error) {
    console.error('❌ Error in final analysis:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate analysis report',
        details: error.message
      })
    }
  }
}