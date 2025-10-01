import { NextApiRequest, NextApiResponse } from 'next'
import { SimulatorService } from '../../../lib/simulator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId, decisionId, optionId, option } = req.body

    if (!sessionId || !decisionId || !optionId || !option) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, decisionId, optionId, option' 
      })
    }

    const updatedSession = await SimulatorService.makeDecision(
      sessionId,
      decisionId,
      optionId,
      option
    )

    res.status(200).json({ session: updatedSession })
  } catch (error) {
    console.error('Error making decision:', error)
    res.status(500).json({ error: 'Failed to make decision' })
  }
}