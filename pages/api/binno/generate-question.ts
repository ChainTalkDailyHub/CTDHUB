import { NextApiRequest, NextApiResponse } from 'next'
import { BinnoAI, Question, UserAnswer } from '../../../lib/binno-questionnaire'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
    } = req.body

    if (!questionNumber || questionNumber < 1 || questionNumber > 30) {
      return res.status(400).json({ error: 'Invalid question number. Must be between 1 and 30.' })
    }

    const binno = new BinnoAI()
    const question = await binno.generateNextQuestion(questionNumber, previousAnswers, sessionContext)

    return res.status(200).json({
      question,
      questionNumber,
      totalQuestions: 30,
      isLastQuestion: questionNumber >= 30
    })

  } catch (error) {
    console.error('Error generating question:', error)
    return res.status(500).json({ 
      error: 'Failed to generate question',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}