import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
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

const callOpenAI = async (messages: ChatMessage[]): Promise<string> => {
  const openaiKey = process.env.OPENAI_API_KEY
  
  if (!openaiKey) {
    console.log('OpenAI key not available, using local responses')
    return generateLocalResponse(messages[messages.length - 1].content)
  }

  try {
    console.log('Calling OpenAI API...')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é Binno AI, o assistente especialista em blockchain da plataforma CTDHUB. 

SOBRE CTDHUB:
- Plataforma educacional de blockchain criada pela Chain Talk Daily (CTD)
- Oferece cursos, quizzes e certificações sobre Web3, DeFi e blockchain
- Sistema de tokens CTD na BSC (Binance Smart Chain)
- Usuários ganham 10.000 tokens CTD ao completar todos os módulos do quiz

SUAS CARACTERÍSTICAS:
- Você é especialista em blockchain, criptomoedas, DeFi, NFTs, smart contracts
- Responde em português brasileiro de forma educativa e amigável
- Use emojis para tornar as respostas mais envolventes
- Seja específico e técnico quando necessário, mas didático
- Sempre promova educação financeira e segurança
- Mencione riscos quando apropriado

TÓPICOS QUE VOCÊ DOMINA:
- Bitcoin, Ethereum e outras criptomoedas
- DeFi (Uniswap, Compound, Aave, PancakeSwap)
- NFTs e marketplaces
- Wallets (MetaMask, hardware wallets)
- Smart contracts e Solidity
- Binance Smart Chain (BSC)
- Trading e análise técnica
- Segurança em crypto

Responda de forma útil, educativa e sempre incentive o aprendizado responsável.`
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API Error:', response.status, errorData)
      throw new Error(`OpenAI API Error: ${response.status}`)
    }

    const data: OpenAIResponse = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      console.log('OpenAI response received successfully')
      return data.choices[0].message.content
    } else {
      throw new Error('No response from OpenAI')
    }
    
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    // Fallback para resposta local
    return generateLocalResponse(messages[messages.length - 1].content)
  }
}

const generateLocalResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  console.log('Using local responses for message:', message)
  
  // Expanded keyword matching for more specific responses
  
  // Bitcoin questions
  if (message.includes('bitcoin') || message.includes('btc')) {
    return "₿ **Bitcoin** é a primeira e mais conhecida criptomoeda, criada por Satoshi Nakamoto em 2009. É uma moeda digital descentralizada que utiliza tecnologia blockchain para permitir transações peer-to-peer sem intermediários. Bitcoin usa o algoritmo de consenso Proof of Work (PoW) e tem um suprimento limitado de 21 milhões de moedas. É considerada 'ouro digital' e serve como reserva de valor."
  }
  
  // Ethereum questions
  if (message.includes('ethereum') || message.includes('eth') || message.includes('smart contract')) {
    return "⟐ **Ethereum** é uma plataforma blockchain que permite criar contratos inteligentes (smart contracts) e aplicações descentralizadas (DApps). Criada por Vitalik Buterin, permite programar lógica complexa na blockchain. Ethereum usa sua própria linguagem de programação (Solidity) e está migrando do Proof of Work para Proof of Stake com o Ethereum 2.0."
  }
  
  // DeFi questions  
  if (message.includes('defi') || message.includes('yield') || message.includes('liquidity') || message.includes('staking')) {
    return "🏦 **DeFi (Decentralized Finance)** refere-se a serviços financeiros construídos em blockchain que eliminam intermediários tradicionais. Inclui: lending/borrowing, DEXs, yield farming, liquidity mining, e staking. Permite ganhos passivos através de protocolos como Compound, Aave, Uniswap, e PancakeSwap. **Cuidado com riscos**: impermanent loss, smart contract bugs, e volatilidade."
  }
  
  // NFT questions
  if (message.includes('nft') || message.includes('token não fungível')) {
    return "🎨 **NFTs (Non-Fungible Tokens)** são tokens únicos que representam propriedade digital de arte, colecionáveis, ou outros ativos digitais. Cada NFT tem características únicas e não pode ser dividido ou substituído por outro. São populares em marketplaces como OpenSea e podem ter utilidade em jogos, metaverso, e comunidades exclusivas."
  }
  
  // Trading questions
  if (message.includes('trading') || message.includes('investir') || message.includes('comprar') || message.includes('vender')) {
    return "📈 **Trading de Criptomoedas** envolve compra e venda de ativos digitais. **Dicas importantes**: Faça sua própria pesquisa (DYOR), nunca invista mais do que pode perder, use stop-loss, diversifique seu portfólio, e entenda análise técnica e fundamental. Exchanges populares incluem Binance, Coinbase, e Kraken. **Sempre use autenticação de dois fatores!**"
  }
  
  // Wallet questions
  if (message.includes('wallet') || message.includes('carteira') || message.includes('metamask')) {
    return "👛 **Wallets de Criptomoedas** armazenam suas chaves privadas e permitem gerenciar seus ativos. **Tipos**: Hot wallets (online) como MetaMask, Trust Wallet; Cold wallets (offline) como Ledger, Trezor. **Segurança essencial**: Nunca compartilhe sua seed phrase, use wallets oficiais, verifique endereços antes de enviar, e mantenha backups seguros."
  }
  
  // Binance Smart Chain questions
  if (message.includes('bsc') || message.includes('binance smart chain') || message.includes('bnb')) {
    return "🟡 **Binance Smart Chain (BSC)** é uma blockchain compatível com Ethereum criada pela Binance. Oferece transações mais rápidas e baratas que Ethereum. Usa consenso Proof of Staked Authority (PoSA). Popular para DeFi com protocolos como PancakeSwap, Venus, e Alpaca Finance. Token nativo: BNB."
  }
  
  // Greeting responses
  if (message.includes('olá') || message.includes('oi') || message.includes('hello') || message.includes('hi')) {
    return "👋 **Olá! Sou o Binno AI, seu assistente de blockchain!** Estou aqui para ajudar com tudo relacionado a criptomoedas, DeFi, trading, e tecnologia blockchain. Pode perguntar sobre Bitcoin, Ethereum, NFTs, wallets, ou qualquer dúvida sobre o mundo Web3. Como posso ajudar você hoje? 🚀"
  }
  
  // Portuguese blockchain terms
  if (message.includes('blockchain') || message.includes('criptomoeda') || message.includes('crypto')) {
    return "⛓️ **Blockchain** é uma tecnologia de registro distribuído que mantém uma lista crescente de registros (blocos) ligados por criptografia. Cada bloco contém hash do bloco anterior, timestamp e dados de transação. **Características**: descentralização, imutabilidade, transparência, e consenso distribuído. É a base de todas as criptomoedas e aplicações Web3."
  }
  
  // Help/assistance requests
  if (message.includes('ajuda') || message.includes('help') || message.includes('como') || message.includes('what') || message.includes('o que')) {
    return "🤖 **Como posso ajudar?** Sou especialista em blockchain e posso explicar sobre:\n\n" +
           "💰 **Criptomoedas**: Bitcoin, Ethereum, altcoins\n" +
           "🏦 **DeFi**: Protocolos, yield farming, staking\n" +
           "📊 **Trading**: Estratégias, análise técnica\n" +
           "👛 **Wallets**: MetaMask, hardware wallets\n" +
           "🎨 **NFTs**: Criação, marketplaces, utilidades\n" +
           "⛓️ **Tecnologia**: Smart contracts, consenso\n\n" +
           "Digite sua pergunta específica! 😊"
  }
  
  // Check original knowledge base for matches
  for (const [category, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(keyword => message.includes(keyword))) {
      const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)]
      return randomResponse
    }
  }
  
  // More intelligent default response based on message analysis
  if (message.length < 5) {
    return "🤔 **Pergunta muito curta!** Pode ser mais específico? Por exemplo: 'O que é Bitcoin?', 'Como funciona DeFi?', ou 'Como criar uma wallet?'"
  }
  
  if (message.includes('?')) {
    return "❓ **Boa pergunta!** Embora eu não tenha uma resposta específica para isso, posso ajudar com tópicos relacionados a blockchain, criptomoedas, DeFi, NFTs, wallets, e trading. Pode reformular ou perguntar sobre um tópico mais específico?"
  }
  
  // Final fallback
  return "🤖 **Binno AI aqui!** Não entendi exatamente sua pergunta, mas estou aqui para ajudar! Posso explicar sobre:\n\n" +
         "• 💰 **Bitcoin e Ethereum** - Como funcionam\n" +
         "• 🏦 **DeFi** - Protocolos e estratégias\n" +
         "• 📊 **Trading** - Dicas e análises\n" +
         "• 👛 **Wallets** - Segurança e uso\n" +
         "• 🎨 **NFTs** - Criação e mercados\n\n" +
         "Faça uma pergunta mais específica! 🚀"
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

    console.log('Raw body:', event.body)
    
    let parsedBody
    try {
      parsedBody = JSON.parse(event.body)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          message: 'Request body must be valid JSON',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        })
      }
    }

    const { messages } = parsedBody as { messages: ChatMessage[] }

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

    // Generate response using OpenAI or local fallback
    const aiResponse = await callOpenAI([...messages, lastMessage])

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