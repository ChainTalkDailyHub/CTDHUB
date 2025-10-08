import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Define types locally to avoid import issues
interface UserAnswer {
  question_id?: string
  question_text?: string
  user_response?: string
  timestamp?: number
  questionId?: string
  question?: string
  answer?: string
  points?: number
  category?: string
}

// Try to import BinnoAI, but handle gracefully if it fails
let BinnoAI: any = null

try {
  const binnoModule = require('../../lib/binno-questionnaire')
  BinnoAI = binnoModule.BinnoAI
} catch (error) {
  console.error('Warning: Could not import BinnoAI:', error)
}

const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper function to calculate overall score
function calculateOverallScore(userAnswers: UserAnswer[]): number {
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

interface ProfessionalReport {
  reportId: string
  userAddress: string
  sessionId: string
  timestamp: string
  overallScore: number
  analysis: {
    executive_summary: string
    strengths: string[]
    improvement_areas: string[]
    recommendations: string[]
    action_plan: string[]
    risk_assessment: string
    next_steps: string[]
  }
  metadata: {
    totalQuestions: number
    completionTime: string
    analysisVersion: string
  }
}

// Fallback analysis generator for when AI is not available
function generateFallbackAnalysis(userAnswers: UserAnswer[], sessionContext?: any) {
  const answerCount = userAnswers?.length || 0
  const hasContext = !!sessionContext
  
  return {
    executive_summary: `Based on ${answerCount} responses, this assessment indicates a developing understanding of Web3 technologies with potential for growth.`,
    strengths: [
      "Demonstrated engagement with Web3 learning process",
      "Completed comprehensive assessment questionnaire",
      ...(hasContext ? ["Provided detailed project context"] : [])
    ],
    improvement_areas: [
      "Continue expanding Web3 technical knowledge",
      "Practice with hands-on blockchain development",
      "Explore DeFi and smart contract ecosystems"
    ],
    recommendations: [
      "Focus on building practical Web3 projects",
      "Join developer communities and forums",
      "Consider formal blockchain education courses"
    ],
    action_plan: [
      "Set up development environment with MetaMask and testnet",
      "Complete beginner-friendly smart contract tutorials",
      "Build first DApp project on BNB Smart Chain"
    ],
    risk_assessment: "Low risk profile with strong foundational interest. Recommend gradual learning approach with practical applications.",
    next_steps: [
      "Start with BNB Chain documentation and tutorials",
      "Join CTD Skill Compass community for continued learning",
      "Schedule follow-up assessment in 3 months"
    ]
  }
}

export const handler: Handler = async (event, context) => {
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
    
    const { 
      userAnswers,
      sessionContext,
      userAddress
    }: {
      userAnswers: UserAnswer[]
      userAddress?: string
      sessionContext: {
        user_id?: string
        experience_level?: string
        interests?: string[]
        goal?: string
      }
    } = JSON.parse(event.body || '{}')

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
    const professionalReport: ProfessionalReport = {
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
    try {
      const { data: savedReport, error: saveError } = await supabase
        .from('user_analysis_reports')
        .insert([{
          user_address: (userAddress || 'anonymous').toLowerCase(),
          session_id: sessionId,
          report_data: professionalReport,
          score: overallScore,
          analysis_type: 'ctd_skill_compass',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (saveError) {
        console.error('❌ Failed to save report:', saveError)
        // Don't fail the request, just log the error
      } else {
        console.log('✅ Report saved successfully:', savedReport?.id)
      }
    } catch (dbError) {
      console.error('❌ Database save error:', dbError)
      // Continue anyway - user should still get their report
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
        details: error,
        sessionId
      })
    }
  }
}