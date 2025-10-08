import type { Handler } from '@netlify/functions'

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
    
    const requestBody = JSON.parse(event.body || '{}')
    console.log('📊 Received data:', {
      hasBody: !!event.body,
      parsedKeys: Object.keys(requestBody)
    })

    const { 
      userAnswers,
      sessionContext,
      userAddress
    } = requestBody

    console.log('📊 Parsed data:', {
      answersCount: userAnswers?.length || 0,
      hasUserAddress: !!userAddress,
      hasContext: !!sessionContext,
      sessionId
    })

    // For now, return a mock analysis to test the function structure
    const mockAnalysis = {
      executive_summary: "This is a test analysis generated successfully.",
      strengths: ["Function is working", "Data parsing successful", "Session created"],
      improvement_areas: ["Real AI analysis needed", "Full implementation pending"],
      recommendations: ["Implement full AI analysis", "Add error handling", "Test with real data"],
      action_plan: ["Step 1: Test function", "Step 2: Add AI", "Step 3: Deploy"],
      risk_assessment: "Low risk - basic functionality working",
      next_steps: ["Verify OpenAI integration", "Test with real data", "Deploy to production"]
    }

    const overallScore = 75 // Mock score

    const professionalReport = {
      reportId: `report_${sessionId}`,
      userAddress: userAddress || 'anonymous',
      sessionId,
      timestamp: new Date().toISOString(),
      overallScore,
      analysis: mockAnalysis,
      metadata: {
        totalQuestions: userAnswers?.length || 0,
        completionTime: new Date().toISOString(),
        analysisVersion: 'test-v1.0.0'
      }
    }

    console.log('✅ Successfully generated test analysis')

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        report: professionalReport,
        totalAnswers: userAnswers?.length || 0,
        sessionId,
        status: 'test_success'
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