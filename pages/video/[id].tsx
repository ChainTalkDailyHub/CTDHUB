import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { createClient } from '@supabase/supabase-js'

interface Video {
  id: string
  title: string
  description?: string
  youtubeUrl: string
  thumbnail?: string
  author: string
  courseId: string
  courseName: string
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
      
      // Buscar todos os cursos para encontrar o vídeo específico
      const response = await fetch('/api/courses')
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
              courseId: course.id,
              courseName: course.title
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
        } else {
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
      const { data, error } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading comments:', error)
      } else {
        setComments(data || [])
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !isConnected || !video) return
    
    try {
      setIsSubmittingComment(true)
      
      const { error } = await supabase
        .from('video_comments')
        .insert([{
          video_id: video.id,
          user_address: userAddress,
          user_name: userProfile?.name || `User ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
          comment: newComment.trim()
        }])
      
      if (error) {
        throw error
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <div className="text-white text-lg">Loading video...</div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  if (notFound || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Video Not Found</h1>
            <p className="text-gray-400 mb-8">
              The video you're looking for doesn't exist or has been removed.
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

  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Video Player and Details */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden mb-6">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full aspect-video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-400">Unable to load video</span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="bg-gray-900 rounded-2xl p-6 mb-6">
                <h1 className="text-2xl font-bold text-white mb-4">{video.title}</h1>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">
                          {authorProfile?.name ? authorProfile.name.charAt(0) : '👤'}
                        </span>
                      </div>
                      <div>
                        <p className="text-yellow-400 font-semibold text-lg">
                          {authorProfile?.name || 'Developer'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {authorProfile?.project_name ? `Project: ${authorProfile.project_name}` : 'Blockchain Developer'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      From: <span className="text-gray-300">{video.courseName}</span>
                    </p>
                  </div>
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Watch on YouTube
                  </a>
                </div>

                {video.description && (
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-300 leading-relaxed">{video.description}</p>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Comments ({comments.length})
                </h3>

                {/* Comment Form */}
                {isConnected ? (
                  <div className="mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
                          {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts about this video..."
                          className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={submitComment}
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                          >
                            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-gray-300 text-center">
                      <span className="text-yellow-400">Connect your wallet</span> to leave comments and suggestions
                    </p>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
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
                            <span className="font-semibold text-white">
                              {comment.user_name || `${comment.user_address.slice(0, 6)}...${comment.user_address.slice(-4)}`}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">
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
              <div className="bg-gray-900 rounded-2xl p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {authorProfile?.name ? authorProfile.name.charAt(0) : '👤'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      More from {authorProfile?.name || 'Developer'}
                    </h3>
                    {authorProfile?.project_name && (
                      <p className="text-sm text-yellow-400">
                        {authorProfile.project_name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {relatedVideos.length === 0 ? (
                    <p className="text-gray-400 text-sm">No other videos available</p>
                  ) : (
                    relatedVideos.map((relVideo) => (
                      <a
                        key={relVideo.id}
                        href={`/video/${relVideo.id}`}
                        className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-20 h-12 bg-gray-600 rounded overflow-hidden">
                            {relVideo.thumbnail && (
                              <img
                                src={relVideo.thumbnail}
                                alt={relVideo.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-white line-clamp-2 mb-1">
                              {relVideo.title}
                            </h4>
                            <p className="text-xs text-gray-400">
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