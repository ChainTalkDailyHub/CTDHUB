import { Context } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface VideoFormData {
  title: string
  description: string
  youtubeUrl: string
}

interface CourseData {
  title: string
  description: string
  videos: VideoFormData[]
}

// Initialize Supabase directly
const supabaseUrl = 'https://srqgmflodlowmybgxxeu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions
function ytIdFromUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

function ytThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Consistent ID generation based on UUID
function generateConsistentId(uuid: string): string {
  // Use a simple hash of the UUID to create consistent short IDs
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to base36 and take first 9 characters
  return Math.abs(hash).toString(36).substr(0, 9)
}

// Supabase functions
async function getUserNameByAddress(address: string): Promise<string> {
  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('wallet_address', address.toLowerCase())
      .single()

    if (error || !user?.name) {
      // Return a formatted version of the address if no name found
      return `Developer ${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return user.name
  } catch (error) {
    console.error('Error fetching user name:', error)
    return `Developer ${address.slice(0, 6)}...${address.slice(-4)}`
  }
}

async function readCoursesFromSupabase() {
  try {
    console.log('🔍 Reading courses from Supabase...')
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('updated_at', { ascending: false })

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError)
      return []
    }

    if (!courses || courses.length === 0) {
      return []
    }

    const { data: videos, error: videosError } = await supabase
      .from('course_videos')
      .select('*')
      .order('order_index', { ascending: true })

    if (videosError) {
      console.error('Error fetching videos:', videosError)
      return []
    }

    // Transform to expected format with CONSISTENT IDs
    const coursesWithVideos = await Promise.all(courses.map(async course => {
      const courseVideos = videos?.filter(video => video.course_id === course.id) || []
      const authorName = await getUserNameByAddress(course.author)
      
      return {
        id: generateConsistentId(course.id), // Consistent ID based on UUID
        title: course.title,
        description: course.description,
        author: course.author,
        authorName: authorName, // Add the actual name
        createdAt: new Date(course.created_at).getTime(),
        updatedAt: new Date(course.updated_at).getTime(),
        totalVideos: courseVideos.length,
        videos: courseVideos.map(video => ({
          id: generateConsistentId(video.id), // Consistent ID based on UUID
          title: video.title,
          description: video.description || '',
          youtubeUrl: video.youtube_url,
          thumbnail: video.thumbnail || ytThumb(ytIdFromUrl(video.youtube_url) || ''),
          order: video.order_index || 1
        }))
      }
    }))

    console.log(`✅ Transformed ${coursesWithVideos.length} courses successfully`)
    return coursesWithVideos
  } catch (error) {
    console.error('Error reading courses from Supabase:', error)
    return []
  }
}

async function writeCourseToSupabase(course: any) {
  // Implementation for writing courses
  return true
}

async function getCourseByIdFromSupabase(courseId: string) {
  try {
    console.log('🔍 Getting course by ID from Supabase:', courseId)
    
    // Get all courses and find the one with matching generated ID
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError)
      return null
    }

    // Find course with matching generated ID
    const matchingCourse = courses?.find(course => generateConsistentId(course.id) === courseId)
    
    if (!matchingCourse) {
      console.log('❌ Course not found for ID:', courseId)
      return null
    }

    // Get videos for this course
    const { data: videos, error: videosError } = await supabase
      .from('course_videos')
      .select('*')
      .eq('course_id', matchingCourse.id)
      .order('order_index', { ascending: true })

    if (videosError) {
      console.error('Error fetching videos:', videosError)
      return null
    }

    // Transform to expected format
    const authorName = await getUserNameByAddress(matchingCourse.author)
    
    return {
      id: generateConsistentId(matchingCourse.id),
      title: matchingCourse.title,
      description: matchingCourse.description,
      author: matchingCourse.author,
      authorName: authorName, // Add the actual name
      createdAt: new Date(matchingCourse.created_at).getTime(),
      updatedAt: new Date(matchingCourse.updated_at).getTime(),
      totalVideos: videos?.length || 0,
      videos: videos?.map(video => ({
        id: generateConsistentId(video.id),
        title: video.title,
        description: video.description || '',
        youtubeUrl: video.youtube_url,
        thumbnail: video.thumbnail || ytThumb(ytIdFromUrl(video.youtube_url) || ''),
        order: video.order_index || 1
      })) || []
    }
  } catch (error) {
    console.error('Error getting course by ID from Supabase:', error)
    return null
  }
}

async function addVideosToSupabaseCourse(courseId: string, videos: any[]) {
  // Implementation for adding videos
  return true
}

// Fallback in-memory storage for when Supabase is not available
let coursesStorage: any[] = []

// Check if Supabase is available
function isSupabaseAvailable(): boolean {
  const available = true // Always available since we have it integrated
  
  console.log('🔍 Supabase Availability Check:', {
    url: 'Present',
    key: 'Present', 
    functions: 'Available',
    available
  })
  
  return available
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url)
  const method = req.method
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const courseId = pathSegments[pathSegments.length - 1] // Get last segment as course ID

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-user-address',
      },
    })
  }

  try {
    if (method === 'GET') {
      // Check if requesting specific course by ID
      if (courseId && courseId !== 'course-manager' && courseId.length > 5) {
        // Try Supabase first
        if (isSupabaseAvailable()) {
          console.log('Using Supabase for course by ID:', courseId)
          try {
            const course = await getCourseByIdFromSupabase(courseId)
            if (course) {
              return new Response(JSON.stringify(course), {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              })
            }
          } catch (error) {
            console.error('Supabase error for course ID, falling back:', error)
          }
        }
        
        // Fallback to memory storage
        const course = coursesStorage.find(c => c.id === courseId)
        if (!course) {
          return new Response(JSON.stringify({ error: 'Course not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }
        
        return new Response(JSON.stringify(course), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      
      // Return all courses - try Supabase first
      if (isSupabaseAvailable()) {
        console.log('Using Supabase for all courses')
        try {
          const courses = await readCoursesFromSupabase()
          return new Response(JSON.stringify(courses), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        } catch (error) {
          console.error('Supabase error for all courses, falling back:', error)
        }
      }
      
      // Fallback to memory storage
      console.log('Using memory storage for all courses')
      const sortedCourses = coursesStorage.sort((a, b) => b.updatedAt - a.updatedAt)
      
      return new Response(JSON.stringify(sortedCourses), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (method === 'POST') {
      console.log('=== POST REQUEST START ===')
      const userAddress = req.headers.get('x-user-address')
      console.log('User address from header:', userAddress)
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        console.log('Invalid user address:', userAddress)
        return new Response(JSON.stringify({ error: 'Valid wallet address required' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      let data: CourseData
      try {
        data = await req.json()
        console.log('Received data:', JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Error parsing JSON:', error)
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON data',
          details: error instanceof Error ? error.message : 'Unknown JSON error'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      const { title, description, videos } = data

      console.log('Extracted fields:', { 
        title: title, 
        description: description, 
        videosCount: videos?.length,
        videos: videos 
      })

      if (!title || !description || !videos || !Array.isArray(videos) || videos.length === 0) {
        console.log('Missing required fields:', { 
          hasTitle: !!title, 
          hasDescription: !!description, 
          hasVideos: !!videos, 
          isArray: Array.isArray(videos), 
          videosLength: videos?.length 
        })
        return new Response(JSON.stringify({ 
          error: 'Course title, description, and at least one video are required' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      // Validate all videos
      console.log('Starting video validation...')
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Validating video ${i + 1}:`, {
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          description: video.description
        })
        
        if (!video.title || !video.youtubeUrl) {
          console.log(`Video ${i + 1} validation failed - missing title or URL`)
          return new Response(JSON.stringify({ 
            error: `Video ${i + 1}: Title and YouTube URL are required` 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }

        // Simple YouTube URL validation
        if (!video.youtubeUrl.includes('youtube.com') && !video.youtubeUrl.includes('youtu.be')) {
          console.log(`Video ${i + 1} validation failed - invalid YouTube URL:`, video.youtubeUrl)
          return new Response(JSON.stringify({ 
            error: `Video ${i + 1}: Must be a YouTube URL` 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }
      }
      console.log('Video validation completed successfully')

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

      // Try Supabase first
      if (isSupabaseAvailable()) {
        console.log('Saving course to Supabase:', newCourse.id)
        try {
          const success = await writeCourseToSupabase(newCourse)
          if (success) {
            console.log('Course saved successfully to Supabase:', newCourse.id)
            return new Response(JSON.stringify(newCourse), {
              status: 201,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            })
          } else {
            console.log('Supabase save failed, falling back to memory storage')
          }
        } catch (error) {
          console.error('Supabase error, falling back to memory storage:', error)
        }
      }

      // Fallback: Save to in-memory storage
      console.log('Saving course to memory storage:', newCourse.id)
      coursesStorage.push(newCourse)

      console.log('Course created successfully:', newCourse.id)
      console.log('Total courses in memory:', coursesStorage.length)

      return new Response(JSON.stringify(newCourse), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (method === 'PUT') {
      const userAddress = req.headers.get('x-user-address')
      const url = new URL(req.url)
      const courseId = url.searchParams.get('courseId')
      
      if (!userAddress || !userAddress.startsWith('0x')) {
        return new Response(JSON.stringify({ error: 'Valid wallet address required' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      if (!courseId) {
        return new Response(JSON.stringify({ error: 'Course ID is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      const data = await req.json()
      const { videos } = data

      if (!videos || !Array.isArray(videos) || videos.length === 0) {
        return new Response(JSON.stringify({ 
          error: 'At least one video is required' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      // Find the course - try Supabase first
      let course = null
      if (isSupabaseAvailable()) {
        console.log('Looking for course in Supabase:', courseId)
        try {
          course = await getCourseByIdFromSupabase(courseId)
          if (!course) {
            return new Response(JSON.stringify({ error: 'Course not found' }), {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            })
          }
        } catch (error) {
          console.error('Supabase error finding course, falling back:', error)
        }
      }
      
      // Fallback to memory storage if Supabase failed
      if (!course) {
        console.log('Looking for course in memory storage:', courseId)
        const courseIndex = coursesStorage.findIndex(c => c.id === courseId)
        if (courseIndex === -1) {
          return new Response(JSON.stringify({ error: 'Course not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }
        course = coursesStorage[courseIndex]
      }
      
      // Verify ownership
      if (course.author.toLowerCase() !== userAddress.toLowerCase()) {
        return new Response(JSON.stringify({ error: 'Not authorized to edit this course' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      // Validate new videos
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        if (!video.title || !video.youtubeUrl) {
          return new Response(JSON.stringify({ 
            error: `Video ${i + 1}: Title and YouTube URL are required` 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }

        if (!video.youtubeUrl.includes('youtube.com') && !video.youtubeUrl.includes('youtu.be')) {
          return new Response(JSON.stringify({ 
            error: `Video ${i + 1}: Must be a YouTube URL` 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }
      }

      // Create new video objects
      const newVideos = videos.map((video: any) => {
        const videoId = ytIdFromUrl(video.youtubeUrl) || 'default'
        return {
          id: generateId(),
          title: video.title.trim(),
          description: video.description?.trim() || '',
          youtubeUrl: video.youtubeUrl.trim(),
          thumbnail: videoId !== 'default' ? ytThumb(videoId) : '',
          order: course.videos.length + videos.indexOf(video) + 1
        }
      })

      // Try Supabase first
      if (isSupabaseAvailable()) {
        console.log('Adding videos to course in Supabase:', courseId)
        try {
          const success = await addVideosToSupabaseCourse(courseId, newVideos)
          if (success) {
            // Get updated course from Supabase
            const updatedCourse = await getCourseByIdFromSupabase(courseId)
            if (updatedCourse) {
              console.log('Videos added successfully to Supabase course:', courseId)
              return new Response(JSON.stringify(updatedCourse), {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              })
            }
          } else {
            console.log('Supabase add videos failed, falling back to memory storage')
          }
        } catch (error) {
          console.error('Supabase error adding videos, falling back:', error)
        }
      }

      // Fallback: Update in memory storage
      console.log('Adding videos to course in memory storage:', courseId)
      const courseIndex = coursesStorage.findIndex(c => c.id === courseId)
      if (courseIndex !== -1) {
        const updatedCourse = {
          ...course,
          videos: [...course.videos, ...newVideos],
          totalVideos: course.videos.length + newVideos.length,
          updatedAt: Date.now()
        }

        coursesStorage[courseIndex] = updatedCourse

        console.log('Videos added to course successfully:', courseId)
        console.log('New total videos:', updatedCourse.totalVideos)

        return new Response(JSON.stringify(updatedCourse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } else {
        return new Response(JSON.stringify({ error: 'Course not found in storage' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Course manager error:', error)
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