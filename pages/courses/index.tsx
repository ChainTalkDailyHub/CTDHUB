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
      const response = await fetch('/api/courses')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Courses</h1>
            <p className="text-xl text-gray-300">
              Discover educational content from our community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
              <div className="text-white text-lg">Loading courses...</div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-white mb-4">
                {searchTerm || selectedAuthor ? 'No matching courses found' : 'No videos… yet.'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedAuthor ? 'Try adjusting your search criteria' : 'Be the first to publish in Dev Area.'}
              </p>
              <a
                href="/dev"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create Course
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
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
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <div className="text-gray-400 text-4xl">📚</div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {course.totalVideos} videos
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {short(course.author)}</span>
                        <span>{formatDate(course.updatedAt)}</span>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Course Playlist Button */}
                  {course.videos.length > 1 && (
                    <div className="px-6 pb-4">
                      <Link
                        href={`/courses/${course.id}`}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📋</span>
                        View Full Course ({course.totalVideos} videos)
                      </Link>
                    </div>
                  )}
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