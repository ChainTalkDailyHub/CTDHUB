import type { Handler } from '@netlify/functions'
import { BinnoAI, UserAnswer } from '../../lib/binno-questionnaire'
import { createClient } from '@supabase/supabase-js'

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
    
    // Generate session ID first
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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

    console.log('🤖 Initializing BinnoAI...')
    const binno = new BinnoAI()
    
    console.log('🧠 Generating professional analysis...')
    // Generate professional analysis with structured sections
    const analysis = await binno.generateProfessionalAnalysis(sessionId, userAnswers, sessionContext)
    
    console.log('📈 Calculating overall score...')
    // Calculate overall score based on answers
    const overallScore = calculateOverallScore(userAnswers)
    
    console.log('📋 Creating professional report structure...')
    // Create professional report structure
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

    // Save report to database if user address is provided
    if (userAddress) {
      try {
        const { error: saveError } = await supabase
          .from('user_analysis_reports')
          .insert([{
            user_address: userAddress.toLowerCase(),
            session_id: sessionId,
            report_data: professionalReport,
            score: overallScore,
            analysis_type: 'project_analysis'
          }])

        if (saveError) {
          console.error('Error saving report:', saveError)
        }
      } catch (saveError) {
        console.error('Failed to save report:', saveError)
      }
    }

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