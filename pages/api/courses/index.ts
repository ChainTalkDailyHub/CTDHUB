import { NextApiRequest, NextApiResponse } from 'next'
import { readCourses, writeCourses, generateId, ytIdFromUrl, ytThumb } from '../../../lib/courses-storage'

// Try to import Supabase functions
let readCoursesFromSupabase: any = null
let writeCourseToSupabase: any = null

try {
  const supabaseStorage = require('../../../lib/supabase-storage')
  readCoursesFromSupabase = supabaseStorage.readCoursesFromSupabase
  writeCourseToSupabase = supabaseStorage.writeCourseToSupabase
} catch (error) {
  console.log('Supabase storage not available, using fallback')
}

// Temporary in-memory storage for serverless environments
let memoryStorage: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Try Supabase first if available
      const hasSupabaseEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (hasSupabaseEnv && readCoursesFromSupabase) {
        console.log('Using Supabase for courses')
        try {
          const courses = await readCoursesFromSupabase()
          return res.status(200).json(courses)
        } catch (error) {
          console.error('Supabase error, falling back:', error)
        }
      }
      
      // Fallback to memory or file storage
      const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      
      let courses
      if (isServerless) {
        console.log('Using memory storage for courses')
        courses = memoryStorage.sort((a, b) => b.updatedAt - a.updatedAt)
      } else {
        console.log('Using file system for courses')
        courses = await readCourses()
        courses = courses.sort((a, b) => b.updatedAt - a.updatedAt)
      }
      
      return res.status(200).json(courses)
    }

    if (req.method === 'POST') {
      console.log('=== POST /api/courses ===')
      console.log('Headers:', req.headers)
      console.log('Body:', req.body)
      
      const userAddress = req.headers['x-user-address'] as string
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        console.log('Invalid user address:', userAddress)
        return res.status(401).json({ error: 'Valid wallet address required' })
      }

      const { title, description, videos } = req.body

      if (!title || !description || !videos || !Array.isArray(videos) || videos.length === 0) {
        console.log('Missing required fields:', { title: !!title, description: !!description, videos: videos?.length })
        return res.status(400).json({ 
          error: 'Course title, description, and at least one video are required' 
        })
      }

      // Validate all videos
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        if (!video.title || !video.youtubeUrl) {
          return res.status(400).json({ 
            error: `Video ${i + 1}: Title and YouTube URL are required` 
          })
        }

        // Simple YouTube URL validation
        if (!video.youtubeUrl.includes('youtube.com') && !video.youtubeUrl.includes('youtu.be')) {
          return res.status(400).json({ 
            error: `Video ${i + 1}: Must be a YouTube URL` 
          })
        }
      }

      const courseVideos = videos.map((video: any, index: number) => {
        const videoId = ytIdFromUrl(video.youtubeUrl) || 'default'
        return {
          id: generateId(),
          title: video.title.trim(),
          description: video.description?.trim() || '',
          youtubeUrl: video.youtubeUrl.trim(),
          thumbnail: videoId !== 'default' ? ytThumb(videoId) : '',
          order: index + 1
        }
      })

      const newCourse = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        author: userAddress.toLowerCase(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        videos: courseVideos,
        totalVideos: courseVideos.length
      }

      // Try Supabase first if available
      const hasSupabaseEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (hasSupabaseEnv && writeCourseToSupabase) {
        console.log('Saving course to Supabase')
        try {
          const success = await writeCourseToSupabase(newCourse)
          if (success) {
            console.log('Course saved successfully to Supabase:', newCourse.id)
            return res.status(201).json(newCourse)
          } else {
            console.log('Supabase save failed, falling back to memory storage')
          }
        } catch (error) {
          console.error('Supabase error, falling back:', error)
        }
      }

      // Fallback to memory or file storage
      const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      
      if (isServerless) {
        console.log('Saving course to memory storage')
        memoryStorage.push(newCourse)
        console.log('Course saved successfully:', newCourse.id)
        console.log('Total courses in memory:', memoryStorage.length)
      } else {
        console.log('Saving course to file system')
        const courses = await readCourses()
        courses.push(newCourse)
        await writeCourses(courses)
      }

      return res.status(201).json(newCourse)
    }

    if (req.method === 'PUT') {
      const userAddress = req.headers['x-user-address'] as string
      const { courseId } = req.query
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(401).json({ error: 'Valid wallet address required' })
      }

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' })
      }

      const { videos } = req.body

      if (!videos || !Array.isArray(videos) || videos.length === 0) {
        return res.status(400).json({ error: 'At least one video is required' })
      }

      // Use appropriate storage
      const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      
      let courses
      if (isServerless) {
        console.log('Using memory storage for course update')
        courses = memoryStorage
      } else {
        console.log('Using file system for course update')
        courses = await readCourses()
      }

      const courseIndex = courses.findIndex((c: any) => c.id === courseId)

      if (courseIndex === -1) {
        return res.status(404).json({ error: 'Course not found' })
      }

      const course = courses[courseIndex]

      // Check if user owns this course
      if (course.author.toLowerCase() !== userAddress.toLowerCase()) {
        return res.status(403).json({ error: 'You can only edit your own courses' })
      }

      // Validate all videos
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        if (!video.title || !video.youtubeUrl) {
          return res.status(400).json({ 
            error: `Video ${i + 1}: Title and YouTube URL are required` 
          })
        }

        const videoId = ytIdFromUrl(video.youtubeUrl)
        if (!videoId) {
          return res.status(400).json({ 
            error: `Video ${i + 1}: Invalid YouTube URL` 
          })
        }
      }

      // Add new videos to existing course
      const newVideos = videos.map((video: any, index: number) => {
        const videoId = ytIdFromUrl(video.youtubeUrl)!
        return {
          id: generateId(),
          title: video.title.trim(),
          description: video.description?.trim() || '',
          youtubeUrl: video.youtubeUrl.trim(),
          thumbnail: ytThumb(videoId) || null,
          order: course.videos.length + index + 1
        }
      })

      course.videos = [...course.videos, ...newVideos]
      course.totalVideos = course.videos.length
      course.updatedAt = Date.now()

      if (isServerless) {
        console.log('Updating course in memory storage')
        memoryStorage[courseIndex] = course
      } else {
        console.log('Updating course in file system')
        courses[courseIndex] = course
        await writeCourses(courses)
      }

      return res.status(200).json(course)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}