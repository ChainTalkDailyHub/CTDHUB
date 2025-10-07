import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import IsolatedTextarea, { IsolatedTextareaRef } from '../../../components/IsolatedTextarea'
import { selectQuestion, generateStaticAnalysis, StaticQuestion } from '../../../lib/questionnaireQuestions'

interface Question {
  id: string
  question_text: string
}

interface UserAnswer {
  question_id: string
  question_text: string
  user_response: string
  timestamp: number
}

interface SessionContext {
  user_id: string
  experience_level: string
  interests: string[]
  goal: string
}

export default function QuestionnairePage() {
  const router = useRouter()
  const { sessionId } = router.query

  // Estados principais
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null)
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null)
  const [characterCount, setCharacterCount] = useState(0)
  
  // Referências para o textarea isolado
  const textareaRef = useRef<IsolatedTextareaRef>(null)

  // Carregar contexto da sessão
  useEffect(() => {
    if (sessionId && typeof sessionId === 'string') {
      const contextData = localStorage.getItem(`questionnaire_context_${sessionId}`)
      if (contextData) {
        setSessionContext(JSON.parse(contextData))
      }
    }
  }, [sessionId])

  // Carregar primeira pergunta
  useEffect(() => {
    if (sessionId && currentQuestionNumber === 1 && !currentQuestion && sessionContext) {
      // Para a primeira pergunta, sempre usar a pergunta específica do projeto
      setCurrentQuestion({
        id: `q1_project_intro_${Date.now()}`,
        question_text: "Vamos começar com o básico! Conte-me sobre seu projeto Web3. Qual é o nome do projeto, quantos tokens planeja lançar, em qual rede blockchain (BNB Chain, Ethereum, etc.) e qual é o foco principal do projeto (DeFi, GameFi, NFTs, dApp, ferramenta de produtividade, etc.)? Descreva também a visão geral e o problema que seu projeto pretende resolver."
      })
    }
  }, [sessionId, sessionContext])

  // Atualizar contador de caracteres
  const updateCharacterCount = useCallback(() => {
    const count = textareaRef.current?.getValue()?.length || 0
    setCharacterCount(count)
  }, [])

  // Configurar listener para atualizar contador
  useEffect(() => {
    const interval = setInterval(updateCharacterCount, 500)
    return () => clearInterval(interval)
  }, [updateCharacterCount])

  // Função para gerar resumo das respostas
  const generateResponsesSummary = useCallback(() => {
    return userAnswers.map(answer => 
      `Q: ${answer.question_text}\nA: ${answer.user_response.substring(0, 100)}...`
    ).join('\n\n')
  }, [userAnswers])

  // Gerar pergunta específica do projeto baseada nas respostas anteriores
  const generateProjectSpecificQuestion = (questionNumber: number, answers: UserAnswer[]) => {
    // Extrair informações do projeto da primeira resposta
    const firstAnswer = answers[0]
    let projectContext = ""
    
    if (firstAnswer) {
      projectContext = firstAnswer.user_response
    }

    const projectSpecificQuestions = [
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Baseado no seu projeto "${projectContext.split(' ')[0] || 'Web3'}", como você planeja estruturar a tokenomics? Considere a distribuição inicial, utilidade do token, mecanismos de governança e como os tokens criarão valor para o ecossistema do seu projeto.`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Quais são os principais desafios técnicos que você antecipa no desenvolvimento do seu projeto ${projectContext.includes('DeFi') ? 'DeFi' : projectContext.includes('GameFi') ? 'GameFi' : projectContext.includes('NFT') ? 'NFT' : 'Web3'}? Como você planeja abordar questões de escalabilidade, segurança e experiência do usuário?`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Como seu projeto se diferencia das soluções existentes ${projectContext.includes('BNB') ? 'na BNB Chain' : 'no mercado'}? Qual é a proposta de valor única que o distingue no ecossistema Web3?`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Que parcerias ou integrações seriam cruciais para o sucesso do seu projeto? Considere protocolos DeFi, marketplaces de NFTs, ou outras infraestruturas Web3 ${projectContext.includes('BNB') ? 'na BNB Chain' : 'relevantes'}.`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Como você abordaria a construção e engajamento da comunidade para seu projeto? Que estratégias você usaria para atrair early adopters e manter o engajamento de longo prazo?`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Quais considerações regulatórias são importantes para seu projeto? Como você garantiria a conformidade mantendo os princípios de descentralização?`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Descreva sua estratégia de go-to-market. Como você lançaria seu projeto e escalaria a adoção de usuários no competitivo cenário Web3?`
      },
      {
        id: `project_q${questionNumber}_${Date.now()}`,
        question_text: `Que métricas você acompanharia para medir o sucesso do seu projeto? Como saberia se sua solução está alcançando o impacto pretendido?`
      }
    ]

    return projectSpecificQuestions[(questionNumber - 2) % projectSpecificQuestions.length] || projectSpecificQuestions[0]
  }

  // Carregar próxima pergunta
  const loadNextQuestion = async (updatedAnswers?: UserAnswer[]) => {
    if (currentQuestionNumber > 30) {
      await generateFinalAnalysis()
      return
    }

    setIsLoading(true)
    
    // Use as respostas atualizadas se fornecidas, senão use o estado atual
    const answersToUse = updatedAnswers || userAnswers
    
    try {
      // SEMPRE tentar IA primeiro - mesmo em localhost
      const apiEndpoint = '/.netlify/functions/binno-generate-question'

      // Gerar resumo das respostas atualizadas
      const responsesSummary = answersToUse.map(answer => 
        `Q: ${answer.question_text}\nA: ${answer.user_response.substring(0, 300)}...`
      ).join('\n\n')

      console.log('Sending to AI API:', {
        questionNumber: currentQuestionNumber,
        previousAnswersCount: answersToUse.length,
        responsesSummary: responsesSummary.substring(0, 150) + '...'
      })

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNumber: currentQuestionNumber,
          previousAnswers: answersToUse,
          sessionContext: {
            user_expertise_level: sessionContext?.experience_level || 'intermediate',
            project_focus: sessionContext?.interests?.join(', ') || 'Web3 development',
            previous_responses_summary: responsesSummary
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('AI Question received:', data.question.question_text.substring(0, 80) + '...')
        setCurrentQuestion(data.question)
      } else {
        console.log('AI API failed, response:', response.status, response.statusText)
        // Fallback to project-specific static questions
        const projectSpecificQuestion = generateProjectSpecificQuestion(currentQuestionNumber, answersToUse)
        setCurrentQuestion(projectSpecificQuestion)
      }
    } catch (error) {
      console.error('Error calling AI API:', error)
      // Fallback to project-specific static questions
      const projectSpecificQuestion = generateProjectSpecificQuestion(currentQuestionNumber, answersToUse)
      setCurrentQuestion(projectSpecificQuestion)
    } finally {
      setIsLoading(false)
    }
  }

  // Submeter resposta
  const submitAnswer = useCallback(async () => {
    const responseValue = textareaRef.current?.getValue() || ''
    if (!responseValue.trim() || !currentQuestion || responseValue.trim().length < 50) {
      alert('Please provide a response with at least 50 characters.')
      return
    }

    const answer: UserAnswer = {
      question_id: currentQuestion.id,
      question_text: currentQuestion.question_text,
      user_response: responseValue.trim(),
      timestamp: Date.now()
    }

    const updatedAnswers = [...userAnswers, answer]
    setUserAnswers(updatedAnswers)

    // Limpar textarea
    textareaRef.current?.clear()
    setCharacterCount(0)

    // Continuar para próxima pergunta ou finalizar
    if (currentQuestionNumber >= 30 || updatedAnswers.length >= 30) {
      await generateFinalAnalysis(updatedAnswers)
    } else {
      setCurrentQuestionNumber(prev => prev + 1)
      // Passar as respostas atualizadas para a próxima pergunta
      await loadNextQuestion(updatedAnswers)
    }
  }, [currentQuestion, currentQuestionNumber, userAnswers])

  // Gerar análise final
  const generateFinalAnalysis = async (answers?: UserAnswer[]) => {
    const finalAnswers = answers || userAnswers
    setIsLoading(true)
    
    try {
      // Try AI-generated analysis first
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      const apiEndpoint = isLocalhost 
        ? '/api/binno/final-analysis'
        : '/.netlify/functions/binno-final-analysis'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswers: finalAnswers,
          sessionContext: sessionContext
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFinalAnalysis(data.analysis)
      } else {
        // Fallback to static analysis if API fails
        console.log('API failed, using static analysis')
        const analysis = generateStaticAnalysis(finalAnswers, sessionContext?.experience_level || 'intermediate')
        setFinalAnalysis(analysis)
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
      // Fallback to static analysis
      const analysis = generateStaticAnalysis(finalAnswers, sessionContext?.experience_level || 'intermediate')
      setFinalAnalysis(analysis)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para exportar PDF (versão simplificada)
  const exportToPDF = async () => {
    if (!finalAnalysis) return

    try {
      // Create a simple text version for download
      const textContent = `
BinnoAI Questionnaire Analysis
Session ID: ${sessionId}
Generated: ${new Date().toLocaleString()}

${finalAnalysis}

---
Responses Summary:
${userAnswers.map((answer, index) => 
  `${index + 1}. ${answer.question_text}\n   Answer: ${answer.user_response.substring(0, 200)}...\n`
).join('\n')}
      `
      
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `binno-ai-analysis-${sessionId}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting file:', error)
      alert('Error exporting analysis. Please try again.')
    }
  }

  // Se ainda não temos contexto, mostrar loading
  if (!sessionContext) {
    return (
      <div className="min-h-screen bg-ctd-bg flex items-center justify-center">
        <div className="text-ctd-text text-xl">Loading session...</div>
      </div>
    )
  }

  // Se temos análise final, mostrar resultado
  if (finalAnalysis) {
    return (
      <div className="min-h-screen bg-ctd-bg py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card p-8 relative">
            <div className="corner corner--tl"></div>
            <div className="corner corner--tr"></div>
            <div className="corner corner--bl"></div>
            <div className="corner corner--br"></div>
            <h1 className="text-3xl font-bold text-ctd-text mb-6 text-center">
              Your BinnoAI Analysis
            </h1>
            
            <div className="bg-ctd-panel/50 rounded-lg p-6 mb-6 border border-ctd-border">
              <div className="text-ctd-text whitespace-pre-wrap text-lg leading-relaxed">
                {finalAnalysis}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={exportToPDF}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Export to PDF
              </button>
              
              <button
                onClick={() => router.push('/questionnaire')}
                className="btn-primary"
              >
                Start New Analysis
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-ctd-mute">
                Questions answered: {userAnswers.length} / 30
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ctd-bg py-8 neon-grid">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card p-8 relative">
          <div className="corner corner--tl"></div>
          <div className="corner corner--tr"></div>
          <div className="corner corner--bl"></div>
          <div className="corner corner--br"></div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ctd-text mb-2">
              BinnoAI Adaptive Questionnaire
            </h1>
            <p className="text-ctd-mute">
              Question {currentQuestionNumber} of 30
            </p>
            <div className="w-full bg-ctd-border rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-ctd-yellow to-ctd-holo h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionNumber / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          {currentQuestion && (
            <div className="mb-8">
              <div className="bg-ctd-panel/30 rounded-lg p-6 mb-6 border border-ctd-border/50">
                <h2 className="text-xl font-semibold text-ctd-text mb-4">
                  {currentQuestion.question_text}
                </h2>
              </div>

              {/* Response Area */}
              <div className="mb-6">
                <label className="block text-ctd-text font-medium mb-2">
                  Your Response (minimum 50 characters):
                </label>
                <IsolatedTextarea
                  ref={textareaRef}
                  placeholder="Share your thoughts, experiences, and insights here..."
                  className="w-full h-32 p-4 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text placeholder-ctd-mute resize-none focus:outline-none focus:ring-2 focus:ring-ctd-yellow focus:border-transparent"
                />
                <div className="text-right mt-2">
                  <span className="text-ctd-mute text-sm">
                    Characters: {characterCount}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  onClick={submitAnswer}
                  disabled={isLoading}
                  className="btn-primary transform hover:scale-105"
                >
                  {isLoading ? 'Processing...' : 'Submit & Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !currentQuestion && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctd-yellow mx-auto mb-4"></div>
              <p className="text-ctd-text">Generating your next question...</p>
            </div>
          )}

          {/* Progress Info */}
          <div className="mt-8 text-center text-ctd-mute">
            <p>Responses completed: {userAnswers.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}