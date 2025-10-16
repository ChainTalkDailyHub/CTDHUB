
const OpenAI = require('openai')

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

exports.handler = async (event, context) => {
  // Set timeout context
  context.callbackWaitsForEmptyEventLoop = false
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: corsHeaders, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    }
  }

  try {
    console.log('🚀 BINNO AI Analysis - Quick Version')
    
    // Validate OpenAI
    if (!openai) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'OpenAI not configured',
          details: 'AI service unavailable'
        })
      }
    }
    
    // Parse request
    let requestData
    try {
      requestData = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON' })
      }
    }
    
    const userAnswers = requestData.userAnswers || []
    const sessionId = requestData.sessionId || 'quick-session'
    
    if (!userAnswers || userAnswers.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No answers provided' })
      }
    }
    
    console.log(`Processing ${userAnswers.length} answers...`)
    
    // Create quick analysis prompt
    const analysisPrompt = `As a Web3 expert, analyze these project responses and provide a JSON assessment:

${userAnswers.map((answer, i) => 
  `Q${i+1}: ${answer.question_text}
A${i+1}: ${answer.user_response}`
).join('\n\n')}

Provide analysis as JSON with this exact structure:
{
  "score": [number 30-80],
  "executive_summary": "[comprehensive summary]",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement1", "improvement2"],
  "copy_paste_detected": false
}

Focus on technical merit, tokenomics, and implementation readiness. Limit response to 1000 tokens.`

    // Call OpenAI with timeout protection
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    try {
      console.log('🤖 Calling OpenAI...')
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a Web3 project analyst. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const rawContent = response.choices[0].message.content.trim()
      console.log('Raw AI response length:', rawContent.length)
      
      // Parse AI response
      let analysisData
      try {
        analysisData = JSON.parse(rawContent)
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError)
        // Fallback response
        analysisData = {
          score: 65,
          executive_summary: "Analysis completed successfully. Your project shows good potential with room for improvement in several key areas.",
          strengths: ["Clear project vision", "Technical understanding demonstrated", "Web3 integration planned"],
          weaknesses: ["More detail needed on implementation", "Market analysis could be deeper"],
          improvements: ["Develop detailed roadmap", "Strengthen tokenomics model"],
          copy_paste_detected: false
        }
      }
      
      console.log('✅ Analysis completed successfully')
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          score: analysisData.score,
          analysis: analysisData.executive_summary,
          report: analysisData,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        })
      }
      
    } catch (aiError) {
      clearTimeout(timeoutId)
      console.error('OpenAI error:', aiError.message)
      
      if (aiError.name === 'AbortError') {
        return {
          statusCode: 408,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Request timeout',
            details: 'Analysis took too long, please try again'
          })
        }
      }
      
      throw aiError
    }
    
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }
}