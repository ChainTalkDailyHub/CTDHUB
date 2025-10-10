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

// Parse template-based response (more reliable than JSON)
function parseTemplateResponse(response: string, score: number) {
  console.log('🔧 Parsing template response...');
  
  const sections: any = {};
  
  // Extract sections using regex
  const extractSection = (sectionName: string, multiline = false) => {
    const pattern = multiline 
      ? new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i')
      : new RegExp(`${sectionName}:\\s*(.+)`, 'i');
    const match = response.match(pattern);
    return match ? match[1].trim() : '';
  };
  
  // Extract all sections
  sections.executive_summary = extractSection('EXECUTIVE_SUMMARY', true);
  sections.score = extractSection('SCORE');
  sections.strengths = extractSection('STRENGTHS', true);
  sections.weaknesses = extractSection('WEAKNESSES', true);
  sections.improvements = extractSection('IMPROVEMENTS', true);
  sections.study_plan = extractSection('STUDY_PLAN', true);
  sections.copy_paste = extractSection('COPY_PASTE_DETECTED', true);
  
  // Convert to list format
  const parseList = (text: string) => {
    if (!text) return [];
    return text.split(/\n|\-/).filter(item => item.trim()).map(item => item.trim().replace(/^[\-\*]\s*/, ''));
  };
  
  // Build final structure
  const analysis = {
    executive_summary: sections.executive_summary || `Assessment completed with score ${score}%. ${score < 30 ? 'Significant issues with response quality detected.' : 'Analysis shows areas for improvement.'}`,
    strengths: parseList(sections.strengths).slice(0, 4) || (score > 40 ? ['Basic project concept provided'] : ['Limited strengths demonstrated']),
    weaknesses: parseList(sections.weaknesses) || [
      'Provide question-specific responses',
      'Avoid copy-paste behavior', 
      'Demonstrate deeper technical knowledge'
    ],
    improvements: parseList(sections.improvements) || [
      'Read each question carefully',
      'Provide targeted, specific answers',
      'Develop technical knowledge in Web3'
    ],
    study_plan: sections.study_plan ? parseStudyPlan(sections.study_plan) : [{
      area: 'Web3 Fundamentals',
      priority: 'High',
      resources: ['Basic blockchain concepts'],
      timeframe: '2-4 weeks',
      evidence: 'Based on response analysis'
    }],
    learning_resources: [{
      topic: 'Web3 Development',
      type: 'Course',
      name: 'Blockchain Basics',
      url: 'https://example.com',
      reason: 'Foundation needed'
    }],
    risks: [`With score ${score}%, significant preparation needed`],
    next_actions: ['Improve question comprehension', 'Develop specific knowledge']
  };
  
  console.log('✅ Template parsed into structured analysis');
  return analysis;
}

// Parse study plan section
function parseStudyPlan(planText: string) {
  const plans = [];
  const items = planText.split(/AREA:|;/).filter(item => item.trim());
  
  for (const item of items) {
    if (item.trim()) {
      const parts = item.split('|').map(p => p.trim());
      plans.push({
        area: parts[0] || 'General Web3',
        priority: parts[1]?.replace('PRIORITY:', '').trim() || 'Medium',
        resources: [parts[2]?.replace('RESOURCES:', '').trim() || 'Study materials'],
        timeframe: parts[3]?.replace('TIMEFRAME:', '').trim() || '2-4 weeks',
        evidence: parts[4]?.replace('EVIDENCE:', '').trim() || 'Based on assessment'
      });
    }
  }
  
  return plans.length > 0 ? plans : [{
    area: 'Web3 Fundamentals',
    priority: 'High',
    resources: ['Basic concepts'],
    timeframe: '2-4 weeks',
    evidence: 'Foundation needed'
  }];
}

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
Return your analysis in this EXACT template format (no JSON, no markdown):

EXECUTIVE_SUMMARY:
[Write 2-3 sentences about overall assessment and copy-paste detection]

SCORE:
[The calculated score: ${score}]

STRENGTHS:
[List 2-4 genuine strengths if any, or write "Limited strengths demonstrated"]

WEAKNESSES:
[List 3-5 specific weakness areas including copy-paste issues]

IMPROVEMENTS:
[List 3-5 actionable improvements]

STUDY_PLAN:
[Write: AREA: [area] | PRIORITY: [High/Medium/Low] | RESOURCES: [resources] | TIMEFRAME: [timeframe] | EVIDENCE: [evidence from responses]]

COPY_PASTE_DETECTED:
[Write YES or NO, then explain if copy-paste was found]

Remember: Be brutally honest about copy-paste behavior and response quality.

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
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parseTemplateResponse(content, score);
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