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
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Missing required field: sessionId' 
      })
    }

    const result = await SimulatorService.completeSimulation(sessionId)

    res.status(200).json(result)
  } catch (error) {
    console.error('Error completing simulation:', error)
    res.status(500).json({ error: 'Failed to complete simulation' })
  }
}