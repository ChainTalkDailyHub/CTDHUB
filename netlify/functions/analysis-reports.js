const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { sessionId } = event.queryStringParameters || {};
    
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'sessionId parameter is required' })
      };
    }

    console.log('Fetching report for session:', sessionId);

    // Query the user_analysis_reports table
    const { data, error } = await supabase
      .from('user_analysis_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      
      if (error.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Report not found',
            message: `No report found for session ID: ${sessionId}`
          })
        };
      }
      
      throw error;
    }

    if (!data) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Report not found',
          message: `No report found for session ID: ${sessionId}`
        })
      };
    }

    console.log('Report found, returning data');

    // Parse the analysis_report if it's a string
    let reportData = data.analysis_report;
    if (typeof reportData === 'string') {
      try {
        reportData = JSON.parse(reportData);
      } catch (parseError) {
        console.error('Error parsing analysis report:', parseError);
        // If parsing fails, wrap the string in a basic structure
        reportData = {
          analysis: {
            executive_summary: reportData,
            strengths: [],
            improvement_areas: [],
            recommendations: [],
            action_plan: [],
            risk_assessment: '',
            next_steps: []
          },
          overallScore: 0,
          metadata: {
            totalQuestions: 0,
            completionTime: '0 minutes',
            analysisVersion: '1.0'
          }
        };
      }
    }

    // Return the report in the expected format
    const response = {
      report_data: {
        reportId: data.id,
        userAddress: data.user_id,
        sessionId: data.session_id,
        timestamp: data.created_at,
        overallScore: reportData.overallScore || 0,
        analysis: reportData.analysis || {
          executive_summary: 'Analysis not available',
          strengths: [],
          improvement_areas: [],
          recommendations: [],
          action_plan: [],
          risk_assessment: '',
          next_steps: []
        },
        metadata: reportData.metadata || {
          totalQuestions: data.user_answers?.length || 0,
          completionTime: '0 minutes',
          analysisVersion: '1.0'
        }
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error fetching report:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: 'Failed to fetch analysis report'
      })
    };
  }
};