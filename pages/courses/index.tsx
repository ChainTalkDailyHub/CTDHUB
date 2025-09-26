import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CourseCard from "@/components/CourseCard"
import { courses } from "@/lib/courses"
import { AdminSystem } from "@/lib/adminSystem"

export default function Courses() {
  const [activeTab, setActiveTab] = useState("courses")
  const [allCourses, setAllCourses] = useState<any[]>([])

  useEffect(() => {
    const loadAllCourses = () => {
      // Cursos CTDHUB (apenas admin ChainTalkDaily pode adicionar)
      const ctdhubCourses = AdminSystem.getAllAdminCourses().map(course => ({
        ...course,
        isSystemCourse: true,
        isAdminCourse: true
      }))
      
      // Cursos da Comunidade (qualquer desenvolvedor pode criar)
      let communityCourses = []
      const stored = localStorage.getItem("developer-courses")
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          communityCourses = parsed.map((course: any) => ({
            ...course,
            isSystemCourse: false,
            isAdminCourse: false
          }))
        } catch (e) {
          console.log("Error loading community courses")
        }
      }
      
      setAllCourses([...ctdhubCourses, ...communityCourses])
    }
    
    loadAllCourses()

    // Escutar atualizações dos cursos admin
    const handleAdminCoursesUpdate = () => {
      loadAllCourses()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('ctdhub-admin-courses-updated', handleAdminCoursesUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ctdhub-admin-courses-updated', handleAdminCoursesUpdate)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
             Cursos CTDHUB
          </h1>
          <p className="text-gray-300">
            Aprenda blockchain, DeFi e Web3 com os melhores cursos
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex bg-gray-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 px-3 py-3 rounded-lg font-semibold ${
              activeTab === "courses"
                ? "bg-[#FFC700] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
                         🏢 Cursos CTDHUB
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`flex-1 px-3 py-3 rounded-lg font-semibold ${
              activeTab === "community"
                ? "bg-[#FFC700] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
             Comunidade
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCourses
              .filter(course => course.isAdminCourse === true)
              .map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            
            {allCourses.filter(c => c.isAdminCourse === true).length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum curso CTDHUB ainda
                </h3>
                <p className="text-gray-400 mb-6">
                  Apenas <span className="text-yellow-400 font-semibold">ChainTalkDaily</span> pode adicionar cursos oficiais aqui.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "community" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allCourses
                .filter(course => course.isAdminCourse === false)
                .map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {allCourses.filter(c => c.isAdminCourse === false).length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum curso da comunidade ainda
                </h3>
                <p className="text-gray-400 mb-6">
                  Seja o primeiro a criar um curso!
                </p>
                <a href="/developer" className="btn-primary inline-block">
                  Criar Curso
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
