import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import AddVideoForm from '../../components/AddVideoForm'
import { Course } from '../../lib/courses-storage'
import { short } from '../../lib/storage'

export default function CourseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [course, setCourse] = useState<Course | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showAddVideos, setShowAddVideos] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check wallet connection
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setUserAddress(stored)
    }
    
    if (id) {
      loadCourse(id as string)
    }
  }, [id])

  const loadCourse = async (courseId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/.netlify/functions/course-manager/${courseId}`)
      if (response.ok) {
        const foundCourse = await response.json()
        setCourse(foundCourse)
      } else {
        setNotFound(true)
      }
    } catch (error) {
      console.error('Failed to load course:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const handleAddVideos = async (videos: Array<{title: string, description: string, youtubeUrl: string}>) => {
    if (!userAddress || !course) throw new Error('Authentication required')

    const response = await fetch(`/.netlify/functions/course-manager?courseId=${course.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-address': userAddress
      },
      body: JSON.stringify({ videos })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add videos')
    }

    const updatedCourse = await response.json()
    setCourse(updatedCourse)
    setShowAddVideos(false)
    
    alert(`Videos added successfully! Module now has ${updatedCourse.totalVideos} videos.`)
  }

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!userAddress || !course) throw new Error('Authentication required')

    const confirmDelete = confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)
    if (!confirmDelete) return

    try {
      const response = await fetch(`/.netlify/functions/course-manager?courseId=${course.id}&videoId=${videoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete video')
      }

      const result = await response.json()
      setCourse(result.course)
      
      // Adjust current video index if needed
      if (currentVideoIndex >= result.course.totalVideos) {
        setCurrentVideoIndex(Math.max(0, result.course.totalVideos - 1))
      }
      
      alert('Video deleted successfully!')
    } catch (error) {
      console.error('Error deleting video:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete video')
    }
  }

  const handleDeleteCourse = async () => {
    if (!userAddress || !course) throw new Error('Authentication required')

    const confirmDelete = confirm(`Are you sure you want to delete the entire course "${course.title}"? This will delete all videos and cannot be undone.`)
    if (!confirmDelete) return

    const doubleConfirm = confirm('This is your last chance! This action will permanently delete all course content. Continue?')
    if (!doubleConfirm) return

    try {
      const response = await fetch(`/.netlify/functions/course-manager?courseId=${course.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete course')
      }

      alert('Course deleted successfully!')
      router.push('/dev')
    } catch (error) {
      console.error('Error deleting course:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete course')
    }
  }

  const isOwner = course && userAddress && course.author.toLowerCase() === userAddress.toLowerCase()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen ctd-bg">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <div className="ctd-text text-lg">Loading course...</div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen ctd-bg">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold ctd-text mb-4">Course Not Found</h1>
            <p className="ctd-mute mb-8">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/courses"
              className="inline-block bg-ctd-yellow hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Back to Courses
            </a>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const currentVideo = course.videos[currentVideoIndex]
  const embedUrl = currentVideo ? getYouTubeEmbedUrl(currentVideo.youtubeUrl) : null

  return (
    <div className="min-h-screen ctd-bg">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm ctd-mute mb-4">
              <a href="/courses" className="hover:text-ctd-yellow">Courses</a>
              <span>•</span>
              <span>{course.title}</span>
            </div>
            
            <h1 className="text-4xl font-bold ctd-text mb-4">{course.title}</h1>
            
            <div className="flex items-center gap-6 text-sm ctd-mute mb-6">
              <span>By {short(course.author)}</span>
              <span>•</span>
              <span>{course.totalVideos} videos</span>
              <span>•</span>
              <span>Updated {formatDate(course.updatedAt)}</span>
            </div>

            <p className="ctd-text-secondary text-lg leading-relaxed mb-8">
              {course.description}
            </p>
            
            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowAddVideos(true)}
                  className="bg-ctd-yellow hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  + Add Videos
                </button>
                <button
                  onClick={() => router.push(`/dev?edit=${course.id}`)}
                  className="ctd-panel hover:bg-gray-600 dark:hover:bg-gray-600 ctd-text font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Edit Module
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  🗑️ Delete Course
                </button>
              </div>
            )}
          </div>

          {/* Add Videos Form */}
          {showAddVideos && isOwner && (
            <div className="mb-8">
              <AddVideoForm
                courseId={course.id}
                courseTitle={course.title}
                onAddVideos={handleAddVideos}
                onCancel={() => setShowAddVideos(false)}
              />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="ctd-panel rounded-2xl ctd-border overflow-hidden">
                {embedUrl ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      title={currentVideo.title}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <p className="ctd-mute">Unable to load video</p>
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold ctd-text mb-2">
                    {currentVideo.title}
                  </h2>
                  
                  {currentVideo.description && (
                    <p className="ctd-text-secondary mb-4">
                      {currentVideo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Playlist */}
            <div className="ctd-panel rounded-2xl ctd-border p-6">
              <h3 className="text-lg font-bold ctd-text mb-4">
                Course Videos ({course.totalVideos})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {course.videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      index === currentVideoIndex
                        ? 'bg-ctd-yellow/20 border-ctd-yellow ctd-text'
                        : 'ctd-panel ctd-border ctd-text-secondary hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-8 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
                        {video.thumbnail && (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium ctd-mute">
                            {index + 1}.
                          </span>
                          {index === currentVideoIndex && (
                            <span className="text-xs text-ctd-yellow">▶ Playing</span>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2">
                          {video.title}
                        </h4>
                      </div>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteVideo(video.id, video.title)
                          }}
                          className="flex-shrink-0 p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                          title="Delete this video"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}