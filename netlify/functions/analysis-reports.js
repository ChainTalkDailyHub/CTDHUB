const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

    // Query Supabase for the report
    const { data, error } = await supabase
      .from('user_analysis_reports')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)

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
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Report not found' })
      }
    }

    const reportData = data[0]
    console.log('✅ Report found:', reportData.reportId || 'unknown')

    // Return the report in the expected format
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reportId: reportData.report_data?.reportId || `report_${Date.now()}`,
        userAddress: reportData.user_address || 'anonymous',
        sessionId: reportData.session_id,
        timestamp: reportData.created_at,
        overallScore: reportData.score || 0,
        analysis: reportData.report_data?.analysis || {
          executive_summary: 'Analysis completed successfully',
          strengths: ['Assessment completed'],
          improvement_areas: ['Continue learning'],
          recommendations: ['Keep building'],
          action_plan: ['Next steps'],
          risk_assessment: 'Low risk profile',
          next_steps: ['Continue development']
        },
        metadata: reportData.report_data?.metadata || {
          totalQuestions: 15,
          completionTime: 'Assessment completed',
          analysisVersion: 'Binno AI v2.0'
        }
      })
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
