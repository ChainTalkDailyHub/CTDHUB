// CoinGecko API Integration for Detailed Token Information
// Provides comprehensive project data, market metrics, and descriptions

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const COINGECKO_PRO_API_BASE = 'https://pro-api.coingecko.com/api/v3'

interface CoinGeckoTokenData {
  id: string
  symbol: string
  name: string
  description: {
    en: string
  }
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    total_volume: { usd: number }
    circulating_supply: number
    total_supply: number
    max_supply: number | null
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    ath: { usd: number }
    atl: { usd: number }
  }
  platforms: {
    [key: string]: string
  }
  categories: string[]
  links: {
    homepage: string[]
    blockchain_site: string[]
    official_forum_url: string[]
    twitter_screen_name: string
    telegram_channel_identifier: string
  }
}

interface SimplifiedTokenData {
  name: string
  symbol: string
  description: string
  price_usd: number
  market_cap_usd: number
  volume_24h_usd: number
  circulating_supply: number
  total_supply: number
  max_supply: number | null
  price_change_24h: number
  price_change_7d: number
  contract_address?: string
  network?: string
  categories: string[]
  links: {
    website?: string
    twitter?: string
    telegram?: string
  }
}

/**
 * Get API key from environment
 */
function getApiKey(): string | null {
  return process.env.COINGECKO_API_KEY || null
}

/**
 * Get base URL (Pro or Free)
 */
function getBaseUrl(): string {
  const apiKey = getApiKey()
  return apiKey ? COINGECKO_PRO_API_BASE : COINGECKO_API_BASE
}

/**
 * Get headers with API key if available
 */
function getHeaders(): HeadersInit {
  const apiKey = getApiKey()
  const headers: HeadersInit = {
    'Accept': 'application/json',
  }
  
  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey
  }
  
  return headers
}

/**
 * Search for coin by name or symbol
 */
export async function searchCoin(query: string): Promise<string | null> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/search?query=${encodeURIComponent(query)}`,
      { headers: getHeaders() }
    )

    if (!response.ok) {
      console.error(`CoinGecko search error: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    if (data.coins && data.coins.length > 0) {
      // Return the first match (most relevant)
      return data.coins[0].id
    }

    return null
  } catch (error) {
    console.error('Error searching coin:', error)
    return null
  }
}

/**
 * Get detailed coin information by coin ID
 */
export async function getCoinDetails(coinId: string): Promise<SimplifiedTokenData | null> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      { headers: getHeaders() }
    )

    if (!response.ok) {
      console.error(`CoinGecko details error: ${response.status}`)
      return null
    }

    const data: CoinGeckoTokenData = await response.json()
    
    // Extract description (remove HTML tags)
    const description = data.description?.en 
      ? data.description.en.replace(/<[^>]*>/g, '').substring(0, 500) + '...'
      : 'No description available'

    // Find contract address (prefer BSC, then ETH)
    let contractAddress: string | undefined
    let network: string | undefined
    
    if (data.platforms) {
      if (data.platforms['binance-smart-chain']) {
        contractAddress = data.platforms['binance-smart-chain']
        network = 'BSC'
      } else if (data.platforms['ethereum']) {
        contractAddress = data.platforms['ethereum']
        network = 'ETH'
      } else {
        // Use first available platform
        const platformKeys = Object.keys(data.platforms)
        if (platformKeys.length > 0) {
          contractAddress = data.platforms[platformKeys[0]]
          network = platformKeys[0].toUpperCase()
        }
      }
    }

    return {
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      description,
      price_usd: data.market_data.current_price.usd,
      market_cap_usd: data.market_data.market_cap.usd,
      volume_24h_usd: data.market_data.total_volume.usd,
      circulating_supply: data.market_data.circulating_supply,
      total_supply: data.market_data.total_supply,
      max_supply: data.market_data.max_supply,
      price_change_24h: data.market_data.price_change_percentage_24h,
      price_change_7d: data.market_data.price_change_percentage_7d,
      contract_address: contractAddress,
      network,
      categories: data.categories || [],
      links: {
        website: data.links.homepage?.[0],
        twitter: data.links.twitter_screen_name,
        telegram: data.links.telegram_channel_identifier
      }
    }
  } catch (error) {
    console.error('Error getting coin details:', error)
    return null
  }
}

/**
 * Get token information by name or symbol (combines search + details)
 */
export async function getTokenByNameOrSymbol(query: string): Promise<SimplifiedTokenData | null> {
  try {
    // First, search for the coin ID
    const coinId = await searchCoin(query)
    
    if (!coinId) {
      return null
    }

    // Then get detailed information
    return await getCoinDetails(coinId)
  } catch (error) {
    console.error('Error getting token info:', error)
    return null
  }
}

/**
 * Format token data for AI response
 */
export function formatCoinGeckoDataForAI(tokenData: SimplifiedTokenData): string {
  const formatPrice = (price: number) => {
    if (isNaN(price)) return 'N/A'
    // Always show 8 decimal places for prices (most tokens cost < $1)
    return `$${price.toFixed(8)}`
  }
  
  const formatNumber = (num: number) => {
    if (isNaN(num)) return 'N/A'
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatSupply = (num: number) => {
    if (isNaN(num)) return 'N/A'
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toLocaleString()
  }

  const priceChange24h = tokenData.price_change_24h
  const emoji24h = priceChange24h > 0 ? '📈' : priceChange24h < 0 ? '📉' : '➡️'
  
  const priceChange7d = tokenData.price_change_7d
  const emoji7d = priceChange7d > 0 ? '📈' : priceChange7d < 0 ? '📉' : '➡️'

  let response = `🪙 **${tokenData.name} (${tokenData.symbol})**\n\n`
  
  // Description
  response += `**About ${tokenData.name}:**\n${tokenData.description}\n\n`
  
  // Market Data
  response += `**💰 Market Data:**\n`
  response += `- **Current Price:** ${formatPrice(tokenData.price_usd)}\n`
  response += `- **Market Cap:** ${formatNumber(tokenData.market_cap_usd)}\n`
  response += `- **24h Volume:** ${formatNumber(tokenData.volume_24h_usd)}\n`
  response += `- **24h Change:** ${emoji24h} ${priceChange24h.toFixed(2)}%\n`
  response += `- **7d Change:** ${emoji7d} ${priceChange7d.toFixed(2)}%\n\n`
  
  // Supply Information
  response += `**📊 Supply:**\n`
  response += `- **Circulating Supply:** ${formatSupply(tokenData.circulating_supply)} ${tokenData.symbol}\n`
  response += `- **Total Supply:** ${formatSupply(tokenData.total_supply)} ${tokenData.symbol}\n`
  if (tokenData.max_supply) {
    response += `- **Max Supply:** ${formatSupply(tokenData.max_supply)} ${tokenData.symbol}\n`
  } else {
    response += `- **Max Supply:** ♾️ Unlimited\n`
  }
  response += `\n`

  // Contract Address
  if (tokenData.contract_address && tokenData.network) {
    response += `**🔗 Contract:**\n`
    response += `- **Network:** ${tokenData.network}\n`
    response += `- **Address:** \`${tokenData.contract_address}\`\n\n`
  }

  // Categories
  if (tokenData.categories.length > 0) {
    response += `**🏷️ Categories:** ${tokenData.categories.slice(0, 3).join(', ')}\n\n`
  }

  // Links
  const links = []
  if (tokenData.links.website) links.push(`[Website](${tokenData.links.website})`)
  if (tokenData.links.twitter) links.push(`[Twitter](https://twitter.com/${tokenData.links.twitter})`)
  if (tokenData.links.telegram) links.push(`[Telegram](https://t.me/${tokenData.links.telegram})`)
  
  if (links.length > 0) {
    response += `**🔗 Links:** ${links.join(' | ')}\n\n`
  }

  // Disclaimer
  response += `💡 **Data from CoinGecko** - Always DYOR before investing!`

  return response
}

/**
 * Get trending coins (top 7 trending on CoinGecko)
 */
export async function getTrendingCoins(): Promise<SimplifiedTokenData[]> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/search/trending`,
      { headers: getHeaders() }
    )

    if (!response.ok) {
      console.error(`CoinGecko trending error: ${response.status}`)
      return []
    }

    const data = await response.json()
    
    if (!data.coins || data.coins.length === 0) {
      return []
    }

    // Get detailed info for each trending coin (limit to 5)
    const detailedCoins: SimplifiedTokenData[] = []
    for (const coin of data.coins.slice(0, 5)) {
      const details = await getCoinDetails(coin.item.id)
      if (details) {
        detailedCoins.push(details)
      }
    }

    return detailedCoins
  } catch (error) {
    console.error('Error getting trending coins:', error)
    return []
  }
}
