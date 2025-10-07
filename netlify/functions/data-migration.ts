import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

const handler: Handler = async (event, context) => {
  console.log('Data Migration Function - Method:', event.httpMethod)

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-address',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    if (event.httpMethod === 'GET') {
      // GET - Check existing data and provide migration status
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase not configured' }),
        }
      }

      // Check what data exists in each table
      const tables = ['courses', 'course_videos', 'video_comments', 'user_profiles']
      const dataStatus: any = {}

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(5)

          if (error) {
            dataStatus[table] = { error: error.message, count: 0, samples: [] }
          } else {
            dataStatus[table] = { 
              count: data?.length || 0, 
              samples: data || [],
              error: null 
            }
          }
        } catch (err) {
          dataStatus[table] = { 
            error: err instanceof Error ? err.message : 'Unknown error', 
            count: 0, 
            samples: [] 
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Data migration status check completed',
          timestamp: new Date().toISOString(),
          supabase_configured: true,
          data_status: dataStatus
        }),
      }
    }

    if (event.httpMethod === 'POST') {
      // POST - Migrate or backup local data to Supabase
      const userAddress = event.headers['x-user-address']

      if (!userAddress || !userAddress.startsWith('0x')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Valid wallet address required in x-user-address header' }),
        }
      }

      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase not configured for migration' }),
        }
      }

      let body
      try {
        body = JSON.parse(event.body || '{}')
      } catch (parseError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON body' }),
        }
      }

      const { localCourses, localComments, localProfiles } = body
      const migrationResults: any = {}

      // Migrate courses
      if (localCourses && Array.isArray(localCourses)) {
        try {
          for (const course of localCourses) {
            // Check if course already exists
            const { data: existingCourse } = await supabase
              .from('courses')
              .select('id')
              .eq('id', course.id)
              .single()

            if (!existingCourse) {
              // Insert course
              const { error: courseError } = await supabase
                .from('courses')
                .insert([{
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  author: course.author || userAddress,
                  thumbnail: course.thumbnail,
                  created_at: course.createdAt || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }])

              if (courseError) {
                console.error('Error migrating course:', courseError)
                migrationResults.courses = migrationResults.courses || []
                migrationResults.courses.push({ course_id: course.id, error: courseError.message })
              }

              // Insert course videos
              if (course.videos && Array.isArray(course.videos)) {
                for (const video of course.videos) {
                  const { error: videoError } = await supabase
                    .from('course_videos')
                    .insert([{
                      id: video.id,
                      course_id: course.id,
                      title: video.title,
                      description: video.description,
                      youtube_url: video.youtubeUrl,
                      thumbnail: video.thumbnail,
                      duration: video.duration,
                      order_index: video.orderIndex || 0,
                      created_at: video.createdAt || new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }])

                  if (videoError) {
                    console.error('Error migrating video:', videoError)
                    migrationResults.videos = migrationResults.videos || []
                    migrationResults.videos.push({ video_id: video.id, error: videoError.message })
                  }
                }
              }
            }
          }
          migrationResults.courses_migrated = localCourses.length
        } catch (error) {
          migrationResults.courses_error = error instanceof Error ? error.message : 'Unknown error'
        }
      }

      // Migrate comments
      if (localComments && Array.isArray(localComments)) {
        try {
          for (const comment of localComments) {
            const { data: existingComment } = await supabase
              .from('video_comments')
              .select('id')
              .eq('id', comment.id)
              .single()

            if (!existingComment) {
              const { error: commentError } = await supabase
                .from('video_comments')
                .insert([{
                  id: comment.id,
                  video_id: comment.video_id,
                  user_address: comment.user_address,
                  user_name: comment.user_name,
                  comment: comment.comment,
                  created_at: comment.created_at || new Date().toISOString()
                }])

              if (commentError) {
                console.error('Error migrating comment:', commentError)
                migrationResults.comments = migrationResults.comments || []
                migrationResults.comments.push({ comment_id: comment.id, error: commentError.message })
              }
            }
          }
          migrationResults.comments_migrated = localComments.length
        } catch (error) {
          migrationResults.comments_error = error instanceof Error ? error.message : 'Unknown error'
        }
      }

      // Migrate profiles
      if (localProfiles && Array.isArray(localProfiles)) {
        try {
          for (const profile of localProfiles) {
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('wallet_address', profile.wallet_address.toLowerCase())
              .single()

            if (!existingProfile) {
              const { error: profileError } = await supabase
                .from('user_profiles')
                .insert([{
                  wallet_address: profile.wallet_address.toLowerCase(),
                  name: profile.name,
                  profession: profile.profession,
                  web3_experience: profile.web3_experience,
                  project_name: profile.project_name,
                  bio: profile.bio,
                  avatar_url: profile.avatar_url,
                  created_at: profile.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }])

              if (profileError) {
                console.error('Error migrating profile:', profileError)
                migrationResults.profiles = migrationResults.profiles || []
                migrationResults.profiles.push({ wallet_address: profile.wallet_address, error: profileError.message })
              }
            }
          }
          migrationResults.profiles_migrated = localProfiles.length
        } catch (error) {
          migrationResults.profiles_error = error instanceof Error ? error.message : 'Unknown error'
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Data migration completed',
          timestamp: new Date().toISOString(),
          migration_results: migrationResults
        }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  } catch (error) {
    console.error('Migration function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export { handler }