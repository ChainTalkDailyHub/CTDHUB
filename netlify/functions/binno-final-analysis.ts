import type { Handler } from '@netlify/functions'
import { BinnoAI, UserAnswer } from '../../lib/binno-questionnaire'

export const handler: Handler = async (event, context) => {
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
    const { 
      userAnswers,
      sessionContext 
    }: {
      userAnswers: UserAnswer[]
      sessionContext: {
        user_id?: string
        experience_level?: string
        interests?: string[]
        goal?: string
      }
    } = JSON.parse(event.body || '{}')

    if (!userAnswers || userAnswers.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No user answers provided' })
      }
    }

    const binno = new BinnoAI()
    const analysis = await binno.generateFinalAnalysis(userAnswers)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        totalAnswers: userAnswers.length,
        sessionId: sessionContext?.user_id || 'unknown'
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