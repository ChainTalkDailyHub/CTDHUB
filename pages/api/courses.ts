import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface Course {
  id: string
  title: string
  description: string
  author: string
  videos: Video[]
  totalVideos: number
  createdAt: number
  updatedAt: number
}

export interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnail: string
  createdAt: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Get all courses
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          *,
          videos (*)
        `)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: 'Failed to fetch courses' })
      }

      // Transform data to match expected format
      const transformedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        author: course.author,
        videos: course.videos || [],
        totalVideos: course.videos?.length || 0,
        createdAt: new Date(course.created_at).getTime(),
        updatedAt: new Date(course.updated_at).getTime()
      }))

      return res.status(200).json(transformedCourses)
    }

    if (req.method === 'POST') {
      const userAddress = req.headers['x-user-address'] as string
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(401).json({ error: 'Valid wallet address required' })
      }

      const { action, courseId, courseTitle, courseDescription, videos } = req.body

      if (action === 'create_course') {
        // Create new course
        if (!courseTitle) {
          return res.status(400).json({ error: 'Course title is required' })
        }

        const { data: course, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: courseTitle.trim(),
            description: courseDescription?.trim() || '',
            author: userAddress.toLowerCase()
          })
          .select()
          .single()

        if (courseError) {
          console.error('Course creation error:', courseError)
          return res.status(500).json({ error: 'Failed to create course' })
        }

        return res.status(201).json({
          id: course.id,
          title: course.title,
          description: course.description,
          author: course.author,
          videos: [],
          totalVideos: 0,
          createdAt: new Date(course.created_at).getTime(),
          updatedAt: new Date(course.updated_at).getTime()
        })
      }

      if (action === 'add_videos') {
        // Add videos to existing course
        if (!courseId || !videos || !Array.isArray(videos)) {
          return res.status(400).json({ error: 'Course ID and videos array are required' })
        }

        // Verify course ownership
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('author')
          .eq('id', courseId)
          .single()

        if (courseError || !course) {
          return res.status(404).json({ error: 'Course not found' })
        }

        if (course.author.toLowerCase() !== userAddress.toLowerCase()) {
          return res.status(403).json({ error: 'You can only add videos to your own courses' })
        }

        // Insert videos
        const videosToInsert = videos.map(video => ({
          ...video,
          course_id: courseId,
          created_at: new Date().toISOString()
        }))

        const { data: insertedVideos, error: videoError } = await supabase
          .from('videos')
          .insert(videosToInsert)
          .select()

        if (videoError) {
          console.error('Video insertion error:', videoError)
          return res.status(500).json({ error: 'Failed to add videos to course' })
        }

        // Update course updated_at
        await supabase
          .from('courses')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', courseId)

        return res.status(201).json({ 
          message: 'Videos added successfully',
          videos: insertedVideos 
        })
      }

      return res.status(400).json({ error: 'Invalid action' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}