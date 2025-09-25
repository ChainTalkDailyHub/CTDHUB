import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CourseCard from '@/components/CourseCard'
import { courses } from '@/lib/courses'

// Declare Ethereum interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}

interface Video {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  uploadDate: string
  views: number
  likes: number
  comments: Comment[]
  userLiked?: boolean
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
  likes: number
}

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'courses' | 'community'>('courses')
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const savedVideos = localStorage.getItem('developer-videos')
    if (savedVideos) {
      const parsedVideos = JSON.parse(savedVideos)
      // Add comments array if not exists and userLiked status
      const videosWithComments = parsedVideos.map((video: any) => ({
        ...video,
        comments: video.comments || [],
        userLiked: false
      }))
      setVideos(videosWithComments)
    }

    // Check wallet connection and admin status
    const checkWalletAndAdmin = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setIsConnected(true)
              setWalletAddress(accounts[0])
            }
          })
          .catch((error: any) => {
            console.error('Error checking wallet connection:', error)
          })
      }
    }

    checkWalletAndAdmin()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
        } else {
          setIsConnected(false)
          setWalletAddress('')
        }
      })
    }
  }, [])

  const likeVideo = (videoId: string) => {
    const updatedVideos = videos.map(video => {
      if (video.id === videoId) {
        const newLikes = video.userLiked ? video.likes - 1 : video.likes + 1
        return {
          ...video,
          likes: newLikes,
          userLiked: !video.userLiked
        }
      }
      return video
    })
    setVideos(updatedVideos)
    
    // Update in localStorage (developer-videos)
    const savedVideos = localStorage.getItem('developer-videos')
    if (savedVideos) {
      const originalVideos = JSON.parse(savedVideos)
      const updatedOriginalVideos = originalVideos.map((video: any) => {
        if (video.id === videoId) {
          const targetVideo = updatedVideos.find(v => v.id === videoId)
          return {
            ...video,
            likes: targetVideo?.likes || video.likes
          }
        }
        return video
      })
      localStorage.setItem('developer-videos', JSON.stringify(updatedOriginalVideos))
    }
  }

  const addComment = (videoId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      userName: `User${Math.floor(Math.random() * 1000)}`,
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    }

    const updatedVideos = videos.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          comments: [...video.comments, comment]
        }
      }
      return video
    })
    
    setVideos(updatedVideos)
    setNewComment('')

    // Update selected video if it's the one being commented on
    if (selectedVideo?.id === videoId) {
      setSelectedVideo({
        ...selectedVideo,
        comments: [...selectedVideo.comments, comment]
      })
    }
  }

  const openVideoModal = (video: Video) => {
    // Increment view count
    const updatedVideos = videos.map(v => 
      v.id === video.id ? { ...v, views: v.views + 1 } : v
    )
    setVideos(updatedVideos)
    
    // Update in localStorage
    const savedVideos = localStorage.getItem('developer-videos')
    if (savedVideos) {
      const originalVideos = JSON.parse(savedVideos)
      const updatedOriginalVideos = originalVideos.map((v: any) => 
        v.id === video.id ? { ...v, views: v.views + 1 } : v
      )
      localStorage.setItem('developer-videos', JSON.stringify(updatedOriginalVideos))
    }

    setSelectedVideo(updatedVideos.find(v => v.id === video.id) || video)
    setShowComments(true)
  }

  // Course management functions removed - no admin controls needed

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Learn <span className="text-[#FFC700]">Blockchain</span> & Web3
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Master blockchain technology through official courses and community-created content.
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-16">
            <div className="card p-2 flex">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'courses'
                    ? 'bg-[#FFC700] text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                📚 Official Courses
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'community'
                    ? 'bg-[#FFC700] text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                🎥 Community Videos ({videos.length})
              </button>
            </div>
          </div>

          {/* Official Courses */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="card group hover:scale-105 transition-all duration-200">
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {course.isSystemCourse && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#FFC700] text-black px-3 py-1 rounded-full text-xs font-bold">
                          Official
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFC700] transition-colors">{course.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{course.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span>By {course.creator || 'CTDHub Team'}</span>
                      </div>
                      <a
                        href={`/courses/${course.slug}`}
                        className="btn-primary"
                      >
                        Start Course
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Community Videos */}
          {activeTab === 'community' && (
            <div>
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map((video) => (
                    <div key={video.id} className="card group cursor-pointer hover:scale-105 transition-all duration-200">
                      <div 
                        className="aspect-video bg-gray-800 relative"
                        onClick={() => openVideoModal(video)}
                      >
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-4xl">📹</div>'
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 text-4xl">📹</div>
                        )}
                        
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-black text-2xl ml-1">▶</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-white">{video.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-3">{video.description}</p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>👁 {video.views} views</span>
                          <span>📅 {new Date(video.uploadDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              likeVideo(video.id)
                            }}
                            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                              video.userLiked 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {video.userLiked ? '❤️' : '🤍'} {video.likes}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openVideoModal(video)
                            }}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            💬 {video.comments.length}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Community Videos Yet</h3>
                  <p className="text-gray-400">
                    Community videos will appear here when developers start creating content.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {showComments && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">{selectedVideo.title}</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row max-h-[calc(90vh-80px)]">
              {/* Video Section */}
              <div className="md:w-2/3 p-4">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 text-center"
                  >
                    <div className="text-6xl mb-2">▶</div>
                    <div className="text-lg">Click to watch on external platform</div>
                  </a>
                </div>
                
                <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👁 {selectedVideo.views} views</span>
                  <span>📅 {new Date(selectedVideo.uploadDate).toLocaleDateString()}</span>
                  <button
                    onClick={() => likeVideo(selectedVideo.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                      selectedVideo.userLiked 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {selectedVideo.userLiked ? '❤️' : '🤍'} {selectedVideo.likes}
                  </button>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="md:w-1/3 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Comments ({selectedVideo.comments.length})</h4>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addComment(selectedVideo.id)
                        }
                      }}
                    />
                    <button
                      onClick={() => addComment(selectedVideo.id)}
                      className="bg-yellow-500 text-black px-3 py-2 rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedVideo.comments.length > 0 ? (
                    selectedVideo.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-yellow-400 text-sm">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-3xl mb-2">💬</div>
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}