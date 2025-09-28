import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res)
      case 'POST':
        return handlePost(req, res)
      case 'DELETE':
        return handleDelete(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Video comments API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' })
  }

  const { data: comments, error } = await supabase
    .from('video_comments')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return res.status(500).json({ error: 'Failed to fetch comments' })
  }

  return res.status(200).json(comments)
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { videoId, userAddress, userName, comment } = req.body

  if (!videoId || !userAddress || !comment) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data, error } = await supabase
    .from('video_comments')
    .insert([{
      video_id: videoId,
      user_address: userAddress,
      user_name: userName,
      comment: comment.trim()
    }])
    .select()

  if (error) {
    console.error('Error creating comment:', error)
    return res.status(500).json({ error: 'Failed to create comment' })
  }

  return res.status(201).json(data[0])
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { commentId, userAddress } = req.body

  if (!commentId || !userAddress) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Only allow users to delete their own comments
  const { error } = await supabase
    .from('video_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_address', userAddress)

  if (error) {
    console.error('Error deleting comment:', error)
    return res.status(500).json({ error: 'Failed to delete comment' })
  }

  return res.status(200).json({ message: 'Comment deleted successfully' })
}