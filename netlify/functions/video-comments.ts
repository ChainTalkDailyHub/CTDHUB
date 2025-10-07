import { Context } from '@netlify/functions'

// Supabase imports with error handling
let supabase: any = null

try {
  const { createClient } = require('@supabase/supabase-js')
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
} catch (error) {
  console.log('Supabase not available for comments:', error)
}

// Check if Supabase is available
function isSupabaseAvailable(): boolean {
  return !!(supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url)
  const method = req.method

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    if (!isSupabaseAvailable()) {
      return new Response(JSON.stringify({ error: 'Comments service not available' }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (method === 'GET') {
      const videoId = url.searchParams.get('videoId')
      
      if (!videoId) {
        return new Response(JSON.stringify({ error: 'Video ID is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      const { data: comments, error } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching comments:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      return new Response(JSON.stringify(comments || []), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (method === 'POST') {
      const data = await req.json()
      const { videoId, userAddress, userName, comment } = data

      if (!videoId || !userAddress || !comment) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      const { data: newComment, error } = await supabase
        .from('video_comments')
        .insert([{
          video_id: videoId,
          user_address: userAddress,
          user_name: userName || userAddress.slice(0, 6) + '...' + userAddress.slice(-4),
          comment: comment.trim()
        }])
        .select()

      if (error) {
        console.error('Error creating comment:', error)
        return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      return new Response(JSON.stringify(newComment[0]), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (method === 'DELETE') {
      const data = await req.json()
      const { commentId, userAddress } = data

      if (!commentId || !userAddress) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      // Only allow users to delete their own comments
      const { error } = await supabase
        .from('video_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_address', userAddress)

      if (error) {
        console.error('Error deleting comment:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete comment' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      return new Response(JSON.stringify({ message: 'Comment deleted successfully' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Comments function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}