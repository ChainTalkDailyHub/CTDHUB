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
  
  constructor(apiKey?: string) {
    // Use provided API key or environment variable
    const key = apiKey || process.env.OPENAI_API_KEY
    if (key) {
      this.openai = new OpenAI({
        apiKey: key,
      })
    }
  }

  // Gerar próxima pergunta baseada nas respostas anteriores
  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: UserAnswer[],
    sessionContext: QuestionnaireSession['session_context']
  ): Promise<Question> {
    console.log('BinnoAI.generateNextQuestion called with:', { questionNumber, previousAnswersCount: previousAnswers.length })
    
    // AI is mandatory - no fallbacks allowed
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

      console.log('Building prompt for question', questionNumber)
      const prompt = this.buildQuestionGenerationPrompt(questionNumber, previousAnswers, sessionContext)
      console.log('Prompt built, calling OpenAI...')
      
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
              "question_text": "The actual question in English",
              "context": "Why this question is relevant based on previous answers",
              "stage": "current_assessment_stage",
              "difficulty_level": "beginner|intermediate|advanced|expert",
              "bnb_relevance": number_0_to_100,
              "critical_factors": ["key", "assessment", "areas"]
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
        id: questionData.id || `q${questionNumber}_${Date.now()}`,
        question_text: questionData.question_text,
        context: questionData.context || '',
        stage: questionData.stage || this.determineStageFromAnswers(previousAnswers),
        difficulty_level: questionData.difficulty_level || 'intermediate',
        bnb_relevance: questionData.bnb_relevance || 70,
        critical_factors: questionData.critical_factors || []
      }
      
      console.log('Question successfully generated:', finalQuestion.question_text.substring(0, 50) + '...')
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
9. Make the question specific to their project context

QUESTION FOCUS AREAS TO EXPLORE:
- Technical implementation strategy
- Tokenomics and economic model
- Community building and engagement
- Partnership and collaboration strategy
- Security and risk management
- Regulatory compliance approach
- Go-to-market strategy
- Scalability planning
- User experience design
- Competitive analysis

Generate a personalized question that feels like a natural continuation of the conversation and demonstrates that you've understood their project.`

    return prompt
  }

  async generateFinalAnalysis(userAnswers: UserAnswer[]): Promise<string> {
    // AI is mandatory for analysis too
    if (!this.openai) {
      throw new Error('AI integration is mandatory for Skill Compass analysis. OpenAI API key not configured.')
    }

    try {
      const prompt = this.buildFinalAnalysisPrompt(userAnswers)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert Web3/blockchain consultant providing comprehensive project assessments. Generate a detailed analysis report in English based on the user's questionnaire responses.

            ANALYSIS REQUIREMENTS:
            - Provide analysis IN ENGLISH ONLY
            - Create a comprehensive assessment of their Web3 project readiness
            - Identify strengths and areas for improvement
            - Provide specific, actionable recommendations
            - Include a numerical score out of 100
            - Reference specific details from their answers
            - Focus on BNB Chain ecosystem opportunities when relevant
            - Structure the report professionally with clear sections
            
            Return a detailed markdown-formatted report.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No analysis response from AI')
      }

      return content

    } catch (error) {
      console.error('AI analysis generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to generate AI analysis: ${errorMessage}. AI analysis is mandatory for this questionnaire.`)
    }
  }

  private buildFinalAnalysisPrompt(userAnswers: UserAnswer[]): string {
    const totalQuestions = userAnswers.length
    const projectDetails = userAnswers[0]?.user_response || 'Not provided'
    
    let prompt = `Generate a comprehensive Web3 project readiness analysis based on ${totalQuestions} detailed questionnaire responses.

PROJECT OVERVIEW (from Question 1):
${projectDetails}

COMPLETE USER RESPONSES:
${userAnswers.map((answer, index) => 
  `Question ${index + 1}: ${answer.question_text}
  User Response: ${answer.user_response}
  
`).join('')}

ANALYSIS REQUIREMENTS:
1. Provide overall project readiness score (0-100)
2. Identify specific strengths demonstrated in responses
3. Highlight areas needing improvement or further development
4. Provide actionable recommendations for next steps
5. Assess technical knowledge level demonstrated
6. Evaluate business strategy understanding
7. Comment on BNB Chain ecosystem fit and opportunities
8. Reference specific details from their answers to show personalization
9. Suggest specific resources or learning paths

Structure the analysis as a professional consulting report with:
- Executive Summary
- Overall Score Assessment
- Key Strengths
- Areas for Improvement
- Specific Recommendations
- Next Steps
- BNB Chain Opportunities

Make it comprehensive but accessible, showing deep understanding of their specific project and responses.`

    return prompt
  }

  private determineStageFromAnswers(answers: UserAnswer[]): string {
    if (answers.length <= 3) return 'project_overview'
    if (answers.length <= 6) return 'technical_planning'
    if (answers.length <= 9) return 'business_strategy'
    if (answers.length <= 12) return 'execution_planning'
    return 'advanced_strategy'
  }
}