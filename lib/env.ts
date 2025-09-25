/**
 * Environment configuration validator
 * Ensures all required environment variables are properly set
 */

interface EnvConfig {
  // Blockchain Configuration
  BSC_RPC_URL: string
  BSC_TESTNET_RPC_URL?: string
  PRIVATE_KEY?: string
  PRIVATE_KEY_TREASURY?: string
  
  // Contract Addresses
  TOKEN_ADDRESS?: string
  CTD_TOKEN_ADDRESS?: string
  CTD_PREMIUM_NFT_ADDRESS?: string
  CTD_CERT_ADDRESS?: string
  BURN_AMOUNT?: string
  
  // AI Configuration
  AI_API_KEY?: string
  AI_MODEL?: string
  AI_MAX_TOKENS?: string
  
  // Application Settings
  NODE_ENV: string
  NEXT_PUBLIC_CHAIN_ID?: string
  NEXT_PUBLIC_APP_URL?: string
  NEXT_PUBLIC_APP_NAME?: string
  NEXT_PUBLIC_APP_VERSION?: string
  
  // Security Settings
  JWT_SECRET?: string
  RATE_LIMIT_PER_MINUTE?: string
}

const requiredEnvVars = [
  'NODE_ENV',
  'BSC_RPC_URL'
]

const optionalEnvVars = [
  'BSC_TESTNET_RPC_URL',
  'PRIVATE_KEY',
  'PRIVATE_KEY_TREASURY',
  'TOKEN_ADDRESS',
  'CTD_TOKEN_ADDRESS',
  'AI_API_KEY',
  'AI_MODEL',
  'AI_MAX_TOKENS',
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_VERSION',
  'JWT_SECRET',
  'RATE_LIMIT_PER_MINUTE'
]

function validateEnv(): EnvConfig {
  const env = process.env
  const missing: string[] = []
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!env[varName]) {
      missing.push(varName)
    }
  })
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing.join(', '))
    console.warn('Please check your .env.local file and ensure all required variables are set')
  }
  
  // Return configuration with defaults
  return {
    BSC_RPC_URL: env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
    BSC_TESTNET_RPC_URL: env.BSC_TESTNET_RPC_URL,
    PRIVATE_KEY: env.PRIVATE_KEY,
    PRIVATE_KEY_TREASURY: env.PRIVATE_KEY_TREASURY,
    TOKEN_ADDRESS: env.TOKEN_ADDRESS,
    CTD_TOKEN_ADDRESS: env.CTD_TOKEN_ADDRESS,
    CTD_PREMIUM_NFT_ADDRESS: env.CTD_PREMIUM_NFT_ADDRESS,
    CTD_CERT_ADDRESS: env.CTD_CERT_ADDRESS,
    BURN_AMOUNT: env.BURN_AMOUNT || '10000',
    AI_API_KEY: env.AI_API_KEY,
    AI_MODEL: env.AI_MODEL || 'gpt-3.5-turbo',
    AI_MAX_TOKENS: env.AI_MAX_TOKENS || '500',
    NODE_ENV: env.NODE_ENV || 'development',
    NEXT_PUBLIC_CHAIN_ID: env.NEXT_PUBLIC_CHAIN_ID || '56',
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME || 'CTDHUB Platform',
    NEXT_PUBLIC_APP_VERSION: env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
    JWT_SECRET: env.JWT_SECRET,
    RATE_LIMIT_PER_MINUTE: env.NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE || '60'
  }
}

export const envConfig = validateEnv()

export function getEnvVar(key: keyof EnvConfig, fallback?: string): string {
  const value = envConfig[key]
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value || fallback || ''
}

export function isProduction(): boolean {
  return envConfig.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return envConfig.NODE_ENV === 'development'
}