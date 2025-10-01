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
    const { address } = req.query

    if (!address) {
      return res.status(400).json({ error: 'Address parameter is required' })
    }

    const stats = await SimulatorService.getUserStats(address as string)

    res.status(200).json({ stats })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: 'Failed to fetch user stats' })
  }
}