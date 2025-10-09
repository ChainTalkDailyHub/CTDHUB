const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

// Supabase configuration
const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Initialize OpenAI
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

// AI-powered analysis generation
async function generateAnalysisWithAI(userAnswers, score) {
  console.log('🤖 Starting AI analysis generation...')
  
  if (!openai) {
    console.log('⚠️ OpenAI not configured, falling back to template analysis')
    return generateFallbackAnalysis(userAnswers, score)
  }

  try {
    const questionsAndAnswers = userAnswers.map((answer, index) => 
      `Question ${index + 1}: ${answer.question_text}
      User Response: ${answer.user_response}
      `
    ).join('\n\n')

    const prompt = `Generate a comprehensive Web3 project readiness analysis based on ${userAnswers.length} detailed questionnaire responses.

PROJECT OVERVIEW (from Question 1):
${userAnswers[0]?.user_response || 'Not provided'}

COMPLETE USER RESPONSES:
${questionsAndAnswers}

ANALYSIS REQUIREMENTS:
1. Provide overall project readiness score validation (current calculated score: ${score})
2. Identify specific strengths demonstrated in responses
3. Highlight areas needing improvement or further development
4. Provide actionable recommendations for next steps
5. Assess technical knowledge level demonstrated
6. Evaluate business strategy understanding
7. Comment on BNB Chain ecosystem fit and opportunities
8. Reference specific details from their answers to show personalization

Return a JSON object with this exact structure:
{
  "executive_summary": "2-3 sentence high-level assessment and recommendation",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "improvement_areas": ["area 1", "area 2", "area 3", "area 4"],
  "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4"],
  "action_plan": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "risk_assessment": "Detailed risk evaluation paragraph",
  "next_steps": ["next 1", "next 2", "next 3", "next 4", "next 5"]
}

Focus on being specific and actionable based on their actual responses.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Web3/blockchain consultant providing comprehensive project assessments. Generate detailed analysis reports based on user questionnaire responses. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    console.log('✅ AI analysis generated successfully')
    const aiAnalysis = JSON.parse(aiResponse)

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
        analysisVersion: 'Binno AI v2.0 - GPT-4 Powered',
        generatedBy: 'AI'
      }
    }
    
    return analysisData

  } catch (error) {
    console.error('❌ AI analysis failed:', error)
    console.log('🔄 Falling back to template analysis')
    return generateFallbackAnalysis(userAnswers, score)
  }
}

// Fallback template analysis (original logic)
function generateFallbackAnalysis(userAnswers, score) {
  const analysisData = {
    reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userAddress: '',
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    overallScore: score,
    analysis: {
      executive_summary: `Based on your comprehensive ${userAnswers.length}-question assessment, you demonstrate strong engagement with Web3 and blockchain technologies. Your Binno AI assessment score of ${score}% reflects your current knowledge level and provides insights for your professional development journey.`,
      strengths: [
        "Active learning approach to Web3 technologies",
        "Demonstrated interest in blockchain innovation",
        "Commitment to professional development in DeFi",
        "Understanding of decentralized technology concepts"
      ],
      improvement_areas: [
        "Expand hands-on experience with smart contracts",
        "Deepen understanding of DeFi protocols and mechanics", 
        "Strengthen knowledge of blockchain security practices",
        "Develop practical skills in Web3 development tools"
      ],
      recommendations: [
        "Focus on practical projects using testnet environments",
        "Join Web3 communities for networking and collaborative learning",
        "Complete specialized courses in your areas of interest",
        "Build a portfolio of blockchain projects to showcase skills"
      ],
      action_plan: [
        "Set up development environment for smart contract testing",
        "Complete foundational courses in blockchain development",
        "Participate in Web3 hackathons and community events",
        "Create and deploy your first DeFi application",
        "Establish connections with other Web3 professionals"
      ],
      risk_assessment: `Based on your responses, you show a ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'developing'} foundation for success in Web3. Continue building technical skills while maintaining focus on practical application and industry networking.`,
      next_steps: [
        "Continue with CTD Skill Compass learning modules",
        "Apply knowledge through hands-on blockchain projects",
        "Connect with Web3 professionals and mentors",
        "Stay updated with latest DeFi and blockchain trends",
        "Consider advanced certifications in your chosen specialization"
      ]
    },
    metadata: {
      totalQuestions: userAnswers.length,
      completionTime: 'Assessment completed',
      analysisVersion: 'Binno AI v2.0 - Template Fallback',
      generatedBy: 'Template'
    }
  }
  
  return analysisData
}

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