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
      <div className="min-h-screen bg-ctd-bg">
        <Header />
        <div className="py-24 text-center spotlight">
          <div className="max-w-md mx-auto">
            <div className="card relative">
              <div className="corner corner--tl"></div>
              <div className="corner corner--tr"></div>
              <div className="corner corner--bl"></div>
              <div className="corner corner--br"></div>
              
              <div className="relative z-10 p-1 text-center">
                <h1 className="text-2xl font-bold text-ctd-text mb-4">Module Not Found</h1>
                <p className="text-ctd-mute mb-6">The requested quiz module could not be found.</p>
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
        fetch('/api/quiz/progress', {
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
    <div className="min-h-screen bg-ctd-bg">
      <Header />
      
      <main className="py-24 spotlight">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showResults ? (
            <div>
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-ctd-text drop-shadow-neon">
                    Module {module.id}: <span className="text-ctd-yellow">{module.title}</span>
                  </h1>
                  <span className="text-sm text-ctd-mute">
                    Question {currentQuestionIndex + 1} of {module.questions.length}
                  </span>
                </div>
                
                <div className="w-full bg-ctd-panel rounded-full h-3 border border-ctd-border">
                  <div 
                    className="bg-ctd-yellow h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / module.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <QuizQuestion
                question={currentQuestion}
                selectedAnswer={selectedAnswers[currentQuestionIndex] || null}
                onAnswerSelect={handleAnswerSelect}
                showResult={false}
              />
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => router.push('/quiz')}
                  className="btn-ghost"
                >
                  Back to Quiz
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className={`btn-primary ${!selectedAnswers[currentQuestionIndex] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLastQuestion ? 'Check Answer' : 'Next'}
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center">
              <h1 className="text-3xl font-bold text-ctd-text drop-shadow-neon mb-8">
                Quiz <span className="text-ctd-yellow">Results</span>
              </h1>
              
              <div className="card max-w-2xl mx-auto mb-8 relative">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="corner corner--bl"></div>
                <div className="corner corner--br"></div>
                
                <div className="relative z-10 p-1 text-center">
                  <div className="text-6xl mb-4">
                    {isCompleted ? '🎉' : '😞'}
                  </div>
                  <h2 className="text-2xl font-bold text-ctd-text mb-4">
                    Your Score: <span className="text-ctd-yellow">{getScore()}%</span>
                  </h2>
                  <p className="text-ctd-mute mb-6">
                    {isCompleted 
                      ? 'Nice! Progress saved.' 
                      : 'You need 70% or higher to pass. Try again!'}
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
              
              <div className="flex gap-4 justify-center">
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
                    className="btn-primary"
                  >
                    {module.id < 10 ? 'Next Module' : 'Complete Quiz'}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/quiz')}
                    className="btn-primary"
                  >
                    Back to Quiz
                  </button>
                )}
                {!isCompleted && (
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-ghost"
                  >
                    Retry Module
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