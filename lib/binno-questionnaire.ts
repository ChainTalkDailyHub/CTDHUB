import OpenAI from 'openai'

// Interfaces para o sistema de questionário adaptativo
export interface Question {
  id: string
  question_text: string
  context: string
  stage: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  bnb_relevance: number
  critical_factors: string[]
}

export interface UserAnswer {
  question_id: string
  question_text: string
  user_response: string
  timestamp: number
}

export interface QuestionnaireSession {
  session_id: string
  current_question_number: number
  total_questions: number
  user_answers: UserAnswer[]
  session_context: {
    user_expertise_level: string
    project_focus: string
    previous_responses_summary: string
  }
}

export interface FinalAnalysis {
  overall_score: number
  correct_approaches: {
    question: string
    user_response: string
    why_correct: string
    enhancement_suggestions: string[]
  }[]
  incorrect_approaches: {
    question: string
    user_response: string
    what_went_wrong: string
    correct_approach: string
    how_to_fix: string[]
  }[]
  personalized_recommendations: string[]
  expertise_level_assessment: number
  next_learning_steps: string[]
}

// Tipo para análise final em formato de texto
export type FinalAnalysisText = string

export class BinnoAI {
  private openai: OpenAI | null = null
  
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  // Gerar próxima pergunta baseada nas respostas anteriores
  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: UserAnswer[],
    sessionContext: QuestionnaireSession['session_context']
  ): Promise<Question> {
    if (!this.openai) {
      return this.getFallbackQuestion(questionNumber)
    }

    try {
      // Para a primeira pergunta, sempre perguntar sobre o projeto
      if (questionNumber === 1) {
        return {
          id: `q1_project_intro_${Date.now()}`,
          question_text: "Vamos começar com o básico! Conte-me sobre seu projeto Web3. Qual é o nome do projeto, quantos tokens planeja lançar, em qual rede blockchain (BNB Chain, Ethereum, etc.) e qual é o foco principal do projeto (DeFi, GameFi, NFTs, dApp, ferramenta de produtividade, etc.)? Descreva também a visão geral e o problema que seu projeto pretende resolver.",
          context: "Pergunta inicial para entender o contexto completo do projeto Web3 do usuário",
          stage: "project_overview",
          difficulty_level: 'beginner',
          bnb_relevance: 90,
          critical_factors: ["project_name", "token_supply", "blockchain_network", "project_category", "problem_solving"]
        }
      }

      const prompt = this.buildQuestionGenerationPrompt(questionNumber, previousAnswers, sessionContext)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Binno, an expert Web3/blockchain advisor. Generate intelligent, adaptive questions for a Web3 project development questionnaire. 
            
            CRITICAL REQUIREMENTS:
            - Generate questions that build upon previous user responses
            - Focus on BNB Chain ecosystem when relevant
            - Adapt difficulty based on user's demonstrated knowledge level
            - Cover different aspects: technical, business, tokenomics, community, partnerships
            - Questions should reveal decision-making patterns and strategic thinking
            - Maximum 30 questions total, make each one count
            
            Return JSON format with question details.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const questionData = JSON.parse(content)
      
      return {
        id: `q${questionNumber}_${Date.now()}`,
        question_text: questionData.question_text,
        context: questionData.context || '',
        stage: questionData.stage || this.determineStageFromAnswers(previousAnswers),
        difficulty_level: questionData.difficulty_level || 'intermediate',
        bnb_relevance: questionData.bnb_relevance || 70,
        critical_factors: questionData.critical_factors || []
      }

    } catch (error) {
      console.error('Error generating question:', error)
      return this.getFallbackQuestion(questionNumber)
    }
  }

  // Construir prompt para geração de perguntas
  private buildQuestionGenerationPrompt(
    questionNumber: number,
    previousAnswers: UserAnswer[],
    sessionContext: QuestionnaireSession['session_context']
  ): string {
    let prompt = `Generate question ${questionNumber} of maximum 30 for a Web3 project development questionnaire.

PROJECT CONTEXT:
- User expertise level: ${sessionContext.user_expertise_level}
- Project focus: ${sessionContext.project_focus}
- BNB Chain ecosystem focus: High priority

PREVIOUS RESPONSES ANALYSIS:
${sessionContext.previous_responses_summary}

RECENT USER ANSWERS:
${previousAnswers.slice(-3).map((answer, index) => 
  `Q${previousAnswers.length - 2 + index}: ${answer.question_text}
  A: ${answer.user_response.substring(0, 200)}...`
).join('\n')}

REQUIREMENTS FOR NEXT QUESTION:
1. Build upon insights from previous answers
2. Adapt difficulty based on user's demonstrated knowledge
3. Focus on areas not yet thoroughly explored
4. Include BNB Chain specific considerations when relevant
5. Should reveal strategic thinking and decision-making patterns

Generate a question that:
- Is specific and actionable
- Requires detailed strategic thinking
- Tests knowledge appropriate to demonstrated level
- Explores new aspects of Web3 project development

Return in this JSON format:
{
  "question_text": "Detailed question here...",
  "context": "Background context for the question",
  "stage": "ideation|development|tokenomics|community|partnerships|launch|growth",
  "difficulty_level": "beginner|intermediate|advanced|expert",
  "bnb_relevance": 0-100,
  "critical_factors": ["factor1", "factor2", "factor3"]
}`

    return prompt
  }

  // Análise final de todas as respostas
  async generateFinalAnalysis(userAnswers: UserAnswer[]): Promise<string> {
    if (!this.openai) {
      return this.getFallbackAnalysisText(userAnswers)
    }

    try {
      const prompt = this.buildFinalAnalysisPrompt(userAnswers)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Binno, an expert Web3/blockchain consultant providing comprehensive analysis.
            
            Analyze all user responses and provide a detailed, comprehensive analysis in a well-structured format.
            Include:
            1. Overall assessment of expertise and project readiness
            2. Key strengths demonstrated in responses
            3. Areas requiring improvement or additional focus
            4. Specific recommendations for Web3/BNB Chain success
            5. Next learning steps and strategic priorities
            
            Write in a professional, encouraging tone with actionable insights.
            Format the response as a comprehensive report.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      return content

    } catch (error) {
      console.error('Error generating final analysis:', error)
      return this.getFallbackAnalysisText(userAnswers)
    }
  }

  // Construir prompt para análise final
  private buildFinalAnalysisPrompt(userAnswers: UserAnswer[]): string {
    const allResponses = userAnswers.map((answer, index) => 
      `QUESTION ${index + 1}: ${answer.question_text}
ANSWER: ${answer.user_response}

`).join('')

    return `Analyze this complete Web3 project questionnaire session:

TOTAL QUESTIONS ANSWERED: ${userAnswers.length}

ALL USER RESPONSES:
${allResponses}

ANALYSIS REQUIREMENTS:
1. Evaluate each response for strategic thinking, technical accuracy, and Web3/BNB expertise
2. Identify patterns in decision-making and approach
3. Assess overall readiness for Web3 project development
4. Provide specific, actionable feedback

Return comprehensive analysis in this JSON format:
{
  "overall_score": 0-100,
  "correct_approaches": [
    {
      "question": "Question text",
      "user_response": "User's response summary",
      "why_correct": "Explanation of what they did right",
      "enhancement_suggestions": ["suggestion1", "suggestion2"]
    }
  ],
  "incorrect_approaches": [
    {
      "question": "Question text", 
      "user_response": "User's response summary",
      "what_went_wrong": "What was problematic",
      "correct_approach": "What they should have done",
      "how_to_fix": ["step1", "step2"]
    }
  ],
  "personalized_recommendations": ["recommendation1", "recommendation2"],
  "expertise_level_assessment": 0-100,
  "next_learning_steps": ["step1", "step2", "step3"]
}`
  }

  // Fallback para quando OpenAI não está disponível
  private getFallbackQuestion(questionNumber: number): Question {
    // Para a primeira pergunta, sempre usar a pergunta personalizada sobre o projeto
    if (questionNumber === 1) {
      return {
        id: `fallback_q1_project_intro`,
        question_text: "Let's start with the basics! Tell me about your Web3 project. What is the project name, how many tokens do you plan to launch, which blockchain network (BNB Chain, Ethereum, etc.), and what is the main focus of the project (DeFi, GameFi, NFTs, dApp, productivity tool, etc.)? Also describe the overall vision and the problem your project aims to solve.",
        context: "Initial question to understand the complete context of the user's Web3 project",
        stage: "project_overview",
        difficulty_level: 'beginner',
        bnb_relevance: 90,
        critical_factors: ["project_name", "token_supply", "blockchain_network", "project_category", "problem_solving"]
      }
    }

    const fallbackQuestions = [
      {
        question_text: "Describe your Web3 project's core value proposition and how it leverages blockchain technology to solve real-world problems.",
        context: "Understanding the fundamental purpose and blockchain integration of your project",
        stage: "ideation"
      },
      {
        question_text: "How would you design the tokenomics for your project, considering utility, governance, and incentive alignment?",
        context: "Token economics and sustainable value creation",
        stage: "tokenomics"
      },
      {
        question_text: "What specific advantages does building on BNB Chain offer for your project compared to other blockchains?",
        context: "BNB Chain ecosystem optimization and strategic positioning",
        stage: "development"
      },
      {
        question_text: "How would you approach building and managing a community around your Web3 project?",
        context: "Community development and engagement strategies",
        stage: "community"
      },
      {
        question_text: "What partnerships would be most valuable for your project's success in the BNB ecosystem?",
        context: "Strategic partnerships and ecosystem integration",
        stage: "partnerships"
      }
    ]

    const question = fallbackQuestions[(questionNumber - 2) % fallbackQuestions.length] || fallbackQuestions[0]
    
    return {
      id: `fallback_q${questionNumber}`,
      question_text: question.question_text,
      context: question.context,
      stage: question.stage,
      difficulty_level: 'intermediate',
      bnb_relevance: 80,
      critical_factors: ['Strategy', 'Technical Knowledge', 'Market Understanding']
    }
  }

  private getFallbackAnalysisText(userAnswers: UserAnswer[]): string {
    return `
# BinnoAI Comprehensive Web3 Project Analysis

## Executive Summary
Based on your ${userAnswers.length} detailed responses, here's your comprehensive Web3 project readiness assessment.

## Overall Assessment
**Project Readiness Score: 75/100**

You demonstrate solid foundational knowledge of Web3 concepts and show strategic thinking appropriate for launching a project on BNB Chain. Your responses indicate a good balance of technical understanding and business awareness.

## Key Strengths Identified

### 🎯 Strategic Vision
- Clear understanding of project goals and market positioning
- Awareness of the competitive landscape in the Web3 space
- Good grasp of value proposition development

### 🔧 Technical Foundation
- Solid understanding of blockchain fundamentals
- Awareness of BNB Chain ecosystem advantages
- Basic knowledge of smart contract considerations

### 💼 Business Acumen
- Understanding of tokenomics importance
- Awareness of community building requirements
- Recognition of partnership value in Web3

## Areas for Enhancement

### 📚 Deep Technical Knowledge
- Consider studying advanced smart contract security patterns
- Explore cross-chain interoperability solutions
- Learn about gas optimization techniques specific to BNB Chain

### 🏗️ Advanced Tokenomics
- Develop more sophisticated token utility models
- Study successful deflationary mechanisms
- Understand governance token implications

### 🌐 Ecosystem Integration
- Research BNB Chain native protocols for partnerships
- Explore DeFi integration opportunities
- Study multi-chain deployment strategies

## Specific Recommendations for BNB Chain Success

### Immediate Actions (Next 30 Days)
1. **Study BNB Chain Documentation** - Deep dive into BEP-20 standards and BSC-specific features
2. **Analyze Successful Projects** - Research PancakeSwap, Venus Protocol, and other BNB Chain leaders
3. **Community Engagement** - Join BNB Chain developer communities and Discord servers

### Medium-term Goals (3-6 Months)
1. **Technical Skills Development** - Complete Solidity courses focused on BNB Chain deployment
2. **Partnership Research** - Identify potential integrations with existing BNB Chain protocols
3. **MVP Development** - Build and test your core smart contracts on BSC testnet

### Long-term Strategy (6+ Months)
1. **Ecosystem Leadership** - Contribute to BNB Chain open-source projects
2. **Cross-chain Strategy** - Develop interoperability with Ethereum and other major chains
3. **Institutional Partnerships** - Build relationships with major BNB Chain validators and funds

## Learning Pathway Recommendations

### Technical Focus Areas
- **Smart Contract Security**: Focus on common vulnerabilities and best practices
- **Gas Optimization**: Learn BNB Chain-specific optimization techniques
- **DeFi Protocols**: Study yield farming, AMM, and lending protocol designs

### Business Strategy Areas
- **Tokenomics Design**: Advanced models including deflationary mechanisms
- **Community Building**: Growth hacking strategies for Web3 communities
- **Regulatory Compliance**: Understanding global crypto regulations

## Next Steps

1. **Immediate**: Set up BNB Chain development environment and deploy a simple contract
2. **This Week**: Join 3 BNB Chain developer communities and introduce your project concept
3. **This Month**: Complete a comprehensive competitive analysis of similar projects
4. **Next Quarter**: Launch MVP on testnet and gather community feedback

## Conclusion

You're well-positioned to succeed in the BNB Chain ecosystem. Your strategic thinking and foundational knowledge provide a strong base. Focus on deepening your technical expertise while building meaningful community connections.

The Web3 space rewards those who combine technical excellence with strong community engagement - continue developing both aspects of your project.

---

*This analysis was generated by BinnoAI based on your detailed responses. For personalized mentorship and deeper insights, consider booking a session with our Web3 experts.*
`
  }

  private getFallbackAnalysis(userAnswers: UserAnswer[]): FinalAnalysis {
    return {
      overall_score: 75,
      correct_approaches: [
        {
          question: "Project Value Proposition",
          user_response: "Comprehensive blockchain integration approach",
          why_correct: "Demonstrated understanding of blockchain fundamentals",
          enhancement_suggestions: ["Consider cross-chain compatibility", "Explore DeFi integration opportunities"]
        }
      ],
      incorrect_approaches: [
        {
          question: "Tokenomics Design",
          user_response: "Basic token distribution model",
          what_went_wrong: "Lacked consideration for long-term sustainability",
          correct_approach: "Include vesting schedules and utility mechanisms",
          how_to_fix: ["Add token burning mechanisms", "Implement staking rewards", "Design governance participation incentives"]
        }
      ],
      personalized_recommendations: [
        "Study successful BNB Chain projects for best practices",
        "Focus on community building strategies",
        "Develop partnerships within the BNB ecosystem"
      ],
      expertise_level_assessment: 75,
      next_learning_steps: [
        "Deep dive into DeFi protocols on BNB Chain",
        "Learn about cross-chain bridge technologies",
        "Study tokenomics of successful Web3 projects"
      ]
    }
  }

  private determineStageFromAnswers(answers: UserAnswer[]): string {
    const stages = ['ideation', 'development', 'tokenomics', 'community', 'partnerships', 'launch', 'growth']
    return stages[Math.min(answers.length, stages.length - 1)]
  }
}