import { NextApiRequest, NextApiResponse } from 'next'
import { getUserProfile, createOrUpdateUserProfile, UserProfile } from '../../../lib/user-profile'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { walletAddress } = req.query
      
      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'Wallet address is required' })
      }

      const profile = await getUserProfile(walletAddress)
      return res.status(200).json(profile)
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const userAddress = req.headers['x-user-address'] as string
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(401).json({ error: 'Valid wallet address required' })
      }

      const { name, profession, web3_experience, project_name, bio } = req.body

      // Validate experience level
      const validExperiences = ['beginner', 'intermediate', 'advanced', 'expert']
      if (web3_experience && !validExperiences.includes(web3_experience)) {
        return res.status(400).json({ 
          error: 'Invalid experience level. Must be: beginner, intermediate, advanced, or expert' 
        })
      }

      const profileData: Partial<UserProfile> = {}
      if (name !== undefined) profileData.name = name.trim()
      if (profession !== undefined) profileData.profession = profession.trim()
      if (web3_experience !== undefined) profileData.web3_experience = web3_experience
      if (project_name !== undefined) profileData.project_name = project_name.trim()
      if (bio !== undefined) profileData.bio = bio.trim()

      const updatedProfile = await createOrUpdateUserProfile(userAddress, profileData)
      
      if (!updatedProfile) {
        return res.status(500).json({ error: 'Failed to save profile' })
      }

      return res.status(200).json(updatedProfile)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}