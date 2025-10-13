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

function calculateScore(userAnswers: any[]): number {
  if (!userAnswers || !userAnswers.length) return 0;
  
  const responses = userAnswers.map(a => (a?.user_response || '').trim());
  const uniqueResponses = new Set(responses);
  
  // Major penalty for copy-paste behavior
  const hasRepeatedResponses = uniqueResponses.size < responses.length;
  const globalPenalty = hasRepeatedResponses ? 30 : 0;
  
  let totalScore = 0;
  
  for (const answer of userAnswers) {
    const response = (answer?.user_response || '').toLowerCase().trim();
    let questionScore = 40; // Start with moderate base score, not 100%
    
    // Length quality (max 25 points)
    if (response.length < 10) {
      questionScore = 15;
    } else if (response.length < 30) {
      questionScore = 25;
    } else if (response.length > 100) {
      questionScore += 15; // Bonus for detailed responses
    }
    
    // Content analysis (max 35 points)
    const hasTechnicalTerms = /blockchain|smart.?contract|defi|nft|web3|dapp|token|crypto|solidity|ethereum|bnb/i.test(response);
    const hasSpecificDetails = /https?:\/\/|0x[a-fA-F0-9]{40}|github|gitlab|contract|audit|testnet|mainnet/i.test(response);
    const isGenericProject = /projeto|platform|sistema|application/i.test(response) && response.length < 50;
    
    if (hasTechnicalTerms) questionScore += 15;
    if (hasSpecificDetails) questionScore += 20; // Real evidence gets higher score
    if (isGenericProject) questionScore -= 20; // Generic responses penalized
    
    // Pattern detection for low-effort responses
    const repeatedPattern = /(.)\1{4,}/;
    const meaninglessPattern = /^[a-z]{15,}$/i;
    
    if (repeatedPattern.test(response)) {
      questionScore = 5; // Very low score for repeated chars
    }
    
    if (meaninglessPattern.test(response)) {
      questionScore = 10; // Low score for meaningless text
    }
    
    // Apply global penalty for copy-paste behavior
    questionScore -= globalPenalty;
    
    // Ensure realistic bounds - NO automatic high scores
    questionScore = Math.max(5, Math.min(80, questionScore)); // Max 80%, not 100%
    
    totalScore += questionScore;
  }
  
  const finalScore = Math.round(totalScore / userAnswers.length);
  
  // Additional reality check - if most responses are generic, cap the score
  const avgLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;
  if (avgLength < 40 && finalScore > 50) {
    return Math.min(finalScore, 35); // Cap low-effort responses
  }
  
  return finalScore;
}

async function getStructuredAnalysisJSON(userAnswers: any[], score: number, language = 'pt') {
  console.log('🤖 Starting AI analysis - NO FALLBACK MODE');
  
  if (!OPENAI_API_KEY) {
    throw new Error('❌ OPENAI_API_KEY is required. Configure environment variable.');
  }

  const condensed = userAnswers
    .map((a, i) => `Q${i + 1}: ${a.question_text || a.question}\nA${i + 1}: ${a.user_response || 'No response'}`)
    .join('\n\n');

  const system = `You are BinnoAI, an expert Web3 project analyst for CTDHUB platform. 

CRITICAL: Respond ONLY with valid JSON in this EXACT structure:
{
  "executive_summary": "Based on ${userAnswers.length} detailed responses, provide comprehensive assessment with score ${score}%. Professional analysis for Web3 project evaluation.",
  "strengths": ["Specific technical strength 1", "Strategic advantage 2", "Market positioning 3"],
  "weaknesses": ["Technical gap 1", "Strategic weakness 2", "Market challenge 3"],
  "improvements": ["Actionable technical improvement 1", "Strategic enhancement 2", "Operational optimization 3"],
  "study_plan": [
    {
      "area": "Technical focus area (e.g., Smart Contract Security, DeFi Architecture)",
      "priority": "High/Medium/Low",
      "resources": ["Specific technical resource 1", "Learning material 2"],
      "timeframe": "2-4 weeks",
      "evidence": "Direct quote from user response demonstrating this need"
    }
  ],
  "next_actions": ["Immediate technical action 1", "Strategic initiative 2", "Operational task 3"],
  "learning_resources": ["Technical documentation 1", "Educational platform 2", "Industry report 3"],
  "risks": ["Technical risk 1", "Market risk 2", "Operational risk 3"],
  "copy_paste_detected": false,
  "copy_paste_explanation": "Analysis of response authenticity and patterns"
}

Score interpretation:
- 80-100%: Exceptional Web3 project ready for mainnet deployment
- 65-79%: Strong foundation with minor optimizations needed
- 45-64%: Good concept requiring strategic improvements
- 25-44%: Basic understanding needing significant development
- 0-24%: Fundamental gaps requiring intensive learning

Focus areas for analysis:
- Technical architecture & smart contract security
- Tokenomics design & sustainability 
- Market positioning & competitive advantage
- Team expertise & execution capability
- Community building & go-to-market strategy`;

  const user = `Analyze this Web3 project based on ${userAnswers.length} questionnaire responses. Calculated score: ${score}%

Project Responses:
${condensed}

Requirements:
- Provide expert-level analysis appropriate for score ${score}%
- Focus on technical depth, strategic insights, and actionable recommendations  
- Identify specific strengths, weaknesses, and improvement opportunities
- Create personalized study plan with concrete resources and timelines
- Assess risks and provide mitigation strategies
- Ensure all recommendations are Web3/blockchain industry specific

Deliver comprehensive professional analysis in the specified JSON format.`;

  try {
    console.log('🚀 Calling OpenAI API...');
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
      })
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('❌ OpenAI API Error:', resp.status, errorText);
      throw new Error(`OpenAI API error ${resp.status}: ${errorText}`);
    }
    
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '';
    
    console.log('✅ AI Response received:', content.substring(0, 200) + '...');
    
    // Parse the JSON directly
    const analysisData = JSON.parse(content);
    console.log('✅ AI Analysis parsed successfully');
    
    return sanitizeReport(analysisData);
    
  } catch (err) {
    console.error('❌ Complete AI Analysis Failed:', err);
    throw new Error(`AI Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', ok: false });
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