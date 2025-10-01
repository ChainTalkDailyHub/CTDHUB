import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Course } from '@/lib/courses-storage'
import { short } from '@/lib/storage'
import Link from 'next/link'

interface DashboardStats {
  totalCourses: number
  totalVideos: number
  totalViews: number
}

export default function Dashboard() {
  const [userAddress, setUserAddress] = useState<string>('')
  const [userCourses, setUserCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalVideos: 0,
    totalViews: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const address = localStorage.getItem('wallet_address')
    if (address) {
      setUserAddress(address)
      loadUserData(address)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUserData = async (address: string) => {
    try {
      setIsLoading(true)
      
      // Load courses
      const coursesResponse = await fetch('/api/courses')
      if (coursesResponse.ok) {
        const allCourses = await coursesResponse.json()
        const authorCourses = allCourses.filter((course: Course) => 
          course.author.toLowerCase() === address.toLowerCase()
        )
        setUserCourses(authorCourses)
        
        // Calculate stats
        const totalVideos = authorCourses.reduce((sum: number, course: Course) => 
          sum + (course.totalVideos || course.videos?.length || 0), 0
        )
        
        setStats({
          totalCourses: authorCourses.length,
          totalVideos,
          totalViews: 0 // Placeholder for future implementation
        })
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!userAddress) {
    return (
      <div className="min-h-screen bg-ctd-bg">
        <Header />
        <main className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-ctd-text mb-6">Dashboard</h1>
            <p className="text-ctd-mute mb-8">Você precisa conectar sua carteira para acessar o dashboard.</p>
            <Link href="/" className="btn-primary">
              Voltar ao Início
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctd-bg">
      <Header />
      
      <main className="py-24 spotlight">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-ctd-text drop-shadow-neon mb-4">Dashboard</h1>
              <p className="text-ctd-mute text-lg">Welcome back, {short(userAddress)}</p>
            </div>
            
            <div className="flex gap-4">
              <button className="btn-ghost">
                ⚙️ Profile Settings
              </button>
              <Link href="/dev" className="btn-primary">
                ➕ Create Course
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-2xl font-bold text-ctd-text mb-2">{stats.totalCourses}</h3>
              <p className="text-ctd-mute">Total Courses</p>
              <p className="text-sm text-ctd-mute mt-1">Courses you've created</p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-2">🎥</div>
              <h3 className="text-2xl font-bold text-ctd-text mb-2">{stats.totalVideos}</h3>
              <p className="text-ctd-mute">Total Lessons</p>
              <p className="text-sm text-ctd-mute mt-1">Lessons across all courses</p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-2xl font-bold text-ctd-holo mb-2">Complete</h3>
              <p className="text-ctd-mute">Profile Status</p>
              <p className="text-sm text-ctd-mute mt-1">Profile set up</p>
            </div>
          </div>

          {/* Courses Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-ctd-text">Your Courses</h2>
              <p className="text-ctd-mute">Manage and edit your created courses</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-ctd-text text-lg">Loading courses...</div>
              </div>
            ) : userCourses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-ctd-text mb-4">No courses yet</h3>
                <p className="text-ctd-mute mb-6">Start creating your first course to share your knowledge</p>
                <Link href="/dev" className="btn-primary">
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCourses.map(course => (
                  <div key={course.id} className="card hover:shadow-outline transition-all duration-200 spotlight">
                    <div className="mb-4">
                      {course.videos?.[0]?.thumbnail ? (
                        <img
                          src={course.videos[0].thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-ctd-panel rounded-lg flex items-center justify-center">
                          <div className="text-ctd-mute text-4xl">📚</div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-ctd-text text-lg mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-ctd-mute text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-ctd-mute mb-4">
                      <span className="chip">{course.totalVideos || course.videos?.length || 0} lessons</span>
                      <span>{formatDate(course.updatedAt)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={course.videos?.length > 0 ? `/video/${course.videos[0].id}` : `/courses/${course.id}`}
                        className="btn-ghost flex-1 text-center text-sm"
                      >
                        👁️ View
                      </Link>
                      <Link
                        href={`/dev?edit=${course.id}`}
                        className="btn-ghost flex-1 text-center text-sm"
                      >
                        ✏️ Edit
                      </Link>
                      <button className="btn-ghost flex-1 text-sm text-red-400 hover:text-red-300">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}