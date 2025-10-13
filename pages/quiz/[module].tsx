import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import QuizQuestion from '@/components/QuizQuestion'
import { quizModules } from '@/lib/quizData'
import { correctPos, shuffleOptions } from '@/lib/quizPattern'

export default function QuizModule() {
  const router = useRouter()
  const { module: moduleParam } = router.query
  const moduleId = parseInt(moduleParam as string)
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const module = quizModules.find(m => m.id === moduleId)
  
  useEffect(() => {
    // Check if module is accessible
    if (moduleId && moduleId > 1) {
      const completedModules = JSON.parse(localStorage.getItem('completed_modules') || '[]')
      console.log('Checking access to module', moduleId, 'Completed modules:', completedModules)
      if (!completedModules.includes(moduleId - 1)) {
        console.log('Access denied to module', moduleId, 'Previous module not completed')
        router.push('/quiz')
        return
      }
    }
    
    // Reset state when changing modules
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResults(false)
    setIsCompleted(false)
  }, [moduleId, router])
  
  if (!module) {
    return (
      <div className="min-h-screen bg-ctd-bg dark:bg-ctd-bg-dark">
        <Header />
        <div className="py-24 text-center spotlight">
          <div className="max-w-md mx-auto">
            <div className="card relative">
              <div className="corner corner--tl"></div>
              <div className="corner corner--tr"></div>
              <div className="corner corner--bl"></div>
              <div className="corner corner--br"></div>
              
              <div className="relative z-10 p-1 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Module Not Found</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">The requested quiz module could not be found.</p>
                <a href="/quiz" className="btn-primary">Back to Quiz</a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
  
  const currentQuestion = module.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === module.questions.length - 1
  
  const handleAnswerSelect = (answer: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answer
    setSelectedAnswers(newAnswers)
  }
  
  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true)
      calculateResults()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  const calculateResults = () => {
    let correctCount = 0
    
    module.questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      if (userAnswer === question.correctAnswer) {
        correctCount++
      }
    })
    
    const score = (correctCount / module.questions.length) * 100
    
    // Save completion if score >= 70%
    if (score >= 70) {
      const completedModules = JSON.parse(localStorage.getItem('completed_modules') || '[]')
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId)
        localStorage.setItem('completed_modules', JSON.stringify(completedModules))
      }
      
      // Save to server
      const userAddress = localStorage.getItem('wallet_address')
      if (userAddress) {
        fetch('/.netlify/functions/quiz-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress, moduleId })
        })
      }
      
      setIsCompleted(true)
    }
  }
  
  const getScore = () => {
    let correctCount = 0
    module.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })
    return Math.round((correctCount / module.questions.length) * 100)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showResults ? (
            <div>
              {/* Progress Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Module {module.id}: <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{module.title}</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Question {currentQuestionIndex + 1} of {module.questions.length}</p>
                
                {/* Progress Bar */}
                <div className="max-w-lg mx-auto">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${((currentQuestionIndex + 1) / module.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <QuizQuestion
                question={currentQuestion}
                selectedAnswer={selectedAnswers[currentQuestionIndex] || null}
                onAnswerSelect={handleAnswerSelect}
                showResult={false}
              />
              
              <div className="flex justify-between mt-8 gap-4">
                <button
                  onClick={() => router.push('/quiz')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  ← Back to Quiz
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 ${!selectedAnswers[currentQuestionIndex] ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-xl' : 'hover:scale-105'}`}
                >
                  {isLastQuestion ? '✅ Check Answer' : 'Next Question →'}
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Quiz <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Results</span>
              </h1>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto mb-8 p-8 transition-colors duration-300">
                <div className="text-center">
                  <div className="text-8xl mb-6">
                    {isCompleted ? '🎉' : '😞'}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Score: <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{getScore()}%</span>
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    {isCompleted 
                      ? '🎯 Congratulations! Progress saved.' 
                      : '📚 You need 70% or higher to pass. Keep learning!'}
                  </p>
                  
                  <div className="space-y-4">
                    {module.questions.map((question, index) => (
                      <QuizQuestion
                        key={question.id}
                        question={question}
                        selectedAnswer={selectedAnswers[index] || null}
                        onAnswerSelect={() => {}}
                        showResult={true}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
                {isCompleted ? (
                  <button
                    onClick={() => {
                      const currentModuleNum = module.id;
                      const nextModuleNum = currentModuleNum + 1;
                      if (nextModuleNum <= 10) {
                        router.push(`/quiz/${nextModuleNum}`);
                      } else {
                        router.push('/quiz');
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    {module.id < 10 ? '🚀 Next Module' : '🎯 Complete Quiz'}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/quiz')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    🏠 Back to Quiz
                  </button>
                )}
                {!isCompleted && (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    🔄 Retry Module
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}