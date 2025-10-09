exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ok: true,
      timestamp: new Date().toISOString(),
      node: process.version,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasSupabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NETLIFY: !!process.env.NETLIFY,
        SITE_URL: process.env.SITE_URL || 'not-set'
      },
      functions: {
        'binno-final-analysis': 'available',
        'analysis-reports': 'available'
      }
    })
  }
}