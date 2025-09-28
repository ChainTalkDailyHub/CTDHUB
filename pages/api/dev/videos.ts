import { NextApiRequest, NextApiResponse } from 'next'
import { readJson, writeJson } from '../../../lib/server-storage'
import { ytIdFromUrl, ytThumb, generateId } from '../../../lib/storage'

export interface DevVideo {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnail?: string | null
  createdAt: number
  author: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const videos = await readJson('dev-videos.json')
      const sortedVideos = videos.sort((a, b) => b.createdAt - a.createdAt)
      return res.status(200).json(sortedVideos)
    }

    if (req.method === 'POST') {
      const userAddress = req.headers['x-user-address'] as string
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(401).json({ error: 'Valid wallet address required' })
      }

      const { title, description, youtubeUrl } = req.body

      if (!title || !youtubeUrl) {
        return res.status(400).json({ error: 'Title and YouTube URL are required' })
      }

      const videoId = ytIdFromUrl(youtubeUrl)
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' })
      }

      const newVideo: DevVideo = {
        id: generateId(),
        title: title.trim(),
        description: description?.trim() || '',
        youtubeUrl: youtubeUrl.trim(),
        thumbnail: ytThumb(videoId),
        createdAt: Date.now(),
        author: userAddress.toLowerCase()
      }

      const videos = await readJson('dev-videos.json')
      videos.push(newVideo)
      await writeJson('dev-videos.json', videos)

      return res.status(201).json(newVideo)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}