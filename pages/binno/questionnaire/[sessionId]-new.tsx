import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

interface Question {
  id: string
  question_text: string
  context: string
  stage: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  bnb_relevance: number
  critical_factors: string[]
}

interface UserAnswer {
  question_id: string
  question_text: string
  user_response: string
  timestamp: number
}

const FIRST_QUESTION: Question = {
  id: 'q1_project_intro',
  question_text: "Tell me about your Web3 project. What is the project name, how many tokens do you plan to launch, on which blockchain network (BNB Chain, Ethereum, etc.), and what is the main focus of the project (DeFi, GameFi, NFTs, dApp, productivity tool, etc.)? Also describe the overall vision and the problem your project aims to solve.",
  context: "Initial question to understand the complete context of the user's Web3 project",
  stage: "project_overview",
  difficulty_level: 'beginner',
  bnb_relevance: 90,
  critical_factors: ["project_name", "token_supply", "blockchain_network", "project_category", "problem_solving"]
}

export default function SkillCompassQuestionnaire() {
  const router = useRouter()
  const { sessionId } = router.query
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Estados principais - inicializados de forma mais estável
  const [mounted, setMounted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question>(FIRST_QUESTION)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  
  // Estados de carregamento
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  // Estados finais
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalReport, setFinalReport] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  // Garantir montagem segura do componente
  useEffect(() => {
    setMounted(true)
    
    // Gerar ou recuperar user ID apenas após montagem
    const storedUserId = localStorage.getItem('ctdhub_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('ctdhub_user_id', newUserId)
      setUserId(newUserId)
    }
  }, [])

  // Atualizar contador de caracteres de forma estável
  const updateCharacterCount = useCallback(() => {
    setCharacterCount(currentAnswer.length)
  }, [currentAnswer])

  useEffect(() => {
    updateCharacterCount()
  }, [updateCharacterCount])

  // Gerar próxima pergunta
  const generateNextQuestion = useCallback(async (nextQuestionNumber: number): Promise<Question> => {
    console.log('🔄 Generating question', nextQuestionNumber, 'with', answers.length, 'previous answers')
    
    const requestData = {
      questionNumber: nextQuestionNumber,
      previousAnswers: answers,
      sessionContext: {
        user_expertise_level: 'intermediate',
        project_focus: answers.length > 0 ? answers[0].user_response.substring(0, 200) : '',
        previous_responses_summary: answers.slice(-3).map(a => a.user_response.substring(0, 100)).join('; ')
      }
    }
    
    console.log('📤 Request data:', JSON.stringify(requestData, null, 2))
    
    try {
      // Use local API endpoint when running locally
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      const apiEndpoint = isLocalhost ? '/api/binno/generate-question' : '/.netlify/functions/binno-generate-question'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || `AI Question Generation failed: ${response.status}`)
      }

      // Try to parse JSON with better error handling
      let data
      try {
        const responseText = await response.text()
        console.log('🔍 Raw response:', responseText.substring(0, 200) + '...')
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError)
        console.error('🔍 Response was not valid JSON, using fallback')
        throw new Error('Invalid JSON response from API')
      }
      
      console.log('✅ Question generated successfully:', data.question.question_text.substring(0, 50) + '...')
      return data.question
    } catch (error) {
      console.error('💥 AI Question Generation Failed:', error)
      
      // Check if it's a JSON parsing error
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('🔍 JSON Parse Error - Response was not valid JSON')
      }
    
    // Fallback question if API fails completely
    const fallbackQuestion = {
      id: `q${nextQuestionNumber}_fallback_${Date.now()}`,
      question_text: `Question ${nextQuestionNumber}: Please describe your approach to ${nextQuestionNumber === 2 ? 'technical architecture and smart contract security' : nextQuestionNumber === 3 ? 'tokenomics and economic model' : nextQuestionNumber <= 5 ? 'market analysis and competitive positioning' : nextQuestionNumber <= 8 ? 'governance and community structure' : nextQuestionNumber <= 12 ? 'risk management and security audits' : 'future planning and scalability'} for your Web3 project.`,
      context: `Fallback question ${nextQuestionNumber} for Web3 project assessment`,
      stage: nextQuestionNumber <= 3 ? 'project_overview' : nextQuestionNumber <= 6 ? 'technical_assessment' : nextQuestionNumber <= 9 ? 'business_strategy' : nextQuestionNumber <= 12 ? 'implementation_planning' : 'final_evaluation',
      difficulty_level: (nextQuestionNumber <= 4 ? 'beginner' : nextQuestionNumber <= 8 ? 'intermediate' : nextQuestionNumber <= 12 ? 'advanced' : 'expert') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      bnb_relevance: 80,
      critical_factors: ['project_planning', 'technical_understanding', 'business_strategy']
    }
    
    console.log('🔄 Using fallback question due to API error')
    return fallbackQuestion
  }
  }, [answers])

  // Gerar relatório final
  const generateFinalReport = useCallback(async (finalAnswers: UserAnswer[]) => {
    setIsGeneratingReport(true)
    setError('')

    try {
      const response = await fetch('/.netlify/functions/binno-generate-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId || 'anonymous',
          userId: userId,
          answers: finalAnswers
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate analysis')
      }

      const analysisData = await response.json()
      setFinalReport(analysisData.analysis.ai_analysis_narrative)
      setIsCompleted(true)
    } catch (error) {
      console.error('Error generating final report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate final report')
    } finally {
      setIsGeneratingReport(false)
    }
  }, [sessionId, userId])

  // Submeter resposta
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim() || isSubmitting || isGeneratingQuestion) return

    setIsSubmitting(true)
    setError('')

    try {
      const newAnswer: UserAnswer = {
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        user_response: currentAnswer.trim(),
        timestamp: Date.now()
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      if (questionNumber >= 15) {
        await generateFinalReport(updatedAnswers)
        return
      }

      setIsGeneratingQuestion(true)
      const nextQuestionNumber = questionNumber + 1
      
      try {
        const nextQuestion = await generateNextQuestion(nextQuestionNumber)
        
        setCurrentQuestion(nextQuestion)
        setQuestionNumber(nextQuestionNumber)
        setCurrentAnswer('')
        
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 100)
      } catch (questionError) {
        console.error('Error generating next question:', questionError)
        setError(`Failed to generate question ${nextQuestionNumber}. Please try again.`)
        setAnswers(answers) // Revert to previous state
      }

    } catch (error) {
      console.error('Error submitting answer:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsGeneratingQuestion(false)
    }
  }, [currentAnswer, isSubmitting, isGeneratingQuestion, currentQuestion, answers, questionNumber, generateNextQuestion, generateFinalReport])

  // Voltar pergunta anterior
  const handlePrevious = useCallback(() => {
    if (questionNumber > 1 && answers.length > 0) {
      try {
        const previousAnswer = answers[answers.length - 1]
        setCurrentAnswer(previousAnswer.user_response)
        setQuestionNumber(prev => prev - 1)
        setAnswers(prev => prev.slice(0, -1))
        
        setCurrentQuestion({
          id: previousAnswer.question_id,
          question_text: previousAnswer.question_text,
          context: 'Previous question',
          stage: 'review',
          difficulty_level: 'intermediate',
          bnb_relevance: 70,
          critical_factors: []
        })
        
        setError('')
      } catch (error) {
        console.error('Error in handlePrevious:', error)
        setError('Error navigating to previous question')
      }
    }
  }, [questionNumber, answers])

  // Tratar teclas
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isSubmitting && !isGeneratingQuestion) {
      handleSubmitAnswer()
    }
  }, [isSubmitting, isGeneratingQuestion, handleSubmitAnswer])

  // Não renderizar até estar montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-ctd-bg py-8 flex items-center justify-center">
        <div className="text-ctd-text text-lg">Loading...</div>
      </div>
    )
  }

  // Relatório final
  if (isCompleted && finalReport) {
    return (
      <div className="min-h-screen bg-ctd-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-ctd-panel rounded-3xl shadow-2xl border border-ctd-border p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-ctd-text mb-4">
                <img 
                  src="/images/CTDHUB.png" 
                  alt="CTDHUB Logo" 
                  className="w-8 h-8 inline-block mr-3"
                />
                Your CTD Skill Compass Analysis
              </h1>
              <p className="text-ctd-mute text-lg">
                Based on your {answers.length} detailed responses
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-ctd-text">
              <div dangerouslySetInnerHTML={{ __html: finalReport.replace(/\n/g, '<br />') }} />
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => router.push('/binno-ai')}
                className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium"
              >
                Back to Binno AI
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-ctd-panel border border-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border transition-colors font-medium"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctd-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-ctd-panel rounded-3xl shadow-2xl border border-ctd-border">
          
          {/* Header */}
          <div className="p-8 border-b border-ctd-border">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-ctd-text mb-2">
                🧭 CTD Skill Compass
              </h1>
              <p className="text-ctd-mute text-sm mb-4">
                🤖 Powered by Binno AI • Questions adapt based on your responses • CTDHUB
              </p>
              
              {/* Progress */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-ctd-text text-sm font-medium">
                  Question {questionNumber} of 15
                </span>
              </div>
              
              <div className="w-full bg-ctd-bg rounded-full h-2">
                <div 
                  className="bg-ctd-yellow h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(questionNumber / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-ctd-text mb-4">
                {currentQuestion.question_text}
              </h2>
              {currentQuestion.context && (
                <p className="text-ctd-mute text-sm">
                  💡 {currentQuestion.context}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Answer Input */}
            <div className="mb-6">
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your thoughts and experience here..."
                className="w-full h-40 p-4 bg-ctd-bg border border-ctd-border rounded-lg text-ctd-text placeholder-ctd-mute resize-none focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                disabled={isSubmitting || isGeneratingQuestion || isGeneratingReport}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-ctd-mute text-sm">
                  {characterCount} characters
                </span>
                <span className="text-ctd-mute text-sm">
                  Press Ctrl+Enter to submit
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={questionNumber <= 1 || isSubmitting || isGeneratingQuestion}
                className="px-6 py-3 bg-ctd-bg border border-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="flex space-x-4">
                {isGeneratingQuestion && (
                  <div className="flex items-center space-x-2 text-ctd-yellow">
                    <div className="animate-spin w-4 h-4 border-2 border-ctd-yellow border-t-transparent rounded-full"></div>
                    <span>Generating next question...</span>
                  </div>
                )}

                {isGeneratingReport && (
                  <div className="flex items-center space-x-2 text-ctd-yellow">
                    <div className="animate-spin w-4 h-4 border-2 border-ctd-yellow border-t-transparent rounded-full"></div>
                    <span>Generating your analysis...</span>
                  </div>
                )}

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting || isGeneratingQuestion || isGeneratingReport}
                  className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-able font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : questionNumber >= 15 ? (
                    'Complete Assessment'
                  ) : (
                    'Next Question →'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}