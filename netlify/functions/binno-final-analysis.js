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

// Enhanced scoring function with quality assessment
function calculateScore(userAnswers) {
  if (!userAnswers || userAnswers.length === 0) return 0
  
  let totalScore = 0
  let qualityPenalties = 0
  
  for (const answer of userAnswers) {
    if (answer.user_response && answer.user_response.trim().length > 0) {
      const response = answer.user_response.trim()
      const responseLength = response.length
      
      // Base score from length
      let answerScore = Math.min(10, responseLength / 20)
      
      // Quality checks - severe penalties for poor responses
      const lowQualityPatterns = [
        /^(.)\1{5,}/, // Repeated characters (aaaaaaa...)
        /^[^a-zA-Z]*$/, // Only special characters
        /^(test|asdf|qwerty|123|abc){2,}/, // Common test strings
        /^(.{1,3})\1{3,}/, // Short repeated patterns
        /^[a-z]{20,}$/, // Long random letter strings
        /^\s*$/, // Only whitespace
      ]
      
      // Check for low quality patterns
      const hasLowQuality = lowQualityPatterns.some(pattern => pattern.test(response.toLowerCase()))
      
      if (hasLowQuality) {
        answerScore = Math.max(0, answerScore * 0.1) // 90% penalty
        qualityPenalties += 5
      }
      
      // Additional checks for meaningful content
      const words = response.split(/\s+/).filter(word => word.length > 2)
      const uniqueWords = new Set(words.map(w => w.toLowerCase()))
      
      if (words.length < 3) {
        answerScore *= 0.3 // 70% penalty for very short answers
        qualityPenalties += 2
      }
      
      if (uniqueWords.size < words.length * 0.5) {
        answerScore *= 0.5 // 50% penalty for repetitive content
        qualityPenalties += 1
      }
      
      totalScore += answerScore
    }
  }
  
  // Apply overall quality penalty
  let finalScore = Math.round((totalScore / (userAnswers.length * 10)) * 100)
  finalScore = Math.max(0, finalScore - qualityPenalties * 2) // Additional penalties
  
  return Math.min(100, finalScore)
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

    const prompt = `You are an expert Web3/blockchain consultant conducting a RIGOROUS professional assessment. You must be BRUTALLY HONEST about response quality.

CRITICAL ANALYSIS INSTRUCTIONS:
- Analyze EVERY response for actual substance and meaning
- HEAVILY PENALIZE nonsensical, random, or low-effort responses
- If responses are clearly inadequate (random characters, repeated letters, meaningless text), CALL IT OUT
- Be REALISTIC about knowledge levels demonstrated
- Don't be artificially positive - this is a professional assessment
- Score harshly for poor responses but fairly recognize genuine effort

PROJECT DETAILS FROM USER:
${userAnswers[0]?.user_response || 'Not provided'}

COMPLETE USER RESPONSES TO ANALYZE:
${questionsAndAnswers}

QUALITY ASSESSMENT:
- Current calculated score: ${score}% (this accounts for response quality)
- If score is very low (under 30%), responses are likely inadequate
- If responses contain random characters or nonsense, DOCUMENT THIS

ANALYSIS REQUIREMENTS:
1. HONEST assessment of response quality and substance
2. Identify REAL strengths only if genuinely demonstrated
3. Be SPECIFIC about inadequacies in responses
4. Provide REALISTIC recommendations based on actual knowledge shown
5. If responses are poor quality, focus on fundamental learning needs
6. Don't inflate capabilities - be truthful about readiness level
7. Score should reflect ACTUAL demonstrated competence
8. Reference specific response quality issues if present

Return a JSON object with this EXACT structure (be honest in your assessments):
{
  "executive_summary": "HONEST 2-3 sentence assessment of actual knowledge demonstrated and response quality",
  "strengths": ["only list GENUINE strengths if demonstrated", "don't fabricate positives", "be realistic about what was shown", "max 4 items"],
  "improvement_areas": ["specific areas needing work based on responses", "address response quality if poor", "fundamental knowledge gaps", "professional communication skills if needed"],
  "recommendations": ["realistic next steps for current level", "address basic learning if responses inadequate", "specific to demonstrated knowledge gaps", "actionable and honest"],
  "action_plan": ["immediate steps for their actual level", "don't assume advanced capabilities", "start with fundamentals if needed", "progressive learning path", "realistic timeline"],
  "risk_assessment": "HONEST paragraph about readiness level, response quality concerns, and genuine risks for Web3 development",
  "next_steps": ["practical first steps for current level", "don't overestimate capabilities", "focus on knowledge building if needed", "realistic progression", "quality over quantity"]
}

CRITICAL: If responses were low-quality, random, or nonsensical, DOCUMENT THIS HONESTLY. This is a professional assessment, not a participation trophy.`

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