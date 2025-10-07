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

    if (!questionNumber || questionNumber < 1 || questionNumber > 30) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid question number. Must be between 1 and 30.' })
      }
    }

    const binno = new BinnoAI()
    const question = await binno.generateNextQuestion(questionNumber, previousAnswers, sessionContext)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        question,
        questionNumber,
        totalQuestions: 30,
        isLastQuestion: questionNumber >= 30
      })
    }

  } catch (error) {
    console.error('Error generating question:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate question',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      })
    }
  }
}