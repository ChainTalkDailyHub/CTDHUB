import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import QuizModuleCard from '@/components/QuizModuleCard'
import BurnBadge from '@/components/BurnBadge'
import { quizModules } from '@/lib/quizData'

export default function Quiz() {
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [userAddress, setUserAddress] = useState<string>('')
  
  useEffect(() => {
    // Load completed modules from localStorage
    const completed = localStorage.getItem('completed_modules')
    const address = localStorage.getItem('wallet_address')
    
    if (completed) {
      setCompletedModules(JSON.parse(completed))
    }
    if (address) {
      setUserAddress(address)
      
      // Sincronizar progresso com o servidor
      fetch(`/.netlify/functions/quiz-progress?userAddress=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.completedModules && data.completedModules.length > 0) {
            setCompletedModules(data.completedModules)
            localStorage.setItem('completed_modules', JSON.stringify(data.completedModules))
          }
        })
        .catch(err => console.warn('Failed to sync progress:', err))
    }
  }, [])
  
  // Listener para atualizações do localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const completed = localStorage.getItem('completed_modules')
      if (completed) {
        setCompletedModules(JSON.parse(completed))
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Também escutar mudanças manuais
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  
  const isModuleLocked = (moduleId: number) => {
    if (moduleId === 1) return false
    return !completedModules.includes(moduleId - 1)
  }
  
  const allModulesCompleted = completedModules.length === 10
  
  return (
    <div className="min-h-screen bg-ctd-bg">
      <Header />
      
      <main className="py-24 spotlight">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-ctd-text drop-shadow-neon mb-6">
              Blockchain <span className="text-ctd-yellow">Knowledge</span> Quiz
            </h1>
            <p className="text-xl text-ctd-mute max-w-3xl mx-auto leading-relaxed mb-12">
              Test your understanding with our comprehensive 10-module quiz system. 
              Complete all modules to unlock the burn mechanism.
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="flex justify-between text-sm text-ctd-mute mb-3">
                <span>Progress</span>
                <span>{completedModules.length}/10 modules</span>
              </div>
              <div className="w-full bg-ctd-panel rounded-full h-3">
                <div 
                  className="bg-ctd-yellow h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(completedModules.length / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Burn Badge */}
            {userAddress && (
              <BurnBadge 
                isEnabled={allModulesCompleted}
                userAddress={userAddress}
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizModules.map((module) => (
              <QuizModuleCard
                key={module.id}
                module={module}
                isCompleted={completedModules.includes(module.id)}
                isLocked={isModuleLocked(module.id)}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}