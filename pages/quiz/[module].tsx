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
    if (moduleId > 1) {
      const completedModules = JSON.parse(localStorage.getItem('completed_modules') || '[]')
      if (!completedModules.includes(moduleId - 1)) {
        router.push('/quiz')
        return
      }
    }
  }, [moduleId, router])
  
  if (!module) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Module Not Found</h1>
          <a href="/quiz" className="btn-primary">Back to Quiz</a>
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
    <div className="min-h-screen">
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showResults ? (
            <div>
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-white">
                    Module {module.id}: {module.title}
                  </h1>
                  <span className="text-sm text-gray-300">
                    Question {currentQuestionIndex + 1} of {module.questions.length}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
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
                  className="btn-secondary"
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
              <h1 className="text-3xl font-bold text-white mb-8">Quiz Results</h1>
              
              <div className="card max-w-2xl mx-auto mb-8">
                <div className="text-6xl mb-4">
                  {isCompleted ? '🎉' : '😞'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your Score: {getScore()}%
                </h2>
                <p className="text-gray-300 mb-6">
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
              
              <div className="flex gap-4 justify-center">
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
                {!isCompleted && (
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary"
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