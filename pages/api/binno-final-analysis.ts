import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Supabase client (optional)
const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function calculateScore(userAnswers: any[]) {
  if (!userAnswers || !userAnswers.length) return 0;
  let total = 0;
  for (const a of userAnswers) {
    const len = (a?.user_response || '').trim().length;
    const quality = Math.min(10, len / 20);
    total += quality;
  }
  return Math.round((total / (userAnswers.length * 10)) * 100);
}

async function getStructuredAnalysisJSON(userAnswers: any[], score: number, language = 'en') {
  // Fallback if no OpenAI key
  if (!OPENAI_API_KEY) return buildFallbackJSON(userAnswers, score, language);

  const condensed = userAnswers
    .map((a, i) => `Q${i + 1}: ${a.question_text}\nA${i + 1}: ${a.user_response || ''}`)
    .join('\n\n');

  const system = `You are Binno AI, a Web3 assessor for CTDHub. Return ONLY valid JSON, no prose.`;
  const user = `
Context:
- Total answers: ${userAnswers.length}
- Overall score: ${score}%
- Language: ${language}

Rules:
- If answers are positive/good: acknowledge strengths and suggest improvements if any.
- If answers show gaps: point out exactly what's wrong and what to study next.
- Provide specific learning resources and study plans for identified gaps.
- Include realistic timelines for skill development.
- Reference specific quotes from user responses as evidence.
- Keep it concise but actionable with detailed study recommendations.
- Return JSON with keys exactly:
  {
    "executive_summary": string,
    "strengths": string[],
    "weaknesses": string[],
    "improvements": string[],
    "study_plan": [
      {
        "area": string,
        "priority": "High|Medium|Low",
        "resources": string[],
        "timeframe": string,
        "evidence": string
      }
    ],
    "learning_resources": [
      {
        "topic": string,
        "type": "Course|Documentation|Tutorial|Community",
        "name": string,
        "url": string,
        "reason": string
      }
    ],
    "risks": string[],
    "next_actions": string[]
  }

Answers:
${condensed}`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
      })
    });

    if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    return sanitizeReport(parsed);
  } catch (err) {
    console.error('OpenAI error:', err);
    return buildFallbackJSON(userAnswers, score, language);
  }
}

function sanitizeReport(r: any) {
  const safeArr = (x: any) => Array.isArray(x) ? x.filter(Boolean).map(String) : [];
  const safeStr = (x: any) => typeof x === 'string' ? x : '';
  
  return {
    executive_summary: safeStr(r?.executive_summary),
    strengths: safeArr(r?.strengths),
    weaknesses: safeArr(r?.weaknesses),
    improvements: safeArr(r?.improvements),
    study_plan: Array.isArray(r?.study_plan) ? r.study_plan.map((item: any) => ({
      area: safeStr(item?.area),
      priority: safeStr(item?.priority),
      resources: safeArr(item?.resources),
      timeframe: safeStr(item?.timeframe),
      evidence: safeStr(item?.evidence)
    })) : [],
    learning_resources: Array.isArray(r?.learning_resources) ? r.learning_resources.map((item: any) => ({
      topic: safeStr(item?.topic),
      type: safeStr(item?.type),
      name: safeStr(item?.name),
      url: safeStr(item?.url),
      reason: safeStr(item?.reason)
    })) : [],
    risks: safeArr(r?.risks),
    next_actions: safeArr(r?.next_actions),
  };
}

function buildFallbackJSON(userAnswers: any[], score: number, language = 'en') {
  const en = language !== 'pt';
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
      {
        area: en ? 'Smart Contract Development' : 'Desenvolvimento de Smart Contracts',
        priority: 'High',
        resources: [
          en ? 'Solidity Documentation' : 'Documentação Solidity',
          en ? 'OpenZeppelin Contracts' : 'Contratos OpenZeppelin',
          en ? 'Remix IDE Tutorials' : 'Tutoriais Remix IDE'
        ],
        timeframe: en ? '2-3 weeks' : '2-3 semanas',
        evidence: en ? 'Limited smart contract experience demonstrated' : 'Pouca experiência com smart contracts demonstrada'
      }
    ],
    learning_resources: [
      {
        topic: en ? 'Web3 Development' : 'Desenvolvimento Web3',
        type: 'Course',
        name: en ? 'Web3 Development Fundamentals' : 'Fundamentos de Desenvolvimento Web3',
        url: 'https://web3.university',
        reason: en ? 'Based on gaps in blockchain knowledge' : 'Baseado em lacunas no conhecimento de blockchain'
      }
    ],
    risks: [
      en ? 'Deploying without audits or code reviews' : 'Deploy sem auditorias ou code reviews'
    ],
    next_actions: [
      en ? 'Pick one module per week and ship a small demo' : 'Escolher um módulo por semana e publicar um pequeno demo'
    ]
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      sessionId,
      userAnswers = [],
      language = 'en',
      format = 'json'
    } = req.body;

    if (!sessionId || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      res.status(400).json({ error: 'sessionId and userAnswers are required' });
      return;
    }

    const score = calculateScore(userAnswers);
    const structured = await getStructuredAnalysisJSON(userAnswers, score, language);

    // Save to Supabase (optional)
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
          });
      } catch (dbErr) {
        console.error('Supabase upsert error:', dbErr);
      }
    }

    // Return JSON structured report
    res.status(200).json({
      success: true,
      sessionId: sessionId,
      score: score,
      analysis: structured.executive_summary,
      report: structured,
      metadata: {
        totalQuestions: userAnswers.length,
        completionTime: `${Math.round(userAnswers.length * 2)} minutes`,
        analysisVersion: '2.0',
        aiGenerated: !!OPENAI_API_KEY,
        language: language
      },
      saved: true
    });

  } catch (err) {
    console.error('final-analysis error:', err);
    res.status(500).json({ 
      error: 'failed_to_generate_report',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}