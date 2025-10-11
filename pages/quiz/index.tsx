import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import QuizModuleCard from '@/components/QuizModuleCard'
import BurnBadge from '@/components/BurnBadge'
import WalletButton from '@/components/WalletButton'
import { quizModules } from '@/lib/quizData'

export default function Quiz() {
  const router = useRouter()
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [userAddress, setUserAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  // Protege rota: só acessa se wallet conectada
  useEffect(() => {
    if (typeof window === 'undefined') return
    const walletAddress = localStorage.getItem('ctdhub:wallet')
    if (false && !walletAddress) {
      router.replace('/')
    }
  }, [])
  
  useEffect(() => {
    // Load completed modules from localStorage
    if (typeof window === 'undefined') return // SSR guard
    
    const completed = localStorage.getItem('completed_modules')
    
    if (completed) {
      try {
        setCompletedModules(JSON.parse(completed))
      } catch (error) {
        console.warn('Error parsing completed modules:', error)
        setCompletedModules([])
      }
    }
    
    // Check for connected wallet
    const checkWallet = () => {
      const walletAddress = localStorage.getItem('ctdhub:wallet')
      if (walletAddress) {
        setUserAddress(walletAddress)
        setIsWalletConnected(true)
        
        // Progresso armazenado localmente (mais rápido, sem requisições)
        // Removido fetch para quiz-progress para melhorar performance
      } else {
        setIsWalletConnected(false)
        setUserAddress('')
      }
    }
    
    checkWallet()
    
    // Listen for wallet connection changes
    const handleStorageChange = () => {
      checkWallet()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Listener para atualizações do localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Storage change detected')
      const completed = localStorage.getItem('completed_modules')
      if (completed) {
        const modules = JSON.parse(completed)
        console.log('📊 Completed modules:', modules)
        setCompletedModules(modules)
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
  
  // Debug log
  useEffect(() => {
    console.log('🎯 Quiz state:', {
      completedModules: completedModules.length,
      allModulesCompleted,
      isWalletConnected,
      userAddress
    })
  }, [completedModules, allModulesCompleted, isWalletConnected, userAddress])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="py-24 spotlight">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white drop-shadow-neon mb-6">
              Blockchain <span className="text-ctd-yellow">Knowledge</span> Quiz
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
              Test your understanding with our comprehensive 10-module quiz system. 
              Complete all modules to unlock the burn mechanism.
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                <span>Progress</span>
                <span>{completedModules.length}/10 modules</span>
              </div>
              <div className="w-full bg-white dark:bg-gray-800 rounded-full h-3">
                <div 
                  className="bg-ctd-yellow h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(completedModules.length / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Burn Section - Always visible */}
            <div className="max-w-2xl mx-auto mb-12">
              {allModulesCompleted ? (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border-2 border-yellow-200 dark:border-gray-600 shadow-xl transition-colors duration-300">
                  <div className="text-center mb-6">
                    <div className="text-8xl mb-4">🎉</div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">Congratulations!</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300">You've completed all 10 quiz modules.</p>
                  </div>
                  
                  {/* Wallet Connection Required */}
                  {!isWalletConnected ? (
                    <div className="text-center">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 mb-4 shadow-lg">
                        <div className="text-5xl mb-3">🔗</div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Connect Wallet to Burn Tokens</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Connect your wallet to burn 1000 CTD tokens and complete your achievement
                        </p>
                        <WalletButton className="inline-block" />
                      </div>
                    </div>
                  ) : (
                    <div data-testid="burn-section">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 mb-4 text-center shadow-lg">
                        <p className="text-gray-900 dark:text-white font-medium">
                          🏦 <strong>Connected:</strong> {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                        </p>
                      </div>
                      <BurnBadge 
                        isEnabled={allModulesCompleted}
                        userAddress={userAddress}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-lg transition-colors duration-300">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Burn System Locked</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">Complete all 10 modules to unlock the burn mechanism</p>
                    <p className="text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mt-3">
                      {10 - completedModules.length} modules remaining
                    </p>
                  </div>
                </div>
              )}
            </div>
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