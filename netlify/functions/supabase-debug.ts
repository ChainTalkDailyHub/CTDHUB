import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://srqgmflodlowmybgxxeu.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(supabaseUrl, supabaseKey)

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    console.log('🔍 Debugging Supabase data...')

    // Check courses table
    const { data: courses, error: coursesError, count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact' })

    // Check course_videos table
    const { data: videos, error: videosError, count: videosCount } = await supabase
      .from('course_videos')
      .select('*', { count: 'exact' })

    // Check video_comments table
    const { data: comments, error: commentsError, count: commentsCount } = await supabase
      .from('video_comments')
      .select('*', { count: 'exact' })

    const results = {
      courses: {
        count: coursesCount,
        error: coursesError,
        data: courses?.slice(0, 3) // Show first 3 for debugging
      },
      videos: {
        count: videosCount,
        error: videosError,
        data: videos?.slice(0, 3)
      },
      comments: {
        count: commentsCount,
        error: commentsError,
        data: comments?.slice(0, 3)
      },
      timestamp: new Date().toISOString()
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results, null, 2),
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}