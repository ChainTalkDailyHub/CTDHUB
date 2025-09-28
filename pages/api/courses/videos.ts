import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../dev/videos'

export default async function coursesVideosHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handler(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}