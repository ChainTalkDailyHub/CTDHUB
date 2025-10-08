import { useCallback } from 'react'

interface ViewTrackingOptions {
  videoId: string
  courseId: string
  viewerAddress?: string
  viewDuration?: number
  completed?: boolean
}

export const useViewTracking = () => {
  const registerView = useCallback(async (options: ViewTrackingOptions) => {
    try {
      const response = await fetch('/.netlify/functions/video-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: options.videoId,
          course_id: options.courseId,
          viewer_address: options.viewerAddress,
          view_duration: options.viewDuration || 0,
          completed: options.completed || false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to register view')
      }

      const result = await response.json()
      console.log('✅ View registered:', result)
      return result

    } catch (error) {
      console.error('❌ Error registering view:', error)
      return null
    }
  }, [])

  const getVideoAnalytics = useCallback(async (videoId: string) => {
    try {
      const response = await fetch(`/.netlify/functions/video-analytics?video_id=${videoId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      return await response.json()

    } catch (error) {
      console.error('❌ Error fetching video analytics:', error)
      return null
    }
  }, [])

  const getCourseAnalytics = useCallback(async (courseId: string) => {
    try {
      const response = await fetch(`/.netlify/functions/video-analytics?course_id=${courseId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch course analytics')
      }

      return await response.json()

    } catch (error) {
      console.error('❌ Error fetching course analytics:', error)
      return null
    }
  }, [])

  return {
    registerView,
    getVideoAnalytics,
    getCourseAnalytics
  }
}