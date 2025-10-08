const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Try to import BinnoAI, but handle gracefully if it fails
let BinnoAI = null

try {
  const binnoModule = require('../../lib/binno-questionnaire')
  BinnoAI = binnoModule.BinnoAI
} catch (error) {
  console.error('Warning: Could not import BinnoAI:', error)
}

// Helper function to calculate overall score
function calculateOverallScore(userAnswers) {
  if (!userAnswers || userAnswers.length === 0) return 0
  
  let totalScore = 0
  const maxScore = userAnswers.length * 10 // Max 10 points per answer
  
  for (const answer of userAnswers) {
    // Score based on response quality and length
    if (answer.user_response && answer.user_response.trim().length > 0) {
      const responseLength = answer.user_response.trim().length
      const contentQuality = Math.min(10, responseLength / 20) // 1 point per 20 chars, max 10
      totalScore += contentQuality
    }
  }
  
  return Math.round((totalScore / maxScore) * 100)
}

// Fallback analysis when AI is not available
function generateFallbackAnalysis(userAnswers, sessionContext) {
  const score = calculateOverallScore(userAnswers)
  
  // Determine level based on score and context
  let level = 'beginner'
  if (score >= 70) level = 'advanced'
  else if (score >= 40) level = 'intermediate'
  
  return {
    executive_summary: `Based on your ${userAnswers.length} responses, you demonstrate ${level} understanding of Web3 technologies. Your engagement with CTD Skill Compass shows commitment to professional development in the blockchain space.`,
    key_strengths: [
      "Active learning mindset in Web3 technologies",
      "Engagement with educational platforms",
      "Interest in blockchain career development"
    ],
    areas_for_improvement: [
      "Expand practical experience with DeFi protocols",
      "Deepen understanding of smart contract development",
      "Explore advanced blockchain concepts"
    ],
    personalized_recommendations: [
      "Focus on hands-on practice with testnet environments",
      "Join Web3 communities for networking and learning",
      "Consider specialized courses in your areas of interest",
      "Build a portfolio of blockchain projects"
    ],
    learning_path: {
      short_term: "Complete fundamental Web3 courses and practice with basic DeFi tools",
      medium_term: "Develop practical skills in smart contract interaction and portfolio management",
      long_term: "Advance to complex DeFi strategies and consider career opportunities in Web3"
    },
    risk_assessment: "Low risk profile with strong foundational interest. Recommend gradual learning approach with practical applications.",
    next_steps: [
      "Start with BNB Chain documentation and tutorials",
      "Join CTD Skill Compass community for continued learning",
      "Schedule follow-up assessment in 3 months"
    ]
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Generate session ID at function level
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    console.log('🔍 Starting final analysis generation...')
    
    const requestBody = JSON.parse(event.body || '{}')
    const { 
      userAnswers,
      sessionContext,
      userAddress
    } = requestBody

    console.log('📊 Received data:', {
      answersCount: userAnswers?.length || 0,
      hasUserAddress: !!userAddress,
      hasContext: !!sessionContext
    })

    if (!userAnswers || userAnswers.length === 0) {
      console.error('❌ No user answers provided')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No user answers provided' })
      }
    }

    console.log('🤖 Initializing analysis...')
    
    let analysis
    if (BinnoAI) {
      try {
        const binno = new BinnoAI()
        console.log('🧠 Generating professional analysis with AI...')
        analysis = await binno.generateProfessionalAnalysis(sessionId, userAnswers, sessionContext)
      } catch (aiError) {
        console.error('AI analysis failed, using fallback:', aiError)
        analysis = generateFallbackAnalysis(userAnswers, sessionContext)
      }
    } else {
      console.log('⚠️ BinnoAI not available, using fallback analysis')
      analysis = generateFallbackAnalysis(userAnswers, sessionContext)
    }
    
    console.log('📈 Calculating overall score...')
    const overallScore = calculateOverallScore(userAnswers)
    
    console.log('📋 Creating professional report structure...')
    const professionalReport = {
      reportId: sessionId,
      userAddress: userAddress || 'anonymous',
      sessionId,
      timestamp: new Date().toISOString(),
      overallScore,
      analysis,
      metadata: {
        totalQuestions: userAnswers.length,
        completionTime: new Date().toISOString(),
        analysisVersion: '2.0'
      }
    }

    console.log('💾 Saving report to database...')
    // Save to database BEFORE returning - this is critical!
    let dbSaveSuccess = false
    let dbErrorDetails = null
    
    try {
      console.log('🔗 Connecting to Supabase with URL:', SUPABASE_URL)
      console.log('📝 Preparing data for insert...')
      
      const insertData = {
        user_address: (userAddress || 'anonymous').toLowerCase(),
        session_id: sessionId,
        report_data: professionalReport,
        score: overallScore,
        analysis_type: 'ctd_skill_compass',
        created_at: new Date().toISOString()
      }
      
      console.log('📊 Insert data prepared:', {
        user_address: insertData.user_address,
        session_id: insertData.session_id,
        score: insertData.score,
        analysis_type: insertData.analysis_type
      })
      
      const { data: savedReport, error: saveError } = await supabase
        .from('user_analysis_reports')
        .insert([insertData])
        .select()
        .single()

      if (saveError) {
        console.error('❌ Supabase insert error:', saveError)
        dbErrorDetails = saveError
      } else {
        console.log('✅ Report saved successfully!')
        console.log('📄 Saved report ID:', savedReport?.id)
        console.log('💾 Saved session_id:', savedReport?.session_id)
        dbSaveSuccess = true
        
        // Verify the save by trying to read it back
        console.log('🔍 Verifying save by reading back...')
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_analysis_reports')
          .select('*')
          .eq('session_id', sessionId)
          .single()
        
        if (verifyError) {
          console.error('❌ Verification failed:', verifyError)
        } else {
          console.log('✅ Verification successful! Record exists.')
        }
      }
    } catch (dbError) {
      console.error('❌ Database save exception:', dbError)
      dbErrorDetails = dbError
    }
    
    // Add database save status to response
    professionalReport.dbSaveStatus = {
      success: dbSaveSuccess,
      error: dbErrorDetails?.message || null,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Returning successful response')
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        report: professionalReport,
        totalAnswers: userAnswers.length,
        sessionId
      })
    }

  } catch (error) {
    console.error('Error generating final analysis:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      sessionId,
      timestamp: new Date().toISOString()
    })
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate final analysis',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error.toString(),
        sessionId
      })
    }
  }
}