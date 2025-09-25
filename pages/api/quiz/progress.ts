import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '@/lib/storage'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userAddress, moduleId } = req.body

    if (!userAddress || !moduleId) {
      return res.status(400).json({ error: 'Missing userAddress or moduleId' })
    }

    // Get current progress
    const currentProgress = storage.getProgress(userAddress)
    const completedModules = currentProgress?.completedModules || []

    // Add new module if not already completed
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId)
      completedModules.sort((a, b) => a - b)
    }

    // Save updated progress
    storage.saveProgress(userAddress, completedModules)

    return res.status(200).json({
      success: true,
      completedModules,
      allCompleted: completedModules.length === 10
    })
  }

  if (req.method === 'GET') {
    const { userAddress } = req.query

    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({ error: 'Missing userAddress' })
    }

    const progress = storage.getProgress(userAddress)
    
    return res.status(200).json({
      completedModules: progress?.completedModules || [],
      allCompleted: storage.isAllModulesCompleted(userAddress)
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}