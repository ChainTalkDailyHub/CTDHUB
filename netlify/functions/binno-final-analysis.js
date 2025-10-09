/* eslint-disable */
const { createClient } = require('@supabase/supabase-js')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

// ---- ENV (configure no painel) ----
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // NÃO faça fallback para chave hard-coded
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SITE_URL = process.env.SITE_URL || 'https://ctdhub.io'
const LOGO_PATH = process.env.PDF_LOGO_PATH || path.join(process.cwd(), 'public', 'images', 'CTDHUB.png')

// Supabase (opcional)
const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// --- UTIL: pontuação simples
function calculateScore(userAnswers) {
  if (!userAnswers || !userAnswers.length) return 0
  let total = 0
  for (const a of userAnswers) {
    const len = (a?.user_response || '').trim().length
    const quality = Math.min(10, len / 20) // heurística
    total += quality
  }
  return Math.round((total / (userAnswers.length * 10)) * 100)
}

// --- IA: chama OpenAI e força JSON estruturado
async function getStructuredAnalysisJSON(userAnswers, score, language = 'en') {
  // Fallback simples se não houver chave
  if (!OPENAI_API_KEY) return buildFallbackJSON(userAnswers, score, language)

  const condensed = userAnswers
    .map((a, i) => `Q${i + 1}: ${a.question_text}\nA${i + 1}: ${a.user_response || ''}`)
    .join('\n\n')

  const system = `You are Binno AI, a Web3 assessor for CTDHub. Return ONLY valid JSON, no prose.`
  const user = `
Context:
- Total answers: ${userAnswers.length}
- Overall score: ${score}%
- Language: ${language}

Rules:
- If answers are positive/good: acknowledge strengths and suggest improvements if any.
- If answers show gaps: point out exactly what's wrong and what to study next.
- Keep it concise but actionable.
- Return JSON with keys exactly:
  {
    "executive_summary": string,
    "strengths": string[],
    "weaknesses": string[],
    "improvements": string[],
    "study_plan": string[],
    "risks": string[],
    "next_actions": string[]
  }

Answers:
${condensed}`

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
      })
    })

    if (!resp.ok) throw new Error(`OpenAI ${resp.status}`)
    const data = await resp.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)
    return sanitizeReport(parsed)
  } catch (err) {
    console.error('OpenAI error:', err)
    return buildFallbackJSON(userAnswers, score, language)
  }
}

function sanitizeReport(r) {
  // Garante chaves obrigatórias
  const safeArr = (x) => Array.isArray(x) ? x.filter(Boolean).map(String) : []
  return {
    executive_summary: String(r?.executive_summary || ''),
    strengths: safeArr(r?.strengths),
    weaknesses: safeArr(r?.weaknesses),
    improvements: safeArr(r?.improvements),
    study_plan: safeArr(r?.study_plan),
    risks: safeArr(r?.risks),
    next_actions: safeArr(r?.next_actions),
  }
}

// Fallback JSON básico (sem IA)
function buildFallbackJSON(userAnswers, score, language = 'en') {
  const en = language !== 'pt'
  return {
    executive_summary: en
      ? `Based on ${userAnswers.length} answers, your current score is ${score}%. This snapshot highlights strengths and gaps to prioritize in your Web3 journey.`
      : `Com base em ${userAnswers.length} respostas, sua pontuação atual é ${score}%. Este retrato destaca forças e lacunas para priorizar na sua jornada Web3.`,
    strengths: [
      en ? 'Proactive learning attitude' : 'Postura proativa de aprendizado',
      en ? 'Baseline understanding of core blockchain concepts' : 'Entendimento básico de conceitos de blockchain'
    ],
    weaknesses: [
      en ? 'Limited hands-on experience with smart contracts' : 'Pouca prática com smart contracts'
    ],
    improvements: [
      en ? 'Practice on testnets with small guided tasks' : 'Praticar em testnets com tarefas guiadas'
    ],
    study_plan: [
      en ? 'Finish an ERC-20 & ERC-721 mini-series' : 'Concluir uma mini-série de ERC-20 e ERC-721',
      en ? 'Study security checklists (reentrancy, auth, pause)' : 'Estudar checklists de segurança (reentrancy, auth, pause)'
    ],
    risks: [
      en ? 'Deploying without audits or code reviews' : 'Deploy sem auditorias ou code reviews'
    ],
    next_actions: [
      en ? 'Pick one module per week and ship a small demo' : 'Escolher um módulo por semana e publicar um pequeno demo'
    ]
  }
}

// --- PDF: gera buffer com layout simples
function buildPdfBuffer({ projectTitle, sessionId, site = SITE_URL, report }) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 })
    const chunks = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    // Logo (se existir)
    try {
      if (LOGO_PATH && fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, 48, 36, { width: 120 })
      }
    } catch (_) {}

    doc.fontSize(20).fillColor('#111').text('CTDHub — Skill Compass Report', 48, 96)
    doc.moveDown(0.3)
    doc.fontSize(11).fillColor('#555').text(`${projectTitle || 'Web3 Project'} • ${site} • Session ${sessionId}`)
    doc.moveDown(0.8)
    doc.moveTo(48, doc.y).lineTo(548, doc.y).strokeColor('#FFD84D').lineWidth(1).stroke()
    doc.moveDown(1)

    const section = (title, body) => {
      doc.fontSize(14).fillColor('#111').text(title)
      doc.moveDown(0.25)
      doc.fontSize(11).fillColor('#222')
      if (Array.isArray(body)) {
        for (const item of body) {
          doc.circle(54, doc.y + 6, 2).fill('#FFD84D')
          doc.fillColor('#222').text(`   ${item}`, 60, doc.y - 6)
          doc.moveDown(0.2)
        }
      } else {
        doc.text(body || '-')
      }
      doc.moveDown(0.8)
    }

    section('Executive Summary', report.executive_summary)
    section('Strengths', report.strengths)
    section('Weaknesses', report.weaknesses)
    section('Suggested Improvements', report.improvements)
    section('Study Plan', report.study_plan)
    section('Risks & Considerations', report.risks)
    section('Next Actions', report.next_actions)

    doc.moveDown(1)
    doc.fontSize(9).fillColor('#777').text('Generated by CTDHub • © CTDHub', { align: 'center' })
    doc.end()
  })
}

// --- Netlify handler (ou export default em Next API)
exports.handler = async (event) => {
  const headersJSON = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headersJSON, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headersJSON, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch (e) {
    return { statusCode: 400, headers: headersJSON, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const {
    sessionId,
    userAnswers = [],
    language = 'en',
    projectTitle = 'Web3 Project',
    // format: 'pdf' | 'json'  (default pdf)
    format = 'pdf'
  } = payload

  if (!sessionId || !Array.isArray(userAnswers) || userAnswers.length === 0) {
    return { statusCode: 400, headers: headersJSON, body: JSON.stringify({ error: 'sessionId and userAnswers are required' }) }
  }

  try {
    const score = calculateScore(userAnswers)
    const structured = await getStructuredAnalysisJSON(userAnswers, score, language)

    // Salva no Supabase (opcional)
    if (supabase) {
      try {
        await supabase
          .from('user_analysis_reports')
          .upsert({
            session_id: sessionId,
            user_id: sessionId,
            score,
            language,
            report_json: structured,
            created_at: new Date().toISOString()
          })
      } catch (dbErr) {
        console.error('Supabase upsert error:', dbErr?.message)
      }
    }

    if (format === 'json') {
      // Devolve JSON estruturado
      return {
        statusCode: 200,
        headers: { ...headersJSON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, sessionId, score, report: structured })
      }
    }

    // Default: gerar PDF e devolver para download
    const pdf = await buildPdfBuffer({
      projectTitle,
      sessionId,
      site: SITE_URL,
      report: structured
    })

    return {
      statusCode: 200,
      headers: {
        ...headersJSON,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ctdhub-report-${sessionId}.pdf"`
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true
    }
  } catch (err) {
    console.error('final-analysis error:', err)
    return { statusCode: 500, headers: headersJSON, body: JSON.stringify({ error: 'failed_to_generate_report' }) }
  }
}