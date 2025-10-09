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

// Simple scoring function
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

    const prompt = `You are an expert Web3/blockchain consultant conducting a comprehensive project readiness analysis.

CRITICAL INSTRUCTIONS:
- Analyze ALL ${userAnswers.length} detailed questionnaire responses
- Provide SPECIFIC insights based on the user's actual answers
- Reference CONCRETE details from their responses to prove personalization
- Give professional-grade assessment suitable for business stakeholders
- Focus on actionable recommendations based on demonstrated knowledge

PROJECT DETAILS FROM USER:
${userAnswers[0]?.user_response || 'Not provided'}

COMPLETE USER RESPONSES TO ANALYZE:
${questionsAndAnswers}

ANALYSIS REQUIREMENTS:
1. Overall project readiness score assessment (validate calculated score: ${score}%)
2. Identify SPECIFIC strengths demonstrated in their responses
3. Highlight PRECISE areas needing improvement with evidence
4. Provide ACTIONABLE recommendations for next steps
5. Assess technical knowledge level shown through answers
6. Evaluate business strategy understanding from responses
7. Comment on BNB Chain ecosystem fit and opportunities
8. REFERENCE specific details from answers to show true personalization

Return a JSON object with this EXACT structure:
{
  "executive_summary": "2-3 sentence high-level assessment referencing their specific project and responses",
  "strengths": ["specific strength 1 with evidence from responses", "specific strength 2 with evidence", "specific strength 3 with evidence", "specific strength 4 with evidence"],
  "improvement_areas": ["specific area 1 with gaps identified from answers", "specific area 2 with context", "specific area 3 with evidence", "specific area 4 with reasoning"],
  "recommendations": ["actionable recommendation 1 based on their answers", "recommendation 2 with context", "recommendation 3 based on gaps", "recommendation 4 for growth"],
  "action_plan": ["immediate step 1 for their specific project", "step 2 for short term", "step 3 for medium term", "step 4 for long term", "step 5 for sustainability"],
  "risk_assessment": "Detailed paragraph identifying key risks specific to their project and responses, with mitigation strategies",
  "next_steps": ["immediate next action based on assessment", "follow-up action for their project", "long-term action for growth", "networking/learning action", "validation/testing action"]
}

CRITICAL: Reference specific details from their responses throughout the analysis to prove this is personalized, not template-based.`

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