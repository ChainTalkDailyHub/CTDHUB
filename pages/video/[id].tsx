import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { createClient } from '@supabase/supabase-js'
import { useViewTracking } from '../../lib/useViewTracking'

interface Video {
  id: string
  title: string
  description?: string
  youtubeUrl: string
  thumbnail?: string
  author: string
  authorName?: string
  courseId: string
  courseName: string
  courseDescription?: string
  duration?: string
  publishedAt: number
}

interface Comment {
  id: string
  video_id: string
  user_address: string
  user_name?: string
  comment: string
  created_at: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function VideoPage() {
  const router = useRouter()
  const { id } = router.query
  const { registerView } = useViewTracking()
  const viewRegistered = useRef(false)
  const watchStartTime = useRef<number>(0)
  
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [authorProfile, setAuthorProfile] = useState<any>(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) {
      loadVideo(id as string)
      loadComments(id as string)
    }
  }, [id])

  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setUserAddress(stored)
      loadUserProfile(stored)
    }
  }, [])

  const loadVideo = async (videoId: string) => {
    try {
      setIsLoading(true)
      
      // First, try to find the video with the current ID
      const response = await fetch('/.netlify/functions/course-manager')
      if (response.ok) {
        const courses = await response.json()
        
        let foundVideo: Video | null = null
        let foundCourse: any = null
        
        // Procurar o vídeo em todos os cursos
        for (const course of courses) {
          const videoInCourse = course.videos.find((v: any) => v.id === videoId)
          if (videoInCourse) {
            foundVideo = {
              ...videoInCourse,
              author: course.author,
              authorName: course.authorName || `Developer ${course.author.slice(0, 6)}...${course.author.slice(-4)}`,
              courseId: course.id,
              courseName: course.title,
              courseDescription: course.description
            }
            foundCourse = course
            break
          }
        }
        
        if (foundVideo && foundCourse) {
          setVideo(foundVideo)
          
          // Carregar perfil do autor
          loadAuthorProfile(foundCourse.author)
          
          // Carregar vídeos relacionados do mesmo autor
          const authorVideos = courses
            .filter((course: any) => course.author === foundCourse.author)
            .flatMap((course: any) => 
              course.videos.map((v: any) => ({
                ...v,
                author: course.author,
                courseId: course.id,
                courseName: course.title
              }))
            )
            .filter((v: Video) => v.id !== videoId)
            .slice(0, 10) // Limitar a 10 vídeos relacionados
          
          setRelatedVideos(authorVideos)
          
          // Registrar view quando o vídeo for carregado
          if (!viewRegistered.current) {
            watchStartTime.current = Date.now()
            registerView({
              videoId: foundVideo.id,
              courseId: foundCourse.id,
              viewerAddress: isConnected ? userAddress : undefined
            })
            viewRegistered.current = true
          }
        } else {
          // Try to check if it's an old UUID that needs to be converted
          const finderResponse = await fetch(`/.netlify/functions/video-finder?id=${videoId}`)
          if (finderResponse.ok) {
            const finderData = await finderResponse.json()
            if (finderData.redirect) {
              // Redirect to the correct ID
              router.replace(`/video/${finderData.newId}`)
              return
            } else if (finderData.availableVideos && finderData.availableVideos.length > 0) {
              // Show available videos instead of error
              setRelatedVideos(finderData.availableVideos.map((v: any) => ({
                id: v.id,
                title: v.title,
                author: '',
                courseId: '',
                courseName: 'Available Video',
                youtubeUrl: ''
              })))
            }
          }
          setNotFound(true)
        }
      } else {
        setNotFound(true)
      }
    } catch (error) {
      console.error('Failed to load video:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async (address: string) => {
    try {
      const response = await fetch(`/api/profile?walletAddress=${address}`)
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadAuthorProfile = async (address: string) => {
    try {
      const response = await fetch(`/api/profile?walletAddress=${address}`)
      if (response.ok) {
        const profile = await response.json()
        setAuthorProfile(profile)
      }
    } catch (error) {
      console.error('Error loading author profile:', error)
    }
  }

  const loadComments = async (videoId: string) => {
    try {
      const response = await fetch(`/.netlify/functions/video-comments?videoId=${videoId}`)
      if (response.ok) {
        const comments = await response.json()
        setComments(comments || [])
      } else {
        console.error('Failed to load comments:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !isConnected || !video) return
    
    try {
      setIsSubmittingComment(true)
      
      const response = await fetch('/.netlify/functions/video-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.id,
          userAddress: userAddress,
          userName: userProfile?.name || userAddress.slice(0, 6) + '...' + userAddress.slice(-4),
          comment: newComment.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }
      
      setNewComment('')
      loadComments(video.id) // Recarregar comentários
      
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Error submitting comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <div className="text-gray-900 dark:text-white text-lg">Loading video...</div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  if (notFound || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">❌</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Video Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                The video ID <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-orange-600 dark:text-yellow-400">{id}</code> doesn't exist.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                This might be an old link or the video may have been moved.
              </p>
              
              {relatedVideos.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Available Videos:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {relatedVideos.slice(0, 6).map((availableVideo) => (
                      <div key={availableVideo.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                        <h4 className="text-gray-900 dark:text-white font-semibold mb-2 text-sm">{availableVideo.title}</h4>
                        <button
                          onClick={() => router.push(`/video/${availableVideo.id}`)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded transition-colors"
                        >
                          Watch Video
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={() => router.push('/courses')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Browse All Courses
                </button>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
      <Header />
      
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Video Player and Details */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden mb-6 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full aspect-video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400">Unable to load video</span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{video.title}</h1>
                
                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {video.authorName ? video.authorName.charAt(0) : '👤'}
                    </span>
                  </div>
                  <div>
                    <p className="text-orange-600 dark:text-yellow-400 font-semibold text-lg">
                      Created by: {video.authorName || 'Developer'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {authorProfile?.project_name ? `Project: ${authorProfile.project_name}` : 'Blockchain Developer'}
                    </p>
                  </div>
                </div>

                {/* Module/Course Info */}
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">📚 About the Module</h3>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">
                    Module: <span className="text-gray-700 dark:text-gray-300">{video.courseName}</span>
                  </p>
                  {video.courseDescription && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {video.courseDescription}
                    </p>
                  )}
                </div>

                {/* Video Description */}
                {video.description && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">🎥 About this Video</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{video.description}</p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Course: {video.courseName}</span>
                  <span>Instructor: {video.authorName || 'Developer'}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Comments ({comments.length})
                </h3>

                {/* Comment Form */}
                {isConnected ? (
                  <div className="mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts about this video..."
                          className="w-full p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={submitComment}
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
                          >
                            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 text-center">
                      <span className="text-orange-600 dark:text-yellow-400">Connect your wallet</span> to leave comments and suggestions
                    </p>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {comment.user_name ? comment.user_name.charAt(0) : 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {comment.user_name || `${comment.user_address.slice(0, 6)}...${comment.user_address.slice(-4)}`}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Related Videos */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sticky top-24 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {video.authorName ? video.authorName.charAt(0) : '👤'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      More from {video.authorName || 'Developer'}
                    </h3>
                    {authorProfile?.project_name && (
                      <p className="text-sm text-orange-600 dark:text-yellow-400">
                        {authorProfile.project_name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {relatedVideos.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No other videos available</p>
                  ) : (
                    relatedVideos.map((relVideo) => (
                      <a
                        key={relVideo.id}
                        href={`/video/${relVideo.id}`}
                        className="block p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-20 h-12 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
                            {relVideo.thumbnail && (
                              <img
                                src={relVideo.thumbnail}
                                alt={relVideo.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                              {relVideo.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {relVideo.courseName}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}