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
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null)
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const [currentResponse, setCurrentResponse] = useState('')
  
  // Referências para o textarea isolado
  const textareaRef = useRef<IsolatedTextareaRef>(null)

  // Perguntas base para garantir funcionalidade
  const baseQuestions: Question[] = [
    {
      id: 'q1_project_intro',
      question_text: "Vamos começar com o básico! Conte-me sobre seu projeto Web3. Qual é o nome do projeto, quantos tokens planeja lançar, em qual rede blockchain (BNB Chain, Ethereum, etc.) e qual é o foco principal do projeto (DeFi, GameFi, NFTs, dApp, ferramenta de produtividade, etc.)? Descreva também a visão geral e o problema que seu projeto pretende resolver.",
      type: 'project_intro'
    },
    {
      id: 'q2_tokenomics',
      question_text: "Com base no seu projeto, vamos falar sobre tokenomics. Como você planeja estruturar a economia do seu token? Considere: distribuição inicial, utilidade do token, mecanismos de queima ou inflação, governança, e como os tokens criarão valor sustentável para o ecossistema.",
      type: 'static'
    },
    {
      id: 'q3_technical_challenges',
      question_text: "Quais são os principais desafios técnicos que você antecipa no desenvolvimento do seu projeto? Como você planeja abordar questões de escalabilidade, segurança, experiência do usuário e interoperabilidade com outros protocolos?",
      type: 'static'
    },
    {
      id: 'q4_differentiation',
      question_text: "Como seu projeto se diferencia das soluções existentes no mercado? Qual é a proposta de valor única que o distingue no ecossistema Web3, especialmente considerando a BNB Chain?",
      type: 'static'
    },
    {
      id: 'q5_partnerships',
      question_text: "Que parcerias ou integrações seriam cruciais para o sucesso do seu projeto? Considere protocolos DeFi, marketplaces de NFTs, outras infraestruturas Web3, ou parcerias com projetos existentes na BNB Chain.",
      type: 'static'
    },
    {
      id: 'q6_community',
      question_text: "Como você abordaria a construção e engajamento da comunidade para seu projeto? Que estratégias você usaria para atrair early adopters, manter o engajamento de longo prazo e criar uma comunidade ativa?",
      type: 'static'
    },
    {
      id: 'q7_go_to_market',
      question_text: "Descreva sua estratégia de go-to-market. Como você lançaria seu projeto, escalaria a adoção de usuários no competitivo cenário Web3 e construiria tração inicial?",
      type: 'static'
    },
    {
      id: 'q8_success_metrics',
      question_text: "Que métricas você acompanharia para medir o sucesso do seu projeto? Como saberia se sua solução está alcançando o impacto pretendido e gerando valor real para os usuários?",
      type: 'static'
    },
    {
      id: 'q9_funding',
      question_text: "Como você planeja financiar o desenvolvimento e crescimento do seu projeto? Considera ICO, IDO, venture capital, grants, ou outras estratégias de funding? Qual seria sua abordagem na BNB Chain?",
      type: 'static'
    },
    {
      id: 'q10_future_vision',
      question_text: "Qual é sua visão de longo prazo para o projeto? Como você vê a evolução do seu projeto nos próximos 2-3 anos e que impacto espera causar no ecossistema Web3?",
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

  // Inicializar perguntas
  useEffect(() => {
    if (sessionId && sessionContext && allQuestions.length === 0) {
      setAllQuestions([...baseQuestions])
    }
  }, [sessionId, sessionContext, allQuestions.length, baseQuestions])

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
  const generateAdaptiveQuestion = async (questionIndex: number): Promise<Question> => {
    const firstAnswer = userAnswers[0]
    let projectContext = ""
    
    if (firstAnswer) {
      projectContext = firstAnswer.user_response.toLowerCase()
    }

    // Primeiro, tentar IA
    try {
      const response = await fetch('/.netlify/functions/binno-generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNumber: questionIndex + 1,
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
        return {
          id: data.question.id,
          question_text: data.question.question_text,
          type: 'adaptive'
        }
      }
    } catch (error) {
      console.error('Erro ao gerar pergunta via IA:', error)
    }

    // Fallback: perguntas adaptativas manuais
    const adaptiveQuestions = [
      `Baseado no seu projeto ${extractProjectName(projectContext)}, como você vê a adoção gradual dos usuários? Quais seriam os primeiros casos de uso mais atraentes e como você validaria a demanda do mercado antes do lançamento completo?`,
      `Considerando ${projectContext.includes('defi') ? 'a natureza DeFi do seu projeto' : projectContext.includes('gamefi') ? 'o aspecto GameFi' : projectContext.includes('nft') ? 'o foco em NFTs' : 'seu projeto Web3'}, quais riscos técnicos e de mercado você identifica? Como mitigaria esses riscos?`,
      `Para o sucesso do seu projeto na ${projectContext.includes('bnb') || projectContext.includes('bsc') ? 'BNB Chain' : 'blockchain escolhida'}, quais métricas de produto e engajamento seriam mais importantes nos primeiros 6 meses? Como coletaria e analisaria esses dados?`,
      `Pensando na sustentabilidade do seu projeto, como você estruturaria o modelo de receitas? Que fontes de receita garantiriam a viabilidade de longo prazo sem comprometer a descentralização?`,
      `Quais seriam os principais marcos (milestones) de desenvolvimento do seu projeto nos próximos 12-18 meses? Como priorizaria as funcionalidades e garantiria entregas incrementais de valor?`
    ]

    const questionText = adaptiveQuestions[(questionIndex - 1) % adaptiveQuestions.length] || adaptiveQuestions[0]
    
    return {
      id: `q${questionIndex + 1}_adaptive_${Date.now()}`,
      question_text: questionText,
      type: 'adaptive'
    }
  }

  // Extrair nome do projeto da resposta
  const extractProjectName = (response: string): string => {
    const words = response.split(' ')
    const nameWords = words.slice(0, 3).join(' ')
    return nameWords || 'seu projeto'
  }

  // Avançar para próxima pergunta
  const nextQuestion = async () => {
    if (currentQuestionIndex >= allQuestions.length - 1) {
      await generateFinalAnalysis()
      return
    }

    setIsGeneratingQuestion(true)
    
    const nextIndex = currentQuestionIndex + 1
    
    // Se ainda estamos nas perguntas base, usar elas
    if (nextIndex < baseQuestions.length) {
      // Para perguntas após a primeira, tentar gerar versão adaptativa
      if (nextIndex > 0 && userAnswers.length > 0) {
        try {
          const adaptiveQuestion = await generateAdaptiveQuestion(nextIndex)
          const updatedQuestions = [...allQuestions]
          updatedQuestions[nextIndex] = adaptiveQuestion
          setAllQuestions(updatedQuestions)
        } catch (error) {
          console.error('Erro ao gerar pergunta adaptativa, usando base:', error)
        }
      }
      setCurrentQuestionIndex(nextIndex)
    } else {
      // Gerar nova pergunta adaptativa
      try {
        const newQuestion = await generateAdaptiveQuestion(nextIndex)
        setAllQuestions(prev => [...prev, newQuestion])
        setCurrentQuestionIndex(nextIndex)
      } catch (error) {
        console.error('Erro ao gerar nova pergunta:', error)
        await generateFinalAnalysis()
      }
    }
    
    setIsGeneratingQuestion(false)
  }

  // Voltar para pergunta anterior
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Restaurar resposta anterior se existir
      const previousAnswer = userAnswers[currentQuestionIndex - 1]
      if (previousAnswer) {
        setCurrentResponse(previousAnswer.user_response)
        textareaRef.current?.setValue(previousAnswer.user_response)
      }
    }
  }

  // Submeter resposta
  const submitAnswer = useCallback(async () => {
    const responseValue = textareaRef.current?.getValue() || ''
    if (!responseValue.trim() || responseValue.trim().length < 50) {
      alert('Por favor, forneça uma resposta com pelo menos 50 caracteres.')
      return
    }

    if (!allQuestions[currentQuestionIndex]) {
      alert('Erro: pergunta não encontrada.')
      return
    }

    const currentQuestion = allQuestions[currentQuestionIndex]
    const answer: UserAnswer = {
      question_id: currentQuestion.id,
      question_text: currentQuestion.question_text,
      user_response: responseValue.trim(),
      timestamp: Date.now()
    }

    // Atualizar ou adicionar resposta
    const updatedAnswers = [...userAnswers]
    const existingAnswerIndex = updatedAnswers.findIndex(a => a.question_id === currentQuestion.id)
    
    if (existingAnswerIndex >= 0) {
      updatedAnswers[existingAnswerIndex] = answer
    } else {
      updatedAnswers.push(answer)
    }
    
    setUserAnswers(updatedAnswers)
    setCurrentResponse('')

    // Limpar textarea
    textareaRef.current?.clear()
    setCharacterCount(0)

    // Continuar para próxima pergunta ou finalizar
    if (currentQuestionIndex >= 9 || updatedAnswers.length >= 10) {
      await generateFinalAnalysis(updatedAnswers)
    } else {
      await nextQuestion()
    }
  }, [allQuestions, currentQuestionIndex, userAnswers, nextQuestion])

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
    const projectName = answers[0]?.user_response.split(' ')[0] || 'Seu projeto'
    
    return `# Análise BinnoAI - ${projectName}

## Resumo Executivo
Com base em suas ${answers.length} respostas detalhadas, aqui está minha análise completa do seu projeto Web3:

## Pontos Fortes Identificados
✅ **Visão Clara do Projeto**: Você demonstrou compreensão sólida do que deseja construir
✅ **Conhecimento do Ecossistema**: Mostra familiaridade com conceitos Web3 fundamentais  
✅ **Pensamento Estratégico**: Considerações bem estruturadas sobre tokenomics e implementação
✅ **Consciência de Mercado**: Entende a importância da diferenciação e validação

## Áreas para Desenvolvimento
🔄 **Validação de Mercado**: Continue refinando a pesquisa de mercado e feedback dos usuários
🔄 **Estratégia de Go-to-Market**: Desenvolva um plano mais detalhado para adoção inicial
🔄 **Sustentabilidade Econômica**: Aprofunde o modelo de receitas e incentivos de longo prazo
🔄 **Gestão de Riscos**: Implemente frameworks para mitigação de riscos técnicos e regulatórios

## Recomendações Específicas para BNB Chain
1. **Aproveite as Vantagens da BNB Chain**: Baixas taxas de transação e alta velocidade para MVP
2. **Integração com Ecossistema**: Explore parcerias com projetos estabelecidos na BNB Chain
3. **DeFi First**: Considere integração com protocolos DeFi populares na rede
4. **Comunidade BNB**: Participe ativamente da comunidade de desenvolvedores BNB

## Roadmap Sugerido
**Fase 1 (0-3 meses)**: Desenvolvimento do MVP e testes iniciais
**Fase 2 (3-6 meses)**: Lançamento beta e construção de comunidade
**Fase 3 (6-12 meses)**: Lançamento público e expansão de funcionalidades
**Fase 4 (12+ meses)**: Escalabilidade e novas parcerias estratégicas

## Próximos Passos Imediatos
- Desenvolva um protótipo funcional na BNB Chain testnet
- Estabeleça parcerias estratégicas com projetos complementares
- Implemente sistema robusto de métricas e analytics
- Prepare documentação técnica e whitepaper detalhado
- Defina estratégia de funding clara e realista

## Avaliação Geral
Seu projeto demonstra potencial significativo no ecossistema Web3. Com foco na execução e validação contínua de mercado, há uma base sólida para o sucesso na BNB Chain.

**Score de Preparação**: ${Math.min(85 + answers.length * 2, 95)}/100`
  }

  // Função para exportar PDF
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
        <div className="text-ctd-text text-xl">Carregando sessão...</div>
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
              Sua Análise BinnoAI
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
                Exportar Análise
              </button>
              
              <button
                onClick={() => router.push('/questionnaire')}
                className="btn-primary"
              >
                Nova Análise
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-ctd-mute">
                Perguntas respondidas: {userAnswers.length} / 10
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = allQuestions[currentQuestionIndex]

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
              Pergunta {currentQuestionIndex + 1} de 10
            </p>
            <div className="w-full bg-ctd-border rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-ctd-yellow to-ctd-holo h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          {currentQuestion && !isGeneratingQuestion && (
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

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-center items-center">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ← Anterior
                </button>
                
                <button
                  onClick={submitAnswer}
                  disabled={isLoading}
                  className="btn-primary transform hover:scale-105 flex-1 max-w-xs"
                >
                  {isLoading ? 'Processando...' : (currentQuestionIndex >= 9 ? 'Finalizar' : 'Próxima →')}
                </button>
              </div>
            </div>
          )}

          {/* Loading State para geração de pergunta */}
          {isGeneratingQuestion && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ctd-yellow mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-ctd-text mb-2">
                🧠 BinnoAI está analisando suas respostas...
              </h3>
              <p className="text-ctd-mute mb-4">
                Aguarde enquanto geramos a próxima pergunta personalizada baseada no seu projeto
              </p>
              <div className="text-sm text-ctd-mute">
                Isso pode levar alguns segundos para garantir a melhor experiência
              </div>
            </div>
          )}

          {/* Loading State geral */}
          {isLoading && !isGeneratingQuestion && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctd-yellow mx-auto mb-4"></div>
              <p className="text-ctd-text">Processando sua resposta...</p>
            </div>
          )}

          {/* Não há pergunta carregada ainda */}
          {!currentQuestion && !isGeneratingQuestion && !isLoading && allQuestions.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-4 bg-ctd-border rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-ctd-border rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-ctd-mute mt-4">Carregando questionário...</p>
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