import { NextApiRequest, NextApiResponse } from 'next'
import { SimulatorService } from '../../../../lib/simulator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId } = req.query

  if (req.method === 'GET') {
    try {
      const session = await SimulatorService.getSession(sessionId as string)
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' })
      }

      res.status(200).json({ session })
    } catch (error) {
      console.error('Error fetching session:', error)
      res.status(500).json({ error: 'Failed to fetch session' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}