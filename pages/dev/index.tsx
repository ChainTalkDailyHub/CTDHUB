
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
  // Protege rota: só acessa se wallet conectada
  useEffect(() => {
    if (typeof window === 'undefined') return
    // TEMP: Protection disabled for development
  }, [router])
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setAddress(stored)
      
      // Check if it's first visit to Creator Studio for this user
      const visitKey = `ctdhub:creator-visited:${stored}`
      const hasVisited = localStorage.getItem(visitKey)
      setIsFirstVisit(!hasVisited)
      
      // Mark as visited
      if (!hasVisited) {
        localStorage.setItem(visitKey, 'true')
      }
      
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
      const response = await fetch(`/.netlify/functions/user-profiles?walletAddress=${address}`)
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const getWelcomeMessage = () => {
    const userName = userProfile?.name || 'Creator'
    
    if (isFirstVisit) {
      return {
        greeting: `Welcome ${userName}`,
        subtitle: `Great to have you in the Creator Studio! Let's build something amazing.`
      }
    } else {
      return {
        greeting: `Good to see you back here, ${userName}`,
        subtitle: `Ready to create more incredible content?`
      }
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
      <div className="min-h-screen ctd-bg transition-colors duration-300">
        <Header />
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold ctd-text mb-6">Connect your wallet</h1>
              <p className="text-xl ctd-text opacity-70 mb-4">
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
    <div className="min-h-screen ctd-bg transition-colors duration-300">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
            <h1 className="text-4xl font-bold ctd-yellow mb-4">
              Creator Studio
            </h1>
            <div className="mb-4">
              <p className="text-2xl ctd-text font-semibold mb-2">
                {getWelcomeMessage().greeting}
                <span className="ctd-text opacity-60 text-base font-normal ml-2">
                  {short(address)}
                </span>
              </p>
              <p className="text-lg ctd-text opacity-70 mb-2">
                {getWelcomeMessage().subtitle}
              </p>
            </div>
            <p className="ctd-text opacity-80 leading-relaxed">
              Create, edit, and publish your lessons. Published videos appear on the Courses page.
            </p>
          </div>          <div className="grid lg:grid-cols-2 gap-8">
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
              <div className="ctd-panel p-6 rounded-2xl shadow-lg transition-colors duration-300">
                <h3 className="text-xl font-bold ctd-text mb-4">
                  My Courses ({myCourses.length})
                </h3>
                
                {myCourses.length === 0 ? (
                  <p className="ctd-text opacity-60 text-center py-8">
                    No courses created yet. Use the form to publish your first course!
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {myCourses.map(course => (
                      <div 
                        key={course.id}
                        className="p-4 ctd-panel rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold ctd-text text-sm">
                            {course.title}
                          </h4>
                          <span className="text-xs ctd-yellow bg-yellow-400/20 px-2 py-1 rounded">
                            {course.totalVideos} videos
                          </span>
                        </div>
                        <p className="text-xs ctd-text opacity-60 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="ctd-text opacity-50">
                            {formatDate(course.updatedAt)}
                          </span>
                          <a
                            href="/my-modules"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ctd-yellow hover:opacity-80 transition-opacity"
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