import { Handler } from '@netlify/functions'
import { 
  searchToken, 
  getTrendingTokens, 
  formatTokenDataForAI, 
  detectTokenQuery,
  isTrendingQuery 
} from '../../lib/geckoTerminalAPI'
import {
  getTokenByNameOrSymbol,
  formatCoinGeckoDataForAI,
  getTrendingCoins
} from '../../lib/coinGeckoAPI'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { messages } = JSON.parse(event.body || '{}')

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid messages format' }),
      }
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No user message found' }),
      }
    }

    const userMessage = lastMessage.content.toLowerCase()

    // Check for token queries FIRST (before OpenAI)
    const tokenQuery = detectTokenQuery(lastMessage.content)
    if (tokenQuery) {
      console.log(`🔍 Token query detected: ${tokenQuery}`)
      
      // Try CoinGecko first (more comprehensive data with description)
      console.log('📊 Trying CoinGecko API first...')
      const coinGeckoData = await getTokenByNameOrSymbol(tokenQuery)
      
      if (coinGeckoData) {
        console.log(`✅ Found on CoinGecko: ${coinGeckoData.name}`)
        const formattedResponse = formatCoinGeckoDataForAI(coinGeckoData)
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: formattedResponse }),
        }
      }
      
      // Fallback to GeckoTerminal (DEX data)
      console.log('🔄 Trying GeckoTerminal API (DEX data)...')
      const geckoTerminalData = await searchToken(tokenQuery)
      
      if (geckoTerminalData) {
        console.log(`✅ Found on GeckoTerminal: ${geckoTerminalData.name}`)
        const formattedResponse = formatTokenDataForAI(geckoTerminalData)
        const aiResponse = `${formattedResponse}\n\n💡 **Quick Insights:**\n- This is real-time on-chain data from GeckoTerminal\n- Always verify contract addresses before interacting\n- DYOR (Do Your Own Research) before investing`
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: aiResponse }),
        }
      }
      
      // Token not found anywhere
      const notFoundResponse = `🔍 I couldn't find a token called **${tokenQuery}** on CoinGecko or major DEXs.\n\n**Possible reasons:**\n- Token might not be listed yet\n- Name/symbol might be different\n- Token might be too new or small\n\n💡 **Try:**\n- Providing the full token name\n- Checking the contract address on BscScan/Etherscan\n- Asking about popular tokens like BNB, ETH, USDT, BTC`
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: notFoundResponse }),
      }
    }

    // Check for trending tokens query
    if (isTrendingQuery(lastMessage.content)) {
      console.log('📈 Trending tokens query detected')
      
      // Try CoinGecko trending first (global trending)
      const coinGeckoTrending = await getTrendingCoins()
      
      if (coinGeckoTrending.length > 0) {
        let trendingResponse = `🔥 **Top 5 Trending Coins Globally**\n\n`
        coinGeckoTrending.forEach((token, index) => {
          const priceChange = token.price_change_24h
          const emoji = priceChange > 0 ? '🟢' : priceChange < 0 ? '🔴' : '⚪'
          trendingResponse += `${index + 1}. ${emoji} **${token.name} (${token.symbol})**\n`
          trendingResponse += `   💰 $${token.price_usd.toFixed(6)} | 📊 ${priceChange.toFixed(2)}% (24h)\n`
          trendingResponse += `   📈 Market Cap: $${(token.market_cap_usd / 1e9).toFixed(2)}B\n\n`
        })
        trendingResponse += `💡 **Data from CoinGecko** - Global trending cryptocurrencies`
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: trendingResponse }),
        }
      }
      
      // Fallback to GeckoTerminal (BSC DEX trending)
      const bscTrending = await getTrendingTokens('bsc', 5)
      
      if (bscTrending.length > 0) {
        let trendingResponse = `📈 **Top 5 Trending Tokens on BSC**\n\n`
        bscTrending.forEach((token, index) => {
          const priceChange = parseFloat(token.price_change_24h)
          const emoji = priceChange > 0 ? '🟢' : priceChange < 0 ? '🔴' : '⚪'
          trendingResponse += `${index + 1}. ${emoji} **${token.name} (${token.symbol})**\n`
          trendingResponse += `   Price: $${parseFloat(token.price_usd).toFixed(6)} | 24h: ${priceChange.toFixed(2)}%\n\n`
        })
        trendingResponse += `\n💡 Data from GeckoTerminal - Updated in real-time`
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: trendingResponse }),
        }
      }
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (openaiApiKey && openaiApiKey.startsWith('sk-')) {
      // Use OpenAI API
      try {
        const systemPrompt = `You are BinnoAI, a specialized AI assistant for blockchain, Web3, DeFi, and cryptocurrency education. You are the mascot of CTD (Chain Talk Daily) platform. 

🔗 **Special Capability**: You have access to real-time on-chain data from GeckoTerminal API. When users ask about specific tokens, you automatically fetch live price, volume, and market data.

Key guidelines:
- Provide educational, accurate, and helpful responses about blockchain technology
- Use emojis and markdown formatting for engaging responses
- Focus on practical examples and real-world applications
- Explain complex concepts in simple terms
- Always maintain a friendly, professional tone
- If discussing risks, always mention them clearly
- Provide actionable advice when possible
- When discussing tokens, remind users to DYOR (Do Your Own Research)

Topics you excel at:
- Blockchain fundamentals and consensus mechanisms
- Smart contracts and Solidity development
- DeFi protocols, yield farming, and liquidity mining
- Cryptocurrency trading strategies and analysis
- Web3 development tools and frameworks
- Blockchain security and best practices
- Gas optimization techniques
- Cross-chain technologies and interoperability
- Real-time token data and on-chain analytics

Always start responses with relevant emojis and structure information clearly with headers when appropriate.`

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              ...messages.slice(-5) // Last 5 messages for context
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        })

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`)
        }

        const openaiData = await openaiResponse.json()
        const aiMessage = openaiData.choices[0]?.message?.content

        if (aiMessage) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: aiMessage }),
          }
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        // Fall through to static responses
      }
    }

    // Fallback to static responses
    let response = ''

    if (userMessage.includes('ctd') || userMessage.includes('chain talk daily')) {
      response = `🚀 **CTD (Chain Talk Daily)** é uma plataforma inovadora de educação blockchain que revoluciona como as pessoas aprendem sobre Web3, DeFi e criptomoedas através de quizzes interativos e assistência de IA.

💰 **Sistema de Token CTD**: Os usuários ganham 10.000 tokens CTD ao completar todos os módulos de quiz (recompensa única por carteira). Os tokens CTD são BEP-20 na Binance Smart Chain com utilidade real no ecossistema.`
    } else if (userMessage.includes('binno')) {
      response = `🤖 **Binno AI** é o agente de IA principal e personagem principal da plataforma CTD! Sou projetado para ser seu companheiro pessoal de educação blockchain e guia Web3!

✨ **Capacidades do Binno**: Forneço explicações especializadas sobre tecnologia blockchain, analiso contratos inteligentes e transações na BSC, ofereço recomendações de aprendizado personalizadas e guio usuários através de conceitos DeFi complexos.`
    } else if (userMessage.includes('defi')) {
      response = `🔄 **DeFi (Decentralized Finance)** refere-se a uma forma de finanças baseada em blockchain que não depende de intermediários financeiros tradicionais.

**Componentes Principais:**
- **DEXs**: Exchanges descentralizadas como Uniswap, SushiSwap
- **Protocolos de Empréstimo**: Compound, Aave, MakerDAO
- **Yield Farming**: Ganhar recompensas fornecendo liquidez
- **Ativos Sintéticos**: Mirror Protocol, Synthetix`
    } else if (userMessage.includes('smart contract')) {
      response = `📜 **Contratos Inteligentes** são contratos auto-executáveis com termos escritos diretamente em código.

**Características Principais:**
- **Imutáveis**: Não podem ser alterados após o deploy
- **Transparentes**: Código é publicamente visível
- **Automáticos**: Executam sem intermediários
- **Globais**: Acessíveis de qualquer lugar`
    } else if (userMessage.includes('blockchain')) {
      response = `⛓️ **Blockchain** é uma tecnologia de livro-razão distribuído que mantém uma lista continuamente crescente de registros (blocos) ligados usando criptografia.

**Características Principais:**
- **Descentralização**: Sem ponto único de falha
- **Imutabilidade**: Dados não podem ser alterados
- **Transparência**: Todas as transações são públicas
- **Consenso Distribuído**: Acordo da rede`
    } else {
      response = `🤖 **Olá! Sou o BinnoAI, seu especialista Web3.**

Posso ajudar você com:
- **Protocolos DeFi** e estratégias de yield farming
- **Desenvolvimento** de contratos inteligentes
- **Fundamentos blockchain** e mecanismos de consenso
- **Otimização de gas** e melhores práticas
- **Ferramentas Web3** e frameworks

Experimente me perguntar sobre tópicos específicos como "Como funciona DeFi?" ou "Explique contratos inteligentes".`
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: response }),
    }

  } catch (error) {
    console.error('Error processing request:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

export { handler }