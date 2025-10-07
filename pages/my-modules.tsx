import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Course } from '@/lib/courses-storage'
import { short } from '@/lib/storage'

export default function MyModules() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setAddress(stored)
      loadMyCourses(stored)
      loadUserProfile(stored)
    } else {
      setIsLoading(false)
    }
  }, [])

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

  const loadMyCourses = async (walletAddress: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/.netlify/functions/course-manager')
      if (response.ok) {
        const allCourses = await response.json()
        const filtered = allCourses.filter((c: Course) => 
          c.author.toLowerCase() === walletAddress.toLowerCase()
        )
        setMyCourses(filtered)
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTotalViews = (course: Course) => {
    // Placeholder for future analytics
    return Math.floor(Math.random() * 1000) + 50
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-ctd-bg">
        <Header />
        <main className="py-24 spotlight">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-ctd-text drop-shadow-neon mb-6">
              My Modules
            </h1>
            <p className="text-xl text-ctd-mute mb-8">
              Connect your wallet to view and manage your modules.
            </p>
            <div className="card max-w-md mx-auto p-8">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-ctd-text mb-4">
                Wallet Required
              </h3>
              <p className="text-ctd-mute mb-6">
                Please connect your wallet to access your modules and manage your content.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary w-full"
              >
                Go to Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctd-bg">
      <Header />
      
      <main className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-12 spotlight">
            <h1 className="text-4xl font-bold text-ctd-text drop-shadow-neon mb-4">
              My Modules
            </h1>
            <p className="text-xl text-ctd-mute mb-6">
              Manage and track your educational content
            </p>
            
            {/* Author Info */}
            <div className="card max-w-2xl mx-auto p-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-12 bg-ctd-yellow rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-lg">
                    {userProfile?.displayName?.[0] || address[2]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-ctd-text">
                    {userProfile?.displayName || 'Anonymous Creator'}
                  </h3>
                  <p className="text-ctd-mute text-sm">
                    {short(address)} • {myCourses.length} {myCourses.length === 1 ? 'module' : 'modules'}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ctd-yellow">
                    {myCourses.reduce((sum, course) => sum + course.totalVideos, 0)}
                  </div>
                  <div className="text-sm text-ctd-mute">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ctd-yellow">
                    {myCourses.reduce((sum, course) => sum + getTotalViews(course), 0)}
                  </div>
                  <div className="text-sm text-ctd-mute">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ctd-yellow">
                    {myCourses.length}
                  </div>
                  <div className="text-sm text-ctd-mute">Modules</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => router.push('/dev')}
              className="btn-primary"
            >
              Create New Module
            </button>
            <button
              onClick={() => router.push('/courses')}
              className="btn-ghost"
            >
              View All Courses
            </button>
          </div>

          {/* Modules List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-ctd-text text-lg">Loading your modules...</div>
            </div>
          ) : myCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="card max-w-2xl mx-auto p-12">
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-2xl font-semibold text-ctd-text mb-4">
                  No modules yet
                </h3>
                <p className="text-ctd-mute mb-8">
                  Start creating educational content and share your knowledge with the community.
                </p>
                <button
                  onClick={() => router.push('/dev')}
                  className="btn-primary"
                >
                  Create Your First Module
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div key={course.id} className="card hover:shadow-outline transition-all duration-200 spotlight">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-ctd-panel rounded-lg mb-4 overflow-hidden">
                    {course.videos[0]?.thumbnail ? (
                      <img
                        src={course.videos[0].thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-ctd-panel flex items-center justify-center">
                        <div className="text-ctd-mute text-4xl">📚</div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="chip">
                        {course.totalVideos} videos
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-ctd-text text-lg mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-ctd-mute text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-ctd-mute mb-4">
                    <span>{formatDate(course.updatedAt)}</span>
                    <span>{getTotalViews(course)} views</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      View Module
                    </button>
                    <button
                      onClick={() => router.push(`/dev?courseId=${course.id}`)}
                      className="btn-ghost flex-1 text-sm py-2"
                    >
                      Add Videos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}