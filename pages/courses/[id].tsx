import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Course } from '../../lib/courses-storage'
import { short } from '../../lib/storage'

export default function CourseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [course, setCourse] = useState<Course | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      loadCourse(id as string)
    }
  }, [id])

  const loadCourse = async (courseId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${courseId}`)
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <div className="text-white text-lg">Loading course...</div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
            <p className="text-gray-400 mb-8">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/courses"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <a href="/courses" className="hover:text-yellow-400">Courses</a>
              <span>•</span>
              <span>{course.title}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
              <span>By {short(course.author)}</span>
              <span>•</span>
              <span>{course.totalVideos} videos</span>
              <span>•</span>
              <span>Updated {formatDate(course.updatedAt)}</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {course.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
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
                  <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-400">Unable to load video</p>
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentVideo.title}
                  </h2>
                  
                  {currentVideo.description && (
                    <p className="text-gray-300 mb-4">
                      {currentVideo.description}
                    </p>
                  )}
                  
                  <div className="flex gap-4">
                    <a
                      href={currentVideo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Playlist */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Course Videos ({course.totalVideos})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {course.videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      index === currentVideoIndex
                        ? 'bg-yellow-500/20 border-yellow-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-8 bg-gray-600 rounded overflow-hidden">
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
                          <span className="text-xs font-medium text-gray-400">
                            {index + 1}.
                          </span>
                          {index === currentVideoIndex && (
                            <span className="text-xs text-yellow-400">▶ Playing</span>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2">
                          {video.title}
                        </h4>
                      </div>
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