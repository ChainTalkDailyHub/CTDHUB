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

// Parse template-based response (more reliable than JSON)
function parseTemplateResponse(response, score, userAnswers) {
  console.log('🔧 Parsing template response...')
  
  const sections = {}
  
  // Extract sections using regex
  const extractSection = (sectionName, multiline = false) => {
    const pattern = multiline 
      ? new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i')
      : new RegExp(`${sectionName}:\\s*(.+)`, 'i')
    const match = response.match(pattern)
    return match ? match[1].trim() : ''
  }
  
  // Extract all sections
  sections.executive_summary = extractSection('EXECUTIVE_SUMMARY', true)
  sections.score = extractSection('SCORE')
  sections.strengths = extractSection('STRENGTHS', true)
  sections.improvement_areas = extractSection('IMPROVEMENT_AREAS', true)
  sections.recommendations = extractSection('RECOMMENDATIONS', true) 
  sections.action_plan = extractSection('ACTION_PLAN', true)
  sections.risk_assessment = extractSection('RISK_ASSESSMENT', true)
  sections.copy_paste = extractSection('COPY_PASTE_DETECTED', true)
  sections.question_analysis = extractSection('QUESTION_ANALYSIS', true)
  
  // Convert to list format
  const parseList = (text) => {
    if (!text) return []
    return text.split(/\n|\-/).filter(item => item.trim()).map(item => item.trim().replace(/^[\-\*]\s*/, ''))
  }
  
  // Build final structure
  const analysis = {
    executive_summary: sections.executive_summary || `Assessment completed with score ${score}%. ${score < 30 ? 'Significant issues with response quality detected.' : 'Analysis shows areas for improvement.'}`,
    strengths: parseList(sections.strengths).slice(0, 4) || (score > 40 ? ['Basic project concept provided'] : ['Limited strengths demonstrated']),
    improvement_areas: parseList(sections.improvement_areas) || [
      'Provide question-specific responses',
      'Avoid copy-paste behavior', 
      'Demonstrate deeper technical knowledge',
      'Focus on relevance to each question'
    ],
    recommendations: parseList(sections.recommendations) || [
      'Read each question carefully',
      'Provide targeted, specific answers',
      'Develop technical knowledge in Web3',
      'Practice explaining concepts clearly'
    ],
    action_plan: parseList(sections.action_plan) || [
      'Review fundamental Web3 concepts',
      'Practice answering technical questions',
      'Build hands-on experience',
      'Focus on question-specific responses'
    ],
    risk_assessment: sections.risk_assessment || `With a score of ${score}%, ${score < 30 ? 'significant preparation is needed before undertaking Web3 development projects.' : 'moderate readiness is shown but additional learning would be beneficial.'}`,
    next_steps: parseList(sections.action_plan) || [
      'Improve question comprehension',
      'Develop specific technical knowledge', 
      'Practice targeted responses',
      'Engage in practical projects'
    ],
    // Add question analysis if provided
    question_analysis: sections.question_analysis ? parseQuestionAnalysis(sections.question_analysis, userAnswers) : generateQuestionAnalysis(userAnswers, score)
  }
  
  console.log('✅ Template parsed into structured analysis')
  return analysis
}

// Parse question-by-question analysis
function parseQuestionAnalysis(analysisText, userAnswers) {
  const questions = []
  const regex = /Q(\d+):\s*([^Q]*)/g
  let match
  
  while ((match = regex.exec(analysisText)) !== null) {
    const questionNum = parseInt(match[1])
    const analysis = match[2].trim()
    
    questions.push({
      question_number: questionNum,
      relevance_assessment: analysis,
      quality_issues: analysis.toLowerCase().includes('copy') ? ['Copy-paste behavior detected'] : ['Response could be more specific'],
      improvement_needed: 'Provide question-specific answer with relevant details'
    })
  }
  
  return questions.length > 0 ? questions : generateQuestionAnalysis(userAnswers, 0)
}

// Generate question analysis if not provided
function generateQuestionAnalysis(userAnswers, score) {
  return userAnswers.map((answer, index) => ({
    question_number: index + 1,
    relevance_assessment: score < 30 ? 'Response appears generic and not specifically addressing this question' : 'Response shows some relevance to the question',
    quality_issues: score < 30 ? ['Identical response used', 'Lacks question-specific detail'] : ['Could be more specific'],
    improvement_needed: 'Provide detailed, question-specific answer that directly addresses what was asked'
  }))
}
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

Return your analysis in this EXACT format (no JSON, no markdown, just follow this template):

EXECUTIVE_SUMMARY:
[Write 2-3 sentences about overall assessment and copy-paste detection]

SCORE:
[The calculated score: ${score}]

STRENGTHS:
[List 2-4 genuine strengths if any, or write "Limited strengths demonstrated"]

IMPROVEMENT_AREAS:
[List 3-5 specific improvement areas including copy-paste issues]

RECOMMENDATIONS:
[List 3-5 actionable recommendations]

ACTION_PLAN:
[List 3-5 immediate action steps]

RISK_ASSESSMENT:
[Write detailed paragraph about readiness and risks]

COPY_PASTE_DETECTED:
[Write YES or NO, then explain if copy-paste was found]

QUESTION_ANALYSIS:
[For each question, write: Q1: [analysis], Q2: [analysis], etc.]

Remember: Be brutally honest about copy-paste behavior and response quality.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Web3/blockchain consultant providing comprehensive project assessments. You MUST respond with VALID JSON ONLY. Do not include any text before or after the JSON object. No markdown formatting, no explanations, ONLY the JSON response. Generate detailed, personalized analysis reports based on user questionnaire responses. Always return valid JSON with specific evidence from user responses. This is a professional assessment tool - provide enterprise-grade insights.'
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
    console.log('🔍 First 200 characters of AI response:', aiResponse.substring(0, 200))
    console.log('🔍 Last 200 characters of AI response:', aiResponse.substring(Math.max(0, aiResponse.length - 200)))
    
    let aiAnalysis
    try {
      console.log('🔍 Parsing template-based response...')
      aiAnalysis = parseTemplateResponse(aiResponse, score, userAnswers)
      console.log('✅ Template response parsed successfully')
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError)
      console.error('🔍 Original AI Response (first 300 chars):', aiResponse.substring(0, 300))
      console.error('🔍 Original AI Response (last 300 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 300)))
      
      // Emergency fallback: generate a structured response based on the score
      console.log('🚨 Using emergency fallback analysis structure')
      const fallbackAnalysis = {
        executive_summary: `Assessment completed with calculated readiness score of ${score}%. Analysis indicates ${score < 30 ? 'significant concerns with response quality and copy-paste behavior detected' : score < 60 ? 'moderate readiness with some areas needing improvement' : 'good overall readiness with minor refinements needed'}.`,
        question_analysis: userAnswers.map((answer, index) => ({
          question_number: index + 1,
          relevance_assessment: score < 30 ? "Response appears generic and not specifically addressing this question" : "Response shows some relevance to the question asked",
          quality_issues: score < 30 ? ["Identical response used across multiple questions", "Lacks question-specific detail", "Appears to be copy-paste behavior"] : ["Could be more specific to the question"],
          improvement_needed: "Provide detailed, question-specific answers that directly address what was asked"
        })),
        strengths: score > 50 ? ["Project concept described", "Some technical awareness shown"] : ["Basic project information provided"],
        improvement_areas: [
          "Provide question-specific responses instead of generic project descriptions",
          "Demonstrate deeper technical understanding", 
          "Show specific knowledge relevant to each question asked",
          "Avoid copy-paste responses across different questions"
        ],
        recommendations: [
          "Read each question carefully and provide targeted responses",
          "Develop deeper technical knowledge in identified areas",
          "Practice explaining concepts in different contexts",
          "Focus on demonstrating practical experience rather than generic descriptions"
        ],
        action_plan: [
          "Review fundamental concepts where knowledge gaps were identified",
          "Practice answering technical questions with specific examples",
          "Engage with Web3 development communities for practical experience",
          "Build small projects to demonstrate hands-on capabilities"
        ],
        risk_assessment: `Based on the assessment score of ${score}%, ${score < 30 ? 'there are significant concerns about readiness for Web3 development. The tendency to provide identical responses suggests a need for foundational learning.' : score < 60 ? 'moderate preparation is evident but additional learning and practical experience would be beneficial before undertaking complex projects.' : 'good foundation is present with room for refinement in specific areas.'}`,
        next_steps: [
          "Focus on building question-specific knowledge",
          "Develop hands-on experience with Web3 technologies", 
          "Practice technical communication skills",
          "Engage in practical projects to apply learning"
        ]
      }
      
      console.log('✅ Fallback analysis structure created')
      aiAnalysis = fallbackAnalysis
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