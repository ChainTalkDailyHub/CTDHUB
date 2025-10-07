import type { Handler } from '@netlify/functions'
import { BinnoAI, UserAnswer } from '../../lib/binno-questionnaire'

export const handler: Handler = async (event, context) => {
  console.log('Binno Generate Question Function - Start')
  console.log('Environment check:', {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0
  })
  
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
    console.log('BinnoAI instance created')
    
    const question = await binno.generateNextQuestion(questionNumber, previousAnswers, sessionContext)
    console.log('Question generated successfully:', question.question_text.substring(0, 50) + '...')

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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate question',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
        fallback: 'Using static questions as fallback'
      })
    }
  }
}