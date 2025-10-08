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
  id: string
  user_id: string
  answers: UserAnswer[]
  current_question_number: number
  session_context: {
    user_expertise_level: string
    project_focus: string
    previous_responses_summary: string
  }
  created_at: string
  updated_at: string
}

export interface SkillAssessmentReport {
  id: string
  session_id: string
  user_id: string
  total_questions: number
  answers: UserAnswer[]
  skill_analysis: {
    technical_proficiency: number
    business_acumen: number
    blockchain_knowledge: number
    project_readiness: number
    bnb_chain_alignment: number
    overall_score: number
  }
  recommendations: string[]
  strengths: string[]
  improvement_areas: string[]
  next_steps: string[]
  ai_analysis_narrative: string
  generated_at: string
}

export class BinnoAI {
  private openai: OpenAI

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (!key) {
      throw new Error('OpenAI API key is required for AI functionality')
    }
    this.openai = new OpenAI({ apiKey: key })
  }

  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: UserAnswer[],
    sessionContext: QuestionnaireSession['session_context']
  ): Promise<Question> {
    console.log('BinnoAI.generateNextQuestion called with:', { questionNumber, previousAnswersCount: previousAnswers.length })
    
    // AI é obrigatório - sem fallbacks
    if (!this.openai) {
      console.log('OpenAI instance not available')
      throw new Error('AI integration is mandatory for Skill Compass. OpenAI API key not configured.')
    }

    try {
      // Para a primeira pergunta, sempre perguntar sobre o projeto (em inglês)
      if (questionNumber === 1) {
        console.log('Returning first question')
        return {
          id: `q1_project_intro_${Date.now()}`,
          question_text: "Tell me about your Web3 project. What is the project name, how many tokens do you plan to launch, on which blockchain network (BNB Chain, Ethereum, etc.), and what is the main focus of the project (DeFi, GameFi, NFTs, dApp, productivity tool, etc.)? Also describe the overall vision and the problem your project aims to solve.",
          context: "Initial question to understand the complete context of the user's Web3 project",
          stage: "project_overview",
          difficulty_level: 'beginner',
          bnb_relevance: 90,
          critical_factors: ["project_name", "token_supply", "blockchain_network", "project_category", "problem_solving"]
        }
      }

      console.log('Generating AI question for question number:', questionNumber)
      const prompt = this.buildQuestionGenerationPrompt(questionNumber, previousAnswers, sessionContext)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert Web3/blockchain advisor for the Skill Compass system. Generate intelligent, adaptive questions for a Web3 project development assessment.
            
            CRITICAL REQUIREMENTS:
            - Generate questions IN ENGLISH ONLY
            - Build upon previous user responses to create personalized questions
            - Extract key information from the first answer about the project
            - Focus on BNB Chain ecosystem when relevant
            - Adapt difficulty based on user's demonstrated knowledge level
            - Cover different aspects: technical implementation, business strategy, tokenomics, community building, partnerships, security, regulatory compliance
            - Questions should reveal decision-making patterns and strategic thinking
            - Total questionnaire is 15 questions - make each one valuable
            - NEVER repeat questions or ask about information already provided
            
            Return a JSON object with this exact structure:
            {
              "id": "unique_question_id",
              "question_text": "Your adaptive question here",
              "context": "Why this question is important",
              "stage": "current_assessment_stage",
              "difficulty_level": "beginner|intermediate|advanced|expert",
              "bnb_relevance": 85,
              "critical_factors": ["factor1", "factor2", "factor3"]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      console.log('OpenAI response received')
      const aiResponse = response.choices[0]?.message?.content
      if (!aiResponse) {
        console.log('No content in OpenAI response')
        throw new Error('No response from AI')
      }

      console.log('Parsing AI response:', aiResponse.substring(0, 100) + '...')
      
      let questionData: any
      try {
        questionData = JSON.parse(aiResponse)
      } catch (parseError) {
        console.log('JSON parse error:', parseError)
        console.log('Raw AI response:', aiResponse)
        throw new Error(`Failed to parse AI response: ${parseError}`)
      }

      const finalQuestion = {
        id: questionData.id || `q${questionNumber}_ai_${Date.now()}`,
        question_text: questionData.question_text,
        context: questionData.context || '',
        stage: questionData.stage || this.determineStageFromAnswers(previousAnswers),
        difficulty_level: questionData.difficulty_level || 'intermediate',
        bnb_relevance: questionData.bnb_relevance || 70,
        critical_factors: questionData.critical_factors || []
      }
      
      console.log('AI question successfully generated:', finalQuestion.question_text.substring(0, 50) + '...')
      return finalQuestion

    } catch (error) {
      console.error('AI question generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to generate AI question: ${errorMessage}. AI generation is mandatory for this questionnaire.`)
    }
  }

  // Construir prompt para geração de perguntas
  private buildQuestionGenerationPrompt(
    questionNumber: number,
    previousAnswers: UserAnswer[],
    sessionContext: QuestionnaireSession['session_context']
  ): string {
    let prompt = `Generate question ${questionNumber} of 15 total for a comprehensive Web3 project assessment (Skill Compass).

PROJECT CONTEXT ANALYSIS:
- User expertise level: ${sessionContext.user_expertise_level}
- Project focus: ${sessionContext.project_focus}
- Previous responses summary: ${sessionContext.previous_responses_summary}

USER'S PROJECT INFORMATION (from question 1):
${previousAnswers.length > 0 ? previousAnswers[0].user_response : 'Not yet provided'}

RECENT CONVERSATION FLOW:
${previousAnswers.slice(-2).map((answer, index) => 
  `Question ${previousAnswers.length - 1 + index}: ${answer.question_text}
  User Response: ${answer.user_response.substring(0, 300)}${answer.user_response.length > 300 ? '...' : ''}`
).join('\n\n')}

ASSESSMENT REQUIREMENTS FOR QUESTION ${questionNumber}:
1. Generate question IN ENGLISH ONLY
2. Build directly upon the user's specific project details from question 1
3. Reference or acknowledge information from previous answers
4. Adapt complexity based on user's demonstrated expertise
5. Focus on unexplored aspects of their Web3 project
6. Include BNB Chain considerations when relevant to their project type
7. Should assess strategic thinking, technical understanding, or business acumen
8. NEVER ask for information already provided by the user

QUESTION PROGRESSION GUIDELINES:
- Questions 2-4: Technical foundation and architecture
- Questions 5-7: Business model and tokenomics
- Questions 8-10: Market strategy and community
- Questions 11-13: Risk management and partnerships
- Questions 14-15: Future planning and sustainability

Generate a question that reveals new insights about the user's Web3 project capabilities and thinking process.`

    return prompt
  }

  // Determinar estágio com base nas respostas anteriores
  private determineStageFromAnswers(previousAnswers: UserAnswer[]): string {
    const answerCount = previousAnswers.length

    if (answerCount <= 2) return 'project_overview'
    if (answerCount <= 5) return 'technical_assessment'
    if (answerCount <= 8) return 'business_strategy'
    if (answerCount <= 11) return 'market_readiness'
    if (answerCount <= 13) return 'risk_management'
    return 'future_planning'
  }

  // Gerar análise final baseada em todas as respostas
  async generateFinalAnalysis(
    sessionId: string,
    userAnswers: UserAnswer[]
  ): Promise<SkillAssessmentReport> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const analysisPrompt = this.buildAnalysisPrompt(userAnswers)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert Web3/blockchain consultant analyzing a comprehensive project assessment. Generate a detailed skill analysis report.

            ANALYSIS REQUIREMENTS:
            - Provide specific, actionable insights
            - Rate skills on 0-100 scale based on demonstrated knowledge
            - Focus on BNB Chain ecosystem alignment
            - Give concrete next steps and recommendations
            - Highlight both strengths and improvement areas
            
            Return a JSON object with this structure:
            {
              "skill_analysis": {
                "technical_proficiency": 85,
                "business_acumen": 70,
                "blockchain_knowledge": 90,
                "project_readiness": 75,
                "bnb_chain_alignment": 80,
                "overall_score": 80
              },
              "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
              "strengths": ["Demonstrated strength 1", "Demonstrated strength 2"],
              "improvement_areas": ["Area to improve 1", "Area to improve 2"],
              "next_steps": ["Actionable step 1", "Actionable step 2"],
              "ai_analysis_narrative": "Comprehensive analysis in paragraph form"
            }`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const aiResponse = response.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('No analysis response from AI')
      }

      const analysisData = JSON.parse(aiResponse)

      return {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session_id: sessionId,
        user_id: 'current_user',
        total_questions: userAnswers.length,
        answers: userAnswers,
        skill_analysis: analysisData.skill_analysis,
        recommendations: analysisData.recommendations,
        strengths: analysisData.strengths,
        improvement_areas: analysisData.improvement_areas,
        next_steps: analysisData.next_steps,
        ai_analysis_narrative: analysisData.ai_analysis_narrative,
        generated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Final analysis generation failed:', error)
      throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Construir prompt para análise final
  private buildAnalysisPrompt(userAnswers: UserAnswer[]): string {
    const questionsAndAnswers = userAnswers.map((answer, index) => 
      `Question ${index + 1}: ${answer.question_text}
      User Response: ${answer.user_response}
      `
    ).join('\n\n')

    return `Analyze this comprehensive Web3 project assessment. The user completed a 15-question Skill Compass questionnaire.

COMPLETE QUESTIONNAIRE RESPONSES:
${questionsAndAnswers}

ANALYSIS FOCUS AREAS:
1. Technical Proficiency: Smart contract development, blockchain architecture, security awareness
2. Business Acumen: Market understanding, competitive analysis, revenue models
3. Blockchain Knowledge: Web3 concepts, DeFi understanding, ecosystem awareness
4. Project Readiness: Planning depth, execution capability, resource awareness
5. BNB Chain Alignment: Understanding of BNB Chain features, ecosystem integration potential

Provide detailed analysis with specific evidence from their responses. Rate each area 0-100 based on demonstrated knowledge and thinking depth.`
  }

  // Generate professional analysis report
  async generateProfessionalAnalysis(
    sessionId: string,
    userAnswers: UserAnswer[],
    sessionContext?: any
  ): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const professionalPrompt = this.buildProfessionalAnalysisPrompt(userAnswers, sessionContext)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a senior Web3 consultant creating a professional project analysis report. Generate a comprehensive, structured analysis in English that could be presented to investors, stakeholders, or development teams.

            REPORT STRUCTURE REQUIREMENTS:
            1. Executive Summary: High-level assessment and overall recommendation
            2. Strengths: Specific positive aspects identified from responses 
            3. Improvement Areas: Areas needing development with specific context
            4. Recommendations: Actionable advice based on project specifics
            5. Action Plan: Step-by-step next steps for implementation
            6. Risk Assessment: Potential challenges and mitigation strategies
            7. Next Steps: Concrete actions for immediate implementation

            ANALYSIS STANDARDS:
            - Professional language suitable for business contexts
            - Specific examples from user responses
            - Actionable insights based on Web3 industry best practices
            - BNB Chain ecosystem considerations when relevant
            - Evidence-based recommendations

            Return a JSON object with the exact structure specified in the prompt.`
          },
          {
            role: 'user',
            content: professionalPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const aiResponse = response.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('No professional analysis response from AI')
      }

      const analysisData = JSON.parse(aiResponse)
      return analysisData

    } catch (error) {
      console.error('Professional analysis generation failed:', error)
      throw new Error(`Failed to generate professional analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Build prompt for professional analysis
  private buildProfessionalAnalysisPrompt(userAnswers: UserAnswer[], sessionContext?: any): string {
    const questionsAndAnswers = userAnswers.map((answer, index) => 
      `Q${index + 1}: ${answer.question_text}
      Response: ${answer.user_response}
      `
    ).join('\n\n')

    return `Generate a professional Web3 project analysis report based on this comprehensive questionnaire.

PROJECT ASSESSMENT DATA:
${questionsAndAnswers}

CONTEXT INFORMATION:
${sessionContext ? `
- User Experience Level: ${sessionContext.experience_level || 'Not specified'}
- Project Focus: ${sessionContext.goal || 'Not specified'}
- Interests: ${sessionContext.interests?.join(', ') || 'Not specified'}
` : 'No additional context provided'}

REQUIRED REPORT STRUCTURE (return as JSON):
{
  "executive_summary": "2-3 sentence high-level assessment and recommendation",
  "strengths": ["strength 1 with specific evidence", "strength 2 with context", "strength 3 with details"],
  "improvement_areas": ["area 1 with specific gaps identified", "area 2 with context", "area 3 with details"],
  "recommendations": ["actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "action_plan": ["step 1 for immediate action", "step 2 for short term", "step 3 for medium term"],
  "risk_assessment": "paragraph identifying key risks and mitigation strategies",
  "next_steps": ["immediate next action", "follow-up action", "long-term action"]
}

Base all analysis on specific evidence from the user's responses. Provide actionable, professional-grade insights suitable for business stakeholders.`
  }
}