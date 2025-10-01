import { NextApiRequest, NextApiResponse } from 'next'
import { SimulatorService } from '../../../lib/simulator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10
    const leaderboard = await SimulatorService.getGlobalLeaderboard(limit)

    res.status(200).json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
}