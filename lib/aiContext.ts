// AI Context Management System for Binno AI
interface ConversationContext {
  userId?: string
  sessionId: string
  topics: string[]
  entities: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  complexity: 'beginner' | 'intermediate' | 'advanced'
  lastInteraction: number
}

interface ContextualMemory {
  userPreferences: {
    preferredLanguage: string
    experienceLevel: string
    interests: string[]
    previousQuestions: string[]
  }
  conversationHistory: {
    sessionId: string
    summary: string
    keyTopics: string[]
    timestamp: number
  }[]
}

class AIContextManager {
  private static instance: AIContextManager
  private contextStore: Map<string, ConversationContext> = new Map()
  private memoryStore: Map<string, ContextualMemory> = new Map()

  static getInstance(): AIContextManager {
    if (!AIContextManager.instance) {
      AIContextManager.instance = new AIContextManager()
    }
    return AIContextManager.instance
  }

  // Analyze message content to extract context
  analyzeMessageContext(message: string, sessionId: string): ConversationContext {
    const lowerMessage = message.toLowerCase()
    
    // Extract topics
    const topics = this.extractTopics(lowerMessage)
    
    // Extract entities (contracts, tokens, protocols)
    const entities = this.extractEntities(lowerMessage)
    
    // Determine sentiment
    const sentiment = this.analyzeSentiment(lowerMessage)
    
    // Assess complexity level
    const complexity = this.assessComplexity(lowerMessage)
    
    return {
      sessionId,
      topics,
      entities,
      sentiment,
      complexity,
      lastInteraction: Date.now()
    }
  }

  private extractTopics(message: string): string[] {
    const topicKeywords = {
      'defi': ['defi', 'decentralized finance', 'yield', 'farming', 'liquidity', 'pool'],
      'trading': ['trading', 'buy', 'sell', 'exchange', 'arbitrage', 'price'],
      'security': ['security', 'hack', 'safe', 'audit', 'risk', 'scam'],
      'development': ['solidity', 'smart contract', 'deploy', 'development', 'code'],
      'nft': ['nft', 'non-fungible', 'collectible', 'art', 'marketplace'],
      'blockchain': ['blockchain', 'bitcoin', 'ethereum', 'consensus', 'mining'],
      'web3': ['web3', 'dao', 'governance', 'decentralized', 'metaverse']
    }

    const topics: string[] = []
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        topics.push(topic)
      }
    }
    
    return topics
  }

  private extractEntities(message: string): string[] {
    const entities: string[] = []
    
    // Common DeFi protocols
    const protocols = ['uniswap', 'aave', 'compound', 'maker', 'curve', 'yearn', 'sushiswap', 'pancakeswap']
    protocols.forEach(protocol => {
      if (message.includes(protocol)) entities.push(protocol)
    })
    
    // Token symbols (basic detection)
    const tokenPattern = /\b[A-Z]{2,10}\b/g
    const tokenMatches = message.match(tokenPattern)
    if (tokenMatches) {
      entities.push(...tokenMatches.filter(token => 
        ['BTC', 'ETH', 'USDC', 'USDT', 'BNB', 'ADA', 'SOL'].includes(token)
      ))
    }
    
    return entities
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'amazing', 'perfect']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'problem', 'error', 'fail']
    
    const positiveCount = positiveWords.filter(word => message.includes(word)).length
    const negativeCount = negativeWords.filter(word => message.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private assessComplexity(message: string): 'beginner' | 'intermediate' | 'advanced' {
    const advancedTerms = [
      'flash loan', 'mev', 'impermanent loss', 'slippage', 'arbitrage',
      'smart contract audit', 'gas optimization', 'layer 2', 'rollup'
    ]
    
    const intermediateTerms = [
      'yield farming', 'liquidity pool', 'staking', 'governance', 'dao',
      'smart contract', 'dex', 'cefi vs defi'
    ]
    
    const advancedCount = advancedTerms.filter(term => message.includes(term)).length
    const intermediateCount = intermediateTerms.filter(term => message.includes(term)).length
    
    if (advancedCount > 0) return 'advanced'
    if (intermediateCount > 0) return 'intermediate'
    return 'beginner'
  }

  // Store and retrieve context
  storeContext(sessionId: string, context: ConversationContext): void {
    this.contextStore.set(sessionId, context)
  }

  getContext(sessionId: string): ConversationContext | undefined {
    return this.contextStore.get(sessionId)
  }

  // Generate contextual prompt enhancement
  enhancePrompt(originalMessage: string, sessionId: string): string {
    const context = this.getContext(sessionId)
    if (!context) return originalMessage

    let enhancement = ''

    // Add context based on user's complexity level
    if (context.complexity === 'beginner') {
      enhancement += 'Explain in simple terms for a beginner. '
    } else if (context.complexity === 'advanced') {
      enhancement += 'Provide detailed technical information. '
    }

    // Add context about previous topics
    if (context.topics.length > 0) {
      enhancement += `Consider previous discussion topics: ${context.topics.join(', ')}. `
    }

    return enhancement + originalMessage
  }

  // Update user memory
  updateMemory(userId: string, sessionId: string, message: string, response: string): void {
    if (!this.memoryStore.has(userId)) {
      this.memoryStore.set(userId, {
        userPreferences: {
          preferredLanguage: 'pt-BR',
          experienceLevel: 'beginner',
          interests: [],
          previousQuestions: []
        },
        conversationHistory: []
      })
    }

    const memory = this.memoryStore.get(userId)!
    
    // Update conversation history
    const existingSession = memory.conversationHistory.find(h => h.sessionId === sessionId)
    if (existingSession) {
      existingSession.timestamp = Date.now()
    } else {
      memory.conversationHistory.push({
        sessionId,
        summary: this.generateSummary(message, response),
        keyTopics: this.extractTopics(message.toLowerCase()),
        timestamp: Date.now()
      })
    }

    // Update interests based on topics
    const topics = this.extractTopics(message.toLowerCase())
    topics.forEach(topic => {
      if (!memory.userPreferences.interests.includes(topic)) {
        memory.userPreferences.interests.push(topic)
      }
    })

    // Keep only recent questions (last 10)
    memory.userPreferences.previousQuestions.push(message)
    if (memory.userPreferences.previousQuestions.length > 10) {
      memory.userPreferences.previousQuestions = memory.userPreferences.previousQuestions.slice(-10)
    }

    this.memoryStore.set(userId, memory)
  }

  private generateSummary(message: string, response: string): string {
    // Simple summary generation (could be enhanced with AI)
    const topics = this.extractTopics(message.toLowerCase())
    if (topics.length > 0) {
      return `Discussed ${topics.join(' and ')} concepts`
    }
    return 'General blockchain/crypto discussion'
  }

  // Get user preferences for personalization
  getUserPreferences(userId: string): ContextualMemory['userPreferences'] | null {
    const memory = this.memoryStore.get(userId)
    return memory?.userPreferences || null
  }

  // Clean old context (for memory management)
  cleanOldContext(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    this.contextStore.forEach((context, sessionId) => {
      if (now - context.lastInteraction > maxAge) {
        this.contextStore.delete(sessionId)
      }
    })
  }
}

export default AIContextManager
export type { ConversationContext, ContextualMemory }