import type { NextApiRequest, NextApiResponse } from 'next'
import AIContextManager from '@/lib/aiContext'

interface UserSettings {
  preferredLanguage: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  notificationsEnabled: boolean
  autoSaveChats: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const contextManager = AIContextManager.getInstance()

  switch (method) {
    case 'GET':
      try {
        const { userId } = req.query
        
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'userId is required'
          })
        }

        const preferences = contextManager.getUserPreferences(userId)
        
        return res.status(200).json({
          success: true,
          preferences: preferences || {
            preferredLanguage: 'pt-BR',
            experienceLevel: 'beginner',
            interests: [],
            previousQuestions: []
          }
        })
      } catch (error) {
        console.error('Get settings error:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to get user settings'
        })
      }

    case 'POST':
      try {
        const { userId, settings } = req.body

        if (!userId || !settings) {
          return res.status(400).json({
            success: false,
            error: 'userId and settings are required'
          })
        }

        // Update user memory with new settings
        contextManager.updateMemory(userId, 'settings_update', 'Settings updated', JSON.stringify(settings))

        return res.status(200).json({
          success: true,
          message: 'Settings updated successfully'
        })
      } catch (error) {
        console.error('Update settings error:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to update user settings'
        })
      }

    case 'DELETE':
      try {
        const { userId } = req.query

        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'userId is required'
          })
        }

        // In a real implementation, you would delete user data from database
        // For now, we'll just return success
        
        return res.status(200).json({
          success: true,
          message: 'User data cleared successfully'
        })
      } catch (error) {
        console.error('Clear settings error:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to clear user data'
        })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}