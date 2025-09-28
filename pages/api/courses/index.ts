import { NextApiRequest, NextApiResponse } from 'next'
import { readCourses, writeCourses, generateId, ytIdFromUrl, ytThumb } from '../../../lib/courses-storage'
import { readCoursesFromSupabase, writeCourseToSupabase, Course, CourseVideo } from '../../../lib/supabase-storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Try Supabase first, fallback to file system
      const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      let courses
      if (useSupabase) {
        console.log('Using Supabase for courses')
        courses = await readCoursesFromSupabase()
      } else {
        console.log('Using file system for courses')
        courses = await readCourses()
        courses = courses.sort((a, b) => b.updatedAt - a.updatedAt)
      }
      
      return res.status(200).json(courses)
    }

    if (req.method === 'POST') {
      console.log('POST request received:', req.body)
      const userAddress = req.headers['x-user-address'] as string
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(401).json({ error: 'Valid wallet address required' })
      }

      const { title, description, videos } = req.body

      if (!title || !description || !videos || !Array.isArray(videos) || videos.length === 0) {
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

      const courseVideos: CourseVideo[] = videos.map((video: any, index: number) => {
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

      const newCourse: Course = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        author: userAddress.toLowerCase(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        videos: courseVideos,
        totalVideos: courseVideos.length
      }

      // Try Supabase first, fallback to file system
      const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (useSupabase) {
        console.log('Saving course to Supabase')
        const success = await writeCourseToSupabase(newCourse)
        if (!success) {
          return res.status(500).json({ error: 'Failed to save course to database' })
        }
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

      const courses = await readCourses()
      const courseIndex = courses.findIndex(c => c.id === courseId)

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
      const newVideos: CourseVideo[] = videos.map((video: any, index: number) => {
        const videoId = ytIdFromUrl(video.youtubeUrl)!
        return {
          id: generateId(),
          title: video.title.trim(),
          description: video.description?.trim() || '',
          youtubeUrl: video.youtubeUrl.trim(),
          thumbnail: ytThumb(videoId),
          order: course.videos.length + index + 1
        }
      })

      course.videos = [...course.videos, ...newVideos]
      course.totalVideos = course.videos.length
      course.updatedAt = Date.now()

      courses[courseIndex] = course
      await writeCourses(courses)

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