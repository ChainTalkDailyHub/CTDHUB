const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

// Simple analysis generator
function generateSimpleAnalysis(userAnswers, score) {
  return {
    executive_summary: `Based on your ${userAnswers.length} responses, you demonstrate engagement with Web3 technologies. Your CTD Skill Compass assessment score is ${score}%.`,
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
      "Consider specialized courses in your areas of interest"
    ],
    learning_path: {
      short_term: "Complete fundamental Web3 courses",
      medium_term: "Develop practical skills in smart contract interaction",
      long_term: "Advance to complex DeFi strategies and career opportunities"
    },
    risk_assessment: "Low risk profile with strong foundational interest.",
    next_steps: [
      "Continue with CTD Skill Compass learning path",
      "Practice with testnet environments",
      "Schedule follow-up assessment in 3 months"
    ]
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    console.log('🔍 SIMPLE VERSION: Starting analysis...')
    
    const { userAnswers, sessionContext, userAddress } = JSON.parse(event.body || '{}')

    if (!userAnswers || userAnswers.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No user answers provided' }) }
    }

    console.log('📊 Data received:', { answers: userAnswers.length, userAddress })

    // Calculate score
    const overallScore = calculateScore(userAnswers)
    console.log('📈 Score calculated:', overallScore)

    // Generate simple analysis
    const analysis = generateSimpleAnalysis(userAnswers, overallScore)
    console.log('🧠 Analysis generated')

    // Create report
    const report = {
      reportId: sessionId,
      userAddress: userAddress || 'anonymous',
      sessionId,
      timestamp: new Date().toISOString(),
      overallScore,
      analysis,
      metadata: {
        totalQuestions: userAnswers.length,
        completionTime: new Date().toISOString(),
        analysisVersion: '2.0-simple'
      }
    }

    console.log('💾 ATTEMPTING DATABASE SAVE...')
    console.log('🔗 Supabase URL:', SUPABASE_URL)
    console.log('🔑 Has Supabase key:', !!SUPABASE_ANON_KEY)
    console.log('📊 Session ID for save:', sessionId)
    
    // Database save
    let saveSuccess = false
    let saveError = null
    
    try {
      const insertData = {
        user_address: (userAddress || 'anonymous').toLowerCase(),
        session_id: sessionId,
        report_data: report,
        score: overallScore,
        analysis_type: 'ctd_skill_compass',
        created_at: new Date().toISOString()
      }
      
      console.log('📝 Inserting to Supabase...', {
        user_address: insertData.user_address,
        session_id: insertData.session_id,
        score: insertData.score,
        has_report_data: !!insertData.report_data
      })
      
      console.log('🔧 About to call supabase.from...')
      const { data, error } = await supabase
        .from('user_analysis_reports')
        .insert([insertData])
        .select()
        .single()

      console.log('📬 Supabase insert completed')
      console.log('📊 Insert result data:', !!data)
      console.log('❌ Insert result error:', !!error)

      if (error) {
        console.error('❌ Supabase error details:', JSON.stringify(error, null, 2))
        saveError = error.message
      } else {
        console.log('✅ SAVED TO DATABASE!', data?.id)
        saveSuccess = true
        
        // Verify immediately
        console.log('🔍 Verifying save...')
        const { data: verification, error: verifyError } = await supabase
          .from('user_analysis_reports')
          .select('id, score, created_at')
          .eq('session_id', sessionId)
          .single()
        
        if (verification) {
          console.log('✅ VERIFICATION SUCCESS!', verification.id)
        } else {
          console.error('❌ VERIFICATION FAILED:', verifyError)
        }
      }
    } catch (dbException) {
      console.error('❌ DATABASE EXCEPTION:', dbException)
      saveError = dbException.message
    }

    // Add save status to report
    report.dbSaveStatus = {
      success: saveSuccess,
      error: saveError,
      timestamp: new Date().toISOString(),
      debugInfo: {
        supabaseUrl: SUPABASE_URL,
        hasKey: !!SUPABASE_ANON_KEY,
        sessionId: sessionId
      }
    }

    console.log('✅ Returning response with debug info...')
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        report,
        totalAnswers: userAnswers.length,
        sessionId,
        dbSaveSuccess: saveSuccess,
        debugInfo: {
          saveAttempted: true,
          saveSuccess: saveSuccess,
          saveError: saveError
        }
      })
    }

  } catch (error) {
    console.error('❌ FUNCTION ERROR:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate analysis',
        message: error.message,
        sessionId
      })
    }
  }
}