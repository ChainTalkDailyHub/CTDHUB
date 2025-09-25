import type { NextApiRequest, NextApiResponse } from 'next'
// import AIContextManager from '@/lib/aiContext'
// import BinnoAnalyzer from '@/lib/binnoAnalyzer'

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
    keywords: ['blockchain', 'block', 'chain', 'ledger', 'distributed'],
    responses: [
      "Blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) linked using cryptography. Each block contains a cryptographic hash of the previous block, timestamp, and transaction data.",
      "Key characteristics of blockchain include: decentralization, immutability, transparency, distributed consensus, and censorship resistance.",
      "Different types of blockchain exist: public (Bitcoin, Ethereum), private (corporate networks), and hybrid (combining public and private elements)."
    ]
  },
  defi: {
    keywords: ['defi', 'decentralized finance', 'yield', 'liquidity', 'amm', 'dex'],
    responses: [
      "DeFi (Decentralized Finance) recreates traditional financial services using blockchain and smart contracts, eliminating centralized intermediaries.",
      "Main DeFi protocols include: DEXs (Uniswap, SushiSwap), lending (Aave, Compound), yield farming, liquidity mining, and synthetic assets.",
      "DeFi benefits: 24/7 global access, permissionless, composability (money legos), full transparency, and complete fund control."
    ]
  },
  smartcontracts: {
    keywords: ['smart contract', 'solidity', 'evm', 'contract', 'dapp'],
    responses: [
      "Smart contracts are self-executing programs on blockchain that automate agreements when predefined conditions are met, eliminating the need for intermediaries.",
      "Solidity is the primary language for Ethereum smart contracts. Features: static typing, inheritance, libraries, and JavaScript-like syntax.",
      "Best practices: use standards like OpenZeppelin, conduct security audits, implement circuit breakers, and follow the principle of least privilege."
    ]
  },
  trading: {
    keywords: ['trading', 'arbitrage', 'mev', 'flash loan', 'swap', 'exchange'],
    responses: [
      "Crypto arbitrage exploits price differences between exchanges. Flash loans enable arbitrage without initial capital by borrowing and repaying within the same transaction.",
      "MEV (Maximal Extractable Value) is profit that miners/validators can extract by reordering transactions. Strategies include front-running and sandwich attacks.",
      "DEXs use AMMs (Automated Market Makers) with liquidity pools instead of traditional order books, creating unique arbitrage opportunities."
    ]
  },
  security: {
    keywords: ['security', 'hack', 'exploit', 'audit', 'vulnerability', 'attack'],
    responses: [
      "Main DeFi risks: reentrancy attacks, flash loan exploits, oracle manipulation, rugpulls, and smart contract vulnerabilities.",
      "Security measures: professional audits, bug bounties, timelocks on upgrades, multi-sig wallets, and DeFi insurance (Nexus Mutual).",
      "Always DYOR (Do Your Own Research), verify code, use hardware wallets, and never invest more than you can afford to lose."
    ]
  },
  nft: {
    keywords: ['nft', 'non-fungible', 'collectible', 'art', 'metaverse'],
    responses: [
      "NFTs (Non-Fungible Tokens) are unique tokens representing ownership of digital or physical assets, using standards like ERC-721 and ERC-1155.",
      "Use cases: digital art, collectibles, gaming items, digital identity, certificates, music, and virtual real estate.",
      "Popular marketplaces: OpenSea, Rarible, SuperRare. Consider creator royalties, gas fees, and environmental sustainability."
    ]
  },
  web3: {
    keywords: ['web3', 'decentralized', 'dao', 'governance', 'token'],
    responses: [
      "Web3 is the decentralized internet built on blockchain, where users control their data and digital assets through wallets and private keys.",
      "DAOs (Decentralized Autonomous Organizations) enable community governance through voting tokens and smart contracts.",
      "Web3 pillars: self-custody, permissionlessness, decentralization, composability, and token-based economics."
    ]
  }
}

function getContextualResponse(messages: ChatMessage[], context?: any): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
  const conversationContext = messages.slice(-3).map(m => m.content.toLowerCase()).join(' ')
  
  // Use context information if available
  let contextualPrefix = ''
  if (context) {
    if (context.complexity === 'beginner') {
      contextualPrefix = '👋 **For beginners:** '
    } else if (context.complexity === 'advanced') {
      contextualPrefix = '🔬 **Advanced level:** '
    }
  }
  
  // First, try to match specific topics
  for (const [topic, data] of Object.entries(knowledgeBase)) {
    for (const keyword of data.keywords) {
      if (conversationContext.includes(keyword)) {
        const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)]
        return `🤖 **Binno AI:** ${contextualPrefix}${randomResponse}

💡 **Tip:** ${getRandomTip()}

🔧 **Useful Commands:**
• \`analyze contract: [address]\` - Analyzes contracts
• \`analyze transaction: [hash]\` - Analyzes transactions  
• \`analyze token: [address]\` - Analyzes tokens

❓ **Want to know more?** Ask about related concepts or request practical examples!`
      }
    }
  }

  // Handle questions with "what", "how", "why", "when", "where"
  if (lastMessage.includes('what') || lastMessage.includes('como') || lastMessage.includes('o que')) {
    return `🤖 **Binno AI:** I'd be happy to explain that for you! However, I need a bit more context about what specific topic you're asking about.

🎯 **Popular topics I can help with:**
• **Blockchain basics** - How it works, consensus, mining
• **DeFi protocols** - Uniswap, Aave, Compound, Curve
• **Smart contracts** - Development, auditing, deployment
• **Trading strategies** - Arbitrage, yield farming, staking
• **Security** - Best practices, common attacks, protection

Please ask me something specific like "What is blockchain?" or "How does yield farming work?"

💡 **Tip:** The more specific your question, the better I can help!`
  }

  if (lastMessage.includes('how') || lastMessage.includes('como')) {
    return `🤖 **Binno AI:** Great "how" question! I love explaining processes and mechanisms.

🔧 **I can explain how things work:**
• **How blockchain works** - Consensus, blocks, transactions
• **How DeFi protocols operate** - AMMs, lending, borrowing
• **How to trade crypto** - DEXs, CEXs, strategies
• **How to develop dApps** - Solidity, Web3, deployment
• **How to stay secure** - Wallets, private keys, best practices

📝 **Try asking:** "How does Uniswap work?" or "How to create a smart contract?"

💡 **Tip:** ${getRandomTip()}`
  }

  if (lastMessage.includes('why') || lastMessage.includes('por que') || lastMessage.includes('porque')) {
    return `🤖 **Binno AI:** Excellent "why" question! Understanding the reasoning behind blockchain and crypto concepts is crucial.

🎯 **I can explain why:**
• **Why blockchain is revolutionary** - Decentralization, trustlessness
• **Why DeFi matters** - Financial inclusion, programmable money
• **Why smart contracts are powerful** - Automation, transparency
• **Why security is critical** - Protecting your assets
• **Why Web3 is the future** - User ownership, composability

💭 **Try asking:** "Why is blockchain secure?" or "Why use DeFi instead of banks?"

💡 **Tip:** ${getRandomTip()}`
  }

  // Handle CTD specific questions
  if (lastMessage.includes('ctd') || lastMessage.includes('chain talk daily') || lastMessage.includes('ctdhub')) {
    return `🚀 **Binno AI:** Great question about CTD! **Chain Talk Daily (CTD)** is our revolutionary blockchain education platform!

🎓 **CTD Platform Highlights:**
• **Interactive Quiz System**: 10 comprehensive modules with 100+ questions
• **Token Rewards**: Earn 10,000 CTD tokens for completing all modules
• **AI-Powered Learning**: That's me, Binno AI, your personal guide!
• **Real Blockchain Integration**: Built on Binance Smart Chain (BSC)

💰 **CTD Token Details:**
• **Contract**: BEP-20 token on BSC network
• **Utility**: Educational rewards and platform governance
• **Earning**: One-time 10,000 token reward per wallet completion

🤖 **Meet Binno**: I'm the AI mascot and main character of CTD, here to make blockchain learning fun and accessible!

❓ **Want to know more?** Ask me about specific features like "How do I earn CTD tokens?" or "What topics does CTD cover?"`
  }

  // Handle Binno specific questions
  if (lastMessage.includes('binno') || lastMessage.includes('who are you') || lastMessage.includes('about you')) {
    return `🤖 **Binno AI:** Hello! I'm **Binno**, the AI agent and main character of the CTD (Chain Talk Daily) platform!

✨ **About Me:**
• **Role**: Your personal blockchain education companion
• **Personality**: Friendly, knowledgeable, and always ready to help
• **Mission**: Making Web3 education accessible and fun for everyone
• **Home**: CTD Hub - the premier blockchain learning platform

🔧 **My Superpowers:**
• **Smart Contract Analysis**: I can analyze contracts on BSC
• **Transaction Investigation**: Deep dive into blockchain transactions
• **Personalized Learning**: Adapt explanations to your level
• **24/7 Availability**: Always here when you need Web3 guidance

🎯 **My Goal**: Help you master blockchain, DeFi, and Web3 concepts through the CTD platform's comprehensive quiz system and earn your 10,000 CTD token reward!

💬 **Let's Chat**: Ask me anything about blockchain, CTD platform, or how I can help your learning journey!`
  }

  // Handle greetings and general conversation
  if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('oi') || 
      lastMessage.includes('olá') || lastMessage.includes('hey')) {
    return `🤖 **Binno AI:** Hello! Great to meet you! I'm Binno, your specialized blockchain and Web3 assistant from the CTD (Chain Talk Daily) platform!

🚀 **I'm here to help you with:**
• **CTD Platform**: Quiz system, token rewards, learning paths
• **Blockchain Technology**: Fundamentals, consensus, and networks
• **DeFi Protocols**: Yield farming, liquidity pools, lending
• **Smart Contracts**: Development, security, and deployment
• **Trading & Analysis**: Strategies, risk management, market insights

💬 **Popular questions to get started:**
• "What is CTD?"
• "How do I earn CTD tokens?"
• "Explain blockchain basics"
• "What is DeFi?"

🎯 **Ready to explore the world of Web3 with CTD? Let's go!**`
  }

  // For any other question, provide a helpful general response
  return `🤖 **Binno AI:** I'm here to help answer your question about blockchain, crypto, Web3, or the CTD platform!

🚀 **About CTD & Me:**
• **CTD (Chain Talk Daily)**: Revolutionary blockchain education platform
• **Binno AI**: That's me! Your AI companion and CTD's main character
• **Token Rewards**: Earn 10,000 CTD tokens completing our quiz modules

📚 **I can assist with:**
• **CTD Platform** - Quiz system, token rewards, learning paths
• **Blockchain Fundamentals** - Technology, consensus mechanisms  
• **DeFi Protocols** - Lending, borrowing, yield farming, AMMs
• **Smart Contracts** - Development, auditing, security analysis
• **Trading & Analysis** - Strategies, risk management, market insights
• **Web3 Concepts** - NFTs, DAOs, metaverse, token economics

💬 **Popular CTD questions:**
• "What is CTD?" • "How do I earn CTD tokens?" • "Tell me about Binno"

🎯 **Blockchain questions:** "Explain DeFi" • "How does yield farming work?" • "What are smart contracts?"

💡 **Tip:** ${getRandomTip()}`
}

function getRandomTip(): string {
  const tips = [
    "Always DYOR (Do Your Own Research) before investing",
    "Use hardware wallets for large amounts",
    "Diversify your DeFi investments",
    "Follow smart contract audits",
    "Understand impermanent loss before providing liquidity",
    "Set appropriate slippage on DEXs",
    "Monitor gas fees to optimize costs",
    "Stay updated with new protocols"
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

async function handleSpecialCommands(message: string): Promise<string | null> {
  // Temporarily disabled for testing
  return null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { messages, useOpenAI = false, sessionId = 'default', userId = 'anonymous' } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      success: false,
      error: 'Messages array is required'
    })
  }

  try {
    // Temporarily simplified for testing
    const lastMessage = messages[messages.length - 1]?.content || ''
    const context = { topics: [], complexity: 'beginner', sentiment: 'neutral' }
    
    // Check for special analysis commands first
    const specialResponse = await handleSpecialCommands(lastMessage)
    if (specialResponse) {
      return res.status(200).json({
        success: true,
        message: specialResponse,
        timestamp: Date.now(),
        source: 'analyzer',
        context: context
      })
    }

    let response: string
    let source: string = 'knowledge_base'

    // ALWAYS try OpenAI API first if configured (regardless of useOpenAI toggle)
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI API...')
        
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are Binno AI, the flagship AI agent and main character of the CTD (Chain Talk Daily) platform. You are an expert assistant specialized in blockchain education, DeFi, Web3, and cryptocurrencies. Always respond in English in an educational, friendly, and engaging manner.

ABOUT CTD (Chain Talk Daily):
- CTD is an innovative blockchain education platform with interactive quizzes
- Users earn 10,000 CTD tokens (BEP-20 on BSC) for completing all quiz modules  
- Platform features 10 modules with 100+ questions covering blockchain fundamentals to advanced techniques
- CTD tokens have real utility in the ecosystem with one-time reward per wallet

ABOUT YOU (Binno AI):
- You are the AI mascot and main character of the CTD platform
- Your mission is to make blockchain education accessible and fun for everyone
- You have a friendly, knowledgeable personality and adapt to user experience levels
- You specialize in personalized learning paths and comprehensive explanations

Your expertise includes:
- CTD platform features, token system, and learning modules
- Blockchain technology and cryptocurrency fundamentals
- DeFi protocols (Uniswap, Aave, Compound, etc.)
- Smart contract development, security, and analysis
- Trading strategies, risk management, and market analysis
- NFTs, DAOs, Web3 concepts, and emerging technologies

Special capabilities:
- Contract analysis on Binance Smart Chain (BSC)
- Transaction investigation and risk assessment
- Token research and evaluation
- Personalized learning recommendations

When users ask about "CTD", respond about Chain Talk Daily platform. When they ask about "Binno", explain your role as the CTD AI agent. Always be helpful, use emojis for engagement, and promote learning through the CTD ecosystem.`
              },
              ...messages
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        })

        if (openAIResponse.ok) {
          const data = await openAIResponse.json()
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            response = data.choices[0].message.content
            source = 'openai'
            console.log('OpenAI response received successfully')
          } else {
            throw new Error('Invalid OpenAI response format')
          }
        } else {
          const errorText = await openAIResponse.text()
          throw new Error(`OpenAI API failed: ${openAIResponse.status} - ${errorText}`)
        }
      } catch (openAIError) {
        console.error('OpenAI failed, using knowledge base:', openAIError)
        response = getContextualResponse(messages, context)
        source = 'knowledge_base_fallback'
      }
    } else {
      // Use enhanced knowledge base with context
      console.log('No OpenAI API key, using knowledge base')
      response = getContextualResponse(messages, context)
      source = 'knowledge_base'
    }

    // Temporarily skip memory update
    // contextManager.updateMemory(userId, sessionId, lastMessage, response)

    return res.status(200).json({
      success: true,
      message: response,
      timestamp: Date.now(),
      source: source,
      context: context
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process chat request'
    })
  }
}