import type { Handler } from '@netlify/functions'

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

// Simple in-memory storage for demo (in production, use database)
const progressStorage = new Map<string, number[]>()

export const handler: Handler = async (event, context) => {
  console.log('📊 Quiz Progress API - Start')
  
  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    if (event.httpMethod === 'POST') {
      // Save progress
      const requestBody = JSON.parse(event.body || '{}')
      const { userAddress, moduleId } = requestBody

      if (!userAddress || !moduleId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userAddress or moduleId' })
        }
      }

      console.log(`📚 Saving progress: ${userAddress} completed module ${moduleId}`)

      // Get current progress
      const normalizedAddress = userAddress.toLowerCase()
      const completedModules = progressStorage.get(normalizedAddress) || []

      // Add new module if not already completed
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId)
        completedModules.sort((a, b) => a - b)
      }

      // Save updated progress
      progressStorage.set(normalizedAddress, completedModules)

      console.log(`✅ Progress saved: ${completedModules.length}/10 modules completed`)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          completedModules,
          allCompleted: completedModules.length === 10
        })
      }
    }

    if (event.httpMethod === 'GET') {
      // Get progress
      const userAddress = event.queryStringParameters?.userAddress

      if (!userAddress) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userAddress parameter' })
        }
      }

      console.log(`🔍 Getting progress for: ${userAddress}`)

      const normalizedAddress = userAddress.toLowerCase()
      const completedModules = progressStorage.get(normalizedAddress) || []
      const allCompleted = completedModules.length === 10

      console.log(`📊 Progress found: ${completedModules.length}/10 modules, all completed: ${allCompleted}`)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          completedModules,
          allCompleted,
          progress: completedModules.length,
          total: 10
        })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('❌ Error in quiz progress:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}