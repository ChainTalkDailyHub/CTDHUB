import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://srqgmflodlowmybgxxeu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215YmdveGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODA2NTY1OSwiZXhwIjoyMDQzNjQxNjU5fQ.R60agPe0fGd9oJHIR6A0zqP0dxXn6CCNw7U3JHk4SzQ'

const supabase = createClient(supabaseUrl, supabaseKey)

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    console.log('📊 Video Analytics Function called:', event.httpMethod, event.path)

    // GET - Obter analytics de um vídeo/curso
    if (event.httpMethod === 'GET') {
      const { video_id, course_id } = event.queryStringParameters || {}

      if (course_id) {
        // Buscar analytics do curso
        const { data: analytics, error } = await supabase
          .from('course_analytics')
          .select('*')
          .eq('course_id', course_id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error fetching course analytics:', error)
          throw error
        }

        // Se não existe, criar entrada inicial
        if (!analytics) {
          const { data: newAnalytics, error: createError } = await supabase
            .from('course_analytics')
            .insert({
              course_id,
              total_views: 0,
              unique_viewers: 0,
              total_watch_time: 0,
              completion_rate: 0
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating course analytics:', createError)
            throw createError
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newAnalytics),
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(analytics),
        }
      }

      if (video_id) {
        // Buscar views do vídeo
        const { data: views, error } = await supabase
          .from('video_views')
          .select('*')
          .eq('video_id', video_id)

        if (error) {
          console.error('❌ Error fetching video views:', error)
          throw error
        }

        const totalViews = views?.length || 0
        const uniqueViewers = new Set(views?.map(v => v.viewer_address).filter(Boolean)).size
        const totalWatchTime = views?.reduce((sum, v) => sum + (v.view_duration || 0), 0) || 0

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            video_id,
            total_views: totalViews,
            unique_viewers: uniqueViewers,
            total_watch_time: totalWatchTime,
            views: views || []
          }),
        }
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'video_id or course_id is required' }),
      }
    }

    // POST - Registrar uma nova view
    if (event.httpMethod === 'POST') {
      const { video_id, course_id, viewer_address, view_duration, completed } = JSON.parse(event.body || '{}')

      if (!video_id || !course_id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'video_id and course_id are required' }),
        }
      }

      // Obter IP e User Agent
      const ip_address = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
      const user_agent = event.headers['user-agent'] || 'unknown'

      // Registrar a view
      const { data: newView, error: viewError } = await supabase
        .from('video_views')
        .insert({
          video_id,
          course_id,
          viewer_address: viewer_address || null,
          ip_address,
          user_agent,
          view_duration: view_duration || 0,
          completed: completed || false
        })
        .select()
        .single()

      if (viewError) {
        console.error('❌ Error inserting view:', viewError)
        throw viewError
      }

      // Atualizar analytics do curso
      await updateCourseAnalytics(course_id)

      console.log('✅ View registered successfully:', newView.id)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          view_id: newView.id,
          message: 'View registered successfully'
        }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }

  } catch (error) {
    console.error('❌ Video Analytics Error:', error)
    
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

// Função para atualizar analytics do curso
async function updateCourseAnalytics(course_id: string) {
  try {
    // Buscar todas as views do curso
    const { data: views, error } = await supabase
      .from('video_views')
      .select('*')
      .eq('course_id', course_id)

    if (error) throw error

    const totalViews = views?.length || 0
    const uniqueViewers = new Set(views?.map(v => v.viewer_address).filter(Boolean)).size
    const totalWatchTime = views?.reduce((sum, v) => sum + (v.view_duration || 0), 0) || 0
    const completedViews = views?.filter(v => v.completed).length || 0
    const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0

    // Atualizar ou inserir analytics
    const { error: upsertError } = await supabase
      .from('course_analytics')
      .upsert({
        course_id,
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        total_watch_time: totalWatchTime,
        completion_rate: parseFloat(completionRate.toFixed(2)),
        last_updated: new Date().toISOString()
      })

    if (upsertError) {
      console.error('❌ Error updating course analytics:', upsertError)
    } else {
      console.log('✅ Course analytics updated for:', course_id)
    }

  } catch (error) {
    console.error('❌ Error in updateCourseAnalytics:', error)
  }
}