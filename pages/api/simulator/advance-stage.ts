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
    const { sessionId, nextStage } = req.body

    if (!sessionId || !nextStage) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, nextStage' 
      })
    }

    const updatedSession = await SimulatorService.updateSession(sessionId, {
      current_stage: nextStage
    })

    res.status(200).json({ session: updatedSession })
  } catch (error) {
    console.error('Error advancing stage:', error)
    res.status(500).json({ error: 'Failed to advance stage' })
  }
}