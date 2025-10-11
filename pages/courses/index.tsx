import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Course } from "@/lib/courses-storage"
import { short } from "@/lib/storage"
import Link from "next/link"

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAuthor, setSelectedAuthor] = useState("")

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/.netlify/functions/course-manager')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAuthor = !selectedAuthor || course.author.toLowerCase() === selectedAuthor.toLowerCase()
    return matchesSearch && matchesAuthor
  })

  const uniqueAuthors = Array.from(new Set(courses.map(c => c.author)))

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              📚 Courses
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover educational content from our community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search courses…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200"
              >
                <option value="">All Authors</option>
                {uniqueAuthors.map(author => (
                  <option key={author} value={author}>
                    {author.slice(0, 6)}...{author.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-900 dark:text-white text-lg">⏳ Loading courses...</div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 card card-interactive p-12">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {searchTerm || selectedAuthor ? 'No matching courses found' : 'No courses yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || selectedAuthor ? 'Try adjusting your search criteria' : 'Be the first to publish in Creator Studio'}
              </p>
              <a
                href="/dev"
                className="btn-primary inline-block"
              >
                ⚙️ Create Course
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="card card-interactive overflow-hidden group">
                  <div className="relative">
                    {/* Main Course Link - goes to first video if available, otherwise course page */}
                    <Link
                      href={course.videos.length > 0 ? `/video/${course.videos[0].id}` : `/courses/${course.id}`}
                      className="block"
                    >
                      <div className="relative">
                        {course.videos[0]?.thumbnail ? (
                          <img
                            src={course.videos[0].thumbnail}
                            alt={course.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                            <div className="text-6xl">📚</div>
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {course.totalVideos} videos
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-200">
                            <div className="w-0 h-0 border-l-[16px] border-l-purple-600 border-y-[10px] border-y-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-yellow-400 transition-colors">
                          {course.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>👤 {short(course.author)}</span>
                          <span>📅 {formatDate(course.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Course Playlist Button */}
                    {course.videos.length > 1 && (
                      <div className="px-6 pb-4">
                        <Link
                          href={`/courses/${course.id}`}
                          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg"
                        >
                          📋 View Full Course ({course.totalVideos} videos)
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}