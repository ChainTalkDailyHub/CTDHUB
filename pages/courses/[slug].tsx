import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { courses } from '@/lib/courses'

export default function CourseDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [progress, setProgress] = useState(0)
  
  const course = courses.find(c => c.slug === slug)
  
  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`course-${slug}`)
    if (savedProgress) {
      setProgress(parseInt(savedProgress))
    }
  }, [slug])
  
  const markAsComplete = () => {
    setProgress(100)
    localStorage.setItem(`course-${slug}`, '100')
  }
  
  if (!course) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
          <a href="/courses" className="btn-primary">Back to Courses</a>
        </div>
        <Footer />
      </div>
    )
  }
  
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
            <p className="text-xl text-gray-300 mb-6">{course.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-300">{progress}% Complete</span>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-8">
            <iframe
              src={getYouTubeEmbedUrl(course.youtubeUrl)}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={markAsComplete}
              className="btn-primary"
              disabled={progress === 100}
            >
              {progress === 100 ? 'Completed!' : 'Mark as Complete'}
            </button>
            <a href="/courses" className="btn-secondary">
              Back to Courses
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}