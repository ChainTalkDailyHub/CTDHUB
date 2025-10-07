// Binno - AI Web3 Mentor System
// Revolutionary conversational simulator for Web3 project development

export interface BinnoConversation {
  id: string
  session_id: string
  stage: string
  scenario: BinnoScenario
  user_response: string
  binno_analysis: BinnoAnalysis
  score_impact: number
  reputation_impact: number
  consequence_description: string
  timestamp: string
}

export interface BinnoScenario {
  id: string
  title: string
  description: string
  context: string
  critical_factors: string[]
  ideal_approach_keywords: string[]
  risk_indicators: string[]
  bnb_relevance: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface BinnoAnalysis {
  overall_score: number // 0-100
  strengths_identified: string[]
  weaknesses_identified: string[]
  missing_considerations: string[]
  risk_assessment: {
    technical: number
    financial: number
    regulatory: number
    market: number
  }
  bnb_integration_understanding: number
  improvement_suggestions: string[]
  consequence_prediction: string
}

export interface BinnoMentorSession {
  session_id: string
  final_score: number
  major_mistakes: BinnoMistake[]
  key_successes: BinnoSuccess[]
  overall_assessment: string
  personalized_roadmap: string[]
  bnb_expertise_level: number
  next_learning_steps: string[]
}

export interface BinnoMistake {
  scenario_id: string
  mistake_description: string
  correct_approach: string
  real_world_example: string
  learning_resources: string[]
}

export interface BinnoSuccess {
  scenario_id: string
  success_description: string
  why_it_worked: string
  how_to_improve_further: string
  advanced_strategies: string[]
}

// Binno's Dynamic Scenario Generator
export const BINNO_SCENARIOS: Record<string, BinnoScenario[]> = {
  ideation: [
    {
      id: 'regulatory_storm',
      title: 'Regulatory Storm Approaches',
      description: 'You just received insider information that the SEC is planning a major crackdown on DeFi projects next month. Your project is currently in stealth mode. What is your immediate action plan?',
      context: 'The regulatory landscape is becoming increasingly hostile. Similar projects are going underground or pivoting to compliance-first approaches. You have $2M in funding and a team of 8 developers.',
      critical_factors: [
        'Regulatory compliance strategy',
        'Geographic jurisdiction selection',
        'Legal team engagement',
        'Community communication',
        'Technology architecture adaptation'
      ],
      ideal_approach_keywords: [
        'compliance', 'legal counsel', 'jurisdiction', 'transparency', 
        'regulatory sandbox', 'licensing', 'KYC', 'AML', 'registration'
      ],
      risk_indicators: [
        'ignore', 'continue normally', 'hide', 'underground', 
        'avoid lawyers', 'no changes needed'
      ],
      bnb_relevance: 95,
      difficulty_level: 'expert'
    },
    {
      id: 'team_crisis',
      title: 'Core Team Mutiny',
      description: 'Your CTO and two senior developers just submitted their resignations, claiming they disagree with the project direction. They want to build on Ethereum instead of BNB Chain. How do you handle this crisis?',
      context: 'The team members leaving represent 60% of your technical expertise. They have access to critical code repositories and know all technical details. Launch is planned in 3 months.',
      critical_factors: [
        'Team retention strategies',
        'Knowledge transfer',
        'Code security',
        'Timeline adjustment',
        'Hiring strategy'
      ],
      ideal_approach_keywords: [
        'negotiate', 'compromise', 'knowledge transfer', 'non-compete', 
        'code audit', 'documentation', 'hiring', 'retention bonus'
      ],
      risk_indicators: [
        'good riddance', 'replace immediately', 'ignore', 'continue without them',
        'no changes needed'
      ],
      bnb_relevance: 85,
      difficulty_level: 'advanced'
    }
  ],
  
  development: [
    {
      id: 'zero_day_exploit',
      title: 'Zero-Day Exploit Discovery',
      description: 'A white hat hacker just contacted you privately about a critical vulnerability in your smart contract that could drain the entire treasury. They want $50K for the details and demand a response within 4 hours before going public.',
      context: 'Your contracts are already deployed on testnet with $100K worth of tokens. Mainnet launch is in 1 week. The hacker provided enough proof to show they found something real.',
      critical_factors: [
        'Security incident response',
        'Hacker negotiation',
        'Code audit prioritization',
        'Community communication',
        'Timeline management'
      ],
      ideal_approach_keywords: [
        'bug bounty', 'security audit', 'pause contracts', 'emergency response',
        'thank the hacker', 'reward', 'transparency', 'code review'
      ],
      risk_indicators: [
        'ignore', 'refuse to pay', 'threaten legal action', 'continue launch',
        'it\'s probably fake'
      ],
      bnb_relevance: 90,
      difficulty_level: 'expert'
    }
  ],

  tokenomics: [
    {
      id: 'whale_manipulation',
      title: 'Coordinated Whale Attack',
      description: 'Three crypto whales have coordinated to buy 25% of your token supply during the private sale, and you discovered they plan to dump everything on launch day to crash the price and buy back cheaper. What is your strategy?',
      context: 'Your token is launching on PancakeSwap in 2 days. These whales have a history of manipulating small cap tokens. Your community is excited and unaware of this threat.',
      critical_factors: [
        'Anti-whale mechanisms',
        'Liquidity protection',
        'Community communication',
        'Launch strategy adjustment',
        'Long-term tokenomics'
      ],
      ideal_approach_keywords: [
        'vesting', 'anti-whale', 'max transaction', 'liquidity lock',
        'gradual release', 'community protection', 'transparency'
      ],
      risk_indicators: [
        'let them dump', 'no problem', 'free market', 'ignore',
        'whales are good for liquidity'
      ],
      bnb_relevance: 95,
      difficulty_level: 'advanced'
    }
  ],

  community_building: [
    {
      id: 'influencer_scandal',
      title: 'Your Lead Ambassador Gets Cancelled',
      description: 'Your biggest community advocate with 500K followers just got exposed for promoting three rug pulls last year. The crypto community is calling for you to distance yourself, but this person genuinely loves your project and wants to continue promoting it.',
      context: 'This influencer has been your most effective marketing channel, bringing in 40% of your community. Cutting ties would significantly hurt your reach, but keeping them might damage your reputation.',
      critical_factors: [
        'Reputation management',
        'Community trust',
        'Marketing strategy pivot',
        'Ethical considerations',
        'Long-term brand building'
      ],
      ideal_approach_keywords: [
        'distance', 'ethics', 'community trust', 'organic growth',
        'authentic supporters', 'reputation protection'
      ],
      risk_indicators: [
        'keep them quietly', 'ignore the controversy', 'everyone deserves second chances',
        'marketing is marketing'
      ],
      bnb_relevance: 70,
      difficulty_level: 'intermediate'
    }
  ]
}

export class BinnoAI {
  private openaiKey: string

  constructor(openaiKey: string) {
    this.openaiKey = openaiKey
  }

  async analyzeUserResponse(
    scenario: BinnoScenario,
    userResponse: string,
    context: {
      currentScore: number
      reputation: number
      previousDecisions: string[]
    }
  ): Promise<BinnoAnalysis> {
    const prompt = this.buildAnalysisPrompt(scenario, userResponse, context)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Binno, an expert Web3 mentor specializing in BNB Chain ecosystem development. 
                       You analyze user responses to complex Web3 scenarios and provide detailed, actionable feedback.
                       
                       Your analysis should be:
                       - Brutally honest but constructive
                       - Focused on real-world Web3 experience
                       - BNB Chain ecosystem aware
                       - Scored based on practical effectiveness
                       
                       Always respond in JSON format with the BinnoAnalysis structure.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      
      return analysis
    } catch (error) {
      console.error('Binno analysis error:', error)
      return this.getFallbackAnalysis(scenario, userResponse)
    }
  }

  async generateMentorSession(
    sessionId: string,
    conversations: BinnoConversation[],
    finalScore: number
  ): Promise<BinnoMentorSession> {
    const prompt = this.buildMentorSessionPrompt(conversations, finalScore)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Binno, conducting a post-simulation mentoring session. 
                       Analyze the user's entire simulation journey and provide:
                       - Detailed feedback on major mistakes
                       - Recognition of successes
                       - Personalized learning roadmap
                       - BNB Chain specific insights
                       
                       Be encouraging but honest. Help them become better Web3 entrepreneurs.
                       Respond in JSON format with BinnoMentorSession structure.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      })

      const data = await response.json()
      const mentorSession = JSON.parse(data.choices[0].message.content)
      
      return mentorSession
    } catch (error) {
      console.error('Binno mentor session error:', error)
      return this.getFallbackMentorSession(sessionId, finalScore)
    }
  }

  private buildAnalysisPrompt(
    scenario: BinnoScenario,
    userResponse: string,
    context: any
  ): string {
    return `
SCENARIO: ${scenario.title}
DESCRIPTION: ${scenario.description}
CONTEXT: ${scenario.context}
BNB RELEVANCE: ${scenario.bnb_relevance}%
DIFFICULTY: ${scenario.difficulty_level}

USER RESPONSE: "${userResponse}"

CURRENT CONTEXT:
- Score: ${context.currentScore}/100
- Reputation: ${context.reputation}/100
- Previous decisions: ${context.previousDecisions.join(', ')}

ANALYSIS CRITERIA:
1. Strategic thinking depth
2. Risk awareness and mitigation
3. BNB Chain ecosystem understanding
4. Real-world practicality
5. Regulatory compliance consideration
6. Community impact awareness
7. Technical implementation feasibility
8. Financial implications understanding

Please analyze this response and provide a detailed BinnoAnalysis JSON with scores, feedback, and improvement suggestions.
Focus especially on BNB Chain ecosystem best practices and real-world Web3 startup challenges.
`
  }

  private buildMentorSessionPrompt(
    conversations: BinnoConversation[],
    finalScore: number
  ): string {
    const conversationSummary = conversations.map(conv => 
      `Scenario: ${conv.scenario.title}\nResponse: ${conv.user_response}\nScore Impact: ${conv.score_impact}`
    ).join('\n\n')

    return `
SIMULATION COMPLETE
Final Score: ${finalScore}/100

CONVERSATION HISTORY:
${conversationSummary}

Please provide a comprehensive mentoring session analyzing:
1. Major mistakes and how to fix them
2. Successful decisions and how to build on them
3. Overall assessment of Web3 readiness
4. Personalized learning roadmap
5. BNB Chain ecosystem expertise level
6. Next steps for improvement

Focus on actionable advice for becoming a successful Web3 entrepreneur.
`
  }

  private getFallbackAnalysis(scenario: BinnoScenario, userResponse: string): BinnoAnalysis {
    // Fallback analysis if AI call fails
    return {
      overall_score: 50,
      strengths_identified: ['Basic understanding shown'],
      weaknesses_identified: ['Analysis unavailable - please try again'],
      missing_considerations: ['Unable to analyze at this time'],
      risk_assessment: { technical: 50, financial: 50, regulatory: 50, market: 50 },
      bnb_integration_understanding: 50,
      improvement_suggestions: ['Please retry for detailed feedback'],
      consequence_prediction: 'Analysis temporarily unavailable'
    }
  }

  private getFallbackMentorSession(sessionId: string, finalScore: number): BinnoMentorSession {
    return {
      session_id: sessionId,
      final_score: finalScore,
      major_mistakes: [],
      key_successes: [],
      overall_assessment: 'Mentoring session temporarily unavailable',
      personalized_roadmap: ['Please retry for detailed feedback'],
      bnb_expertise_level: 50,
      next_learning_steps: ['System will be available shortly']
    }
  }
}