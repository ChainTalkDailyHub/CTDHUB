import type { Handler } from '@netlify/functions'
import { BinnoAI, UserAnswer } from '../../lib/binno-questionnaire'

// Use environment variable for OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export const handler: Handler = async (event, context) => {
  console.log('Skill Compass AI Question Generator - Start')
  console.log('API Key configured:', !!OPENAI_API_KEY)
  
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
      questionNumber,
      previousAnswers = [],
      sessionContext 
    }: {
      questionNumber: number
      previousAnswers: UserAnswer[]
      sessionContext: {
        user_expertise_level: string
        project_focus: string
        previous_responses_summary: string
      }
    } = JSON.parse(event.body || '{}')

    if (!questionNumber || questionNumber < 1 || questionNumber > 15) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid question number. Must be between 1 and 15.' })
      }
    }

    // Ensure OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured. AI generation is mandatory for this questionnaire.' })
      }
    }

    const binno = new BinnoAI(OPENAI_API_KEY)
    const question = await binno.generateNextQuestion(questionNumber, previousAnswers, sessionContext)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        question,
        questionNumber,
        totalQuestions: 15,
        isLastQuestion: questionNumber >= 15
      })
    }

  } catch (error) {
    console.error('Error generating question:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined
    })
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate question',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        } : undefined
      })
    }
  }
}