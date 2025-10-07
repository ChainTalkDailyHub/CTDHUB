import { NextApiRequest, NextApiResponse } from 'next'
import { BinnoAI, UserAnswer, FinalAnalysis } from '../../../lib/binno-questionnaire'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      answers,
      sessionContext 
    }: {
      answers: UserAnswer[]
      sessionContext: any
    } = req.body

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' })
    }

    console.log('Generating final analysis for', answers.length, 'answers')

    const binno = new BinnoAI()
    const analysis = await binno.generateFinalAnalysis(answers)

    console.log('Analysis generated successfully')

    return res.status(200).json({
      analysis,
      totalQuestionsAnswered: answers.length,
      completedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating final analysis:', error)
    return res.status(500).json({ 
      error: 'Failed to generate analysis',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    })
  }
}

// Função para salvar no banco (implementar conforme necessário)
async function saveAnalysisToDatabase(
  sessionId: string, 
  analysis: FinalAnalysis, 
  userAnswers: UserAnswer[]
) {
  // Implementar salvamento no Supabase ou outro banco
  // Por exemplo:
  /*
  const { data, error } = await supabase
    .from('binno_questionnaire_sessions')
    .insert({
      session_id: sessionId,
      user_answers: userAnswers,
      final_analysis: analysis,
      completed_at: new Date().toISOString()
    })
  */
}