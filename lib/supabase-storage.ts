import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Initialize Supabase directly with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   'process.env.SUPABASE_URL'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_ANON_KEY || 
                   'process.env.SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('📊 Supabase Storage initialized:', {
  url: supabaseUrl.substring(0, 30) + '...',
  key: supabaseKey.substring(0, 20) + '...'
})

export interface CourseVideo {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnail: string | null | undefined
  order: number
}

export interface Course {
  id: string
  title: string
  description: string
  author: string
  createdAt: number
  updatedAt: number
  videos: CourseVideo[]
  totalVideos: number
  totalDuration?: string
}

export async function readCoursesFromSupabase(): Promise<Course[]> {
  try {
    console.log('🔍 Reading courses from Supabase...')
    
    // Get courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('updated_at', { ascending: false })

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError)
      return []
    }

    console.log(`📚 Found ${courses?.length || 0} courses`)

    if (!courses || courses.length === 0) {
      return []
    }

    // Get videos for all courses
    const { data: videos, error: videosError } = await supabase
      .from('course_videos')
      .select('*')
      .order('order_index', { ascending: true })

    if (videosError) {
      console.error('Error fetching videos:', videosError)
      return []
    }

    // Transform UUID courses to short ID format that the app expects
    const coursesWithVideos = courses.map(course => {
      const courseVideos = videos?.filter(video => video.course_id === course.id) || []
      
      // Generate short IDs for compatibility
      const shortCourseId = Math.random().toString(36).substr(2, 9)
      
      return {
        id: shortCourseId,
        title: course.title,
        description: course.description,
        author: course.author,
        createdAt: new Date(course.created_at).getTime(),
        updatedAt: new Date(course.updated_at).getTime(),
        totalVideos: courseVideos.length,
        videos: courseVideos.map((video, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: video.title,
          description: video.description || '',
          youtubeUrl: video.youtube_url,
          thumbnail: video.thumbnail || ytThumb(ytIdFromUrl(video.youtube_url) || ''),
          order: video.order_index || index + 1
        }))
      }
    })

    return coursesWithVideos
  } catch (error) {
    console.error('Error reading courses from Supabase:', error)
    return []
  }
}

export async function writeCourseToSupabase(course: Course): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured')
    return false
  }

  try {
    // Insert course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        id: course.id,
        title: course.title,
        description: course.description,
        author: course.author,
        total_videos: course.totalVideos,
        created_at: new Date(course.createdAt).toISOString(),
        updated_at: new Date(course.updatedAt).toISOString()
      })
      .select()

    if (courseError) {
      console.error('Error inserting course:', courseError)
      return false
    }

    // Insert videos
    if (course.videos.length > 0) {
      const videosToInsert = course.videos.map(video => ({
        id: video.id,
        course_id: course.id,
        title: video.title,
        description: video.description,
        youtube_url: video.youtubeUrl,
        thumbnail: video.thumbnail,
        order_index: video.order
      }))

      const { error: videosError } = await supabase
        .from('course_videos')
        .insert(videosToInsert)

      if (videosError) {
        console.error('Error inserting videos:', videosError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error writing course to Supabase:', error)
    return false
  }
}

export async function getCourseByIdFromSupabase(courseId: string): Promise<Course | null> {
  if (!supabase) {
    console.log('Supabase not configured')
    return null
  }

  try {
    // Get course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      console.error('Error fetching course:', courseError)
      return null
    }

    // Get videos for this course
    const { data: videos, error: videosError } = await supabase
      .from('course_videos')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (videosError) {
      console.error('Error fetching videos:', videosError)
      return null
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      author: course.author,
      createdAt: new Date(course.created_at).getTime(),
      updatedAt: new Date(course.updated_at).getTime(),
      totalVideos: course.total_videos,
      videos: videos?.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        youtubeUrl: video.youtube_url,
        thumbnail: video.thumbnail || '',
        order: video.order_index
      })) || []
    }
  } catch (error) {
    console.error('Error getting course by ID from Supabase:', error)
    return null
  }
}

export function generateId(): string {
  return uuidv4()
}

export function ytIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

export function ytThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export async function addVideosToSupabaseCourse(courseId: string, newVideos: CourseVideo[]): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured')
    return false
  }

  try {
    // First, get the current course to verify it exists and get current video count
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('total_videos')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      console.error('Course not found or error:', courseError)
      return false
    }

    // Insert new videos
    const videosToInsert = newVideos.map(video => ({
      id: video.id,
      course_id: courseId,
      title: video.title,
      description: video.description,
      youtube_url: video.youtubeUrl,
      thumbnail: video.thumbnail,
      order_index: video.order,
      created_at: new Date().toISOString()
    }))

    const { error: videosError } = await supabase
      .from('course_videos')
      .insert(videosToInsert)

    if (videosError) {
      console.error('Error inserting videos:', videosError)
      return false
    }

    // Update course total_videos count and updated_at
    const newTotalVideos = course.total_videos + newVideos.length
    const { error: updateError } = await supabase
      .from('courses')
      .update({ 
        total_videos: newTotalVideos,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)

    if (updateError) {
      console.error('Error updating course total_videos:', updateError)
      return false
    }

    console.log('Videos added successfully to course:', courseId)
    return true
  } catch (error) {
    console.error('Error adding videos to Supabase course:', error)
    return false
  }
}