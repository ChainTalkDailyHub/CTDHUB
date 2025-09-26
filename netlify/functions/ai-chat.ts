import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Advanced knowledge base for blockchain and DeFi topics
const knowledgeBase = {
  ctd: {
    keywords: ['ctd', 'chain talk daily', 'ctdhub', 'ctd token', 'ctd project', 'ctd platform'],
    responses: [
      "🚀 **CTD (Chain Talk Daily)** is an innovative blockchain education platform that revolutionizes how people learn about Web3, DeFi, and cryptocurrency through interactive quizzes and AI-powered assistance.",
      "💰 **CTD Token System**: Users earn 10,000 CTD tokens upon completing all quiz modules (one-time reward per wallet). CTD tokens are BEP-20 tokens on Binance Smart Chain with real utility in the ecosystem.",
      "🎓 **CTD Platform Features**: Comprehensive quiz system with 10 modules covering blockchain fundamentals, smart contracts, DeFi protocols, trading strategies, security best practices, and advanced techniques. Each module contains 10 detailed questions with explanations.",
      "🤖 **Binno AI Integration**: CTD Hub features Binno AI, an advanced AI assistant specialized in blockchain education, contract analysis, and personalized learning paths for users of all experience levels."
    ]
  },
  binno: {
    keywords: ['binno', 'binno ai', 'ai agent', 'ai assistant', 'intelligent agent'],
    responses: [
      "🤖 **Binno AI** is the flagship AI agent and main character of the CTD (Chain Talk Daily) platform. I'm designed to be your personal blockchain education companion and Web3 guide!",
      "✨ **Binno's Capabilities**: I provide expert explanations on blockchain technology, analyze smart contracts and transactions on BSC, offer personalized learning recommendations, and guide users through complex DeFi concepts with engaging, easy-to-understand responses.",
      "🎯 **Binno's Mission**: As CTD's AI mascot, I help democratize blockchain education by making complex Web3 concepts accessible to everyone, from complete beginners to advanced developers. I'm here to ensure every user has a successful learning journey!",
      "🔧 **Binno's Special Powers**: Real-time contract analysis, transaction investigation, token research, risk assessment, and the ability to adapt explanations based on your experience level. I'm powered by advanced AI and constantly learning to serve you better!"
    ]
  },
  blockchain: {
    keywords: ['blockchain', 'distributed ledger', 'consensus', 'mining', 'proof of work', 'proof of stake'],
    responses: [
      "⛓️ **Blockchain Technology**: A revolutionary distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, timestamp, and transaction data.",
      "🔒 **Consensus Mechanisms**: Blockchain networks use consensus algorithms like Proof of Work (PoW) and Proof of Stake (PoS) to validate transactions and maintain network integrity without requiring a central authority.",
      "🌐 **Decentralization Benefits**: Eliminates single points of failure, reduces censorship, increases transparency, and enables trustless peer-to-peer transactions without intermediaries."
    ]
  }
}

const generateContextualResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  // Check for specific knowledge base matches
  for (const [category, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(keyword => message.includes(keyword))) {
      const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)]
      return randomResponse
    }
  }
  
  // Default helpful response
  return "🤖 **Binno AI aqui!** Estou aqui para ajudar com suas dúvidas sobre blockchain, CTD, DeFi e Web3. Pode perguntar sobre:\n\n" +
         "• 🎓 **Educação Blockchain** - Conceitos fundamentais e avançados\n" +
         "• 💰 **CTD Token & Platform** - Como funciona nosso ecossistema\n" +
         "• 🔧 **Smart Contracts** - Análise e explicações técnicas\n" +
         "• 📊 **DeFi Protocols** - Estratégias e análises de risco\n\n" +
         "O que gostaria de aprender hoje? 🚀"
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('Netlify Function - AI Chat called')
  console.log('Event:', JSON.stringify(event, null, 2))
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' })
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      })
    }
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing request body',
          message: 'Request body is required'
        })
      }
    }

    const { messages } = JSON.parse(event.body) as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid messages format',
          message: 'Messages must be a non-empty array'
        })
      }
    }

    const lastMessage = messages[messages.length - 1]
    
    if (!lastMessage || !lastMessage.content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid message content',
          message: 'Last message must have content'
        })
      }
    }

    console.log('Processing message:', lastMessage.content)

    // Generate response based on content
    const aiResponse = generateContextualResponse(lastMessage.content)

    console.log('Generated response:', aiResponse)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: aiResponse,
        timestamp: new Date().toISOString(),
        status: 'success',
        model: 'binno-ai-v1',
        usage: {
          prompt_tokens: lastMessage.content.length,
          completion_tokens: aiResponse.length,
          total_tokens: lastMessage.content.length + aiResponse.length
        }
      })
    }

  } catch (error) {
    console.error('Netlify Function Error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process AI chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}