import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import IsolatedTextarea, { IsolatedTextareaRef } from '../../../components/IsolatedTextarea'

interface Question {
  id: string
  question_text: string
  type: 'project_intro' | 'adaptive' | 'static'
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

  // Perguntas estáticas pré-definidas para garantir funcionalidade
  const staticQuestions: Question[] = [
    {
      id: 'q1_project_intro',
      question_text: "Vamos começar com o básico! Conte-me sobre seu projeto Web3. Qual é o nome do projeto, quantos tokens planeja lançar, em qual rede blockchain (BNB Chain, Ethereum, etc.) e qual é o foco principal do projeto (DeFi, GameFi, NFTs, dApp, ferramenta de produtividade, etc.)? Descreva também a visão geral e o problema que seu projeto pretende resolver.",
      type: 'project_intro'
    },
    {
      id: 'q2_tokenomics',
      question_text: "Agora vamos falar sobre tokenomics. Como você planeja estruturar a economia do seu token? Considere: distribuição inicial, utilidade do token, mecanismos de queima ou inflação, governança, e como os tokens criarão valor sustentável para o ecossistema do seu projeto.",
      type: 'static'
    },
    {
      id: 'q3_technical_challenges',
      question_text: "Quais são os principais desafios técnicos que você antecipa no desenvolvimento do seu projeto? Como você planeja abordar questões de escalabilidade, segurança, experiência do usuário e interoperabilidade com outros protocolos?",
      type: 'static'
    },
    {
      id: 'q4_differentiation',
      question_text: "Como seu projeto se diferencia das soluções existentes no mercado? Qual é a proposta de valor única que o distingue no ecossistema Web3, especialmente se considerarmos a BNB Chain?",
      type: 'static'
    },
    {
      id: 'q5_partnerships',
      question_text: "Que parcerias ou integrações seriam cruciais para o sucesso do seu projeto? Considere protocolos DeFi, marketplaces de NFTs, outras infraestruturas Web3, ou parcerias com projetos existentes na BNB Chain.",
      type: 'static'
    },
    {
      id: 'q6_community',
      question_text: "Como você abordaria a construção e engajamento da comunidade para seu projeto? Que estratégias você usaria para atrair early adopters, manter o engajamento de longo prazo e criar uma comunidade ativa e participativa?",
      type: 'static'
    },
    {
      id: 'q7_regulatory',
      question_text: "Quais considerações regulatórias são importantes para seu projeto? Como você garantiria a conformidade com regulamentações locais e internacionais mantendo os princípios de descentralização?",
      type: 'static'
    },
    {
      id: 'q8_go_to_market',
      question_text: "Descreva sua estratégia de go-to-market. Como você lançaria seu projeto, escalaria a adoção de usuários no competitivo cenário Web3 e construiria tração inicial?",
      type: 'static'
    },
    {
      id: 'q9_success_metrics',
      question_text: "Que métricas você acompanharia para medir o sucesso do seu projeto? Como saberia se sua solução está alcançando o impacto pretendido e gerando valor real para os usuários?",
      type: 'static'
    },
    {
      id: 'q10_funding',
      question_text: "Como você planeja financiar o desenvolvimento e crescimento do seu projeto? Considera ICO, IDO, venture capital, grants, ou outras estratégias de funding? Qual seria sua abordagem na BNB Chain?",
      type: 'static'
    }
  ]

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
      setCurrentQuestion(staticQuestions[0])
    }
  }, [sessionId, sessionContext, currentQuestion, currentQuestionNumber])

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

  // Gerar pergunta adaptativa baseada nas respostas anteriores
  const generateAdaptiveQuestion = (questionNumber: number, answers: UserAnswer[]): Question => {
    const firstAnswer = answers[0]
    let projectContext = ""
    
    if (firstAnswer) {
      projectContext = firstAnswer.user_response.toLowerCase()
    }

    // Perguntas adaptativas baseadas no contexto do projeto
    const adaptiveQuestions = [
      {
        id: `q${questionNumber}_adaptive_${Date.now()}`,
        question_text: `Baseado no seu projeto ${extractProjectName(projectContext)}, como você vê a adoção gradual dos usuários? Quais seriam os primeiros casos de uso mais atraentes e como você validaria a demanda do mercado antes do lançamento completo?`,
        type: 'adaptive' as const
      },
      {
        id: `q${questionNumber}_adaptive_${Date.now()}`,
        question_text: `Considerando ${projectContext.includes('defi') ? 'a natureza DeFi do seu projeto' : projectContext.includes('gamefi') ? 'o aspecto GameFi' : projectContext.includes('nft') ? 'o foco em NFTs' : 'seu projeto Web3'}, quais riscos técnicos e de mercado você identifica? Como mitigaria esses riscos?`,
        type: 'adaptive' as const
      },
      {
        id: `q${questionNumber}_adaptive_${Date.now()}`,
        question_text: `Para o sucesso do seu projeto na ${projectContext.includes('bnb') || projectContext.includes('bsc') ? 'BNB Chain' : 'blockchain escolhida'}, quais métricas de produto e engajamento seriam mais importantes nos primeiros 6 meses? Como coletaria e analisaria esses dados?`,
        type: 'adaptive' as const
      },
      {
        id: `q${questionNumber}_adaptive_${Date.now()}`,
        question_text: `Pensando na sustentabilidade do seu projeto, como você estruturaria o modelo de receitas? Que fontes de receita garantiriam a viabilidade de longo prazo sem comprometer a descentralização?`,
        type: 'adaptive' as const
      },
      {
        id: `q${questionNumber}_adaptive_${Date.now()}`,
        question_text: `Quais seriam os principais marcos (milestones) de desenvolvimento do seu projeto nos próximos 12-18 meses? Como priorizaria as funcionalidades e garantiria entregas incrementais de valor?`,
        type: 'adaptive' as const
      }
    ]

    return adaptiveQuestions[(questionNumber - 2) % adaptiveQuestions.length] || adaptiveQuestions[0]
  }

  // Extrair nome do projeto da resposta
  const extractProjectName = (response: string): string => {
    const words = response.split(' ')
    const nameWords = words.slice(0, 3).join(' ')
    return nameWords || 'seu projeto'
  }

  // Carregar próxima pergunta
  const loadNextQuestion = async () => {
    if (currentQuestionNumber > 10) {
      await generateFinalAnalysis()
      return
    }

    setIsLoading(true)
    
    try {
      // Tentar IA primeiro, se falhar usar lógica adaptativa/estática
      const shouldTryAI = userAnswers.length > 0 && Math.random() > 0.3 // 70% chance de usar IA

      if (shouldTryAI) {
        const response = await fetch('/.netlify/functions/binno-generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionNumber: currentQuestionNumber,
            previousAnswers: userAnswers,
            sessionContext: {
              user_expertise_level: sessionContext?.experience_level || 'intermediate',
              project_focus: sessionContext?.interests?.join(', ') || 'Web3 development',
              previous_responses_summary: userAnswers.map(a => a.user_response.substring(0, 100)).join(' ')
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentQuestion({
            id: data.question.id,
            question_text: data.question.question_text,
            type: 'adaptive'
          })
          return
        }
      }

      // Fallback: usar pergunta estática ou adaptativa
      if (currentQuestionNumber <= staticQuestions.length) {
        setCurrentQuestion(staticQuestions[currentQuestionNumber - 1])
      } else {
        // Gerar pergunta adaptativa
        const adaptiveQuestion = generateAdaptiveQuestion(currentQuestionNumber, userAnswers)
        setCurrentQuestion(adaptiveQuestion)
      }

    } catch (error) {
      console.error('Erro ao carregar pergunta:', error)
      
      // Fallback final
      if (currentQuestionNumber <= staticQuestions.length) {
        setCurrentQuestion(staticQuestions[currentQuestionNumber - 1])
      } else {
        const adaptiveQuestion = generateAdaptiveQuestion(currentQuestionNumber, userAnswers)
        setCurrentQuestion(adaptiveQuestion)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Submeter resposta
  const submitAnswer = useCallback(async () => {
    const responseValue = textareaRef.current?.getValue() || ''
    if (!responseValue.trim() || !currentQuestion || responseValue.trim().length < 50) {
      alert('Por favor, forneça uma resposta com pelo menos 50 caracteres.')
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
    if (currentQuestionNumber >= 10 || updatedAnswers.length >= 10) {
      await generateFinalAnalysis(updatedAnswers)
    } else {
      setCurrentQuestionNumber(prev => prev + 1)
      await loadNextQuestion()
    }
  }, [currentQuestion, currentQuestionNumber, userAnswers])

  // Gerar análise final
  const generateFinalAnalysis = async (answers?: UserAnswer[]) => {
    const finalAnswers = answers || userAnswers
    setIsLoading(true)
    
    try {
      const response = await fetch('/.netlify/functions/binno-final-analysis', {
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
        // Fallback para análise estática
        setFinalAnalysis(generateStaticAnalysis(finalAnswers))
      }
    } catch (error) {
      console.error('Erro ao gerar análise:', error)
      setFinalAnalysis(generateStaticAnalysis(finalAnswers))
    } finally {
      setIsLoading(false)
    }
  }

  // Análise estática como fallback
  const generateStaticAnalysis = (answers: UserAnswer[]): string => {
    return `# Análise BinnoAI - Seu Projeto Web3

## Resumo Executivo
Com base em suas ${answers.length} respostas, aqui está minha análise do seu projeto Web3:

## Pontos Fortes Identificados
✅ **Visão Clara do Projeto**: Você demonstrou compreensão sólida do que deseja construir
✅ **Conhecimento do Ecossistema**: Mostra familiaridade com conceitos Web3 fundamentais
✅ **Pensamento Estratégico**: Considerações sobre tokenomics e implementação técnica

## Áreas para Desenvolvimento
🔄 **Validação de Mercado**: Continue refinando a pesquisa de mercado e feedback dos usuários
🔄 **Estratégia de Go-to-Market**: Desenvolva um plano mais detalhado para adoção inicial
🔄 **Sustentabilidade Econômica**: Aprofunde o modelo de receitas e incentivos de longo prazo

## Recomendações Específicas
1. **Foco na BNB Chain**: Aproveite as baixas taxas e rapidez para MVP
2. **Comunidade First**: Priorize construção de comunidade desde o início
3. **Iteração Rápida**: Implemente feedback loops com usuários early adopters
4. **Segurança**: Invista em auditorias e testes de segurança desde cedo

## Próximos Passos
- Desenvolva um MVP funcional
- Estabeleça parcerias estratégicas na BNB Chain
- Implemente métricas de acompanhamento detalhadas
- Prepare estratégia de funding adequada

Seu projeto mostra potencial promissor no ecossistema Web3!`
  }

  // Função para exportar PDF (versão simplificada)
  const exportToPDF = async () => {
    if (!finalAnalysis) return

    try {
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
                Questions answered: {userAnswers.length} / 10
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
              Question {currentQuestionNumber} of 10
            </p>
            <div className="w-full bg-ctd-border rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-ctd-yellow to-ctd-holo h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionNumber / 10) * 100}%` }}
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
                <div className="text-sm text-ctd-mute">
                  Tipo: {currentQuestion.type === 'project_intro' ? 'Introdução do Projeto' : 
                         currentQuestion.type === 'adaptive' ? 'Pergunta Adaptativa (IA)' : 'Pergunta Estruturada'}
                </div>
              </div>

              {/* Response Area */}
              <div className="mb-6">
                <label className="block text-ctd-text font-medium mb-2">
                  Sua Resposta (mínimo 50 caracteres):
                </label>
                <IsolatedTextarea
                  ref={textareaRef}
                  placeholder="Compartilhe seus pensamentos, experiências e insights aqui..."
                  className="w-full h-32 p-4 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text placeholder-ctd-mute resize-none focus:outline-none focus:ring-2 focus:ring-ctd-yellow focus:border-transparent"
                />
                <div className="text-right mt-2">
                  <span className="text-ctd-mute text-sm">
                    Caracteres: {characterCount}
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
                  {isLoading ? 'Processando...' : 'Enviar & Continuar'}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !currentQuestion && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctd-yellow mx-auto mb-4"></div>
              <p className="text-ctd-text">Gerando sua próxima pergunta...</p>
            </div>
          )}

          {/* Progress Info */}
          <div className="mt-8 text-center text-ctd-mute">
            <p>Respostas completas: {userAnswers.length}</p>
            {userAnswers.length > 0 && (
              <p className="text-sm mt-2">
                Última resposta: {new Date(userAnswers[userAnswers.length - 1]?.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}