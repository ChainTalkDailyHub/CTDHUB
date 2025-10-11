const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
// Use environment variables for security
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    console.log('🔍 Fetching analysis report...')
    
    // Get sessionId from query parameters
    const sessionId = event.queryStringParameters?.sessionId
    
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' })
      }
    }

    console.log('📊 Looking for session:', sessionId)

    // First, let's check what's in the database
    const { data: allReports, error: allError } = await supabase
      .from('user_analysis_reports')
      .select('session_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('🗄️ Recent reports in database:', allReports?.map(r => ({ session_id: r.session_id, created_at: r.created_at })))

    // Query Supabase for the report
    const { data, error } = await supabase
      .from('user_analysis_reports')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)

    console.log('🔍 Query result:', { dataCount: data?.length, error: error?.message })

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database error', details: error.message })
      }
    }

    if (!data || data.length === 0) {
      console.log('❌ No report found for session:', sessionId)
      console.log('🗄️ Recent reports found:', allReports?.length || 0)
      
      // Return actual 404 instead of mock data
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Report not found',
          sessionId: sessionId,
          recentReportsCount: allReports?.length || 0,
          recentSessions: allReports?.map(r => r.session_id).slice(0, 5) || []
        })
      }
    }

    const reportData = data[0]
    console.log('✅ Report found:', reportData.session_id, reportData.created_at)

    // Return the report in the format expected by frontend
    const response = {
      reportId: reportData.report_data?.reportId || `report_${Date.now()}`,
      userAddress: reportData.user_address || 'anonymous',
      sessionId: reportData.session_id,
      timestamp: reportData.created_at,
      overallScore: reportData.score || 0,
      analysis: reportData.report_data?.analysis || {
        executive_summary: 'Analysis not available',
        strengths: [],
        improvement_areas: [],
        recommendations: [],
        action_plan: [],
        risk_assessment: 'Not assessed',
        next_steps: []
      },
      metadata: reportData.report_data?.metadata || {
        totalQuestions: 0,
        completionTime: 'Unknown',
        analysisVersion: 'Unknown'
      },
      // Add the report_data field that frontend checks for
      report_data: reportData.report_data || null
    }

    console.log('📤 Returning report data:', {
      sessionId: response.sessionId,
      hasReportData: !!response.report_data,
      hasAnalysis: !!response.analysis,
      score: response.overallScore
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    }

  } catch (error) {
    console.error('❌ Error fetching report:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch report',
        details: error.message
      })
    }
  }
}
