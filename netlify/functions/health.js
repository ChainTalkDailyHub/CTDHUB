const { createClient } = require('@supabase/supabase-js')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      node: process.version,
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
        },
        supabase: {
          url_configured: !!process.env.SUPABASE_URL,
          service_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          anon_key_configured: !!process.env.SUPABASE_ANON_KEY
        },
        netlify: {
          functions: true,
          deploy_id: process.env.DEPLOY_ID || 'unknown',
          site_url: process.env.SITE_URL || 'not-set'
        }
      },
      functions: {
        'binno-final-analysis': 'available',
        'health': 'available'
      },
      version: '1.0.0',
      ok: true
    }

    // Test Supabase connection if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        
        // Simple query to test connection
        const { data, error } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1)
        
        healthStatus.checks.supabase.connection = !error
        if (error) healthStatus.checks.supabase.error = error.message
      } catch (supabaseError) {
        healthStatus.checks.supabase.connection = false
        healthStatus.checks.supabase.error = supabaseError.message
      }
    }

    // Overall health status
    const hasRequiredEnv = (
      healthStatus.checks.openai.configured &&
      healthStatus.checks.supabase.url_configured &&
      healthStatus.checks.supabase.service_key_configured
    )

    if (!hasRequiredEnv) {
      healthStatus.status = 'degraded'
      healthStatus.warning = 'Missing required environment variables'
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503

    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify(healthStatus, null, 2)
    }

  } catch (error) {
    console.error('Health check error:', error)
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message,
        ok: false
      })
    }
  }
}