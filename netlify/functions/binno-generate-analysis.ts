import type { Handler } from '@netlify/functions'
import { BinnoAI, UserAnswer } from '../../lib/binno-questionnaire'

// Use environment variable for OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export const handler: Handler = async (event, context) => {
  console.log('Skill Compass Final Analysis Generator - Start')
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

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
    const { userAnswers }: { userAnswers: UserAnswer[] } = JSON.parse(event.body || '{}')

    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid user answers. Must provide array of answers.' })
      }
    }

    // Ensure OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured. AI analysis is mandatory for this questionnaire.' })
      }
    }

    const binno = new BinnoAI(OPENAI_API_KEY)
    console.log('BinnoAI instance created for final analysis')

    const sessionId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const analysisReport = await binno.generateFinalAnalysis(sessionId, userAnswers)
    console.log('Final analysis generated successfully')

    // Extract just the narrative for the frontend
    const analysis = analysisReport.ai_analysis_narrative

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        questionsAnalyzed: userAnswers.length,
        generatedAt: new Date().toISOString(),
        fullReport: analysisReport // Include full report for potential future use
      })
    }

  } catch (error) {
    console.error('Error generating final analysis:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate final analysis',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      })
    }
  }
}