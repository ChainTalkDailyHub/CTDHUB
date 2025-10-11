import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'process.env.SUPABASE_URL';
const SUPABASE_ANON_KEY = 'process.env.SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate consistent ID based on UUID
function generateConsistentId(uuid: string): string {
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).substr(0, 9)
}

export async function handler(event: any, context: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing id parameter' })
    };
  }

  try {
    // Get all videos from Supabase
    const { data: videos, error } = await supabase
      .from('course_videos')
      .select('*')

    if (error) {
      console.error('Error fetching videos:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch videos' })
      };
    }

    // Check if it's a UUID format (old ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    let redirectId = null;

    if (isUUID) {
      // Find video with this UUID and convert to consistent ID
      const video = videos?.find(v => v.id === id);
      if (video) {
        redirectId = generateConsistentId(video.id);
      }
    } else {
      // Check if it's already a valid consistent ID
      const foundVideo = videos?.find(v => generateConsistentId(v.id) === id);
      if (foundVideo) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            found: true, 
            id: id,
            videoTitle: foundVideo.title 
          })
        };
      }
    }

    if (redirectId) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          redirect: true, 
          newId: redirectId,
          message: 'Redirecting to updated video ID' 
        })
      };
    }

    // If not found, list available videos
    const availableVideos = videos?.map(v => ({
      id: generateConsistentId(v.id),
      title: v.title,
      originalId: v.id
    })) || [];

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: 'Video not found',
        requestedId: id,
        availableVideos: availableVideos
      })
    };

  } catch (error) {
    console.error('Error in video finder:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}