// GeckoTerminal API Integration for On-Chain Data
// Provides real-time token information, price, volume, and market data

const GECKOTERMINAL_API = 'https://api.geckoterminal.com/api/v2'

interface TokenData {
  name: string
  symbol: string
  address: string
  price_usd: string
  price_change_24h: string
  volume_24h: string
  market_cap_usd: string
  total_supply: string
  network: string
  pools?: PoolData[]
}

interface PoolData {
  name: string
  address: string
  dex: string
  liquidity_usd: string
  volume_24h: string
}

/**
 * Search for token by name or symbol across networks
 */
export async function searchToken(query: string): Promise<TokenData | null> {
  try {
    // Try BSC first (most relevant for CTD)
    const bscResult = await searchTokenOnNetwork('bsc', query)
    if (bscResult) return bscResult

    // Try Ethereum
    const ethResult = await searchTokenOnNetwork('eth', query)
    if (ethResult) return ethResult

    // Try other popular networks
    const networks = ['polygon_pos', 'arbitrum', 'avalanche', 'base']
    for (const network of networks) {
      const result = await searchTokenOnNetwork(network, query)
      if (result) return result
    }

    return null
  } catch (error) {
    console.error('Error searching token:', error)
    return null
  }
}

/**
 * Search token on specific network
 */
async function searchTokenOnNetwork(network: string, query: string): Promise<TokenData | null> {
  try {
    const response = await fetch(
      `${GECKOTERMINAL_API}/search/pools?query=${encodeURIComponent(query)}&network=${network}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const pool = data.data[0]
      const token = pool.attributes.base_token

      return {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        price_usd: pool.attributes.base_token_price_usd,
        price_change_24h: pool.attributes.price_change_percentage?.h24 || '0',
        volume_24h: pool.attributes.volume_usd?.h24 || '0',
        market_cap_usd: pool.attributes.market_cap_usd || 'N/A',
        total_supply: token.total_supply || 'N/A',
        network: network.toUpperCase(),
        pools: [{
          name: pool.attributes.name,
          address: pool.attributes.address,
          dex: pool.relationships.dex.data.id,
          liquidity_usd: pool.attributes.reserve_in_usd,
          volume_24h: pool.attributes.volume_usd?.h24 || '0'
        }]
      }
    }

    return null
  } catch (error) {
    console.error(`Error searching on ${network}:`, error)
    return null
  }
}

/**
 * Get token details by contract address
 */
export async function getTokenByAddress(network: string, address: string): Promise<TokenData | null> {
  try {
    const response = await fetch(
      `${GECKOTERMINAL_API}/networks/${network}/tokens/${address}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const token = data.data.attributes

    return {
      name: token.name,
      symbol: token.symbol,
      address: token.address,
      price_usd: token.price_usd,
      price_change_24h: token.price_change_percentage?.h24 || '0',
      volume_24h: token.volume_usd?.h24 || '0',
      market_cap_usd: token.market_cap_usd || 'N/A',
      total_supply: token.total_supply || 'N/A',
      network: network.toUpperCase()
    }
  } catch (error) {
    console.error('Error getting token by address:', error)
    return null
  }
}

/**
 * Get trending tokens on a network
 */
export async function getTrendingTokens(network: string = 'bsc', limit: number = 10): Promise<TokenData[]> {
  try {
    const response = await fetch(
      `${GECKOTERMINAL_API}/networks/${network}/trending_pools?page=1`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    
    return data.data.slice(0, limit).map((pool: any) => {
      const token = pool.attributes.base_token
      return {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        price_usd: pool.attributes.base_token_price_usd,
        price_change_24h: pool.attributes.price_change_percentage?.h24 || '0',
        volume_24h: pool.attributes.volume_usd?.h24 || '0',
        market_cap_usd: pool.attributes.market_cap_usd || 'N/A',
        total_supply: token.total_supply || 'N/A',
        network: network.toUpperCase()
      }
    })
  } catch (error) {
    console.error('Error getting trending tokens:', error)
    return []
  }
}

/**
 * Format token data for AI response
 */
export function formatTokenDataForAI(tokenData: TokenData): string {
  const priceChange = parseFloat(tokenData.price_change_24h)
  const priceEmoji = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️'
  
  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr)
    if (isNaN(price)) return priceStr
    // Always show 8 decimal places for prices (most tokens cost < $1)
    return `$${price.toFixed(8)}`
  }
  
  const formatNumber = (num: string) => {
    const n = parseFloat(num)
    if (isNaN(n)) return num
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
    return `$${n.toFixed(2)}`
  }

  let response = `🪙 **${tokenData.name} (${tokenData.symbol})**\n\n`
  response += `**Network:** ${tokenData.network}\n`
  response += `**Contract:** \`${tokenData.address}\`\n\n`
  response += `**Price:** ${formatPrice(tokenData.price_usd)}\n`
  response += `**24h Change:** ${priceEmoji} ${priceChange.toFixed(2)}%\n`
  response += `**24h Volume:** ${formatNumber(tokenData.volume_24h)}\n`
  
  if (tokenData.market_cap_usd !== 'N/A') {
    response += `**Market Cap:** ${formatNumber(tokenData.market_cap_usd)}\n`
  }

  if (tokenData.pools && tokenData.pools.length > 0) {
    const pool = tokenData.pools[0]
    response += `\n**Main Pool:**\n`
    response += `- DEX: ${pool.dex.toUpperCase()}\n`
    response += `- Liquidity: ${formatNumber(pool.liquidity_usd)}\n`
  }

  return response
}

/**
 * Detect if user message is asking about a token
 */
export function detectTokenQuery(message: string): string | null {
  const tokenPatterns = [
    /(?:what|tell me about|info on|information about|price of|check)\s+(?:the\s+)?(\w+)\s+token/i,
    /(\w+)\s+token\s+(?:price|info|information|details)/i,
    /token\s+(\w+)/i,
    /^([A-Z]{2,10})$/i, // Just ticker symbol
  ]

  for (const pattern of tokenPatterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      return match[1].toUpperCase()
    }
  }

  return null
}

/**
 * Check if message is asking for trending tokens
 */
export function isTrendingQuery(message: string): boolean {
  const trendingPatterns = [
    /trending\s+tokens?/i,
    /hot\s+tokens?/i,
    /popular\s+tokens?/i,
    /top\s+tokens?/i,
  ]

  return trendingPatterns.some(pattern => pattern.test(message))
}
