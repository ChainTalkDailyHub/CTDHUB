import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Inicialização direta (não usar lib/supabase.ts)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Função para chamar a IA (OpenAI)
async function getIndividualAnalysis(question: string, answer: string) {
  // Aqui você pode customizar o prompt para análise individual
  const prompt = `Você é o Binno, um avaliador Web3. Analise a resposta abaixo para a pergunta dada, fornecendo feedback construtivo, pontos fortes, pontos de melhoria e sugestões de estudo.\n\nPergunta: ${question}\nResposta do usuário: ${answer}\n\nAnálise detalhada:`

  // Chamada fictícia (substitua pelo fetch real do OpenAI)
  // const response = await fetch(...)
  // return response.data.choices[0].text
  return `Análise simulada para: ${answer.substring(0, 50)}...` // Placeholder
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { user_id, session_id, question_id, question_text, user_response } = JSON.parse(event.body || '{}')
    if (!user_id || !session_id || !question_id || !question_text || !user_response) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // Chama a IA para obter a análise
    const ai_analysis = await getIndividualAnalysis(question_text, user_response)

    // Salva no Supabase
    const { error } = await supabase.from('user_question_analyses').insert([
      {
        user_id,
        session_id,
        question_id,
        question_text,
        user_response,
        ai_analysis
      }
    ])
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ai_analysis })
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Internal error' })
    }
  }
}

export { handler }
