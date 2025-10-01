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
    const { userAddress, projectName, projectType } = req.body

    if (!userAddress || !projectName || !projectType) {
      return res.status(400).json({ 
        error: 'Missing required fields: userAddress, projectName, projectType' 
      })
    }

    // Create new simulation session
    const session = await SimulatorService.createSession(
      userAddress,
      projectName,
      projectType
    )

    res.status(200).json({ 
      sessionId: session.id,
      session 
    })
  } catch (error) {
    console.error('Error creating simulation session:', error)
    res.status(500).json({ 
      error: 'Failed to create simulation session' 
    })
  }
}