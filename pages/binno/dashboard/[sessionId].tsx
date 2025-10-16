import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserAnswer {
  question_id: string
  question_text: string
  user_response: string
}

interface AnalysisStatus {
  [question_id: string]: {
    analyzed: boolean
    ai_analysis?: string
  }
}

export default function Dashboard() {
  const router = useRouter()
  const { sessionId } = router.query
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [status, setStatus] = useState<AnalysisStatus>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  // Carrega respostas do localStorage (ou Supabase futuramente)
  useEffect(() => {
    if (!sessionId) return
    const sessionKey = `questionnaire_session_${sessionId}`
    const savedSession = localStorage.getItem(sessionKey)
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession)
        setAnswers(sessionData.answers || [])
      } catch {}
    }
    // Carrega userId
    const storedUserId = localStorage.getItem('ctdhub_user_id')
    if (storedUserId) setUserId(storedUserId)
  }, [sessionId])

  // Carrega status das análises do Supabase
  useEffect(() => {
    if (!userId || !sessionId || answers.length === 0) return
    setLoading(true)
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase
      .from('user_question_analyses')
      .select('question_id, ai_analysis')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .then((result) => {
        const data = result.data as Array<{ question_id: string; ai_analysis?: string }> | null
        const st: AnalysisStatus = {}
        data?.forEach((row) => {
          st[row.question_id] = { analyzed: !!row.ai_analysis, ai_analysis: row.ai_analysis }
        })
        setStatus(st)
        setLoading(false)
      })
  }, [userId, sessionId, answers])

  // Chama função serverless para obter análise individual
  const handleAnalyze = async (question: UserAnswer) => {
    if (!userId || !sessionId) return
    setStatus((prev) => ({ ...prev, [question.question_id]: { analyzed: false } }))
    const res = await fetch('/.netlify/functions/binno-individual-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        question_id: question.question_id,
        question_text: question.question_text,
        user_response: question.user_response
      })
    })
    const data = await res.json()
    setStatus((prev) => ({
      ...prev,
      [question.question_id]: { analyzed: !!data.ai_analysis, ai_analysis: data.ai_analysis }
    }))
  }

  return (
    <div className="min-h-screen bg-ctd-bg dark:bg-ctd-bg-dark">
      <Header />
      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-ctd-yellow">Dashboard de Análises Individuais</h1>
        {loading && <div className="text-gray-500">Carregando...</div>}
        {!loading && answers.length === 0 && (
          <div className="text-gray-500">Nenhuma resposta encontrada para esta sessão.</div>
        )}
        <ul className="space-y-6">
          {answers.map((q, idx) => (
            <li key={q.question_id} className="bg-ctd-panel dark:bg-ctd-panel-dark rounded-xl p-5 border border-ctd-border dark:border-ctd-border-dark">
              <div className="font-semibold text-ctd-holo mb-2">Pergunta {idx + 1}</div>
              <div className="mb-2 text-ctd-text dark:text-ctd-text-dark">{q.question_text}</div>
              <div className="mb-2 text-gray-700 dark:text-gray-300"><span className="font-bold">Sua resposta:</span> {q.user_response}</div>
              <div className="flex items-center gap-4 mt-2">
                <button
                  className="px-4 py-2 rounded bg-ctd-yellow text-black font-bold hover:bg-ctd-holo transition"
                  onClick={() => handleAnalyze(q)}
                  disabled={status[q.question_id]?.analyzed}
                >
                  {status[q.question_id]?.analyzed ? 'Análise pronta!' : 'Obter análise'}
                </button>
                {status[q.question_id]?.analyzed && (
                  <Link href={`/binno/analysis/${sessionId}/${q.question_id}`} legacyBehavior>
                    <a className="text-ctd-holo underline hover:text-ctd-yellow">Ver análise</a>
                  </Link>
                )}
              </div>
              {status[q.question_id]?.ai_analysis && (
                <div className="mt-4 p-3 bg-ctd-bg dark:bg-ctd-bg-dark rounded text-sm border border-ctd-border dark:border-ctd-border-dark">
                  <span className="font-bold text-ctd-yellow">Resumo IA:</span> {status[q.question_id].ai_analysis}
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  )
}
