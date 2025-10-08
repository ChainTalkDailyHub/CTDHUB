import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://srqgmflodlowmybgxxeu.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(supabaseUrl, supabaseKey)

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

function generateShortId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    console.log('🔄 Starting data migration from UUID to short IDs...')

    // 1. Get all courses with UUID
    const { data: uuidCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*')

    if (coursesError) {
      throw coursesError
    }

    // 2. Get all videos with UUID
    const { data: uuidVideos, error: videosError } = await supabase
      .from('course_videos')
      .select('*')

    if (videosError) {
      throw videosError
    }

    console.log(`📚 Found ${uuidCourses?.length || 0} courses and ${uuidVideos?.length || 0} videos`)

    // 3. Create mapping UUID -> short ID
    const courseIdMapping: Record<string, string> = {}
    const videoIdMapping: Record<string, string> = {}

    // Generate short IDs for courses
    uuidCourses?.forEach(course => {
      courseIdMapping[course.id] = generateShortId()
    })

    // Generate short IDs for videos
    uuidVideos?.forEach(video => {
      videoIdMapping[video.id] = generateShortId()
    })

    // 4. Transform courses to the expected format
    const transformedCourses = uuidCourses?.map(course => {
      const courseVideos = uuidVideos?.filter(video => video.course_id === course.id) || []
      
      return {
        id: courseIdMapping[course.id],
        title: course.title,
        description: course.description,
        author: course.author,
        createdAt: new Date(course.created_at).getTime(),
        updatedAt: new Date(course.updated_at).getTime(),
        totalVideos: courseVideos.length,
        videos: courseVideos.map(video => ({
          id: videoIdMapping[video.id],
          title: video.title,
          description: video.description || '',
          youtubeUrl: video.youtube_url,
          thumbnail: video.thumbnail,
          order: video.order_index
        }))
      }
    }) || []

    console.log('✅ Migration completed successfully')

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Data migration completed',
        originalCourses: uuidCourses?.length || 0,
        originalVideos: uuidVideos?.length || 0,
        transformedCourses: transformedCourses.length,
        courses: transformedCourses,
        mappings: {
          courses: courseIdMapping,
          videos: videoIdMapping
        }
      }, null, 2),
    }

  } catch (error) {
    console.error('❌ Migration error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}