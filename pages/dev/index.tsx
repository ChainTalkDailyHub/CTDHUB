import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import WalletButton from '../../components/WalletButton'
import CourseForm from '../../components/CourseForm'
import { Course } from '../../lib/courses-storage'
import { short } from '../../lib/storage'

export default function DevArea() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedCourseId, setSelectedCourseId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setAddress(stored)
      loadMyCourses(stored)
      loadUserProfile(stored)
    }
    
    // Check if user wants to add videos to specific course
    if (router.query.courseId) {
      setSelectedCourseId(router.query.courseId as string)
    }
  }, [router.query])

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
    }
  }

  const handleCourseSubmit = async (data: { 
    title: string
    description: string
    videos: Array<{title: string, description: string, youtubeUrl: string}>
  }) => {
    console.log('=== handleCourseSubmit ===')
    console.log('Address:', address)
    console.log('IsConnected:', isConnected)
    console.log('Data:', data)
    
    if (!address) {
      console.log('No address available')
      throw new Error('Wallet not connected')
    }

    const response = await fetch('/.netlify/functions/course-manager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-address': address
      },
      body: JSON.stringify(data)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    if (!response.ok) {
      const error = await response.json()
      console.log('Response error:', error)
      throw new Error(error.error || 'Failed to publish course')
    }

    const newCourse = await response.json()
    console.log('New course created:', newCourse)
    setMyCourses(prev => [newCourse, ...prev])
    
    alert('Published! It\'s live on Courses.')
  }

  const handleAddToExisting = async (courseId: string, videos: Array<{title: string, description: string, youtubeUrl: string}>) => {
    console.log('=== handleAddToExisting ===')
    console.log('Course ID:', courseId)
    console.log('Videos to add:', videos)
    
    if (!address) {
      console.log('No address available')
      throw new Error('Wallet not connected')
    }

    const response = await fetch(`/.netlify/functions/course-manager?courseId=${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-address': address
      },
      body: JSON.stringify({ videos })
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.log('Response error:', error)
      throw new Error(error.error || 'Failed to add videos')
    }

    const updatedCourse = await response.json()
    console.log('Course updated:', updatedCourse)
    setMyCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c))
    
    alert(`Videos added successfully! Module now has ${updatedCourse.totalVideos} videos.`)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-white mb-6">Connect your wallet</h1>
              <p className="text-xl text-gray-300 mb-4">
                You need a connected wallet to submit and manage videos. Viewing is open to everyone.
              </p>
              <WalletButton className="text-lg px-8 py-4" />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              Creator Studio
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Welcome <span className="text-yellow-400 font-semibold">
                {userProfile?.name || 'Creator'}
              </span>, <span className="text-gray-400 text-base">{short(address)}</span>.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Create, edit, and publish your lessons. Published videos appear on the Courses page.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <CourseForm 
                onSubmit={handleCourseSubmit}
                onAddToExisting={handleAddToExisting}
                existingCourses={myCourses.map(c => ({
                  id: c.id,
                  title: c.title,
                  totalVideos: c.totalVideos
                }))}
                preSelectedCourseId={selectedCourseId}
              />
            </div>

            <div>
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">
                  My Courses ({myCourses.length})
                </h3>
                
                {myCourses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No courses created yet. Use the form to publish your first course!
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {myCourses.map(course => (
                      <div 
                        key={course.id}
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm">
                            {course.title}
                          </h4>
                          <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                            {course.totalVideos} videos
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {formatDate(course.updatedAt)}
                          </span>
                          <a
                            href={`/courses/${course.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            View Course →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}