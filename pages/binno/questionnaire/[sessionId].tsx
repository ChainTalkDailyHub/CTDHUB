import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { Language, useTranslations, formatString } from '../../../lib/i18n/translations'
import LanguageSelector from '../../../components/LanguageSelector'
import { apiRequest, getApiInfo } from '../../../lib/apiBase'

// Supabase client with environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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

interface SkillReport {
  id?: string
  user_id: string
  session_id: string
  answers: UserAnswer[]
  ai_analysis_report: string
  created_at: string
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
  
  // Estado para controlar hidratação
  const [isClient, setIsClient] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt')

  // Obter traduções para o idioma atual
  const t = useTranslations(currentLanguage)

  // Core State
  const [currentQuestion, setCurrentQuestion] = useState<Question>(FIRST_QUESTION)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [userId, setUserId] = useState<string>('')
  
  // Final States
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalReport, setFinalReport] = useState<string>('')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState<string>('')

  // Garantir que componente só renderiza no cliente após hidratação
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Carregar idioma preferido do usuário
  useEffect(() => {
    if (!isClient) return
    
    const savedLanguage = localStorage.getItem('ctdhub_preferred_language') as Language
    if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    }
  }, [isClient])

  // Salvar idioma quando mudar
  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    if (isClient) {
      localStorage.setItem('ctdhub_preferred_language', language)
    }
  }

  // Load user ID from localStorage or generate
  useEffect(() => {
    if (!isClient) return
    
    const storedUserId = localStorage.getItem('ctdhub_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('ctdhub_user_id', newUserId)
      setUserId(newUserId)
    }
  }, [isClient])

  // Update character count
  const updateCharacterCount = useCallback(() => {
    setCharacterCount(currentAnswer.length)
  }, [currentAnswer])

  // Export PDF function
  const exportToPDF = () => {
    if (!finalReport) return
    
    // Create a structured report content
    const reportContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTD Skill Compass - Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #1a1a1a;
            padding: 20px;
            min-height: 100vh;
        }
        
        .pdf-container {
            width: 210mm;
            min-height: 297mm;
            background: #000000;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(255, 204, 51, 0.3);
            border: 1px solid #333;
            position: relative;
            overflow: hidden;
        }
        
        .pdf-header {
            background: linear-gradient(135deg, #FFCC33 0%, #FFA500 100%);
            height: 35mm;
            width: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20mm;
            box-shadow: 0 2px 10px rgba(255, 204, 51, 0.5);
        }
        
        .logo-section p {
            font-size: 14px;
            color: #333;
            margin: 0;
            font-weight: 500;
        }
        
        .date-section {
            text-align: right;
            font-size: 10px;
            color: #333;
        }
        
        .pdf-content {
            padding: 20mm;
            color: #ffffff;
            min-height: calc(297mm - 55mm);
        }
        
        .main-title {
            font-size: 20px;
            font-weight: 700;
            color: #FFCC33;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(255, 204, 51, 0.5);
        }
        
        .analysis-content {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-left: 4px solid #FFCC33;
            padding: 20px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
            line-height: 1.6;
        }
        
        .pdf-footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 20mm;
            background: linear-gradient(180deg, transparent 0%, #141414 50%, #000000 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20mm;
            font-size: 9px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="pdf-header">
            <div class="logo-section">
                <p>CTD Skill Compass Analysis Report</p>
            </div>
            <div class="date-section">
                <div>Generated on: ${new Date().toLocaleDateString()}</div>
                <div>${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
        
        <div class="pdf-content">
            <h1 class="main-title">CTD Skill Compass Analysis</h1>
            
            <div class="analysis-content">
                ${finalReport.replace(/\n/g, '<br>')}
            </div>
        </div>
        
        <div class="pdf-footer">
            <div class="footer-left">
                Generated by CTD Skill Compass - AI-Powered Web3 Assessment
            </div>
            <div class="footer-right">
                <div>ctdhub.io</div>
            </div>
        </div>
    </div>
</body>
</html>
    `
    
    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CTD_Skill_Compass_Report_${sessionId}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    updateCharacterCount()
  }, [currentAnswer, updateCharacterCount])

  // Generate next question using AI
  const generateNextQuestion = async (nextQuestionNumber: number): Promise<Question> => {
    console.log('🔄 Generating question', nextQuestionNumber, 'with', answers.length, 'previous answers')
    try {
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
  }

  // Submit answer and get next question
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || currentAnswer.length < 10) {
      setError(t.shortAnswer)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Clear any previous errors
      setError('')
      
      // Add current answer to answers array
      const newAnswer: UserAnswer = {
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        user_response: currentAnswer.trim(),
        timestamp: Date.now()
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      // Check if questionnaire is complete (15 questions)
      if (questionNumber >= 15) {
        try {
          await generateFinalReport(updatedAnswers)
        } catch (reportError) {
          console.error('Error generating final report:', reportError)
          setError('Failed to generate final report. Please try again.')
        }
        return
      }

      // Generate next question
      setIsGeneratingQuestion(true)
      const nextQuestionNumber = questionNumber + 1
      
      try {
        const nextQuestion = await generateNextQuestion(nextQuestionNumber)
        
        setCurrentQuestion(nextQuestion)
        setQuestionNumber(nextQuestionNumber)
        setCurrentAnswer('')
        
        // Focus on textarea for next question
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 100)
      } catch (questionError) {
        console.error('Error generating next question:', questionError)
        setError(`Failed to generate question ${nextQuestionNumber}. Please try again.`)
        // Revert state if question generation fails
        setAnswers(answers) // Keep previous state
      }

    } catch (error) {
      console.error('Error submitting answer:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsGeneratingQuestion(false)
    }
  }

  // Generate final AI analysis report
  const generateFinalReport = async (finalAnswers: UserAnswer[]) => {
    setIsGeneratingReport(true)
    setError('')

    try {
      console.log('🚀 Starting final analysis with API info:', getApiInfo())
      
      const data = await apiRequest('binno-final-analysis', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sessionId,
          userAnswers: finalAnswers,
          language: currentLanguage
        })
      })
      
      if (data.success && data.analysis) {
        console.log(`✅ Analysis generated successfully with score: ${data.score}%`)
        console.log(`💾 Saved to database: ${data.saved ? 'Yes' : 'No'}`)
        
        // Display analysis inline in current page
        setFinalReport(data.analysis)
        setIsCompleted(true)
        
        // Save session ID for future reference
        const sessionIdStr = Array.isArray(sessionId) ? sessionId[0] : sessionId || 'unknown'
        localStorage.setItem('ctdhub:last-assessment', sessionIdStr)
        localStorage.setItem('ctdhub:last-score', data.score.toString())
        
        console.log('Assessment completed and saved')
      } else {
        throw new Error(data.error || 'Failed to generate analysis')
      }

    } catch (error) {
      console.error('Error generating final report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate final report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Save report to Supabase (optional, non-blocking)
  const saveReportToSupabase = async (finalAnswers: UserAnswer[], analysis: string) => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured - skipping database save')
        return
      }

      // Only attempt to save if we have a valid session and user ID
      if (!sessionId || !userId) {
        console.log('Skipping Supabase save - missing session or user ID')
        return
      }

      const reportData: Omit<SkillReport, 'id'> = {
        user_id: userId,
        session_id: sessionId as string,
        answers: finalAnswers,
        ai_analysis_report: analysis,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('skill_compass_reports')
        .insert([reportData])

      if (error) {
        console.error('Supabase save error:', error)
        throw new Error(`Database save failed: ${error.message}`)
      } else {
        console.log('Report saved to Supabase successfully')
      }
    } catch (error) {
      console.error('Error in saveReportToSupabase:', error)
      throw error
    }
  }

  // Handle key press for Enter to submit
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isSubmitting && !isGeneratingQuestion) {
      handleSubmitAnswer()
    }
  }

  // Navigation functions
  const handlePrevious = () => {
    if (questionNumber > 1 && answers.length > 0) {
      try {
        const previousAnswer = answers[answers.length - 1]
        setCurrentAnswer(previousAnswer.user_response)
        setQuestionNumber(prev => prev - 1)
        setAnswers(prev => prev.slice(0, -1))
        
        // Reconstruct previous question (simplified)
        setCurrentQuestion({
          id: previousAnswer.question_id,
          question_text: previousAnswer.question_text,
          context: 'Previous question',
          stage: 'review',
          difficulty_level: 'intermediate',
          bnb_relevance: 70,
          critical_factors: []
        })
        
        // Clear any errors
        setError('')
      } catch (error) {
        console.error('Error in handlePrevious:', error)
        setError('Error navigating to previous question')
      }
    }
  }

  // Aguardar hidratação antes de renderizar conteúdo que depende do cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-ctd-bg py-8 flex items-center justify-center">
        <div className="text-ctd-text text-lg">Loading...</div>
      </div>
    )
  }

  if (isCompleted && finalReport) {
    return (
      <div className="min-h-screen bg-ctd-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-ctd-panel rounded-3xl shadow-2xl border border-ctd-border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mx-auto mb-6">
                <img 
                  src="/images/CTDHUB.png" 
                  alt="CTDHUB Logo" 
                  className="w-32 h-32 object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-ctd-text mb-4">
                Assessment Complete!
              </h1>
              
              {/* Congratulations Message */}
              <div className="bg-gradient-to-r from-ctd-yellow/10 to-ctd-holo/10 border border-ctd-yellow/30 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-ctd-yellow mb-2">🎉 Parabéns!</h2>
                  <p className="text-ctd-text text-lg mb-2">
                    Você completou o <strong>CTD Skill Compass</strong>!
                  </p>
                  <p className="text-ctd-mute text-sm">
                    Poucos chegam até aqui. Você demonstrou dedicação em avaliar suas habilidades Web3. 
                    Este é um passo importante na sua jornada de crescimento profissional.
                  </p>
                </div>
              </div>
              
              <p className="text-ctd-mute text-lg">
                Based on your {answers.length} detailed responses
              </p>
              <div className="mt-4 px-4 py-2 bg-ctd-yellow/20 rounded-lg inline-block">
                <span className="text-ctd-yellow font-semibold">✅ Report Generated Successfully</span>
              </div>
            </div>

            {/* Report Content - Enhanced Layout */}
            <div className="space-y-6">
              {/* Analysis Header */}
              <div className="bg-gradient-to-r from-ctd-bg to-ctd-panel rounded-2xl p-6 border border-ctd-border">
                <div className="flex items-center mb-4">
                  <div className="bg-ctd-yellow/20 p-3 rounded-lg mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-ctd-text">Your CTD Skill Compass Analysis</h2>
                    <p className="text-ctd-mute">AI-Powered Web3 Assessment Results</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-ctd-bg/50 rounded-lg p-4 text-center border border-ctd-border/50">
                    <div className="text-ctd-yellow font-bold text-lg">{answers.length}</div>
                    <div className="text-ctd-mute text-sm">Questions Answered</div>
                  </div>
                  <div className="bg-ctd-bg/50 rounded-lg p-4 text-center border border-ctd-border/50">
                    <div className="text-ctd-holo font-bold text-lg">AI-Generated</div>
                    <div className="text-ctd-mute text-sm">Personalized Analysis</div>
                  </div>
                  <div className="bg-ctd-bg/50 rounded-lg p-4 text-center border border-ctd-border/50">
                    <div className="text-ctd-yellow font-bold text-lg">{new Date().toLocaleDateString()}</div>
                    <div className="text-ctd-mute text-sm">Assessment Date</div>
                  </div>
                </div>
              </div>

              {/* Main Analysis Content */}
              <div className="bg-ctd-bg rounded-2xl border border-ctd-border overflow-hidden">
                <div className="bg-gradient-to-r from-ctd-yellow/10 to-ctd-holo/10 p-4 border-b border-ctd-border">
                  <h3 className="text-xl font-bold text-ctd-text flex items-center">
                    <span className="mr-2">🤖</span>
                    AI-Generated Assessment Report
                  </h3>
                  <p className="text-ctd-mute text-sm mt-1">
                    Comprehensive analysis powered by GPT-4, tailored to your responses
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-lg max-w-none text-ctd-text leading-relaxed">
                    <div 
                      className="ai-analysis-content"
                      dangerouslySetInnerHTML={{ __html: finalReport.replace(/\n/g, '<br />') }} 
                    />
                  </div>
                </div>
              </div>

              {/* Next Steps Section */}
              <div className="bg-gradient-to-br from-ctd-panel via-ctd-bg to-ctd-panel rounded-2xl p-6 border border-ctd-border">
                <div className="flex items-center mb-4">
                  <div className="bg-ctd-holo/20 p-3 rounded-lg mr-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ctd-text">Next Steps in Your Journey</h3>
                    <p className="text-ctd-mute">Continue your Web3 development path</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-ctd-bg/30 rounded-lg p-4 border border-ctd-border/30">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">📚</span>
                      <h4 className="font-semibold text-ctd-text">Explore Learning Paths</h4>
                    </div>
                    <p className="text-ctd-mute text-sm">
                      Discover curated courses and resources based on your assessment
                    </p>
                  </div>
                  
                  <div className="bg-ctd-bg/30 rounded-lg p-4 border border-ctd-border/30">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">🔄</span>
                      <h4 className="font-semibold text-ctd-text">Retake Assessment</h4>
                    </div>
                    <p className="text-ctd-mute text-sm">
                      Track your progress by taking the assessment again later
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push('/questionnaire')}
                className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium"
              >
                🔄 Take Another Assessment
              </button>
              <button
                onClick={() => router.push('/binno-ai')}
                className="px-6 py-3 bg-ctd-panel border border-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border/30 transition-colors font-medium"
              >
                💬 Chat with Binno AI
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-ctd-panel border border-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border/30 transition-colors font-medium"
              >
                📚 Explore Courses
              </button>
              <button
                onClick={exportToPDF}
                className="px-6 py-3 bg-ctd-panel border border-ctd-border text-ctd-text rounded-lg hover:bg-ctd-border/30 transition-colors font-medium"
              >
                � Export PDF
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-ctd-border text-center">
              <p className="text-ctd-mute text-sm">
                💾 Your assessment has been saved. Session ID: {sessionId}
              </p>
              <p className="text-ctd-mute text-xs mt-2">
                ⏰ Completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-ctd-text">
                {t.skillCompass}
              </h1>
              <div className="text-sm text-ctd-mute">
                {formatString(t.questionOf, { current: questionNumber.toString(), total: '15' })}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-ctd-border rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-ctd-yellow to-ctd-holo h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Language Selector */}
          <div className="px-8 pt-4">
            <div className="flex justify-end">
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>

          {/* Question Section */}
          <div className="p-8">
            {isGeneratingQuestion ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctd-yellow mx-auto mb-4"></div>
                <p className="text-ctd-text text-lg">
                  {t.generatingQuestion}
                </p>
                <p className="text-sm text-ctd-mute mt-2">
                  {t.generatingQuestionDesc}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-ctd-text mb-4">
                    {currentQuestion.question_text}
                  </h2>
                  {currentQuestion.context && (
                    <p className="text-sm text-ctd-mute bg-ctd-bg p-3 rounded-lg border border-ctd-border">
                      💡 {currentQuestion.context}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Share your thoughts, strategies, and insights here..."
                    className="w-full h-32 p-4 bg-ctd-bg border border-ctd-border rounded-lg focus:ring-2 focus:ring-ctd-yellow focus:border-ctd-yellow resize-none text-ctd-text placeholder-ctd-mute"
                    disabled={isSubmitting}
                  />
                  
                  <div className="flex justify-between items-center text-sm text-ctd-mute">
                    <span>{characterCount} characters</span>
                    <span>Ctrl+Enter to submit</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-ctd-border flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={questionNumber <= 1 || isSubmitting || isGeneratingQuestion}
              className="px-6 py-3 border border-ctd-border rounded-lg text-ctd-text hover:bg-ctd-border/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {t.previousButton}
            </button>

            <div className="flex space-x-4">
              {isGeneratingReport ? (
                <div className="flex items-center px-6 py-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ctd-yellow mr-2"></div>
                  <span className="text-ctd-yellow font-medium">{t.generatingReport}</span>
                </div>
              ) : (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || currentAnswer.length < 10 || isSubmitting || isGeneratingQuestion}
                  className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      {t.processing}
                    </span>
                  ) : questionNumber >= 15 ? (
                    t.completeAssessment  // ← "Complete Assessment"
                  ) : (
                    t.nextQuestion        // ← "Next Question →"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className="px-8 pb-4">
            <div className="text-xs text-center text-ctd-mute bg-ctd-bg rounded-lg p-2 border border-ctd-border">
              {t.poweredByBinno}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}