import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AnalysisPage() {
  const router = useRouter()
  const { sessionId, questionId } = router.query
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  // Carrega userId e dados da resposta
  useEffect(() => {
    if (!sessionId || !questionId) return
    const storedUserId = localStorage.getItem('ctdhub_user_id')
    if (storedUserId) setUserId(storedUserId)
    // Busca no Supabase
    if (supabase && storedUserId) {
      supabase
        .from('user_question_analyses')
        .select('question_text, user_response, ai_analysis')
        .eq('user_id', storedUserId)
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .single()
        .then(({ data }) => {
          if (data) {
            setQuestion(data.question_text)
            setAnswer(data.user_response)
            setAiAnalysis(data.ai_analysis)
          }
          setLoading(false)
        })
    }
  }, [sessionId, questionId])

  return (
    <div className="min-h-screen bg-ctd-bg dark:bg-ctd-bg-dark">
      <Header />
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-ctd-yellow">Análise Individual - Binno</h1>
        {loading ? (
          <div className="text-gray-500">Carregando análise...</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-ctd-panel dark:bg-ctd-panel-dark rounded-xl p-5 border border-ctd-border dark:border-ctd-border-dark">
              <div className="font-semibold text-ctd-holo mb-2">Pergunta</div>
              <div className="mb-2 text-ctd-text dark:text-ctd-text-dark">{question}</div>
              <div className="font-semibold text-ctd-yellow mt-4 mb-2">Sua resposta</div>
              <div className="mb-2 text-gray-700 dark:text-gray-300">{answer}</div>
            </div>
            <div className="bg-ctd-bg dark:bg-ctd-bg-dark rounded-xl p-5 border border-ctd-border dark:border-ctd-border-dark">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🤖</span>
                <span className="font-bold text-ctd-holo">Binno (IA):</span>
              </div>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                {aiAnalysis || 'Nenhuma análise encontrada para esta resposta.'}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
