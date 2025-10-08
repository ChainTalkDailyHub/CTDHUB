const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Try to import BinnoAI, but handle gracefully if it fails
let BinnoAI = null

try {
  // Check if we're in Netlify environment
  if (process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key found, creating BinnoAI class...')
    
    // Create a minimal BinnoAI class inline
    const OpenAI = require('openai')
    
    class SimpleBinnoAI {
      constructor() {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })
      }
      
      async generateProfessionalAnalysis(sessionId, userAnswers, sessionContext) {
        const prompt = `Generate a professional Web3 skill analysis for a user with ${userAnswers.length} responses. 
        User context: ${JSON.stringify(sessionContext)}
        
        Provide a comprehensive analysis in the following format:
        {
          "executive_summary": "Professional summary",
          "key_strengths": ["strength1", "strength2", "strength3"],
          "areas_for_improvement": ["area1", "area2", "area3"],
          "personalized_recommendations": ["rec1", "rec2", "rec3"],
          "learning_path": {
            "short_term": "immediate goals",
            "medium_term": "3-6 month goals", 
            "long_term": "6+ month goals"
          },
          "risk_assessment": "risk evaluation",
          "next_steps": ["step1", "step2", "step3"]
        }`
        
        try {
          const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
          })
          
          const content = response.choices[0]?.message?.content
          if (content) {
            return JSON.parse(content)
          }
        } catch (error) {
          console.error('OpenAI API error:', error)
          throw error
        }
      }
    }
    
    BinnoAI = SimpleBinnoAI
    console.log('✅ BinnoAI class created successfully')
  } else {
    console.log('⚠️ No OpenAI API key found in environment')
  }
} catch (error) {
  console.error('Warning: Could not create BinnoAI:', error)
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
    
    // First, calculate score and create basic report structure
    console.log('📈 Calculating overall score...')
    const overallScore = calculateOverallScore(userAnswers)
    
    // Create fallback analysis first to ensure we have something to save
    console.log('🔄 Generating fallback analysis...')
    let analysis = generateFallbackAnalysis(userAnswers, sessionContext)
    
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

    console.log('💾 Saving report to database FIRST (before AI analysis)...')
    // Save to database BEFORE AI analysis to ensure we don't lose data
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
    
    // NOW try to enhance with AI analysis if possible (but don't block on it)
    if (BinnoAI && dbSaveSuccess) {
      try {
        console.log('🧠 Attempting to enhance with AI analysis...')
        const binno = new BinnoAI()
        const aiAnalysis = await Promise.race([
          binno.generateProfessionalAnalysis(sessionId, userAnswers, sessionContext),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 10000))
        ])
        
        // Update the analysis with AI results
        analysis = aiAnalysis
        professionalReport.analysis = aiAnalysis
        
        // Update the database with enhanced analysis
        const { error: updateError } = await supabase
          .from('user_analysis_reports')
          .update({ report_data: professionalReport })
          .eq('session_id', sessionId)
        
        if (updateError) {
          console.error('⚠️ Failed to update with AI analysis:', updateError)
        } else {
          console.log('✅ Enhanced with AI analysis and updated database')
        }
      } catch (aiError) {
        console.error('⚠️ AI analysis failed, using fallback:', aiError)
        // Keep the fallback analysis - report already saved
      }
    } else {
      console.log('⚠️ Using fallback analysis (BinnoAI not available or DB save failed)')
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